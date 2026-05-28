import React, { useRef, useState } from 'react';
import { View, Text, Image, Animated, Dimensions, ScrollView, TouchableOpacity, StyleSheet, PanResponder } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import CategoryCard from '@/components/CategoryCard';
import { images } from '@/constants/utils';
import Header from '@/components/Header';
import { useUser } from '@clerk/expo';
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 40; // Full width minus 20px padding on each side
const CARD_HEIGHT = 150;

const ITEM_WIDTH = width * 0.75;
const OFFSET_TO_EDGE = (width - ITEM_WIDTH) / 2;

// --- MOCK DATA ---
const discoveryData = [
  {
    id: '1',
    tag: 'HOT DEALS',
    tagColor: 'bg-[#E65100]',
    title: '50% Off Lunch',
    subtitle: 'Valid till 2PM today',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: '2',
    tag: 'TRENDING',
    tagColor: 'bg-[#6D28D9]',
    title: 'The Lagos Special',
    subtitle: '1.2k check-ins',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: '3',
    tag: 'NEW',
    tagColor: 'bg-[#059669]',
    title: 'Vegan Delights',
    subtitle: 'Try our new menu',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: '4',
    tag: 'PREMIUM',
    tagColor: 'bg-[#DC2626]',
    title: 'Steakhouse Cuts',
    subtitle: 'Reserve your table',
    image: 'https://images.unsplash.com/photo-1606923829579-0cb981a83e2e?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: '5',
    tag: 'POPULAR',
    tagColor: 'bg-[#D97706]',
    title: 'Late Night Cravings',
    subtitle: 'Open till 3AM',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=800&auto=format&fit=crop'
  }
];

// Duplicating the array to create a simple, hitch-free infinite scroll effect
const infiniteDiscoveryData = Array(10).fill(discoveryData).flat();

const nearbyData = [
  {
    id: '1',
    title: 'Burgers & Co.',
    category: 'American • Burgers • Quick Bite',
    rating: '4.8',
    time: '25-35 mins',
    deliveryInfo: 'Free Delivery',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: '2',
    title: 'Green Harvest',
    category: 'Salads • Healthy • Vegan',
    rating: '4.5',
    time: '15-25 mins',
    deliveryInfo: '₦1,200 Delivery',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop'
  }
];

