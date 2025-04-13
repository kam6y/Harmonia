import Link from "next/link";
import { useRouter } from "next/router";
import Image from "next/image";

const AnalysisImprovementHeader = ({ analysisPath = "/dashboard", improvementPath = "/measures" }) => {
  const router = useRouter();
  const currentPath = router.pathname;
  const currentQuery = router.query;
  
  // 分析に関連するパスの配列
  const analysisPaths = [analysisPath, "/manager/issue", "/personnel/issue", "/admin/issue"];
  
  // 改善に関連するパスの配列
  const improvementPaths = [improvementPath, "/manager/dashboard_improvement", "/personnel/improvement", "/admin/improvement"];
  
  // 現在のパスが分析パスのいずれかに該当するかをチェック
  const isAnalysisActive = analysisPaths.includes(currentPath);
  
  // 現在のパスが改善パスのいずれかに該当するかをチェック
  const isImprovementActive = improvementPaths.includes(currentPath);

  // クエリパラメータを維持しつつ、idパラメータを数値に変換して department_id に置換してhrefを生成する関数
  const generateHrefWithQuery = (basePath) => {
    const queryCopy = { ...currentQuery };
    if (queryCopy.id) {
      // id が数値として解釈可能か確認
      const idNumber = parseInt(queryCopy.id, 10);
      if (!isNaN(idNumber)) {
        queryCopy.department_id = idNumber;
      } else {
        // 数値でなければそのままセットするか、または別の処理を検討
        queryCopy.department_id = queryCopy.id;
      }
      delete queryCopy.id;
    }
    const queryString = new URLSearchParams(queryCopy).toString();
    return queryString ? `${basePath}?${queryString}` : basePath;
  };

  const analysisHref = generateHrefWithQuery(analysisPath);
  const improvementHref = generateHrefWithQuery(improvementPath);

  return (
    <div className="fixed top-12 left-0 right-0 w-full bg-brand-lightGray py-1 px-12 border-b border-gray-300 flex items-center space-x-4 z-40 shadow-sm">
      {/* 分析ボタン */}
      <Link href={analysisHref} passHref>
        <button
          className={`px-4 py-2 rounded-md flex justify-center items-center space-x-2 transition-all ${
            isAnalysisActive
              ? "text-base bg-gray-200 text-gray-900 font-semibold"
              : "text-sm text-gray-600 hover:text-gray-900"
          }`}
        >
          <Image
            src="/images/analysis.svg"
            alt="analysis"
            width={20}
            height={20}
          />
          <span>分析</span>
        </button>
      </Link>

      {/* 改善ボタン */}
      <Link href={improvementHref} passHref>
        <button
          className={`px-4 pt-1 pb-2 rounded-md flex justify-center items-center space-x-2 transition-all ${
            isImprovementActive
              ? "text-base bg-gray-200 text-gray-900 font-semibold"
              : "text-sm text-gray-600 hover:text-gray-900"
          }`}
        >
          <Image
            src="/images/improvement.svg"
            alt="improvement"
            width={20}
            height={20}
          />
          <span className="mt-1">改善</span>
        </button>
      </Link>
    </div>
  );
};

export default AnalysisImprovementHeader;