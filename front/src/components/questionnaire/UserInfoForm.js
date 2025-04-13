import { useState, useEffect } from 'react'

const UserInfoForm = ({
  userType,
  userInfo,
  setUserInfo,
  onNext,
  tenantId,
  onSetDepartmentName,
}) => {
  const [level1Options, setLevel1Options] = useState([])
  const [level2Options, setLevel2Options] = useState([])
  const [level3Options, setLevel3Options] = useState([])

  const [selectedLevel1, setSelectedLevel1] = useState(
    userInfo?.departmentLevel1 || ''
  )
  const [selectedLevel2, setSelectedLevel2] = useState(
    userInfo?.departmentLevel2 || ''
  )
  const [selectedLevel3, setSelectedLevel3] = useState(
    userInfo?.departmentLevel3 || ''
  )

  const [email, setEmail] = useState(userInfo.email || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [validationError, setValidationError] = useState('')

  // URLからのテナントIDに基づいて組織を取得
  useEffect(() => {
    const fetchTopLevelDepartments = async () => {
      // tenantIdが未定義または空文字の場合は何もしない
      if (!tenantId) {
        console.log('テナントIDが未定義です')
        return
      }

      setLoading(true)
      setError(null)

      try {
        console.log(`テナントID: ${tenantId} の部門を取得します`)

        // テナントIDに基づいてトップレベル部門を取得
        const tenantRes = await fetch(
          `http://localhost/api/departments/${tenantId}`,
          {
            headers: {
              'Cache-Control': 'no-cache',
              Pragma: 'no-cache',
            },
          }
        )

        if (!tenantRes.ok) {
          throw new Error(`テナント部門取得API エラー: ${tenantRes.status}`)
        }

        const data = await tenantRes.json()
        console.log(`テナント${tenantId}の部門:`, data)

        if (Array.isArray(data) && data.length > 0) {
          // データの各項目をデバッグ表示
          data.forEach((dept, index) => {
            console.log(`部門${index}:`, dept)
          })
          setLevel1Options(data)
        } else {
          console.log('部門データが空です')
          setLevel1Options([])
        }
      } catch (error) {
        console.error('組織構造の取得エラー:', error)
        setError(error.message)
        setLevel1Options([])
      } finally {
        setLoading(false)
      }
    }

    fetchTopLevelDepartments()
  }, [tenantId])

  // 第2階層の部門取得
  const fetchSecondLevel = async (parentId) => {
    if (!parentId) {
      setLevel2Options([])
      setSelectedLevel2('')
      return
    }

    setLoading(true)
    try {
      console.log(`親部門ID: ${parentId} の子部門を取得します`)
      const res = await fetch(
        `http://localhost/api/departments/${parentId}/children`,
        {
          headers: {
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
          },
        }
      )

      if (!res.ok) {
        throw new Error(`第二階層組織の取得に失敗しました: ${res.status}`)
      }

      const data = await res.json()
      console.log('子部門:', data)

      // データが配列であることを確認
      if (Array.isArray(data)) {
        setLevel2Options(data)
      } else {
        console.warn('子部門データが配列ではありません:', data)
        setLevel2Options([])
      }
    } catch (error) {
      console.error('第二階層取得エラー:', error)
      setError(`子部門の取得中にエラーが発生しました: ${error.message}`)
      setLevel2Options([])
    } finally {
      setLoading(false)
    }
  }

  // 第3階層の部門取得
  const fetchThirdLevel = async (parentId) => {
    if (!parentId) {
      setLevel3Options([])
      setSelectedLevel3('')
      return
    }

    setLoading(true)
    try {
      console.log(`親部門ID: ${parentId} の子部門を取得します`)
      const res = await fetch(
        `http://localhost/api/departments/${parentId}/children`,
        {
          headers: {
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
          },
        }
      )

      if (!res.ok) {
        throw new Error(`第三階層組織の取得に失敗しました: ${res.status}`)
      }

      const data = await res.json()
      console.log('孫部門:', data)

      if (Array.isArray(data)) {
        setLevel3Options(data)
      } else {
        console.warn('孫部門データが配列ではありません:', data)
        setLevel3Options([])
      }
    } catch (error) {
      console.error('第三階層取得エラー:', error)
      setError(`孫部門の取得中にエラーが発生しました: ${error.message}`)
      setLevel3Options([])
    } finally {
      setLoading(false)
    }
  }

  // 第1階層部門選択時の処理
  const handleLevel1Change = (e) => {
    const value = e.target.value
    console.log('部署1選択変更:', value)

    setSelectedLevel1(value)
    setSelectedLevel2('')
    setSelectedLevel3('')

    // 部署名の設定
    if (value) {
      const selectedDept = level1Options.find(
        (dept) => dept.id.toString() === value.toString()
      )
      if (selectedDept && onSetDepartmentName) {
        console.log(`第1階層部署名設定: ${selectedDept.name}`)
        try {
          onSetDepartmentName('level1', value, selectedDept.name)
        } catch (err) {
          console.error('部署名設定エラー:', err)
        }
      }

      // 子部門取得
      fetchSecondLevel(value)
    } else {
      setLevel2Options([])
      setLevel3Options([])
    }
  }

  // 第2階層部門選択時の処理
  const handleLevel2Change = (e) => {
    const value = e.target.value
    console.log('部署2選択変更:', value)

    setSelectedLevel2(value)
    setSelectedLevel3('')

    // 部署名の設定
    if (value) {
      const selectedDept = level2Options.find(
        (dept) => dept.id.toString() === value.toString()
      )
      if (selectedDept && onSetDepartmentName) {
        console.log(`第2階層部署名設定: ${selectedDept.name}`)
        try {
          onSetDepartmentName('level2', value, selectedDept.name)
        } catch (err) {
          console.error('部署名設定エラー:', err)
        }
      }

      // 子部門取得
      fetchThirdLevel(value)
    } else {
      setLevel3Options([])
    }
  }

  // 第3階層部門選択時の処理
  const handleLevel3Change = (e) => {
    const value = e.target.value
    console.log('部署3選択変更:', value)

    setSelectedLevel3(value)

    // 部署名の設定
    if (value) {
      const selectedDept = level3Options.find(
        (dept) => dept.id.toString() === value.toString()
      )
      if (selectedDept && onSetDepartmentName) {
        console.log(`第3階層部署名設定: ${selectedDept.name}`)
        try {
          onSetDepartmentName('level3', value, selectedDept.name)
        } catch (err) {
          console.error('部署名設定エラー:', err)
        }
      }
    }
  }

  const validateForm = () => {
    setValidationError('')

    if (!selectedLevel1) {
      setValidationError('部署（1階層目）を選択してください')
      return false
    }

    // 2階層目の選択肢があるのに選択されていない場合
    if (level2Options.length > 0 && !selectedLevel2) {
      setValidationError('部署（2階層目）を選択してください')
      return false
    }

    // 3階層目の選択肢があるのに選択されていない場合
    if (level3Options.length > 0 && !selectedLevel3) {
      setValidationError('部署（3階層目）を選択してください')
      return false
    }

    // 管理職の場合はメールアドレスが必須
    if (userType === 'manager') {
      if (!email || !email.trim()) {
        setValidationError('メールアドレスを入力してください')
        return false
      }

      // 簡易的なメールアドレス形式チェック
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        setValidationError('有効なメールアドレスを入力してください')
        return false
      }
    }

    return true
  }

  const handleSubmit = () => {
    // 入力チェック
    if (!validateForm()) {
      return
    }

    setUserInfo({
      departmentLevel1: selectedLevel1,
      departmentLevel2: selectedLevel2,
      departmentLevel3: selectedLevel3,
      email: email,
    })

    console.log('送信する情報:', {
      departmentLevel1: selectedLevel1,
      departmentLevel2: selectedLevel2,
      departmentLevel3: selectedLevel3,
      email: email,
    })

    onNext()
  }

  return (
    <div className="px-12 rounded-lg text-black">
      {/* タイトルをカード外に移動 */}
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center text-brand-darkBlue">
        STEP2 あなたの情報を入力してください。
      </h2>
      <div className="w-32 h-1 bg-brand-teal mx-auto mb-8 rounded-full opacity-60"></div>

      {/* バリデーションエラー表示 */}
      {validationError && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 text-center">
          <p>{validationError}</p>
        </div>
      )}

      <div className="bg-white p-8 rounded-lg shadow-xl">
        {/* 1階層目 */}
        <div className="mb-6">
          <label className="block mb-2 text-lg font-semibold text-gray-700">
            部署 (1階層目)<span className="text-red-600 ml-1">*</span>
          </label>
          <select
            value={selectedLevel1}
            onChange={handleLevel1Change}
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-darkBlue"
            disabled={loading || level1Options.length === 0}
            required
          >
            <option value="">-- 選択してください --</option>
            {level1Options.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
          {level1Options.length === 0 && !loading && (
            <p className="text-sm text-red-500 mt-1">
              選択可能な部署がありません
            </p>
          )}
        </div>

        {/* 2階層目 */}
        {level2Options.length > 0 && (
          <div className="mb-6">
            <label className="block mb-2 text-lg font-semibold text-gray-700">
              部署 (2階層目)<span className="text-red-600 ml-1">*</span>
            </label>
            <select
              value={selectedLevel2}
              onChange={handleLevel2Change}
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-darkBlue"
              disabled={loading}
              required
            >
              <option value="">-- 選択してください --</option>
              {level2Options.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 3階層目 */}
        {level3Options.length > 0 && (
          <div className="mb-6">
            <label className="block mb-2 text-lg font-semibold text-gray-700">
              部署 (3階層目)<span className="text-red-600 ml-1">*</span>
            </label>
            <select
              value={selectedLevel3}
              onChange={handleLevel3Change}
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-darkBlue"
              disabled={loading}
              required
            >
              <option value="">-- 選択してください --</option>
              {level3Options.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {loading && (
          <div className="mb-4 text-center text-gray-600">
            データを読み込み中...
          </div>
        )}

        {error && (
          <div className="mb-4 p-2 bg-red-50 text-red-600 rounded border border-red-200">
            <p>エラーが発生しました: {error}</p>
            <p className="text-sm mt-1">
              続行するには、部署を選択してください。
            </p>
          </div>
        )}

        {/* メールアドレス - 管理職のみ表示 */}
        {userType === 'manager' && (
          <div className="mb-6">
            <label className="block mb-2 text-lg font-semibold text-gray-700">
              メールアドレス<span className="text-red-600 ml-1">*</span>
            </label>
            <input
              type="email"
              placeholder="例: taro.yamada@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-darkBlue"
              required
            />
          </div>
        )}
      </div>

      {/* 次へボタン */}
      <button
        onClick={handleSubmit}
        className="w-full py-3 mt-6 bg-brand-darkBlue text-white font-semibold rounded-full hover:bg-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-darkBlue transition duration-200"
        disabled={loading}
      >
        次へ
      </button>
    </div>
  )
}

export default UserInfoForm
