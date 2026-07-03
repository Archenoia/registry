namespace pages {

    export const url_user_info = "/user/info/";

    export class user_login extends Bootstrap {

        get appName(): string {
            return "user_login";
        }

        protected init(): void {

        }

        public login_onclick() {
            const email = (<HTMLInputElement><any>$ts("#loginEmail")).value;
            const password = (<HTMLInputElement><any>$ts("#loginPassword")).value;
            const loginForm = document.getElementById("loginForm");

            if (email && password) {
                // Simulate login
                const btn = <HTMLButtonElement>loginForm.querySelector('button[id="login"]');
                const originalText = btn.textContent;

                btn.textContent = "登录中...";
                btn.disabled = true;

                $ts.post("/user/login/", { email: email, passwd: md5(password) }, result => {
                    if (result.code == 0) {
                        let $goto_url = $ts.location("goto", false, "/database/");

                        $goto_url = decodeURIComponent($goto_url);
                        $goto($goto_url);
                    } else {
                        btn.textContent = originalText;
                        btn.disabled = false;

                        msgbox.showMessageModal(result.info);
                    }
                });
            } else {
                msgbox.showMessageModal("Email or Password is required!");
            }
        }

        public do_register_onclick() {
            // Register Form
            const registerForm = document.getElementById("registerForm");
            const password = (<HTMLInputElement><any>$ts("#regPassword")).value;
            const confirmPassword = (<HTMLInputElement><any>$ts("#regConfirmPassword")).value;
            const name = (<HTMLInputElement><any>$ts("#regName")).value;
            const affi = (<HTMLInputElement><any>$ts("#regInstitution")).value;
            const regEmail = (<HTMLInputElement><any>$ts("#regEmail")).value;

            if (password !== confirmPassword) {
                alert("两次输入的密码不一致，请重新输入。");
                return;
            }

            if (password.length < 8) {
                alert("密码长度至少为8位。");
                return;
            }

            // Simulate registration
            const btn: HTMLButtonElement = document.querySelector(
                '#registerModal button[id="do_register"]'
            );
            btn.textContent = "注册中...";
            btn.disabled = true;

            $ts.post("/user/register/", {
                name: name,
                email: regEmail,
                passwd: md5(password),
                affiliation: affi
            }, result => {

                btn.textContent = "注册账号";
                btn.disabled = false;

                if (result.code == 0) {
                    alert("注册成功！请查收验证邮件。");
                }

                bootstrap.Modal.getInstance(
                    document.getElementById("registerModal")
                ).hide();
            });
        }
    }
}