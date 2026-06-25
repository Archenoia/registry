<?php
/**
 * EmailHelper - 邮件发送帮助类
 *
 * 基于 SMTP 协议发送邮件（注意：POP3 是接收邮件协议，无法用于发送，
 * 发送邮件必须使用 SMTP 协议）。
 *
 * 功能：
 *   - 通过 SMTP 协议发送 HTML 邮件（原生 socket 实现，无外部依赖）
 *   - 支持 SSL/TLS 加密连接
 *   - 支持 SMTP 认证（AUTH LOGIN）
 *   - 从文件读取 HTML 模板并替换占位符
 *   - 自动生成邮件验证链接
 *
 * 使用方法请参见 example.php
 *
 * @package    EmailHelper
 * @author     数据之源，洞见之始
 * @link       http://生物制造.中国
 */

class EmailHelper
{
    /** @var string SMTP 服务器地址 */
    private $smtpHost;

    /** @var int SMTP 服务器端口 */
    private $smtpPort;

    /** @var string SMTP 用户名（通常为发件邮箱地址） */
    private $smtpUsername;

    /** @var string SMTP 密码（或授权码） */
    private $smtpPassword;

    /** @var string 加密方式：'ssl'、'tls' 或 ''（不加密） */
    private $smtpSecure;

    /** @var int SMTP 连接超时时间（秒） */
    private $timeout;

    /** @var string 发件人邮箱地址 */
    private $fromEmail;

    /** @var string 发件人名称 */
    private $fromName;

    /** @var string 网站名称 */
    private $siteName;

    /** @var string 网站 URL */
    private $siteUrl;

    /** @var string 邮件验证令牌的加密密钥（用于生成验证链接） */
    private $secretKey;

    /** @var resource|null SMTP socket 连接 */
    private $socket = null;

    /** @var string 错误信息 */
    private $errorMessage = '';

    /** @var bool 是否开启调试模式 */
    private $debug = false;

    /**
     * 构造函数 - 初始化 SMTP 配置
     *
     * @param array $config 配置数组，支持以下键：
     *   - smtp_host     : string  SMTP 服务器地址（必填）
     *   - smtp_port     : int     SMTP 服务器端口（默认 465）
     *   - smtp_username : string  SMTP 用户名（必填）
     *   - smtp_password : string  SMTP 密码或授权码（必填）
     *   - smtp_secure   : string  加密方式：'ssl'、'tls'、''（默认 'ssl'）
     *   - timeout       : int     连接超时秒数（默认 30）
     *   - from_email    : string  发件人邮箱（默认使用 smtp_username）
     *   - from_name     : string  发件人名称（默认使用 site_name）
     *   - site_name     : string  网站名称（默认 '数据之源，洞见之始'）
     *   - site_url      : string  网站 URL（默认 'http://生物制造.中国'）
     *   - secret_key    : string  加密密钥（用于生成验证令牌）
     *   - debug         : bool    是否开启调试模式（默认 false）
     */
    public function __construct(array $config)
    {
        $this->smtpHost     = isset($config['smtp_host']) ? $config['smtp_host'] : '';
        $this->smtpPort     = isset($config['smtp_port']) ? (int)$config['smtp_port'] : 465;
        $this->smtpUsername = isset($config['smtp_username']) ? $config['smtp_username'] : '';
        $this->smtpPassword = isset($config['smtp_password']) ? $config['smtp_password'] : '';
        $this->smtpSecure   = isset($config['smtp_secure']) ? $config['smtp_secure'] : 'ssl';
        $this->timeout      = isset($config['timeout']) ? (int)$config['timeout'] : 30;
        $this->fromEmail    = isset($config['from_email']) ? $config['from_email'] : $this->smtpUsername;
        $this->fromName     = isset($config['from_name']) ? $config['from_name'] : '数据之源，洞见之始';
        $this->siteName     = isset($config['site_name']) ? $config['site_name'] : '数据之源，洞见之始';
        $this->siteUrl      = isset($config['site_url']) ? $config['site_url'] : 'http://生物制造.中国';
        $this->secretKey    = isset($config['secret_key']) ? $config['secret_key'] : 'default_secret_key_change_me';
        $this->debug        = isset($config['debug']) ? (bool)$config['debug'] : false;
    }

