const SubmitButton = ({ onSubmit, disabled }) => {
    return (
        <button
            onClick={onSubmit}
            disabled={disabled}
            className={`px-6 py-3 text-white font-bold rounded ${
                disabled ? "bg-gray-300 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
            }`}
        >
            送信
        </button>
    );
};

export default SubmitButton;
