import { images } from '@/constants/utils';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Text, View } from 'react-native';
import CustomButton from './CustomButton';
import { router } from 'expo-router';

export const NativeTypewriter = ({
  texts,
  typingSpeed = 50,
  pauseDelay = 1500,
  className,
  // New optional props — all have defaults so existing usage won't break
  smartDiff = false,
  deletingSpeed,
  loop = true,
  startDelay = 0,
  cursor = false,
  cursorChar = '|',
  onTextChange,
}: {
  texts: string[];
  typingSpeed?: number;
  pauseDelay?: number;
  className?: string;
  /** Only delete & retype the suffix that differs between texts e.g. "Something" → "Someone" keeps "Some" */
  smartDiff?: boolean;
  /** Override delete speed independently. Defaults to typingSpeed / 2 */
  deletingSpeed?: number;
  /** Set false to stop after the last text instead of looping */
  loop?: boolean;
  /** Delay in ms before typing starts */
  startDelay?: number;
  /** Show a blinking cursor character */
  cursor?: boolean;
  /** Character used as cursor. Defaults to | */
  cursorChar?: string;
  /** Fires whenever the active text index advances */
  onTextChange?: (index: number, text: string) => void;
}) => {
  const [currentText, setCurrentText] = useState('');
  const [textIndex, setTextIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [started, setStarted] = useState(startDelay === 0);
  const [cursorVisible, setCursorVisible] = useState(true);

  // Start delay
  useEffect(() => {
    if (startDelay > 0) {
      const t = setTimeout(() => setStarted(true), startDelay);
      return () => clearTimeout(t);
    }
  }, [startDelay]);

  // Blinking cursor
  useEffect(() => {
    if (!cursor) return;
    const t = setInterval(() => setCursorVisible((v) => !v), 500);
    return () => clearInterval(t);
  }, [cursor]);

  useEffect(() => {
    if (!started) return;

    //@ts-ignore
    let timeout;
    const fullText = texts[textIndex];
    const nextIndex = (textIndex + 1) % texts.length;
    const nextText = texts[nextIndex];

    // How many leading characters are shared with the next text (smartDiff only)
    const commonLength = smartDiff
      ? (() => {
          let i = 0;
          while (i < fullText.length && i < nextText.length && fullText[i] === nextText[i]) i++;
          return i;
        })()
      : 0;

    if (!isDeleting && currentText.length < fullText.length) {
      // Type next character
      timeout = setTimeout(() => {
        setCurrentText(fullText.slice(0, currentText.length + 1));
      }, typingSpeed);
    } else if (!isDeleting && currentText.length === fullText.length) {
      // Pause — if loop is off and we're on the last text, do nothing
      if (!loop && textIndex === texts.length - 1) return;
      timeout = setTimeout(() => setIsDeleting(true), pauseDelay);
    } else if (isDeleting && currentText.length > commonLength) {
      // Delete down to the common prefix (or fully if smartDiff is false)
      timeout = setTimeout(() => {
        setCurrentText(fullText.slice(0, currentText.length - 1));
      }, deletingSpeed ?? typingSpeed / 2);
    } else if (isDeleting && currentText.length <= commonLength) {
      // Advance to next text
      setIsDeleting(false);
      const next = (textIndex + 1) % texts.length;
      setTextIndex(next);
      onTextChange?.(next, texts[next]);
    }

    //@ts-ignore
    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, textIndex, texts, typingSpeed, pauseDelay, started, smartDiff, loop, deletingSpeed]);

  return (
    <Text className={className}>
      {currentText}
      {cursor && (
        <Text style={{ opacity: cursorVisible ? 1 : 0 }}>{cursorChar}</Text>
      )}
    </Text>
  );
};

export const SuccessAnimation = () => {
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start();
  }, []);

  const scale = animValue.interpolate({
    inputRange: [0, 0.3, 0.6, 0.75, 0.9, 1],
    outputRange: [2, 1.3, 0.9, 1.1, 0.95, 1],
  });

  const rotate = animValue.interpolate({
    inputRange: [0, 0.3, 0.6, 0.75, 0.9, 1],
    outputRange: ['-200deg', '-90deg', '20deg', '-10deg', '5deg', '0deg'],
  });

  const opacity = animValue.interpolate({
    inputRange: [0, 0.2, 1],
    outputRange: [0, 1, 1],
  });

  return (
    <View className='bg-white p-8 rounded-2xl min-h-[300px]'>
      <Animated.Image
        source={images.check}
        style={{
          width: 110,
          height: 110,
          transform: [{ scale }, { rotate }],
          opacity,
        }}
        className="mx-auto my-5"
      />

      <Text className="text-3xl font-JakartaBold text-center">
        Verified
      </Text>

      <NativeTypewriter
        texts={[
          'You have successfully verified\nyour account.',
          'Would you like to go to the home now?',
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