    /**
     * 发送验证邮件
     *
     * 这是主要的对外接口函数。根据传入的参数读取 HTML 模板，
     * 替换占位符后通过 SMTP 协议发送邮件。
     *
     * @param string $username     用户名（新注册用户的用户名）
     * @param string $userEmail    用户邮箱（收件人邮箱地址）
     * @param string $title        邮件标题
     * @param string $body         邮件正文内容（纯文本，将填入模板的正文区域）
     * @param string $templatePath HTML 模板文件路径
     * @param string $verifyUrl    验证链接（可选，为空时自动生成）
     * @return bool 发送成功返回 true，失败返回 false（错误信息可通过 getError() 获取）
     */
    public function sendVerificationEmail($username, $userEmail, $title, $body, $templatePath, $verifyUrl = '')
    {
        // 参数校验
        if (empty($userEmail) || !filter_var($userEmail, FILTER_VALIDATE_EMAIL)) {
            $this->errorMessage = '收件人邮箱地址无效：' . $userEmail;
            return false;
        }

        if (empty($username)) {
            $this->errorMessage = '用户名不能为空';
            return false;
        }

        if (empty($title)) {
            $this->errorMessage = '邮件标题不能为空';
            return false;
        }

        if (empty($body)) {
            $this->errorMessage = '邮件正文不能为空';
            return false;
        }

        if (!file_exists($templatePath)) {
            $this->errorMessage = 'HTML 模板文件不存在：' . $templatePath;
            return false;
        }

        // 如果未提供验证链接，则自动生成
        if (empty($verifyUrl)) {
            $verifyUrl = $this->generateVerifyUrl($userEmail);
        }

        // 准备占位符替换映射
        $replacements = array(
            '{{USERNAME}}'    => $this->escapeHtml($username),
            '{{USER_EMAIL}}'  => $this->escapeHtml($userEmail),
            '{{TITLE}}'       => $this->escapeHtml($title),
            '{{CONTENT}}'     => $this->escapeHtml($body),
            '{{VERIFY_URL}}'  => $this->escapeHtml($verifyUrl),
            '{{SITE_NAME}}'   => $this->escapeHtml($this->siteName),
            '{{SITE_URL}}'    => $this->escapeHtml($this->siteUrl),
            '{{YEAR}}'        => date('Y'),
        );

        // 读取并处理 HTML 模板
        $htmlContent = $this->processTemplate($templatePath, $replacements);
        if ($htmlContent === false) {
            return false;
        }

        // 构建邮件主题（添加网站名称前缀）
        $subject = '【' . $this->siteName . '】' . $title;

        // 通过 SMTP 发送邮件
        return $this->smtpSend($userEmail, $subject, $htmlContent);
    }

    /**
     * 读取 HTML 模板文件并替换占位符
     *
     * @param string $templatePath  模板文件路径
     * @param array  $replacements  占位符映射数组（key => value）
     * @return string|false 处理后的 HTML 内容，失败返回 false
     */
    private function processTemplate($templatePath, array $replacements)
    {
        // 读取模板文件内容
        $templateContent = file_get_contents($templatePath);
        if ($templateContent === false) {
            $this->errorMessage = '无法读取模板文件：' . $templatePath;
            return false;
        }

        // 执行字符串替换
        foreach ($replacements as $placeholder => $value) {
            $templateContent = str_replace($placeholder, $value, $templateContent);
        }

        return $templateContent;
    }

    /**
     * 生成邮箱验证链接
     *
     * 基于用户邮箱和时间戳生成一个带签名的验证链接。
     * 验证链接格式：{site_url}/verify.php?email=xxx&token=xxx&ts=xxx
     *
     * @param string $userEmail 用户邮箱
     * @return string 验证链接
     */
    private function generateVerifyUrl($userEmail)
    {
        $timestamp = time();
        // 生成验证令牌：邮箱 + 时间戳 + 密钥 的 MD5 哈希
        $token = md5($userEmail . $timestamp . $this->secretKey);

        // 构建验证链接
        $verifyUrl = rtrim($this->siteUrl, '/') . '/verify.php'
                   . '?email=' . urlencode($userEmail)
                   . '&token=' . $token
                   . '&ts=' . $timestamp;

        return $verifyUrl;
    }

