<?php
/**
 * EmailHelper 配置文件
 *
 * 请根据您的 SMTP 服务商提供的信息修改以下配置
 *
 * 常见 SMTP 服务商配置参考：
 *
 * 1. QQ 邮箱
 *    - smtp_host: smtp.qq.com
 *    - smtp_port: 465
 *    - smtp_secure: ssl
 *    - smtp_password: 使用授权码（非QQ密码），在 QQ邮箱设置 -> 账户 -> POP3/SMTP服务 中获取
 *
 * 2. 163 邮箱
 *    - smtp_host: smtp.163.com
 *    - smtp_port: 465
 *    - smtp_secure: ssl
 *    - smtp_password: 使用授权码（非邮箱密码），在 163邮箱设置 -> POP3/SMTP/IMAP 中获取
 *
 * 3. Gmail
 *    - smtp_host: smtp.gmail.com
 *    - smtp_port: 587
 *    - smtp_secure: tls
 *    - smtp_password: 使用应用专用密码（需开启两步验证后生成）
 *
 * 4. 阿里云邮件推送
 *    - smtp_host: smtpdm.aliyun.com
 *    - smtp_port: 465
 *    - smtp_secure: ssl
 *
 * 5. 腾讯企业邮箱
 *    - smtp_host: smtp.exmail.qq.com
 *    - smtp_port: 465
 *    - smtp_secure: ssl
 *
 * 6. 自建邮件服务器（如 Postfix）
 *    - smtp_host: 您的服务器地址
 *    - smtp_port: 25（明文）/ 465（SSL）/ 587（TLS）
 *    - smtp_secure: 根据端口选择
 */

/**
 * 获取邮件配置
 *
 * @return array 配置数组
 */
function getEmailConfig()
{
    return array(
        // ===== SMTP 服务器配置 =====
        'smtp_host'     => 'smtp.qq.com',        // SMTP 服务器地址
        'smtp_port'     => 465,                   // SMTP 服务器端口（SSL 通常为 465，TLS 为 587，明文为 25）
        'smtp_username' => 'noreply@example.com', // SMTP 用户名（通常为发件邮箱地址）
        'smtp_password' => 'your_auth_code_here', // SMTP 密码或授权码（注意：大部分邮箱需要使用授权码而非登录密码）
        'smtp_secure'   => 'ssl',                 // 加密方式：'ssl'（端口465）、'tls'（端口587）、''（不加密，端口25）
        'timeout'       => 30,                    // 连接超时时间（秒）

        // ===== 发件人配置 =====
        'from_email'    => 'noreply@example.com', // 发件人邮箱地址（默认使用 smtp_username）
        'from_name'     => '数据之源，洞见之始',    // 发件人显示名称

        // ===== 网站配置 =====
        'site_name'     => '数据之源，洞见之始',    // 网站名称（将显示在邮件中）
        'site_url'      => 'http://生物制造.中国', // 网站 URL（用于生成验证链接）

        // ===== 安全配置 =====
        'secret_key'    => 'your_secret_key_here_please_change', // 加密密钥（用于生成验证令牌，请修改为随机字符串）

        // ===== 调试配置 =====
        'debug'         => false,                 // 是否开启调试模式（开启后会输出 SMTP 通信日志）
    );
}
