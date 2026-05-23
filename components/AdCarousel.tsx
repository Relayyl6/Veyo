import React from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;

const advertData = [
  {
    id: '1',
    title: 'Late for an 8am class?',
    subtitle: 'Get a Veyo ride to faculty in 3 mins.',
    ctaText: 'Request Ride',
    image: { uri: 'https://cdn-icons-png.flaticon.com/512/3204/3204121.png' }, 
    bgClass: 'bg-primary-500',
    textClass: 'text-white',
    ctaBgClass: 'bg-white',
    ctaTextClass: 'text-primary-500',
  },
  {
    id: '2',
    title: 'Midnight cravings?',
    subtitle: 'Hot meals delivered to your hostel.',
    ctaText: 'Order Food',
    image: { uri: 'https://cdn-icons-png.flaticon.com/512/1046/1046784.png' }, 
    bgClass: 'bg-[#FF9C01]', 
    textClass: 'text-white',
    ctaBgClass: 'bg-white',
    ctaTextClass: 'text-[#FF9C01]',
  },
  {
    id: '3',
    title: '50% off first 3 rides',
    subtitle: 'Use code VEYOFRESH at checkout.',
    ctaText: 'Claim Now',
    image: { uri: 'https://cdn-icons-png.flaticon.com/512/879/879859.png' }, 
    bgClass: 'bg-green-500',
    textClass: 'text-white',
    ctaBgClass: 'bg-white',
    ctaTextClass: 'text-green-500',
  }
];

const AdCarousel = () => {
  return (
    <View className="mt-4 mb-2">
      <FlatList
        data={advertData}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + 16}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: 16 }} 
        renderItem={({ item }) => (
          <View 
            style={{ width: CARD_WIDTH }} 
            className={`${item.bgClass} rounded-2xl py-3 px-4 mr-4 flex-row items-center justify-between shadow-sm overflow-hidden`}
          >
            <View className="absolute -right-4 -top-4 w-20 h-20 bg-white opacity-10 rounded-full" />
            
            <View className="flex-1 pr-3 z-10 justify-center">
              <Text 
                className={`text-base font-JakartaBold ${item.textClass} mb-0.5 leading-tight`}
                numberOfLines={1}
              >
                {item.title}
              </Text>
              
              {/* Reduced subtitle to text-xs, margin to mb-2, and forced to 1 line */}
              <Text 
                className={`text-xs font-Jakarta ${item.textClass} opacity-90 mb-2`}
                numberOfLines={2}
              >
                {item.subtitle}
              </Text>
              
              {/* Tightened button padding and text size */}
              <TouchableOpacity className={`${item.ctaBgClass} px-3 py-1.5 rounded-full self-start`}>
                <Text className={`font-JakartaSemiBold text-[11px] ${item.ctaTextClass}`}>
                  {item.ctaText}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Shrunk image to w-16 h-16 */}
            <Image
              source={item.image}
              resizeMode="contain"
              className="w-16 h-16 z-10"
            />
          </View>
        )}
      />
    </View>
  );
};

export default AdCarousel;