import { images } from '@/constants/utils';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Text, View } from 'react-native';
import CustomButton from './CustomButton';
import { router } from 'expo-router';

export const NativeTypewriter = ({
  texts,
  typingSpeed = 50,
  pauseDelay = 1500,
  className
}: {
  texts: string[],
  typingSpeed: number,
  pauseDelay: number,
  className: string
}
) => {
  const [currentText, setCurrentText] = useState('');
  const [textIndex, setTextIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    //@ts-ignore
    let timeout;
    const fullText = texts[textIndex];

    if (!isDeleting && currentText.length < fullText.length) {
      // Type next character
      timeout = setTimeout(() => {
        setCurrentText(fullText.slice(0, currentText.length + 1));
      }, typingSpeed);
    } else if (!isDeleting && currentText.length === fullText.length) {
      // Wait at the end of the sentence before deleting
      timeout = setTimeout(() => setIsDeleting(true), pauseDelay);
    } else if (isDeleting && currentText.length > 0) {
      // Delete characters faster than typing them
      timeout = setTimeout(() => {
        setCurrentText(fullText.slice(0, currentText.length - 1));
      }, typingSpeed / 2);
    } else if (isDeleting && currentText.length === 0) {
      // Move to the next sentence
      setIsDeleting(false);
      setTextIndex((prev) => (prev + 1) % texts.length);
    }
    //@ts-ignore
    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, textIndex, texts, typingSpeed, pauseDelay]);

  return <Text className={className}>{currentText}</Text>;
};

export const SuccessAnimation = () => {
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: 1,
      duration: 2000, // 2 seconds
      useNativeDriver: true,
    }).start();
  }, []);

  // 6 steps for a bouncy scale effect
  const scale = animValue.interpolate({
    inputRange: [0, 0.3, 0.6, 0.75, 0.9, 1],
    outputRange: [2, 1.3, 0.9, 1.1, 0.95, 1], 
  });

  // 6 steps matching the input range above
  const rotate = animValue.interpolate({
    inputRange: [0, 0.3, 0.6, 0.75, 0.9, 1],
    outputRange: ['-200deg', '-90deg', '20deg', '-10deg', '5deg', '0deg'], 
  });

  // Opacity can stay simple, it just needs 3 items
  const opacity = animValue.interpolate({
    inputRange: [0, 0.2, 1],
    outputRange: [0, 1, 1],
  });

  return (
    <View className='bg-white p-8 rounded-2xl min-h-[300px]'>
      <Animated.Image 
        // 👇 Update this path to where your check image is stored!
        source={images.check} 
        style={{
          width: 110,
          height: 110,
          transform: [{ scale }, { rotate }],
          opacity
        }}
        className="mx-auto my-5"
      />

      <Text className="text-3xl font-JakartaBold text-center">
        Verified
      </Text>

      <NativeTypewriter 
        texts={[
          'You have successfully verified\nyour account.',
          'Would you like to go to the home now?'
        ]}
        typingSpeed={50}
        pauseDelay={1500}
        className="text-base text-gray-400 font-Jakarta text-center h-[50px]" 
      />

      <CustomButton
        title="Browse Home"
        onPress={() => router.replace('/(root)/(tabs)/home')}
        className='mt-5'
      />

    </View>
  );
};