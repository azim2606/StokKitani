<?php

declare(strict_types=1);

require __DIR__ . '/../src/bootstrap.php';

use StokKitani\Api;

$api = new Api();
$api->handle($_SERVER['REQUEST_METHOD'] ?? 'GET', $_SERVER['REQUEST_URI'] ?? '/');
