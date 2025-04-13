const Subheader = ({ title }) => {
  return (
    <div className="w-full bg-brand-lightGray py-1 px-12 border-b border-b-gray-300 sticky top-12 z-40">
      <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
    </div>
  );
};

export default Subheader;