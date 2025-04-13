import React, { useState, useEffect } from 'react';

const Step1Content = ({
  selectedCategory,
  setSelectedCategory,
  selectedKadai,
  setSelectedKadai,
  handleNext,
  canGoNext,
  allChallenges = [], // 登録された課題リスト
}) => {
  const [availableCategories, setAvailableCategories] = useState([]);
  const [challengesByCategory, setChallengesByCategory] = useState({});

  useEffect(() => {
    if (Array.isArray(allChallenges) && allChallenges.length > 0) {
      const uniqueCategories = [...new Set(allChallenges.map(item => item.category))];
      setAvailableCategories(uniqueCategories);

      const challengeMap = {};
      uniqueCategories.forEach(category => {
        challengeMap[category] = allChallenges
          .filter(item => item.category === category)
          .map(item => ({
            id: item.id,
            challenge: item.challenge
          }));
      });
      setChallengesByCategory(challengeMap);
    }
  }, [allChallenges]);

  const challengesForSelectedCategory = selectedCategory
    ? challengesByCategory[selectedCategory] || []
    : [];

  // handleKadaiChange をオブジェクト単位で処理するように修正
  const handleKadaiChange = (item) => {
    if (selectedKadai.some(selected => selected.id === item.id)) {
      setSelectedKadai(selectedKadai.filter(selected => selected.id !== item.id));
    } else {
      setSelectedKadai([...selectedKadai, item]);
    }
  };

  return (
    <div className="p-2">
      <h2 className="text-3xl font-bold text-brand-teal mb-4">
        解決したい課題を教えてください（複数選択可）
      </h2>
      <div className="bg-brand-lightGray p-3 rounded-lg mb-4 text-sm text-gray-700 border-l-4 border-brand-cyan">
        <div className="flex items-start">
          <svg className="w-5 h-5 mr-2 text-brand-cyan flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <p>複数のカテゴリーや課題に対して、一つの施策で解決することも可能です。関連する課題をすべて選択してください。</p>
        </div>
      </div>
      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">
          課題カテゴリー
        </label>
        <select
          className="border text-white bg-brand-teal border-brand-darkBlue rounded px-3 py-2 w-full md:w-1/2"
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setSelectedKadai([]);
          }}
        >
          <option value="">-- カテゴリーを選択 --</option>
          {availableCategories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">課題</label>
        <div className="flex flex-col gap-2">
          {!selectedCategory ? (
            <p className="text-sm text-gray-500">
              カテゴリーを選択してください
            </p>
          ) : challengesForSelectedCategory.length > 0 ? (
            challengesForSelectedCategory.map((item) => (
              <label key={item.id} className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="mr-2 accent-brand-teal"
                  checked={selectedKadai.some(selected => selected.id === item.id)}
                  onChange={() => handleKadaiChange(item)}
                />
                {item.challenge}
              </label>
            ))
          ) : (
            <p className="text-sm text-gray-500">
              選択されたカテゴリーに課題が登録されていません
            </p>
          )}
        </div>
      </div>
      <div className="flex justify-end mt-8">
        <button
          onClick={handleNext}
          disabled={!canGoNext()}
          className={`px-6 py-2 rounded text-white font-semibold transition-colors ${
            canGoNext()
              ? 'bg-brand-orange hover:bg-brand-coral'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          次へ
        </button>
      </div>
    </div>
  );
};

export default Step1Content;