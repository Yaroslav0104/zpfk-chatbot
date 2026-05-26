<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once 'db_config.php'; 

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->id) && !empty($data->priority)) {
    $id = intval($data->id);
    $priority = $conn->real_escape_string($data->priority);

    $query = "UPDATE complaints SET priority = '$priority' WHERE id = $id";

    if ($conn->query($query) === TRUE) {
        echo json_encode(["success" => true, "message" => "Пріоритет оновлено"]);
    } else {
        echo json_encode(["success" => false, "message" => "Помилка бази даних: " . $conn->error]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Неповні дані"]);
}
?>