<?php
header("Access-Control-Allow-Origin: http://localhost:3000"); 
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

header("Content-Type: application/json; charset=UTF-8");
require_once 'db.php'; 

$data = json_decode(file_get_contents("php://input"));

if (isset($data->id) && isset($data->sentiment)) {
    try {

        $stmtUpdate = $pdo->prepare("UPDATE complaints SET sentiment = ? WHERE id = ?");
        $stmtUpdate->execute([$data->sentiment, $data->id]);
        
        if (!empty($data->text) && isset($data->correct_label)) {
            $stmtInsert = $pdo->prepare("INSERT INTO ai_corrections (text, correct_label) VALUES (?, ?)");
            $stmtInsert->execute([$data->text, $data->correct_label]);
        }
        
        echo json_encode(["success" => true]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Помилка запису в БД: " . $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Неповні дані: відсутній id або sentiment"]);
}
?>