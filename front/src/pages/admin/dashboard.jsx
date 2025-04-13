// pages/admin/dashboard.jsx
import { useState, useEffect } from 'react'
import AdminHeader from '@/components/admin/AdminHeader'
import AnalysisImprovementHeader from '@/components/common/AnalysisImprovementHeader'
import QuestionnaireScore from '@/components/common/QuestionnaireScore'
import ResponseRateComponent from '@/components/personnel/ResponseRateComponent'
import QuadrantMatrix from '@/components/manager/4QuadrantMatrix'
import QuadrantMatrixDetails from '../../components/manager/QuadrantMatrixDetails'
import EmployeeSatisfactionHeatmap from '../../components/common/EmployeeSatisfactionHeatmap'
import EngagementSurveyChart from '../../components/common/EngagementSurveyChart'

// 統一されたカテゴリ配列（質問項目・ヒートマップ項目として共通利用）
const unifiedCategories = [
  { id: 1, category: '顧客基盤の安定性' },
  { id: 2, category: '理念戦略への納得感' },
  { id: 3, category: '社会的貢献' },
  { id: 4, category: '責任と顧客・社会への貢献' },
  { id: 5, category: '連帯感と相互尊重' },
  { id: 6, category: '魅力的な上司' },
  { id: 7, category: '勤務地や会社設備の魅力' },
  { id: 8, category: '評価・給与と柔軟な働き方' },
  { id: 9, category: '顧客ニーズや事業戦略の伝達' },
  { id: 10, category: '上司や会社からの理解' },
  { id: 11, category: '公平な評価' },
  { id: 12, category: '上司からの適切な教育・支援' },
  { id: 13, category: '顧客の期待を上回る提案' },
  { id: 14, category: '具体的な目標の共有' },
  { id: 15, category: '未来に向けた活動' },
  { id: 16, category: 'ナレッジの標準化' },
];

// ResponseRateComponent用データ追加
// 部署データ - 回答率が低い部署リスト
const lowRateDepartments = [
  { id: 1, name: '営業部営業課', rate: 10 },
  { id: 2, name: '開発部開発課', rate: 30 },
  { id: 3, name: '組織マネジメント部', rate: 45 },
  { id: 4, name: 'フルーツジッパー', rate: 40 },
];

// 会社全体の組織図データ
const fullOrgData = {
  id: 'root',
  name: '会社全体',
  rate: 65,
  children: [
    {
      id: 'admin',
      name: '管理本部',
      rate: 80,
      children: [
        { 
          id: 'hr', 
          name: '人事部', 
          rate: 60, 
          children: [
            { id: 'hr-div', name: '人事課', rate: 60 }
          ] 
        },
        { 
          id: 'acc', 
          name: '経理部', 
          rate: 71,
          children: [
            { id: 'acc-div', name: '経理課', rate: 71 }
          ]
        },
        { 
          id: 'gen', 
          name: '総務部', 
          rate: 75, 
          children: [
            { id: 'gen-div', name: '総務課', rate: 65 },
            { id: 'risk', name: 'リスク管理課', rate: 90 }
          ] 
        },
        { id: 'it', name: '情報システム部', rate: 80 }
      ]
    },
    {
      id: 'sales',
      name: '営業部',
      rate: 80,
      children: [
        { 
          id: 'sales-hr', 
          name: '人事部', 
          rate: 60, 
          children: [
            { id: 'sales-hr-div', name: '人事課', rate: 60 }
          ] 
        },
        { 
          id: 'sales-acc', 
          name: '経理部', 
          rate: 21,
          children: [
            { id: 'sales-acc-div', name: '経理課', rate: 21 }
          ]
        },
        { 
          id: 'sales-gen', 
          name: '総務部', 
          rate: 75, 
          children: [
            { id: 'sales-gen-div', name: '総務課', rate: 65 },
            { id: 'sales-risk', name: 'リスク管理課', rate: 90 }
          ] 
        },
        { id: 'sales-it', name: '情報システム部', rate: 80 }
      ]
    },
    {
      id: 'creative',
      name: '創造部',
      rate: 80,
      children: [
        { id: 'creative-hr', name: '人事部', rate: 60 },
        { id: 'creative-acc', name: '経理部', rate: 71 },
        { id: 'creative-gen', name: '総務部', rate: 75 },
        { id: 'creative-it', name: '情報システム部', rate: 80 }
      ]
    },
    {
      id: 'dev',
      name: '開発部',
      rate: 80,
      children: [
        { id: 'dev-hr', name: '人事部', rate: 60 },
        { id: 'dev-acc', name: '経理部', rate: 71 },
        { id: 'dev-gen', name: '総務部', rate: 75 },
        { id: 'dev-it', name: '情報システム部', rate: 80 }
      ]
    }
  ]
};

