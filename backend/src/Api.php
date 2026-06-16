<?php

declare(strict_types=1);

namespace StokKitani;

use Throwable;

final class Api
{
    private Database $database;

    public function __construct()
    {
        $this->database = new Database();
    }

    public function handle(string $method, string $uri): void
    {
        $path = parse_url($uri, PHP_URL_PATH) ?? '/';
        $path = rtrim($path, '/');
        $path = $path === '' ? '/' : $path;

        $this->sendCorsHeaders();
        if ($method === 'OPTIONS') {
            Response::noContent();
            return;
        }

        try {
            if ($method === 'POST' && $path === '/api/login') {
                $this->login();
                return;
            }

            if ($method === 'POST' && $path === '/api/logout') {
                $this->logout();
                return;
            }

            $user = $this->requireAuth();

            if ($method === 'GET' && $path === '/api/dashboard/summary') {
                $this->dashboardSummary();
                return;
            }

            if ($method === 'GET' && $path === '/api/items') {
                $this->listItems();
                return;
            }

            if ($method === 'POST' && $path === '/api/items') {
                $this->createItem($user);
                return;
            }

            if ($method === 'POST' && $path === '/api/items/bulk-delete') {
                $this->bulkDeleteItems();
                return;
            }

            if ($method === 'GET' && preg_match('#^/api/items/(\d+)$#', $path, $matches) === 1) {
                $this->getItem((int) $matches[1]);
                return;
            }

            if ($method === 'PUT' && preg_match('#^/api/items/(\d+)$#', $path, $matches) === 1) {
                $this->updateItem((int) $matches[1]);
                return;
            }

            if ($method === 'DELETE' && preg_match('#^/api/items/(\d+)$#', $path, $matches) === 1) {
                $this->deleteItem((int) $matches[1]);
                return;
            }

            if ($method === 'POST' && preg_match('#^/api/items/(\d+)/stock-in$#', $path, $matches) === 1) {
                $this->stockIn((int) $matches[1]);
                return;
            }

            if ($method === 'POST' && preg_match('#^/api/items/(\d+)/stock-out$#', $path, $matches) === 1) {
                $this->stockOut((int) $matches[1]);
                return;
            }

            if ($method === 'GET' && $path === '/api/stock-movements') {
                $this->stockMovements();
                return;
            }

            Response::json(['error' => 'Not found'], 404);
        } catch (HttpException $exception) {
            Response::json(['error' => $exception->getMessage()], $exception->getStatusCode());
        } catch (Throwable $exception) {
            Response::json([
                'error' => 'Internal server error',
                'details' => $this->isDebug() ? $exception->getMessage() : null,
            ], 500);
        }
    }

    private function login(): void
    {
        $payload = Request::json();
        $email = trim((string) ($payload['email'] ?? ''));
        $password = (string) ($payload['password'] ?? '');

        if ($email === '' || $password === '') {
            throw new HttpException(400, 'Email and password are required');
        }

        $user = $this->database->findUserByEmail($email);
        $storedHash = (string) ($user['password_hash'] ?? '');
        $passwordMatches = $user !== null && (
            str_starts_with($storedHash, '$2y$')
                ? password_verify($password, $storedHash)
                : hash_equals($storedHash, $password)
        );

        if ($user === null || !$passwordMatches) {
            throw new HttpException(401, 'Invalid email or password / Emel atau kata laluan tidak sah');
        }

        $token = bin2hex(random_bytes(24));
        $this->database->createSession((int) $user['id'], $token);

        Response::json([
            'token' => $token,
            'user' => [
                'id' => (int) $user['id'],
                'name' => $user['name'],
                'email' => $user['email'],
                'createdAt' => $user['created_at'],
            ],
        ]);
    }

    private function logout(): void
    {
        $token = Request::bearerToken();
        if ($token !== null) {
            $this->database->deleteSession($token);
        }

        Response::json(['success' => true, 'message' => 'Successfully logged out']);
    }

