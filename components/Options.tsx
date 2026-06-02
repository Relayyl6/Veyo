import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, TouchableOpacity, Image, Platform, UIManager,
  Animated, Easing, Dimensions,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { images } from '@/constants/utils';
import { PressableScale } from 'pressto';
import { PressableHybrid } from './CustomPressable';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_PADDING = 32; // px-4 on each side
const GAP = 8;
const TOTAL = SCREEN_WIDTH - GRID_PADDING;

// Width ratios: 32% square ≈ 0.32, 64% rectangle ≈ 0.64
const SQ_W  = (TOTAL * 0.32);
const REC_W = (TOTAL * 0.64);

// ─── DATA ────────────────────────────────────────────────────────────────────

const layoutStates = [
  {
    id: 'functional',
    grid: [
      {
        id: 'item-1', type: 'square',
        title: 'New Trip', iconName: 'location', iconColor: '#EA4335',
      },
      {
        id: 'item-2', type: 'rectangle',
        title: 'Scooter', subtitle: 'One Order,\nTakes Minutes',
        imageUrl: 'https://freepngimg.com/thumb/vehicle/69037-scooter-two-wheeler-kick-vehicle-free-download-png-hd.png',
        bgClass: 'bg-[#FCD34D]',
        textWrapperClass: 'z-10',
        imageClass: { position: 'absolute', bottom: -8, right: -4, width: 110, height: 110 },
        imageOrder: 'after',
      },
      {
        id: 'item-3', type: 'rectangle',
        title: 'Send & Schedule', subtitle: 'Plan\nyour deliveries',
        imageUrl: 'https://freepngimg.com/thumb/gift/8-gift-box-png-image.png',
        bgClass: 'bg-[#86EFAC]',
        textWrapperClass: 'z-10 items-end w-full',
        textAlignClass: 'text-right',
        imageClass: { position: 'absolute', bottom: -6, left: -16, width: 120, height: 120 },
        imageOrder: 'before',
      },
      {
        id: 'item-4', type: 'square',
        title: 'Office', iconName: 'briefcase', iconColor: '#064E3B',
      },
    ],
  },
  {
    id: 'leisure',
    grid: [
      {
        id: 'item-1', type: 'rectangle',
        title: 'Roadtrips', subtitle: 'Rent SUVs\n& explore',
        imageUrl: 'https://freepngimg.com/thumb/vehicle/93770-renegade-tire-jeep-automotive-2018-exterior.png',
        bgClass: 'bg-[#BFDBFE]',
        textWrapperClass: 'z-10',
        imageClass: { position: 'absolute', bottom: -20, right: -16, width: 150, height: 150, borderRadius: 75 },
        imageOrder: 'after',
      },
      {
        id: 'item-2', type: 'square',
        title: 'Dine In', iconName: 'restaurant', iconColor: '#D97706',
      },
      {
        id: 'item-3', type: 'square',
        title: 'Grocery', iconName: 'basket', iconColor: '#047857',
      },
      {
        id: 'item-4', type: 'rectangle',
        title: 'Nightlife', subtitle: 'Discover events\naround you',
        imageUrl: null,
        localImage: images.drinks,
        bgClass: 'bg-[#E9D5FF]',
        textWrapperClass: 'z-10 items-end w-full',
        textAlignClass: 'text-right',
        imageClass: { position: 'absolute', bottom: -12, left: -12, width: 140, height: 140 },
        imageOrder: 'before',
      },
    ],
  },
];

// ─── PHASE ───────────────────────────────────────────────────────────────────
// idle → typing_out (delete text) → blurring (images blur) →
// morphing (cards stretch/shrink) → unblurring → typing_in → idle

type Phase = 'idle' | 'typing_out' | 'morphing' | 'typing_in';

const MORPH_INTERVAL_MS = 11000;

// Per-item deletion speed so they finish at slightly different times (natural feel)
const DELETE_SPEEDS = [55, 45, 50, 48];

// ─── SINGLE CARD COMPONENT ───────────────────────────────────────────────────

interface CardProps {
  item: any;
  targetWidth: number;
  phase: Phase;
  stateKey: string;
  morphDelay: number; // stagger delay for this card's morph
}

