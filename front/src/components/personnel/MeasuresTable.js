// front/src/components/personnel/MeasuresTable.js
import React, { useState } from "react";
import dayjs from "dayjs";
import { useRouter } from "next/router"; // Routerをインポート

function StatusBadge({ status }) {
    let bgColor;
    let textColor = "text-white";
    
    switch (status) {
        case "planning":
            bgColor = "bg-brand-teal"; // 計画中 - ティール色
            break;
        case "in_progress":
            bgColor = "bg-brand-cyan"; // 実行中 - シアン色
            break;
        case "systematization":
            bgColor = "bg-brand-orange"; // 仕組み化 - オレンジ色
            break;
        case "archived":
            bgColor = "bg-brand-darkBlue"; // アーカイブ - ダークブルー色
            break;
        default:
            bgColor = "bg-gray-500";
    }
    
    return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
            {status === "planning" ? "計画中" : 
             status === "in_progress" ? "実行中" : 
             status === "systematization" ? "仕組化" : 
             status === "archived" ? "アーカイブ" : status}
        </span>
    );
}

function PulseScore({ score }) {
    const scoreValue = parseFloat(score);
    let color;
    
    if (scoreValue >= 4) {
        color = "text-green-600";
    } else if (scoreValue >= 2.5) {
        color = "text-yellow-600";
    } else {
        color = "text-red-600";
    }
    
    return <span className={`font-medium ${color}`}>{score}</span>;
}

