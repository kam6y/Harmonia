import { useState } from "react";
import { useRouter } from "next/router";
import AuthHeader from "@/components/auth/AuthHeader";
import Image from "next/image";

export default function SetupPage() {
  const [userName, setUserName] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const userId = JSON.parse(localStorage.getItem("id"));
      const token = localStorage.getItem("api_token");
      const role = JSON.parse(localStorage.getItem("role"));

      const response = await fetch("http://localhost/api/setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: userName,
          userId,
        }),
      });


      if (!response.ok) {
        throw new Error("送信に失敗しました");
      }

      const data = await response.json();
      console.log("APIレスポンス:", data);

      if (role === "personnel") {
        router.push("/personnel/dashboard");
      } else if (role === "manager") {
        router.push("/manager/dashboard_survey");
      } else {
        setError("アカウントが存在しないか、アクセス権限がありません。");
        localStorage.removeItem("api_token");
        localStorage.removeItem("id");
        localStorage.removeItem("role");
        router.push("/auth/login");
      }
    } catch (error) {
      console.error("エラー:", error);
    }
  };


  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Auth専用ヘッダー */}
      <AuthHeader />

      {/* メインコンテンツ */}
      <main className="w-full flex-1 flex justify-center items-center p-6">
        {/* カードコンテナ */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-lg py-24 w-svw max-w-5xl flex flex-col justify-center items-center md:flex-row">
          {/* フォーム */}
          <div className="w-full md:w-1/2 pl-0 md:pl-16">
            <h2 className="text-3xl font-extrabold text-brand-darkBlue text-center mb-4">
              はじめまして！
            </h2>
            <h2 className="text-3xl font-extrabold text-brand-darkBlue text-center mb-4">
              Harmoniaにようこそ!
            </h2>
            <p className="text-center text-gray-600 mb-8">
              最初にあなたのお名前を教えてください
            </p>
            <form onSubmit={handleSubmit}>
              <div className="mt-4">
                <label className="block mb-2 font-semibold text-gray-700">
                  お名前
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="text-black w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-blue transition-colors duration-200"
                  placeholder="例: 田中 太郎"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-brand-cyan hover:bg-brand-darkBlue text-white font-semibold py-3 mt-12 rounded-lg transition-all duration-200 shadow-md"
              >
                次へ
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}