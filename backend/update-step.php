<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

header("Content-Type: application/json; charset=UTF-8");
require_once 'db.php';

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->step_id) && isset($data->message)) {
    try {
        // Додаємо оновлення updated_at в обидві частини запиту
        $sql = "INSERT INTO bot_texts (id, message, updated_at) 
                VALUES (?, ?, NOW()) 
                ON DUPLICATE KEY UPDATE 
                message = ?, 
                updated_at = NOW()";
                
        $stmt = $pdo->prepare($sql);
        // Передаємо параметри: step_id, message (для insert), message (для update)
        $stmt->execute([$data->step_id, $data->message, $data->message]);
        
        echo json_encode(["success" => true]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Недостатньо даних"]);
}
?>