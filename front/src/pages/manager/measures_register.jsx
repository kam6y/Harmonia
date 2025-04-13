// front/src/pages/manager/measures_register.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { CSSTransition } from 'react-transition-group';
import ManagerHeader from '../../components/manager/ManagerHeader';
import StepBar from '../../components/manager/StepBar';
import Step1Content from '../../components/manager/measures/Step1Content';
import Step2Content from '../../components/manager/measures/Step2Content';
import Step3Content from '../../components/manager/measures/Step3Content';
import AssigneeModal from '../../components/manager/measures/AssigneeModal';
import AIChatBox from '../../components/manager/measures/AIChatBox';

const aiSuggestions = [
  {
    shisaku: '定期的な意見交換の場を設ける',
    actionPlan: '月1回のワークショップを開催',
    actionPlanDetail:
      'チーム全員が参加できる日時を設定し、意見を出し合える場を作ります。オンラインとオフラインの両方の参加方法を用意し、記録を残して共有します。',
  },
  // ... 他のAI施策サジェストも同様に記述
];

const defaultAssigneeList = ['田中', '鈴木', '山田', '佐藤'];

export default function MeasuresRegisterPage() {
  // クライアントサイドレンダリング検出用
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // -------------------
  // APIから取得するカテゴリー別課題データ
  // -------------------
  const [categoryIssuesData, setCategoryIssuesData] = useState({});

  useEffect(() => {
    // 例として部署IDを28に設定
    const storedDepartmentId = localStorage.getItem('department_id');
    const departmentId = storedDepartmentId ? parseInt(storedDepartmentId, 10) : 28;
    fetch(`http://localhost/api/category-issues/${departmentId}`)
      .then((res) => res.json())
      .then((data) => {
        console.log('API Response:', data);
        const issuesObject = {};
        data.forEach(item => {
          Object.keys(item).forEach(category => {
            if (issuesObject[category]) {
              issuesObject[category] = issuesObject[category].concat(item[category]);
            } else {
              issuesObject[category] = item[category];
            }
          });
        });
        setCategoryIssuesData(issuesObject);
        console.log('Updated categoryIssuesData:', issuesObject);
      })
      .catch((error) => console.error('Error fetching category issues:', error));
  }, []);

  // APIから取得したデータをもとに allChallenges を生成
  const allChallenges = useMemo(() => {
    if (!categoryIssuesData || Object.keys(categoryIssuesData).length === 0) {
      return [];
    }
    return Object.entries(categoryIssuesData).flatMap(([category, issues]) =>
      issues.map((issue, index) => ({
        id: `${category}-${index}`, // ユニークなID（カテゴリ名＋番号）
        category,
        challenge: issue,
      }))
    );
  }, [categoryIssuesData]);

  // -------------------
  // 状態管理
  // -------------------
  const [slideDirection, setSlideDirection] = useState('next');
  const [showAssigneeModal, setShowAssigneeModal] = useState(false);
  const [lastViewedMeasureIndex, setLastViewedMeasureIndex] = useState(0);
  const [isFirstVisitToStep2, setIsFirstVisitToStep2] = useState(true);
  const [aiGeneratedMeasures, setAiGeneratedMeasures] = useState({});
  const [aiRecommendedGoals, setAiRecommendedGoals] = useState(false);

  // -------------------
  // ステップ管理
  // -------------------
  const [currentStep, setCurrentStep] = useState(1);
  const [showContent, setShowContent] = useState(true);
  const [pendingStep, setPendingStep] = useState(null);

  const steps = [
    { id: 1, label: 'Step 1' },
    { id: 2, label: 'Step 2' },
    { id: 3, label: 'Step 3' },
  ];

  // -------------------
  // 各ステップ用の状態
  // -------------------
  // Step1: 課題カテゴリー & 課題選択
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedKadai, setSelectedKadai] = useState([]);

  // Step2: 施策案 & アクションプラン（複数施策対応）
  const [measures, setMeasures] = useState([
    {
      shisaku: '',
      actionPlan: '',
      dueDate: '',
      assignee: '',
      actionPlanDetail: '',
    },
  ]);
  const [currentMeasureIndex, setCurrentMeasureIndex] = useState(0);
  const [assigneeList, setAssigneeList] = useState(defaultAssigneeList);
  const [newAssignee, setNewAssignee] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Step3: 目標設定
  const [currentSatisfaction] = useState(3.3);
  const [currentExpectation] = useState(3.8);
  const [currentGap] = useState(currentExpectation - currentSatisfaction);
  const [satisfactionOffset, setSatisfactionOffset] = useState(0.0);
  const [gapOffset, setGapOffset] = useState(0.0);

  const computedTargetSatisfaction = currentSatisfaction + satisfactionOffset;
  const computedTargetGap = currentGap + gapOffset;
  const computedTargetExpectation =
      computedTargetSatisfaction + computedTargetGap;

  // -------------------
  // バリデーション
  // -------------------
  const canGoNext = () => {
    switch (currentStep) {
      case 1:
        return selectedCategory !== '' && selectedKadai.length > 0;
      case 2:
        const currentMeasure = measures[currentMeasureIndex];
        return (
          currentMeasure.shisaku.trim() !== '' &&
          currentMeasure.actionPlan.trim() !== '' &&
          currentMeasure.dueDate !== '' &&
          currentMeasure.assignee !== '' &&
          currentMeasure.actionPlanDetail.trim() !== ''
        );
      case 3:
        return !isNaN(satisfactionOffset) && !isNaN(gapOffset);
      default:
        return false;
    }
  };

  // -------------------
  // AI目標値推奨ロジック
  // -------------------
  const generateAIRecommendedGoals = () => {
    const currentMeasure = measures[currentMeasureIndex];
    let recommendedSatisfactionOffset = 0;
    let recommendedGapOffset = 0;

    if (
      currentMeasure.shisaku.includes('定期的') ||
      currentMeasure.actionPlan.includes('定期的') ||
      currentMeasure.actionPlanDetail.includes('定期的')
    ) {
      recommendedSatisfactionOffset = Math.min(1.2, 5 - currentSatisfaction);
    } else if (
      currentMeasure.shisaku.includes('改善') ||
      currentMeasure.actionPlan.includes('改善') ||
      currentMeasure.actionPlanDetail.includes('改善')
    ) {
      recommendedSatisfactionOffset = Math.min(0.8, 5 - currentSatisfaction);
    } else {
      recommendedSatisfactionOffset = Math.min(0.5, 5 - currentSatisfaction);
    }
    recommendedGapOffset = -Math.min(0.3, currentGap * 0.5);

    setSatisfactionOffset(parseFloat(recommendedSatisfactionOffset.toFixed(1)));
    setGapOffset(parseFloat(recommendedGapOffset.toFixed(1)));
    setAiRecommendedGoals(true);
  };

  // -------------------
  // ステップ遷移用関数
  // -------------------
  const handleNext = () => {
    if (currentStep < 3 && canGoNext()) {
      if (currentStep === 1) {
        // Step1からStep2への遷移時処理
      } else if (currentStep === 2) {
        setLastViewedMeasureIndex(currentMeasureIndex);
        generateAIRecommendedGoals();
      }
      setPendingStep(currentStep + 1);
      setShowContent(false);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setPendingStep(currentStep - 1);
      setShowContent(false);
    }
  };

  // -------------------
  // バックエンド送信用処理（handleFinish）
  // -------------------
  const handleFinish = () => {
    if (currentStep === 3 && canGoNext()) {
      const payload = {
        selectedCategory,
        selectedKadai,
        measures,
        currentSatisfaction,
        computedTargetSatisfaction,
        department_id: localStorage.getItem('department_id')
          ? parseInt(localStorage.getItem('department_id'), 10)
          : 1
      };

      setIsLoading(true);

      fetch('http://localhost/api/register-measure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error('送信に失敗しました。');
          }
          return res.json();
        })
        .then((data) => {
          console.log('送信成功:', data);

          // リダイレクト処理を追加
          if (data.redirect) {
            // サーバーから返されたリダイレクトURLに移動
            window.location.href = data.redirect;
          } else {
            // リダイレクトURLがない場合はデフォルト先へ
            window.location.href = '/manager/dashboard_improvement';
          }
        })
        .catch((error) => {
          console.error('送信エラー:', error);
          alert('入力完了しましたが、送信エラーが発生しました。');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  };

  const handleExited = () => {
    if (pendingStep !== null) {
      if (currentStep === 1 && pendingStep === 2) {
        setTimeout(() => {
          setIsFirstVisitToStep2(false);
        }, 1200000);
      }
      setCurrentStep(pendingStep);
      setPendingStep(null);
      setShowContent(true);
    }
  };

  // -------------------
  // 課題チェックボックスハンドラ
  // -------------------
  const handleKadaiChange = (kadaiId) => {
    if (selectedKadai.includes(kadaiId)) {
      setSelectedKadai(selectedKadai.filter((id) => id !== kadaiId));
    } else {
      setSelectedKadai([...selectedKadai, kadaiId]);
    }
  };

  // -------------------
  // 施策関連のハンドラ
  // -------------------
  const updateMeasure = (field, value) => {
    const updatedMeasures = [...measures];
    updatedMeasures[currentMeasureIndex][field] = value;
    setMeasures(updatedMeasures);
  };

  const handleAddAssignee = () => {
    if (newAssignee.trim() === '') return;
    setAssigneeList([...assigneeList, newAssignee.trim()]);
    setNewAssignee('');
  };

  const handlePrevMeasure = () => {
    if (currentMeasureIndex > 0) {
      setSlideDirection('prev');
      setCurrentMeasureIndex(currentMeasureIndex - 1);
    }
  };

  const handleNextMeasure = () => {
    if (currentMeasureIndex < measures.length - 1) {
      setSlideDirection('next');
      setCurrentMeasureIndex(currentMeasureIndex + 1);
    }
  };

  const handleGenerateNewMeasure = () => {
    setIsLoading(true);
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * aiSuggestions.length);
      const suggestion = aiSuggestions[randomIndex];
      const newMeasure = {
        shisaku: suggestion.shisaku,
        actionPlan: suggestion.actionPlan,
        dueDate: '',
        assignee: '',
        actionPlanDetail: suggestion.actionPlanDetail,
      };
      const newIndex = measures.length;
      setMeasures([...measures, newMeasure]);
      setAiGeneratedMeasures((prev) => ({
        ...prev,
        [newIndex]: true,
      }));
      setCurrentMeasureIndex(newIndex);
      setIsLoading(false);
      setSlideDirection('next');
    }, 1500);
  };

  const isCurrentMeasureAIGenerated = () => {
    return aiGeneratedMeasures[currentMeasureIndex] === true;
  };

  return (
    <div className="pb-4 min-h-screen bg-brand-lightGray text-brand-darkBlue">
      <ManagerHeader showNav={false} />
      <div className="pt-16">
        <StepBar currentStep={currentStep} steps={steps} />
      </div>
      <div
        id="main-content"
        className="max-w-4xl mx-auto mb-4 p-6 bg-white rounded shadow-md relative overflow-hidden transition-all"
      >
        <CSSTransition
          in={showContent}
          timeout={300}
          classNames="fade"
          unmountOnExit
          onExited={handleExited}
        >
          <div>
            {currentStep === 1 && (
              <Step1Content
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                selectedKadai={selectedKadai}
                setSelectedKadai={setSelectedKadai}
                handleKadaiChange={handleKadaiChange}
                handleNext={handleNext}
                canGoNext={canGoNext}
                allChallenges={allChallenges}
              />
            )}

            {currentStep === 2 && (
              <Step2Content
                selectedCategory={selectedCategory}
                selectedKadai={selectedKadai}
                currentSatisfaction={currentSatisfaction}
                currentExpectation={currentExpectation}
                currentGap={currentGap}
                computedTargetSatisfaction={computedTargetSatisfaction}
                computedTargetExpectation={computedTargetExpectation}
                computedTargetGap={computedTargetGap}
                currentMeasure={measures[currentMeasureIndex]}
                currentMeasureIndex={currentMeasureIndex}
                measures={measures}
                updateMeasure={updateMeasure}
                setShowAssigneeModal={setShowAssigneeModal}
                assigneeList={assigneeList}
                handlePrevMeasure={handlePrevMeasure}
                handleNextMeasure={handleNextMeasure}
                handleGenerateNewMeasure={handleGenerateNewMeasure}
                isLoading={isLoading}
                slideDirection={slideDirection}
                handlePrev={handlePrev}
                handleNext={handleNext}
                canGoNext={canGoNext()}
                isFirstVisit={isFirstVisitToStep2}
                isAIGenerated={isCurrentMeasureAIGenerated()}
              />
            )}

            {currentStep === 3 && (
              <Step3Content
                selectedCategory={selectedCategory}
                selectedKadai={selectedKadai}
                currentSatisfaction={currentSatisfaction}
                currentExpectation={currentExpectation}
                currentGap={currentGap}
                computedTargetSatisfaction={computedTargetSatisfaction}
                computedTargetExpectation={computedTargetExpectation}
                computedTargetGap={computedTargetGap}
                measures={measures}
                lastViewedMeasureIndex={lastViewedMeasureIndex}
                satisfactionOffset={satisfactionOffset}
                gapOffset={gapOffset}
                setSatisfactionOffset={setSatisfactionOffset}
                setGapOffset={setGapOffset}
                handlePrev={handlePrev}
                handleFinish={handleFinish}
                canGoNext={canGoNext()}
                aiRecommended={aiRecommendedGoals}
              />
            )}
          </div>
        </CSSTransition>
      </div>
      {isMounted && <AIChatBox />}
      {isMounted && showAssigneeModal && (
        <AssigneeModal
          newAssignee={newAssignee}
          setNewAssignee={setNewAssignee}
          handleAddAssignee={handleAddAssignee}
          onClose={() => setShowAssigneeModal(false)}
        />
      )}
      <style jsx global>{`
        .fade-enter {
          opacity: 0;
          display: none;
        }
        .fade-enter-active {
          display: block;
          opacity: 1;
          transition: opacity 300ms ease-in-out;
          transition-delay: 300ms;
        }
        .fade-exit {
          opacity: 1;
        }
        .fade-exit-active {
          opacity: 0;
          transition: opacity 300ms ease-in-out;
        }
        /* カードスライドアニメーション - 前へ移動時 */
        .card-slide-prev-enter,
        .card-slide-prev-appear {
          opacity: 0;
          transform: translateX(-100px);
        }
        .card-slide-prev-enter-active,
        .card-slide-prev-appear-active {
          opacity: 1;
          transform: translateX(0);
          transition: opacity 300ms, transform 300ms;
        }
        .card-slide-prev-exit {
          opacity: 1;
          transform: translateX(0);
        }
        .card-slide-prev-exit-active {
          opacity: 0;
          transform: translateX(100px);
          transition: opacity 300ms, transform 300ms;
        }
        /* カードスライドアニメーション - 次へ移動時 */
        .card-slide-next-enter,
        .card-slide-next-appear {
          opacity: 0;
          transform: translateX(100px);
        }
        .card-slide-next-enter-active,
        .card-slide-next-appear-active {
          opacity: 1;
          transform: translateX(0);
          transition: opacity 300ms, transform 300ms;
        }
        .card-slide-next-exit {
          opacity: 1;
          transform: translateX(0);
        }
        .card-slide-next-exit-active {
          opacity: 0;
          transform: translateX(-100px);
          transition: opacity 300ms, transform 300ms;
        }
        /* フェードイン用アニメーション */
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-in-out;
        }
        /* メインコンテンツのトランジション */
        #main-content {
          transition: transform 0.3s ease-in-out, width 0.3s ease-in-out;
          margin: 0 auto;
        }
        /* 縦書きテキスト用 */
        .vertical-text {
          writing-mode: vertical-rl;
          text-orientation: upright;
          letter-spacing: 0.1em;
        }
      `}</style>
    </div>
  );
}