    /**
     * 通过 SMTP 协议发送邮件
     *
     * 使用原生 PHP socket 实现 SMTP 通信，支持 SSL/TLS 加密。
     *
     * @param string $to         收件人邮箱
     * @param string $subject    邮件主题
     * @param string $htmlBody   HTML 邮件正文
     * @return bool 发送成功返回 true，失败返回 false
     */
    private function smtpSend($to, $subject, $htmlBody)
    {
        // 检查 SMTP 配置
        if (empty($this->smtpHost) || empty($this->smtpUsername) || empty($this->smtpPassword)) {
            $this->errorMessage = 'SMTP 配置不完整，请检查 smtp_host、smtp_username、smtp_password';
            return false;
        }

        // 连接 SMTP 服务器
        if (!$this->smtpConnect()) {
            return false;
        }

        try {
            // 读取服务器欢迎信息
            $this->smtpReadResponse();

            // 发送 EHLO/HELO
            $this->smtpCommand('EHLO ' . $this->getLocalHostname(), 250);

            // 启动 TLS 加密（如果配置为 tls）
            if ($this->smtpSecure === 'tls') {
                $this->smtpCommand('STARTTLS', 220);
                // 启用 TLS 加密
                if (!stream_socket_enable_crypto(
                    $this->socket,
                    true,
                    STREAM_CRYPTO_METHOD_TLS_CLIENT
                )) {
                    throw new Exception('TLS 加密启用失败');
                }
                // TLS 启用后重新发送 EHLO
                $this->smtpCommand('EHLO ' . $this->getLocalHostname(), 250);
            }

            // SMTP 认证（AUTH LOGIN）
            $this->smtpCommand('AUTH LOGIN', 334);
            $this->smtpCommand(base64_encode($this->smtpUsername), 334);
            $this->smtpCommand(base64_encode($this->smtpPassword), 235);

            // 设置发件人
            $this->smtpCommand('MAIL FROM: <' . $this->fromEmail . '>', 250);

            // 设置收件人
            $this->smtpCommand('RCPT TO: <' . $to . '>', 250);

            // 开始发送邮件数据
            $this->smtpCommand('DATA', 354);

            // 构建邮件头和邮件体
            $mimeBoundary = '----=_NextPart_' . md5(time() . uniqid());

            // 邮件头
            $headers = array();
            $headers[] = 'Date: ' . date('r');
            $headers[] = 'From: ' . $this->encodeHeader($this->fromName) . ' <' . $this->fromEmail . '>';
            $headers[] = 'To: ' . $this->encodeHeader($to) . ' <' . $to . '>';
            $headers[] = 'Subject: ' . $this->encodeHeader($subject);
            $headers[] = 'Message-ID: <' . md5(uniqid(time())) . '@' . $this->getLocalHostname() . '>';
            $headers[] = 'MIME-Version: 1.0';
            $headers[] = 'Content-Type: multipart/alternative; boundary="' . $mimeBoundary . '"';
            $headers[] = 'Content-Transfer-Encoding: 8bit';

            // 邮件体（包含纯文本和 HTML 两个部分）
            $bodyParts = array();

            // 纯文本部分（为不支持 HTML 的客户端提供后备）
            $textBody = $this->htmlToText($htmlBody);
            $bodyParts[] = '--' . $mimeBoundary;
            $bodyParts[] = 'Content-Type: text/plain; charset=UTF-8';
            $bodyParts[] = 'Content-Transfer-Encoding: 8bit';
            $bodyParts[] = '';
            $bodyParts[] = $textBody;

            // HTML 部分
            $bodyParts[] = '--' . $mimeBoundary;
            $bodyParts[] = 'Content-Type: text/html; charset=UTF-8';
            $bodyParts[] = 'Content-Transfer-Encoding: 8bit';
            $bodyParts[] = '';
            $bodyParts[] = $htmlBody;

            // 结束边界
            $bodyParts[] = '--' . $mimeBoundary . '--';

            // 组合邮件头和邮件体
            $emailData = implode("\r\n", $headers) . "\r\n\r\n" . implode("\r\n", $bodyParts) . "\r\n";

            // 发送邮件数据
            $this->smtpCommand($emailData . '.', 250);

            // 退出 SMTP 会话
            $this->smtpCommand('QUIT', 221);

            return true;

        } catch (Exception $e) {
            $this->errorMessage = 'SMTP 发送失败：' . $e->getMessage();
            return false;
        } finally {
            $this->smtpClose();
        }
    }

    /**
     * 连接 SMTP 服务器
     *
     * @return bool 连接成功返回 true
     */
    private function smtpConnect()
    {
        $remote = '';

        // 根据加密方式构建连接地址
        if ($this->smtpSecure === 'ssl') {
            $remote = 'ssl://' . $this->smtpHost . ':' . $this->smtpPort;
        } else {
            $remote = $this->smtpHost . ':' . $this->smtpPort;
        }

        $this->logDebug('连接 SMTP 服务器：' . $remote);

        // 创建 socket 连接
        $context = stream_context_create(array(
            'ssl' => array(
                'verify_peer'       => false,
                'verify_peer_name'  => false,
                'allow_self_signed' => true,
            )
        ));

        $this->socket = stream_socket_client(
            $remote,
            $errno,
            $errstr,
            $this->timeout,
            STREAM_CLIENT_CONNECT,
            $context
        );

        if (!$this->socket) {
            $this->errorMessage = "SMTP 连接失败：[{$errno}] {$errstr}（{$remote}）";
            return false;
        }

        // 设置读写超时
        stream_set_timeout($this->socket, $this->timeout);

        $this->logDebug('SMTP 服务器连接成功');
        return true;
    }

