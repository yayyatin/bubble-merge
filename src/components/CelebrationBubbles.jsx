import React, { useEffect, useState } from 'react'

const CelebrationBubbles = ({ isActive, targetSize, onComplete, colors }) => {
  const [bubbles, setBubbles] = useState([])
  
  // Default colors if none provided
  const bubbleColors = colors?.bubble || {
    primary: 'rgba(59, 130, 246, 0.9)',
    gradient: 'rgba(37, 99, 235, 0.8)',
    shine: 'rgba(255, 255, 255, 0.5)'
  }
  
  useEffect(() => {
    if (isActive) {
      // Create 10-12 bubbles
      const bubbleCount = Math.floor(Math.random() * 3) + 10 // 10-12 bubbles
      const newBubbles = []
      
      // Screen dimensions
      const screenWidth = window.innerWidth
      
      // Create bubbles with random positions and delays - with shorter durations
      for (let i = 0; i < bubbleCount; i++) {
        newBubbles.push({
          id: `celebration-bubble-${i}`,
          left: Math.random() * (screenWidth - 100) + 50, // Random horizontal position (50px from edges)
          delay: Math.random() * 0.8, // Reduced delay up to 0.8s (was 1.5s)
          duration: 2 + Math.random() * 1, // Reduced duration between 2-3s (was 3-5s)
          size: targetSize.width * (0.7 + Math.random() * 0.6), // Size variation based on target bubble
          rotation: Math.random() * 360, // Random initial rotation
          wobbleAmount: Math.random() * 30 + 10 // Random wobble amount
        })
      }
      
      setBubbles(newBubbles)
      
      // Call onComplete after the longest bubble animation finishes
      const maxDuration = Math.max(...newBubbles.map(b => b.duration + b.delay)) * 1000
      const timer = setTimeout(() => {
        onComplete && onComplete()
      }, maxDuration + 300) // Reduced buffer (was 500ms)
      
      return () => clearTimeout(timer)
    } else {
      setBubbles([])
    }
  }, [isActive, targetSize, onComplete])
  
  if (!isActive || bubbles.length === 0) return null
  
  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {bubbles.map(bubble => (
        <div
          key={bubble.id}
          className="absolute rounded-full celebration-bubble"
          style={{
            left: `${bubble.left}px`,
            bottom: '-100px', // Start below the screen
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            '--wobble-amount': `${bubble.wobbleAmount}px`,
            '--delay': `${bubble.delay}s`,
            '--duration': `${bubble.duration}s`,
            background: `radial-gradient(circle at 30% 30%, ${bubbleColors.primary}, ${bubbleColors.gradient})`,
            boxShadow: 'inset 5px 5px 15px rgba(255, 255, 255, 0.3), inset -5px -5px 15px rgba(0, 0, 0, 0.2)',
            transform: `rotate(${bubble.rotation}deg)`,
          }}
        >
          {/* Bubble shine effect */}
          <div 
            className="absolute rounded-full"
            style={{
              width: '20%',
              height: '20%',
              left: '20%',
              top: '20%',
              background: bubbleColors.shine
            }}
          />
        </div>
      ))}
    </div>
  )
}

export default CelebrationBubbles 