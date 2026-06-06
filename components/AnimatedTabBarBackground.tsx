import React from 'react';
import { Image, StyleSheet, useColorScheme } from 'react-native';

export const AnimatedTabBarBackground = () => {
  const colorScheme = useColorScheme();
  const bgImage = colorScheme === 'dark' 
    ? require('@/assets/images/tabbar-dark.png') 
    : require('@/assets/images/tabbar-light.png');

  return (
    <Image 
      source={bgImage} 
      style={StyleSheet.absoluteFill}
      resizeMode="cover"
    />
  );
};