import React, { useState, useRef } from 'react';
import { View, Animated, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import RideCard from './RideCard'; // Adjust path if needed
// import { Ride } from '@/types/data'; // Adjust path if needed

export default function RideCardDeck({ rides }: { rides: any[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const anim = useRef(new Animated.Value(0)).current;
  
  // 1. ADDED: A lock to prevent mashing the button and causing skips
  const isAnimating = useRef(false); 

  const currentRide = rides?.[currentIndex];
  const nextRide = rides?.[currentIndex + 1];

  // 2. MOVED UP: Functions must be defined before the early return empty state
  const handleNext = () => {
    // Prevent action if currently animating or no next ride
    if (!nextRide || isAnimating.current) return;
    
    isAnimating.current = true;

    // The shuffle animation
    Animated.spring(anim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start(({ finished }) => {
      // Only proceed if the animation fully finished (wasn't interrupted)
      if (finished) {
        setCurrentIndex((prev) => prev + 1);
        anim.setValue(0);
        isAnimating.current = false;
      }
    });
  };

  const handlePrev = () => {
    // Prevent action if currently animating or at the beginning
    if (currentIndex === 0 || isAnimating.current) return;
    
    isAnimating.current = true;

    // Snap animation to the "swiped up" position instantly
    anim.setValue(1);
    
    // Change the data to the previous card
    setCurrentIndex((prev) => prev - 1);

    // Wait 1 frame for React to render, then smoothly drop it down
    setTimeout(() => {
      Animated.spring(anim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start(({ finished }) => {
        if (finished) {
          isAnimating.current = false;
        }
      });
    }, 50); // slight 50ms delay makes the swap invisible to the eye
  };

  // If no rides, or we've swiped through all of them, return nothing
  // Empty State: No rides at all, or swiped through the whole list
  if (!rides || rides.length === 0 || currentIndex >= rides.length) {
    return (
      <View className="mx-4 mt-2 mb-8 bg-white rounded-2xl p-8 flex items-center justify-center shadow-sm shadow-neutral-200 border border-neutral-100 relative">
        
        {/* If they swiped past the last card, let them go back */}
        {currentIndex > 0 && (
          <TouchableOpacity
            onPress={handlePrev} // 3. FIXED: Removed the () => wrapping to make it fire properly
            activeOpacity={0.9}
            style={{
              position: 'absolute',
              top: -15,
              alignSelf: 'center',
              zIndex: 50,
            }}
            className="bg-neutral-800 flex-row items-center justify-center px-4 py-1.5 rounded-full shadow-md"
          >
            <Ionicons name="chevron-up" size={12} color="white" />
            <Text className="text-white text-[10px] font-bold ml-1">Prev</Text>
          </TouchableOpacity>
        )}

        <Ionicons name="car-outline" size={48} color="#d4d4d4" />
        <Text className="text-neutral-500 font-JakartaMedium mt-2 text-sm">
          {rides.length === 0 ? "No recent rides" : "You've reached the end!"}
        </Text>
      </View>
    );
  }

  return (
    <View className="mx-4 mt-5 mb-8 relative">
      {currentIndex > 0 && (
        <TouchableOpacity
          onPress={handlePrev}
          activeOpacity={0.9}
          style={{
            position: 'absolute',
            top: -15,
            alignSelf: 'center',
            zIndex: 50, // High z-index ensures it's always clickable
          }}
          className="bg-neutral-800 flex-row items-center justify-center px-3 py-1 rounded-full shadow-md"
        >
          <Ionicons name="chevron-up" size={12} color="white" />
          <Text className="text-white text-[10px] font-bold ml-1">Prev</Text>
        </TouchableOpacity>
      )}

      {/* --- NEXT CARD (Scales down & acts as background) --- */}
      {nextRide && (
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1,
            opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }),
            transform: [
              // Starts 25px lower, moves to 0
              { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [25, 0] }) },
              // Starts smaller to create the stacked look, expands to 1
              { scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) },
            ],
          }}
        >
          <TouchableOpacity activeOpacity={0.9} onPress={handleNext}>
            <RideCard ride={nextRide} />

            {/* THE "PILL" - Sticking out the bottom middle */}
            <Animated.View
              style={{
                position: 'absolute',
                bottom: -15,
                alignSelf: 'center',
                opacity: anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 0, 0] }), // Fades out when clicked
              }}
              className="bg-neutral-800 flex-row items-center justify-center px-4 py-1.5 rounded-full shadow-md"
            >
              <Text className="text-white text-[10px] font-bold mr-1">Next</Text>
              <Ionicons name="chevron-down" size={12} color="white" />
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* --- CURRENT CARD (Slides up and fades out) --- */}
      <Animated.View
        style={{
          zIndex: 2,
          opacity: anim.interpolate({ inputRange: [0, 0.8, 1], outputRange: [1, 0, 0] }),
          transform: [
            // Slides up aggressively 
            { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [0, -150] }) },
            // Shrinks slightly as it leaves
            { scale: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.95] }) },
          ],
        }}
      >
        <RideCard ride={currentRide} />
      </Animated.View>
    </View>
  );
}