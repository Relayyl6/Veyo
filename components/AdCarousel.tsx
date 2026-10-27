import React, { useState, useRef } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.86;

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
  const onViewRef = useRef(({ viewableItems }: { viewableItems: any[] }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  });
  
  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });

  return (
    <View className="my-1.5">
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
              <View style={{ width: CARD_WIDTH, height: 118 }} className="mr-3 rounded-2xl overflow-hidden shadow-sm">
                
                {/* Linear Gradient acting as the background */}
                <LinearGradient
                  colors={['#2a2a2a', '#000000']} 
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ flex: 1, flexDirection: 'row', padding: 12 }}
                >
                  
                  {/* Left Content */}
                  <View className="flex-1 z-10 justify-center">
                    <Text className="text-xl font-JakartaBold font-bold text-white mb-0.5 tracking-tight">
                      {item.title}
                    </Text>
                    <Text className="text-[11px] font-Jakarta text-white opacity-80 mb-2">
                      {item.subtitle}
                    </Text>
                    <TouchableOpacity activeOpacity={0.8} className={`${item.ctaBgClass} px-3.5 py-1.5 rounded-lg self-start`}>
                      <Text className="font-JakartaSemiBold font-semibold text-[10.5px] text-white">
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
                      right: -10,
                      top: -4,
                      width: 125,
                      height: 125,
                      zIndex: 5,
                    }}
                  />
                </LinearGradient>
              </View>
            )}
      />

      {/* Pagination Indicators (Dots) */}
      <View className="flex-row justify-center items-center mt-2 space-x-1.5">
        {advertData.map((_, index) => (
          <View
            key={index}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              currentIndex === index 
                ? 'w-5 bg-[#f04f23]'
                : 'w-1.5 bg-neutral-300'
            }`}
            style={{ marginHorizontal: 2.5 }}
          />
        ))}
      </View>
    </View>
  );
};

export default AdCarousel;