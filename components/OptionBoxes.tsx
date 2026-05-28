import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// The data object extracted from the image
const serviceOptions = [
  {
    id: '1',
    title: 'Book a Ride',
    subtitle: 'Swift city mobility',
    iconName: 'car', 
    iconBgColor: 'bg-[#4338CA]', // Indigo
  },
  // {
  //   id: '2',
  //   title: 'Order food',
  //   subtitle: 'Top local eats',
  //   iconName: 'fast-food', 
  //   iconBgColor: 'bg-[#B45309]', // Burnt Orange
  // },
  // {
  //   id: '3',
  //   title: 'Schedule',
  //   subtitle: 'Plan ahead',
  //   iconName: 'calendar', 
  //   iconBgColor: 'bg-[#065F46]', // Dark Emerald
  // },
  {
    id: '4',
    title: 'Send Items',
    subtitle: 'Same-day delivery',
    iconName: 'cube', 
    iconBgColor: 'bg-[#1E293B]', // Slate Navy
  }
];

const ServiceGrid = () => {
  return (
    <View className="flex flex-row flex-wrap justify-between px-4 mt-3 mx-2">
      {serviceOptions.map((item) => (
        <TouchableOpacity 
          key={item.id} 
          // w-[48%] allows them to sit side-by-side with a nice gap in the middle
          className="w-[48%] bg-general-300 shadow-sm shadow-neutral-300 rounded-[24px] p-4 mb-4"
          activeOpacity={0.7}
        >
          {/* Icon Box */}
          <View className={`w-12 h-12 rounded-2xl ${item.iconBgColor} flex items-center justify-center`}>
            <Ionicons name={item.iconName as any} size={28} color="white" />
          </View>
          
          {/* Text Content (Pushed down to match the spacing in the image) */}
          <View className="mt-5 gap-0.5">
            <Text className="text-[17px] font-JakartaBold text-black leading-tight">
              {item.title}
            </Text>
            <Text className="text-[11px] font-JakartaExtraLight text-gray-500">
              {item.subtitle}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default ServiceGrid;


