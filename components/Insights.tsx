import React, { useRef, useState } from 'react';
import { 
  View, 
  Text, 
  Image, 
  ScrollView, 
  TouchableOpacity, 
  Animated, 
  Dimensions,
  StyleSheet,
  LayoutAnimation
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const aiPredictionsData = [
  // ... your existing array stays exactly the same ...
  {
    id: '1',
    title: 'Shawarma order?',
    subtitle: 'Usually ordered at 8 PM',
    tag: 'AI PREDICTION',
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=1000&auto=format&fit=crop', 
  },
  {
    id: '2',
    title: 'Late night pizza?',
    subtitle: 'Usually ordered at 11 PM',
    tag: 'AI PREDICTION',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1000&auto=format&fit=crop', 
  },
  {
    id: '3',
    title: 'Morning coffee run?',
    subtitle: 'Usually ordered at 7:30 AM',
    tag: 'AI PREDICTION',
    image: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=1000&auto=format&fit=crop', 
  },
  {
    id: '4',
    title: 'Heading to the Gym?',
    subtitle: 'Usually booked at 6:00 PM',
    tag: 'SMART COMMUTE',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000&auto=format&fit=crop', 
  },
  {
    id: '5',
    title: 'Weekend Groceries?',
    subtitle: 'Based on your Saturday routine',
    tag: 'AI PREDICTION',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1000&auto=format&fit=crop', 
  },
  {
    id: '6',
    title: 'Flight to Abuja?',
    subtitle: 'Minimal airport traffic right now',
    tag: 'TRAVEL ALERT',
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=1000&auto=format&fit=crop', 
  },
  {
    id: '7',
    title: 'Friday night out?',
    subtitle: 'Victoria Island again?',
    tag: 'SMART COMMUTE',
    image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1000&auto=format&fit=crop', 
  }
];

const AIPredictionList = () => {
  return (
    <View className="mb-4">
      <ScrollView 
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 4 }}
        snapToInterval={316} // 300px card width + 16px right margin
        decelerationRate="fast"
        snapToAlignment="start"
        disableIntervalMomentum={true} // Prevents swiping past multiple cards at once
      >
        {aiPredictionsData.map((item) => (
          <View key={item.id} className="w-[300px] h-56 rounded-3xl overflow-hidden mr-4 relative bg-neutral-800">
            {/* Background Image */}
            <Image 
              source={{ uri: item.image }} 
              className="absolute w-full h-full"
              resizeMode="cover"
            />
            {/* Dark Gradient Overlay */}
            <View className="absolute bottom-0 w-full h-1/3 bg-black/60 flex justify-end p-4">
              
              {/* Tag */}
              <View className="bg-orange-600 self-start px-2 py-0.5 rounded-md mb-2">
                <Text className="text-white text-[10px] font-bold tracking-wider">{item.tag}</Text>
              </View>

              <View className="flex-row items-end justify-between">
                <View>
                  {/* Title */}
                  <Text className="text-white text-xl font-bold mb-1">{item.title}</Text>
                  {/* Subtitle */}
                  <Text className="text-gray-300 text-xs">{item.subtitle}</Text>
                </View>

                {/* Cart Button */}
                <TouchableOpacity className="bg-white/20 p-3 rounded-2xl w-12 h-12 items-center justify-center border border-white/10">
                  <Ionicons name="cart" size={20} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const TrafficAlertCard = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => {
    // Automatically smoothly animates the layout change
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsCollapsed(!isCollapsed);
  };

  // --- THE HOVERING PILL STATE ---
  if (isCollapsed) {
    return (
      <TouchableOpacity 
        onPress={toggleCollapse}
        className="absolute bottom-5 right-5 z-50 bg-white rounded-full px-4 py-2.5 flex-row items-center shadow-lg shadow-neutral-300 border border-neutral-100"
      >
        <FontAwesome5 name="traffic-light" size={20} color="#dc2626" />
        {/* <Text className="text-xs font-bold text-neutral-800 ml-2"></Text> */}
      </TouchableOpacity>
    );
  }

  // --- THE FULL CARD STATE ---
  return (
    <View className="bg-white rounded-3xl p-5 shadow-sm shadow-neutral-200 mb-4 border border-neutral-50 relative">
      
      {/* Collapse Button at the upper edge */}
      <TouchableOpacity 
        onPress={toggleCollapse} 
        className="absolute top-4 right-4 z-10 w-6 h-6 items-center justify-center bg-neutral-100 rounded-full"
      >
        {/* Changed icon to chevron-down to indicate collapsing */}
        <Ionicons name="chevron-down" size={14} color="#666" />
      </TouchableOpacity>

      <View >
        {/* Icon Container */}
        <View className="flex-row items-start pr-6">
            <View className="bg-red-50 w-12 h-12 rounded-2xl items-center justify-center mr-4">
              <FontAwesome5 name="traffic-light" size={20} color="#dc2626" />
            </View>

            <View className="flex-col items-start flex-wrap mb-1">
                <Text className="text-lg font-bold text-neutral-800">High traffic to Yaba</Text>
                <View className="bg-red-50 px-2 py-0.5 mt-0.5 rounded-full border border-red-100">
                    <Text className="text-red-500 text-[10px] font-bold">CRITICAL</Text>
                </View>
            </View>
        </View>

        {/* Content */}
        <View className="flex-1">
          <Text className="text-neutral-500 text-xs leading-5 mb-4 pr-2 pl-2">
            Congestion on Third Mainland Bridge. Leave now to arrive by 7:15 PM.
          </Text>

          {/* Action Button */}
          <TouchableOpacity className="bg-indigo-50 py-3 rounded-xl items-center w-full">
            <Text className="text-indigo-600 font-semibold text-sm">Reroute & Book Ride</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export const WeatherCard = () => {
  return (
    <TouchableOpacity activeOpacity={0.9} className="bg-[#f2f4ff] rounded-3xl p-4 flex-row items-center justify-between mb-4">
      <View className="flex-row items-center">
        {/* Weather Icon Circle */}
        <View className="bg-[#e4eaf9] w-12 h-12 rounded-full items-center justify-center mr-3">
          <Ionicons name="partly-sunny-outline" size={24} color="#3b82f6" />
        </View>

        {/* Text Details */}
        <View>
          <Text className="text-neutral-800 text-sm font-semibold mb-0.5">Cloudy 29°C</Text>
          <Text className="text-neutral-500 text-xs">Perfect for a walk</Text>
        </View>
      </View>

      {/* Chevron */}
      <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
    </TouchableOpacity>
  );
};

// ==========================================
// MAIN SCREEN WRAPPER
// ==========================================
export default function VeyoInsightsScreen() {
  return (
    <View className="flex-1 bg-neutral-50 px-4 pt-4">
      <AIPredictionList />
      <WeatherCard />
      <TrafficAlertCard />
    </View>
  );
}