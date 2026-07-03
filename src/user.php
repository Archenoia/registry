<?php

include __DIR__ . "/../.etc/bootstrap.php";

class App {

    /**
     * User Registration
     * 
     * @access *
     * @method post
     * @uses api
     */
    public function register($name, $email, $passwd, $affiliation = "-") {
        // 1. 参数基础校验
        if (empty($name) || empty($email) || empty($passwd)) {
            controller::error("Name, email, and password are required!");
            return;
        }

        // 2. 邮箱格式校验
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            controller::error("Invalid email format!");
            return;
        }

        // 3. 检查邮箱是否已被注册 (利用数据库 UNIQUE KEY)
        $existingUser = (new Table(["registry_engine" => "user"]))
            ->where(["email" => $email])
            ->find();

        if (!Utils::isDbNull($existingUser)) {
            controller::error("This email is already registered!");
            return;
        }

        // 4. 密码加密 (使用 PHP 内置的 password_hash，结果通常为 60+ 字符)
        $hashedPassword = password_hash($passwd, PASSWORD_DEFAULT);

        // 5. 写入数据库
        $data = [
            "name"        => $name,
            "email"       => $email,
            "password"    => $hashedPassword,
            "affiliation" => $affiliation,
            "banned"      => 0,
            "activated"   => 1 // 默认未激活
        ];

        $insertResult = (new Table(["registry_engine" => "user"]))->add($data);

        if ($insertResult) {
            // 假设 Table 类有获取最后插入 ID 的方法，或者通过查询获取
            // 这里假设 insertResult 返回了 ID，或者我们需要查询一次
            $newUser = (new Table(["registry_engine" => "user"]))
                ->where(["email" => $email])
                ->find();
            
            if ($newUser) {
                // 6. 发送激活邮件
                $this->sendActivationEmail($newUser);
            }
            
            controller::success("Registration successful! Please check your email to activate your account.");
        } else {
            controller::error("Registration failed due to a server error.");
        }
    }

    /**
     * User Login
     * 
     * @access *
     * @method post
     * @uses api
     * 
     * @rate 20/min,50/hour,200/day
     */
    public function login($email, $passwd) {
        // 1. 查找用户
        $user = (new Table(["registry_engine" => "user"]))
            ->where(["email" => $email])
            ->find();

        if (Utils::isDbNull($user)) {
            controller::error("User not found or password incorrect!");
            return;
        }

        // 2. 验证密码 (使用 password_verify)
        if (!password_verify($passwd, $user["password"])) {
            controller::error("User not found or password incorrect!");
            return;
        }

        // 3. 检查封禁状态
        if ($user["banned"] > 0) {
            controller::error("Your account has been banned!");
            return;
        }

        // 4. 检查激活状态
        if ($user["activated"] == 0) {
            controller::error("Your account is not activated yet. Please check your email.");
            return;
        }

        // 5. 登录成功 - 防止会话固定攻击
        session_regenerate_id(true);

        $_SESSION["user_id"] = $user["id"];
        $_SESSION["email"] = $user["email"];
        $_SESSION["name"] = $user["name"];

        controller::success(1);
    }

    /**
     * get current user info
     * 
     * @access *
     * @method get
    */
    public function info() {
        if (!isset($_SESSION["user_id"])) {
            controller::error("User not logged in!");
        } else {
            // 只返回必要信息，避免泄露敏感数据
            $userInfo = [
                "id"    => $_SESSION["user_id"],
                "name"  => $_SESSION["name"],
                "email" => $_SESSION["email"]
            ];

            controller::success($userInfo);
        }
    }

    /**
     * User Logout
     * 
     * @access *
     * @method get
     * @uses api
     */
    public function logout() {
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000,
                $params["path"], $params["domain"],
                $params["secure"], $params["httponly"]
            );
        }

        session_destroy();
        controller::success(1);
    }

    /**
     * Activate Account
     * 
     * @access *
     * @method get
     * @uses api
     * @param int $id User ID
     * @param string $token Activation Token
     */
    public function activate($id, $token) {
        // 1. 查找用户
        $user = (new Table(["registry_engine" => "user"]))
            ->where(["id" => $id])
            ->find();

        if (Utils::isDbNull($user)) {
            controller::error("Invalid activation link!");
            return;
        }

        // 2. 如果已经激活，无需重复操作
        if ($user["activated"] == 1) {
            controller::success("Your account is already activated. Please login.");
            return;
        }

        // 3. 验证激活码
        // 生成逻辑见 sendActivationEmail 方法
        $expectedToken = hash_hmac('sha256', $user['id'] . $user['email'] . $user['name'] . $user['affiliation'], $this->getSecretKey());

        if (!hash_equals($expectedToken, $token)) {
            controller::error("Invalid or expired activation token!");
            return;
        }

        // 4. 激活账户
        $updateResult = (new Table(["registry_engine" => "user"]))
            ->where(["id" => $id])
            ->save(["activated" => 1])
            ;

        if ($updateResult) {
            controller::success("Account activated successfully! You can now login.");
        } else {
            controller::error("Activation failed. Please try again.");
        }
    }

    /**
     * Resend Activation Email (Optional helper)
     */
    public function resendActivation($email) {
        $user = (new Table(["registry_engine" => "user"]))
            ->where(["email" => $email])
            ->find();

        if (Utils::isDbNull($user)) {
            // 为了安全，不暴露用户是否存在，但在忘记激活场景下通常提示
            controller::error("User not found.");
            return;
        }

        if ($user["activated"] == 1) {
            controller::error("Account already activated.");
            return;
        }

        $this->sendActivationEmail($user);
        controller::success("Activation email has been resent.");
    }

    /**
     * Helper: Send Activation Email
     */
    private function sendActivationEmail($user) {
        // 生成激活 Token: 基于 id, name, email, affiliation
        $token = hash_hmac('sha256', $user['id'] . $user['email'] . $user['name'] . $user['affiliation'], $this->getSecretKey());
        
        // 构建激活链接 (假设网站域名为配置项)
        $baseUrl = DotNetRegistry::Read("base_url");
        $activationLink = $baseUrl . "/user/activate?id=" . $user['id'] . "&token=" . $token;

        // 邮件内容
        $subject = "BioDataHub - Activate Your Account";
        $message = "Dear " . htmlspecialchars($user['name']) . ",\n\n";
        $message .= "Please click the link below to activate your account:\n";
        $message .= $activationLink . "\n\n";
        $message .= "If you did not register, please ignore this email.";

        // 发送邮件 (使用 PHP mail 函数，生产环境建议使用 PHPMailer/SwiftMailer)
        $headers = "From: noreply@biodatahub.com\r\n" .
                   "Reply-To: noreply@biodatahub.com\r\n" .
                   "X-Mailer: PHP/" . phpversion();

        mail($user['email'], $subject, $message, $headers);
    }

    /**
     * Helper: Get Secret Key
     */
    private function getSecretKey() {
        // 复用之前的盐值配置，或者单独配置一个 JWT_SECRET
        return DotNetRegistry::Read("password_salt") ?? "default_secret_key_change_me";
    }
}
