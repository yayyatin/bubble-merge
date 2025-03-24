import React, { useState, useRef, useEffect } from 'react'

const BubbleGun = ({ onShoot, onPositionChange, disabled, showHandPointer }) => {
  const [isAnimating, setIsAnimating] = useState(false)
  const gunImageRef = useRef(null)

  const handleClick = () => {
    setIsAnimating(true)
    onShoot?.()
    
    // Reset animation after 300ms
    setTimeout(() => {
      setIsAnimating(false)
    }, 300)
  }

  // Update position whenever the component mounts or window resizes
  useEffect(() => {
    const updatePosition = () => {
      if (gunImageRef.current) {
        const rect = gunImageRef.current.getBoundingClientRect()
        console.log('Gun Image Position:', {
          left: Math.round(rect.left),
          top: Math.round(rect.top)
        })
        
        onPositionChange?.({ x: rect.left + 10, y: rect.top - 33 })
      }
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    return () => window.removeEventListener('resize', updatePosition)
  }, [onPositionChange])

  return (
    <div 
      className={`absolute bottom-24 right-64 transition-transform ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'
      } ${isAnimating ? 'scale-95' : ''}`}
      onClick={disabled ? null : handleClick}
    >
      {showHandPointer && (
        <img 
          src="/hand.png" 
          alt="Hand Pointer" 
          className="absolute w-12 h-12 object-contain pointer-events-none hover-animation"
          style={{ 
            top: '70px',
            left: '50px',
            zIndex: 50
          }}
        />
      )}
      <img 
        ref={gunImageRef}
        src="/toy-gun-red.png" 
        alt="Bubble Gun" 
        style={{ 
          transform: 'scaleX(-1) rotate(-20deg)',
          transformOrigin: 'center'
        }}
        className="w-32 h-32 object-contain"
      />
    </div>
  )
}

export default BubbleGun 