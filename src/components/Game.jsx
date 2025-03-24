import React, { useState, useCallback, useMemo, useEffect } from 'react'
import BubbleGun from './BubbleGun'
import Bubble from './Bubble'
import PointerGuide from './PointerGuide'
import TargetBubble from './TargetBubble'
import CelebrationBubbles from './CelebrationBubbles'
import { animateBubble } from '../utils/bubblePhysics'
import { INITIAL_BUBBLE_SIZE, BUBBLE_SIZES } from '../config/gameConstants'
import { bubbleLayoutManager } from '../utils/bubbleLayoutManager'
import { LEVELS } from '../config/levelConfig'
import popSound from '/pop.mp3'
import levelCompleteSound from '/level_complete.wav'
import { getRandomCompliment } from '../config/compliments'

const CONTAINER_PADDING = 100; // Padding from screen edges

const Game = () => {
  // Get all level numbers in order
  const levelNumbers = useMemo(() => Object.keys(LEVELS).map(Number).sort((a, b) => a - b), []);
  
  const [levelIndex, setLevelIndex] = useState(0)
  const [gunPosition, setGunPosition] = useState(null)
  const [shootingBubbles, setShootingBubbles] = useState([])
  const [bubbles, setBubbles] = useState([])
  const [tutorialStep, setTutorialStep] = useState(0)
  const [selectedBubbleIndex, setSelectedBubbleIndex] = useState(null)
  const [highlightedBubbleIndex, setHighlightedBubbleIndex] = useState(null)
  const [selectedBubbles, setSelectedBubbles] = useState([])
  const [isLevelComplete, setIsLevelComplete] = useState(false)
  const [hasCreatedFirstMerge, setHasCreatedFirstMerge] = useState(false)
  const [poppingBubbles, setPoppingBubbles] = useState([])
  const [containerBounds, setContainerBounds] = useState({
    width: 0,
    height: 0
  });
  const [compliment, setCompliment] = useState(null);
  const [bubbleCount, setBubbleCount] = useState(0);
  const [releasedBubbles, setReleasedBubbles] = useState(0);
  const [targetBubbleCompleted, setTargetBubbleCompleted] = useState(false)
  const [showGameComplete, setShowGameComplete] = useState(false)
  const [mergingBubbles, setMergingBubbles] = useState([]);
  const [mergeFlash, setMergeFlash] = useState(null);
  const [largestMergedNumber, setLargestMergedNumber] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [plusSignDisplay, setPlusSignDisplay] = useState(null);
  const [allowedMistake, setAllowedMistake] = useState(true); // Track if player is allowed one mistake
  const [showOopsMessage, setShowOopsMessage] = useState(false); // State for "Oops! Try again" message
  
  // Get current level details
  const currentLevelNumber = levelNumbers[levelIndex];
  const currentLevel = LEVELS[currentLevelNumber];
  const isTutorial = currentLevel?.isTutorial ?? false;
  
  // Calculate maxBubbles from the availableNumbers object
  const availableNumbersObj = currentLevel?.availableNumbers ?? { 1: 6 };
  const maxBubbles = Object.values(availableNumbersObj).reduce((sum, count) => sum + count, 0);
  
  const targetNumber = currentLevel?.targetNumber ?? 2;
  
  // Create array of available bubble numbers based on the configuration
  const availableNumbers = useMemo(() => {
    const numbersArray = [];
    
    // For each number type and its count in the object
    Object.entries(availableNumbersObj).forEach(([number, count]) => {
      // Add this number to the array 'count' times
      for (let i = 0; i < count; i++) {
        numbersArray.push(parseInt(number));
      }
    });
    
    return numbersArray;
  }, [availableNumbersObj]);

  // Randomly select first bubble when we reach 6 bubbles
  useEffect(() => {
    if (isTutorial && bubbles.length === maxBubbles && selectedBubbleIndex === null) {
      const randomIndex = Math.floor(Math.random() * bubbles.length)
      setSelectedBubbleIndex(randomIndex)
    }
  }, [bubbles.length, isTutorial, selectedBubbleIndex, maxBubbles])

  // Get selected bubble position for pointer
  const selectedBubblePosition = useMemo(() => {
    if (selectedBubbleIndex === null) return null
    return bubbles[selectedBubbleIndex]?.position
  }, [bubbles, selectedBubbleIndex])

  const handleShoot = useCallback(() => {
    // Check if we've already released the maximum number of bubbles
    if (releasedBubbles >= maxBubbles) {
      return;
    }
    
    // Check total bubbles including in-flight ones
    const totalBubbles = bubbles.length + shootingBubbles.length;
    
    if (gunPosition && totalBubbles < maxBubbles) {
      // Increment bubble count when shooting
      setBubbleCount(prev => prev + 1);
      // Increment released bubbles count
      setReleasedBubbles(prev => prev + 1);
      
      const nextPosition = bubbleLayoutManager.findNearestAvailablePosition();
      
      if (!nextPosition) {
        console.log('No available positions!');
        return;
      }

      const bubbleId = Date.now();
      
      // Get the current bubble number based on release count
      // This ensures we release bubbles in order from the availableNumbers array
      const bubbleNumber = availableNumbers[releasedBubbles];
      
      const newShootingBubble = {
        id: bubbleId,
        position: { ...gunPosition },
        size: INITIAL_BUBBLE_SIZE,
        isAnimating: true,
        number: bubbleNumber
      };

      setShootingBubbles(prev => [...prev, newShootingBubble]);

      if (isTutorial && tutorialStep < 6) {
        setTutorialStep(prev => prev + 1);
      }

      animateBubble(
        gunPosition,
        nextPosition,
        INITIAL_BUBBLE_SIZE,
        BUBBLE_SIZES[bubbleNumber],
        (position, size) => {
          setShootingBubbles(prev => 
            prev.map(bubble => 
              bubble.id === bubbleId 
                ? { ...bubble, position, size }
                : bubble
            )
          );
        },
        () => {
          bubbleLayoutManager.occupyPosition(nextPosition);
          setBubbles(prev => [...prev, {
            id: bubbleId,
            position: nextPosition,
            size: BUBBLE_SIZES[bubbleNumber],
            isAnimating: false,
            number: bubbleNumber
          }]);
          setShootingBubbles(prev => prev.filter(b => b.id !== bubbleId));
        }
      );
    }
  }, [gunPosition, bubbles.length, shootingBubbles.length, maxBubbles, isTutorial, tutorialStep, availableNumbers, releasedBubbles])

  // Add audio references
  const popAudioRef = React.useRef(null);
  const mergeAudioRef = React.useRef(null);
  const levelCompleteAudioRef = React.useRef(null);
  const animationIntervalRef = React.useRef(null);
  
  // Initialize audio on component mount
  useEffect(() => {
    popAudioRef.current = new Audio(popSound);
    popAudioRef.current.volume = 0.3; // Set volume to 30%
    
    // Create merge sound
    mergeAudioRef.current = new Audio(popSound); // Reuse pop sound or replace with merge sound
    mergeAudioRef.current.volume = 0.3; // Set volume to 30%
    mergeAudioRef.current.playbackRate = 1.5; // Make it slightly higher pitch

    // Create level complete sound
    levelCompleteAudioRef.current = new Audio(levelCompleteSound);
    levelCompleteAudioRef.current.volume = 0.4; // Set volume to 40%
  }, []);

  // Handle celebration completion
  const handleCelebrationComplete = () => {
    // Only move to next level if it's not the last level and game complete modal isn't shown
    if (levelIndex !== levelNumbers.length - 1 && !showGameComplete) {
      // Move to next level
      setLevelIndex(prev => prev + 1);
      resetGame();
    }
  };

  // Modify handleLevelComplete to include the level complete sound
  const handleLevelComplete = (finalBubbles) => {
    // First show the compliment and set target bubble as completed
    setIsLevelComplete(true);
    
    const isLastLevel = levelIndex === levelNumbers.length - 1;
    
    // Play level complete sound
    if (levelCompleteAudioRef.current) {
      levelCompleteAudioRef.current.currentTime = 0;
      levelCompleteAudioRef.current.play().catch(e => console.log("Audio play error:", e));
    }
    
    // Show the game complete modal immediately if it's the last level
    if (isLastLevel) {
      setShowGameComplete(true);
      setCompliment(null); // Clear compliment when showing game complete
    } else {
      // Only show compliment if it's not the final level
      setCompliment(getRandomCompliment());
    }
    
    setTargetBubbleCompleted(true);
    
    // Reset largest merged number since we completed the level
    setLargestMergedNumber(0);
    
    // Store the final bubbles state for popping
    const finalBubblesState = [...finalBubbles];
    
    // Wait a bit to show the compliment, then handle next level
    setTimeout(() => {
      // Pop all bubbles using the stored final state
      setPoppingBubbles(finalBubblesState.map((bubble, index) => ({
        ...bubble,
        position: { ...bubble.position },
        isPopping: true,
        popDelay: index * 40
      })));
      
      // Play pop sounds
      finalBubblesState.forEach((_, index) => {
        setTimeout(() => {
          if (popAudioRef.current) {
            const newAudio = new Audio(popSound);
            newAudio.volume = 0.3;
            newAudio.play();
          }
        }, index * 40);
      });
      
      // Clear bubbles
      setBubbles([]);
      
      // Release positions
      finalBubblesState.forEach(bubble => {
        bubbleLayoutManager.releasePosition(bubble.position);
      });
      
      // Show celebration bubbles after popping animation completes - even for the last level
      setTimeout(() => {
        setShowCelebration(true);
      }, finalBubblesState.length * 40 + 150);
      
    }, isLastLevel ? 500 : 2000); // Shorter delay for last level since we're showing game complete modal
  };
  
  const resetGame = () => {
    setBubbles([]);
    setShootingBubbles([]);
    setSelectedBubbles([]);
    setSelectedBubbleIndex(null);
    setTutorialStep(0);
    setHasCreatedFirstMerge(false);
    setIsLevelComplete(false);
    setPoppingBubbles([]);
    setCompliment(null);
    setBubbleCount(0);
    setReleasedBubbles(0);
    setTargetBubbleCompleted(false);  // Reset target bubble state
    setLargestMergedNumber(0); // Reset largest merged number
    setShowCelebration(false); // Reset celebration state
    setAllowedMistake(true); // Reset mistake allowance
    setShowOopsMessage(false); // Clear any oops message
    bubbleLayoutManager.positions.forEach(pos => {
      pos.occupied = false;
      pos.reserved = false;
    });
    bubbleLayoutManager.occupiedPositions.clear();
    bubbleLayoutManager.reservedPositions.clear();
  };

  const handleBubbleClick = (index) => {
    if (selectedBubbles.includes(index)) {
      return;
    }

    const newSelectedBubbles = [...selectedBubbles, index];
    setSelectedBubbles(newSelectedBubbles);
    
    // Only guide for first merge (creating 2)
    if (!hasCreatedFirstMerge && newSelectedBubbles.length === 1) {
      const availableBubbles = bubbles
        .map((_, i) => i)
        .filter(i => i !== index && !selectedBubbles.includes(i))
      
      if (availableBubbles.length > 0) {
        const nextIndex = availableBubbles[Math.floor(Math.random() * availableBubbles.length)]
        setSelectedBubbleIndex(nextIndex)
      }
    }
    
    if (newSelectedBubbles.length === 2) {
      const firstBubbleIndex = newSelectedBubbles[0];
      const secondBubbleIndex = newSelectedBubbles[1];
      const firstBubble = bubbles[firstBubbleIndex];
      const secondBubble = bubbles[secondBubbleIndex];
      
      // Clear selection state immediately
      setSelectedBubbles([]);
      setSelectedBubbleIndex(null);
      
      // Calculate midpoint between the two bubbles for merging
      const midX = (firstBubble.position.x + secondBubble.position.x) / 2;
      const midY = (firstBubble.position.y + secondBubble.position.y) / 2;
      const midPoint = { x: midX, y: midY };
      
      // Display plus sign at the midpoint before merging - simplified to only show the + sign
      setPlusSignDisplay({
        position: midPoint
      });
      
      // Calculate the sum for the new bubble size
      const firstNumber = firstBubble.number;
      const secondNumber = secondBubble.number;
      const sum = firstNumber + secondNumber;
      const targetSize = BUBBLE_SIZES[sum];
      
      // Delay starting the merge animation to allow the plus sign to show
      setTimeout(() => {
        // Create merging bubbles with animation targets
        const mergingBubblesData = [
          {
            ...firstBubble,
            targetPosition: midPoint,
            originalPosition: { ...firstBubble.position },
            originalSize: { ...firstBubble.size },
            targetSize: targetSize,
            animationProgress: 0,
            isHighlighted: true // Keep these highlighted during animation
          },
          {
            ...secondBubble,
            targetPosition: midPoint,
            originalPosition: { ...secondBubble.position },
            originalSize: { ...secondBubble.size },
            targetSize: targetSize,
            animationProgress: 0,
            isHighlighted: true // Keep these highlighted during animation
          }
        ];
        
        // Set merging bubbles
        setMergingBubbles(mergingBubblesData);
        
        // Remove the selected bubbles from the main bubbles array
        const remainingBubbles = bubbles.filter((_, i) => !newSelectedBubbles.includes(i));
        setBubbles(remainingBubbles);
        
        // Start animation
        const animationDuration = 400; // 400ms for faster animation
        const animationSteps = 15; // Fewer steps for smoother animation
        const stepTime = animationDuration / animationSteps;
        
        // Clear plus sign when animation starts
        setPlusSignDisplay(null);
        
        // Animation loop
        let step = 0;
        animationIntervalRef.current = setInterval(() => {
          step++;
          const progress = step / animationSteps;
          
          setMergingBubbles(prev => 
            prev.map(bubble => {
              // Calculate interpolated size
              const interpolatedWidth = bubble.originalSize.width + (bubble.targetSize.width - bubble.originalSize.width) * progress * 0.7;
              const interpolatedHeight = bubble.originalSize.height + (bubble.targetSize.height - bubble.originalSize.height) * progress * 0.7;
              
              return {
                ...bubble,
                animationProgress: progress,
                position: {
                  x: bubble.originalPosition.x + (bubble.targetPosition.x - bubble.originalPosition.x) * progress,
                  y: bubble.originalPosition.y + (bubble.targetPosition.y - bubble.originalPosition.y) * progress
                },
                size: {
                  ...bubble.size,
                  width: interpolatedWidth,
                  height: interpolatedHeight
                }
              };
            })
          );
          
          // When animation completes
          if (step >= animationSteps) {
            clearInterval(animationIntervalRef.current);
            animationIntervalRef.current = null;
            
            // Play merge sound
            if (mergeAudioRef.current) {
              mergeAudioRef.current.currentTime = 0;
              mergeAudioRef.current.play().catch(e => console.log("Audio play error:", e));
            }
            
            // Show merge flash effect
            setMergeFlash({
              position: midPoint,
              size: targetSize,
              timestamp: Date.now()
            });
            
            // Clear flash effect after animation
            setTimeout(() => {
              setMergeFlash(null);
            }, 300);
            
            const newBubble = {
              id: Date.now(),
              position: midPoint,
              size: targetSize,
              isAnimating: false,
              number: sum
            };
            
            // Add the new bubble to the remaining bubbles
            const finalBubbles = [...remainingBubbles, newBubble];
            setBubbles(finalBubbles);
            setMergingBubbles([]);
            
            // Update largest merged number if this is larger
            if (sum > largestMergedNumber) {
              setLargestMergedNumber(sum);
            }
            
            bubbleLayoutManager.releasePosition(firstBubble.position);
            bubbleLayoutManager.releasePosition(secondBubble.position);
            bubbleLayoutManager.occupyPosition(midPoint);
            
            // Check if level is complete (created a bubble with target number)
            if (sum === targetNumber) {
              // Use finalBubbles for popping animation
              handleLevelComplete(finalBubbles);
              return;
            }
            
            // Check if player is out of moves (all bubbles released and no way to make target)
            // Just mark allowedMistake as false, but don't show modal yet - let useEffect handle that
            if (releasedBubbles >= maxBubbles) {
              // Check if player has already created a bubble that exceeds the target
              const hasOvershot = finalBubbles.some(bubble => bubble.number > targetNumber);
              
              // If they've overshot OR they're truly out of moves (can't reach target exactly)
              if (hasOvershot || (finalBubbles.length <= 1 && checkIfOutOfMoves(finalBubbles))) {
                handleOutOfMoves();
              }
            }
            
            // Set first merge complete when we create bubble 2 in tutorial
            if (isTutorial && sum === 2) {
              setHasCreatedFirstMerge(true);
            }
          }
        }, stepTime);
      }, 600); // Show plus sign for 600ms before starting merge animation
    }
  }

  // Update the pop function
  const handlePopAll = (bubblesArray = bubbles) => {
    setPoppingBubbles(bubblesArray.map((bubble, index) => ({
      ...bubble,
      position: { ...bubble.position },
      isPopping: true,
      popDelay: index * 40
    })));
    
    // Play pop sound for each bubble with staggered timing
    bubblesArray.forEach((_, index) => {
      setTimeout(() => {
        if (popAudioRef.current) {
          const newAudio = new Audio(popSound);
          newAudio.volume = 0.3;
          newAudio.play();
        }
      }, index * 40);
    });
    
    setBubbles([]);
    
    bubblesArray.forEach(bubble => {
      bubbleLayoutManager.releasePosition(bubble.position);
    });
  };

  // Add this useEffect to set up container bounds
  useEffect(() => {
    const updateContainerBounds = () => {
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      
      // Calculate 70% of screen size
      const containerWidth = screenWidth * 0.7;
      const containerHeight = screenHeight * 0.7;
      
      setContainerBounds({
        width: containerWidth,
        height: containerHeight
      });

      // Reinitialize bubble layout manager with new bounds
      bubbleLayoutManager.initializePositions({
        minX: (screenWidth - containerWidth) / 2 + CONTAINER_PADDING,
        maxX: (screenWidth + containerWidth) / 2 - CONTAINER_PADDING,
        minY: CONTAINER_PADDING,
        maxY: containerHeight - CONTAINER_PADDING
      });
    };

    // Initial setup
    updateContainerBounds();

    // Update on window resize
    window.addEventListener('resize', updateContainerBounds);
    return () => window.removeEventListener('resize', updateContainerBounds);
  }, []);

  const handlePlayAgain = () => {
    window.location.reload();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
        animationIntervalRef.current = null;
      }
    };
  }, []);

  // Helper function to check if user is out of moves
  const checkIfOutOfMoves = (bubblesArray) => {
    // If we already have a bubble with target number, we don't need to check
    if (bubblesArray.some(bubble => bubble.number === targetNumber)) {
      return false;
    }
    
    // Check if any bubble exceeds the target number - this means player has overshot
    const hasOvershot = bubblesArray.some(bubble => bubble.number > targetNumber);
    
    // First special case: If there are at least 2 bubbles, allow a merge ONLY IF 
    // we haven't already exceeded the target number
    if (bubblesArray.length >= 2 && !hasOvershot) {
      return false;
    }
    
    // Get all the current bubble numbers
    const bubbleNumbers = bubblesArray.map(bubble => bubble.number);
    
    // Check if any two bubbles can be merged to reach target number
    for (let i = 0; i < bubbleNumbers.length; i++) {
      for (let j = i + 1; j < bubbleNumbers.length; j++) {
        if (bubbleNumbers[i] + bubbleNumbers[j] === targetNumber) {
          return false; // Found a pair that can make target number
        }
      }
    }
    
    // If we haven't released all bubbles yet, check if unreleased bubbles can help
    if (releasedBubbles < maxBubbles) {
      // Get numbers of remaining bubbles to be released
      const remainingBubbles = availableNumbers.slice(releasedBubbles);
      
      // Check if any existing bubble + remaining bubble can make target
      for (const existingNum of bubbleNumbers) {
        for (const remainingNum of remainingBubbles) {
          if (existingNum + remainingNum === targetNumber) {
            return false; // Found a potential pair
          }
        }
      }
      
      // Check if any two remaining bubbles can make target
      for (let i = 0; i < remainingBubbles.length; i++) {
        for (let j = i + 1; j < remainingBubbles.length; j++) {
          if (remainingBubbles[i] + remainingBubbles[j] === targetNumber) {
            return false; // Found a potential pair
          }
        }
      }
    }
    
    // Check if it's possible to reach the target with any combination of merges
    // This is a simplification - we check if there are enough smaller numbers
    // to potentially build up to the target
    let possibleSums = new Set(bubbleNumbers);
    let foundNew = true;
    
    // Keep finding new possible sums until no new combinations are found
    while (foundNew) {
      foundNew = false;
      const currentSums = Array.from(possibleSums);
      
      // Try all combinations of current numbers
      for (let i = 0; i < currentSums.length; i++) {
        for (let j = i; j < currentSums.length; j++) {
          const newSum = currentSums[i] + currentSums[j];
          
          // If this sum is the target, we have a path to the target
          if (newSum === targetNumber) {
            return false;
          }
          
          // If this is a new sum that's less than the target, add it to possibilities
          if (!possibleSums.has(newSum) && newSum < targetNumber) {
            possibleSums.add(newSum);
            foundNew = true;
          }
        }
      }
    }
    
    // If we can't find a path to the target, or we've already overshot, user is out of moves
    return true || hasOvershot;
  };
  
  // Modify the handleOutOfMoves function to show "Oops! Try again" message
  const handleOutOfMoves = () => {
    // Only mark as out of moves if player has used their mistake
    if (allowedMistake) {
      setAllowedMistake(false);
    } else {
      // Show the "Oops! Try again" message and restart level after delay
      setShowOopsMessage(true);
      setTimeout(() => {
        setShowOopsMessage(false);
        resetGame(); // Restart the current level
      }, 4000);
    }
  };
  
  // Update the useEffect that checks bubble count to check for out of moves
  useEffect(() => {
    if (isTutorial && bubbles.length === maxBubbles && selectedBubbleIndex === null) {
      const randomIndex = Math.floor(Math.random() * bubbles.length)
      setSelectedBubbleIndex(randomIndex)
    }
    
    // Only run the out-of-moves check if all bubbles are released and no animations are happening
    if (!isTutorial && !isLevelComplete && 
        releasedBubbles >= maxBubbles && 
        shootingBubbles.length === 0 && 
        mergingBubbles.length === 0) {
      
      // Check if any bubble exceeds the target number
      const hasOvershot = bubbles.some(bubble => bubble.number > targetNumber);
      
      // Special case 1: if we have 0 or 1 bubbles left and there's no way to reach target
      // Special case 2: if we've already overshot the target with at least one bubble
      const isReallyOutOfMoves = (bubbles.length <= 1 && checkIfOutOfMoves(bubbles)) || hasOvershot;
      
      // Handle out of moves using our handleOutOfMoves function
      if (isReallyOutOfMoves) {
        handleOutOfMoves();
      }
    }
  }, [
    bubbles, 
    isTutorial, 
    selectedBubbleIndex, 
    maxBubbles, 
    releasedBubbles, 
    shootingBubbles.length,
    mergingBubbles.length, 
    isLevelComplete, 
    allowedMistake,
    targetNumber
  ]);
  
  // Reset allowed mistake when level changes
  useEffect(() => {
    setAllowedMistake(true);
    setShowOopsMessage(false);
  }, [levelIndex]);

  return (
    <div className={`relative h-screen w-screen overflow-hidden bg-gradient-to-b ${currentLevel?.colors?.background || 'from-blue-200 to-blue-400'}`}>
      <div className="w-full h-full bg-white/10 backdrop-blur-sm p-4 relative">
        {/* Level number - moved to top left */}
        <div className="absolute top-4 left-4 text-white text-2xl dynapuff-text">
          Level {currentLevelNumber}
        </div>

        {/* Game Title - centered */}
        <div className="text-white text-5xl text-center mb-8 dynapuff-text">
          Bubble Fun
        </div>

        <div className="game-area h-[calc(100%-5rem)] relative">
          {/* Target Bubble Display */}
          <TargetBubble 
            targetNumber={targetNumber}
            isCompleted={targetBubbleCompleted}
            isTutorial={isTutorial}
            currentMergedNumber={largestMergedNumber}
            colors={currentLevel?.colors}
          />

          {/* "Oops! Try again" message that appears near the octopus as a speech bubble */}
          {showOopsMessage && (
            <div className="absolute left-40 top-12 z-50">
              <div className="speech-bubble bg-white text-red-500 px-6 py-3 rounded-lg shadow-lg relative" style={{ minWidth: "120px" }}>
                <span className="no-text-shadow">
                  Oops!<br />
                  Try again!
                </span>
                <div className="speech-bubble-arrow-left"></div>
              </div>
            </div>
          )}

          {/* Replace LevelCompleteModal with this */}
          {compliment && (
            <div className="absolute inset-0 flex items-center justify-center z-50">
              <div 
                className="text-6xl font-bold text-yellow-300 drop-shadow-lg levitate dynapuff-text"
                style={{ 
                  animation: 'levitate 3s ease-in-out infinite, fadeIn 0.5s ease-in'
                }}
              >
                {compliment}
              </div>
            </div>
          )}

          {/* Celebration Bubbles */}
          <CelebrationBubbles 
            isActive={showCelebration} 
            targetSize={BUBBLE_SIZES[targetNumber]}
            onComplete={handleCelebrationComplete}
            colors={currentLevel?.colors}
          />

          {/* Bubble counter - moved to bottom right */}
          <div className="absolute bottom-4 right-4 text-white text-xl dynapuff-text">
            {releasedBubbles}/{maxBubbles} bubbles
          </div>
          
          {/* Plus Sign Display */}
          {plusSignDisplay && (
            <div
              className="absolute flex items-center justify-center z-50"
              style={{
                left: `${plusSignDisplay.position.x}px`,
                top: `${plusSignDisplay.position.y}px`,
                transform: 'translate(-50%, -50%)',
                animation: 'pop-in 0.3s ease-out forwards'
              }}
            >
              <div className="text-yellow-200 text-6xl w-12 h-12 flex items-center justify-center dynapuff-text">
                +
              </div>
            </div>
          )}
          
          {/* Static bubbles */}
          {bubbles.map((bubble, index) => (
            <Bubble 
              key={bubble.id}
              position={bubble.position}
              size={bubble.size}
              isAnimating={bubble.isAnimating}
              isHighlighted={selectedBubbles.includes(index)}
              isSelected={index === selectedBubbleIndex}
              onClick={() => handleBubbleClick(index)}
              number={bubble.number}
              isTutorial={isTutorial}
              colors={currentLevel?.colors}
            />
          ))}
          
          {/* Shooting bubbles */}
          {shootingBubbles.map(bubble => (
            <Bubble 
              key={bubble.id}
              position={bubble.position}
              size={bubble.size}
              isAnimating={bubble.isAnimating}
              number={bubble.number}
              isTutorial={isTutorial}
              colors={currentLevel?.colors}
            />
          ))}
          
          {/* Merging Bubbles */}
          {mergingBubbles.map(bubble => (
            <Bubble 
              key={bubble.id}
              position={bubble.position}
              size={bubble.size}
              isAnimating={false}
              isHighlighted={true}
              number={bubble.number}
              isTutorial={isTutorial}
              colors={currentLevel?.colors}
              style={{
                opacity: 1 - 0.2 * bubble.animationProgress, // Less fading
                zIndex: 35,
                transition: 'all 30ms linear' // Smoother transition
              }}
            />
          ))}
          
          {/* Merge Flash Effect */}
          {mergeFlash && (
            <div 
              className="absolute animate-merge-flash"
              style={{
                left: `${mergeFlash.position.x}px`,
                top: `${mergeFlash.position.y}px`,
                width: `${mergeFlash.size.width * 1.8}px`,
                height: `${mergeFlash.size.height * 1.8}px`,
                transform: 'translate(-25%, -25%)',
                zIndex: 36
              }}
            >
              <div className="w-full h-full rounded-full bg-yellow-400 opacity-70" />
            </div>
          )}
          
          {/* Pointer Guide - only show before first merge */}
          {isTutorial && !hasCreatedFirstMerge && selectedBubbleIndex !== null && selectedBubblePosition && (
            <PointerGuide position={selectedBubblePosition} />
          )}
          
          {/* Popping bubbles */}
          {poppingBubbles.map(bubble => {
            // Calculate exact position to match original bubble
            const style = {
              position: 'absolute',
              left: `${bubble.position.x}px`,
              top: `${bubble.position.y}px`,
              width: `${bubble.size.width}px`,
              height: `${bubble.size.height}px`,
              animationDelay: `${bubble.popDelay}ms`,
            };
            
            return (
              <div 
                key={bubble.id}
                className="popping"
                style={style}
              >
                <div className="flash-effect" style={{ animationDelay: `${bubble.popDelay + 150}ms` }} />
                
                <svg 
                  viewBox="0 0 32 32" 
                  className="w-full h-full"
                >
                  <circle 
                    cx="16" 
                    cy="16" 
                    r="14" 
                    fill="#3B82F6" 
                    fillOpacity="0.8"
                  />
                  <circle cx="12" cy="12" r="4" fill="white" fillOpacity="0.5"/>
                </svg>
                <span className={`absolute inset-0 flex items-center justify-center text-white font-bold ${bubble.size.fontSize}`}>
                  {bubble.number}
                </span>
              </div>
            );
          })}
          
          <BubbleGun 
            onShoot={handleShoot} 
            onPositionChange={setGunPosition}
            disabled={releasedBubbles >= maxBubbles}
            showHandPointer={levelIndex === 0 && releasedBubbles < maxBubbles}
          />
        </div>

        {/* Game Complete Modal */}
        {showGameComplete && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60]">
            <div className="bg-blue-800 rounded-xl p-8 text-center shadow-xl transform scale-100 animate-fade-in">
              <h2 className="text-4xl font-bold mb-6 text-yellow-400 drop-shadow-lg dynapuff-text">
                You Are Amazing!
              </h2>
              <p className="text-xl mb-8 text-gray-100 dynapuff-text">
                Congratulations! You've completed all levels!
              </p>
              <button
                onClick={handlePlayAgain}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full text-lg transition-colors duration-200 dynapuff-text"
              >
                Play Again
              </button>
            </div>    
          </div>
        )}
      </div>
    </div>
  )
}

export default Game 