const AnimatedCard = ({ item, targetWidth, phase, stateKey, morphDelay }: CardProps) => {
  const animWidth  = useRef(new Animated.Value(targetWidth)).current;
  const imageBlur  = useRef(new Animated.Value(1)).current; // 1 = visible, 0 = blurred/gone
  const textFade   = useRef(new Animated.Value(phase === 'idle' ? 1 : 0)).current;
  const prevWidth  = useRef(targetWidth);

  // Track previous width so we can animate FROM it
  useEffect(() => {
    const isExpanding = targetWidth > prevWidth.current;

    // Staggered spring: row-0 cards slightly before row-1 or vice versa
    Animated.spring(animWidth, {
      toValue: targetWidth,
      delay: morphDelay,
      useNativeDriver: false, // width can't use native driver
      tension: 60,
      friction: 7,
    }).start();

    prevWidth.current = targetWidth;
  }, [targetWidth]);

  // Image fade: blur out during typing_out, unblur during typing_in
  useEffect(() => {
    if (phase === 'typing_out') {
      Animated.timing(imageBlur, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }).start();
    } else if (phase === 'typing_in') {
      Animated.timing(imageBlur, {
        toValue: 1,
        duration: 500,
        delay: 200,
        useNativeDriver: true,
        easing: Easing.in(Easing.ease),
      }).start();
    }
  }, [phase]);

  // Text fade: fade out when leaving, fade in when entering
  useEffect(() => {
    if (phase === 'typing_out') {
      Animated.timing(textFade, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else if (phase === 'idle' || phase === 'typing_in') {
      Animated.timing(textFade, {
        toValue: 1,
        duration: 500,
        delay: phase === 'typing_in' ? 300 : 0,
        useNativeDriver: true,
      }).start();
    }
  }, [phase]);

  const isSquare = item.type === 'square';

  return (
    <Animated.View
      style={{
        width: animWidth,
        height: '100%',
        borderRadius: 28,
        overflow: 'hidden',
        backgroundColor: isSquare ? '#ffffff' : undefined,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      <PressableHybrid
        className={
          !isSquare 
            ? `${item.bgClass} flex-1 p-5 overflow-hidden relative` 
            : 'flex-1 items-center justify-center p-4'
        }
        onPress={() => console.log("Pressed!")}
      >
        {/* ── SQUARE ── */}
        {isSquare && (
          <>
            <Ionicons name={item.iconName as any} size={32} color={item.iconColor} />
            <Animated.Text
              style={{ opacity: textFade }}
              className="mt-2 text-[14px] font-JakartaBold text-black text-center leading-tight"
            >
              {item.title}
            </Animated.Text>
          </>
        )}

        {/* ── RECTANGLE ── */}
        {!isSquare && (
          <>
            {item.imageOrder === 'before' && (
              <Animated.Image
                source={item.localImage ? item.localImage : { uri: item.imageUrl }}
                style={[item.imageClass, { opacity: imageBlur }]}
                resizeMode="contain"
              />
            )}

            <Animated.View style={{ opacity: textFade }} className={item.textWrapperClass}>
              <Text
                className={`text-xl font-JakartaBold text-black ${item.textAlignClass || 'text-left'}`}
              >
                {item.title}
              </Text>
              <Text
                className={`text-xs font-Jakarta text-black opacity-60 mt-0.5 ${item.textAlignClass || 'text-left'}`}
              >
                {item.subtitle}
              </Text>
            </Animated.View>

            {item.imageOrder === 'after' && (
              <Animated.Image
                source={item.localImage ? item.localImage : { uri: item.imageUrl }}
                style={[item.imageClass, { opacity: imageBlur }]}
                resizeMode="contain"
              />
            )}
          </>
        )}
      </PressableHybrid>
    </Animated.View>
  );
};

// ─── MAIN GRID ───────────────────────────────────────────────────────────────

const ServiceGrid = () => {
  const [stateIndex, setStateIndex]   = useState(0);
  const [nextIndex, setNextIndex]     = useState(1);
  const [phase, setPhase]             = useState<Phase>('idle');
  const [deletingItems, setDeletingItems] = useState<any[]>([]);
  const phaseRef = useRef<Phase>('idle');

  const setPhaseSync = (p: Phase) => { phaseRef.current = p; setPhase(p); };

  const currentGrid = layoutStates[stateIndex].grid;
  const nextGrid    = layoutStates[nextIndex].grid;
  const stateKey    = layoutStates[stateIndex].id;

  // Which width does each item in the NEXT state have?
  const getTargetWidth = (grid: any[], idx: number) =>
    grid[idx].type === 'square' ? SQ_W : REC_W;

  const startTransition = useCallback(() => {
    if (phaseRef.current !== 'idle') return;

    const ni = (stateIndex + 1) % layoutStates.length;
    setNextIndex(ni);

    // Snapshot current texts for the deleting phase
    setDeletingItems(currentGrid.map(item => ({ ...item })));
    setPhaseSync('typing_out');

    // After fade out completes (~300ms), trigger morph
    const FADE_OUT_MS = 300;
    const MORPH_MS  = 900;

    setTimeout(() => {
      setPhaseSync('morphing');
      setStateIndex(ni);

      setTimeout(() => {
        setPhaseSync('typing_in');

        // Return to idle after fade in completes
        setTimeout(() => setPhaseSync('idle'), 800);
      }, MORPH_MS);
    }, FADE_OUT_MS);
  }, [stateIndex, currentGrid]);

  // Auto-loop
  useEffect(() => {
    const interval = setInterval(startTransition, MORPH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [startTransition]);

  // Which grid data to render (use next during morphing so shapes are correct)
  const displayGrid = (phase === 'morphing' || phase === 'typing_in' || phase === 'idle' && stateIndex !== 0)
    ? currentGrid
    : currentGrid;

  // Target widths per card based on what the CURRENT stateIndex says
  const targetWidths = currentGrid.map(item =>
    item.type === 'square' ? SQ_W : REC_W
  );

  // Morph stagger delays (ms): row cards fire slightly apart for the stretch feel
  const morphDelays = [0, 80, 80, 0]; // row 1 top-left first, row 2 bottom-right last

  return (
    <View className="px-4 mt-2 mb-4">
      {/* ROW 1 */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', height: 144, marginBottom: 16 }}>
        {[0, 1].map(i => {
          const item = currentGrid[i];
          return (
            <AnimatedCard
              key={item.id}
              item={phase === 'typing_out' && deletingItems[i] ? { ...item, _deleting: true } : item}
              targetWidth={targetWidths[i]}
              phase={phase}
              stateKey={stateKey}
              morphDelay={morphDelays[i]}
            />
          );
        })}
      </View>

      {/* ROW 2 */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', height: 144 }}>
        {[2, 3].map(i => {
          const item = currentGrid[i];
          return (
            <AnimatedCard
              key={item.id}
              item={item}
              targetWidth={targetWidths[i]}
              phase={phase}
              stateKey={stateKey}
              morphDelay={morphDelays[i]}
            />
          );
        })}
      </View>
    </View>
  );
};

export default ServiceGrid;