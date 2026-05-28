import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
// Using Ionicons here as it matches the standard mobile back arrows and filter sliders nicely
import { Ionicons } from '@expo/vector-icons'; 

interface PageHeaderProps {
  title?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  showRightIcon?: boolean;
  rightIconName?: keyof typeof Ionicons.glyphMap; 
  onRightIconPress?: () => void;
  iconColor?: string;
  titleColor?: string;
}

const PageHeader = ({ 
  // --- DEFAULTS SHA ---
  title = "Page Title", 
  showBack = true,
  onBackPress,
  showRightIcon = true,
  rightIconName = "options-outline", // Matches the filter/slider icon in your screenshot
  onRightIconPress,
  iconColor = "#4338CA", // Indigo/Purple color matching your screenshot
  titleColor = "text-[#4338CA]" 
}: PageHeaderProps) => {
  
  const router = useRouter();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress(); // Use custom back function if provided
    } else if (router.canGoBack()) {
      router.back(); // Default to expo-router back
    }
  };

  return (
    <View className='flex flex-row items-center justify-between px-4 py-4 bg-white rounded-2xl shadow-sm z-10 relative mx-4'>
      
      {/* Left Section: Back Button & Title */}
      <View className='flex flex-row items-center gap-x-3'>
        {showBack && (
          <TouchableOpacity 
            onPress={handleBack} 
            className='p-1 -ml-1'
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={iconColor} />
          </TouchableOpacity>
        )}
        
        <Text className={`text-xl font-JakartaBold ${titleColor}`}>
          {title}
        </Text>
      </View>

      {/* Right Section: Action Icon (Filter, Settings, etc.) */}
      {showRightIcon && (
        <TouchableOpacity 
          onPress={onRightIconPress} 
          className='p-1 -mr-1'
          activeOpacity={0.7}
        >
          <Ionicons name={rightIconName} size={24} color={iconColor} />
        </TouchableOpacity>
      )}

    </View>
  );
}

export default PageHeader;