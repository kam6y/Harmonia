//front/src/pages/admin/improvement.jsx
import React, { useState, useEffect } from 'react'
import AdminHeader from '@/components/admin/AdminHeader'
import AnalysisImprovementHeader from '@/components/common/AnalysisImprovementHeader'
import ImprovementKanban from '@/components/common/ImprovementKanban'
import PulseSurveyChart from '@/components/common/PulseSurveyChart'
import SuccessCaseHeader from '@/components/common/SuccessCaseHeader'
import SuccessCaseTable from '@/components/common/SuccessCaseTable'
import MeasureModal from '@/components/common/MeasureModal'
import AnalyticsSummary from '@/components/common/AnalyticsSummary'

export default function ManagerDashboardImprovementPage() {
  // 利用可能な組織のダミーデータ
  const organizations = [
    { id: 'AAA', name: '組織AAA' },
  ]

  // 選択された組織のID
  const [selectedOrg, setSelectedOrg] = useState(organizations[0].id)

  // モーダル表示の状態管理
  const [showModal, setShowModal] = useState(false)
  const [selectedMeasure, setSelectedMeasure] = useState(null)

  // 16個の改善項目リスト - PulseSurveyChartコンポーネントに渡す
  const allImprovementItems = [
    { id: 1, text: '業務プロセス改善', category: '効率化' },
    { id: 2, text: '新人研修プログラム', category: '教育' },
    { id: 3, text: '顧客満足度調査', category: 'マーケティング' },
    { id: 4, text: 'リモートワーク環境整備', category: '働き方' },
    { id: 5, text: 'デジタルツール導入', category: 'DX' },
    { id: 6, text: '部門間コミュニケーション強化', category: '組織' },
    { id: 7, text: '顧客フィードバック対応', category: '品質' },
    { id: 8, text: '社内勉強会定例化', category: '文化' },
    { id: 9, text: 'ナレッジ共有システム', category: '情報' },
    { id: 10, text: '定期振り返りミーティング', category: '評価' },
    { id: 11, text: '自動化テスト導入', category: '品質' },
    { id: 12, text: 'ペーパーレス推進', category: '環境' },
    { id: 13, text: '旧システム移行', category: 'レガシー' },
    { id: 14, text: '採用活動刷新', category: '人事' },
    { id: 15, text: '営業資料テンプレート化', category: '標準化' },
    { id: 16, text: '年度目標設定', category: '戦略' },
  ]

  // ImprovementKanbanコンポーネントに渡す詳細なダミーデータ
  const initialImprovements = [
    {
      id: 1,
      title: '業務プロセス改善',
      category: '効率化',
      responsible: '瑠美',
      status: '計画中',
      department: '営業部',
      manager: '佐藤瑠美',
      issue: '営業資料作成に時間がかかりすぎている',
      description:
        '営業部が抱えていた「資料作成の非効率性」という課題に対して、テンプレート化とマニュアル整備を実施。効果的な解決策として評価されました。',
      satisfaction: '+1.2',
      budget: '50万円',
      deadline: '2025年6月30日',
      comments: [
        {
          author: '田中（人事部）',
          date: '2025/03/15',
          text: 'この施策は他部署にも展開できると思います。',
        },
        {
          author: '山田（リンク社）',
          date: '2025/03/18',
          text: '弊社でも同様の取り組みを検討中です。情報共有お願いします。',
        },
      ],
    },
    {
      id: 2,
      title: '新人研修プログラム',
      category: '教育',
      responsible: '健太',
      status: '計画中',
      department: '人事部',
      manager: '高橋健太',
      issue: '新入社員の早期戦力化が課題',
      description: '',
      satisfaction: '+0.8',
      budget: '100万円',
      deadline: '2025年8月15日',
      comments: [],
    },
    {
      id: 3,
      title: '顧客満足度調査',
      category: 'マーケティング',
      responsible: '直子',
      status: '計画中',
      department: 'マーケティング部',
      manager: '鈴木直子',
      issue: '顧客の声を製品開発に活かせていない',
      description: '',
      satisfaction: '+0.6',
      budget: '30万円',
      deadline: '2025年5月20日',
      comments: [],
    },
    {
      id: 4,
      title: 'リモートワーク環境整備',
      category: '働き方',
      responsible: '次郎',
      status: '計画中',
      department: '総務部',
      manager: '佐藤次郎',
      issue: '在宅勤務時の生産性低下',
      description: '',
      satisfaction: '+1.0',
      budget: '200万円',
      deadline: '2025年7月10日',
      comments: [],
    },
    {
      id: 5,
      title: 'デジタルツール導入',
      category: 'DX',
      responsible: '瑠美',
      status: '実行中',
      department: 'IT部',
      manager: null,
      issue: '業務の非効率性と情報共有の遅れ',
      description:
        'IT部が中心となって社内のペーパーレス化と情報共有の迅速化を図るためのデジタルツールを導入。',
      satisfaction: '+1.5',
      budget: '300万円',
      deadline: '2025年9月30日',
      comments: [],
    },
    {
      id: 6,
      title: '部門間コミュニケーション強化',
      category: '組織',
      responsible: '花子',
      status: '実行中',
      department: '経営企画部',
      manager: '山田花子',
      issue: 'サイロ化による情報断絶',
      description:
        '各部門間の情報共有を円滑にするためのクロスファンクショナルな定例会議を導入。',
      satisfaction: '+0.9',
      budget: '10万円',
      deadline: '2025年6月1日',
      comments: [],
    },
    {
      id: 7,
      title: '顧客フィードバック対応',
      category: '品質',
      responsible: '太郎',
      status: '実行中',
      department: 'カスタマーサポート部',
      manager: '伊藤太郎',
      issue: '顧客からの不満の増加',
      description: '',
      satisfaction: '+1.1',
      budget: '50万円',
      deadline: '2025年7月15日',
      comments: [],
    },
    {
      id: 8,
      title: '社内勉強会定例化',
      category: '文化',
      responsible: '裕子',
      status: '実行中',
      department: '人事部',
      manager: '中村裕子',
      issue: '社員のスキル停滞',
      description: '',
      satisfaction: '+0.7',
      budget: '20万円',
      deadline: '2025年5月31日',
      comments: [],
    },
    {
      id: 9,
      title: 'ナレッジ共有システム',
      category: '情報',
      responsible: '健太',
      status: '仕組み化',
      department: 'IT部',
      manager: '高橋健太',
      issue: '社内ノウハウが属人化している',
      description:
        '社内のナレッジやノウハウを蓄積・共有できるプラットフォームを構築し、情報の属人化を解消。',
      satisfaction: '+1.3',
      budget: '150万円',
      deadline: '2025年3月31日',
      comments: [
        {
          author: '田中（人事部）',
          date: '2025/02/10',
          text: 'システム導入後、新人研修での活用も検討しています。',
        },
        {
          author: '高橋（IT部）',
          date: '2025/02/15',
          text: 'アクセス権限の設定について次回会議で確認したいです。',
        },
      ],
    },
    {
      id: 10,
      title: '定期振り返りミーティング',
      category: '評価',
      responsible: '直子',
      status: '仕組み化',
      department: '人事部',
      manager: '鈴木直子',
      issue: '目標と実績の乖離',
      description: '',
      satisfaction: '+0.9',
      budget: '0円',
      deadline: '2025年4月1日',
      comments: [],
    },
    {
      id: 11,
      title: '自動化テスト導入',
      category: '品質',
      responsible: '太郎',
      status: '仕組み化',
      department: '開発部',
      manager: '山本太郎',
      issue: 'テストの手動実行による非効率',
      description: '',
      satisfaction: '+1.4',
      budget: '180万円',
      deadline: '2025年2月28日',
      comments: [],
    },
    {
      id: 12,
      title: 'ペーパーレス推進',
      category: '環境',
      responsible: '次郎',
      status: '仕組み化',
      department: '総務部',
      manager: '佐藤次郎',
      issue: '紙書類の管理コスト増大',
      description: '',
      satisfaction: '+0.6',
      budget: '80万円',
      deadline: '2025年3月15日',
      comments: [],
    },
    {
      id: 13,
      title: '旧システム移行',
      category: 'レガシー',
      responsible: '健太',
      status: 'アーカイブ',
      department: 'IT部',
      manager: '高橋健太',
      issue: '保守コストの増大',
      description:
        'IT部が主導し、メンテナンスコストが高騰していた旧システムから新システムへの完全移行を実施。データ移行とトレーニングを通じてスムーズな移行を実現しました。',
      satisfaction: '+1.6',
      budget: '500万円',
      deadline: '2025年1月31日',
      comments: [
        {
          author: '鈴木（営業部）',
          date: '2025/01/20',
          text: '新システムの操作性が向上し、日々の業務効率が大幅に改善しました。',
        },
        {
          author: '高橋（IT部）',
          date: '2025/01/25',
          text: '保守コストが年間約30%削減できる見込みです。',
        },
        {
          author: '田中（経理部）',
          date: '2025/02/05',
          text: 'レポート機能が充実し、月次集計の工数が半減しました。',
        },
      ],
    },
    {
      id: 14,
      title: '採用活動刷新',
      category: '人事',
      responsible: '裕子',
      status: 'アーカイブ',
      department: '人事部',
      manager: '中村裕子',
      issue: '優秀人材の採用難',
      description: '',
      satisfaction: '+0.8',
      budget: '120万円',
      deadline: '2024年12月20日',
      comments: [],
    },
    {
      id: 15,
      title: '営業資料テンプレート化',
      category: '標準化',
      responsible: '瑠美',
      status: 'アーカイブ',
      department: '営業部',
      manager: '佐藤瑠美',
      issue: '営業資料の品質にばらつき',
      description: '',
      satisfaction: '+1.0',
      budget: '30万円',
      deadline: '2024年11月30日',
      comments: [],
    },
    {
      id: 16,
      title: '年度目標設定',
      category: '戦略',
      responsible: '太郎',
      status: 'アーカイブ',
      department: '経営企画部',
      manager: '伊藤太郎',
      issue: '部門間の目標連動性の欠如',
      description: '',
      satisfaction: '+0.5',
      budget: '0円',
      deadline: '2024年10月31日',
      comments: [],
    },
  ]

  // 施策を選択したときの処理
  const handleMeasureSelect = (measure) => {
    setSelectedMeasure(measure)
    setShowModal(true)
  }

  // 施策を更新したときの処理
  const handleMeasureUpdate = (updatedMeasure) => {
    // 実際のアプリケーションではここでAPI呼び出しなどを行う
    console.log('Updated measure:', updatedMeasure)
    setShowModal(false)
  }

  // PulseSurveyChartコンポーネントに渡すデータの状態
  const [pulseSurveyData, setPulseSurveyData] = useState([])
  const [managerScoreData, setManagerScoreData] = useState([])
  const [chartData, setChartData] = useState([])

  // 分析サマリーデータの状態
  const [analyticsSummaryData, setAnalyticsSummaryData] = useState({
    onTrackMeasures: [
      {
        title: 'デジタルツール導入',
        progress: 75,
        status: '順調',
        color: '#00A3B3',
      },
      {
        title: '部門間コミュニケーション強化',
        progress: 60,
        status: '予定通り',
        color: '#178394',
      },
      {
        title: '顧客フィードバック対応',
        progress: 80,
        status: '前倒し',
        color: '#004259',
      },
    ],
    priorityCategories: [
      { name: 'リモートワーク', gapPercentage: 85, color: '#F29759' },
      { name: '部門間連携', gapPercentage: 72, color: '#FC7F7A' },
      { name: '人材育成', gapPercentage: 65, color: '#00A3B3' },
    ],
    poorPerformingMeasures: [
      {
        title: 'ペーパーレス推進',
        progress: 30,
        status: '遅延',
        color: '#FC7F7A',
      },
      {
        title: '年度目標設定',
        progress: 20,
        status: '効果なし',
        color: '#F29759',
      },
      {
        title: '営業資料テンプレート化',
        progress: 45,
        status: '要見直し',
        color: '#004259',
      },
    ],
    insights: [
      'ITツール導入関連の施策が最も効果が高く、社内スコアを大きく向上させています。',
      'リモートワーク環境の整備は引き続き優先課題となっています。理想値とのギャップが85%と最も大きい状態です。',
      '部門間連携の強化施策を開始して1ヶ月で、関連スコアが0.9ポイント向上しています。',
      '施策の実行段階にある項目が平均して高いスコア上昇を示しており、計画から実行への移行を迅速化すると効果が期待できます。',
    ],
  })

  // 組織が変更されたときに、その組織に応じたデータを生成
  useEffect(() => {
    // パルスサーベイのデータを生成
    const pulseData = [
      {
        categoryId: 101,
        category: 'リモートワークの満足度',
        question:
          'リモートワーク環境やルールが整備され、快適に業務を遂行できる状況。',
        expectation: 3.8,
        expectationDiff: 0.2,
        expectationYoyDiff: 0.4,
        satisfaction: 3.4,
        satisfactionDiff: 0.2,
        satisfactionYoyDiff: 0.3,
      },
      {
        categoryId: 102,
        category: '部署間コミュニケーション',
        question:
          '異なる部署間での情報共有や協力関係が円滑に行われている状態。',
        expectation: 3.7,
        expectationDiff: 0.1,
        expectationYoyDiff: 0.3,
        satisfaction: 3.6,
        satisfactionDiff: 0.3,
        satisfactionYoyDiff: 0.4,
      },
      {
        categoryId: 103,
        category: '新しい技術導入への理解',
        question:
          '新技術やシステムの導入に対して、組織全体が前向きに対応している状況。',
        expectation: 3.6,
        expectationDiff: 0.4,
        expectationYoyDiff: 0.2,
        satisfaction: 3.3,
        satisfactionDiff: 0.1,
        satisfactionYoyDiff: 0.3,
      },
    ]

    // 管理者スコアのデータを生成
    const managerData = [
      {
        categoryId: 1,
        category: '顧客基盤の安定性',
        question:
          '企業が長期間にわたって安定した顧客関係を築き、維持している状態。',
        expectation: 3.7,
        expectationDiff: 0.3,
        expectationYoyDiff: 0.5,
        satisfaction: 3.7,
        satisfactionDiff: 0.6,
        satisfactionYoyDiff: 0.4,
      },
      {
        categoryId: 5,
        category: '連帯感と相互尊重',
        question: '従業員間での団結力と互いの価値観を尊重する文化があること。',
        expectation: 3.7,
        expectationDiff: 0.3,
        expectationYoyDiff: 0.2,
        satisfaction: 3.5,
        satisfactionDiff: 0.2,
        satisfactionYoyDiff: 0.3,
      },
      {
        categoryId: 6,
        category: '魅力的な上司',
        question: '職場において、尊敬できる上司や魅力的な同僚がいること。',
        expectation: 3.8,
        expectationDiff: 0.4,
        expectationYoyDiff: 0.3,
        satisfaction: 3.4,
        satisfactionDiff: 0.3,
        satisfactionYoyDiff: 0.4,
      },
      {
        categoryId: 12,
        category: '上司からの適切な教育・支援',
        question:
          '上司が従業員の成長を支援し、必要な知識やスキルの提供を行っていること。',
        expectation: 3.9,
        expectationDiff: 0.3,
        expectationYoyDiff: 0.4,
        satisfaction: 3.7,
        satisfactionDiff: 0.4,
        satisfactionYoyDiff: 0.5,
      },
      {
        categoryId: 14,
        category: '具体的な目標の共有',
        question: '会社の目標が明確であり、それが従業員と共有されていること。',
        expectation: 4.0,
        expectationDiff: -0.1,
        expectationYoyDiff: -0.2,
        satisfaction: 3.5,
        satisfactionDiff: -0.3,
        satisfactionYoyDiff: -0.1,
      },
    ]

    setPulseSurveyData(pulseData)
    setManagerScoreData(managerData)

    // グラフ用のデータを生成
    const generateChartData = () => {
      // 組織に応じて少し数値を変える
      const seedValue =
        selectedOrg === 'AAA' ? 1.0 : selectedOrg === 'ABA' ? 1.2 : 0.8

      // 5回分のデータポイントを生成
      const data = []
      for (let i = 1; i <= 5; i++) {
        const entry = { id: i }

        // 8つの設問に対する値を生成
        for (let qId = 1; qId <= 8; qId++) {
          const baseSatisfaction = 3 + (Math.random() * 1.5 - 0.75) * seedValue
          const baseExpectation = baseSatisfaction + 0.5 + Math.random() * 0.5

          entry[`satisfaction${qId}`] = parseFloat(baseSatisfaction.toFixed(1))
          entry[`expectation${qId}`] = parseFloat(baseExpectation.toFixed(1))
          entry[`gap${qId}`] = parseFloat(
            (baseExpectation - baseSatisfaction).toFixed(1)
          )
        }

        data.push(entry)
      }

      return data
    }

    setChartData(generateChartData())

    // 選択された組織に基づいて分析サマリーデータを更新
    updateAnalyticsSummaryData(selectedOrg)
  }, [selectedOrg])

  // 選択された組織に基づいて分析サマリーデータを更新する関数
  const updateAnalyticsSummaryData = (orgId) => {
    // 組織ごとに異なるダミーデータを設定
    const orgData = {
      AAA: {
        onTrackMeasures: [
          {
            title: 'デジタルツール導入',
            progress: 75,
            status: '順調',
            color: '#00A3B3',
          },
          {
            title: '部門間コミュニケーション強化',
            progress: 60,
            status: '予定通り',
            color: '#178394',
          },
          {
            title: '顧客フィードバック対応',
            progress: 80,
            status: '前倒し',
            color: '#004259',
          },
        ],
        priorityCategories: [
          { name: 'リモートワーク', gapPercentage: 85, color: '#F29759' },
          { name: '部門間連携', gapPercentage: 72, color: '#FC7F7A' },
          { name: '人材育成', gapPercentage: 65, color: '#00A3B3' },
        ],
        poorPerformingMeasures: [
          {
            title: 'ペーパーレス推進',
            progress: 30,
            status: '遅延',
            color: '#FC7F7A',
          },
          {
            title: '年度目標設定',
            progress: 20,
            status: '効果なし',
            color: '#F29759',
          },
          {
            title: '営業資料テンプレート化',
            progress: 45,
            status: '要見直し',
            color: '#004259',
          },
        ],
        insights: [
          'ITツール導入関連の施策が最も効果が高く、社内スコアを大きく向上させています。',
          'リモートワーク環境の整備は引き続き優先課題となっています。理想値とのギャップが85%と最も大きい状態です。',
          '部門間連携の強化施策を開始して1ヶ月で、関連スコアが0.9ポイント向上しています。',
          '施策の実行段階にある項目が平均して高いスコア上昇を示しており、計画から実行への移行を迅速化すると効果が期待できます。',
        ],
      },
      ABA: {
        onTrackMeasures: [
          {
            title: '社内勉強会定例化',
            progress: 70,
            status: '順調',
            color: '#178394',
          },
          {
            title: '部門間コミュニケーション強化',
            progress: 65,
            status: '予定通り',
            color: '#00A3B3',
          },
          {
            title: 'ナレッジ共有システム',
            progress: 75,
            status: '前倒し',
            color: '#004259',
          },
        ],
        priorityCategories: [
          { name: '評価制度', gapPercentage: 78, color: '#F29759' },
          { name: 'オンボーディング', gapPercentage: 65, color: '#FC7F7A' },
          { name: 'キャリア開発', gapPercentage: 60, color: '#00A3B3' },
        ],
        poorPerformingMeasures: [
          {
            title: '採用活動刷新',
            progress: 25,
            status: '停滞',
            color: '#FC7F7A',
          },
          {
            title: '顧客満足度調査',
            progress: 35,
            status: '低効果',
            color: '#F29759',
          },
          {
            title: 'リモートワーク環境整備',
            progress: 40,
            status: '遅延',
            color: '#004259',
          },
        ],
        insights: [
          '組織ABAでは社員教育関連の施策が最も効果を発揮しており、全体的な満足度が0.5ポイント上昇しています。',
          '評価制度の見直しが最も高い優先度となっており、現在のギャップは78%です。',
          'ナレッジ共有システムの導入により、新入社員の立ち上がり期間が平均15%短縮されました。',
          '部門間コミュニケーション強化の取り組みが進んでおり、特にプロジェクト間の情報共有が改善しています。',
        ],
      },
      AAB: {
        onTrackMeasures: [
          {
            title: '顧客フィードバック対応',
            progress: 65,
            status: '順調',
            color: '#178394',
          },
          {
            title: '業務プロセス改善',
            progress: 55,
            status: '予定通り',
            color: '#00A3B3',
          },
          {
            title: '営業資料テンプレート化',
            progress: 70,
            status: '前倒し',
            color: '#004259',
          },
        ],
        priorityCategories: [
          { name: '技術研修', gapPercentage: 90, color: '#F29759' },
          { name: 'チーム協働', gapPercentage: 83, color: '#FC7F7A' },
          { name: 'マネジメント', gapPercentage: 77, color: '#00A3B3' },
        ],
        poorPerformingMeasures: [
          {
            title: '新人研修プログラム',
            progress: 15,
            status: '見直し必須',
            color: '#FC7F7A',
          },
          {
            title: 'ペーパーレス推進',
            progress: 30,
            status: '停滞',
            color: '#F29759',
          },
          {
            title: '社内勉強会定例化',
            progress: 40,
            status: '効果低下',
            color: '#004259',
          },
        ],
        insights: [
          '組織AABは全体的なスコアが3.2と他組織より低めですが、着実に改善しています（+0.2）。',
          '技術研修の強化が最優先課題で、理想とのギャップが90%と非常に大きい状態です。',
          '顧客フィードバック対応の改善施策が最も効果を上げており、お客様満足度が向上しています。',
          'マネジメント層への研修が計画段階にあり、実施されれば現在の課題の多くが解消される見込みです。',
        ],
      },
    }

    // 選択された組織のデータが存在する場合、分析サマリーデータを更新
    if (orgData[orgId]) {
      setAnalyticsSummaryData(orgData[orgId])
    }
  }

  // 組織選択ハンドラー
  const handleOrganizationSelect = (orgId) => {
    setSelectedOrg(orgId)
  }

  // 成功事例のダミーデータ（SuccessCaseTableから移植）
  const successCasesData = [
    {
      title: 'リモートワーク導入',
      category: '働き方',
      issue: '出社の負担軽減',
      manager: '山田太郎',
      department: '人事部',
      description:
        '週2回のリモートワークを導入し、通勤時間の削減と働き方の柔軟性を向上させました。',
    },
    {
      title: '営業支援ツール導入',
      category: '効率化',
      issue: '顧客管理の煩雑さ',
      manager: '佐藤次郎',
      department: '営業部',
      description:
        'CRMツールを導入し、顧客データの一元管理と営業活動の効率化を実現しました。',
    },
    {
      title: '新人研修プログラム改善',
      category: '教育',
      issue: '早期戦力化',
      manager: '鈴木花子',
      department: '人事部',
      description:
        '実践型のカリキュラムを取り入れ、新入社員の早期スキルアップを実現しました。',
    },
    {
      title: 'SNSマーケティング強化',
      category: 'マーケティング',
      issue: '若年層へのリーチ不足',
      manager: '高橋健太',
      department: 'マーケティング部',
      description:
        'Instagram広告とインフルエンサー施策により、Z世代への認知度が30%向上しました。',
    },
  ]

  // ユニークなカテゴリのリストを抽出
  const categories = [...new Set(successCasesData.map((item) => item.category))]

  return (
    <div className="bg-brand-lightGray min-h-screen">
      {/* 管理者専用ヘッダーを使用 */}
      <AdminHeader />
      <AnalysisImprovementHeader 
        analysisPath="/admin/dashboard" 
        improvementPath="/admin/measures" 
      />
      <main className="bg-brand-lightGray pt-28">
        <div className="bg-white border-l-4 border-brand-cyan rounded-lg p-4 mx-6 mt-2 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-6 w-6 mt-[1px] text-brand-cyan"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-brand-darkBlue font-semibold text-lg">
                配下の組織の施策の経過を確認し、社内の事例を用いてブラッシュアップしましょう！
              </p>
            </div>
          </div>
        </div>

        {/* 看板コンポーネント */}
        <ImprovementKanban
          selectedOrganization={selectedOrg}
          initialImprovements={initialImprovements}
          onMeasureSelect={handleMeasureSelect}
          showRegisterButton={false}
        />

        {/* 分析サマリーセクション */}
        <AnalyticsSummary summaryData={analyticsSummaryData} />

        {/* パルスサーベイ結果推移グラフ - 必要なデータをすべて渡す */}
        <PulseSurveyChart
          selectedOrganization={selectedOrg}
          pulseSurveyData={pulseSurveyData}
          managerScoreData={managerScoreData}
          questionData={chartData}
          allImprovementItems={allImprovementItems}
        />

        <div className="px-6 pb-4">
          <SuccessCaseHeader />
          <div className="bg-white rounded-lg shadow-md p-4">
            <SuccessCaseTable data={successCasesData} categories={categories} />
          </div>
        </div>
      </main>

      {/* 施策詳細モーダル */}
      {showModal && (
        <MeasureModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          measure={selectedMeasure}
          onUpdate={handleMeasureUpdate}
        />
      )}
    </div>
  )
}
