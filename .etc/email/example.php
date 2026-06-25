<?php
/**
 * EmailHelper 使用示例
 *
 * 演示如何在用户注册模块中调用 EmailHelper 发送验证邮件
 *
 * 使用前请先修改 config.php 中的 SMTP 配置信息
 */

// 引入配置文件和邮件帮助类
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/EmailHelper.php';

// ========================================
// 示例 1：在用户注册流程中发送验证邮件
// ========================================

/**
 * 用户注册处理函数（示例）
 *
 * @param string $username 用户名
 * @param string $email    用户邮箱
 * @param string $password 用户密码
 * @return array 注册结果
 */
function handleUserRegistration($username, $email, $password)
{
    // 1. 将用户信息写入数据库（此处省略数据库操作代码）
    // ...
    // 假设用户已成功写入数据库，用户 ID 为 123
    $userId = 123;

    // 2. 创建 EmailHelper 实例
    $emailHelper = new EmailHelper(getEmailConfig());

    // 3. 准备邮件参数
    $title       = '欢迎注册，请激活您的账号';
    $body        = '感谢您注册' . $emailHelper->siteName . '！请点击下方按钮激活您的账号，'
                 . '激活后即可使用全部功能。如有任何疑问，请随时联系我们的客服团队。';
    $templatePath = __DIR__ . '/templates/verification_email.html';

    // 4. 发送验证邮件
    //    注意：verifyUrl 参数可选，为空时会自动生成
    //    如果您有自己的验证链接生成逻辑，可以传入自定义的 verifyUrl
    $result = $emailHelper->sendVerificationEmail(
        $username,    // 用户名
        $email,       // 用户邮箱
        $title,       // 邮件标题
        $body,        // 邮件正文
        $templatePath // HTML 模板路径
        // $verifyUrl  // 可选：自定义验证链接，不传则自动生成
    );

    // 5. 处理发送结果
    if ($result) {
        return array(
            'success' => true,
            'message' => '注册成功！验证邮件已发送至 ' . $email . '，请查收邮件并激活账号。'
        );
    } else {
        return array(
            'success' => false,
            'message' => '验证邮件发送失败：' . $emailHelper->getError()
        );
    }
}


// ========================================
// 示例 2：传入自定义验证链接
// ========================================

/**
 * 使用自定义验证链接发送邮件（示例）
 *
 * 如果您的系统已有自己的令牌生成机制，可以传入自定义的验证链接
 *
 * @param string $username 用户名
 * @param string $email    用户邮箱
 * @param string $token    您系统生成的验证令牌
 * @return bool 发送结果
 */
function sendEmailWithCustomToken($username, $email, $token)
{
    $emailHelper = new EmailHelper(getEmailConfig());

    // 构建自定义验证链接
    $customVerifyUrl = 'http://生物制造.中国/verify.php?email=' . urlencode($email) . '&token=' . $token;

    $title       = '欢迎注册，请激活您的账号';
    $body        = '感谢您注册！请点击下方按钮激活您的账号。';
    $templatePath = __DIR__ . '/templates/verification_email.html';

    return $emailHelper->sendVerificationEmail(
        $username,
        $email,
        $title,
        $body,
        $templatePath,
        $customVerifyUrl  // 传入自定义验证链接
    );
}


// ========================================
// 示例 3：开启调试模式（用于排查问题）
// ========================================

/**
 * 开启调试模式发送邮件（示例）
 *
 * 调试模式下会输出 SMTP 通信日志，便于排查连接问题
 *
 * @param string $username 用户名
 * @param string $email    用户邮箱
 * @return bool 发送结果
 */
function sendEmailWithDebug($username, $email)
{
    $config = getEmailConfig();
    $config['debug'] = true;  // 开启调试模式

    $emailHelper = new EmailHelper($config);

    $title       = '欢迎注册，请激活您的账号';
    $body        = '感谢您注册！请点击下方按钮激活您的账号。';
    $templatePath = __DIR__ . '/templates/verification_email.html';

    return $emailHelper->sendVerificationEmail(
        $username,
        $email,
        $title,
        $body,
        $templatePath
    );
}


// ========================================
// 运行示例（取消注释以测试）
// ========================================

// 测试发送（请将邮箱替换为真实邮箱地址进行测试）
/*
$result = handleUserRegistration('张三', 'test@example.com', 'password123');
if ($result['success']) {
    echo $result['message'] . "\n";
} else {
    echo "错误：" . $result['message'] . "\n";
}
*/

// 调试模式测试
/*
echo "=== 调试模式测试 ===\n";
$success = sendEmailWithDebug('测试用户', 'test@example.com');
echo $success ? "发送成功\n" : "发送失败\n";
*/
