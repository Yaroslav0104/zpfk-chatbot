<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

header("Content-Type: application/json");

require_once 'db.php';

$secret_key = "ZPFK_Super_Secret_Key_2026_!@#"; 

function generate_jwt($payload, $secret) {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload = json_encode($payload);

    $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));

    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $secret, true);
    $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));

    return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
}

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->username) && !empty($data->password)) {
    $username = trim($data->username);
    $password = $data->password;

    $stmt = $pdo->prepare("SELECT * FROM system_users WHERE username = ?");
    $stmt->execute([$username]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password_hash'])) {
        $payload = [
            "user_id" => $user['id'],
            "username" => $user['username'],
            "role" => $user['role'],
            "exp" => time() + (60 * 60 * 24) 
        ];

        $jwt = generate_jwt($payload, $secret_key);

        echo json_encode([
            "success" => true,
            "token" => $jwt,            
            "role" => $user['role'],
            "username" => $user['username']
        ]);
    } else {
        echo json_encode(["success" => false, "error" => "Невірний логін або пароль"]);
    }
} else {
    echo json_encode(["success" => false, "error" => "Введіть логін та пароль"]);
}
?>