export default function Explore() {
  const [listData, setListData] = useState(discoveryData);
  const scrollAnim = useRef(new Animated.Value(0)).current;
  const currentIndexRef = useRef(0);
  const { user } = useUser()

  // We use PanResponder to handle the custom swiping logic since we aren't using a FlatList
  const panResponder = useRef(
    PanResponder.create({
      // 1. MAKE IT MORE SENSITIVE: Lowered the threshold from 15 to 10
      onMoveShouldSetPanResponder: (_, gesture) => {
        return Math.abs(gesture.dx) > 10 && Math.abs(gesture.dx) > Math.abs(gesture.dy);
      },
      
      onPanResponderGrant: () => {
        scrollAnim.stopAnimation();
        // Removed extractOffset() to keep the math perfectly simple and predictable
      },
      
      onPanResponderMove: (_, gesture) => {
        // 2. MAKE IT RESPONSIVE: Move the card 1:1 with your thumb. 
        // gesture.dx is divided by width so moving your thumb across the screen equals exactly 1 card movement.
        const newFloatIndex = currentIndexRef.current - (gesture.dx / width);
        scrollAnim.setValue(newFloatIndex);
      },
      
      onPanResponderRelease: (_, gesture) => {
        // 3. THE "ONE-CARD-ONLY" RULE
        let step = 0;
        const SWIPE_THRESHOLD = width * 0.25; // You only need to drag 25% of the screen
        const VELOCITY_THRESHOLD = 0.5; // Or do a quick flick

        // If swiped left (forward)
        if (gesture.dx < -SWIPE_THRESHOLD || gesture.vx < -VELOCITY_THRESHOLD) {
          step = 1;
        } 
        // If swiped right (backward)
        else if (gesture.dx > SWIPE_THRESHOLD || gesture.vx > VELOCITY_THRESHOLD) {
          step = -1;
        }

        // Apply exactly +1, -1, or 0 (snap back to current)
        let nextIndex = currentIndexRef.current + step;
        
        // Prevent swiping backward past the first card
        nextIndex = Math.max(0, nextIndex); 

        Animated.spring(scrollAnim, {
          toValue: nextIndex,
          useNativeDriver: true,
          friction: 8, 
          tension: 40,
        }).start(() => {
          // Update our absolute reference to where we landed
          currentIndexRef.current = nextIndex;

          // Infinite Scroll Check
          if (nextIndex >= listData.length - 2) {
            setListData(prevData => [
              ...prevData,
              ...discoveryData.map(item => ({ ...item, id: `${item.id}-${prevData.length}` }))
            ]);
          }
        });
      },
    })
  ).current;

  console.log(JSON.stringify(user))
  const insets = useSafeAreaInsets() 

  return (
    <View className="flex-1 bg-transparent">
      <View
        style={{
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          zIndex: 10,
          paddingTop: insets.top,
          paddingBottom: 10,
          backgroundColor: 'transparent' // <-- Or use 'rgba(255,255,255, 0.8)' if you want a slight tint so text is readable
        }}
      >
        <Header 
          name={user?.firstName as string | undefined} 
          image={images.logohor} 
          onNotificationPress={() => console.log("something")} 
        />
      </View>
      
      <ScrollView
        className="flex-1 mx-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100, paddingTop: insets.top + 70 }}
      >
        
        {/* Header */}
        <View className="flex-row items-center justify-between pt-4 px-2 mb-3">
          <Text className="text-black text-[17px] font-JakartaMedium">Quick Discovery</Text>
          <TouchableOpacity>
            <Text className="text-[#3122D2] text-[10px] font-JakartaBold tracking-wide">VIEW ALL</Text>
          </TouchableOpacity>
        </View>

        <View 
          className="items-center justify-center relative" 
          style={{ height: CARD_HEIGHT + 20 }} // +20 for the top-right offset peeking space
          {...panResponder.panHandlers}
        >
          {/* We map backwards so the first item renders on top of the stack */}
          {/* 3. Map over the state array (listData), not the static array */}
          {listData.map((item, index) => {
            const inputRange = [index - 1, index, index + 1];

            const translateX = scrollAnim.interpolate({
              inputRange,
              outputRange: [20, 0, -width * 1.5],
              extrapolate: 'clamp',
            });

            const translateY = scrollAnim.interpolate({
              inputRange,
              outputRange: [-15, 0, 0],
              extrapolate: 'clamp',
            });

            const scale = scrollAnim.interpolate({
              inputRange,
              outputRange: [0.9, 1, 1],
              extrapolate: 'clamp',
            });

            const opacity = scrollAnim.interpolate({
              inputRange: [index - 2, index - 1, index, index + 1],
              outputRange: [0, 1, 1, 0], 
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                key={item.id}
                style={{
                  position: 'absolute',
                  width: CARD_WIDTH,
                  height: CARD_HEIGHT,
                  transform: [{ translateX }, { translateY }, { scale }],
                  opacity,
                  // Ensures current card is on top, next is below, exiting is on top as it swipes away
                  zIndex: listData.length - index,
                }}
              >
                <View className="flex-1 rounded-[20px] overflow-hidden bg-black shadow-sm shadow-neutral-400">
                  <Image 
                    source={{ uri: item.image }} 
                    className="absolute w-full h-full"
                    resizeMode="cover"
                  />
                  <View className="absolute inset-0 bg-black/40" />

                  <View className="flex-1 justify-between p-4">
                    <View className={`${item.tagColor} self-start px-2 py-1 rounded-md`}>
                      <Text className="text-white text-[10px] font-JakartaBold tracking-wider">
                        {item.tag}
                      </Text>
                    </View>

                    <View>
                      <Text className="text-white text-4xl font-JakartaBold mb-1">{item.title}</Text>
                      <Text className="text-white/90 text-xs font-Jakarta">{item.subtitle}</Text>
                    </View>
                  </View>
                </View>
              </Animated.View>
            );
          }).reverse()}
        </View>

        

        {/* --- TOP RATED NEARBY SECTION --- */}
        <View className="flex-row items-center justify-between mt-6 px-2 mb-4">
          <Text className="text-black text-[17px] font-JakartaMedium">Top Rated Nearby</Text>
          <View className="flex-row items-center gap-1">
            <Ionicons name="location-outline" size={14} color="#3122D2" />
            <Text className="text-[#3122D2] text-[10px] font-JakartaBold">VI, Lagos</Text>
          </View>
        </View>

        <View className="pb-5">
          {nearbyData.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              activeOpacity={0.9}
              className="bg-white rounded-3xl p-3 mb-4 shadow-md shadow-neutral-700"
            >
              {/* Image & Badges */}
              <View className="relative w-full h-44 rounded-2xl overflow-hidden mb-3">
                <Image 
                  source={{ uri: item.image }} 
                  className="w-full h-full"
                  resizeMode="cover"
                />
                
                {/* Rating Badge (Top Right) */}
                <View className="absolute top-3 right-3 bg-white/95 rounded-full px-2.5 py-1 flex-row items-center gap-1 shadow-sm">
                  <FontAwesome name="star" size={12} color="#D97706" />
                  <Text className="font-JakartaBold text-xs text-black">{item.rating}</Text>
                </View>

                {/* Time Badge (Bottom Left) */}
                <View className="absolute bottom-3 left-3 bg-[#3122D2] rounded-full px-3 py-1.5 shadow-sm">
                  <Text className="font-JakartaBold text-[11px] text-white tracking-wide">{item.time}</Text>
                </View>
              </View>

              {/* Info Rows */}
              <View className="px-1 pb-1">
                <View className="flex-row justify-between items-center mb-1">
                  <Text className="text-[17px] font-JakartaBold text-black">{item.title}</Text>
                  <Text className="text-[13px] text-gray-500 font-Jakarta">{item.deliveryInfo}</Text>
                </View>
                <Text className="text-[13px] text-gray-500 font-Jakarta">{item.category}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        



        <View className="flex-row items-center justify-between -mt-2 px-2 mb-5">
          <Text className="text-black text-[17px] font-JakartaMedium">Weekend Hangouts</Text>
          <View className="flex-row items-center gap-1">
            <Ionicons name="arrow-forward-outline" size={20} color="#3122D2" />
          </View>
        </View>

        <View style={[styles.row]}>
        `   {/* Left Column: One Tall Card */}
            <CategoryCard 
                flex={1} 
                height={300} 
                title="Luxe Nightlife" 
                subtitle="8 CURATED SPOTS" 
                imageUrl="https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=800&q=90" 
            />

            <View style={{ width: 12 }} /> {/* Horizontal Gap */}

            {/* Right Column: Two Short Stacked Cards */}
            <View style={{ flex: 1, height: 300, justifyContent: 'space-between' }}>
                <CategoryCard 
                  width="100%" 
                  height={144} // Slightly less than half of 300 to account for the gap
                  title="Quiet Cafes" 
                  subtitle="12 locations" 
                  imageUrl="https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=800&q=90" 
                />

                <CategoryCard 
                  width="100%" 
                  height={144} 
                  title="Art & Culture" 
                  subtitle="Museums & Galleries" 
                  imageUrl="https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=90" 
                />
            </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { padding: 16 },
  row: { flexDirection: 'row', width: '100%' }
});