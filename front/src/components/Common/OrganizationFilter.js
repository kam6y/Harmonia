// front/src/components/common/OrganizationFilter.js
import React, { useState, useEffect } from "react";

const OrganizationFilter = ({ onFilterApply, initialFilters = {} }) => {
    const [department, setDepartment] = useState(initialFilters.department || "");
    const [status, setStatus] = useState(initialFilters.status || "");
    const [score, setScore] = useState(initialFilters.score || "");
    const [isFiltered, setIsFiltered] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // 組織（部門）データの取得
    useEffect(() => {
        const fetchDepartments = async () => {
            setLoading(true);
            try {
                const response = await fetch("http://localhost/api/departments");
                if (response.ok) {
                    const data = await response.json();
                    setDepartments(data);
                }
            } catch (error) {
                console.error("部門データの取得に失敗しました:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDepartments();
    }, []);

    // 組織のサジェスト候補をフィルタリング
    const filteredDepartments = department
        ? departments.filter(dept => dept.name.toLowerCase().includes(department.toLowerCase()))
        : [];

    const handleReset = () => {
        setDepartment("");
        setStatus("");
        setScore("");
        
        const resetFilters = { department: "", status: "", score: "" };
        onFilterApply(resetFilters);
        setIsFiltered(false);
    };

    const handleSearch = () => {
        const filters = {
            department,
            status,
            score
        };
        onFilterApply(filters);
        setIsFiltered(true);
        setShowSuggestions(false);
    };

    const handleDepartmentSelect = (deptName) => {
        setDepartment(deptName);
        setShowSuggestions(false);
    };

    return (
        <div className={` mt-2 mx-8 p-4 bg-white rounded-lg shadow-lg ${isFiltered ? 'border-l-4 border-brand-cyan' : ''}`}>
            <div className="flex flex-wrap items-center gap-4 relative">
                {/* 組織検索（テキスト入力） */}
                <div className="flex flex-col">
                    <label className="text-gray-600 mb-1" htmlFor="department">
                        組織：
                    </label>
                    <input
                        id="department"
                        type="text"
                        value={department}
                        placeholder="組織名を入力"
                        onChange={(e) => {
                            setDepartment(e.target.value);
                            setShowSuggestions(true);
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-brand-cyan"
                        style={{ minWidth: "250px" }}
                    />
                    {showSuggestions && department && filteredDepartments.length > 0 && (
                        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto">
                            {filteredDepartments.map(dept => (
                                <li
                                    key={dept.id}
                                    onClick={() => handleDepartmentSelect(dept.name)}
                                    className="p-2 hover:bg-gray-100 cursor-pointer"
                                >
                                    {dept.name}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* ステータス */}
                <div className="flex flex-col">
                    <label className="text-gray-600 mb-1" htmlFor="status">
                        ステータス：
                    </label>
                    <select
                        id="status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-brand-cyan"
                    >
                        <option value="">全て</option>
                        <option value="planning">計画中</option>
                        <option value="in_progress">進行中</option>
                        <option value="systematization">仕組化</option>
                        <option value="archived">アーカイブ済</option>
                    </select>
                </div>

                {/* スコア */}
                <div className="flex flex-col">
                    <label className="text-gray-600 mb-1" htmlFor="score">
                        スコア：
                    </label>
                    <select
                        id="score"
                        value={score}
                        onChange={(e) => setScore(e.target.value)}
                        className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-brand-cyan"
                    >
                        <option value="">全て</option>
                        <option value="high">高（4以上）</option>
                        <option value="medium">中（2.5〜4未満）</option>
                        <option value="low">低（2.5未満）</option>
                    </select>
                </div>

                {/* ボタン */}
                <div className="flex items-center space-x-2 ml-auto mt-6">
                    <button
                        onClick={handleReset}
                        className="px-4 py-2 bg-brand-coral text-white rounded-md hover:bg-opacity-80 transition-colors duration-200"
                    >
                        リセット
                    </button>
                    <button 
                        onClick={handleSearch}
                        className="px-4 py-2 bg-brand-cyan text-white rounded-md hover:bg-opacity-80 transition-colors duration-200"
                    >
                        検索
                    </button>
                </div>
            </div>
            
            {isFiltered && (
                <div className="mt-4 text-sm text-brand-darkBlue">
                    <span className="font-medium">適用中のフィルター: </span>
                    {department && <span className="inline-block bg-brand-lightGray px-2 py-1 mr-2 rounded-full">組織: {department}</span>}
                    {status && <span className="inline-block bg-brand-lightGray px-2 py-1 mr-2 rounded-full">
                        ステータス: {
                            status === "planning" ? "計画中" : 
                            status === "in_progress" ? "進行中" : 
                            status === "systematization" ? "仕組化" : 
                            status === "archived" ? "アーカイブ済" : status
                        }
                    </span>}
                    {score && <span className="inline-block bg-brand-lightGray px-2 py-1 mr-2 rounded-full">
                        スコア: {
                            score === "high" ? "高（4以上）" : 
                            score === "medium" ? "中（2.5〜4未満）" : 
                            score === "low" ? "低（2.5未満）" : score
                        }
                    </span>}
                </div>
            )}
        </div>
    );
};

export default OrganizationFilter;