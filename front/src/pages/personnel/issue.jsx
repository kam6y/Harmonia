// front/src/pages/manager/issue.jsx
import { useState, useEffect, useRef } from 'react'
import PersonnelHeader from '@/components/personnel/PersonnelHeader'
import AnalysisImprovementHeader from '@/components/common/AnalysisImprovementHeader'
import LastUpdatedInfo from '../../components/common/LastUpdatedInfo'
import SurveyStatusView from '../../components/common/SurveyStatusView'

/**
 * 履歴データ生成ヘルパー関数
 * @param {string} endDate - 終了日
 * @param {number} years - 年数
 * @returns {Array} - 履歴データ配列
 */
const generateHistoryData = (endDate, years) => {
  const data = []
  let date = new Date(endDate)
  for (let i = 0; i <= years * 2 + 1; i++) {
    data.unshift({
      date: date.toISOString().split('T')[0],
      score: Math.floor(Math.random() * 101),
      rating: ['B', 'BB', 'BBB'][Math.floor(Math.random() * 3)]
    })
    date.setMonth(date.getMonth() - 6)
  }
  return data
}

/**
 * 部署ごとの4象限マトリクス用データ生成関数
 * @param {Array} categories - カテゴリーデータの配列
 * @returns {Object} - 部署ごとのマトリクスデータ
 */
const generateDepartmentMatrixData = (categories) => {
  const departments = ['営業部', '開発部', '管理部', 'マーケティング部', '人事部', '経理部', '顧客サポート部'];
  const result = {};

  departments.forEach(dept => {
    result[dept] = categories.map((item) => ({
      id: item.id,
      category: item.category,
      x: Math.random() * 4 + 1, // 実感値（1-5の範囲）
      y: Math.random() * 4 + 1, // 期待値（1-5の範囲）
    }));
  });

  return result;
};

/**
 * 管理者用の課題ダッシュボード
 */
