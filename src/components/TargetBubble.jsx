import React, { useEffect, useState } from 'react'
import { BUBBLE_SIZES } from '../config/bubbleSizes'

const TargetBubble = ({ 
  targetNumber, 
  isCompleted, 
  isTutorial, 
  currentMergedNumber = 0,
  colors = {
    bubble: {
      primary: 'rgba(59, 130, 246, 0.8)', // Default blue
      gradient: 'rgba(37, 99, 235, 0.8)',
      shine: 'rgba(255, 255, 255, 0.5)'
    }
  }
}) => {
  const size = BUBBLE_SIZES[targetNumber]
  const currentSize = currentMergedNumber > 0 ? BUBBLE_SIZES[currentMergedNumber] : null
  const [octopusEntered, setOctopusEntered] = useState(false)
  
  // Reset animation state when targetNumber changes
  useEffect(() => {
    // Ensure octopus is initially off-screen
    setOctopusEntered(false)
    
    // Use a longer delay to ensure the DOM has updated
    const timer = setTimeout(() => {
      setOctopusEntered(true)
    }, 300) // Increased delay
    
    return () => clearTimeout(timer)
  }, [targetNumber])

  // Get bubble colors
  const bubbleColor = colors?.bubble?.primary || 'rgba(59, 130, 246, 0.8)'
  const bubbleGradient = colors?.bubble?.gradient || 'rgba(37, 99, 235, 0.8)'
  const bubbleShine = colors?.bubble?.shine || 'rgba(255, 255, 255, 0.5)'

  return (
    <div className="absolute top-8 left-8 flex flex-col items-center">
      {/* Container for both octopus images with absolute positioning */}
      <div className="relative" style={{ width: '130px', height: '130px' }}>
        {/* Regular octopus */}
        <img 
          key={`octopus-${targetNumber}`}
          src="/octopus.svg" 
          alt="Octopus" 
          style={{
            position: 'absolute',
            width: '130px',
            height: '130px',
            transform: `translateY(${octopusEntered ? '15px' : '-300px'})`,
            zIndex: 10,
            transition: 'transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease',
            willChange: 'transform, opacity',
            opacity: isCompleted ? 0 : 1
          }}
        />
        
        {/* Happy octopus */}
        <img 
          key={`happy-octopus-${targetNumber}`}
          src="/happy-octopus.svg" 
          alt="Happy Octopus" 
          style={{
            position: 'absolute',
            width: '130px',
            height: '130px',
            transform: `translateY(${octopusEntered ? '15px' : '-300px'})`,
            zIndex: 10,
            transition: 'transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease',
            willChange: 'transform, opacity',
            opacity: isCompleted ? 1 : 0
          }}
        />
      </div>
      
      <div 
        style={{
          width: `${size.width}px`,
          height: `${size.height}px`,
        }}
        className="relative"
      >
        {/* Placeholder or completed bubble */}
        {isCompleted ? (
          <div className="w-full h-full rounded-full relative">
            {/* Completed bubble with gradient */}
            <svg 
              viewBox="0 0 32 32" 
              className="w-full h-full"
              style={{ 
                filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.3))'
              }}
            >
              <radialGradient
                id={`target-bubble-gradient-${targetNumber}`}
                cx="30%"
                cy="30%"
                r="70%"
                fx="30%"
                fy="30%"
              >
                <stop offset="0%" stopColor={bubbleColor} />
                <stop offset="100%" stopColor={bubbleGradient} />
              </radialGradient>
              <circle 
                cx="16" 
                cy="16" 
                r="15" 
                fill={`url(#target-bubble-gradient-${targetNumber})`}
              />
              <circle cx="12" cy="12" r="4" fill={bubbleShine}/>
            </svg>
            
            {/* Number display */}
            <div 
              className={`absolute inset-0 flex items-center justify-center text-white ${size.fontSize} opacity-100`}
            >
              {targetNumber}
            </div>
          </div>
        ) : (
          <div className="target-bubble-border w-full h-full rounded-full">
            {/* Current merged bubble inside placeholder - only show when not completed and has a merged bubble */}
            {currentMergedNumber > 0 && currentSize && (
              <div 
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  width: `${currentSize.width}px`,
                  height: `${currentSize.height}px`,
                }}
              >
                <div 
                  className="w-full h-full rounded-full"
                  style={{
                    background: `radial-gradient(circle at 30% 30%, ${bubbleColor}, ${bubbleGradient})`,
                    opacity: 0.5
                  }}
                ></div>
              </div>
            )}

            {/* Number display - only show if not tutorial */}
            {!isTutorial && (
              <div 
                className={`absolute inset-0 flex items-center justify-center text-white ${size.fontSize} opacity-50`}
              >
                {targetNumber}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default TargetBubble