    private function dashboardSummary(): void
    {
        $items = $this->database->listItems([]);
        $movements = $this->database->recentMovements(6);

        $totalItems = count($items);
        $lowStockItems = 0;
        $outOfStockItems = 0;
        $totalValue = 0.0;

        foreach ($items as $item) {
            $quantity = (int) $item['quantity'];
            $minimumStock = (int) $item['minimum_stock'];
            $price = (float) $item['price'];

            $totalValue += $quantity * $price;
            if ($quantity === 0) {
                $outOfStockItems++;
            } elseif ($quantity <= $minimumStock) {
                $lowStockItems++;
            }
        }

        Response::json([
            'totalItems' => $totalItems,
            'lowStockItems' => $lowStockItems,
            'outOfStockItems' => $outOfStockItems,
            'totalValue' => round($totalValue, 2),
            'recentMovements' => array_map([$this, 'formatMovement'], $movements),
        ]);
    }

    private function listItems(): void
    {
        $items = $this->database->listItems($_GET);
        Response::json(array_map([$this, 'formatItem'], $items));
    }

    private function getItem(int $id): void
    {
        $item = $this->database->findItemById($id);
        if ($item === null) {
            throw new HttpException(404, 'Item not found');
        }

        Response::json($this->formatItem($item));
    }

    private function createItem(array $user): void
    {
        $payload = Request::json();
        $data = $this->validateItemPayload($payload);

        if ($this->database->skuExists($data['sku'])) {
            throw new HttpException(400, 'SKU code already exists in inventory / Kod SKU sudah wujud');
        }

        $item = $this->database->createItem($data);
        if ((int) $item['quantity'] > 0) {
            $this->database->createMovement([
                'item_id' => (int) $item['id'],
                'type' => 'stock_in',
                'quantity' => (int) $item['quantity'],
                'remarks' => 'Initial inventory setup.',
                'created_by' => (int) $user['id'],
            ]);
        }

        Response::json($this->formatItem($item), 201);
    }

    private function updateItem(int $id): void
    {
        $existingItem = $this->database->findItemById($id);
        if ($existingItem === null) {
            throw new HttpException(404, 'Item not found');
        }

        $payload = Request::json();
        $data = $this->validateItemPayload($payload, false);

        if ($this->database->skuExists($data['sku'], $id)) {
            throw new HttpException(400, 'SKU code already exists on another item / Kod SKU sudah wujud');
        }

        $item = $this->database->updateItem($id, $data);
        Response::json($this->formatItem($item));
    }

    private function deleteItem(int $id): void
    {
        if ($this->database->findItemById($id) === null) {
            throw new HttpException(404, 'Item not found');
        }

        $this->database->deleteItem($id);
        Response::json(['success' => true, 'message' => 'Item successfully deleted along with historical logs']);
    }

    private function bulkDeleteItems(): void
    {
        $payload = Request::json();
        $ids = $payload['ids'] ?? null;
        if (!is_array($ids) || $ids === []) {
            throw new HttpException(400, 'Invalid parameters: Provide non-empty ids array');
        }

        $numericIds = array_values(array_filter(array_map('intval', $ids), static fn (int $id): bool => $id > 0));
        if ($numericIds === []) {
            throw new HttpException(400, 'Invalid parameters: Provide non-empty ids array');
        }

        $this->database->bulkDeleteItems($numericIds);
        Response::json([
            'success' => true,
            'message' => sprintf('Successfully deleted %d items from inventory catalog.', count($numericIds)),
        ]);
    }

    private function stockIn(int $id): void
    {
        $payload = Request::json();
        $quantity = (int) ($payload['quantity'] ?? 0);
        $remarks = trim((string) ($payload['remarks'] ?? ''));

        if ($quantity <= 0) {
            throw new HttpException(400, 'Valid stock-in quantity (greater than 0) is required');
        }

        $item = $this->database->adjustStock($id, $quantity);
        $movement = $this->database->createMovement([
            'item_id' => $id,
            'type' => 'stock_in',
            'quantity' => $quantity,
            'remarks' => $remarks !== '' ? $remarks : 'Received cargo shipment.',
            'created_by' => null,
        ]);

        Response::json([
            'success' => true,
            'item' => $this->formatItem($item),
            'movement' => $this->formatMovement($movement),
        ]);
    }

