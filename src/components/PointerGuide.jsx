import React from 'react'

const PointerGuide = ({ position }) => {
  return (
    <div 
      className="absolute pointer-events-none z-50"
      style={{
        left: `${position.x + 6}px`,
        top: `${position.y + 40}px`
      }}
    >
      <img 
        src="/hand.png" 
        alt="Hand Pointer" 
        className="w-12 h-12 object-contain hover-animation"
      />
    </div>
  )
}

export default PointerGuide 