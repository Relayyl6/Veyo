import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Image,
  Animated,
  Dimensions,
  Text,
  StyleSheet,
  Platform,
  UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { images } from '@/constants/utils';
import { PressableHybrid } from './CustomPressable';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_PADDING = 32; // 16px each side
const GAP = 12;
const TOTAL = SCREEN_WIDTH - GRID_PADDING - GAP;

// Width ratios: 32% square, 68% rectangle
const SQ_W = TOTAL * 0.32;
const REC_W = TOTAL * 0.68;

// ─── DATA DEFINITIONS ────────────────────────────────────────────────────────

const layoutStates = [
  {
    id: 'functional',
    grid: [
      {
        id: 'func-item-1',
        type: 'square' as const,
        title: 'New Trip',
        iconName: 'location' as const,
        iconColor: '#EA4335',
        bgColor: '#FFFFFF',
        route: '/(utils)/book-ride',
      },
      {
        id: 'func-item-2',
        type: 'rectangle' as const,
        title: 'Scooter',
        subtitle: 'One Order,\nTakes Minutes',
        imageUrl: 'https://freepngimg.com/thumb/vehicle/69037-scooter-two-wheeler-kick-vehicle-free-download-png-hd.png',
        bgColor: '#FCD34D',
        textWrapperStyle: { zIndex: 10, alignItems: 'flex-start' as const },
        textAlignStyle: { textAlign: 'left' as const },
        imageStyle: { position: 'absolute' as const, bottom: -8, right: -4, width: 110, height: 110 },
        imageOrder: 'after' as const,
        route: '/(utils)/send-items',
      },
      {
        id: 'func-item-3',
        type: 'rectangle' as const,
        title: 'Send & Schedule',
        subtitle: 'Plan\nyour deliveries',
        imageUrl: 'https://freepngimg.com/thumb/gift/8-gift-box-png-image.png',
        bgColor: '#86EFAC',
        textWrapperStyle: { zIndex: 10, alignItems: 'flex-end' as const, width: '100%' as const },
        textAlignStyle: { textAlign: 'right' as const },
        imageStyle: { position: 'absolute' as const, bottom: -6, left: -16, width: 120, height: 120 },
        imageOrder: 'before' as const,
        route: '/(utils)/send-items',
      },
      {
        id: 'func-item-4',
        type: 'square' as const,
        title: 'Office',
        iconName: 'briefcase' as const,
        iconColor: '#064E3B',
        bgColor: '#FFFFFF',
        route: '/(utils)/book-ride',
      },
    ],
  },
  {
    id: 'leisure',
    grid: [
      {
        id: 'leis-item-1',
        type: 'rectangle' as const,
        title: 'Roadtrips',
        subtitle: 'Rent SUVs\n& explore',
        imageUrl: 'https://freepngimg.com/thumb/vehicle/93770-renegade-tire-jeep-automotive-2018-exterior.png',
        bgColor: '#BFDBFE',
        textWrapperStyle: { zIndex: 10, alignItems: 'flex-start' as const },
        textAlignStyle: { textAlign: 'left' as const },
        imageStyle: { position: 'absolute' as const, bottom: -20, right: -16, width: 150, height: 150, borderRadius: 75 },
        imageOrder: 'after' as const,
        route: '/(utils)/book-ride',
      },
      {
        id: 'leis-item-2',
        type: 'square' as const,
        title: 'Dine In',
        iconName: 'restaurant' as const,
        iconColor: '#D97706',
        bgColor: '#FFFFFF',
        route: '/(root)/(tabs)/explore',
      },
      {
        id: 'leis-item-3',
        type: 'square' as const,
        title: 'Grocery',
        iconName: 'basket' as const,
        iconColor: '#047857',
        bgColor: '#FFFFFF',
        route: '/(root)/(tabs)/explore',
      },
      {
        id: 'leis-item-4',
        type: 'rectangle' as const,
        title: 'Nightlife',
        subtitle: 'Discover events\naround you',
        imageUrl: null,
        localImage: images.drinks,
        bgColor: '#E9D5FF',
        textWrapperStyle: { zIndex: 10, alignItems: 'flex-end' as const, width: '100%' as const },
        textAlignStyle: { textAlign: 'right' as const },
        imageStyle: { position: 'absolute' as const, bottom: -12, left: -12, width: 140, height: 140 },
        imageOrder: 'before' as const,
        route: '/(root)/(tabs)/explore',
      },
    ],
  },
];

type Phase = 'idle' | 'typing_out' | 'morphing' | 'typing_in';
const MORPH_INTERVAL_MS = 10000;

// ─── CARD COMPONENT ──────────────────────────────────────────────────────────

interface CardProps {
  item: any;
  targetWidth: number;
  phase: Phase;
  morphDelay: number;
}

