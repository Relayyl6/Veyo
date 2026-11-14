import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  Animated,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  Platform,
  UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { images } from '@/constants/utils';

// Enable LayoutAnimation safely for legacy Android architectures
if (Platform.OS === 'android' && typeof UIManager?.setLayoutAnimationEnabledExperimental === 'function') {
  try {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  } catch {}
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_PADDING = 32; // 16px screen padding on each side
const GAP = 12; // Gap between the two cards in each row
const TOTAL = SCREEN_WIDTH - GRID_PADDING - GAP;

// Exact width proportions: 32% square, 68% rectangle
const SQ_W = TOTAL * 0.32;
const REC_W = TOTAL * 0.68;

// ─── DATA DEFINITIONS ────────────────────────────────────────────────────────

export interface GridItemConfig {
  id: string;
  type: 'square' | 'rectangle';
  title: string;
  subtitle?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  bgColor: string;
  route: string;
  imageUrl?: string;
  localImage?: any;
  imageOrder?: 'before' | 'after';
  imageStyle?: any;
  textWrapperStyle?: any;
  textAlignStyle?: any;
}

const layoutStates: { id: string; grid: GridItemConfig[] }[] = [
  {
    id: 'functional',
    grid: [
      {
        id: 'slot-0',
        type: 'square',
        title: 'New Trip',
        iconName: 'location',
        iconColor: '#EA4335',
        bgColor: '#FFFFFF',
        route: '/(utils)/book-ride',
      },
      {
        id: 'slot-1',
        type: 'rectangle',
        title: 'Scooter',
        subtitle: 'One Order,\nTakes Minutes',
        imageUrl: 'https://freepngimg.com/thumb/vehicle/69037-scooter-two-wheeler-kick-vehicle-free-download-png-hd.png',
        bgColor: '#FCD34D',
        route: '/(utils)/send-items',
        imageOrder: 'after',
        textWrapperStyle: { zIndex: 10, alignItems: 'flex-start' },
        textAlignStyle: { textAlign: 'left' },
        imageStyle: { position: 'absolute', bottom: -8, right: -4, width: 115, height: 115 },
      },
      {
        id: 'slot-2',
        type: 'rectangle',
        title: 'Send & Schedule',
        subtitle: 'Plan\nyour deliveries',
        imageUrl: 'https://freepngimg.com/thumb/gift/8-gift-box-png-image.png',
        bgColor: '#86EFAC',
        route: '/(utils)/send-items',
        imageOrder: 'before',
        textWrapperStyle: { zIndex: 10, alignItems: 'flex-end', width: '100%' },
        textAlignStyle: { textAlign: 'right' },
        imageStyle: { position: 'absolute', bottom: -6, left: -16, width: 120, height: 120 },
      },
      {
        id: 'slot-3',
        type: 'square',
        title: 'Office',
        iconName: 'briefcase',
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
        id: 'slot-0',
        type: 'rectangle',
        title: 'Roadtrips',
        subtitle: 'Rent SUVs\n& explore',
        imageUrl: 'https://freepngimg.com/thumb/vehicle/93770-renegade-tire-jeep-automotive-2018-exterior.png',
        bgColor: '#BFDBFE',
        route: '/(utils)/book-ride',
        imageOrder: 'after',
        textWrapperStyle: { zIndex: 10, alignItems: 'flex-start' },
        textAlignStyle: { textAlign: 'left' },
        imageStyle: { position: 'absolute', bottom: -20, right: -16, width: 150, height: 150 },
      },
      {
        id: 'slot-1',
        type: 'square',
        title: 'Dine In',
        iconName: 'restaurant',
        iconColor: '#D97706',
        bgColor: '#FFFFFF',
        route: '/(root)/(tabs)/explore',
      },
      {
        id: 'slot-2',
        type: 'square',
        title: 'Grocery',
        iconName: 'basket',
        iconColor: '#047857',
        bgColor: '#FFFFFF',
        route: '/(root)/(tabs)/explore',
      },
      {
        id: 'slot-3',
        type: 'rectangle',
        title: 'Nightlife',
        subtitle: 'Discover events\naround you',
        localImage: images.drinks,
        bgColor: '#E9D5FF',
        route: '/(root)/(tabs)/explore',
        imageOrder: 'before',
        textWrapperStyle: { zIndex: 10, alignItems: 'flex-end', width: '100%' },
        textAlignStyle: { textAlign: 'right' },
        imageStyle: { position: 'absolute', bottom: -12, left: -12, width: 140, height: 140 },
      },
    ],
  },
];

// ─── TIMING & CONSTANTS ──────────────────────────────────────────────────────

type Phase = 'idle' | 'typing_out' | 'morphing' | 'typing_in';

const MORPH_INTERVAL_MS = 11000;
const DELETE_MS = 1250;
const MORPH_MS = 850;
const TYPING_IN_MS = 2200;

// Per-item deletion speed so each card finishes deleting at slightly different times
const DELETE_SPEEDS = [55, 45, 50, 48];

// Staggered morph delays for dynamic diagonal stretch effect
const MORPH_DELAYS = [0, 80, 80, 0];

// ─── TYPEWRITER & DELETING TEXT COMPONENTS ───────────────────────────────────

/**
 * NativeTypewriter: types in text character-by-character
 */
interface NativeTypewriterProps {
  key?: React.Key;
  text: string;
  speed?: number;
  startDelay?: number;
  style?: any;
  numberOfLines?: number;
}

const NativeTypewriter: React.FC<NativeTypewriterProps> = ({
  text,
  speed = 45,
  startDelay = 0,
  style,
  numberOfLines,
}) => {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    let currentIdx = 0;

    const startTyping = () => {
      const typeNextChar = () => {
        if (currentIdx < text.length) {
          currentIdx++;
          setDisplayed(text.slice(0, currentIdx));
          timeout = setTimeout(typeNextChar, speed);
        }
      };
      timeout = setTimeout(typeNextChar, speed);
    };

    if (startDelay > 0) {
      timeout = setTimeout(startTyping, startDelay);
    } else {
      startTyping();
    }

    return () => clearTimeout(timeout);
  }, [text, speed, startDelay]);

  return (
    <Text style={style} numberOfLines={numberOfLines}>
      {displayed}
    </Text>
  );
};

