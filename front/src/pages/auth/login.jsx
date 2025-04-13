import { useState } from "react";
import { useRouter } from "next/router";
import AuthHeader from "@/components/auth/AuthHeader";
import Image from "next/image";

export default function AuthLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // 入力値の検証
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !password.trim()) {
      setError("メールアドレスとパスワードを入力してください。");
      return;
    }
    if (!emailRegex.test(email)) {
      setError("正しいメールアドレスを入力してください。");
      return;
    }
    if (password.length < 8) {
      setError("パスワードは8文字以上で入力してください。");
      return;
    }

    try {
      // ログインリクエスト送信（CSRFなしのエンドポイントを利用）
      const loginResponse = await fetch("http://localhost/api/login-no-csrf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!loginResponse.ok) {
        const errData = await loginResponse.json();
        const errorMsg = errData?.message || "ログインに失敗しました。";
        setError(errorMsg);
        return;
      }

      const data = await loginResponse.json();
      console.log("ログイン成功:", data);
      console.log(data.user.department_name)

      // ローカルストレージに保存
      localStorage.setItem("api_token", data.token);
      localStorage.setItem("id", JSON.stringify(data.user.id));
      localStorage.setItem("role", JSON.stringify(data.user.role));
      // ★ tenant_id と department_id を追加で保存
      localStorage.setItem("tenant_id", JSON.stringify(data.user.tenant_id));
      localStorage.setItem("department_id", JSON.stringify(data.user.department_id));
      localStorage.setItem("department_name", JSON.stringify(data.user.department_name));
      localStorage.setItem("sub_department_id", JSON.stringify(data.user.sub_department_id));
      console
      // ログイン後のリダイレクト処理
      if (data.user.first_login) {
        router.push("/auth/setup");
      } else if (data.user.role === "admin") {
        router.push("/admin/tenants");
      } else if (data.user.role === "personnel") {
        router.push("/personnel/dashboard");
      } else if (data.user.role === "manager") {
        router.push("/manager/dashboard_survey");
      } else {
        // 該当するロールがない場合はエラーを表示
        setError("アカウントが存在しないか、アクセス権限がありません。");
        localStorage.removeItem("api_token");
        localStorage.removeItem("id");
        localStorage.removeItem("role");
        localStorage.removeItem("tenant_id");
        localStorage.removeItem("department_id");
        router.push("/auth/login");
      }
    } catch (error) {
      console.error("ログインエラー:", error);
      setError(error.message || "ログインに失敗しました。");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <AuthHeader />
      <main className="w-full flex-1 flex justify-center items-center p-6">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-lg py-24 w-svw max-w-5xl flex flex-col justify-center items-center md:flex-row">
          <div className="hidden md:flex justify-center items-center p-6">
            <div className="relative w-64 h-64">
              <Image
                src="/images/login_dog.png"
                alt="Login Icon"
                fill
                className="object-cover rounded-full shadow-lg"
              />
            </div>
          </div>
          <div className="w-full md:w-1/2 pl-0 md:pl-16">
            <h2 className="text-3xl font-extrabold text-brand-darkBlue text-center mb-8">
              ログイン
            </h2>
            {error && (
              <div className="mb-4 text-red-600 text-center">{error}</div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="mt-4">
                <label className="block mb-2 font-semibold text-gray-700">
                  メールアドレス
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="text-black w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-blue transition-colors duration-200"
                  required
                />
              </div>
              <div className="mt-4">
                <label className="block mb-2 font-semibold text-gray-700">
                  パスワード
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="text-black w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-blue transition-colors duration-200"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-brand-cyan hover:bg-brand-darkBlue text-white font-semibold py-3 mt-12 rounded-lg transition-all duration-200 shadow-md"
              >
                ログイン
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}