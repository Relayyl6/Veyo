import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  Animated,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { Ionicons, FontAwesome5, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { images } from '@/constants/utils';
import { PressableHybrid } from './CustomPressable';
import { RADIUS, SPACING } from '@/constants/designTokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_PADDING = SPACING.screen * 2; // 32px (16 on each side)
const GAP = 8;
const TOTAL = SCREEN_WIDTH - GRID_PADDING - GAP;

// Width ratios: 33% square, 67% rectangle (accounting for gap)
const SQ_W = TOTAL * 0.32;
const REC_W = TOTAL * 0.68;

interface GridItem {
  id: string;
  type: 'square' | 'rectangle';
  title: string;
  subtitle?: string;
  iconName?: string;
  iconType?: 'ion' | 'fa5' | 'feather';
  iconColor?: string;
  iconBg?: string;
  localImage?: any;
  bgClass: string;
  route: string;
  imageOrder?: 'before' | 'after';
  imageClass?: object;
}

const layoutStates: { id: string; grid: GridItem[] }[] = [
  {
    id: 'functional',
    grid: [
      {
        id: 'item-1',
        type: 'square',
        title: 'New Trip',
        iconName: 'location',
        iconType: 'ion',
        iconColor: '#EA4335',
        iconBg: '#FEE2E2',
        bgClass: 'bg-white',
        route: '/(utils)/book-ride',
      },
      {
        id: 'item-2',
        type: 'rectangle',
        title: 'Swift Delivery',
        subtitle: 'Takes minutes\nto your door',
        iconName: 'motorcycle',
        iconType: 'fa5',
        iconColor: '#B45309',
        iconBg: '#FDE68A',
        bgClass: 'bg-[#FEF3C7]',
        route: '/(utils)/send-items',
        imageOrder: 'after',
      },
      {
        id: 'item-3',
        type: 'rectangle',
        title: 'Send Packages',
        subtitle: 'Same-day on-demand\nlogistics',
        iconName: 'package',
        iconType: 'feather',
        iconColor: '#047857',
        iconBg: '#BBF7D0',
        bgClass: 'bg-[#DCFCE7]',
        route: '/(utils)/send-items',
        imageOrder: 'before',
      },
      {
        id: 'item-4',
        type: 'square',
        title: 'Work / Office',
        iconName: 'briefcase',
        iconType: 'ion',
        iconColor: '#0286FF',
        iconBg: '#EBF4FF',
        bgClass: 'bg-white',
        route: '/(utils)/book-ride',
      },
    ],
  },
  {
    id: 'leisure',
    grid: [
      {
        id: 'item-1',
        type: 'rectangle',
        title: 'Roadtrips',
        subtitle: 'Rent SUVs\n& explore cities',
        localImage: images.signUpCar,
        bgClass: 'bg-[#E0F2FE]',
        route: '/(utils)/book-ride',
        imageOrder: 'after',
        imageClass: {
          position: 'absolute',
          bottom: -6,
          right: -10,
          width: 82,
          height: 60,
        },
      },
      {
        id: 'item-2',
        type: 'square',
        title: 'Dine In',
        iconName: 'restaurant',
        iconType: 'ion',
        iconColor: '#D97706',
        iconBg: '#FEF3C7',
        bgClass: 'bg-white',
        route: '/(root)/(tabs)/explore',
      },
      {
        id: 'item-3',
        type: 'square',
        title: 'Grocery',
        iconName: 'basket',
        iconType: 'ion',
        iconColor: '#047857',
        iconBg: '#D1FAE5',
        bgClass: 'bg-white',
        route: '/(root)/(tabs)/explore',
      },
      {
        id: 'item-4',
        type: 'rectangle',
        title: 'Nightlife',
        subtitle: 'Discover events\naround you',
        localImage: images.drinks,
        bgClass: 'bg-[#F3E8FF]',
        route: '/(root)/(tabs)/explore',
        imageOrder: 'before',
        imageClass: {
          position: 'absolute',
          bottom: -8,
          left: -4,
          width: 75,
          height: 75,
        },
      },
    ],
  },
];

const MORPH_INTERVAL_MS = 10000;

interface AnimatedCardProps {
  item: GridItem;
  targetWidth: number;
  morphDelay: number;
}

const AnimatedCard = ({ item, targetWidth, morphDelay }: AnimatedCardProps) => {
  const router = useRouter();
  const animWidth = useRef(new Animated.Value(targetWidth)).current;
  const contentFade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(animWidth, {
      toValue: targetWidth,
      delay: morphDelay,
      useNativeDriver: false,
      tension: 50,
      friction: 8,
    }).start();
  }, [targetWidth, morphDelay]);

  const isSquare = item.type === 'square';

  return (
    <Animated.View
      style={[
        styles.cardOuter,
        {
          width: animWidth,
          borderRadius: RADIUS.cardCompact,
        },
      ]}
    >
      <PressableHybrid
        className={`flex-1 ${item.bgClass} justify-between p-2.5 overflow-hidden relative`}
        onPress={() => router.push(item.route as any)}
      >
        {isSquare ? (
          // Square Layout
          <View className="flex-1 items-center justify-center">
            <View
              style={[
                styles.squareIconBox,
                { backgroundColor: item.iconBg || '#F3F4F6' },
              ]}
            >
              {item.iconType === 'fa5' ? (
                <FontAwesome5 name={item.iconName as any} size={15} color={item.iconColor} />
              ) : item.iconType === 'feather' ? (
                <Feather name={item.iconName as any} size={16} color={item.iconColor} />
              ) : (
                <Ionicons name={item.iconName as any} size={18} color={item.iconColor} />
              )}
            </View>
            <Text
              className="mt-1 text-[11px] font-JakartaBold text-neutral-800 text-center leading-tight"
              numberOfLines={1}
            >
              {item.title}
            </Text>
          </View>
        ) : (
          // Rectangle Layout
          <View className="flex-1 flex-row items-center justify-between">
            {item.imageOrder === 'before' && (
              item.localImage ? (
                <Image
                  source={item.localImage}
                  style={item.imageClass as any}
                  resizeMode="contain"
                />
              ) : (
                <View
                  style={[
                    styles.rectIconBox,
                    { backgroundColor: item.iconBg || '#E0E7FF' },
                  ]}
                >
                  <Feather name="package" size={18} color={item.iconColor || '#0286FF'} />
                </View>
              )
            )}

            <View
              className={`flex-1 z-10 justify-center ${
                item.imageOrder === 'before' ? 'items-end pl-14' : 'items-start pr-14'
              }`}
            >
              <Text
                className={`text-[13px] font-JakartaBold text-neutral-900 leading-tight ${
                  item.imageOrder === 'before' ? 'text-right' : 'text-left'
                }`}
                numberOfLines={1}
              >
                {item.title}
              </Text>
              {item.subtitle && (
                <Text
                  className={`text-[9.5px] font-JakartaMedium text-neutral-600 mt-0.5 leading-snug ${
                    item.imageOrder === 'before' ? 'text-right' : 'text-left'
                  }`}
                  numberOfLines={2}
                >
                  {item.subtitle}
                </Text>
              )}
            </View>

            {item.imageOrder === 'after' && (
              item.localImage ? (
                <Image
                  source={item.localImage}
                  style={item.imageClass as any}
                  resizeMode="contain"
                />
              ) : (
                <View
                  style={[
                    styles.rectIconBox,
                    { backgroundColor: item.iconBg || '#FEF3C7' },
                  ]}
                >
                  <FontAwesome5
                    name={(item.iconName as any) || 'motorcycle'}
                    size={18}
                    color={item.iconColor || '#B45309'}
                  />
                </View>
              )
            )}
          </View>
        )}
      </PressableHybrid>
    </Animated.View>
  );
};

