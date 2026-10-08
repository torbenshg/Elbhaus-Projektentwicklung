<?php
declare(strict_types=1);

header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: same-origin');

$accept = $_SERVER['HTTP_ACCEPT'] ?? '';
$wantsJson = strpos($accept, 'application/json') !== false;

function respond(bool $ok, string $message, int $status, bool $json): void
{
    http_response_code($status);
    if ($json) {
        header('Content-Type: application/json; charset=UTF-8');
        echo json_encode(['ok' => $ok, 'message' => $message], JSON_UNESCAPED_UNICODE);
        exit;
    }

    header('Content-Type: text/html; charset=UTF-8');
    $title = $ok ? 'Anfrage gesendet' : 'Anfrage nicht gesendet';
    $safeMessage = htmlspecialchars($message, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    echo '<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'
        . $title
        . '</title><style>body{margin:0;font:17px/1.65 Arial,sans-serif;color:#25343e;background:#f5f5f2}.box{max-width:680px;margin:10vh auto;padding:48px;background:#fff;border-top:3px solid #12334b}h1{font-weight:400;color:#12334b}a{color:#12334b}</style></head><body><main class="box"><h1>'
        . $title
        . '</h1><p>'
        . $safeMessage
        . '</p><p><a href="index.html">Zurück zur Startseite</a></p></main></body></html>';
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    respond(false, 'Diese Adresse verarbeitet ausschließlich Formularanfragen.', 405, $wantsJson);
}

// Unauffälliges Feld für automatisierte Spam-Einträge.
if (trim((string)($_POST['website'] ?? '')) !== '') {
    respond(true, 'Vielen Dank. Ihre Anfrage wurde gesendet.', 200, $wantsJson);
}

$name = trim((string)($_POST['name'] ?? ''));
$email = trim((string)($_POST['email'] ?? ''));
$phone = trim((string)($_POST['telefon'] ?? ''));
$address = trim((string)($_POST['objektadresse'] ?? ''));
$message = trim((string)($_POST['nachricht'] ?? ''));
$consent = isset($_POST['datenschutz']);

if ($name === '' || strlen($name) > 320 || $address === '' || strlen($address) > 600) {
    respond(false, 'Bitte prüfen Sie Name und Objektadresse.', 422, $wantsJson);
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 254) {
    respond(false, 'Bitte geben Sie eine gültige E-Mail-Adresse ein.', 422, $wantsJson);
}
if ($phone === '' || strlen($phone) > 160 || strlen($message) > 8000 || !$consent) {
    respond(false, 'Bitte prüfen Sie Ihre Angaben und die Zustimmung zur Datenschutzerklärung.', 422, $wantsJson);
}

$cleanEmail = str_replace(["\r", "\n"], '', $email);
$cleanAddress = str_replace(["\r", "\n"], ' ', $address);
$subjectText = 'Neue Anfrage zur Potenzialprüfung – ' . $cleanAddress;
$subject = '=?UTF-8?B?' . base64_encode($subjectText) . '?=';
$body = implode("\n", [
    'Neue Anfrage über elbhaus-projekt.de',
    '',
    'Name: ' . $name,
    'E-Mail: ' . $cleanEmail,
    'Telefon: ' . ($phone !== '' ? $phone : 'nicht angegeben'),
    'Objektadresse: ' . $address,
    '',
    'Nachricht:',
    $message !== '' ? $message : 'keine zusätzliche Nachricht',
]);
$headers = implode("\r\n", [
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'From: Elbhaus Website <info@elbhaus-projekt.de>',
    'Reply-To: ' . $cleanEmail,
]);

if (!mail('info@elbhaus-projekt.de', $subject, $body, $headers)) {
    respond(false, 'Die Anfrage konnte gerade nicht versendet werden. Bitte schreiben Sie direkt an info@elbhaus-projekt.de.', 500, $wantsJson);
}

respond(true, 'Vielen Dank. Ihre Anfrage wurde gesendet. Wir melden uns persönlich bei Ihnen.', 200, $wantsJson);
