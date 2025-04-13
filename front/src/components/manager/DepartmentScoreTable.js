import React from "react";
import { useRouter } from "next/router";

const DepartmentScoreTable = ({ departmentScores }) => {
    const router = useRouter();

    // departmentScoresが渡されなかった場合はデフォルト値を使用
    const scores = departmentScores || [
        { id: "sales_a", name: "営業部A", score: 41, rating: "BB", diff: -5, prevDiff: -2 },
        { id: "sales_b", name: "営業部B", score: 55, rating: "BBB", diff: +3, prevDiff: +4 },
        { id: "sales_c", name: "営業部C", score: 62, rating: "A", diff: +10, prevDiff: -1 },
    ];

    const handleDepartmentClick = (departmentId) => {
        router.push(`/manager/issue?departmentId=${departmentId}`);
    };

    return (
        <div className="w-full">
            {/* タイトル - マージン下を小さくする */}
            <h2 className="text-xl font-bold mb-2 text-gray-900">管轄部署のスコア</h2>
            
            {/* カード - パディングと最小高さを小さくする */}
            <div className="bg-white shadow-md rounded-lg p-2 w-full min-h-[160px]">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="text-gray-600 text-left border-b">
                            <th className="p-2">部署名</th>
                            <th className="p-2 text-center">スコア</th>
                            <th className="p-2 text-center">前回比</th>
                            <th className="p-2 text-center">レーティング</th>
                            <th className="p-2 text-center">全社平均との差</th>
                        </tr>
                    </thead>
                    <tbody>
                        {scores.map((dept, index) => (
                            <tr
                                key={index}
                                className={`border-b ${
                                    dept.score < 50 ? "bg-red-100" : "bg-white"
                                }`}
                            >
                                <td 
                                    className="p-2 text-brand-cyan cursor-pointer hover:underline"
                                    onClick={() => handleDepartmentClick(dept.id)}
                                >
                                    {dept.name}
                                </td>
                                <td className="p-2 text-center font-bold text-gray-900">{dept.score}</td>
                                <td
                                    className={`p-2 text-center font-semibold ${
                                        dept.prevDiff >= 0 ? "text-green-500" : "text-red-500"
                                    }`}
                                >
                                    {dept.prevDiff > 0 ? `+${dept.prevDiff}` : dept.prevDiff}
                                </td>
                                <td className="p-2 text-center font-semibold text-gray-900">{dept.rating}</td>
                                <td className="p-2 text-center text-gray-900">
                                    {dept.diff > 0 ? `+${dept.diff}` : dept.diff}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DepartmentScoreTable;