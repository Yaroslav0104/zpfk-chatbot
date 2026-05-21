<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

require 'config.php';

// Отримуємо IP-адресу користувача
$ip = $_SERVER['REMOTE_ADDR'];
if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
    $ip = $_SERVER['HTTP_CLIENT_IP'];
} elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
    $ip = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'])[0];
}

$date = date('Y-m-d');

try {
    // INSERT IGNORE означає, що якщо цей IP сьогодні вже заходив, помилки не буде, запис просто проігнорується
    $stmt = $pdo->prepare("INSERT IGNORE INTO visits (ip_address, visit_date) VALUES (?, ?)");
    $stmt->execute([$ip, $date]);

    echo json_encode(["success" => true]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "error" => "Помилка БД: " . $e->getMessage()]);
}
?>