const MeasuresTable = ({ measures, page, totalPages, onPageChange, onOrganizationClick, section }) => {
    const router = useRouter();
    const [sortField, setSortField] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');
    const [expandedRow, setExpandedRow] = useState(null);
    
    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };
    
    // データのソート
    const sortedMeasures = [...measures].sort((a, b) => {
        if (!sortField) return 0;
        
        const aValue = a[sortField];
        const bValue = b[sortField];
        
        if (typeof aValue === 'string') {
            return sortDirection === 'asc' 
                ? aValue.localeCompare(bValue)
                : bValue.localeCompare(aValue);
        }
        
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    });
    
    const renderSortIcon = (field) => {
        if (sortField !== field) return null;
        
        return sortDirection === 'asc' 
            ? <span className="ml-1">↑</span>
            : <span className="ml-1">↓</span>;
    };
    
    // 組織名クリックのハンドラー
    const handleOrganizationClick = (departmentId, e) => {
        e.stopPropagation();
        if (onOrganizationClick) {
            onOrganizationClick(departmentId);
        } else {
            // 明示的に渡されたセクションを使用
            const improvementPath = `/${section}/improvement`;

            // 現在のクエリパラメータを取得して結合
            const currentQuery = { ...router.query };
            const newQuery = {
                ...currentQuery,
                departmentId,
            };

            // 新しいパスと結合したクエリで遷移
            router.push({
                pathname: improvementPath,
                query: newQuery,
            });
        }
    };
    
    return (
        <div className=" bg-gray-100">
            <div className="overflow-x-auto bg-white rounded-lg shadow">
                {/* テーブルヘッダー情報 */}
                <div className="p-4 flex justify-between items-center border-b">
                    <p className="text-sm text-gray-600">
                        {measures.length}件の結果（{totalPages}ページ中{page}ページ目）
                    </p>
                </div>

                {measures.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        表示するデータがありません。フィルター条件を変更してください。
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                            <th 
                                className="px-2 w-24 py-2 text-[15px] bg-brand-darkBlue text-white uppercase tracking-wider cursor-pointer"
                                onClick={() => handleSort('department.name')}
                            >
                                組織名 {renderSortIcon('department.name')}
                            </th>
                            <th 
                                className="px-2 py-2 text-[15px] font-medium bg-brand-darkBlue text-white uppercase tracking-wider cursor-pointer"
                                onClick={() => handleSort('issue_category')}
                            >
                                課題カテゴリ {renderSortIcon('issue_category')}
                            </th>
                            <th className="px-2 py-2 text-[15px] font-medium bg-brand-darkBlue text-white uppercase tracking-wider">
                                施策内容
                            </th>
                            <th 
                                className="px-2 py-2 text-[15px] font-medium bg-brand-darkBlue text-white uppercase tracking-wider cursor-pointer"
                                onClick={() => handleSort('status')}
                            >
                                ステータス {renderSortIcon('status')}
                            </th>
                            <th className="px-2 py-2 text-[15px] font-medium bg-brand-darkBlue text-white uppercase tracking-wider">
                                アクションプラン
                            </th>
                            <th 
                                className="px-2 py-2 text-[15px] font-medium bg-brand-darkBlue text-white uppercase tracking-wider cursor-pointer"
                                onClick={() => handleSort('goal_actual_value')}
                            >
                                スコア {renderSortIcon('goal_actual_value')}
                            </th>
                            <th 
                                className="px-2 py-2 text-[15px] font-medium bg-brand-darkBlue text-white uppercase tracking-wider cursor-pointer"
                                onClick={() => handleSort('deadline')}
                            >
                                期限日 {renderSortIcon('deadline')}
                            </th>
                            <th className="px-2 py-2 text-[15px] font-medium bg-brand-darkBlue text-white uppercase tracking-wider">
                                
                            </th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {sortedMeasures.map((measure) => (
                            <React.Fragment key={measure.id}>
                                <tr 
                                    className={`hover:bg-gray-50 ${expandedRow === measure.id ? 'bg-blue-50' : ''}`}
                                    onClick={() => setExpandedRow(expandedRow === measure.id ? null : measure.id)}
                                >
                                    <td className="px-2 py-2 whitespace-nowrap text-[15px]">
                                        {/* 組織名をクリック可能なリンクにする */}
                                        <button 
                                            onClick={(e) => handleOrganizationClick(measure.department.id, e)}
                                            className="text-brand-cyan hover:underline cursor-pointer"
                                        >
                                            {measure.department.name}
                                        </button>
                                    </td>
                                    <td className="px-2 py-2 whitespace-nowrap text-[15px]">{measure.issue_category}</td>
                                    <td className="px-2 py-2 text-[15px] max-w-xs truncate">{measure.measure_text}</td>
                                    <td className="px-2 py-2 whitespace-nowrap text-[15px]">
                                        <StatusBadge status={measure.status} />
                                    </td>
                                    <td className="px-2 py-2 text-[15px] max-w-xs truncate">{measure.action_plan}</td>
                                    <td className="px-2 py-2 whitespace-nowrap text-[15px]">
                                        <PulseScore score={measure.goal_actual_value} />
                                    </td>
                                    <td className="px-2 py-2 whitespace-nowrap text-[15px]">
                                        {dayjs(measure.deadline).format("YYYY-MM-DD")}
                                    </td>
                                    <td className="px-2 py-2 whitespace-nowrap text-[15px]">
                                        <button className="text-brand-cyan hover:text-brand-teal">
                                            {expandedRow === measure.id ? '閉じる' : '詳細'}
                                        </button>
                                    </td>
                                </tr>
                                {expandedRow === measure.id && (
                                    <tr>
                                        <td colSpan={8} className="bg-gray-50 p-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <h4 className="font-bold text-brand-darkBlue mb-2">施策詳細</h4>
                                                    <p className="text-gray-700">{measure.measure_text}</p>
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-brand-darkBlue mb-2">アクションプラン</h4>
                                                    <p className="text-gray-700">{measure.action_plan}</p>
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-brand-darkBlue mb-2">アクションプラン詳細</h4>
                                                    <p className="whitespace-pre-line text-gray-700">{measure.action_plan_details}</p>
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-brand-darkBlue mb-2">担当者</h4>
                                                    <p className="text-gray-700">{measure.assignee}</p>
                                                    <h4 className="font-bold text-brand-darkBlue mt-4 mb-2">目標値</h4>
                                                    <p className="text-gray-700">実績値: {measure.goal_actual_value} / 期待値: {measure.goal_expected_value}</p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                        </tbody>
                    </table>
                )}
                
                {/* ページネーション */}
                <div className="p-4 flex justify-center">
                    <nav className="flex space-x-1">
                        <button 
                            onClick={() => onPageChange(Math.max(1, page - 1))}
                            disabled={page === 1}
                            className={`px-3 py-1 rounded ${page === 1 ? 'bg-gray-200 text-gray-400' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-100'}`}
                        >
                            前へ
                        </button>
                        {[...Array(totalPages).keys()].map(i => (
                            <button 
                                key={i + 1}
                                onClick={() => onPageChange(i + 1)}
                                className={`px-3 py-1 rounded ${i + 1 === page ? 'bg-brand-cyan text-white' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-100'}`}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button 
                            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                            disabled={page === totalPages}
                            className={`px-3 py-1 rounded ${page === totalPages ? 'bg-gray-200 text-gray-400' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-100'}`}
                        >
                            次へ
                        </button>
                    </nav>
                </div>
            </div>
        </div>
    );
};

export default MeasuresTable;