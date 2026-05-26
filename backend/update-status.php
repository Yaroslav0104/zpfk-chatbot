<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['id']) || !isset($data['status'])) {
    echo json_encode(["success" => false, "message" => "Не передано ID або статус"]);
    exit;
}

require_once 'db.php';

try {
    $sql = "UPDATE complaints SET status = :status WHERE id = :id";
    $stmt = $pdo->prepare($sql);
    
    $stmt->execute([
        ':status' => $data['status'],
        ':id' => $data['id']
    ]);

    echo json_encode(["success" => true, "message" => "Статус успішно оновлено"]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Помилка бази даних: " . $e->getMessage()]);
}
?>