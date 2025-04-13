import React from 'react'
import PropTypes from 'prop-types'
import { GiRingedPlanet } from 'react-icons/gi'
import { FiAlertTriangle } from 'react-icons/fi'
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi'

const AnswerRateTransition = ({ currentRate, rateHistory }) => {
  const prevRate = rateHistory.length > 1 ? rateHistory[rateHistory.length - 2]?.rate || 0 : 0
  const isPositiveChange = currentRate > prevRate
  const isLowRate = currentRate < 50
  
  // 解答率に基づいて色を決定
  const getRateColor = (rate) => {
    if (rate === null) return 'text-gray-400'
    if (rate < 50) return 'text-brand-coral'
    if (rate >= 70) return 'text-brand-cyan'
    return 'text-brand-orange'
  }
  
  // 増減に基づいて前回比の色とアイコンを決定
  const getTrendInfo = (current, previous) => {
    if (current === null || previous === null) return { color: 'text-gray-400', icon: null }
    const diff = current - previous
    if (diff > 0) return { color: 'text-green-500', icon: <FiTrendingUp className="inline ml-1" /> }
    if (diff < 0) return { color: 'text-brand-coral', icon: <FiTrendingDown className="inline ml-1" /> }
    return { color: 'text-gray-500', icon: null }
  }

  return (
    <div className="bg-white p-6 mx-4 my-4 rounded-xl  w-auto ">
      <div className="flex flex-col lg:flex-row justify-between ">
        {/* 解答率 */}
        <div className=" flex flex-col">
          <h2 className="text-md font-semibold text-gray-700 mb-3 flex items-center">
            <span className="bg-brand-darkBlue w-2 h-6 rounded-sm mr-2 inline-block"></span>
            解答率
          </h2>
          <div className="flex items-center">
            <div className={`relative ${isLowRate ? 'animate-pulse' : ''}`}>
              <span className={`text-7xl font-bold transition-colors duration-300 ${getRateColor(currentRate)}`}>
                {currentRate}
              </span>
              <span className="text-4xl font-bold text-gray-600 ml-1">%</span>
              
              {isLowRate && (
                <div className="absolute -top-4 -right-4">
                  <FiAlertTriangle className="text-2xl text-brand-coral" />
                </div>
              )}
            </div>
            
            {isPositiveChange && (
              <div className="relative ml-6">
                <div className="bg-gradient-to-r from-brand-cyan to-brand-teal text-white p-3 rounded-lg text-sm max-w-[180px] shadow-lg">
                  <p>
                    解答率が前回と比べて<br />
                    上昇しています！<br />
                    この調子！
                  </p>
                </div>
                <div className="absolute -left-2 top-1/2 transform -translate-y-1/2">
                  <div className="w-0 h-0 border-t-8 border-r-8 border-b-8 border-transparent border-r-brand-cyan" />
                </div>
                <div className="absolute -left-10 top-1/2 transform -translate-y-1/2">
                  <GiRingedPlanet className="text-3xl text-brand-darkBlue" />
                </div>
              </div>
            )}
          </div>
          
          {/* 前回との比較 */}
          <div className="mt-4 flex items-center">
            <span className="text-sm text-gray-500">前回比:</span>
            <span className={`ml-2 text-sm font-medium ${getTrendInfo(currentRate, prevRate).color}`}>
              {currentRate !== null && prevRate !== null 
                ? `${(currentRate - prevRate).toFixed(1)}%` 
                : '-'
              }
              {getTrendInfo(currentRate, prevRate).icon}
            </span>
          </div>
        </div>
        
        {/* 解答率推移 */}
        <div className="lg:w-2/3">
          <h2 className="text-md font-semibold text-gray-700 mb-3 flex items-center">
            <span className="bg-brand-cyan w-2 h-6 rounded-sm mr-2 inline-block"></span>
            解答率推移
          </h2>
          <div className="overflow-x-auto">
            <div className="bg-brand-lightGray p-4 rounded-lg">
              <div className="flex justify-between mb-6">
                {rateHistory.map((item, index) => (
                  <div key={item.date} className="flex flex-col items-center">
                    <div className="text-sm font-medium text-gray-600 mb-2">{item.date}</div>
                    <div className={`text-2xl font-bold ${getRateColor(item.rate)}`}>
                      {item.rate !== null ? `${item.rate}%` : '-'}
                    </div>
                    
                    
                    
                  </div>
                ))}
              </div>
              
              
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

AnswerRateTransition.propTypes = {
  currentRate: PropTypes.number.isRequired,
  rateHistory: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string.isRequired,
      rate: PropTypes.number,
    })
  ).isRequired,
}

export default AnswerRateTransition