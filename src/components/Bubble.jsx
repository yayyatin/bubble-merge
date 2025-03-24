import React from 'react'

const Bubble = ({ 
  position, 
  size, 
  isAnimating = false, 
  isHighlighted = false, 
  isSelected = false, 
  onClick, 
  number = 1, 
  isTutorial = false,
  style = {},
  colors = {
    bubble: {
      primary: 'rgba(59, 130, 246, 0.8)', // Default blue
      gradient: 'rgba(37, 99, 235, 0.8)',
      shine: 'rgba(255, 255, 255, 0.5)'
    },
    selected: {
      primary: 'rgba(76, 175, 80, 0.9)', // Default green
      gradient: 'rgba(56, 142, 60, 0.8)',
      shine: 'rgba(255, 255, 255, 0.5)'
    }
  }
}) => {
  if (!position) return null
  
  // Determine which color set to use
  const colorSet = isHighlighted ? colors.selected : colors.bubble
  
  return (
    <div 
      className={`absolute transition-transform ${!isAnimating ? 'floating' : ''} 
        cursor-pointer hover:brightness-110`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        filter: isHighlighted ? 'brightness(1.2)' : 'none',
        zIndex: isHighlighted ? 40 : 30,
        ...style
      }}
      onClick={onClick}
    >
      <svg 
        viewBox="0 0 32 32" 
        className="w-full h-full"
        style={{ 
          filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.3))'
        }}
      >
        <radialGradient
          id={`bubble-gradient-${number}-${isHighlighted ? 'highlighted' : 'normal'}`}
          cx="30%"
          cy="30%"
          r="70%"
          fx="30%"
          fy="30%"
        >
          <stop offset="0%" stopColor={colorSet.primary} />
          <stop offset="100%" stopColor={colorSet.gradient} />
        </radialGradient>
        <circle 
          cx="16" 
          cy="16" 
          r="14" 
          fill={`url(#bubble-gradient-${number}-${isHighlighted ? 'highlighted' : 'normal'})`}
        />
        <circle cx="12" cy="12" r="4" fill={colorSet.shine}/>
      </svg>
      {!isTutorial && (
        <span className={`absolute inset-0 flex items-center justify-center text-white font-bold ${size.fontSize}`}>
          {number}
        </span>
      )}
    </div>
  )
}

export default Bubble 