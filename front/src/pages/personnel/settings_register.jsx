import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import PersonnelHeader from "@/components/personnel/PersonnelHeader";
import PersonnelSubHeader from "@/components/common/SubHeader";

export default function PersonnelEditPage() {
  const router = useRouter();

  // フォームの初期値
  const [tenantId, setTenantId] = useState(null);
  const [startDate, setStartDate] = useState("2021-09-06");
  const [engInterval, setEngInterval] = useState("6");
  const [engReminder, setEngReminder] = useState("3");
  const [engDeadline, setEngDeadline] = useState("30");
  const [pulseInterval, setPulseInterval] = useState("7");
  const [pulseReminder, setPulseReminder] = useState("1");
  const [pulseStartdate, setPulseStartdate] = useState("2021-09-06");

  // 追加設問：既存データはDBから取得されたもの、かつ新規行は id:null とする
  const [additionalQuestions, setAdditionalQuestions] = useState([
    { id: null, issue_category: "", question_text: "" },
  ]);
  // オリジナルの追加設問（削除検出用）
  const [originalAdditionalQuestions, setOriginalAdditionalQuestions] = useState([]);

  useEffect(() => {
    const tenantId = JSON.parse(localStorage.getItem("tenant_id"));
    setTenantId(tenantId);
    console.log(tenantId)
    const fetchSettings = async () => {
      try {
        const res = await fetch("http://localhost/api/survey-settings", {
          method: "POST", // 必要に応じてGETに変更
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ tenant_id: tenantId }),
        });
        const data = await res.json();
        console.log("既存設定", data);

        // エンゲージメントサーベイ設定
        if (data.engagement_survey) {
          setStartDate(data.engagement_survey.survey_start_day || "2021-09-06");
          setEngInterval(data.engagement_survey.survey_delivery_interval || "6");
          setEngReminder(data.engagement_survey.reminder_delivery_interval || "3");
          setEngDeadline(data.engagement_survey.deadline || "30");
        }
        // パルスサーベイ設定
        if (data.pulse_survey) {
          setPulseInterval(data.pulse_survey.survey_delivery_interval || "7");
          setPulseReminder(data.pulse_survey.reminder_delivery_interval || "1");
          setPulseStartdate(data.pulse_survey.start_date);
        }
        // 追加設問：既存レコードはDBのIDが入っている前提
        if (data.additional_questions && Array.isArray(data.additional_questions)) {
          // 最後に新規入力用の空行を追加
          setAdditionalQuestions([
            ...data.additional_questions,
            { id: null, issue_category: "", question_text: "" },
          ]);
          // オリジナルはそのまま保持（新規行は含めない）
          setOriginalAdditionalQuestions(data.additional_questions);
        }
        console.log(additionalQuestions)
      } catch (error) {
        console.error("設定取得エラー:", error);
      }
    };

    fetchSettings();
  }, []);

  /**
   * フォーム送信時の処理
   */
  const handleSave = async (e) => {
    e.preventDefault();

    // ▼▼▼ クライアントサイドバリデーション例 ▼▼▼
    if (!startDate) {
      alert("エンゲージメントサーベイの開始日を入力してください");
      return;
    }
    if (!engInterval || Number(engInterval) < 1) {
      alert("エンゲージメントサーベイの配信間隔を1以上で入力してください");
      return;
    }
    if (!engReminder || Number(engReminder) < 1) {
      alert("エンゲージメントサーベイのリマインダー日数を1以上で入力してください");
      return;
    }
    if (!pulseStartdate) {
      alert("エンゲージメントサーベイの開始日を入力してください");
      return;
    }
    if (!pulseInterval || Number(pulseInterval) < 1) {
      alert("パルスサーベイの配信間隔を1以上で入力してください");
      return;
    }
    if (!pulseReminder || Number(pulseReminder) < 1) {
      alert("パルスサーベイのリマインダー日数を1以上で入力してください");
      return;
    }

    // オリジナルにあったが、現在の設問リストに含まれないIDを削除対象とする
    const originalIds = originalAdditionalQuestions.map((q) => q.id).filter((id) => id != null);
    const currentIds = additionalQuestions.map((q) => q.id).filter((id) => id != null);
    const deletedQuestionIds = originalIds.filter((id) => !currentIds.includes(id));

    console.log(tenantId)
    // 送信データ（payload）
    const payload = {
      tenant_id: tenantId,
      engagement_survey: {
        survey_start_day: startDate,
        survey_delivery_interval: Number(engInterval),
        reminder_delivery_interval: Number(engReminder),
        deadline: Number(engDeadline)
      },
      pulse_survey: {
        start_date: pulseStartdate,
        survey_delivery_interval: Number(pulseInterval),
        reminder_delivery_interval: Number(pulseReminder),
      },
      additional_questions: additionalQuestions.filter(
          (q) =>
              (q.issue_category || "").trim() !== "" ||
              (q.question_text || "").trim() !== ""
      ),
      deleted_question_ids: deletedQuestionIds,
    };

    try {
      console.log("送信物" .payload)
      const res = await fetch("http://localhost/api/survey-settings/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`保存に失敗しました: ${res.statusText}`);
      }

      const result = await res.json();
      console.log("保存結果", result);
      alert("変更を保存しました！");
      router.back();
    } catch (error) {
      console.error("保存エラー:", error);
      alert("保存中にエラーが発生しました");
    }
  };

  /**
   * キャンセルボタン押下時の処理 (仮)
   */
  const handleCancel = () => {
    router.back();
  };

  /**
   * 追加設問の自動行追加処理
   */
  const handleQuestionChange = (index, field, value) => {
    const updated = [...additionalQuestions];
    updated[index][field] = value;
    setAdditionalQuestions(updated);

    // 最終行（新規行）の入力状況をチェックし、何か入力されていたら新規行を追加する
    const lastQuestion = updated[updated.length - 1];
    if ((lastQuestion.issue_category || "").trim() !== "" || (lastQuestion.question_text || "").trim() !== "") {
      if (
          updated.every(
              (q) =>
                  (q.issue_category || "").trim() !== "" ||
                  (q.question_text || "").trim() !== ""
          )
      ) {
        setAdditionalQuestions([...updated, { id: null, issue_category: "", question_text: "" }]);
      }
    }
  };

  /**
   * 追加設問を削除する処理
   */
  const handleDeleteQuestion = (index) => {
    const updated = additionalQuestions.filter((_, i) => i !== index);
    // 削除後、最後の行が空でなければ新規行を追加する
    if (
        updated.length === 0 ||
        ((updated[updated.length - 1].issue_category || "").trim() !== "" ||
            (updated[updated.length - 1].question_text || "").trim() !== "")
    ) {
      updated.push({ id: null, issue_category: "", question_text: "" });
    }
    setAdditionalQuestions(updated);
  };

  return (
      <div className="bg-white min-h-screen">
        <PersonnelHeader />
        <PersonnelSubHeader title="設定（編集モード）" />
        <main className="p-6 bg-brand-lightGray pt-16">
          <form onSubmit={handleSave}>
            {/* エンゲージメントサーベイ設定 */}
            <section className="bg-white p-6 rounded-lg shadow-md mb-6">
              <h2 className="text-xl text-brand-darkBlue font-bold mb-4">エンゲージメントサーベイ設定</h2>
              {/* 配信スケジュール */}
              <div className="mb-6">
                <h3 className="font-semibold flex items-center text-black text-base leading-relaxed mb-2">
                  <span className="w-4 h-4 bg-brand-cyan rounded-full mr-2"></span>配信スケジュール設定
                </h3>
                <div className="flex space-x-12 text-sm text-black">
                  <div className="flex items-center">
                    <label className="block mb-1 font-medium w-28" htmlFor="startDate">配信開始日</label>
                    <input
                        id="startDate"
                        type="date"
                        className="border px-2 py-1 rounded text-sm"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center">
                    <label className="block mb-1 font-medium w-28" htmlFor="engInterval">配信間隔</label>
                    <input
                        id="engInterval"
                        type="number"
                        className="border px-2 py-1 rounded w-16 text-right text-sm"
                        value={engInterval}
                        onChange={(e) => setEngInterval(e.target.value)}
                    />
                    <span className="ml-2">ヶ月</span>
                  </div>
                  <div className="flex items-center">
                    <label className="block mb-1 font-medium w-28" htmlFor="engInterval">回答期限</label>
                    <input
                        id="engDeadline"
                        type="number"
                        className="border px-2 py-1 rounded w-16 text-right text-sm"
                        value={engDeadline}
                        onChange={(e) => setEngDeadline(e.target.value)}
                    />
                    <span className="ml-2">日間</span>
                  </div>
                </div>
              </div>
              {/* リマインダー設定 */}
              <div className="mb-6">
                <h3 className="font-semibold text-black flex items-center text-base leading-relaxed mb-2">
                  <span className="w-4 h-4 bg-brand-cyan rounded-full mr-2"></span>リマインダー設定
                </h3>
                <div className="flex items-center">
                  <label className="text-black block mb-1 font-medium w-28" htmlFor="engReminder">配信間隔</label>
                  <input
                      id="engReminder"
                      type="number"
                      className="text-black border px-2 py-1 rounded w-16 text-right text-sm"
                      value={engReminder}
                      onChange={(e) => setEngReminder(e.target.value)}
                  />
                  <span className="text-black ml-2">日</span>
                </div>
              </div>
              {/* 追加設問 */}
              <h3 className="text-black font-semibold flex items-center text-base leading-relaxed mt-6 mb-2">
                <span className="w-4 h-4 bg-brand-cyan rounded-full mr-2"></span>追加設問
              </h3>
              <EditableTable data={additionalQuestions} onChange={handleQuestionChange} onDelete={handleDeleteQuestion} />
            </section>

            {/* パルスサーベイ設定 */}
            <section className="bg-white p-6 rounded-lg shadow-md mb-6 text-black">
              <h2 className="text-xl text-brand-darkBlue font-bold mb-4">パルスサーベイ設定</h2>
              {/* 配信スケジュール */}
              <div className="mb-6">
                <h3 className="font-semibold flex items-center text-black text-base leading-relaxed mb-2">
                  <span className="w-4 h-4 bg-brand-cyan rounded-full mr-2"></span>配信スケジュール設定
                </h3>
                <div className="flex items-center mb-4">
                  <label className="block mb-1 font-medium w-28" htmlFor="pulseStartdate">配信開始日</label>
                  <input
                      id="pulseStartdate"
                      type="date"
                      className="border px-2 py-1 rounded text-sm"
                      value={pulseStartdate}
                      onChange={(e) => setPulseStartdate(e.target.value)}
                  />
                </div>
                <div className="flex items-center">
                  <label className="text-black block mb-1 font-medium w-28" htmlFor="pulseInterval">配信間隔</label>
                  <input
                      id="pulseInterval"
                      type="number"
                      className="text-black border px-2 py-1 rounded w-16 text-right text-sm"
                      value={pulseInterval}
                      onChange={(e) => setPulseInterval(e.target.value)}
                  />
                  <span className="text-black ml-2">日</span>
                </div>
              </div>
              {/* リマインダー設定 */}
              <div className="mb-6">
                <h3 className="font-semibold text-black flex items-center text-base leading-relaxed mb-2">
                  <span className="w-4 h-4 bg-brand-cyan rounded-full mr-2"></span>リマインダー設定
                </h3>
                <div className="text-black flex items-center">
                  <label className="block mb-1 font-medium w-28" htmlFor="pulseReminder">配信間隔</label>
                  <input
                      id="pulseReminder"
                      type="number"
                      className="text-black border px-2 py-1 rounded w-16 text-right text-sm"
                      value={pulseReminder}
                      onChange={(e) => setPulseReminder(e.target.value)}
                  />
                  <span className="ml-2">日</span>
                </div>
              </div>
            </section>

            {/* 保存/キャンセルボタン */}
            <div className="flex justify-end mt-6 space-x-4">
              <button type="button" onClick={handleCancel} className="bg-gray-300 text-black px-6 py-3 rounded-lg shadow-md hover:bg-gray-400 transition text-sm font-semibold">キャンセル</button>
              <button type="submit" className="bg-brand-darkBlue text-white px-8 py-3 rounded-lg shadow-md hover:bg-brand-cyan transition text-sm font-semibold">保存</button>
            </div>
          </form>
        </main>
      </div>
  );
}

