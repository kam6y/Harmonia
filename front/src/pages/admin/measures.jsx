// front/src/pages/personnel/measures.jsx
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import dynamic from 'next/dynamic'; // dynamicインポートを追加
import AdminHeader from "@/components/admin/AdminHeader";
import AnalysisImprovementHeader from "@/components/common/AnalysisImprovementHeader";
import OrganizationFilter from "@/components/common/OrganizationFilter.js";
import MeasuresTable from "@/components/personnel/MeasuresTable.js";

// 組織図コンポーネントをクライアントサイドのみでレンダリング
const OrganizationChartSection = dynamic(
  () => import('../../components/personnel/OrganizationChartSection'),
  { 
    ssr: false,
    loading: () => <div className="flex justify-center p-6">読み込み中...</div>
  }
);

export default function PersonnelMeasuresPage() {
    const router = useRouter();
    const [measures, setMeasures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState({
        department: "",
        status: "",
        score: "",
    });
    const [orgStats, setOrgStats] = useState({}); // 組織ごとの統計情報
    const [organizations, setOrganizations] = useState([]); // 組織構造データ
    const [orgLoading, setOrgLoading] = useState(true);

// 組織名クリック時のハンドラー
const handleOrganizationClick = (departmentId) => {
    // 現在のクエリパラメータを取得
    const currentQuery = router.query;
    
    // 現在のクエリパラメータを引き継ぎつつ、departmentId を設定
    router.push({
        pathname: "/admin/improvement",
        query: { ...currentQuery, departmentId }
    });
};

    // フィルター適用ハンドラー
    const handleFilterApply = (newFilters) => {
        setFilters(newFilters);
        setPage(1);
        fetchMeasures(1, newFilters);
    };

    const fetchMeasures = async (pageNum, filterParams) => {
        setLoading(true);
        setError(null);
        try {
            // フィルターパラメータをクエリに変換
            const queryParams = new URLSearchParams();
            queryParams.append('page', pageNum);
            
            Object.entries(filterParams).forEach(([key, value]) => {
                if (value) queryParams.append(key, value);
            });
            
            const response = await fetch(`http://localhost/api/measures?${queryParams}`);
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            const data = await response.json();
            setMeasures(data.measures || data);
            setTotalPages(data.totalPages || 1);
        } catch (error) {
            console.error("Error fetching measures:", error);
            setError("データの読み込みに失敗しました。後でもう一度お試しください。");
        } finally {
            setLoading(false);
        }
    };

    // 組織構造と統計情報を取得
    const fetchOrganizationData = async () => {
        setOrgLoading(true);
        try {
            // 実際のAPIエンドポイントが必要です。ここではダミーデータを使用
            // この部分は実際のAPIに合わせて調整してください
            
            // ダミーデータ - 本番環境では実際のAPIから取得
            const orgData = [
                {
                    id: 1,
                    name: '本社',
                    code: '0001',
                    stats: { score: 4.2, measureCount: 15, responseRate: 82 },
                    children: [
                        {
                            id: 2,
                            name: '営業部',
                            code: '0002',
                            stats: { score: 3.8, measureCount: 8, responseRate: 76 },
                            children: []
                        },
                        {
                            id: 3,
                            name: '開発部',
                            code: '0003',
                            stats: { score: 4.5, measureCount: 12, responseRate: 89 },
                            children: []
                        },
                        {
                            id: 4,
                            name: '人事部',
                            code: '0004',
                            stats: { score: 4.1, measureCount: 10, responseRate: 92 },
                            children: []
                        }
                    ]
                }
            ];
            
            setOrganizations(orgData);
            
            // 統計情報をオブジェクトにマッピング
            const statsMap = {};
            const processOrg = (org) => {
                statsMap[org.id] = org.stats;
                if (org.children && org.children.length > 0) {
                    org.children.forEach(processOrg);
                }
            };
            orgData.forEach(processOrg);
            setOrgStats(statsMap);
            
        } catch (error) {
            console.error("Error fetching organization data:", error);
        } finally {
            setOrgLoading(false);
        }
    };

    const tenantName = '大東亜全世界同盟株式会社';

    useEffect(() => {
        fetchMeasures(page, filters);
        fetchOrganizationData();
    }, [page]); // pageが変わったら再フェッチ

    return (
        <div className="bg-brand-lightGray text-black min-h-full">
      {/* 管理者専用ヘッダーを使用 */}
        <AdminHeader />
        <AnalysisImprovementHeader 
        analysisPath="/admin/dashboard" 
        improvementPath="/admin/measures" 
        />

            <h2 className="px-6 text-xl font-bold text-brand-darkBlue pt-28">
                {tenantName}の施策一覧
            </h2>
            <OrganizationFilter onFilterApply={handleFilterApply} initialFilters={filters} />

            <main className="p-6 space-y-6">
                {/* 施策テーブル */}
                <div className="">
                    {loading ? (
                        <div className="flex justify-center items-center min-h-[200px]">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-cyan"></div>
                        </div>
                    ) : error ? (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            <p>{error}</p>
                            <button 
                                onClick={() => fetchMeasures(page, filters)}
                                className="mt-2 text-sm underline hover:text-red-800"
                            >
                                再試行
                            </button>
                        </div>
                    ) : (
                        <MeasuresTable 
                            measures={measures} 
                            page={page}
                            totalPages={totalPages}
                            onPageChange={(newPage) => {/* ページ変更の処理 */}}
                            section="admin" // セクションを明示的に指定
                        />
                    )}
                </div>

                {/* 組織図セクション */}
                <div className="">
                    <h2 className="text-xl font-bold text-brand-darkBlue mb-4">組織構造</h2>
                    {orgLoading ? (
                        <div className="flex justify-center items-center min-h-[200px]">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-cyan"></div>
                        </div>
                    ) : (
                        <OrganizationChartSection 
                            organizations={organizations} 
                            orgStats={orgStats} 
                            onOrganizationClick={handleOrganizationClick} 
                        />
                    )}
                </div>
            </main>
        </div>
    );
}