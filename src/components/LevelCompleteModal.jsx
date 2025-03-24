import React from 'react'

const LevelCompleteModal = ({ level, targetNumber, onNextLevel }) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-50">
      <div className="bg-white/20 backdrop-blur-md rounded-lg p-8 text-white text-center max-w-md">
        <div className="text-4xl font-bold mb-4">Level Complete!</div>
        
        <div className="text-xl mb-6">
          {level === 0 
            ? "You created bubble number 3!"
            : `You created bubble number ${targetNumber}!`}
        </div>
        
        <button 
          onClick={onNextLevel}
          className="bg-bubble-blue hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-full 
                    transition-all transform hover:scale-105 active:scale-95 shadow-lg"
        >
          Next Level
        </button>
      </div>
    </div>
  )
}

export default LevelCompleteModal 