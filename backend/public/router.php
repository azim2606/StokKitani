<?php

$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '/';
$targetPath = __DIR__ . $requestUri;

if ($requestUri !== '/' && file_exists($targetPath) && !is_dir($targetPath)) {
    return false;
}

require __DIR__ . '/index.php';