const ServiceGrid = () => {
  const [stateIndex, setStateIndex] = useState(0);

  const startTransition = useCallback(() => {
    setStateIndex((prev) => (prev + 1) % layoutStates.length);
  }, []);

  useEffect(() => {
    const interval = setInterval(startTransition, MORPH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [startTransition]);

  const currentGrid = layoutStates[stateIndex].grid;
  const targetWidths = currentGrid.map((item) =>
    item.type === 'square' ? SQ_W : REC_W
  );
  const morphDelays = [0, 60, 60, 0];

  return (
    <View style={styles.gridContainer}>
      {/* ROW 1 */}
      <View style={styles.row}>
        {[0, 1].map((i) => (
          <AnimatedCard
            key={currentGrid[i].id}
            item={currentGrid[i]}
            targetWidth={targetWidths[i]}
            morphDelay={morphDelays[i]}
          />
        ))}
      </View>

      {/* ROW 2 */}
      <View style={styles.row}>
        {[2, 3].map((i) => (
          <AnimatedCard
            key={currentGrid[i].id}
            item={currentGrid[i]}
            targetWidth={targetWidths[i]}
            morphDelay={morphDelays[i]}
          />
        ))}
      </View>
    </View>
  );
};

export default ServiceGrid;

const styles = StyleSheet.create({
  gridContainer: {
    marginVertical: 4,
    gap: GAP,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 80,
  },
  cardOuter: {
    height: '100%',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  squareIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rectIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
