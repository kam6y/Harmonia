const NextButton = ({ onClick, disabled, children }) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`px-16 py-3 text-white font-semibold rounded-full transition duration-200 ${
                disabled ? "bg-gray-300 cursor-not-allowed" : "bg-brand-darkBlue hover:bg-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-darkBlue"
            }`}
        >
            {children || "次へ"}
        </button>
    );
};

export default NextButton;