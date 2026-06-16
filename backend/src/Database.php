<?php

declare(strict_types=1);

namespace StokKitani;

use PDO;
use PDOException;

final class Database
{
    private PDO $pdo;

    public function __construct()
    {
        $dsn = getenv('DATABASE_URL') ?: '';
        $username = getenv('DATABASE_USER') ?: '';
        $password = getenv('DATABASE_PASSWORD') ?: '';

        if ($dsn === '') {
            throw new HttpException(500, 'DATABASE_URL is not configured');
        }

        try {
            $this->pdo = new PDO($dsn, $username, $password, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]);
        } catch (PDOException $exception) {
            throw new HttpException(500, 'Database connection failed: ' . $exception->getMessage());
        }
    }

    public function findUserByEmail(string $email): ?array
    {
        $statement = $this->pdo->prepare('SELECT * FROM users WHERE lower(email) = lower(:email) LIMIT 1');
        $statement->execute(['email' => $email]);
        $user = $statement->fetch();

        return $user === false ? null : $user;
    }

    public function createSession(int $userId, string $token): void
    {
        $statement = $this->pdo->prepare(
            "INSERT INTO sessions (user_id, token, expires_at) VALUES (:user_id, :token, NOW() + INTERVAL '7 days')"
        );
        $statement->execute([
            'user_id' => $userId,
            'token' => $token,
        ]);
    }

    public function deleteSession(string $token): void
    {
        $statement = $this->pdo->prepare('DELETE FROM sessions WHERE token = :token');
        $statement->execute(['token' => $token]);
    }

    public function findSession(string $token): ?array
    {
        $statement = $this->pdo->prepare(
            'SELECT u.* FROM sessions s
             INNER JOIN users u ON u.id = s.user_id
             WHERE s.token = :token AND s.expires_at > NOW()
             LIMIT 1'
        );
        $statement->execute(['token' => $token]);
        $session = $statement->fetch();

        return $session === false ? null : $session;
    }

    public function listItems(array $filters): array
    {
        $clauses = [];
        $params = [];

        $search = trim((string) ($filters['search'] ?? ''));
        if ($search !== '') {
            $clauses[] = '(name ILIKE :search OR sku ILIKE :search OR description ILIKE :search OR location ILIKE :search OR category ILIKE :search)';
            $params['search'] = '%' . $search . '%';
        }

        $category = trim((string) ($filters['category'] ?? ''));
        if ($category !== '' && strtolower($category) !== 'all') {
            $clauses[] = 'LOWER(category) = LOWER(:category)';
            $params['category'] = $category;
        }

        $status = trim((string) ($filters['status'] ?? ''));
        if ($status !== '' && strtolower($status) !== 'all') {
            if ($status === 'out_of_stock') {
                $clauses[] = 'quantity = 0';
            } elseif ($status === 'low_stock') {
                $clauses[] = 'quantity > 0 AND quantity <= minimum_stock';
            } elseif ($status === 'in_stock') {
                $clauses[] = 'quantity > minimum_stock';
            }
        }

        $allowedSorts = [
            'name' => 'name ASC',
            'quantity' => 'quantity ASC',
            'price' => 'price ASC',
            'sku' => 'sku ASC',
        ];
        $sort = trim((string) ($filters['sort'] ?? ''));
        $orderBy = $allowedSorts[$sort] ?? 'id DESC';

        $sql = 'SELECT * FROM items';
        if ($clauses !== []) {
            $sql .= ' WHERE ' . implode(' AND ', $clauses);
        }
        $sql .= ' ORDER BY ' . $orderBy;

        $statement = $this->pdo->prepare($sql);
        $statement->execute($params);

        return $statement->fetchAll();
    }

    public function findItemById(int $id): ?array
    {
        $statement = $this->pdo->prepare('SELECT * FROM items WHERE id = :id LIMIT 1');
        $statement->execute(['id' => $id]);
        $item = $statement->fetch();

        return $item === false ? null : $item;
    }

    public function skuExists(string $sku, ?int $excludeId = null): bool
    {
        $sql = 'SELECT id FROM items WHERE UPPER(sku) = UPPER(:sku)';
        $params = ['sku' => $sku];

        if ($excludeId !== null) {
            $sql .= ' AND id <> :exclude_id';
            $params['exclude_id'] = $excludeId;
        }

        $sql .= ' LIMIT 1';
        $statement = $this->pdo->prepare($sql);
        $statement->execute($params);

        return $statement->fetch() !== false;
    }

    public function createItem(array $data): array
    {
        $statement = $this->pdo->prepare(
            'INSERT INTO items
                (name, description, sku, category, quantity, minimum_stock, price, cost_price, location, created_at, updated_at)
             VALUES
                (:name, :description, :sku, :category, :quantity, :minimum_stock, :price, :cost_price, :location, NOW(), NOW())
             RETURNING *'
        );
        $statement->execute($data);

        return $statement->fetch();
    }

    public function updateItem(int $id, array $data): array
    {
        $statement = $this->pdo->prepare(
            'UPDATE items SET
                name = :name,
                description = :description,
                sku = :sku,
                category = :category,
                minimum_stock = :minimum_stock,
                price = :price,
                cost_price = :cost_price,
                location = :location,
                updated_at = NOW()
             WHERE id = :id
             RETURNING *'
        );
        $statement->execute([
            'id' => $id,
            'name' => $data['name'],
            'description' => $data['description'],
            'sku' => $data['sku'],
            'category' => $data['category'],
            'minimum_stock' => $data['minimum_stock'],
            'price' => $data['price'],
            'cost_price' => $data['cost_price'],
            'location' => $data['location'],
        ]);

        return $statement->fetch();
    }

    public function deleteItem(int $id): void
    {
        $statement = $this->pdo->prepare('DELETE FROM items WHERE id = :id');
        $statement->execute(['id' => $id]);
    }

    public function bulkDeleteItems(array $ids): void
    {
        $placeholders = implode(', ', array_fill(0, count($ids), '?'));
        $statement = $this->pdo->prepare("DELETE FROM items WHERE id IN ($placeholders)");
        $statement->execute($ids);
    }

    public function adjustStock(int $id, int $delta): array
    {
        $statement = $this->pdo->prepare(
            'UPDATE items
             SET quantity = quantity + :delta, updated_at = NOW()
             WHERE id = :id
             RETURNING *'
        );
        $statement->execute([
            'delta' => $delta,
            'id' => $id,
        ]);
        $item = $statement->fetch();

        if ($item === false) {
            throw new HttpException(404, 'Item not found');
        }

        return $item;
    }

    public function createMovement(array $data): array
    {
        $statement = $this->pdo->prepare(
            'INSERT INTO stock_movements (item_id, type, quantity, remarks, created_at, created_by)
             VALUES (:item_id, :type, :quantity, :remarks, NOW(), :created_by)
             RETURNING *'
        );
        $statement->bindValue(':item_id', $data['item_id'], PDO::PARAM_INT);
        $statement->bindValue(':type', $data['type']);
        $statement->bindValue(':quantity', $data['quantity'], PDO::PARAM_INT);
        $statement->bindValue(':remarks', $data['remarks']);
        if ($data['created_by'] === null) {
            $statement->bindValue(':created_by', null, PDO::PARAM_NULL);
        } else {
            $statement->bindValue(':created_by', $data['created_by'], PDO::PARAM_INT);
        }
        $statement->execute();
        $movement = $statement->fetch();

        if ($movement === false) {
            throw new HttpException(500, 'Failed to create stock movement');
        }

        $item = $this->findItemById((int) $movement['item_id']);
        $movement['item_name'] = $item['name'] ?? 'Deleted Item';
        $movement['item_sku'] = $item['sku'] ?? 'N/A';

        return $movement;
    }

    public function recentMovements(int $limit): array
    {
        $statement = $this->pdo->prepare(
            'SELECT sm.*, i.name AS item_name, i.sku AS item_sku
             FROM stock_movements sm
             LEFT JOIN items i ON i.id = sm.item_id
             ORDER BY sm.created_at DESC, sm.id DESC
             LIMIT :limit'
        );
        $statement->bindValue(':limit', $limit, PDO::PARAM_INT);
        $statement->execute();

        return $statement->fetchAll();
    }

    public function listMovements(): array
    {
        $statement = $this->pdo->query(
            'SELECT sm.*, i.name AS item_name, i.sku AS item_sku
             FROM stock_movements sm
             LEFT JOIN items i ON i.id = sm.item_id
             ORDER BY sm.created_at DESC, sm.id DESC'
        );

        return $statement->fetchAll();
    }
}
