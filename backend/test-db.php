<?php
require_once 'db.php';

echo json_encode([
    'success' => true,
    'message' => 'Підключення до бази успішне'
], JSON_UNESCAPED_UNICODE);
?>