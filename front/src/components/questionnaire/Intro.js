import { FaUserShield, FaClipboardCheck, FaQuestionCircle } from "react-icons/fa";

const Intro = ({ onNext }) => {
    return (
        <div className="flex flex-col items-center justify-center">
            {/* カードを横並びに配置 */}
            <div className=" grid w-max grid-cols-1 md:grid-cols-3 gap-4 ">
                
                {/* 調査の目的 */}
                <div className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center text-center max-w-md">
                    <FaClipboardCheck className="text-blue-500 text-6xl mb-6" />
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">調査の目的</h3>
                    <p className="text-lg text-gray-700">
                        このアンケートは、従業員が働きやすい環境を提供するために、組織が抱える課題を早期発見し、
                        適切な施策を講じることを目的としています。
                    </p>
                </div>

                {/* 匿名性について */}
                <div className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center text-center max-w-md">
                    <FaUserShield className="text-green-500 text-6xl mb-6" />
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">匿名性について</h3>
                    <p className="text-lg text-gray-700">
                        本アンケートは匿名で実施され、個人を特定する情報は収集されません。
                        管理職の方々はメールアドレスを記入いただきます。
                    </p>
                </div>

                {/* 回答手順 */}
                <div className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center text-center max-w-md">
                    <FaQuestionCircle className="text-purple-500 text-6xl mb-6" />
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">回答手順</h3>
                    <p className="text-lg text-gray-700">
                        全18項目の質問に対して、満足値と期待値を5段階評価で回答してください。
                    </p>
                </div>
            </div>

            {/* ボタン */}
            <div className="mt-12 text-center">
                <button
                    onClick={onNext}
                    className="px-12 py-4 bg-brand-darkBlue text-white text-lg font-semibold rounded-full shadow-lg hover:bg-brand-cyan transition-all duration-300"
                >
                    確認した
                </button>
            </div>
        </div>
    );
};

export default Intro;