/**
 * DeletingText: deletes text character-by-character from the end
 */
interface DeletingTextProps {
  key?: React.Key;
  text: string;
  speed?: number;
  style?: any;
  numberOfLines?: number;
}

const DeletingText: React.FC<DeletingTextProps> = ({
  text,
  speed = 45,
  style,
  numberOfLines,
}) => {
  const [displayed, setDisplayed] = useState(text);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    let currentLen = text.length;

    const deleteNextChar = () => {
      if (currentLen > 0) {
        currentLen--;
        setDisplayed(text.slice(0, currentLen));
        timeout = setTimeout(deleteNextChar, speed);
      }
    };

    timeout = setTimeout(deleteNextChar, speed);
    return () => clearTimeout(timeout);
  }, [text, speed]);

  return (
    <Text style={style} numberOfLines={numberOfLines}>
      {displayed}
    </Text>
  );
};

// ─── SINGLE ANIMATED CARD ────────────────────────────────────────────────────

interface AnimatedCardProps {
  key?: React.Key;
  item: GridItemConfig;
  previousItem: GridItemConfig;
  targetWidth: number;
  phase: Phase;
  stateKey: string;
  morphDelay: number;
  deleteSpeed: number;
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({
  item,
  previousItem,
  targetWidth,
  phase,
  stateKey,
  morphDelay,
  deleteSpeed,
}: AnimatedCardProps) => {
  const router = useRouter();
  const animWidth = useRef(new Animated.Value(targetWidth)).current;
  const imageOpacity = useRef(new Animated.Value(1)).current;

  // Staggered spring width morph
  useEffect(() => {
    Animated.spring(animWidth, {
      toValue: targetWidth,
      delay: morphDelay,
      useNativeDriver: false, // Layout property requires JS driver
      tension: 58,
      friction: 7.5,
    }).start();
  }, [targetWidth, morphDelay]);

  // Image fade in/out transitions matching typing cycle
  useEffect(() => {
    if (phase === 'typing_out') {
      Animated.timing(imageOpacity, {
        toValue: 0,
        duration: 380,
        useNativeDriver: true,
      }).start();
    } else if (phase === 'typing_in') {
      Animated.timing(imageOpacity, {
        toValue: 1,
        duration: 480,
        delay: 150,
        useNativeDriver: true,
      }).start();
    } else if (phase === 'idle') {
      imageOpacity.setValue(1);
    }
  }, [phase]);

  const handlePress = () => {
    try {
      Haptics.selectionAsync().catch(() => {});
    } catch {}
    if (item.route) {
      router.push(item.route as any);
    }
  };

  const isSquare = item.type === 'square';
  const displayItem = phase === 'typing_out' ? previousItem : item;

  return (
    <Animated.View
      style={[
        styles.cardContainer,
        {
          width: animWidth,
          backgroundColor: item.bgColor,
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={handlePress}
        style={styles.cardPressable}
      >
        {/* ─── SQUARE CARD CONTENT ─── */}
        {isSquare && (
          <View style={styles.squareContent}>
            <Animated.View style={{ opacity: imageOpacity }}>
              {item.iconName && (
                <Ionicons
                  name={item.iconName}
                  size={32}
                  color={item.iconColor || '#111827'}
                />
              )}
            </Animated.View>

            {phase === 'idle' && (
              <Text style={styles.squareTitle} numberOfLines={2}>
                {item.title}
              </Text>
            )}

            {phase === 'typing_out' && (
              <DeletingText
                key={`del-${stateKey}-${displayItem.id}-title`}
                text={displayItem.title}
                speed={deleteSpeed}
                style={styles.squareTitle}
                numberOfLines={2}
              />
            )}

            {phase === 'typing_in' && (
              <NativeTypewriter
                key={`type-${stateKey}-${item.id}-title`}
                text={item.title}
                speed={45}
                style={styles.squareTitle}
                numberOfLines={2}
              />
            )}
          </View>
        )}

        {/* ─── RECTANGLE CARD CONTENT ─── */}
        {!isSquare && (
          <View style={styles.rectContent}>
            {/* Cutout Image (Leading) */}
            {item.imageOrder === 'before' && (
              <Animated.Image
                source={item.localImage ? item.localImage : { uri: item.imageUrl }}
                style={[item.imageStyle, { opacity: imageOpacity }]}
                resizeMode="contain"
              />
            )}

            {/* Card Text Container */}
            <View style={[styles.rectTextContainer, item.textWrapperStyle]}>
              {/* Title */}
              {phase === 'idle' && (
                <Text style={[styles.rectTitle, item.textAlignStyle]}>
                  {item.title}
                </Text>
              )}
              {phase === 'typing_out' && (
                <DeletingText
                  key={`del-${stateKey}-${displayItem.id}-title`}
                  text={displayItem.title}
                  speed={deleteSpeed}
                  style={[styles.rectTitle, displayItem.textAlignStyle]}
                />
              )}
              {phase === 'typing_in' && (
                <NativeTypewriter
                  key={`type-${stateKey}-${item.id}-title`}
                  text={item.title}
                  speed={48}
                  style={[styles.rectTitle, item.textAlignStyle]}
                />
              )}

              {/* Subtitle */}
              {phase === 'idle' && item.subtitle && (
                <Text style={[styles.rectSubtitle, item.textAlignStyle]}>
                  {item.subtitle}
                </Text>
              )}
              {phase === 'typing_out' && displayItem.subtitle && (
                <DeletingText
                  key={`del-${stateKey}-${displayItem.id}-sub`}
                  text={displayItem.subtitle}
                  speed={Math.max(28, deleteSpeed - 12)}
                  style={[styles.rectSubtitle, displayItem.textAlignStyle]}
                />
              )}
              {phase === 'typing_in' && item.subtitle && (
                <NativeTypewriter
                  key={`type-${stateKey}-${item.id}-sub`}
                  text={item.subtitle}
                  speed={32}
                  startDelay={300}
                  style={[styles.rectSubtitle, item.textAlignStyle]}
                />
              )}
            </View>

            {/* Cutout Image (Trailing) */}
            {item.imageOrder === 'after' && (
              <Animated.Image
                source={item.localImage ? item.localImage : { uri: item.imageUrl }}
                style={[item.imageStyle, { opacity: imageOpacity }]}
                resizeMode="contain"
              />
            )}
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── MAIN SERVICE GRID ───────────────────────────────────────────────────────

export default function ServiceGrid() {
  const [stateIndex, setStateIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('idle');
  const phaseRef = useRef<Phase>('idle');
  const previousStateIndexRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setPhaseSync = (p: Phase) => {
    phaseRef.current = p;
    setPhase(p);
  };

  const startTransition = useCallback(() => {
    if (phaseRef.current !== 'idle') return;

    const nextIdx = (stateIndex + 1) % layoutStates.length;
    previousStateIndexRef.current = stateIndex;

    // 1. typing_out phase: erase old text & fade images
    setPhaseSync('typing_out');

    timerRef.current = setTimeout(() => {
      // 2. morphing phase: switch target shapes & trigger spring morph
      setPhaseSync('morphing');
      setStateIndex(nextIdx);

      timerRef.current = setTimeout(() => {
        // 3. typing_in phase: type new text & unblur images
        setPhaseSync('typing_in');

        timerRef.current = setTimeout(() => {
          // 4. Return to idle state
          setPhaseSync('idle');
        }, TYPING_IN_MS);
      }, MORPH_MS);
    }, DELETE_MS);
  }, [stateIndex]);

  // Main automatic animation interval
  useEffect(() => {
    const interval = setInterval(startTransition, MORPH_INTERVAL_MS);
    return () => {
      clearInterval(interval);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [startTransition]);

  const currentGrid = layoutStates[stateIndex].grid;
  const previousGrid = layoutStates[previousStateIndexRef.current].grid;
  const stateKey = layoutStates[stateIndex].id;

  const targetWidths = currentGrid.map((item) =>
    item.type === 'square' ? SQ_W : REC_W
  );

  return (
    <View style={styles.gridWrapper}>
      {/* ROW 1: Slots 0 & 1 */}
      <View style={styles.row}>
        {[0, 1].map((slotIdx) => {
          const item = currentGrid[slotIdx];
          const prevItem = previousGrid[slotIdx];
          return (
            <AnimatedCard
              key={`card-slot-${slotIdx}`}
              item={item}
              previousItem={prevItem}
              targetWidth={targetWidths[slotIdx]}
              phase={phase}
              stateKey={stateKey}
              morphDelay={MORPH_DELAYS[slotIdx]}
              deleteSpeed={DELETE_SPEEDS[slotIdx]}
            />
          );
        })}
      </View>

      {/* ROW 2: Slots 2 & 3 */}
      <View style={styles.row}>
        {[2, 3].map((slotIdx) => {
          const item = currentGrid[slotIdx];
          const prevItem = previousGrid[slotIdx];
          return (
            <AnimatedCard
              key={`card-slot-${slotIdx}`}
              item={item}
              previousItem={prevItem}
              targetWidth={targetWidths[slotIdx]}
              phase={phase}
              stateKey={stateKey}
              morphDelay={MORPH_DELAYS[slotIdx]}
              deleteSpeed={DELETE_SPEEDS[slotIdx]}
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
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.04)',
    flexShrink: 0,
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
    marginTop: 8,
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
