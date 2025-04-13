import { useState } from 'react'
import { useRouter } from 'next/router'
import AdminHeader from '@/components/admin/AdminHeader'
import axios from 'axios'

export default function AdminTenantsRegisterPage() {
  const router = useRouter()

  // ★ バックエンドURLの設定
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost'

  // フォーム入力状態
  const [companyName, setCompanyName] = useState('')
  const [domain, setDomain] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  
  // バリデーション関数
  const validateForm = () => {
    const newErrors = {}
    
    if (!companyName.trim()) {
      newErrors.companyName = '社名を入力してください'
    }
    
    if (!domain.trim()) {
      newErrors.domain = 'メールアドレスを入力してください'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(domain)) {
      newErrors.domain = '有効なメールアドレスを入力してください'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // フォーム送信時の処理
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // バリデーション
    if (!validateForm()) {
      return
    }
    
    try {
      setSubmitting(true)
      
      // APIを呼び出してテナントを登録
      const response = await axios.post(`${BACKEND_URL}/api/admin/tenants`, {
        name: companyName,
        mail_address: domain,
      })
      
      if (response.data.success) {
        // 成功時の処理
        alert('テナントを登録しました！')
        router.push('/admin/tenants')
      } else {
        // APIからエラーメッセージがある場合
        alert('登録に失敗しました: ' + (response.data.message || '不明なエラー'))
      }
    } catch (error) {
      console.error('テナント登録エラー:', error)
      
      // エラーレスポンスがある場合はそのメッセージを表示
      if (error.response && error.response.data) {
        if (error.response.data.errors) {
          // バリデーションエラーの場合
          setErrors(error.response.data.errors)
        } else {
          alert('登録に失敗しました: ' + (error.response.data.message || '不明なエラー'))
        }
      } else {
        alert('テナント登録中にエラーが発生しました。ネットワーク接続を確認してください。')
      }
    } finally {
      setSubmitting(false)
    }
  }

  // キャンセル時は一覧画面へ戻る
  const handleCancel = () => {
    router.push('/admin/tenants')
  }

  return (
    <div className="min-h-screen bg-brand-lightGray">
      {/* ヘッダー */}
      <div className="bg-white">
        <AdminHeader />
      </div>

      {/* カードコンテナ */}
      <div className="mx-auto p-16">
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          {/* テナント追加・検索・フィルター */}
          <div className="flex justify-between mb-2">
            <h2 className="text-3xl mt-2 pl-2 font-bold text-brand-darkBlue">
              テナント登録
            </h2>
          </div>
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
            <p className='text-black my-2'>登録された時点で代表者メールアドレスにメールが送付されます。</p>
            {/* 社名 */}
            <div className="mb-4">
              <label
                htmlFor="companyName"
                className="block text-brand-darkBlue font-bold mb-2"
              >
                社名
              </label>
              <input
                type="text"
                id="companyName"
                placeholder="例: 株式会社A"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className={`w-full border ${
                  errors.companyName ? 'border-red-500' : 'border-gray-300'
                } rounded px-3 py-2 bg-white text-black focus:outline-none focus:border-brand-cyan`}
              />
              {errors.companyName && (
                <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>
              )}
            </div>
            {/* ドメイン */}
            <div className="mb-4">
              <label
                htmlFor="domain"
                className="block text-brand-darkBlue font-bold mb-2"
              >
                代表者メールアドレス
              </label>
              <input
                type="email"
                id="domain"
                placeholder="例: user@example.co.jp"
                required
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className={`w-full border ${
                  errors.domain ? 'border-red-500' : 'border-gray-300'
                } rounded px-3 py-2 bg-white text-black focus:outline-none focus:border-brand-cyan`}
              />
              {errors.domain && (
                <p className="text-red-500 text-sm mt-1">{errors.domain}</p>
              )}
            </div>
            {/* 必要に応じてその他の入力項目を追加 */}

            {/* ボタン群 */}
            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                onClick={handleCancel}
                className="rounded px-4 py-2 text-base font-semibold bg-gray-300 text-black hover:bg-gray-400 transition"
                disabled={submitting}
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="rounded px-4 py-2 text-base font-semibold bg-brand-cyan text-white hover:bg-brand-teal transition"
                disabled={submitting}
              >
                {submitting ? '登録中...' : '登録'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}