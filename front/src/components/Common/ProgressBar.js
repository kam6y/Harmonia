// ProgressBar.jsx
import React from "react";

function ProgressBar({ progress }) {
    return (
        <div className="w-full max-w-xl mx-auto my-auto mt-2">
            {/* 背景レール部分 */}
            <div className="relative w-full h-8 bg-gray-200 rounded-full shadow-inner overflow-hidden my-auto">
                {/* プログレス部分（ブランドカラーのグラデーション） */}
                <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-brand-teal to-brand-cyan
                     transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                >
                </div>
            </div>
        </div>
    );
}

export default ProgressBar;