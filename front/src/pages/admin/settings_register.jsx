// front/src/pages/admin/settings_register.jsx
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import AdminHeader from '@/components/admin/AdminHeader'
import axios from 'axios'

export default function AdminEditPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // ★ localStorage から tenant_id を取得（なければ1を使う）
  const [tenantId, setTenantId] = useState(() => {
    if (typeof window !== 'undefined') {
      const storedTenantId = localStorage.getItem('tenant_id')
      return storedTenantId ? JSON.parse(storedTenantId) : 1
    }
    return 1
  })

  // ★ バックエンドURLの設定
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost'

  // エンゲージメントサーベイ設定
  const [engInterval, setEngInterval] = useState('6') // 配信間隔（月単位）
  const [engReminder, setEngReminder] = useState('3') // リマインダー（日単位）

  // パルスサーベイ設定
  const [pulseInterval, setPulseInterval] = useState('7') // 配信間隔（日単位）
  const [pulseReminder, setPulseReminder] = useState('1') // リマインダー（日単位）

  // 常設設問
  const [defaultQuestions, setDefaultQuestions] = useState([])
  // 追加設問（オプション）
  const [additionalQuestions, setAdditionalQuestions] = useState([])

  // 初期データの読み込み
  useEffect(() => {
    const fetchSurveySettings = async () => {
      try {
        setLoading(true)
        const response = await axios.post(
          `${BACKEND_URL}/api/admin/survey-settings`
        )

        // レスポンスからデータを取得
        const {
          engagement_survey,
          pulse_survey,
          default_questions,
          additional_questions,
        } = response.data

        // エンゲージメントサーベイ設定
        if (engagement_survey) {
          // 日数を月に変換（概算）
          const monthsInterval = Math.floor(
            (engagement_survey.survey_delivery_interval_days || 180) / 30
          )
          setEngInterval(monthsInterval.toString())
          setEngReminder(
            engagement_survey.reminder_delivery_interval_days?.toString() || '3'
          )
        }

        // パルスサーベイ設定
        if (pulse_survey) {
          setPulseInterval(
            pulse_survey.survey_delivery_interval_days?.toString() || '7'
          )
          setPulseReminder(
            pulse_survey.reminder_delivery_interval_days?.toString() || '1'
          )
        }

        // 常設設問の設定
        if (default_questions && default_questions.length > 0) {
          const formattedDefaultQuestions = default_questions.map((q) => ({
            id: q.id,
            category: q.issue_category,
            question: q.question_text,
          }))

          // 空の行を追加（新規追加用）
          formattedDefaultQuestions.push({
            id: formattedDefaultQuestions.length + 1,
            category: '',
            question: '',
          })

          setDefaultQuestions(formattedDefaultQuestions)
        } else {
          // デフォルト設問がない場合は空の行を設定
          setDefaultQuestions([{ id: 1, category: '', question: '' }])
        }

        // 追加設問の設定（必要に応じて）
        if (additional_questions && additional_questions.length > 0) {
          setAdditionalQuestions(
            additional_questions.map((q) => ({
              id: q.id,
              category: q.issue_category,
              question: q.question_text,
            }))
          )
        }

        setLoading(false)
      } catch (err) {
        console.error('設定データの取得に失敗しました:', err)
        setError('設定データの取得に失敗しました。')
        setLoading(false)
      }
    }

    fetchSurveySettings()
  }, [BACKEND_URL])

  /**
   * フォーム送信時の処理
   */
  const handleSave = async (e) => {
    e.preventDefault()

    try {
      setSubmitting(true)

      // 月単位を日数に変換（エンゲージメントサーベイ用）
      const engagementDays = parseInt(engInterval) * 30

      // 空の行を除いた設問リスト
      const filteredQuestions = defaultQuestions
        .filter((q) => q.category.trim() !== '' || q.question.trim() !== '')
        .map((q) => ({
          id: q.id,
          issue_category: q.category,
          question_text: q.question,
        }))

      // APIリクエストデータの作成
      const requestData = {
        tenant_id: tenantId,
        engagement_survey: {
          survey_delivery_interval_days: engagementDays,
          reminder_delivery_interval_days: parseInt(engReminder),
        },
        pulse_survey: {
          survey_delivery_interval_days: parseInt(pulseInterval),
          reminder_delivery_interval_days: parseInt(pulseReminder),
        },
        default_questions: filteredQuestions,
      }
      console.log(requestData)

      // 設定を更新
      const response = await axios.post(
        `${BACKEND_URL}/api/admin/update-survey-settings`,
        requestData
      )

      if (response.data.success) {
        alert('変更を保存しました！')
        // 設定一覧画面に戻る
        router.push('/admin/settings')
      } else {
        throw new Error(response.data.message || '設定の更新に失敗しました')
      }
    } catch (err) {
      console.error('設定の更新に失敗しました:', err)
      alert(`エラー: ${err.message || '設定の更新に失敗しました'}`)
    } finally {
      setSubmitting(false)
    }
  }

  /**
   * キャンセルボタン押下時の処理
   */
  const handleCancel = () => {
    router.back()
  }

  /**
   * 常設設問の変更処理
   */
  const handleQuestionChange = (index, field, value) => {
    const updated = [...defaultQuestions]
    updated[index][field] = value
    setDefaultQuestions(updated)

    // 最後の行に入力があれば新たな空行を追加
    const lastQuestion = updated[updated.length - 1]
    if (
      lastQuestion.category.trim() !== '' ||
      lastQuestion.question.trim() !== ''
    ) {
      if (
        updated.every(
          (q) => q.category.trim() !== '' || q.question.trim() !== ''
        )
      ) {
        setDefaultQuestions([
          ...updated,
          { id: updated.length + 1, category: '', question: '' },
        ])
      }
    }
  }

  /**
   * 常設設問の削除処理
   */
  const handleDeleteQuestion = (index) => {
    const updated = defaultQuestions.filter((_, i) => i !== index)
    // 最後の行が空でなければ空行を追加
    if (
      updated.length === 0 ||
      updated[updated.length - 1].category.trim() !== '' ||
      updated[updated.length - 1].question.trim() !== ''
    ) {
      updated.push({ id: updated.length + 1, category: '', question: '' })
    }
    setDefaultQuestions(updated)
  }

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
    )
  }

  // エラー表示
  if (error) {
    return (
      <div className="bg-white min-h-screen ">
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
    )
  }

  return (
    <div className="bg-white min-h-screen">
      <AdminHeader />

      <main className="p-6 bg-brand-lightGray pt-16">
        <form onSubmit={handleSave}>
          {/* エンゲージメントサーベイ設定 */}
          <section className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-3xl text-brand-darkBlue font-bold mb-4">
              エンゲージメントサーベイデフォルト設定
            </h2>

            {/* 配信スケジュール */}
            <div className="mb-6">
              <h3 className="font-semibold flex items-center text-black text-lg leading-relaxed mb-2">
                <span className="w-4 h-4 bg-brand-cyan rounded-full mr-2"></span>{' '}
                配信スケジュール設定
              </h3>
              <div className="flex space-x-12 text-base text-black">
                <div className="flex items-center">
                  <label
                    className="block mb-1 font-medium w-28"
                    htmlFor="engInterval"
                  >
                    配信間隔
                  </label>
                  <input
                    id="engInterval"
                    type="number"
                    className="border px-2 py-1 rounded w-16 text-right"
                    value={engInterval}
                    onChange={(e) => setEngInterval(e.target.value)}
                    min="1"
                  />
                  <span className="ml-2">ヶ月</span>
                </div>
              </div>
            </div>

            {/* リマインダー設定 */}
            <div className="mb-6">
              <h3 className="font-semibold text-black flex items-center text-lg leading-relaxed mb-2">
                <span className="w-4 h-4 bg-brand-cyan rounded-full mr-2"></span>{' '}
                リマインダー設定
              </h3>
              <div className="flex items-center">
                <label
                  className="text-black block mb-1 font-medium w-28"
                  htmlFor="engReminder"
                >
                  配信間隔
                </label>
                <input
                  id="engReminder"
                  type="number"
                  className="text-black border px-2 py-1 rounded w-16 text-right"
                  value={engReminder}
                  onChange={(e) => setEngReminder(e.target.value)}
                  min="1"
                />
                <span className="text-black ml-2">日</span>
              </div>
            </div>

            {/* 常設設問の編集 */}
            <h3 className="text-black font-semibold flex items-center text-lg leading-relaxed mt-6 mb-2">
              <span className="w-4 h-4 bg-brand-cyan rounded-full mr-2"></span>{' '}
              常設設問
            </h3>
            <EditableTable
              data={defaultQuestions}
              onChange={handleQuestionChange}
              onDelete={handleDeleteQuestion}
            />
          </section>

          {/* パルスサーベイ設定 */}
          <section className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-3xl text-brand-darkBlue font-bold mb-4">
              パルスサーベイデフォルト設定
            </h2>

            {/* 配信スケジュール */}
            <div className="mb-6">
              <h3 className="font-semibold flex items-center text-black text-lg leading-relaxed mb-2">
                <span className="w-4 h-4 bg-brand-cyan rounded-full mr-2"></span>{' '}
                配信スケジュール設定
              </h3>
              <div className="flex items-center">
                <label
                  className="text-black block mb-1 font-medium w-28"
                  htmlFor="pulseInterval"
                >
                  配信間隔
                </label>
                <input
                  id="pulseInterval"
                  type="number"
                  className="text-black border px-2 py-1 rounded w-16 text-right"
                  value={pulseInterval}
                  onChange={(e) => setPulseInterval(e.target.value)}
                  min="1"
                />
                <span className="text-black ml-2">日</span>
              </div>
            </div>

            {/* リマインダー設定 */}
            <div className="mb-6">
              <h3 className="font-semibold text-black flex items-center text-lg leading-relaxed mb-2">
                <span className="w-4 h-4 bg-brand-cyan rounded-full mr-2"></span>{' '}
                リマインダー設定
              </h3>
              <div className="flex items-center">
                <label
                  className="text-black block mb-1 font-medium w-28"
                  htmlFor="pulseReminder"
                >
                  配信間隔
                </label>
                <input
                  id="pulseReminder"
                  type="number"
                  className="text-black border px-2 py-1 rounded w-16 text-right"
                  value={pulseReminder}
                  onChange={(e) => setPulseReminder(e.target.value)}
                  min="1"
                />
                <span className="text-black ml-2">日</span>
              </div>
            </div>
          </section>

          {/* 保存/キャンセルボタン */}
          <div className="flex justify-end mt-6 space-x-4">
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-300 text-black px-6 py-3 rounded-lg shadow-md hover:bg-gray-400 transition text-base font-semibold"
              disabled={submitting}
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="bg-brand-darkBlue text-white px-8 py-3 rounded-lg shadow-md hover:bg-brand-cyan transition text-base font-semibold"
              disabled={submitting}
            >
              {submitting ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}

/**
 * 編集用テーブルコンポーネント（常設設問用）
 */
function EditableTable({ data, onChange, onDelete }) {
  return (
    <div className="overflow-x-auto border rounded-t-md">
      <table className="min-w-full text-base leading-relaxed text-gray-900 border-collapse">
        <thead className="bg-gray-50 text-gray-500 uppercase">
          <tr>
            <th scope="col" className="px-6 py-3 font-semibold text-left">
              設問ID
            </th>
            <th scope="col" className="px-6 py-3 font-semibold text-left">
              設問分類
            </th>
            <th scope="col" className="px-6 py-3 font-semibold text-left">
              設問
            </th>
            <th scope="col" className="px-6 py-3 font-semibold text-left">
              削除
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {data.map((item, index) => (
            <tr key={index} className="hover:bg-gray-100">
              {/* 設問ID（編集不可） */}
              <td className="px-6 py-2 whitespace-nowrap font-medium">
                {item.id}
              </td>
              {/* 設問分類 */}
              <td className="px-6 py-2 whitespace-nowrap">
                <input
                  type="text"
                  className="border px-2 py-1 rounded w-full"
                  value={item.category}
                  onChange={(e) => onChange(index, 'category', e.target.value)}
                />
              </td>
              {/* 設問 */}
              <td className="px-6 py-2 whitespace-normal">
                <textarea
                  className="border px-2 py-1 rounded w-full"
                  rows={2}
                  value={item.question}
                  onChange={(e) => onChange(index, 'question', e.target.value)}
                />
              </td>
              {/* 削除ボタン（最後の空行の場合は非表示） */}
              <td className="px-6 py-2 whitespace-nowrap">
                {!(
                  index === data.length - 1 &&
                  data[index].category.trim() === '' &&
                  data[index].question.trim() === ''
                ) && (
                  <button
                    type="button"
                    onClick={() => onDelete(index)}
                    className="text-red-500"
                  >
                    削除
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
