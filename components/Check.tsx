import { images } from '@/constants/utils';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Text, View } from 'react-native';
import CustomButton from './CustomButton';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export const NativeTypewriter = ({
  texts,
  typingSpeed = 50,
  pauseDelay = 1500,
  className,
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
  smartDiff?: boolean;
  deletingSpeed?: number;
  loop?: boolean;
  startDelay?: number;
  cursor?: boolean;
  cursorChar?: string;
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

    const commonLength = smartDiff
      ? (() => {
          let i = 0;
          while (i < fullText.length && i < nextText.length && fullText[i] === nextText[i]) i++;
          return i;
        })()
      : 0;

    if (!isDeleting && currentText.length < fullText.length) {
      timeout = setTimeout(() => {
        setCurrentText(fullText.slice(0, currentText.length + 1));
      }, typingSpeed);
    } else if (!isDeleting && currentText.length === fullText.length) {
      if (!loop && textIndex === texts.length - 1) return;
      timeout = setTimeout(() => setIsDeleting(true), pauseDelay);
    } else if (isDeleting && currentText.length > commonLength) {
      timeout = setTimeout(() => {
        setCurrentText(fullText.slice(0, currentText.length - 1));
      }, deletingSpeed ?? typingSpeed / 2);
    } else if (isDeleting && currentText.length <= commonLength) {
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

export const SuccessAnimation = ({ onAction }: { onAction?: () => void }) => {
  const scale = useRef(new Animated.Value(0.5)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View className="bg-white p-6 rounded-3xl min-h-[280px] items-center justify-center">
      <Animated.View
        style={{
          transform: [{ scale }],
          opacity,
        }}
        className="my-3 items-center justify-center"
      >
        {/* Soft glowing emerald halo ring */}
        <View className="w-24 h-24 rounded-full bg-emerald-50 border-4 border-emerald-100 items-center justify-center shadow-lg shadow-emerald-500/20">
          {/* Inner emerald check badge */}
          <View className="w-16 h-16 rounded-full bg-emerald-500 items-center justify-center shadow-md shadow-emerald-600/40">
            <Ionicons name="checkmark" size={38} color="#FFFFFF" />
          </View>
        </View>
      </Animated.View>

      <Text className="text-2xl font-JakartaBold text-neutral-900 text-center mt-1">
        Verified
      </Text>

      <NativeTypewriter
        texts={[
          'You have successfully verified\nyour account.',
          'Please proceed to your home page',
        ]}
        typingSpeed={40}
        pauseDelay={1500}
        className="text-sm text-neutral-500 font-JakartaMedium text-center h-[44px] mt-1"
      />

      <CustomButton
        title="Browse Home"
        onPress={() => {
          if (onAction) {
            onAction();
          } else {
            router.push('/(root)/(tabs)/home');
          }
        }}
        className="w-full py-3.5 mt-4"
        textClassName="text-base font-JakartaBold text-white"
      />
    </View>
  );
};