// 修正したLastUpdatedInfoコンポーネント
const LastUpdatedInfo = ({ history }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '日付なし';
    const date = new Date(dateString);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  if (!history) {
    return (
      <div className="text-sm text-gray-500 flex items-center">
        <svg
          className="w-4 h-4 mr-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>最終更新: 情報なし</span>
      </div>
    );
  }

  const latestSurvey = history && history.length > 0 ? history[0] : null;
  const updateDate = latestSurvey?.date || '日付なし';

  return (
    <div className="text-sm text-gray-500 flex items-center">
      <svg
        className="w-4 h-4 mr-1"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span>最終更新: {formatDate(updateDate)}</span>
    </div>
  );
};

// 履歴データ生成関数
const generateHistoryData = (endDate, years) => {
  const data = [];
  let date = new Date(endDate);
  for (let i = 0; i <= years * 2 + 1; i++) {
    data.unshift({
      date: date.toISOString().split('T')[0],
      score: Math.floor(Math.random() * 101),
      rating: ['B', 'BB', 'BBB'][Math.floor(Math.random() * 3)],
    });
    date.setMonth(date.getMonth() - 6);
  }
  return data;
};

// 4象限マトリクス用データ生成関数（部署ごと）
const generateDepartmentMatrixData = (categories) => {
  const departments = ['営業部', '開発部', '人事部', '経理部'];
  const result = {};

  departments.forEach(dept => {
    result[dept] = categories.map((item) => ({
      id: item.id,
      category: item.category,
      x: Math.random() * 4 + 1,
      y: Math.random() * 4 + 1,
    }));
  });

  return result;
};

// 部署スコアのダミーデータ（4部署）
const departmentScores = [
  { id: 'sales', name: '営業部', score: 75, rating: 'A', diff: 5, prevDiff: 2 },
  { id: 'development', name: '開発部', score: 65, rating: 'B', diff: -3, prevDiff: 1 },
  { id: 'hr', name: '人事部', score: 70, rating: 'BB', diff: 0, prevDiff: 0 },
  { id: 'accounting', name: '経理部', score: 80, rating: 'A', diff: 2, prevDiff: -1 },
];

// ResponseRateCard用ダミーデータ
const responseRates = [
  { label: '営業部', rate: 70 },
  { label: '開発部', rate: 65 },
  { label: '人事部', rate: 80 },
  { label: '経理部', rate: 75 },
];

// 追加質問のカテゴリー
const customCategories = [
  { id: 101, category: 'リモートワークの満足度' },
  { id: 102, category: '部署間コミュニケーション' },
  { id: 103, category: '新しい技術導入への理解' },
];

