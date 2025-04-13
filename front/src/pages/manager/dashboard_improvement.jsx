import React, { useState, useEffect } from 'react';
import ManagerHeader from '@/components/manager/ManagerHeader';
import AnalysisImprovementHeader from '@/components/common/AnalysisImprovementHeader';
import ImprovementKanban from '@/components/common/ImprovementKanban';
import OrganizationSelector from '@/components/common/OrganizationSelector';
import PulseSurveyChart from '@/components/common/PulseSurveyChart';
import SuccessCaseHeader from '@/components/common/SuccessCaseHeader';
import SuccessCaseTable from '@/components/common/SuccessCaseTable';
import AnalyticsSummary from "@/components/Common/AnalyticsSummary.jsx";

export default function ManagerDashboardImprovementPage() {
    // 組織情報
    const [organizations, setOrganizations] = useState([]);
    const [selectedOrg, setSelectedOrg] = useState('');
    const [selectedOrgName, setSelectedOrgName] = useState('');

    // 各種データの状態
    const [initialImprovements, setInitialImprovements] = useState([]);
    const [allImprovementItems, setAllImprovementItems] = useState([]);
    const [pulseSurveyData, setPulseSurveyData] = useState([]);
    const [managerScoreData, setManagerScoreData] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [successCasesData, setSuccessCasesData] = useState([]);

    // 分析サマリー用データ
    const [analyticsSummaryData, setAnalyticsSummaryData] = useState(null);
    const [loadingSummary, setLoadingSummary] = useState(false);
    const [errorSummary, setErrorSummary] = useState(null);

    // 組織一覧を取得
    useEffect(() => {
        const parentId = JSON.parse(localStorage.getItem("department_id") || "null");
        const parentName = JSON.parse(localStorage.getItem("department_name") || "null");
        if (!parentId) return;

        fetch(`http://localhost/api/departments/${parentId}/children`)
            .then(res => res.json())
            .then(data => {
                const orgs = data.map(o => ({ id: o.id, name: `組織${o.name}` }));
                // 先頭に親組織を追加
                orgs.unshift({ id: parentId, name: parentName });
                setOrganizations(orgs);
                setSelectedOrg(parentId);
                setSelectedOrgName(parentName);
            })
            .catch(console.error);
    }, []);

    // 施策（改善）のデータ取得
    useEffect(() => {
        if (!selectedOrg) return;
        fetch(`http://localhost/api/improvements/${selectedOrg}`)
            .then(res => res.json())
            .then(data => {
                setInitialImprovements(data);
                const items = data.map(item => ({
                    id: item.issue_category,
                    text: item.title,
                    category: item.category,
                    status: item.status
                }));
                setAllImprovementItems(items);
            })
            .catch(err => console.error('Error fetching improvements:', err));
    }, [selectedOrg]);

    // パルスサーベイデータの取得
    useEffect(() => {
        if (!selectedOrg) return;
        fetch(`http://localhost/api/pulse-survey/${selectedOrg}`)
            .then(res => res.json())
            .then(setPulseSurveyData)
            .catch(err => console.error('Error fetching pulse survey data:', err));
    }, [selectedOrg]);

    // 管理者スコアデータの取得
    useEffect(() => {
        if (!selectedOrg) return;
        fetch(`http://localhost/api/manager-scores/${selectedOrg}`)
            .then(res => res.json())
            .then(setManagerScoreData)
            .catch(err => console.error('Error fetching manager score data:', err));
    }, [selectedOrg]);

    // チャート用データの取得
    useEffect(() => {
        if (!selectedOrg) return;
        fetch(`http://localhost/api/chart-data/${selectedOrg}`)
            .then(res => res.json())
            .then(setChartData)
            .catch(err => console.error('Error fetching chart data:', err));
    }, [selectedOrg]);

    useEffect(() => {
      console.log(chartData)
    　console.log(managerScoreData)
      console.log(allImprovementItems)
    　console.log(initialImprovements)
      console.log(successCasesData)
    }, [chartData,allImprovementItems, initialImprovements, managerScoreData, successCasesData]);


    // 分析サマリーデータの取得
    useEffect(() => {
        if (!selectedOrg) return;
        setLoadingSummary(true);
        setErrorSummary(null);
        fetch(`http://localhost/api/analytics-summary/${selectedOrg}`)
            .then(res => {
                if (!res.ok) throw new Error(`Status ${res.status}`);
                return res.json();
            })
            .then(data => setAnalyticsSummaryData(data))
            .catch(err => {
                console.error('Error fetching analytics summary:', err);
                setErrorSummary(err.message);
            })
            .finally(() => setLoadingSummary(false));
    }, [selectedOrg]);

    // 組織選択時のハンドラー
    const handleOrganizationSelect = (orgId) => {
        setSelectedOrg(orgId);
    };

    // 成功事例のユニークカテゴリを抽出（successCasesData が取得できた場合）
    const categories = successCasesData ? [...new Set(successCasesData.map(item => item.category))] : [];

    // ローカルでチャートデータを生成する関数
    const generateChartData = () => {
        const seedValue =
            selectedOrg === 'AAA' ? 1.0 :
                selectedOrg === 'ABA' ? 1.2 : 0.8;

        const data = [];
        for (let i = 1; i <= 5; i++) {
            const entry = { id: i };
            for (let qId = 1; qId <= 8; qId++) {
                const baseSatisfaction = 3 + (Math.random() * 1.5 - 0.75) * seedValue;
                const baseExpectation = baseSatisfaction + 0.5 + Math.random() * 0.5;
                entry[`satisfaction${qId}`] = parseFloat(baseSatisfaction.toFixed(1));
                entry[`expectation${qId}`] = parseFloat(baseExpectation.toFixed(1));
                entry[`gap${qId}`] = parseFloat((baseExpectation - baseSatisfaction).toFixed(1));
            }
            data.push(entry);
        }
        return data;
    };

    useEffect(() => {
        if (!selectedOrg) return
        fetch(`http://localhost/api/success-cases/${selectedOrg}`)
            .then(res => res.json())
            .then(setSuccessCasesData)
            .catch(err => console.error('Error fetching success cases:', err))
    }, [selectedOrg])

    return (
        <div className="bg-brand-lightGray min-h-screen">
            <ManagerHeader />
            <AnalysisImprovementHeader
                analysisPath="/manager/dashboard_survey"
                improvementPath="/manager/dashboard_improvement"
            />
            <main className="bg-brand-lightGray">
                <div className="mx-6 my-4">
                    <OrganizationSelector
                        organizations={organizations}
                        selectedOrganization={selectedOrg}
                        onSelectOrganization={handleOrganizationSelect}
                    />
                </div>

                <div className="bg-white border-l-4 border-brand-cyan rounded-lg p-4 mx-6 mb-6">
                    <div className="flex items-start">
                        <svg
                            className="h-6 w-6 mt-[1px] text-brand-cyan flex-shrink-0"
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
                        <p className="ml-3 text-brand-darkBlue font-semibold text-lg">
                            配下の組織の施策の経過を確認し、社内の事例を用いてブラッシュアップしましょう！
                        </p>
                    </div>
                </div>

                <ImprovementKanban
                    selectedOrganization={selectedOrg}
                    selectedOrganizationName={selectedOrgName}
                    initialImprovements={initialImprovements}
                />

                <div className="mx-6 mb-6">
                    {loadingSummary && <p>サマリー読み込み中…</p>}
                    {errorSummary && <p className="text-red-500">エラー: {errorSummary}</p>}
                    {analyticsSummaryData && (
                        <AnalyticsSummary summaryData={analyticsSummaryData} />
                    )}
                </div>

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
        </div>
    );
}