    private function stockOut(int $id): void
    {
        $payload = Request::json();
        $quantity = (int) ($payload['quantity'] ?? 0);
        $remarks = trim((string) ($payload['remarks'] ?? ''));

        if ($quantity <= 0) {
            throw new HttpException(400, 'Valid stock-out quantity (greater than 0) is required');
        }

        $currentItem = $this->database->findItemById($id);
        if ($currentItem === null) {
            throw new HttpException(404, 'Item not found');
        }

        if ((int) $currentItem['quantity'] < $quantity) {
            throw new HttpException(400, 'Insufficient stock count / Baki stok tidak mencukupi');
        }

        $item = $this->database->adjustStock($id, -$quantity);
        $movement = $this->database->createMovement([
            'item_id' => $id,
            'type' => 'stock_out',
            'quantity' => $quantity,
            'remarks' => $remarks !== '' ? $remarks : 'Dispatched delivery / order.',
            'created_by' => null,
        ]);

        Response::json([
            'success' => true,
            'item' => $this->formatItem($item),
            'movement' => $this->formatMovement($movement),
        ]);
    }

    private function stockMovements(): void
    {
        $movements = $this->database->listMovements();
        Response::json(array_map([$this, 'formatMovement'], $movements));
    }

    private function requireAuth(): array
    {
        $token = Request::bearerToken();
        if ($token === null) {
            throw new HttpException(401, 'Access denied: Missing auth token');
        }

        $session = $this->database->findSession($token);
        if ($session === null) {
            throw new HttpException(403, 'Access denied: Invalid or expired token');
        }

        return $session;
    }

    private function validateItemPayload(array $payload, bool $creating = true): array
    {
        $name = trim((string) ($payload['name'] ?? ''));
        $sku = strtoupper(trim((string) ($payload['sku'] ?? '')));
        $category = trim((string) ($payload['category'] ?? ''));
        $quantity = $creating ? (int) ($payload['quantity'] ?? 0) : null;
        $minimumStock = isset($payload['minimumStock']) ? (int) $payload['minimumStock'] : null;
        $price = isset($payload['price']) ? (float) $payload['price'] : null;
        $costPrice = isset($payload['costPrice']) ? (float) $payload['costPrice'] : 0.0;

        if ($name === '' || $sku === '' || $category === '' || $minimumStock === null || $price === null || ($creating && $quantity === null)) {
            $message = $creating
                ? 'Missing required fields (name, sku, category, quantity, minimumStock, price)'
                : 'Missing required fields for update';
            throw new HttpException(400, $message);
        }

        if (($quantity !== null && $quantity < 0) || $minimumStock < 0 || $price < 0 || $costPrice < 0) {
            throw new HttpException(400, 'Quantities, stock limits, and prices cannot be negative values');
        }

        return [
            'name' => $name,
            'description' => trim((string) ($payload['description'] ?? '')),
            'sku' => $sku,
            'category' => $category,
            'quantity' => $quantity,
            'minimum_stock' => $minimumStock,
            'price' => $price,
            'cost_price' => $costPrice,
            'location' => trim((string) ($payload['location'] ?? '')) ?: 'Main Store',
        ];
    }

    private function formatItem(array $row): array
    {
        return [
            'id' => (int) $row['id'],
            'name' => $row['name'],
            'description' => $row['description'] ?? '',
            'sku' => $row['sku'],
            'category' => $row['category'],
            'quantity' => (int) $row['quantity'],
            'minimumStock' => (int) $row['minimum_stock'],
            'price' => (float) $row['price'],
            'costPrice' => (float) $row['cost_price'],
            'location' => $row['location'],
            'createdAt' => $row['created_at'],
            'updatedAt' => $row['updated_at'],
        ];
    }

    private function formatMovement(array $row): array
    {
        return [
            'id' => (int) $row['id'],
            'itemId' => (int) $row['item_id'],
            'itemName' => $row['item_name'] ?? 'Deleted Item',
            'itemSku' => $row['item_sku'] ?? 'N/A',
            'type' => $row['type'],
            'quantity' => (int) $row['quantity'],
            'remarks' => $row['remarks'] ?? '',
            'createdAt' => $row['created_at'],
        ];
    }

    private function sendCorsHeaders(): void
    {
        $allowedOrigin = getenv('FRONTEND_URL') ?: '*';
        header('Access-Control-Allow-Origin: ' . $allowedOrigin);
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    }

    private function isDebug(): bool
    {
        return (getenv('APP_ENV') ?: 'production') !== 'production';
    }
}
