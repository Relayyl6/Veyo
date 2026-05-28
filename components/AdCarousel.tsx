import React, { useState, useRef } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;

// Using realistic transparent PNGs to mimic the high-quality 3D/real look
const advertData = [
  {
    id: '1',
    title: '60% Off',
    subtitle: 'Weekend Special Deal',
    ctaText: 'Order Now',
    // High-quality transparent burger
    image: { uri: 'https://freepngimg.com/thumb/burger/5-2-burger-png-thumb.png' }, 
    bgClass: 'bg-[#1a1a1a]', // Sleek dark grey/black
    textClass: 'text-white',
    ctaBgClass: 'bg-[#f04f23]', // Vibrant orange/red similar to the image
    ctaTextClass: 'text-white',
  },
  {
    id: '2',
    title: 'Free Ride',
    subtitle: 'On your first Veyo trip',
    ctaText: 'Book Now',
    // High-quality transparent car
    image: { uri: 'https://freepngimg.com/thumb/vehicle/93770-renegade-tire-jeep-automotive-2018-exterior.png' }, 
    bgClass: 'bg-[#141b2d]', // Deep premium navy
    textClass: 'text-white',
    ctaBgClass: 'bg-[#3b82f6]', // Bright blue
    ctaTextClass: 'text-white',
  },
  {
    id: '3',
    title: 'Midnight?',
    subtitle: 'Hot pizza to your hostel',
    ctaText: 'Order Food',
    // High-quality transparent pizza
    image: { uri: 'https://freepngimg.com/thumb/pizza/2-2-pizza-png-pic-thumb.png' }, 
    bgClass: 'bg-[#2d1a18]', // Deep warm brown/red
    textClass: 'text-white',
    ctaBgClass: 'bg-[#10b981]', // Vibrant green
    ctaTextClass: 'text-white',
  }
];

const AdCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Track which item is currently in view to update the pagination dots
  const onViewRef = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  });
  
  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });

  return (
    <View className="mt-4 mb-6">
      <FlatList
        data={advertData}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + 16} // Width + margin
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: 16 }} 
        onViewableItemsChanged={onViewRef.current}
        viewabilityConfig={viewConfigRef.current}
        renderItem={({ item }) => (
              <View style={{ width: CARD_WIDTH, height: 160 }} className="mr-4 rounded-3xl overflow-hidden shadow-lg">
                
                {/* Linear Gradient acting as the background */}
                <LinearGradient
                  // Dark grey to pure black (adjust hex codes to match your exact theme)
                  colors={['#2a2a2a', '#000000']} 
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ flex: 1, flexDirection: 'row', padding: 20 }}
                >
                  
                  {/* Left Content */}
                  <View className="flex-1 z-10 justify-center pb-2">
                    <Text className="text-4xl font-JakartaBold font-bold text-white mb-1 tracking-tight">
                      {item.title}
                    </Text>
                    <Text className="text-sm font-Jakarta text-white opacity-80 mb-4">
                      {item.subtitle}
                    </Text>
                    <TouchableOpacity activeOpacity={0.8} className={`${item.ctaBgClass} px-5 py-2.5 rounded-xl self-start`}>
                      <Text className="font-JakartaSemiBold font-semibold text-xs text-white">
                        {item.ctaText}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Right Image */}
                  <Image
                    source={item.image}
                    resizeMode="contain"
                    style={{
                      position: 'absolute',
                      right: -20,
                      top: 5,
                      width: 170,
                      height: 170,
                      zIndex: 5,
                    }}
                  />
                </LinearGradient>
              </View>
            )}
      />

      {/* Pagination Indicators (Dots) */}
      <View className="flex-row justify-center items-center mt-5 space-x-2">
        {advertData.map((_, index) => (
          <View
            key={index}
            className={`h-2 rounded-full transition-all duration-300 ${
              currentIndex === index 
                ? 'w-6 bg-[#f04f23]' // Active dot (matches the red/orange button theme)
                : 'w-2 bg-neutral-300' // Inactive dots
            }`}
            style={{ marginHorizontal: 3 }} // Fallback spacing if NativeWind space-x-2 is finicky
          />
        ))}
      </View>
    </View>
  );
};

export default AdCarousel;