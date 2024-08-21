<?php
    /* 
    * Данная реализация написана в 2018 году по фриланс-заказу
    * Вся чувствительная информация заменена заглушкой [REPLACED]
    */

    function get_client_ip_server() {
        $ipaddress = '';
        if ($_SERVER['HTTP_CLIENT_IP'])
            $ipaddress = $_SERVER['HTTP_CLIENT_IP'];
        else if($_SERVER['HTTP_X_FORWARDED_FOR'])
            $ipaddress = $_SERVER['HTTP_X_FORWARDED_FOR'];
        else if($_SERVER['HTTP_X_FORWARDED'])
            $ipaddress = $_SERVER['HTTP_X_FORWARDED'];
        else if($_SERVER['HTTP_FORWARDED_FOR'])
            $ipaddress = $_SERVER['HTTP_FORWARDED_FOR'];
        else if($_SERVER['HTTP_FORWARDED'])
            $ipaddress = $_SERVER['HTTP_FORWARDED'];
        else if($_SERVER['REMOTE_ADDR'])
            $ipaddress = $_SERVER['REMOTE_ADDR'];
        else
            $ipaddress = 'UNKNOWN';
    
        return $ipaddress;
    }

    require_once('phpmailer/PHPMailerAutoload.php');
    $mail = new PHPMailer;
    $mail->CharSet = 'utf-8';

    $name = $_POST['customer_name'];
    $phone = $_POST['customer_phone_number'];
    $chosen_product = $_POST['chosenProduct'];
    $chosen_additional_product = $_POST['additional_services_chosen_transport'];

    // Enable verbose debug output
    //$mail->SMTPDebug = 3;                               

    // Set mailer to use SMTP
    $mail->isSMTP();                                      
    $mail->Host = 'smtp.mail.ru';  						   // Specify main and backup SMTP servers
    $mail->SMTPAuth = true;                               // Enable SMTP authentication
    $mail->Username = '[REPLACED]';                       // Ваш логин от почты с которой будут отправляться письма
    $mail->Password = '[REPLACED]';                       // Ваш пароль от почты с которой будут отправляться письма
    $mail->SMTPSecure = 'ssl';                            // Enable TLS encryption, `ssl` also accepted
    $mail->Port = 465;                                    // TCP port to connect to / этот порт может отличаться у других провайдеров

    $mail->setFrom('[REPLACED]');                         // от кого будет уходить письмо?
    $mail->addAddress('[REPLACED]');                      // Кому будет уходить письмо 
    $mail->addAddress('[REPLACED]');                      // Кому будет уходить письмо 
    $mail->addAddress('[REPLACED]');                      // Кому будет уходить письмо 
    $mail->addAddress('[REPLACED]');                      // Name is optional
    $mail->isHTML(true);                                  // Set email format to HTML

    $mail->Subject = 'Заявка с сайта';
    $mail_text = 'Имя клиента: ' . $name 
                . '<br> Номер телефона: ' . $phone 
                . '<br> Выбранная услуга: ' . $chosen_product;

    if(!empty($chosen_additional_product)){
        $mail_text .= '<br/> Дополнительные услуги: ' . rtrim($chosen_additional_product, ', ');
    }

    $mail_text .= '<br>IP адрес клиента: ' . get_client_ip_server() 
    . '<br><br><br> С Уважением, <br> Система доставки заявок';

    $mail->Body = $mail_text;
    $mail->AltBody = '';

    if(!$mail->send()) {
        //echo 'Unknown error';
    } else {
        header('location: thanks.html');
    }
?>