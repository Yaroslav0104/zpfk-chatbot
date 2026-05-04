<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'db.php'; // Використовуємо твій файл підключення

$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (!isset($data['id'])) {
    echo json_encode(["success" => false, "message" => "Не вказано ID скарги"]);
    exit;
}

try {
    $sql = "DELETE FROM complaints WHERE id = :id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':id' => $data['id']]);

    echo json_encode(["success" => true, "message" => "Скаргу успішно видалено"]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Помилка при видаленні: " . $e->getMessage()]);
}
?>