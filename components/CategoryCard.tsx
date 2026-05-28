import React from 'react';
import { Text, Image, TouchableOpacity, StyleSheet, DimensionValue } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface CategoryCardProps {
  title: string;
  subtitle: string;
  imageUrl: string;
  width?: DimensionValue;
  height?: DimensionValue;
  flex?: number;
  onPress?: () => void;
}

export default function CategoryCard({ 
  title, 
  subtitle, 
  imageUrl, 
  width = '100%', 
  height = 200, 
  flex, 
  onPress 
}: CategoryCardProps) {
  
  return (
    <TouchableOpacity 
      activeOpacity={0.8} 
      onPress={onPress}
      // Apply the dynamic width, height, and flex passed from the parent
      style={[styles.container, { width, height, flex }]}
    >
      <Image 
        source={{ uri: imageUrl }} 
        style={styles.image} 
        resizeMode="cover"
      />
      
      {/* Dark gradient overlay so text pops */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.overlay}
      >
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#1E1E1E', // Placeholder color while image loads
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%', // Gradient covers the bottom half
    justifyContent: 'flex-end',
    padding: 16,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#E5E7EB', // Light gray
    fontSize: 13,
    marginTop: 4,
  }
});