    /**
     * 发送 SMTP 命令并检查响应码
     *
     * @param string $command      SMTP 命令内容
     * @param int    $expectedCode 期望的响应码
     * @return string 服务器响应
     * @throws Exception 当响应码不匹配时抛出异常
     */
    private function smtpCommand($command, $expectedCode)
    {
        $this->logDebug('>>> ' . $command);

        // 写入命令（DATA 命令后的邮件内容可能很长，需要特殊处理）
        fwrite($this->socket, $command . "\r\n");

        // 读取响应
        $response = $this->smtpReadResponse();
        $responseCode = (int)substr($response, 0, 3);

        $this->logDebug('<<< ' . trim($response));

        // 检查响应码
        if ($responseCode !== $expectedCode) {
            throw new Exception(
                "SMTP 命令失败：期望响应码 {$expectedCode}，实际响应码 {$responseCode}。" .
                "命令：{$command}，响应：{$response}"
            );
        }

        return $response;
    }

    /**
     * 读取 SMTP 服务器响应（支持多行响应）
     *
     * @return string 服务器响应
     */
    private function smtpReadResponse()
    {
        $response = '';
        $line = '';

        // SMTP 多行响应：第 4 位字符为 '-' 表示还有后续行，为 ' ' 表示响应结束
        while (is_resource($this->socket) && !feof($this->socket)) {
            $line = fgets($this->socket, 515);
            if ($line === false) {
                break;
            }
            $response .= $line;
            // 检查是否为响应的最后一行（第 4 位为空格）
            if (isset($line[3]) && $line[3] === ' ') {
                break;
            }
            // 如果行长度小于 4，也视为结束
            if (strlen(trim($line)) < 4) {
                break;
            }
        }

        return $response;
    }

    /**
     * 关闭 SMTP 连接
     */
    private function smtpClose()
    {
        if (is_resource($this->socket)) {
            fclose($this->socket);
            $this->socket = null;
        }
    }

    /**
     * 获取本地主机名（用于 EHLO/HELO 命令）
     *
     * @return string 本地主机名
     */
    private function getLocalHostname()
    {
        $hostname = gethostname();
        if ($hostname === false || filter_var($hostname, FILTER_VALIDATE_IP)) {
            $hostname = 'localhost';
        }
        return $hostname;
    }

    /**
     * 编码邮件头（支持中文等非 ASCII 字符）
     *
     * @param string $string 待编码的字符串
     * @return string 编码后的字符串
     */
    private function encodeHeader($string)
    {
        // 检查是否包含非 ASCII 字符
        if (preg_match('/[^\x20-\x7E]/', $string)) {
            return '=?UTF-8?B?' . base64_encode($string) . '?=';
        }
        return $string;
    }

    /**
     * HTML 转义（防止 XSS 注入）
     *
     * @param string $string 待转义的字符串
     * @return string 转义后的字符串
     */
    private function escapeHtml($string)
    {
        return htmlspecialchars($string, ENT_QUOTES, 'UTF-8');
    }

    /**
     * 将 HTML 内容转换为纯文本（用于邮件的 text/plain 部分）
     *
     * @param string $html HTML 内容
     * @return string 纯文本内容
     */
    private function htmlToText($html)
    {
        // 移除 style 和 script 标签及其内容
        $text = preg_replace('/<style[^>]*>.*?<\/style>/is', '', $html);
        $text = preg_replace('/<script[^>]*>.*?<\/script>/is', '', $text);

        // 将 <br> 和 <p> 标签转换为换行
        $text = preg_replace('/<br\s*\/?>/i', "\n", $text);
        $text = preg_replace('/<\/p>/i', "\n\n", $text);

        // 移除所有 HTML 标签
        $text = strip_tags($text);

        // 解码 HTML 实体
        $text = html_entity_decode($text, ENT_QUOTES, 'UTF-8');

        // 压缩多余空白
        $text = preg_replace('/[ \t]+/', ' ', $text);
        $text = preg_replace('/\n{3,}/', "\n\n", $text);

        return trim($text);
    }

    /**
     * 调试日志输出
     *
     * @param string $message 日志信息
     */
    private function logDebug($message)
    {
        if ($this->debug) {
            echo '[SMTP Debug] ' . $message . "\n";
        }
    }

    /**
     * 获取最近的错误信息
     *
     * @return string 错误信息
     */
    public function getError()
    {
        return $this->errorMessage;
    }

    /**
     * 设置网站名称
     *
     * @param string $siteName 网站名称
     */
    public function setSiteName($siteName)
    {
        $this->siteName = $siteName;
    }

    /**
     * 设置网站 URL
     *
     * @param string $siteUrl 网站 URL
     */
    public function setSiteUrl($siteUrl)
    {
        $this->siteUrl = $siteUrl;
    }

    /**
     * 设置发件人信息
     *
     * @param string $email 发件人邮箱
     * @param string $name  发件人名称
     */
    public function setFrom($email, $name = '')
    {
        $this->fromEmail = $email;
        if (!empty($name)) {
            $this->fromName = $name;
        }
    }
}
