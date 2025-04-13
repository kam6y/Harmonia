// front/src/pages/admin/settings.jsx
import { useState, useEffect } from "react";
import Link from "next/link";
import AdminHeader from "@/components/admin/AdminHeader";
import axios from "axios";

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // サーベイ設定データ
  const [engagementSurvey, setEngagementSurvey] = useState({});
  const [pulseSurvey, setPulseSurvey] = useState({});
  const [defaultQuestions, setDefaultQuestions] = useState([]);
  const [additionalQuestions, setAdditionalQuestions] = useState([]);

  // ★ localStorage から tenant_id を取得（なければ1を使う）
  const [tenantId, setTenantId] = useState(() => {
    if (typeof window !== 'undefined') {
      const storedTenantId = localStorage.getItem("tenant_id");
      return storedTenantId ? JSON.parse(storedTenantId) : 1;
    }
    return 1;
  });

  // ★ バックエンドURLの設定
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost';

  useEffect(() => {
    // サーベイ設定を取得する
    const fetchSurveySettings = async () => {
      try {
        setLoading(true);
        const response = await axios.post(`${BACKEND_URL}/api/admin/survey-settings`);
        
        // レスポンスからデータを取得
        const { engagement_survey, pulse_survey, default_questions, additional_questions } = response.data;
        
        // 取得したデータを設定
        setEngagementSurvey(engagement_survey || {});
        setPulseSurvey(pulse_survey || {});
        setDefaultQuestions(default_questions || []);
        setAdditionalQuestions(additional_questions || []);
        
        setLoading(false);
      } catch (err) {
        console.error("設定データの取得に失敗しました:", err);
        setError("設定データの取得に失敗しました。");
        setLoading(false);
      }
    };

    fetchSurveySettings();
  }, [tenantId, BACKEND_URL]);

  // ローディング表示
  if (loading) {
    return (
      <div className="bg-white min-h-screen">
        <AdminHeader />
        <main className="p-6 bg-brand-lightGray flex justify-center items-center min-h-[80vh]">
          <div className="text-center">
            <p className="text-lg">データを読み込み中...</p>
          </div>
        </main>
      </div>
    );
  }

  // エラー表示
  if (error) {
    return (
      <div className="bg-white min-h-screen">
        <AdminHeader />
        <main className="p-6 bg-brand-lightGray pt-16">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p>{error}</p>
          </div>
          <div className="flex justify-end">
            <button 
              onClick={() => window.location.reload()} 
              className="bg-brand-darkBlue text-white px-6 py-2 rounded-lg shadow-md hover:bg-brand-cyan transition"
            >
              再読み込み
            </button>
          </div>
        </main>
      </div>
    );
  }

  // エンゲージメントサーベイの配信間隔（日数を月に変換）
  const engagementMonths = engagementSurvey.survey_delivery_interval_days 
    ? Math.floor(engagementSurvey.survey_delivery_interval_days / 30) 
    : 6;

  return (
    <div className="bg-white min-h-screen">
      {/* ヘッダー */}
      <AdminHeader />

      <main className="p-6 bg-brand-lightGray pt-16">
        {/* エンゲージメントサーベイ設定 */}
        <section className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-3xl text-brand-darkBlue font-bold mb-4">エンゲージメントサーベイデフォルト設定</h2>

          {/* 配信スケジュール */}
          <div className="mb-6">
            <h3 className="font-semibold flex items-center text-black text-lg leading-relaxed">
              <span className="w-4 h-4 bg-brand-cyan rounded-full mr-2"></span> 配信スケジュール設定
            </h3>
            <div className="flex space-x-12 text-base mt-2 text-black">
              <p>配信間隔: <span className="font-semibold">{engagementMonths}ヶ月</span></p>
            </div>
          </div>

          {/* リマインダー設定 */}
          <div className="mb-6">
            <h3 className="font-semibold text-black flex items-center text-lg leading-relaxed">
              <span className="w-4 h-4 bg-brand-cyan rounded-full mr-2"></span> リマインダー設定
            </h3>
            <p className="text-black text-base mt-2">配信間隔: <span className="font-semibold">{engagementSurvey.reminder_delivery_interval_days || 3}日</span></p>
          </div>

          {/* 常設設問リスト */}
          <h3 className="text-black font-semibold flex items-center text-lg leading-relaxed mb-2">
            <span className="w-4 h-4 bg-brand-cyan rounded-full mr-2"></span> 常設設問
          </h3>
          <TableQuestions data={defaultQuestions.map((q, index) => ({
            id: q.id,
            category: q.issue_category,
            question: q.question_text
          }))} />
        </section>

        {/* パルスサーベイ設定 */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-3xl text-brand-darkBlue font-bold mb-4">パルスサーベイデフォルト設定</h2>

          {/* 配信スケジュール */}
          <div className="mb-6">
            <h3 className="font-semibold flex items-center text-black text-lg leading-relaxed">
              <span className="w-4 h-4 bg-brand-cyan rounded-full mr-2"></span> 配信スケジュール設定
            </h3>
            <p className="text-black text-base mt-2">配信間隔: <span className="font-semibold">{pulseSurvey.survey_delivery_interval_days || 7}日</span></p>
          </div>

          {/* リマインダー設定 */}
          <div className="mb-6">
            <h3 className="font-semibold text-black flex items-center text-lg leading-relaxed">
              <span className="w-4 h-4 bg-brand-cyan rounded-full mr-2"></span> リマインダー設定
            </h3>
            <p className="text-black text-base mt-2">配信間隔: <span className="font-semibold">{pulseSurvey.reminder_delivery_interval_days || 1}日</span></p>
          </div>
        </section>

        {/* 編集ボタン */}
        <div className="flex justify-end mt-6">
          <Link href="/admin/settings_register" passHref>
            <button className="bg-brand-darkBlue text-white px-8 py-3 rounded-lg shadow-md hover:bg-brand-cyan transition text-base font-semibold">
              編集
            </button>
          </Link>
        </div>
      </main>
    </div>
  );
}

/**
 * テーブルコンポーネント
 */
function TableQuestions({ data }) {
  return (
    <div className="overflow-x-auto border rounded-t-md">
      <table className="min-w-full text-base leading-relaxed text-gray-900 border-collapse">
        <thead className="bg-gray-50 text-gray-500 uppercase">
          <tr className="">
            <th scope="col" className="px-6 py-3 font-semibold text-left">設問ID</th>
            <th scope="col" className="px-6 py-3 font-semibold text-left">設問分類</th>
            <th scope="col" className="px-6 py-3 font-semibold text-left">設問</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {data.map((item, index) => (
            <tr key={index} className="hover:bg-gray-100">
              <td className="px-6 py-2 whitespace-nowrap font-medium">{item.id}</td>
              <td className="px-6 py-2 whitespace-nowrap">{item.category}</td>
              <td className="px-6 py-2 whitespace-normal">{item.question}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}