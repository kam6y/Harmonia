import { useState, useEffect, useRef } from 'react'
import ProgressBar from '../common/ProgressBar'
import Intro from './Intro'
import UserTypeSelection from './UserTypeSelection'
import NextButton from '../common/NextButton'
import ExpectedQuestion from './ExpectedQuestion'
import RealQuestion from './RealQuestion'

const PulseQuiz = ({ step, setStep, surveytype, tenantId, instanceId }) => {
  const [userType, setUserType] = useState(null)
  const [userInfo, setUserInfo] = useState({
    departmentLevel1: '',
    departmentLevel2: '',
    departmentLevel3: '',
    email: '',
  })

  // 部署名を保持するための状態
  const [departmentNames, setDepartmentNames] = useState({
    level1: '',
    level2: '',
    level3: '',
  })

  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState([])
  const expectedRefs = useRef([])
  const satisfactionRefs = useRef([])
  const satisfactionTopRef = useRef(null)

  // インスタンスIDから部門情報を取得
  useEffect(() => {
    const fetchDepartmentInfo = async () => {
      try {
        // パルスサーベイインスタンスから部門情報を取得
        const res = await fetch(
          `http://localhost/api/pulse-survey-instances/${instanceId}`
        )

        if (!res.ok) {
          throw new Error(`HTTPエラー: ${res.status}`)
        }

        const data = await res.json()

        // 部門IDを設定
        setUserInfo((prev) => ({
          ...prev,
          departmentLevel1: data.department_id.toString(),
        }))

        // 部門名を設定
        setDepartmentNames((prev) => ({
          ...prev,
          level1: data.department_name,
        }))
      } catch (error) {
        console.error('部門情報取得失敗:', error)
        alert('部門情報の取得に失敗しました。管理者に連絡してください。')
      }
    }

    if (instanceId) {
      fetchDepartmentInfo()
    }
  }, [instanceId])

  useEffect(() => {
    // tenantId, instanceId が取得できるまで待つ
    if (!tenantId || !instanceId) return

    const fetchQuestions = async () => {
      try {
        // パルスサーベイ専用のエンドポイント
        const res = await fetch(
          `http://localhost/api/pulse-survey-questions/${tenantId}/${instanceId}`
        )

        if (!res.ok) {
          throw new Error(`HTTPエラー: ${res.status}`)
        }

        const data = await res.json()
        setQuestions(data.questions)
        setAnswers(
          data.questions.map(() => ({
            expectation: null,
            satisfaction: null,
          }))
        )
      } catch (error) {
        console.error('データ取得失敗:', error)
        alert('質問の取得に失敗しました。管理者に連絡してください。')
      }
    }
    

    fetchQuestions()
  }, [tenantId, instanceId])

  useEffect(() => {
    // Step 4が最初に表示されたときに、ページ最上部にスクロール
    if (step === 4 && satisfactionTopRef.current) {
      // わずかに上にずらすためのオフセット
      const yOffset = -200; // マイナスの値で上にずらす（ピクセル単位）
      const element = satisfactionTopRef.current;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      
      window.scrollTo({
        top: y,
      });
    }
  }, [step]);

  // 期待度の質問への回答がすべて完了しているか確認する関数
  const isExpectationComplete = () => {
    if (questions.length === 0) return false
    return answers.every((answer) => answer.expectation !== null)
  }

  // 満足度の質問への回答がすべて完了しているか確認する関数
  const isSatisfactionComplete = () => {
    if (questions.length === 0) return false
    return answers.every((answer) => answer.satisfaction !== null)
  }

  // ステップを進める関数（バリデーション付き）
  const goToNextStep = (currentStep, nextStep) => {
    // 期待度ステップから満足度ステップへ進む場合
    if (currentStep === 3 && nextStep === 4) {
      if (isExpectationComplete()) {
        setStep(nextStep)
      } else {
        alert('すべての期待度の質問に回答してください。')
      }
    }
    // 満足度ステップから送信ステップへ進む場合
    else if (currentStep === 4 && nextStep === 5) {
      if (isSatisfactionComplete()) {
        setStep(nextStep)
      } else {
        alert('すべての満足度の質問に回答してください。')
      }
    }
    // その他のステップ移動（バリデーションなし）
    else {
      setStep(nextStep)
    }
  }

  const handleExpectationChange = (questionIndex, value) => {
    const newAnswers = [...answers]
    newAnswers[questionIndex] = {
      ...newAnswers[questionIndex],
      expectation: value,
    }
    setAnswers(newAnswers)
    const nextIndex = questionIndex + 1
    if (nextIndex < questions.length) {
      const targetEl = expectedRefs.current[nextIndex]
      if (targetEl) {
        targetEl.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
      }
    }
  }

  const handleSatisfactionChange = (questionIndex, value) => {
    const newAnswers = [...answers]
    newAnswers[questionIndex] = {
      ...newAnswers[questionIndex],
      satisfaction: value,
    }
    setAnswers(newAnswers)
    const nextIndex = questionIndex + 1
    if (nextIndex < questions.length) {
      const targetEl = satisfactionRefs.current[nextIndex]
      if (targetEl) {
        targetEl.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
      }
    }
  }

  const handleSubmit = async () => {
    try {
      // 回答データの整形
      const formattedAnswers = questions.map((q, index) => ({
        survey_question_id: q.id,
        actual_value: answers[index].satisfaction,
        expected_value: answers[index].expectation,
      }));
  
      // APIに送信するデータの準備
      const submitData = {
        tenant_id: parseInt(tenantId),
        instance_id: parseInt(instanceId),
        is_manager: userType === 'manager',
        manager_email: userType === 'manager' ? userInfo.email : null,
        answers: formattedAnswers,
      };
  
      // パルスサーベイ専用のエンドポイント
      const response = await fetch('http://localhost/api/pulse-survey-responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
        },
        body: JSON.stringify(submitData),
      });
  
      const responseData = await response.json();
  
      if (!response.ok) {
        console.error('APIエラー:', responseData);
        throw new Error(responseData.message || '回答の送信に失敗しました');
      }
      
      // 完了画面へ移動
      setStep(6);
    } catch (error) {
      console.error('送信エラー:', error);
      alert(`回答の送信中にエラーが発生しました: ${error.getMessage()}`);
    }
  }

  let progress = 0
  if (answers.length > 0) {
    if (step === 3) {
      // step 3の場合は期待度の回答率を計算
      progress = Math.round(
        (answers.filter((a) => a.expectation !== null).length /
          questions.length) *
          100
      )
    } else if (step === 4) {
      // step 4の場合は満足度の回答率を計算
      progress = Math.round(
        (answers.filter((a) => a.satisfaction !== null).length /
          questions.length) *
          100
      )
    }
  }

  // 部署名を整形する関数
  const formatDepartmentNames = () => {
    const parts = []
    if (departmentNames.level1) parts.push(departmentNames.level1)
    if (departmentNames.level2) parts.push(departmentNames.level2)
    if (departmentNames.level3) parts.push(departmentNames.level3)

    return parts.join(' > ')
  }

  return (
    <div className="min-h-[calc(100vh-48px)] flex flex-col">
      {/* Progress Indicator for Expectation and Satisfaction Steps */}
      {(step === 3 || step === 4) && (
        <div className="sticky top-12 z-50 bg-white shadow-md p-2 flex justify-center items-center w-full">
          <div className="text-base font-semibold text-gray-900 mr-4">
            {step === 3 ? '期待度評価' : '満足度評価'}
          </div>
          <div className="flex-grow max-w-2xl">
            <ProgressBar progress={progress} />
          </div>
          <div className="text-base font-semibold text-gray-900 ml-4">
            {progress}% 完了
          </div>
        </div>
      )}

      {/* Main Content Container */}
      <div
        className={`
        max-w-4xl mx-auto rounded-md 
        ${step === 3 || step === 4 ? 'mt-5 pt-4 pb-10 px-6' : 'mt-20 p-6'}
      `}
      >
        {/* Step 0: Introduction */}
        {step === 0 && <Intro onNext={() => setStep(1)} surveyType="pulse" />}

        {/* Step 1: User Type Selection */}
        {step === 1 && (
          <UserTypeSelection onSelect={setUserType} onNext={() => setStep(2)} />
        )}

        {/* Step 2: Department Information Confirmation */}
        {step === 2 && (
          <div className="px-12 rounded-lg text-black">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-center text-brand-darkBlue flex-grow">
                STEP2 部門情報の確認
              </h2>
              <div className="w-6"></div> {/* スペーサー */}
            </div>
            <div className="w-32 h-1 bg-brand-teal mx-auto mb-8 rounded-full opacity-60"></div>

            <div className="bg-white p-8 rounded-lg shadow-xl w-[50vw]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 部門情報カード */}
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 mr-2 text-brand-teal"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 4v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                    部署情報
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">部署名</span>
                      <span className="font-medium text-gray-900">
                        {departmentNames.level1}
                      </span>
                    </div>
                    {departmentNames.level2 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">サブ部署</span>
                        <span className="font-medium text-gray-900">
                          {departmentNames.level2}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* サーベイ情報カード */}
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 mr-2 text-brand-teal"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12l-3 3m0 0l-3-3m3 3V9"
                      />
                    </svg>
                    サーベイ詳細
                  </h3>
                  <div className="space-y-2">
                    <div className="flex">
                      <span className="text-gray-600">開始日</span>
                      <span className="font-medium text-gray-900">
                        {new Date().toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* メールアドレス入力（管理職の場合） */}
              {userType === 'manager' && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    メールアドレス
                  </label>
                  <input
                    type="email"
                    value={userInfo.email}
                    onChange={(e) =>
                      setUserInfo((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    placeholder="メールアドレスを入力してください"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-teal"
                  />
                </div>
              )}

              {/* 次へボタン */}
              <div className="flex justify-center">
                <button
                  onClick={() => {
                    // 管理職の場合はメールアドレスのバリデーション
                    if (userType === 'manager') {
                      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                      if (!userInfo.email || !emailRegex.test(userInfo.email)) {
                        alert('有効なメールアドレスを入力してください')
                        return
                      }
                    }
                    // バリデーションを通過したら次のステップへ
                    setStep(3)
                  }}
                  className={`
                    w-1/2 py-3 mt-6 rounded-full mx-auto  transition-all duration-200
                    ${
                      userType
                        ? 'bg-brand-darkBlue text-white hover:bg-brand-cyan'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }
                  `}
                  disabled={!userType}
                >
                  次へ
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Expectation Ratings */}
        {step === 3 && (
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-center text-brand-darkBlue flex-grow mb-8">
              STEP3 組織に対する期待度を5段階で教えてください！
            </h2>
            {questions.map((q, i) => (
              <ExpectedQuestion
                key={q.id}
                questionIndex={i}
                question={q}
                currentValue={answers[i]?.expectation}
                onChange={handleExpectationChange}
                forwardRef={(el) => (expectedRefs.current[i] = el)}
              />
            ))}
            <div className="flex justify-between mt-8">
              <NextButton onClick={() => setStep(2)}>戻る</NextButton>
              <NextButton onClick={() => goToNextStep(3, 4)}>次へ</NextButton>
            </div>
          </div>
        )}

        {/* Step 4: Satisfaction Ratings */}
        {step === 4 && (
          <div>
            <h2
              ref={satisfactionTopRef}
              className="text-2xl md:text-3xl font-bold text-center text-brand-darkBlue flex-grow mb-8"
            >
              STEP4 組織に対する実際の満足度を5段階で教えてください
            </h2>
            {questions.map((q, i) => (
              <RealQuestion
                key={q.id}
                questionIndex={i}
                question={q}
                currentValue={answers[i]?.satisfaction}
                onChange={handleSatisfactionChange}
                ref={(el) => (satisfactionRefs.current[i] = el)}
              />
            ))}
            <div className="flex justify-between mt-8">
              <NextButton onClick={() => setStep(3)}>戻る</NextButton>
              <NextButton onClick={() => goToNextStep(4, 5)}>次へ</NextButton>
            </div>
          </div>
        )}

        {/* Step 5: Confirmation */}
        {step === 5 && (
          <div className="p-6">
                <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center text-brand-darkBlue">
                  STEP5 回答内容の送信
                </h2>

            <div className="bg-white shadow-lg border border-brand-lightGray rounded-3xl p-8 max-w-5xl mx-auto">
              <div className="mb-8">
                <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                  <p className="text-lg mb-3 font-medium text-black">回答者情報</p>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <p className="text-gray-700 mb-2">
                      部署: {formatDepartmentNames()}
                    </p>
                    {userType === 'manager' && userInfo.email && (
                      <p className="text-gray-700">
                        メールアドレス: {userInfo.email}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <p className="mb-8 text-xl text-center text-gray-700">
                回答内容を送信してよろしいですか？
              </p>

              <div className="grid md:grid-cols-2 gap-6 max-w-xl mx-auto">
                <button
                  onClick={() => setStep(4)}
                  className="w-full py-3 bg-brand-darkBlue text-white font-semibold rounded-full hover:bg-brand-cyan transition duration-200"
                >
                  戻る
                </button>
                <button
                  onClick={handleSubmit}
                  className="w-full py-3 bg-brand-orange text-white font-semibold rounded-full hover:bg-brand-coral flex items-center justify-center transition duration-200"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  送信する
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Completion */}
        {step === 6 && (
          <div className="p-8 bg-white rounded-3xl shadow-lg border border-brand-lightGray text-center">
            <div className="mb-8 flex justify-center">
              <div className="bg-green-100 p-4 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 text-brand-teal"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>

            <h2 className="text-3xl font-bold mb-4 text-brand-darkBlue">
              回答完了
            </h2>

            <p className="mb-8 text-xl text-gray-700">
              ご回答いただき、誠にありがとうございました！
            </p>

            <p className="mb-10 text-gray-600 max-w-2xl mx-auto">
              いただいた貴重なご意見は、部門の課題改善に活用させていただきます。
              引き続き、よろしくお願いいたします。
            </p>

            <div className="max-w-sm mx-auto">
              <button
                onClick={() => setStep(0)}
                className="w-full py-3 bg-brand-darkBlue text-white font-semibold rounded-full hover:bg-brand-cyan transition duration-200"
              >
                トップページへ戻る
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PulseQuiz
