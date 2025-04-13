import React from 'react';
import ResponseRateSection from './ResponseRateSection';
import SpeedScoreCard from './SpeedScoreCard';
import ChallengeList from '../../components/manager/ChallengeList';

const SurveyInProgressView = ({
  currentRate,
  rateHistory,
  challengeData,
  challengeCategories,
  scoreData,
  tenant_id,
  department_id
}) => {
  return (
    <>
      <div className="grid grid-cols-4 gap-4 mx-6 mb-4 self-stretch">
        <div className="col-span-1 md:col-span-3">
          <ResponseRateSection
            currentRate={currentRate}
            rateComparison="15.0%"
            isPositive={true}
            rateHistory={rateHistory}
            isCompact={true}
          />
        </div>
        <div className="bg-white p-4 rounded shadow">
          <SpeedScoreCard
            score={scoreData?.score}
            ratingLabel={scoreData?.ratingLabel}
            responseRate={currentRate}
          />
        </div>
      </div>
      <div className="mx-6 mt-6">
        <ChallengeList
          challenges={challengeData}
          categories={challengeCategories}
          tenant_id={tenant_id}
          department_id={department_id}
        />
      </div>
    </>
  );
};

export default SurveyInProgressView;