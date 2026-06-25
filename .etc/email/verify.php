<?php
/**
 * 邮箱验证处理页面
 *
 * 用户点击邮件中的验证链接后，会访问此页面进行账号激活。
 *
 * 验证链接格式：http://生物制造.中国/verify.php?email=xxx&token=xxx&ts=xxx
 *
 * 此文件为示例代码，您需要根据实际的数据库结构和业务逻辑进行调整
 */

// 引入配置文件
require_once __DIR__ . '/config.php';

/**
 * 处理邮箱验证
 *
 * @return array 处理结果
 */
function handleEmailVerification()
{
    // 获取参数
    $email = isset($_GET['email']) ? trim($_GET['email']) : '';
    $token = isset($_GET['token']) ? trim($_GET['token']) : '';
    $ts    = isset($_GET['ts']) ? trim($_GET['ts']) : '';

    // 参数校验
    if (empty($email) || empty($token) || empty($ts)) {
        return array('success' => false, 'message' => '验证链接参数不完整');
    }

    // 邮箱格式校验
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        return array('success' => false, 'message' => '邮箱地址格式无效');
    }

    // 获取配置
    $config = getEmailConfig();
    $secretKey = $config['secret_key'];

    // 验证令牌有效性
    $expectedToken = md5($email . $ts . $secretKey);
    if ($token !== $expectedToken) {
        return array('success' => false, 'message' => '验证令牌无效，请重新获取验证邮件');
    }

    // 验证链接有效期检查（24小时）
    $expireSeconds = 24 * 60 * 60;
    if (time() - (int)$ts > $expireSeconds) {
        return array('success' => false, 'message' => '验证链接已过期，请重新获取验证邮件');
    }

    // ====== 以下为数据库操作（需根据您的实际数据库结构编写） ======

    // 1. 连接数据库
    // $pdo = new PDO('mysql:host=localhost;dbname=your_db;charset=utf8mb4', 'username', 'password');

    // 2. 查找用户记录
    // $stmt = $pdo->prepare('SELECT id, status FROM users WHERE email = ? AND status = 0');
    // $stmt->execute([$email]);
    // $user = $stmt->fetch(PDO::FETCH_ASSOC);

    // 3. 检查用户是否存在
    // if (!$user) {
    //     return array('success' => false, 'message' => '用户不存在或账号已激活');
    // }

    // 4. 更新用户状态为已激活
    // $stmt = $pdo->prepare('UPDATE users SET status = 1, email_verified_at = NOW() WHERE id = ?');
    // $stmt->execute([$user['id']]);

    // ====== 数据库操作结束 ======

    // 激活成功
    return array(
        'success' => true,
        'message' => '恭喜！您的邮箱已验证成功，账号已激活。现在您可以登录并使用全部功能了。'
    );
}

// 处理验证请求
$result = handleEmailVerification();

// 输出结果页面（实际项目中可以使用模板引擎渲染）
?>
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>邮箱验证 - 数据之源，洞见之始</title>
<style>
    body { margin:0; padding:0; background-color:#f4f6f9; font-family:'Microsoft YaHei',sans-serif; }
    .container { max-width:500px; margin:80px auto; padding:40px; background:#fff; border-radius:12px; box-shadow:0 4px 24px rgba(0,0,0,0.08); text-align:center; }
    .icon { font-size:48px; margin-bottom:20px; }
    .title { font-size:22px; color:#1a5276; margin-bottom:16px; }
    .message { font-size:15px; color:#555; line-height:1.8; margin-bottom:24px; }
    .btn { display:inline-block; padding:12px 32px; background:#2980b9; color:#fff; text-decoration:none; border-radius:8px; font-size:15px; }
    .btn:hover { background:#1a5276; }
</style>
</head>
<body>
<div class="container">
    <div class="icon"><?php echo $result['success'] ? '✓' : '✗'; ?></div>
    <div class="title"><?php echo $result['success'] ? '验证成功' : '验证失败'; ?></div>
    <div class="message"><?php echo htmlspecialchars($result['message'], ENT_QUOTES, 'UTF-8'); ?></div>
    <?php if ($result['success']): ?>
    <a href="<?php echo htmlspecialchars(getEmailConfig()['site_url'], ENT_QUOTES, 'UTF-8'); ?>" class="btn">前往登录</a>
    <?php else: ?>
    <a href="<?php echo htmlspecialchars(getEmailConfig()['site_url'], ENT_QUOTES, 'UTF-8'); ?>" class="btn">返回首页</a>
    <?php endif; ?>
</div>
</body>
</html>
