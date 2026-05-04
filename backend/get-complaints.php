<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// Підключення до БД
$pdo = new PDO("mysql:host=localhost;dbname=chatbot_system;charset=utf8mb4", "root", "");

try {
    // ВАЖЛИВО: Переконайся, що запит бере всі поля (*)
    $stmt = $pdo->query("SELECT * FROM complaints ORDER BY created_at DESC");
    $complaints = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode(["success" => true, "data" => $complaints]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>