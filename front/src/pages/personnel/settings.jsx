import { useEffect, useState } from "react";
import Link from "next/link";
import PersonnelHeader from "@/components/personnel/PersonnelHeader";
import PersonnelSubHeader from "@/components/common/SubHeader";

export default function PersonnelSettingsPage() {
  const [engagementSurvey, setEngagementSurvey] = useState(null);
  const [pulseSurvey, setPulseSurvey] = useState(null);
  const [additionalQuestions, setAdditionalQuestions] = useState([]);
  const [defaultQuestions, setDefaultQuestions] = useState([]);


  useEffect(() => {

    const tenantId = JSON.parse(localStorage.getItem("tenant_id"));
    console.log(tenantId);
    const fetchSettings = async () => {
      try {
        const res = await fetch("http://localhost/api/survey-settings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ tenant_id: tenantId }),
        });

        const data = await res.json();
        console.log(data)
        setEngagementSurvey(data.engagement_survey);
        setPulseSurvey(data.pulse_survey);
        setDefaultQuestions(data.default_questions);
        setAdditionalQuestions(data.additional_questions);
        console.log(PulseSurvey)
      } catch (error) {
        console.error("設定取得エラー:", error);
      }
    };

    fetchSettings();
  }, []);

  return (
      <div className="bg-white min-h-screen">
        <PersonnelHeader />
        <PersonnelSubHeader title="設定" />

        <main className="p-6 bg-brand-lightGray pt-16">
          {/* エンゲージメントサーベイ設定 */}
          <section className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl text-brand-darkBlue font-bold mb-4">エンゲージメントサーベイ設定</h2>

            {/* 配信スケジュール */}
            <div className="mb-6">
              <h3 className="font-semibold flex items-center text-black text-base leading-relaxed">
                <span className="w-4 h-4 bg-brand-cyan rounded-full mr-2"></span> 配信スケジュール設定
              </h3>
              <div className="flex space-x-12 text-sm mt-2 text-black">
                <p>配信開始日: <span className="font-semibold">{engagementSurvey?.survey_start_day ?? "-"}</span></p>
                <p>配信間隔: <span
                    className="font-semibold">{engagementSurvey?.survey_delivery_interval ?? "-"}日</span></p>
                <p>回答期間: <span
                    className="font-semibold">{engagementSurvey?.deadline ?? "-"}日</span></p>
              </div>
            </div>

            {/* リマインダー設定 */}
            <div className="mb-6">
              <h3 className="font-semibold text-black flex items-center text-base leading-relaxed">
                <span className="w-4 h-4 bg-brand-cyan rounded-full mr-2"></span> リマインダー設定
              </h3>
              <p className="text-black text-sm mt-2">配信間隔: <span className="font-semibold">{engagementSurvey?.reminder_delivery_interval ?? "-"}日</span></p>
            </div>

            {/* 常設設問リスト */}
            <h3 className="text-black font-semibold flex items-center text-base leading-relaxed mb-2">
              <span className="w-4 h-4 bg-brand-cyan rounded-full mr-2"></span> 常設設問
            </h3>
            <TableQuestions data={defaultQuestions} />

            {/* 追加設問 */}
            <h3 className="text-black font-semibold flex items-center text-base leading-relaxed mt-6 mb-2">
              <span className="w-4 h-4 bg-brand-cyan rounded-full mr-2"></span> 追加設問
            </h3>
            <TableQuestions data={additionalQuestions} />
          </section>

          {/* パルスサーベイ設定 */}
          <section className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl text-brand-darkBlue font-bold mb-4">パルスサーベイ設定</h2>

            {/* 配信スケジュール */}
            <div className="mb-6">
              <h3 className="font-semibold flex items-center text-black text-base leading-relaxed">
                <span className="w-4 h-4 bg-brand-cyan rounded-full mr-2"></span> 配信スケジュール設定
              </h3>
              <div className="flex space-x-12 text-sm mt-2 text-black">
                <p>配信開始日: <span className="font-semibold">{pulseSurvey?.start_date ?? "-"}</span></p>
                <p>配信間隔: <span className="font-semibold">{pulseSurvey?.survey_delivery_interval ?? "-"}日</span></p>
              </div>
            </div>

            {/* リマインダー設定 */}
            <div className="mb-6">
              <h3 className="font-semibold text-black flex items-center text-base leading-relaxed">
                <span className="w-4 h-4 bg-brand-cyan rounded-full mr-2"></span> リマインダー設定
              </h3>
              <p className="text-black text-sm mt-2">配信間隔: <span className="font-semibold">{pulseSurvey?.reminder_delivery_interval ?? "-"}日</span></p>
            </div>
          </section>

          {/* 編集ボタン */}
          <div className="flex justify-end mt-6">
            <Link href="/personnel/settings_register" passHref>
              <button className="bg-brand-darkBlue text-white px-8 py-3 rounded-lg shadow-md hover:bg-brand-cyan transition text-sm font-semibold">
                編集
              </button>
            </Link>
          </div>
        </main>
      </div>
  );
}

function TableQuestions({ data }) {
  return (
      <div className="overflow-x-auto border rounded-t-md">
        <table className="min-w-full text-sm leading-relaxed text-gray-900 border-collapse">
          <thead className="bg-gray-50 text-gray-500 uppercase">
          <tr>
            <th scope="col" className="px-6 py-3 font-semibold text-left">設問ID</th>
            <th scope="col" className="px-6 py-3 font-semibold text-left">設問分類</th>
            <th scope="col" className="px-6 py-3 font-semibold text-left">設問</th>
          </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
          {data.map((item, index) => (
              <tr key={index} className="hover:bg-gray-100">
                <td className="px-6 py-2 whitespace-nowrap font-medium">{item.id}</td>
                <td className="px-6 py-2 whitespace-nowrap">{item.issue_category}</td>
                <td className="px-6 py-2 whitespace-normal">{item.question_text}</td>
              </tr>
          ))}
          </tbody>
        </table>
      </div>
  );
}