const ManagerIssue = () => {
  // ========== 状態管理 ==========
  const [selectedYears, setSelectedYears] = useState(1)
  const [fullHistory, setFullHistory] = useState(null)
  const [latestScore, setLatestScore] = useState(null)
  const [comparisonPeriod, setComparisonPeriod] = useState('前回')
  const [selectedDept, setSelectedDept] = useState(null)
  const [selectedSurveyDate, setSelectedSurveyDate] = useState(null)
  const [allSurveyDates, setAllSurveyDates] = useState([])
  const [departmentData, setDepartmentData] = useState({})
  const [currentData, setCurrentData] = useState({})

  // データ生成済みフラグ（再生成を防ぐため）
  const dataGenerated = useRef(false)

  // 初期サーベイ状態（ローカルストレージから復元または 'loading' を初期値）
  const [initialSurveyState, setInitialSurveyState] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('surveyDisplayState')
      return savedState || 'loading'
    }
    return 'loading'
  })

  // 現在の表示状態を管理
  const [currentViewState, setCurrentViewState] = useState(initialSurveyState)

  // ========== ダミーデータ定義 ==========
  // サーベイデータ
  const surveyData = {
    id: 'survey-2025-1',
    title: '2025年上期エンゲージメントサーベイ',
    startDate: '2025-02-01',
    endDate: '2025-02-15',
    targetCount: 150,
    responseCount: 105,
  }

  // 回答率関連のデータ
  const currentRate = 55
  const rateHistory = [
    { date: '2023/08', rate: 20 },
    { date: '2024/02', rate: 30 },
    { date: '2024/08', rate: 25 },
    { date: '2025/02', rate: 40 },
    { date: '2025/08', rate: null },
  ]

  // 16項目のカテゴリーデータ
  const categories = [
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
  ]

  // 部門概要データ
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
    管理部: {
      strong: ['業務の正確性', '専門知識', 'コンプライアンス意識'],
      weak: ['業務効率', 'デジタル化対応', '部門間コミュニケーション'],
      summary: '管理部は業務の正確性と専門知識、コンプライアンス意識の高さが強みです。一方で業務効率化やデジタル技術の活用、他部門との円滑なコミュニケーションが課題となっています。',
      companyAvg: 3.5,
      departmentAvg: 3.4
    },
    マーケティング部: {
      strong: ['市場分析力', 'クリエイティブ発想', '部門間連携'],
      weak: ['定量的な成果測定', 'リソース配分', '長期戦略立案'],
      summary: 'マーケティング部は市場分析力とクリエイティブな発想が強みです。課題としては施策の効果測定やリソース配分の最適化、中長期的な戦略立案能力の向上が挙げられます。',
      companyAvg: 3.5,
      departmentAvg: 3.5
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
    },
    顧客サポート部: {
      strong: ['顧客対応スピード', '顧客満足度', '問題解決能力'],
      weak: ['ナレッジ共有', 'ストレス管理', 'キャリア成長'],
      summary: '顧客サポート部は迅速な対応と高い顧客満足度を実現しています。課題としてはナレッジ共有の効率化、スタッフのストレス管理、キャリア成長支援の強化が必要です。',
      companyAvg: 3.5,
      departmentAvg: 3.8
    }
  };

  // スコアデータ
  const scoreData = [
    {
      categoryId: 1,
      expectation: 3.7,
      expectationDiff: 0.3,
      expectationYoyDiff: 0.5,
      satisfaction: 3.7,
      satisfactionDiff: 0.6,
      satisfactionYoyDiff: 0.4,
    },
    // 必要に応じて他のデータも追加
  ]

  // 課題データ
  const challengeData = [
    {
      id: 101,
      category: '顧客基盤の安定性',
      challenge: '顧客離れが増加している',
      measureCount: 3,
    },
    {
      id: 201,
      category: '理念戦略への納得感',
      challenge: '会社のビジョンが社員に浸透していない',
      measureCount: 2,
    },
    {
      id: 301,
      category: '連帯感と相互尊重',
      challenge: '部門間の連携が不足している',
      measureCount: 4,
    },
    {
      id: 401,
      category: '評価・給与と柔軟な働き方',
      challenge: 'リモートワーク環境の整備が不十分',
      measureCount: 2,
    },
    {
      id: 501,
      category: '上司からの適切な教育・支援',
      challenge: '若手社員へのフィードバックが不足している',
      measureCount: 1,
    },
  ]

  // 課題カテゴリー選択肢データ
  const challengeCategories = categories.map((cat) => ({
    id: cat.id.toString(),
    name: cat.category,
  }))

  // ========== エンゲージメントサーベイ詳細データ ==========
  // エンゲージメントサーベイの結果推移用データ
  const detailedEngagementData = {
    // 時期別データ
    periods: ['2023-1', '2023-2', '2024-1', '2024-2', '2025-1'],
    
    // 部門別データ
    departments: ['営業部', '開発部', '管理部', '人事部', '経理部', '全社平均'],
    
    // カテゴリー別データ
    categories: [
      { id: 'work_env', name: '職場環境' },
      { id: 'growth', name: '成長機会' },
      { id: 'leadership', name: 'リーダーシップ' },
      { id: 'compensation', name: '報酬・評価' },
      { id: 'communication', name: 'コミュニケーション' },
      { id: 'worklife', name: 'ワークライフバランス' },
      { id: 'overall', name: '総合エンゲージメント' }
    ],
    
    // スコアデータ
    scores: [
      // === 営業部 ===
      // 2023年上期
      { period: '2023-1', department: '営業部', category: 'work_env', score: 72 },
      { period: '2023-1', department: '営業部', category: 'growth', score: 68 },
      { period: '2023-1', department: '営業部', category: 'leadership', score: 65 },
      { period: '2023-1', department: '営業部', category: 'compensation', score: 60 },
      { period: '2023-1', department: '営業部', category: 'communication', score: 70 },
      { period: '2023-1', department: '営業部', category: 'worklife', score: 63 },
      { period: '2023-1', department: '営業部', category: 'overall', score: 66 },
      
      // 2023年下期
      { period: '2023-2', department: '営業部', category: 'work_env', score: 74 },
      { period: '2023-2', department: '営業部', category: 'growth', score: 70 },
      { period: '2023-2', department: '営業部', category: 'leadership', score: 68 },
      { period: '2023-2', department: '営業部', category: 'compensation', score: 63 },
      { period: '2023-2', department: '営業部', category: 'communication', score: 72 },
      { period: '2023-2', department: '営業部', category: 'worklife', score: 65 },
      { period: '2023-2', department: '営業部', category: 'overall', score: 69 },
      
      // 2024年上期
      { period: '2024-1', department: '営業部', category: 'work_env', score: 76 },
      { period: '2024-1', department: '営業部', category: 'growth', score: 73 },
      { period: '2024-1', department: '営業部', category: 'leadership', score: 70 },
      { period: '2024-1', department: '営業部', category: 'compensation', score: 67 },
      { period: '2024-1', department: '営業部', category: 'communication', score: 75 },
      { period: '2024-1', department: '営業部', category: 'worklife', score: 69 },
      { period: '2024-1', department: '営業部', category: 'overall', score: 72 },
      
      // 2024年下期
      { period: '2024-2', department: '営業部', category: 'work_env', score: 79 },
      { period: '2024-2', department: '営業部', category: 'growth', score: 75 },
      { period: '2024-2', department: '営業部', category: 'leadership', score: 73 },
      { period: '2024-2', department: '営業部', category: 'compensation', score: 70 },
      { period: '2024-2', department: '営業部', category: 'communication', score: 78 },
      { period: '2024-2', department: '営業部', category: 'worklife', score: 72 },
      { period: '2024-2', department: '営業部', category: 'overall', score: 75 },
      
      // 2025年上期
      { period: '2025-1', department: '営業部', category: 'work_env', score: 82 },
      { period: '2025-1', department: '営業部', category: 'growth', score: 78 },
      { period: '2025-1', department: '営業部', category: 'leadership', score: 76 },
      { period: '2025-1', department: '営業部', category: 'compensation', score: 73 },
      { period: '2025-1', department: '営業部', category: 'communication', score: 80 },
      { period: '2025-1', department: '営業部', category: 'worklife', score: 75 },
      { period: '2025-1', department: '営業部', category: 'overall', score: 78 },
      
      // === 開発部 ===
      // 2023年上期
      { period: '2023-1', department: '開発部', category: 'work_env', score: 70 },
      { period: '2023-1', department: '開発部', category: 'growth', score: 75 },
      { period: '2023-1', department: '開発部', category: 'leadership', score: 62 },
      { period: '2023-1', department: '開発部', category: 'compensation', score: 65 },
      { period: '2023-1', department: '開発部', category: 'communication', score: 63 },
      { period: '2023-1', department: '開発部', category: 'worklife', score: 58 },
      { period: '2023-1', department: '開発部', category: 'overall', score: 65 },
      
      // 2023年下期
      { period: '2023-2', department: '開発部', category: 'work_env', score: 71 },
      { period: '2023-2', department: '開発部', category: 'growth', score: 77 },
      { period: '2023-2', department: '開発部', category: 'leadership', score: 65 },
      { period: '2023-2', department: '開発部', category: 'compensation', score: 67 },
      { period: '2023-2', department: '開発部', category: 'communication', score: 66 },
      { period: '2023-2', department: '開発部', category: 'worklife', score: 60 },
      { period: '2023-2', department: '開発部', category: 'overall', score: 68 },
      
      // 2024年上期
      { period: '2024-1', department: '開発部', category: 'work_env', score: 73 },
      { period: '2024-1', department: '開発部', category: 'growth', score: 80 },
      { period: '2024-1', department: '開発部', category: 'leadership', score: 68 },
      { period: '2024-1', department: '開発部', category: 'compensation', score: 70 },
      { period: '2024-1', department: '開発部', category: 'communication', score: 69 },
      { period: '2024-1', department: '開発部', category: 'worklife', score: 65 },
      { period: '2024-1', department: '開発部', category: 'overall', score: 71 },
      
      // 2024年下期
      { period: '2024-2', department: '開発部', category: 'work_env', score: 75 },
      { period: '2024-2', department: '開発部', category: 'growth', score: 82 },
      { period: '2024-2', department: '開発部', category: 'leadership', score: 72 },
      { period: '2024-2', department: '開発部', category: 'compensation', score: 73 },
      { period: '2024-2', department: '開発部', category: 'communication', score: 73 },
      { period: '2024-2', department: '開発部', category: 'worklife', score: 69 },
      { period: '2024-2', department: '開発部', category: 'overall', score: 74 },
      
      // 2025年上期
      { period: '2025-1', department: '開発部', category: 'work_env', score: 78 },
      { period: '2025-1', department: '開発部', category: 'growth', score: 85 },
      { period: '2025-1', department: '開発部', category: 'leadership', score: 75 },
      { period: '2025-1', department: '開発部', category: 'compensation', score: 76 },
      { period: '2025-1', department: '開発部', category: 'communication', score: 77 },
      { period: '2025-1', department: '開発部', category: 'worklife', score: 72 },
      { period: '2025-1', department: '開発部', category: 'overall', score: 78 },
      
      // === 管理部 ===
      // 2023年上期
      { period: '2023-1', department: '管理部', category: 'work_env', score: 68 },
      { period: '2023-1', department: '管理部', category: 'growth', score: 60 },
      { period: '2023-1', department: '管理部', category: 'leadership', score: 65 },
      { period: '2023-1', department: '管理部', category: 'compensation', score: 62 },
      { period: '2023-1', department: '管理部', category: 'communication', score: 67 },
      { period: '2023-1', department: '管理部', category: 'worklife', score: 70 },
      { period: '2023-1', department: '管理部', category: 'overall', score: 65 },
      
      // 2023年下期
      { period: '2023-2', department: '管理部', category: 'work_env', score: 69 },
      { period: '2023-2', department: '管理部', category: 'growth', score: 62 },
      { period: '2023-2', department: '管理部', category: 'leadership', score: 67 },
      { period: '2023-2', department: '管理部', category: 'compensation', score: 63 },
      { period: '2023-2', department: '管理部', category: 'communication', score: 69 },
      { period: '2023-2', department: '管理部', category: 'worklife', score: 72 },
      { period: '2023-2', department: '管理部', category: 'overall', score: 67 },
      
      // 2024年上期
      { period: '2024-1', department: '管理部', category: 'work_env', score: 70 },
      { period: '2024-1', department: '管理部', category: 'growth', score: 63 },
      { period: '2024-1', department: '管理部', category: 'leadership', score: 68 },
      { period: '2024-1', department: '管理部', category: 'compensation', score: 64 },
      { period: '2024-1', department: '管理部', category: 'communication', score: 70 },
      { period: '2024-1', department: '管理部', category: 'worklife', score: 73 },
      { period: '2024-1', department: '管理部', category: 'overall', score: 68 },
      
      // 2024年下期
      { period: '2024-2', department: '管理部', category: 'work_env', score: 72 },
      { period: '2024-2', department: '管理部', category: 'growth', score: 65 },
      { period: '2024-2', department: '管理部', category: 'leadership', score: 70 },
      { period: '2024-2', department: '管理部', category: 'compensation', score: 66 },
      { period: '2024-2', department: '管理部', category: 'communication', score: 72 },
      { period: '2024-2', department: '管理部', category: 'worklife', score: 75 },
      { period: '2024-2', department: '管理部', category: 'overall', score: 70 },
      
      // 2025年上期
      { period: '2025-1', department: '管理部', category: 'work_env', score: 74 },
      { period: '2025-1', department: '管理部', category: 'growth', score: 68 },
      { period: '2025-1', department: '管理部', category: 'leadership', score: 72 },
      { period: '2025-1', department: '管理部', category: 'compensation', score: 69 },
      { period: '2025-1', department: '管理部', category: 'communication', score: 74 },
      { period: '2025-1', department: '管理部', category: 'worklife', score: 77 },
      { period: '2025-1', department: '管理部', category: 'overall', score: 73 },
      
      // === 人事部 ===
      // 2023年上期から2025年上期まで
      { period: '2023-1', department: '人事部', category: 'overall', score: 67 },
      { period: '2023-2', department: '人事部', category: 'overall', score: 69 },
      { period: '2024-1', department: '人事部', category: 'overall', score: 72 },
      { period: '2024-2', department: '人事部', category: 'overall', score: 74 },
      { period: '2025-1', department: '人事部', category: 'overall', score: 77 },
      
      // === 経理部 ===
      // 2023年上期から2025年上期まで
      { period: '2023-1', department: '経理部', category: 'overall', score: 65 },
      { period: '2023-2', department: '経理部', category: 'overall', score: 67 },
      { period: '2024-1', department: '経理部', category: 'overall', score: 70 },
      { period: '2024-2', department: '経理部', category: 'overall', score: 72 },
      { period: '2025-1', department: '経理部', category: 'overall', score: 75 },
      
      // === 全社平均 ===
      // 2023年上期
      { period: '2023-1', department: '全社平均', category: 'work_env', score: 70 },
      { period: '2023-1', department: '全社平均', category: 'growth', score: 66 },
      { period: '2023-1', department: '全社平均', category: 'leadership', score: 64 },
      { period: '2023-1', department: '全社平均', category: 'compensation', score: 62 },
      { period: '2023-1', department: '全社平均', category: 'communication', score: 67 },
      { period: '2023-1', department: '全社平均', category: 'worklife', score: 65 },
      { period: '2023-1', department: '全社平均', category: 'overall', score: 66 },
      
      // 2023年下期
      { period: '2023-2', department: '全社平均', category: 'work_env', score: 72 },
      { period: '2023-2', department: '全社平均', category: 'growth', score: 68 },
      { period: '2023-2', department: '全社平均', category: 'leadership', score: 66 },
      { period: '2023-2', department: '全社平均', category: 'compensation', score: 64 },
      { period: '2023-2', department: '全社平均', category: 'communication', score: 69 },
      { period: '2023-2', department: '全社平均', category: 'worklife', score: 67 },
      { period: '2023-2', department: '全社平均', category: 'overall', score: 68 },
      
      // 2024年上期
      { period: '2024-1', department: '全社平均', category: 'work_env', score: 74 },
      { period: '2024-1', department: '全社平均', category: 'growth', score: 70 },
      { period: '2024-1', department: '全社平均', category: 'leadership', score: 68 },
      { period: '2024-1', department: '全社平均', category: 'compensation', score: 66 },
      { period: '2024-1', department: '全社平均', category: 'communication', score: 71 },
      { period: '2024-1', department: '全社平均', category: 'worklife', score: 69 },
      { period: '2024-1', department: '全社平均', category: 'overall', score: 70 },
      
      // 2024年下期
      { period: '2024-2', department: '全社平均', category: 'work_env', score: 76 },
      { period: '2024-2', department: '全社平均', category: 'growth', score: 72 },
      { period: '2024-2', department: '全社平均', category: 'leadership', score: 70 },
      { period: '2024-2', department: '全社平均', category: 'compensation', score: 68 },
      { period: '2024-2', department: '全社平均', category: 'communication', score: 73 },
      { period: '2024-2', department: '全社平均', category: 'worklife', score: 71 },
      { period: '2024-2', department: '全社平均', category: 'overall', score: 72 },
      
      // 2025年上期
      { period: '2025-1', department: '全社平均', category: 'work_env', score: 78 },
      { period: '2025-1', department: '全社平均', category: 'growth', score: 74 },
      { period: '2025-1', department: '全社平均', category: 'leadership', score: 72 },
      { period: '2025-1', department: '全社平均', category: 'compensation', score: 70 },
      { period: '2025-1', department: '全社平均', category: 'communication', score: 75 },
      { period: '2025-1', department: '全社平均', category: 'worklife', score: 73 },
      { period: '2025-1', department: '全社平均', category: 'overall', score: 74 },
    ],
    
    // 期間表示用のマッピング
    periodMapping: {
      '2023-1': '2023年上期',
      '2023-2': '2023年下期',
      '2024-1': '2024年上期',
      '2024-2': '2024年下期',
      '2025-1': '2025年上期'
    },
    
    // 部門ごとの目標値
    targets: {
      '営業部': 80,
      '開発部': 80,
      '管理部': 75,
      '人事部': 78,
      '経理部': 76,
      '全社平均': 78
    },
    
    // 前年同期比改善率（部門別）
    yearOverYearImprovement: {
      '営業部': 6.2,
      '開発部': 7.5,
      '管理部': 4.8,
      '人事部': 5.6,
      '経理部': 5.0,
      '全社平均': 5.7
    },
    
    // カテゴリー別の重要度（最大5）
    categoryImportance: {
      'work_env': 4,
      'growth': 5,
      'leadership': 4,
      'compensation': 3,
      'communication': 5,
      'worklife': 4,
      'overall': 5
    }
  };

  // ========== エンゲージメントサーベイチャート用データ変換 ==========
  // LineChartデータ形式への変換（質問ID -> データポイント形式）
  const transformQuestionDataForChart = () => {
    // サーベイ回数（ダミーデータでは5期間）
    const surveyIterations = 14;
    
    // 結果を格納する配列
    const chartData = [];
    
    // 各サーベイ回ごとにデータポイントを作成
    for (let i = 1; i <= surveyIterations; i++) {
      // データポイントの基本構造
      const dataPoint = {
        id: `q${i}`, // X軸のラベル
      };
      
      // 16の質問について、各質問のスコアをdataPointに追加
      for (let qId = 1; qId <= 16; qId++) {
        // 実感値、期待値、GAPを計算
        const satisfaction = 2.5 + Math.sin(qId * 0.5 + i * 0.7) * 1.5; // 実感値（ダミー）
        const expectation = 3.2 + Math.cos(qId * 0.3 + i * 0.5) * 1.0;  // 期待値（ダミー）
        const gap = satisfaction - expectation;  // GAP値
        
        // データポイントに各値を追加
        dataPoint[`satisfaction${qId}`] = parseFloat(satisfaction.toFixed(1));
        dataPoint[`expectation${qId}`] = parseFloat(expectation.toFixed(1));
        dataPoint[`gap${qId}`] = parseFloat(gap.toFixed(1));
      }
      
      // 結果の配列に追加
      chartData.push(dataPoint);
    }
    
    return chartData;
  };

  // エンゲージメントサーベイチャート用の質問データを生成
  const transformedQuestionData = transformQuestionDataForChart();

  // CategoryScoreTable用のデータ形式変換（マージデータ）
  const createMergedDataForScoreTable = () => {
    // カテゴリーごとに1つの質問を生成
    return categories.map(category => {
      const catId = category.id;
      const baseSatisfaction = 3.0 + (Math.random() * 1.5);
      const baseExpectation = 3.5 + (Math.random() * 1.0);
      
      // 前回比と前年同期比のランダム値生成
      const satisfactionDiff = (Math.random() * 0.6 - 0.3).toFixed(1);
      const expectationDiff = (Math.random() * 0.6 - 0.3).toFixed(1);
      const satisfactionYoyDiff = (Math.random() * 0.8 - 0.4).toFixed(1);
      const expectationYoyDiff = (Math.random() * 0.8 - 0.4).toFixed(1);
      
      return {
        categoryId: catId,
        category: category.category,
        question: `${category.category}に関する質問項目です。`, // ダミー質問テキスト
        satisfaction: parseFloat(baseSatisfaction.toFixed(1)),
        expectation: parseFloat(baseExpectation.toFixed(1)),
        satisfactionDiff: parseFloat(satisfactionDiff),
        expectationDiff: parseFloat(expectationDiff),
        satisfactionYoyDiff: parseFloat(satisfactionYoyDiff),
        expectationYoyDiff: parseFloat(expectationYoyDiff)
      };
    });
  };

  // エンゲージメントサーベイ用のマージデータ
  const engagementMergedData = createMergedDataForScoreTable();

  // 管理者スコア用のマージデータ
  const managerMergedData = createMergedDataForScoreTable().map(item => ({
    ...item,
    satisfaction: Math.max(1, Math.min(5, item.satisfaction - 0.3 + (Math.random() * 0.6))),
    expectation: Math.max(1, Math.min(5, item.expectation - 0.2 + (Math.random() * 0.4)))
  }));

  // 改善項目を質問選択用のフォーマットに変換
  const transformImprovementItemsForQuestions = () => {
    return categories.map((cat) => {
      // 各カテゴリーに対応する質問を作成
      return {
        id: cat.id,
        text: cat.category,
        inSurvey: true, // すべて選択可能
      };
    });
  };

  // 質問選択用に変換された改善項目データ
  const questionSelectionItems = transformImprovementItemsForQuestions();

  // 質問データ
  const questionData = [
    { id: 'q1', category: 'work_env', text: '職場環境は働きやすいですか？' },
    { id: 'q2', category: 'work_env', text: '職場の設備は業務に適していますか？' },
    { id: 'q3', category: 'growth', text: '自己成長の機会は十分ですか？' },
    { id: 'q4', category: 'growth', text: 'スキル開発のためのサポートは充実していますか？' },
    { id: 'q5', category: 'leadership', text: '上司からの指導は適切ですか？' },
    { id: 'q6', category: 'leadership', text: '経営陣のビジョンは明確ですか？' },
    { id: 'q7', category: 'compensation', text: '給与水準に満足していますか？' },
    { id: 'q8', category: 'compensation', text: '評価制度は公平だと思いますか？' },
    { id: 'q9', category: 'communication', text: '部門内のコミュニケーションは円滑ですか？' },
    { id: 'q10', category: 'communication', text: '会社の方針や決定事項は適切に共有されていますか？' },
    { id: 'q11', category: 'worklife', text: 'ワークライフバランスは保たれていますか？' },
    { id: 'q12', category: 'worklife', text: '休暇取得はしやすいですか？' },
    { id: 'q13', category: 'overall', text: '総合的に見て、この会社で働くことに満足していますか？' },
    { id: 'q14', category: 'overall', text: '友人にこの会社を勧めたいと思いますか？' }
  ];

  // 改善項目データ
  const allImprovementItems = [
    { 
      id: 'imp1', 
      category: 'work_env', 
      text: 'オフィス環境の改善', 
      details: '照明の改善、人間工学に基づいた椅子の導入、休憩スペースの拡充',
      status: '進行中',
      owner: '管理部',
      deadline: '2025年6月'
    },
    { 
      id: 'imp2', 
      category: 'growth', 
      text: '研修プログラムの拡充', 
      details: '外部研修への参加支援拡大、オンライン学習プラットフォームの導入',
      status: '計画中',
      owner: '人事部',
      deadline: '2025年9月'
    },
    { 
      id: 'imp3', 
      category: 'leadership', 
      text: 'マネジメント研修の実施', 
      details: '全管理職を対象としたリーダーシップ研修の実施、360度評価の導入',
      status: '完了',
      owner: '人事部',
      deadline: '2025年3月'
    },
    { 
      id: 'imp4', 
      category: 'compensation', 
      text: '評価制度の見直し', 
      details: '成果ベースの評価制度の導入、評価基準の明確化、フィードバックの頻度増加',
      status: '進行中',
      owner: '人事部',
      deadline: '2025年7月'
    },
    { 
      id: 'imp5', 
      category: 'communication', 
      text: '定期的な全体ミーティングの開催', 
      details: '月次の全社ミーティング、部門間交流会の実施',
      status: '実施中',
      owner: '経営企画',
      deadline: '継続的'
    },
    { 
      id: 'imp6', 
      category: 'worklife', 
      text: 'フレックスタイム制度の拡充', 
      details: 'コアタイムの短縮、リモートワーク日数の増加',
      status: '計画中',
      owner: '人事部',
      deadline: '2025年10月'
    },
    { 
      id: 'imp7', 
      category: 'overall', 
      text: '社内コミュニケーションツールの導入', 
      details: '新しいチャットツールの導入、情報共有プラットフォームの整備',
      status: '進行中',
      owner: '情報システム部',
      deadline: '2025年5月'
    }
  ];

  // スコアデータと質問データの統合
  const mergedData = scoreData.map((score) => {
    const category = categories.find(c => c.id === score.categoryId)?.category || `カテゴリー ${score.categoryId}`
    return {
      ...score,
      category,
      question: '質問内容が登録されていません。',
    }
  })

  // =========== EngagementSurveyChart向けの追加ダミーデータ ==========
  // 予測値計算関数
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

  // チャートデータ生成関数
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

  // インサイトテキスト
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

  // 改善計画ダミーデータ
  const improvementPlans = [];

  const organizationName = `営業部`;

  // ========== 副作用 ==========
  // URLパラメータから部門IDを取得
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const queryParams = new URLSearchParams(window.location.search)
      const departmentId = queryParams.get('departmentId')
      const departmentMapping = {
        sales: '営業部',
        dev: '開発部',
        admin: '管理部',
        marketing: 'マーケティング部',
        hr: '人事部',
        accounting: '経理部',
        support: '顧客サポート部'
      }
      if (departmentId && departmentMapping[departmentId]) {
        setSelectedDept(departmentMapping[departmentId])
      }
    }
  }, [])

  // サーベイ日時データの生成（初回のみ実行）
  useEffect(() => {
    if (dataGenerated.current) return
    const departments = ['営業部', '開発部', '管理部', 'マーケティング部', '人事部', '経理部', '顧客サポート部']
    const surveyDates = ['2024年8月', '2024年11月', '2025年2月']
    setAllSurveyDates(surveyDates)
    
    // 日付ごとの部署データを生成
    const dateData = {}
    surveyDates.forEach((date) => {
      // 全部署のデータを生成
      dateData[date] = generateDepartmentMatrixData(categories);
    });
    
    setDepartmentData(dateData)
    if (!selectedDept) setSelectedDept(departments[0])
    if (!selectedSurveyDate && surveyDates.length > 0) {
      setSelectedSurveyDate(surveyDates[surveyDates.length - 1])
    }
    dataGenerated.current = true
  }, [])

  // 選択されたサーベイ日時が変更された場合に表示データを更新
  useEffect(() => {
    if (selectedSurveyDate && departmentData[selectedSurveyDate]) {
      setCurrentData(departmentData[selectedSurveyDate])
    }
  }, [selectedSurveyDate, departmentData])

  // 履歴データ生成（初回実行または selectedYears 変更時）
  useEffect(() => {
    if (!fullHistory) {
      const generatedData = generateHistoryData('2025-02-07', 5)
      setFullHistory(generatedData || [])
      if (generatedData && generatedData.length > 0) {
        const filteredHistory = generatedData.slice(-(selectedYears * 2 + 1))
        setLatestScore(filteredHistory.length > 0 ? filteredHistory[filteredHistory.length - 1].score : 0)
      } else {
        setLatestScore(0)
      }
    } else {
      const filteredHistory = fullHistory.slice(-(selectedYears * 2 + 1))
      setLatestScore(filteredHistory.length > 0 ? filteredHistory[filteredHistory.length - 1].score : 0)
    }
  }, [selectedYears, fullHistory])

  // 表示状態の変更をローカルストレージに記録し、状態を更新
  const handleStateChange = (newState) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('surveyDisplayState', newState)
    }
    setCurrentViewState(newState)
  }

  if (!fullHistory) return <div className="p-8 text-center">データを読み込み中...</div>

  // QuestionnaireScoreコンポーネントへ渡すスコアデータ
  const finalScoreData = {
    score: latestScore || 0,
    prevDiff: '+0.5',
    companyAvg: '58.9 (-3.6)',
    rating: 55,
    ratingLabel: 'BB',
    history: fullHistory || [],
    setSelectedYears,
    selectedYears,
  }

  // SurveyStatusViewへ渡すためのprops
  const viewProps = {
    currentRate,
    rateHistory,
    challengeData,
    challengeCategories,
    selectedDept,
    setSelectedDept,
    selectedSurveyDate,
    setSelectedSurveyDate,
    allSurveyDates,
    categories: categories.map(cat => cat.category),
    currentData,
    departmentSummaryData,
    mergedData,
    comparisonPeriod,
    setComparisonPeriod,
    engagementSurveyData: engagementMergedData,
    managerScoreData: managerMergedData,
    questionData: transformedQuestionData,
    allImprovementItems: questionSelectionItems,
    improvementPlans,
    calculatePredictionValue,
    getChartData,
    insightTexts,
  }

  return (
    <div className="bg-brand-lightGray min-h-screen flex flex-col">
      {/* ヘッダー */}
      <PersonnelHeader showNav={true} showTenantName={false} />
      <AnalysisImprovementHeader
        analysisPath="/personnel/dashboard"
        improvementPath="/personnel/measures"
      />
      {/* 組織ヘッダーと最終更新日 */}
      <div className="flex justify-between items-center mt-24 mb-4">
        <h2 className="text-xl font-bold pl-6 pt-4 text-gray-900 flex items-center">
          <svg className="w-6 h-6 mr-2 text-brand-teal" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12.75c1.63 0 3.07.39 4.24.9 1.08.48 1.76 1.56 1.76 2.73V18H6v-1.62c0-1.17.68-2.25 1.76-2.73 1.17-.51 2.61-.9 4.24-.9zM18 2v6c0 3.31-2.69 6-6 6s-6-2.69-6-6V2h12zm-2 6V4h-8v4c0 2.21 1.79 4 4 4s4-1.79 4-4z" />
          </svg>
          {organizationName}
        </h2>
        <div className="pr-6 pt-4">
          <LastUpdatedInfo history={fullHistory} />
        </div>
      </div>
      {/* サーベイステータスビューコンポーネント */}
      <SurveyStatusView
        initialState={initialSurveyState}
        surveyData={surveyData}
        viewProps={viewProps}
        scoreData={finalScoreData}
        showToggle={true}
        onStateChange={handleStateChange}
      />
    </div>
  )
}

export default ManagerIssue