const AnimatedCard = ({ item, targetWidth, phase, morphDelay }: CardProps) => {
  const router = useRouter();
  const animWidth = useRef(new Animated.Value(targetWidth)).current;
  const imageOpacity = useRef(new Animated.Value(1)).current;
  const textOpacity = useRef(new Animated.Value(1)).current;
  const prevWidth = useRef(targetWidth);

  // Staggered width spring animation
  useEffect(() => {
    const isExpanding = targetWidth > prevWidth.current;
    const timer = setTimeout(() => {
      Animated.spring(animWidth, {
        toValue: targetWidth,
        tension: isExpanding ? 50 : 65,
        friction: isExpanding ? 8 : 10,
        useNativeDriver: false,
      }).start();
      prevWidth.current = targetWidth;
    }, morphDelay);

    return () => clearTimeout(timer);
  }, [targetWidth, morphDelay]);

  // Text & image fade transitions
  useEffect(() => {
    if (phase === 'typing_out') {
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(imageOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (phase === 'typing_in') {
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(imageOpacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (phase === 'idle') {
      textOpacity.setValue(1);
      imageOpacity.setValue(1);
    }
  }, [phase]);

  const isSquare = item.type === 'square';

  return (
    <Animated.View
      style={[
        styles.cardContainer,
        {
          width: animWidth,
          backgroundColor: item.bgColor || '#FFFFFF',
        },
      ]}
    >
      <PressableHybrid
        style={styles.cardPressable}
        onPress={() => router.push(item.route)}
      >
        {/* SQUARE CARD LAYOUT */}
        {isSquare && (
          <View style={styles.squareContent}>
            <Animated.View style={{ opacity: imageOpacity }}>
              <Ionicons
                name={item.iconName}
                size={34}
                color={item.iconColor}
              />
            </Animated.View>
            <Animated.Text
              style={[styles.squareTitle, { opacity: textOpacity }]}
              numberOfLines={2}
            >
              {item.title}
            </Animated.Text>
          </View>
        )}

        {/* RECTANGLE CARD LAYOUT */}
        {!isSquare && (
          <View style={styles.rectContent}>
            {item.imageOrder === 'before' && (
              <Animated.Image
                source={item.localImage ? item.localImage : { uri: item.imageUrl }}
                style={[item.imageStyle, { opacity: imageOpacity }]}
                resizeMode="contain"
              />
            )}

            <Animated.View
              style={[
                styles.rectTextContainer,
                item.textWrapperStyle,
                { opacity: textOpacity },
              ]}
            >
              <Text
                style={[
                  styles.rectTitle,
                  item.textAlignStyle,
                ]}
              >
                {item.title}
              </Text>
              <Text
                style={[
                  styles.rectSubtitle,
                  item.textAlignStyle,
                ]}
              >
                {item.subtitle}
              </Text>
            </Animated.View>

            {item.imageOrder === 'after' && (
              <Animated.Image
                source={item.localImage ? item.localImage : { uri: item.imageUrl }}
                style={[item.imageStyle, { opacity: imageOpacity }]}
                resizeMode="contain"
              />
            )}
          </View>
        )}
      </PressableHybrid>
    </Animated.View>
  );
};

// ─── MAIN SERVICE GRID ───────────────────────────────────────────────────────

export default function ServiceGrid() {
  const [stateIndex, setStateIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('idle');
  const phaseRef = useRef<Phase>('idle');

  const setPhaseSync = (p: Phase) => {
    phaseRef.current = p;
    setPhase(p);
  };

  const currentGrid = layoutStates[stateIndex].grid;

  const startTransition = useCallback(() => {
    if (phaseRef.current !== 'idle') return;

    const nextIdx = (stateIndex + 1) % layoutStates.length;
    setPhaseSync('typing_out');

    const FADE_OUT_MS = 280;
    const MORPH_MS = 850;

    setTimeout(() => {
      setPhaseSync('morphing');
      setStateIndex(nextIdx);

      setTimeout(() => {
        setPhaseSync('typing_in');

        setTimeout(() => {
          setPhaseSync('idle');
        }, 500);
      }, MORPH_MS);
    }, FADE_OUT_MS);
  }, [stateIndex]);

  useEffect(() => {
    const timer = setInterval(startTransition, MORPH_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [startTransition]);

  const targetWidths = currentGrid.map((item) =>
    item.type === 'square' ? SQ_W : REC_W
  );

  const morphDelays = [0, 80, 80, 0];

  return (
    <View style={styles.gridWrapper}>
      {/* ROW 1 */}
      <View style={styles.row}>
        {[0, 1].map((i) => {
          const item = currentGrid[i];
          return (
            <AnimatedCard
              key={item.id}
              item={item}
              targetWidth={targetWidths[i]}
              phase={phase}
              morphDelay={morphDelays[i]}
            />
          );
        })}
      </View>

      {/* ROW 2 */}
      <View style={styles.row}>
        {[2, 3].map((i) => {
          const item = currentGrid[i];
          return (
            <AnimatedCard
              key={item.id}
              item={item}
              targetWidth={targetWidths[i]}
              phase={phase}
              morphDelay={morphDelays[i]}
            />
          );
        })}
      </View>
    </View>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  gridWrapper: {
    marginVertical: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 144,
    marginBottom: 14,
  },
  cardContainer: {
    height: 144,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.04)',
  },
  cardPressable: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  squareContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  squareTitle: {
    fontSize: 14,
    fontFamily: 'JakartaBold',
    color: '#111827',
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 18,
  },
  rectContent: {
    flex: 1,
    justifyContent: 'center',
    position: 'relative',
  },
  rectTextContainer: {
    zIndex: 10,
  },
  rectTitle: {
    fontSize: 21,
    fontFamily: 'JakartaBold',
    color: '#000000',
    letterSpacing: -0.4,
  },
  rectSubtitle: {
    fontSize: 12.5,
    fontFamily: 'JakartaMedium',
    color: 'rgba(0, 0, 0, 0.65)',
    marginTop: 3,
    lineHeight: 16,
  },
});