function EditableTable({ data, onChange, onDelete }) {
  return (
      <div className="overflow-x-auto border rounded-t-md">
        <table className="min-w-full text-sm leading-relaxed text-gray-900 border-collapse">
          <thead className="bg-gray-50 text-gray-500 uppercase">
          <tr>
            <th scope="col" className="px-6 py-3 font-semibold text-left">設問ID</th>
            <th scope="col" className="px-6 py-3 font-semibold text-left">設問分類</th>
            <th scope="col" className="px-6 py-3 font-semibold text-left">設問</th>
            <th scope="col" className="px-6 py-3 font-semibold text-left">削除</th>
          </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
          {data.map((item, index) => {
            const category = (item.issue_category || "").trim();
            const question = (item.question_text || "").trim();
            return (
                <tr key={index} className="hover:bg-gray-100">
                  <td className="px-6 py-2 whitespace-nowrap font-medium">{item.id || "-"}</td>
                  <td className="px-6 py-2 whitespace-nowrap">
                    <input
                        type="text"
                        className="border px-2 py-1 rounded w-full text-sm"
                        value={item.issue_category}
                        onChange={(e) => onChange(index, "issue_category", e.target.value)}
                    />
                  </td>
                  <td className="px-6 py-2 whitespace-normal">
                  <textarea
                      className="border px-2 py-1 rounded w-full text-sm"
                      rows={2}
                      value={item.question_text}
                      onChange={(e) => onChange(index, "question_text", e.target.value)}
                  />
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap">
                    {!(index === data.length - 1 && category === "" && question === "") && (
                        <button onClick={() => onDelete(index)} className="text-red-500 text-sm">削除</button>
                    )}
                  </td>
                </tr>
            );
          })}
          </tbody>
        </table>
      </div>
  );
}
