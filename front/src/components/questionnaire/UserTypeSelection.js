const UserTypeSelection = ({ onSelect, onNext, onBack }) => {
  return (
    <div className="px-16 flex flex-col items-center relative w-max ">
      {/* 見出し */}
      <h2 className="text-2xl md:text-3xl font-bold text-center text-brand-darkBlue flex-grow mb-8">
        STEP1 あなたの役割を選択してください。
      </h2>


      <div className="w-32 h-1 bg-brand-teal mx-auto mb-8 rounded-full opacity-60"></div>

      {/* 選択ボタン */}
      <div className="flex justify-center gap-16 h-auto mb-8">
        {/* 従業員ボタン */}
        <button
          onClick={() => {
            onSelect('employee')
            onNext()
          }}
          className="w-80 h-96 bg-brand-teal hover:bg-brand-cyan transition-colors duration-200 ease-in-out shadow-md rounded-xl flex flex-col items-center justify-center gap-8 text-white text-3xl font-semibold"
        >
          <img
            src="/images/emplyee_avatar.png"
            alt=""
            className="w-48 h-48 rounded-full border-4 border-white shadow-md"
          />
          <p className="text-center text-xl tracking-wide">従業員</p>
        </button>

        {/* 管理職ボタン */}
        <button
          onClick={() => {
            onSelect('manager')
            onNext()
          }}
          className="w-80 h-96 bg-brand-teal hover:bg-brand-cyan transition-colors duration-200 ease-in-out shadow-md rounded-xl flex flex-col items-center justify-center gap-8 text-white text-3xl font-semibold"
        >
          <img
            src="/images/manager_avatar.png"
            alt=""
            className="w-48 h-48 rounded-full border-4 border-white shadow-md"
          />
          <p className="text-center text-xl tracking-wide">管理職</p>
        </button>
      </div>
    </div>
  )
}

export default UserTypeSelection