const ManagerIssue = () => {
  const [selectedYears, setSelectedYears] = useState(1);
  const [fullHistory, setFullHistory] = useState(null);
  const [latestScore, setLatestScore] = useState(null);
  const [selectedDept, setSelectedDept] = useState('営業部');
  const [showHeatmapView, setShowHeatmapView] = useState(true);

  const categories = unifiedCategories;

  // エンゲージメントサーベイチャート用データ変換
  const transformQuestionDataForChart = () => {
    const surveyIterations = 14;
    const chartData = [];
    for (let i = 1; i <= surveyIterations; i++) {
      const dataPoint = { id: `q${i}` };
      for (let qId = 1; qId <= 16; qId++) {
        const satisfaction = 2.5 + Math.sin(qId * 0.5 + i * 0.7) * 1.5;
        const expectation = 3.2 + Math.cos(qId * 0.3 + i * 0.5) * 1.0;
        const gap = satisfaction - expectation;
        dataPoint[`satisfaction${qId}`] = parseFloat(satisfaction.toFixed(1));
        dataPoint[`expectation${qId}`] = parseFloat(expectation.toFixed(1));
        dataPoint[`gap${qId}`] = parseFloat(gap.toFixed(1));
      }
      chartData.push(dataPoint);
    }
    return chartData;
  };

  const transformedQuestionData = transformQuestionDataForChart();

  // CategoryScoreTable用マージデータ生成
  const createMergedDataForScoreTable = () => {
    return categories.map(category => {
      const baseSatisfaction = 3.0 + (Math.random() * 1.5);
      const baseExpectation = 3.5 + (Math.random() * 1.0);
      const satisfactionDiff = (Math.random() * 0.6 - 0.3).toFixed(1);
      const expectationDiff = (Math.random() * 0.6 - 0.3).toFixed(1);
      const satisfactionYoyDiff = (Math.random() * 0.8 - 0.4).toFixed(1);
      const expectationYoyDiff = (Math.random() * 0.8 - 0.4).toFixed(1);
      return {
        categoryId: category.id,
        category: category.category,
        question: `${category.category}に関する質問項目です。`,
        satisfaction: parseFloat(baseSatisfaction.toFixed(1)),
        expectation: parseFloat(baseExpectation.toFixed(1)),
        satisfactionDiff: parseFloat(satisfactionDiff),
        expectationDiff: parseFloat(expectationDiff),
        satisfactionYoyDiff: parseFloat(satisfactionYoyDiff),
        expectationYoyDiff: parseFloat(expectationYoyDiff)
      };
    });
  };

  const engagementMergedData = createMergedDataForScoreTable();

  const managerMergedData = createMergedDataForScoreTable().map(item => ({
    ...item,
    satisfaction: Math.max(1, Math.min(5, item.satisfaction - 0.3 + (Math.random() * 0.6))),
    expectation: Math.max(1, Math.min(5, item.expectation - 0.2 + (Math.random() * 0.4)))
  }));

  // 改善項目を質問選択用フォーマットに変換
  const transformImprovementItemsForQuestions = () => {
    return categories.map(cat => ({
      id: cat.id,
      text: cat.category,
      inSurvey: true,
    }));
  };

  const questionSelectionItems = transformImprovementItemsForQuestions();

  const departmentData = generateDepartmentMatrixData(categories);

  const departmentSummaryData = {
    営業部: {
      strong: ['顧客対応力', '連携意識', '目標達成意欲'],
      weak: ['評価・給与制度', '事業戦略の伝達', 'ワークライフバランス'],
      summary: '営業部は顧客対応力と社内連携の強さが評価されていますが、評価制度や事業戦略の伝達において課題があります。従業員のモチベーション維持とワークライフバランス改善が今後の焦点となります。',
      companyAvg: 3.5,
      departmentAvg: 3.6
    },
    開発部: {
      strong: ['技術力', 'チームワーク', '問題解決能力'],
      weak: ['業務効率', '情報共有', '顧客ニーズの理解'],
      summary: '開発部は技術力と問題解決能力が高く評価されています。一方で業務効率化や部門間の情報共有、顧客ニーズの把握に課題があり、これらの改善が部署のさらなる成長につながります。',
      companyAvg: 3.5,
      departmentAvg: 3.7
    },
    人事部: {
      strong: ['社員ケア', '採用プロセス', '制度設計'],
      weak: ['評価制度の透明性', 'キャリアパス支援', 'デジタル活用'],
      summary: '人事部は社員ケアや採用プロセスの整備において優れた能力を発揮しています。課題は評価制度の透明性確保とキャリアパス支援の充実、人事業務のデジタル化推進です。',
      companyAvg: 3.5,
      departmentAvg: 3.4
    },
    経理部: {
      strong: ['業務の正確性', '専門知識', 'コンプライアンス意識'],
      weak: ['業務効率', 'デジタル化対応', '部門間コミュニケーション'],
      summary: '経理部は業務の正確性と専門知識、コンプライアンス意識の高さが強みです。一方で業務効率化やデジタル技術の活用、他部門との円滑なコミュニケーションが課題となっています。',
      companyAvg: 3.5,
      departmentAvg: 3.3
    }
  };

  const heatmapData = [
    {
      id: 'all',
      department: '全社',
      satisfaction: 63.5,
      expectation: 65.3,
      gap: -1.8,
      satisfactionComparison: -0.3,
      expectationComparison: 0.5,
      gapComparison: -0.8,
      defaultCategories: {
        '顧客基盤の安定性': { satisfaction: 3.7, expectation: 4.4, gap: -0.7, satisfactionComparison: 0.2, expectationComparison: 0.3, gapComparison: -0.1 },
      },
      customCategories: {
        'リモートワークの満足度': { satisfaction: 2.9, expectation: 5.0, gap: -2.1, satisfactionComparison: -0.4, expectationComparison: 0.2, gapComparison: -0.6 },
      },
    },
    {
      id: 'sales',
      department: '営業部',
      satisfaction: 58.2,
      expectation: 60.1,
      gap: -1.9,
      satisfactionComparison: -0.5,
      expectationComparison: 0.3,
      gapComparison: -0.8,
      defaultCategories: {
        '顧客基盤の安定性': { satisfaction: 3.5, expectation: 4.5, gap: -1.0, satisfactionComparison: 0.0, expectationComparison: 0.3, gapComparison: -0.3 },
      },
      customCategories: {
        'リモートワークの満足度': { satisfaction: 2.3, expectation: 5.0, gap: -2.7, satisfactionComparison: -0.7, expectationComparison: 0.3, gapComparison: -1.0 },
      },
    },
    {
      id: 'dev',
      department: '開発部',
      satisfaction: 65.7,
      expectation: 67.2,
      gap: -1.5,
      satisfactionComparison: 0.2,
      expectationComparison: 0.1,
      gapComparison: 0.1,
      defaultCategories: {
        '顧客基盤の安定性': { satisfaction: 3.8, expectation: 4.2, gap: -0.4, satisfactionComparison: 0.3, expectationComparison: 0.1, gapComparison: 0.2 },
      },
      customCategories: {
        'リモートワークの満足度': { satisfaction: 3.7, expectation: 4.5, gap: -0.8, satisfactionComparison: 0.3, expectationComparison: 0.2, gapComparison: 0.1 },
      },
    },
    {
      id: 'hr',
      department: '人事部',
      satisfaction: 61.3,
      expectation: 63.8,
      gap: -2.5,
      satisfactionComparison: 0.1,
      expectationComparison: 0.3,
      gapComparison: -0.2,
      defaultCategories: {
        '顧客基盤の安定性': { satisfaction: 3.6, expectation: 4.3, gap: -0.7, satisfactionComparison: 0.2, expectationComparison: 0.2, gapComparison: 0.0 },
      },
      customCategories: {
        'リモートワークの満足度': { satisfaction: 3.2, expectation: 4.8, gap: -1.6, satisfactionComparison: 0.0, expectationComparison: 0.2, gapComparison: -0.2 },
      },
    },
    {
      id: 'accounting',
      department: '経理部',
      satisfaction: 59.4,
      expectation: 61.8,
      gap: -2.4,
      satisfactionComparison: -0.2,
      expectationComparison: 0.2,
      gapComparison: -0.4,
      defaultCategories: {
        '顧客基盤の安定性': { satisfaction: 3.5, expectation: 4.2, gap: -0.7, satisfactionComparison: 0.1, expectationComparison: 0.1, gapComparison: 0.0 },
      },
      customCategories: {
        'リモートワークの満足度': { satisfaction: 2.8, expectation: 4.5, gap: -1.7, satisfactionComparison: -0.3, expectationComparison: 0.2, gapComparison: -0.5 },
      },
    },
  ];

  const surveyOverallSummary = `本期の調査結果では、全社平均の満足度は前回より若干低下(-0.3)していますが、
部署間で異なる傾向が見られます。開発部の満足度(65.7)が最も高く、リモートワーク環境への適応が
進んでいることが特徴的です。一方、営業部と経理部では満足度が低下傾向にあり、特にリモートワーク
環境におけるギャップ値が大きくなっています。全社的に期待値は上昇(+0.5)傾向にあるため、
GAP値は拡大しています。この結果から、リモートワーク環境の整備と部署間の業務特性に合わせた
支援策の強化が今後の課題と考えられます。`;

  const tenantName = '大東亜全世界同盟株式会社';

  useEffect(() => {
    const generatedData = generateHistoryData('2025-02-07', 5);
    setFullHistory(generatedData);
    const filteredHistory = generatedData.slice(-(selectedYears * 2 + 1));
    setLatestScore(filteredHistory.length > 0 ? filteredHistory[filteredHistory.length - 1].score : 0);
  }, [selectedYears]);

  if (!fullHistory || latestScore === null) return null;

  const questionnaireData = {
    score: latestScore,
    prevDiff: '+0.5',
    companyAvg: '58.9 (-3.6)',
    rating: 55,
    ratingLabel: 'BB',
    history: fullHistory,
    setSelectedYears,
    selectedYears,
  };

  // --- ダミーデータ用関数とインサイトテキストの定義 --- //
  const calculatePredictionValue = (questionId, baseIndex) => {
    const predictionValues = {
      1: { initial: 3.5, slope: 0.2 },
      2: { initial: 3.0, slope: 0.25 },
      3: { initial: 3.2, slope: 0.15 },
      4: { initial: 3.1, slope: 0.18 },
      5: { initial: 3.0, slope: 0.22 },
      6: { initial: 3.3, slope: 0.17 },
      7: { initial: 3.0, slope: 0.2 },
      8: { initial: 3.2, slope: 0.15 },
      9: { initial: 3.4, slope: 0.19 },
      10: { initial: 3.1, slope: 0.21 },
      11: { initial: 3.3, slope: 0.16 },
      12: { initial: 3.2, slope: 0.18 },
      13: { initial: 3.0, slope: 0.23 },
      14: { initial: 3.3, slope: 0.19 },
      15: { initial: 3.1, slope: 0.17 },
      16: { initial: 3.4, slope: 0.2 },
    };
    const defaultValue = { initial: 3.2, slope: 0.2 };
    const values = predictionValues[questionId] || defaultValue;
    return Math.min(5, values.initial + (values.slope * baseIndex));
  };

  const getChartData = () => {
    const data = [...transformedQuestionData];
    if (!data || data.length === 0) return data;
    // 固定のselectedQuestionsを利用
    const selectedQuestions = [1, 5, 9, 13, 16];
    const latestSurvey = data[data.length - 1];
    const nextSurveyNumber = typeof latestSurvey.id === 'number' ? latestSurvey.id + 1 : data.length + 1;
    const predictionData = {
      id: nextSurveyNumber,
      date: '次回',
      isPrediction: true,
    };
    const updatedData = data.map((item, index) => {
      const newItem = { ...item };
      selectedQuestions.forEach((qId) => {
        const predictionValue = calculatePredictionValue(qId, index);
        newItem[`predictionSatisfaction${qId}`] = predictionValue;
      });
      return newItem;
    });
    selectedQuestions.forEach((qId) => {
      const predictionValue = calculatePredictionValue(qId, data.length);
      predictionData[`satisfaction${qId}`] = predictionValue;
      predictionData[`predictionSatisfaction${qId}`] = predictionValue;
    });
    return [...updatedData, predictionData];
  };

  // 各インサイトカードのアイコンなども含む情報
  const insightTexts = [
    {
      title: '改善施策の効果測定',
      text: '前回から今回へのスコア変化から、実施した施策の効果を具体的に評価できます。',
      icon: (
        <div className="w-8 h-8 flex-shrink-0 bg-brand-teal rounded-full flex items-center justify-center text-white mr-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>
        </div>
      )
    },
    {
      title: '長期的なトレンド',
      text: '複数回のデータから、長期的な満足度や期待値の変化傾向を把握できます。上昇・下降・横ばいなどのパターンを分析することで、予測値の精度を高め、先手を打った対策が可能になります。',
      icon: (
        <div className="w-8 h-8 flex-shrink-0 bg-brand-cyan rounded-full flex items-center justify-center text-white mr-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path>
          </svg>
        </div>
      )
    },
    {
      title: '季節変動・外部要因の影響',
      text: '定期的な繁忙期や組織変更などのイベントがスコアに与える影響を時系列で確認できます。外部環境の変化と内部満足度の関係性を分析することで、より状況に応じた柔軟な対応が可能になります。',
      icon: (
        <div className="w-8 h-8 flex-shrink-0 bg-brand-coral rounded-full flex items-center justify-center text-white mr-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
          </svg>
        </div>
      )
    },
    {
      title: '継続的な課題の特定',
      text: '複数回のサーベイでも改善が見られない項目は、より根本的・構造的な問題を示唆しています。短期的な対応では解決できない課題を特定することで、中長期的な組織改革の方向性を定めることができます。',
      icon: (
        <div className="w-8 h-8 flex-shrink-0 bg-brand-orange rounded-full flex items-center justify-center text-white mr-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
      )
    },
  ];

  return (
    <div className="bg-brand-lightGray min-h-screen flex flex-col">
      {/* 管理者専用ヘッダーを使用 */}
      <AdminHeader />
      <AnalysisImprovementHeader 
        analysisPath="/admin/dashboard" 
        improvementPath="/admin/measures" 
      />
  
      <div className="flex justify-between items-center">
        <div className="mb-8 w-full mt-24">
          <div className="border-b border-gray-200 pb-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold pl-6 pt-4 text-gray-900 flex items-center border-l-4 border-brand-teal">
                <svg
                  className="w-6 h-6 mr-2 text-brand-teal"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 12.75c1.63 0 3.07.39 4.24.9 1.08.48 1.76 1.56 1.76 2.73V18H6v-1.62c0-1.17.68-2.25 1.76-2.73 1.17-.51 2.61-.9 4.24-.9zM18 2v6c0 3.31-2.69 6-6 6s-6-2.69-6-6V2h12zm-2 6V4h-8v4c0 2.21 1.79 4 4 4s4-1.79 4-4z" />
                </svg>
                {tenantName}の会社データ
              </h2>
              <div className="pr-6 pt-4">
                <LastUpdatedInfo history={fullHistory} />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <QuestionnaireScore 
        score={latestScore}
        prevDiff="+0.5"
        companyAvg="58.9 (-3.6)"
        rating={55}
        ratingLabel="BB"
        history={fullHistory || []}
        setSelectedYears={setSelectedYears}
        selectedYears={selectedYears}
      />
  
        <div className='mx-6 mt-6'>
        {/* 統合型回答率コンポーネント - プロップスを渡すように修正 */}
        <ResponseRateComponent 
          lowRateDepartments={lowRateDepartments} 
          fullOrgData={fullOrgData} 
        />
        </div>
        <h2 className="text-xl font-bold text-gray-900 ml-6 mt-6">
        最新サーベイスコア詳細
      </h2>
      <div className="p-6 w-full">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between mb-4">
            <div className="flex space-x-4">
              <button
                onClick={() => setShowHeatmapView(true)}
                className={`px-4 py-2 rounded-md ${
                  showHeatmapView
                    ? 'bg-brand-teal text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                ヒートマップ表示
              </button>
              <button
                onClick={() => setShowHeatmapView(false)}
                className={`px-4 py-2 rounded-md ${
                  !showHeatmapView
                    ? 'bg-brand-teal text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                リスト表示
              </button>
            </div>
          </div>

          {showHeatmapView && (
            <EmployeeSatisfactionHeatmap
              defaultCategories={categories}
              customCategories={customCategories}
              data={heatmapData}
              // 以下を追加: 全部門共通のサマリーテキストを渡す
              summaryText={surveyOverallSummary}
            />
          )}

          {!showHeatmapView && (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-brand-teal text-white">
                    <th className="py-2 px-4 text-left">部署</th>
                    <th className="py-2 px-4 text-center">満足度</th>
                    <th className="py-2 px-4 text-center">前回比</th>
                    <th className="py-2 px-4 text-center">期待値</th>
                    <th className="py-2 px-4 text-center">前回比</th>
                    <th className="py-2 px-4 text-center">GAP</th>
                    <th className="py-2 px-4 text-center">前回比</th>
                  </tr>
                </thead>
                <tbody>
                  {heatmapData.map((dept) => (
                    <tr key={dept.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-4 font-medium text-brand-darkBlue">
                        {dept.department}
                      </td>
                      <td className="py-2 px-4 text-center text-brand-darkBlue">
                        {dept.satisfaction?.toFixed(1) || '-'}
                      </td>
                      <td
                        className={`py-2 px-4 text-center ${dept.satisfactionComparison > 0 ? 'text-green-600' : dept.satisfactionComparison < 0 ? 'text-red-600' : ''}`}
                      >
                        {dept.satisfactionComparison > 0
                          ? `+${dept.satisfactionComparison.toFixed(1)}`
                          : dept.satisfactionComparison.toFixed(1)}
                      </td>
                      <td className="py-2 px-4 text-center text-brand-darkBlue">
                        {dept.expectation?.toFixed(1) || '-'}
                      </td>
                      <td
                        className={`py-2 px-4 text-center ${dept.expectationComparison > 0 ? 'text-green-600' : dept.expectationComparison < 0 ? 'text-red-600' : ''}`}
                      >
                        {dept.expectationComparison > 0
                          ? `+${dept.expectationComparison.toFixed(1)}`
                          : dept.expectationComparison.toFixed(1)}
                      </td>
                      <td className="py-2 px-4 text-center text-brand-darkBlue">
                        {dept.gap?.toFixed(1) || '-'}
                      </td>
                      <td
                        className={`py-2 px-4 text-center ${dept.gapComparison > 0 ? 'text-green-600' : dept.gapComparison < 0 ? 'text-red-600' : ''}`}
                      >
                        {dept.gapComparison > 0
                          ? `+${dept.gapComparison.toFixed(1)}`
                          : dept.gapComparison.toFixed(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex justify-between">
            <div className="flex space-x-4 pt-4">
              <button className="bg-brand-teal hover:bg-brand-darkBlue text-white px-4 py-2 rounded transition duration-300">
                スコア一覧をダウンロード
              </button>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-900 ml-6 mt-6 mb-2">
          ４象限マトリックス分析
        </h2>
        <div className="px-6 w-full flex flex-col md:flex-row">
          <div className="w-full mb-4">
            <div className="flex flex-wrap gap-2">
              {Object.keys(departmentData).map((dept) => (
                <button
                  key={dept}
                  onClick={() => setSelectedDept(dept)}
                  className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
                    selectedDept === dept
                      ? 'bg-brand-darkBlue text-white shadow-md'
                      : 'bg-brand-cyan text-white hover:bg-brand-teal'
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="px-6 w-full flex flex-col md:flex-row">
          <div className="w-full md:w-2/5 pr-0 md:pr-10 mb-6 md:mb-0">
            <QuadrantMatrix
              selectedDept={selectedDept}
              setSelectedDept={setSelectedDept}
              categories={categories}
              departmentData={departmentData}
              showSurveyDateSelector={false}
              showDepartmentSelector={false}
            />
          </div>
          <div className="w-full md:w-3/5">
            <QuadrantMatrixDetails
              selectedDept={selectedDept}
              departmentData={departmentSummaryData}
            />
          </div>
        </div>
      </div>
  
      {/* EngagementSurveyChartコンポーネントへダミーデータ関数＆インサイトテキストをpropで渡す */}
      {(() => {
        return (
          <EngagementSurveyChart
            selectedOrganization={selectedDept}
            engagementSurveyData={engagementMergedData}
            managerScoreData={managerMergedData}
            questionData={transformedQuestionData}
            allImprovementItems={questionSelectionItems}
            improvementPlans={[]}
            calculatePredictionValue={calculatePredictionValue}
            getChartData={getChartData}
            insightTexts={insightTexts}
          />
        );
      })()}
    </div>
  );
}

export default ManagerIssue;