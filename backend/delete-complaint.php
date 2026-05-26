<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

header("Content-Type: application/json; charset=UTF-8");
require_once 'db.php';

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->id)) {
    try {
        $stmt = $pdo->prepare("DELETE FROM complaints WHERE id = ?");
        $stmt->execute([$data->id]);
        
        echo json_encode(["success" => true]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Помилка бази даних"]);
    }
} else {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "ID не передано"]);
}
?>