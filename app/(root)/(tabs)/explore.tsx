import React, { useRef, useState } from 'react';
import { View, Text, Image, Dimensions, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import CategoryCard from '@/components/CategoryCard';
import { images } from '@/constants/utils';
import Header from '@/components/Header';
import { useUser } from '@clerk/expo';
import { PressableHybrid } from '@/components/CustomPressable';
// import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolation,
  runOnJS } from 'react-native-reanimated';
import CarouselCard from '@/components/CarousalCard';
import { nearbyData, discoveryData } from "@/constants/item";
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 40; // Full width minus 20px padding on each side
const CARD_HEIGHT = 150;

const ITEM_WIDTH = width * 0.75;
const OFFSET_TO_EDGE = (width - ITEM_WIDTH) / 2;



export default function Explore() {
  const [listData, setListData] = useState(discoveryData);
  const scrollAnim = useSharedValue(0);
  const currentIndexRef = useRef(0);
  const { user } = useUser();
  const insets = useSafeAreaInsets();

  const maybeGrowList = (nextIndex: number) => {
    setListData(prevData => {
      if (nextIndex >= prevData.length - 2) {
        return [
          ...prevData,
          ...discoveryData.map(item => ({ ...item, id: `${item.id}-${prevData.length}` })),
        ];
      }
      return prevData;
    });
  };

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onStart(() => {
      // no-op: scrollAnim is already at rest or mid-spring; UI thread reads current value directly
    })
    .onUpdate((event) => {
      const newFloatIndex = currentIndexRef.current - event.translationX / width;
      scrollAnim.value = newFloatIndex;
    })
    .onEnd((event) => {
      const dx = event.translationX;
      const vx = event.velocityX;
      const SWIPE_THRESHOLD = width * 0.25;
      const VELOCITY_THRESHOLD = 500; // px/s, RNGH's native velocity unit

      let step = 0;
      if (dx < -SWIPE_THRESHOLD || vx < -VELOCITY_THRESHOLD) step = 1;
      else if (dx > SWIPE_THRESHOLD || vx > VELOCITY_THRESHOLD) step = -1;

      const nextIndex = Math.max(0, currentIndexRef.current + step);

      scrollAnim.value = withSpring(nextIndex, { damping: 15, stiffness: 150 });

      runOnJS(() => {
        currentIndexRef.current = nextIndex;
        maybeGrowList(nextIndex);
      })();
    });

  // We use PanResponder to handle the custom swiping logic since we aren't using a FlatList
  // const panResponder = useRef(
  //   PanResponder.create({
  //     // CAPTURE-phase handlers run BEFORE children (like the PressableHybrid
  //     // inside each card) get a chance to claim the touch responder.
  //     // Using only the bubble-phase "onMoveShouldSetPanResponder" (as before)
  //     // meant the inner Pressable was winning the responder race on every
  //     // touch, which is why swiping felt unresponsive/inconsistent.
  //     onStartShouldSetPanResponderCapture: () => false, // don't steal simple taps
  //     onMoveShouldSetPanResponderCapture: (_, gesture) => {
  //       return Math.abs(gesture.dx) > 10 && Math.abs(gesture.dx) > Math.abs(gesture.dy);
  //     },
  //     // Keep the bubble-phase version too as a fallback for any nested view
  //     // that isn't itself a Touchable.
  //     onMoveShouldSetPanResponder: (_, gesture) => {
  //       return Math.abs(gesture.dx) > 10 && Math.abs(gesture.dx) > Math.abs(gesture.dy);
  //     },

  //     onPanResponderGrant: () => {
  //       scrollAnim.stopAnimation((value) => {
  //         currentIndexRef.current = value;
  //       });
  //     },

  //     onPanResponderMove: (_, gesture) => {
  //       const newFloatIndex = currentIndexRef.current - (gesture.dx / width);
  //       scrollAnim.setValue(newFloatIndex);
  //     },

  //     onPanResponderRelease: (_, gesture) => {
  //       let step = 0;
  //       const SWIPE_THRESHOLD = width * 0.25;
  //       const VELOCITY_THRESHOLD = 0.5;

  //       if (gesture.dx < -SWIPE_THRESHOLD || gesture.vx < -VELOCITY_THRESHOLD) {
  //         step = 1;
  //       } else if (gesture.dx > SWIPE_THRESHOLD || gesture.vx > VELOCITY_THRESHOLD) {
  //         step = -1;
  //       }

  //       let nextIndex = currentIndexRef.current + step;
  //       nextIndex = Math.max(0, nextIndex);

  //       Animated.spring(scrollAnim, {
  //         toValue: nextIndex,
  //         useNativeDriver: true,
  //         friction: 8,
  //         tension: 40,
  //       }).start(() => {
  //         currentIndexRef.current = nextIndex;

  //         // FIX: do the length check *inside* the setListData updater so it
  //         // always sees the freshest array length, instead of relying on the
  //         // `listData` variable captured when this PanResponder was created
  //         // (which useRef() only builds once, on first render).
  //         setListData(prevData => {
  //           if (nextIndex >= prevData.length - 2) {
  //             return [
  //               ...prevData,
  //               ...discoveryData.map(item => ({ ...item, id: `${item.id}-${prevData.length}` }))
  //             ];
  //           }
  //           return prevData;
  //         });
  //       });
  //     },
  //   })
  // ).current;

  // const insets = useSafeAreaInsets()

  return (
    <SafeAreaView className="flex-1 bg-transparent">
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          paddingTop: insets.top,
          paddingBottom: 10,
          backgroundColor: 'transparent'
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

        <GestureDetector gesture={panGesture}>
          <View className="items-center justify-center relative" style={{ height: CARD_HEIGHT + 20 }}>
            {listData.map((item, index) => (
              <CarouselCard
                key={item.id}
                item={item}
                index={index}
                scrollAnim={scrollAnim}
                total={listData.length}
              />
            ))}
          </View>
        </GestureDetector>



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
              <View className="relative w-full h-44 rounded-2xl overflow-hidden mb-3">
                <Image
                  source={{ uri: item.image }}
                  className="w-full h-full"
                  resizeMode="cover"
                />

                <View className="absolute top-3 right-3 bg-white/95 rounded-full px-2.5 py-1 flex-row items-center gap-1 shadow-sm">
                  <FontAwesome name="star" size={12} color="#D97706" />
                  <Text className="font-JakartaBold text-xs text-black">{item.rating}</Text>
                </View>

                <View className="absolute bottom-3 left-3 bg-[#3122D2] rounded-full px-3 py-1.5 shadow-sm">
                  <Text className="font-JakartaBold text-[11px] text-white tracking-wide">{item.time}</Text>
                </View>
              </View>

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
            {/* Left Column: One Tall Card */}
            <CategoryCard
                flex={1}
                height={300}
                title="Luxe Nightlife"
                subtitle="8 CURATED SPOTS"
                imageUrl="https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=800&q=90"
            />

            <View style={{ width: 12 }} />

            {/* Right Column: Two Short Stacked Cards */}
            <View style={{ flex: 1, height: 300, justifyContent: 'space-between' }}>
                <CategoryCard
                  width="100%"
                  height={144}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: { padding: 16 },
  row: { flexDirection: 'row', width: '100%' }
});