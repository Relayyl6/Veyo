// import React, { useEffect, useState } from 'react';
// import { StyleSheet, View, Image } from 'react-native';
// import Animated, {
//   useSharedValue,
//   useAnimatedStyle,
//   withTiming,
//   withSequence,
//   withDelay,
// } from 'react-native-reanimated';
// import { scheduleOnRN } from 'react-native-worklets';
// import * as SplashScreen from 'expo-splash-screen';

// // Keep the native splash screen visible while we setup
// SplashScreen.preventAutoHideAsync();

// export default function AnimatedSplashScreen({ onComplete }: { onComplete: () => void }) {
//   const [isAppReady, setAppReady] = useState(false);

//   // Animation values
//   const lineScale = useSharedValue(0);
//   const lineOpacity = useSharedValue(1);
//   const logoOpacity = useSharedValue(0);
//   const logoScale = useSharedValue(0.9);

//   useEffect(() => {
//     // Simulate loading your app resources (fonts, data, etc.)
//     // Once done, we hide the native splash and start our animation
//     async function prepareApp() {
//       try {
//         // Pre-load things here if needed
//         await new Promise(resolve => setTimeout(resolve, 500)); 
//       } catch (e) {
//         console.warn(e);
//       } finally {
//         setAppReady(true);
//         await SplashScreen.hideAsync();
//         startAnimation();
//       }
//     }

//     prepareApp();
//   }, []);

//   const startAnimation = () => {
//     // 1. Line expands horizontally
//     lineScale.value = withTiming(1, { duration: 600 }, () => {
//       // 2. Line fades out
//       lineOpacity.value = withTiming(0, { duration: 300 });

//       // 3. Logo fades in and scales up to normal size
//       logoOpacity.value = withDelay(
//         200,
//         withTiming(1, { duration: 1500 })
//       );
//       logoScale.value = withDelay(
//         200,
//         withTiming(1, { duration: 1500 }, (finished) => {
//           if (finished) {
//             // 4. Tell the app to move on to the Home screen
//             scheduleOnRN(onComplete);
//           }
//         })
//       );
//     });
//   };

//   const animatedLineStyle = useAnimatedStyle(() => {
//     return {
//       transform: [{ scaleX: lineScale.value }],
//       opacity: lineOpacity.value,
//     };
//   });

//   const animatedLogoStyle = useAnimatedStyle(() => {
//     return {
//       opacity: logoOpacity.value,
//       transform: [{ scale: logoScale.value }],
//     };
//   });

//   if (!isAppReady) {
//     return null; // Let the native splash screen show
//   }

//   return (
//     <View style={styles.container}>
//       {/* The expanding line */}
//       <Animated.View style={[styles.line, animatedLineStyle]} />

//       {/* The main Veyo Splash Image */}
//       <Animated.View style={[styles.logoContainer, animatedLogoStyle]}>
//         <Image
//           source={require('@/assets/images/splash.png')}
//           style={styles.image}
//           resizeMode="contain"
//         />
//       </Animated.View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#1C75FF', // Must match your app.json background
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   line: {
//     height: 4,
//     width: '60%',
//     backgroundColor: '#ffffff',
//     borderRadius: 2,
//     position: 'absolute',
//   },
//   logoContainer: {
//     flex: 1,
//     width: '100%',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   image: {
//     width: '100%',
//     height: '100%',
//   },
// });
import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Animated,
  Easing,
  Dimensions,
  Text,
} from 'react-native';
import Svg, {
  Path,
  Circle,
  Rect,
  Line,
  Ellipse,
  G,
  Text as SvgText,
} from 'react-native-svg';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

const { width: SW, height: SH } = Dimensions.get('window');
const CX = SW / 2;

// ─────────────────────────────────────────────
//  VEYO LOGO  (custom-drawn, no image)
// ─────────────────────────────────────────────
function VeyoLogo({ size = 1 }: { size?: number }) {
  const W = 160 * size;
  const H = 90 * size;
  return (
    <Svg width={W} height={H} viewBox="0 0 160 90">
      {/* Speed lines */}
      <Rect x="0" y="26" width="28" height="6" rx="3" fill="white" opacity="0.9" />
      <Rect x="4" y="38" width="22" height="6" rx="3" fill="white" opacity="0.7" />
      <Rect x="8" y="50" width="16" height="6" rx="3" fill="white" opacity="0.5" />

      {/* V shape */}
      <Path
        d="M38 18 L68 72 L80 48 L92 72 L122 18 L108 18 L80 62 L52 18 Z"
        fill="white"
      />

      {/* VEYO wordmark below */}
      {/* V */}
      <Path d="M4 80 L14 105 L24 80" stroke="white" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ─────────────────────────────────────────────
//  ICON: Food Bowl (top-left)
// ─────────────────────────────────────────────
function IconBowl() {
  return (
    <Svg width={56} height={56} viewBox="0 0 56 56">
      <Path d="M8 32 Q8 48 28 48 Q48 48 48 32 Z" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <Line x1="8" y1="32" x2="48" y2="32" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      {/* chopsticks */}
      <Line x1="22" y1="8" x2="20" y2="28" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <Line x1="30" y1="6" x2="28" y2="28" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      {/* steam */}
      <Path d="M18 26 Q16 22 18 18" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6" />
      <Path d="M28 24 Q26 20 28 16" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6" />
    </Svg>
  );
}

// ─────────────────────────────────────────────
//  ICON: Coffee Cup (mid-left)
// ─────────────────────────────────────────────
function IconCoffee() {
  return (
    <Svg width={56} height={56} viewBox="0 0 56 56">
      {/* cup body */}
      <Path d="M12 22 L16 50 L40 50 L44 22 Z" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* lid */}
      <Rect x="10" y="16" width="36" height="8" rx="4" stroke="white" strokeWidth="2.5" fill="none" />
      {/* straw */}
      <Line x1="32" y1="16" x2="34" y2="6" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      {/* steam */}
      <Path d="M20 14 Q18 10 20 6" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7" />
      <Path d="M28 13 Q26 9 28 5" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7" />
    </Svg>
  );
}

// ─────────────────────────────────────────────
//  ICON: Credit Card + Contactless (bottom-left)
// ─────────────────────────────────────────────
function IconCard() {
  return (
    <Svg width={80} height={70} viewBox="0 0 80 70">
      {/* card */}
      <Rect x="2" y="2" width="54" height="36" rx="6" stroke="white" strokeWidth="2.5" fill="none" />
      <Line x1="2" y1="14" x2="56" y2="14" stroke="white" strokeWidth="2.5" />
      <Rect x="10" y="20" width="14" height="6" rx="2" stroke="white" strokeWidth="2" fill="none" />
      <Line x1="32" y1="22" x2="46" y2="22" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <Line x1="32" y1="27" x2="42" y2="27" stroke="white" strokeWidth="2" strokeLinecap="round" />
      {/* contactless icon below */}
      <Circle cx="30" cy="56" r="10" stroke="white" strokeWidth="2.5" fill="none" />
      <Path d="M24 56 Q24 48 30 48" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <Path d="M36 56 Q36 64 30 64" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </Svg>
  );
}

// ─────────────────────────────────────────────
//  ICON: Restaurant / Delivery Bag (top-right)
// ─────────────────────────────────────────────
function IconBag() {
  return (
    <Svg width={56} height={56} viewBox="0 0 56 56">
      {/* A-frame bag */}
      <Path d="M8 48 L28 6 L48 48 Z" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* dish cloche on top of bag */}
      <Ellipse cx="28" cy="24" rx="10" ry="6" stroke="white" strokeWidth="2" fill="none" />
      <Line x1="18" y1="24" x2="38" y2="24" stroke="white" strokeWidth="2" />
      <Line x1="28" y1="18" x2="28" y2="14" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <Circle cx="28" cy="13" r="2" stroke="white" strokeWidth="2" fill="none" />
    </Svg>
  );
}

// ─────────────────────────────────────────────
//  ICON: Wallet + Naira (bottom-right)
// ─────────────────────────────────────────────
function IconWallet() {
  return (
    <Svg width={80} height={70} viewBox="0 0 80 70">
      {/* wallet */}
      <Rect x="2" y="10" width="50" height="34" rx="6" stroke="white" strokeWidth="2.5" fill="none" />
      <Rect x="34" y="20" width="18" height="14" rx="4" stroke="white" strokeWidth="2" fill="none" />
      <Circle cx="43" cy="27" r="3" stroke="white" strokeWidth="1.5" fill="none" />
      {/* Naira symbol */}
      <SvgText
        x="58"
        y="58"
        fontSize="24"
        fill="none"
        stroke="white"
        strokeWidth="1.5"
        fontWeight="bold"
      >
        ₦
      </SvgText>
      <Circle cx="62" cy="56" r="12" stroke="white" strokeWidth="2.5" fill="none" />
    </Svg>
  );
}

// ─────────────────────────────────────────────
//  CITY SKYLINE  (bottom)
// ─────────────────────────────────────────────
function CitySkyline() {
  return (
    <Svg width={SW} height={200} viewBox={`0 0 ${SW} 200`}>
      {/* Ground line */}
      <Line x1={0} y1={155} x2={SW} y2={155} stroke="white" strokeWidth="1.5" opacity="0.4" />

      {/* Left tall tower */}
      <Rect x={SW * 0.22} y={60} width={28} height={95} stroke="white" strokeWidth="1.5" fill="none" opacity="0.5" />
      <Rect x={SW * 0.24} y={48} width={18} height={16} stroke="white" strokeWidth="1.5" fill="none" opacity="0.5" />
      <Line x1={SW * 0.33} y1={48} x2={SW * 0.33} y2={24} stroke="white" strokeWidth="1.5" opacity="0.5" />
      {/* windows */}
      <Rect x={SW * 0.23} y={75} width={6} height={5} stroke="white" strokeWidth="1" fill="none" opacity="0.4" />
      <Rect x={SW * 0.31} y={75} width={6} height={5} stroke="white" strokeWidth="1" fill="none" opacity="0.4" />
      <Rect x={SW * 0.23} y={90} width={6} height={5} stroke="white" strokeWidth="1" fill="none" opacity="0.4" />
      <Rect x={SW * 0.31} y={90} width={6} height={5} stroke="white" strokeWidth="1" fill="none" opacity="0.4" />

      {/* Building left-far */}
      <Rect x={SW * 0.04} y={95} width={44} height={60} stroke="white" strokeWidth="1.5" fill="none" opacity="0.45" />
      <Rect x={SW * 0.06} y={108} width={8} height={8} stroke="white" strokeWidth="1" fill="none" opacity="0.3" />
      <Rect x={SW * 0.10} y={108} width={8} height={8} stroke="white" strokeWidth="1" fill="none" opacity="0.3" />
      <Rect x={SW * 0.06} y={124} width={8} height={8} stroke="white" strokeWidth="1" fill="none" opacity="0.3" />
      <Rect x={SW * 0.10} y={124} width={8} height={8} stroke="white" strokeWidth="1" fill="none" opacity="0.3" />

      {/* Building left-mid */}
      <Rect x={SW * 0.15} y={105} width={32} height={50} stroke="white" strokeWidth="1.5" fill="none" opacity="0.4" />

      {/* Building right-far */}
      <Rect x={SW * 0.78} y={95} width={44} height={60} stroke="white" strokeWidth="1.5" fill="none" opacity="0.45" />
      <Rect x={SW * 0.80} y={108} width={8} height={8} stroke="white" strokeWidth="1" fill="none" opacity="0.3" />
      <Rect x={SW * 0.85} y={108} width={8} height={8} stroke="white" strokeWidth="1" fill="none" opacity="0.3" />
      <Rect x={SW * 0.80} y={124} width={8} height={8} stroke="white" strokeWidth="1" fill="none" opacity="0.3" />
      <Rect x={SW * 0.85} y={124} width={8} height={8} stroke="white" strokeWidth="1" fill="none" opacity="0.3" />

      {/* Building right-mid */}
      <Rect x={SW * 0.63} y={108} width={32} height={47} stroke="white" strokeWidth="1.5" fill="none" opacity="0.4" />

      {/* Right tall building */}
      <Rect x={SW * 0.7} y={75} width={22} height={80} stroke="white" strokeWidth="1.5" fill="none" opacity="0.45" />

      {/* Tree (left) */}
      <Line x1={SW * 0.12} y1={155} x2={SW * 0.12} y2={132} stroke="white" strokeWidth="2" opacity="0.5" strokeLinecap="round" />
      <Circle cx={SW * 0.12} cy={124} r={12} stroke="white" strokeWidth="1.5" fill="none" opacity="0.5" />

      {/* Street lamp (right of car) */}
      <Line x1={SW * 0.72} y1={155} x2={SW * 0.72} y2={118} stroke="white" strokeWidth="2" opacity="0.5" strokeLinecap="round" />
      <Path d={`M${SW * 0.72} 118 Q${SW * 0.74} 110 ${SW * 0.78} 110`} stroke="white" strokeWidth="2" fill="none" opacity="0.5" strokeLinecap="round" />
      <Circle cx={SW * 0.78} cy={110} r={3} stroke="white" strokeWidth="1.5" fill="none" opacity="0.5" />

      {/* Location pin */}
      <Path
        d={`M${SW * 0.49} 115 Q${SW * 0.49} 102 ${SW * 0.5} 100 Q${SW * 0.51} 102 ${SW * 0.51} 115 Z`}
        stroke="white"
        strokeWidth="1.5"
        fill="none"
        opacity="0.6"
      />
      <Circle cx={SW * 0.5} cy={100} r={7} fill="#4ADE80" opacity="0.9" />
      <Circle cx={SW * 0.5} cy={100} r={3} fill="white" opacity="0.9" />
    </Svg>
  );
}

// ─────────────────────────────────────────────
//  CAR  (drawn inline in JSX below - drives in)
// ─────────────────────────────────────────────
function Car() {
  return (
    <Svg width={110} height={50} viewBox="0 0 110 50">
      {/* body */}
      <Path
        d="M8 32 L14 18 Q18 10 28 10 L78 10 Q90 10 94 18 L102 32 L102 42 Q102 48 96 48 L14 48 Q8 48 8 42 Z"
        stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"
      />
      {/* roof */}
      <Path d="M28 18 Q32 8 44 8 L64 8 Q76 8 80 18" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* windows */}
      <Path d="M32 18 Q34 10 42 10 L52 10 L52 18 Z" stroke="white" strokeWidth="1.5" fill="none" opacity="0.7" />
      <Path d="M54 18 L54 10 L66 10 Q74 10 76 18 Z" stroke="white" strokeWidth="1.5" fill="none" opacity="0.7" />
      {/* wheels */}
      <Circle cx={30} cy={44} r={10} stroke="white" strokeWidth="2" fill="none" />
      <Circle cx={30} cy={44} r={4} stroke="white" strokeWidth="1.5" fill="none" opacity="0.5" />
      <Circle cx={80} cy={44} r={10} stroke="white" strokeWidth="2" fill="none" />
      <Circle cx={80} cy={44} r={4} stroke="white" strokeWidth="1.5" fill="none" opacity="0.5" />
      {/* headlight */}
      <Rect x={94} y={28} width={8} height={6} rx={2} stroke="white" strokeWidth="1.5" fill="none" opacity="0.8" />
    </Svg>
  );
}

// ─────────────────────────────────────────────
//  SPARKLE
// ─────────────────────────────────────────────
function Sparkle({ x, y, size = 10 }: { x: number; y: number; size?: number }) {
  return (
    <Svg width={size * 2} height={size * 2} viewBox={`0 0 20 20`} style={{ position: 'absolute', left: x, top: y }}>
      <Path d="M10 2 L11.5 8.5 L18 10 L11.5 11.5 L10 18 L8.5 11.5 L2 10 L8.5 8.5 Z" fill="white" opacity="0.5" />
    </Svg>
  );
}

// ─────────────────────────────────────────────
//  DASHED ORBIT ARC  connecting icons
// ─────────────────────────────────────────────
function OrbitArcs() {
  return (
    <Svg width={SW} height={SH * 0.55} viewBox={`0 0 ${SW} ${SH * 0.55}`} style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {/* Arcs from logo center to icons */}
      <Path
        d={`M${CX} ${SH * 0.18} Q${CX - 80} ${SH * 0.12} ${CX - 130} ${SH * 0.05}`}
        stroke="white" strokeWidth="1.5" fill="none" strokeDasharray="6,6" opacity="0.35"
      />
      <Path
        d={`M${CX} ${SH * 0.18} Q${CX - 100} ${SH * 0.22} ${CX - 140} ${SH * 0.28}`}
        stroke="white" strokeWidth="1.5" fill="none" strokeDasharray="6,6" opacity="0.35"
      />
      <Path
        d={`M${CX} ${SH * 0.22} Q${CX - 90} ${SH * 0.33} ${CX - 130} ${SH * 0.38}`}
        stroke="white" strokeWidth="1.5" fill="none" strokeDasharray="6,6" opacity="0.35"
      />
      <Path
        d={`M${CX} ${SH * 0.18} Q${CX + 80} ${SH * 0.12} ${CX + 110} ${SH * 0.08}`}
        stroke="white" strokeWidth="1.5" fill="none" strokeDasharray="6,6" opacity="0.35"
      />
      <Path
        d={`M${CX} ${SH * 0.22} Q${CX + 90} ${SH * 0.33} ${CX + 110} ${SH * 0.38}`}
        stroke="white" strokeWidth="1.5" fill="none" strokeDasharray="6,6" opacity="0.35"
      />
      {/* Connector dots */}
      <Circle cx={CX - 130} cy={SH * 0.05} r={5} fill="none" stroke="white" strokeWidth="1.5" opacity="0.4" />
      <Circle cx={CX - 140} cy={SH * 0.28} r={5} fill="none" stroke="white" strokeWidth="1.5" opacity="0.4" />
      <Circle cx={CX - 130} cy={SH * 0.38} r={5} fill="none" stroke="white" strokeWidth="1.5" opacity="0.4" />
      <Circle cx={CX + 110} cy={SH * 0.08} r={5} fill="none" stroke="white" strokeWidth="1.5" opacity="0.4" />
      <Circle cx={CX + 110} cy={SH * 0.38} r={5} fill="none" stroke="white" strokeWidth="1.5" opacity="0.4" />
    </Svg>
  );
}

// ═════════════════════════════════════════════
//  MAIN SPLASH COMPONENT
// ═════════════════════════════════════════════
export default function AnimatedSplashScreen({ onComplete }: { onComplete: () => void }) {

  // ── Gemini badge ──────────────────────────
  const geminiBadgeOpacity = useRef(new Animated.Value(0)).current;
  const geminiBadgeY = useRef(new Animated.Value(-30)).current;
  const geminiRotate = useRef(new Animated.Value(0)).current;

  // ── Food icons ────────────────────────────
  const bowlOpacity = useRef(new Animated.Value(0)).current;
  const bowlY = useRef(new Animated.Value(-60)).current;
  const bowlScale = useRef(new Animated.Value(0.4)).current;

  const coffeeOpacity = useRef(new Animated.Value(0)).current;
  const coffeeX = useRef(new Animated.Value(-80)).current;
  const coffeeScale = useRef(new Animated.Value(0.4)).current;

  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardX = useRef(new Animated.Value(-80)).current;
  const cardScale = useRef(new Animated.Value(0.4)).current;

  const bagOpacity = useRef(new Animated.Value(0)).current;
  const bagY = useRef(new Animated.Value(-60)).current;
  const bagScale = useRef(new Animated.Value(0.4)).current;

  const walletOpacity = useRef(new Animated.Value(0)).current;
  const walletX = useRef(new Animated.Value(80)).current;
  const walletScale = useRef(new Animated.Value(0.4)).current;

  // ── Orbit arcs ────────────────────────────
  const arcsOpacity = useRef(new Animated.Value(0)).current;

  // ── Sparkles ──────────────────────────────
  const sparkleOpacity = useRef(new Animated.Value(0)).current;

  // ── Logo & tagline ────────────────────────
  const logoScale = useRef(new Animated.Value(0.85)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;

  // ── Skyline ───────────────────────────────
  const skylineOpacity = useRef(new Animated.Value(0)).current;
  const skylineY = useRef(new Animated.Value(60)).current;

  // ── Car ───────────────────────────────────
  const carX = useRef(new Animated.Value(-150)).current;
  const carOpacity = useRef(new Animated.Value(0)).current;

  // ── EXIT: icons fly out ───────────────────
  const iconsExitOpacity = useRef(new Animated.Value(1)).current;
  const iconsExitScale = useRef(new Animated.Value(1)).current;
  const arcsExitOpacity = useRef(new Animated.Value(1)).current;
  const geminiExitOpacity = useRef(new Animated.Value(1)).current;
  const sparkleExitOpacity = useRef(new Animated.Value(1)).current;

  // ── Logo reposition (moves up slightly for clean splash) ──
  const logoContainerY = useRef(new Animated.Value(0)).current;
  const logoScaleFinal = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    async function boot() {
      try {
        await new Promise(r => setTimeout(r, 400));
      } finally {
        await SplashScreen.hideAsync();
        runEntryAnimations();
      }
    }
    boot();
  }, []);

  function runEntryAnimations() {
    const ease = Easing.out(Easing.cubic);
    const spring = Easing.out(Easing.back(1.4));

    // ── 1. LOGO fades in first (t=0)
    Animated.parallel([
      Animated.timing(logoOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(logoScale, { toValue: 1, duration: 600, easing: spring, useNativeDriver: true }),
    ]).start();

    // ── 2. Tagline (t=400)
    Animated.sequence([
      Animated.delay(400),
      Animated.timing(taglineOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();

    // ── 3. BOWL drops from top (t=300)
    Animated.sequence([
      Animated.delay(300),
      Animated.parallel([
        Animated.timing(bowlOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(bowlY, { toValue: 0, duration: 500, easing: spring, useNativeDriver: true }),
        Animated.timing(bowlScale, { toValue: 1, duration: 500, easing: spring, useNativeDriver: true }),
      ]),
    ]).start();

    // ── 4. BAG drops from top-right (t=450)
    Animated.sequence([
      Animated.delay(450),
      Animated.parallel([
        Animated.timing(bagOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(bagY, { toValue: 0, duration: 500, easing: spring, useNativeDriver: true }),
        Animated.timing(bagScale, { toValue: 1, duration: 500, easing: spring, useNativeDriver: true }),
      ]),
    ]).start();

    // ── 5. COFFEE slides in from left (t=600)
    Animated.sequence([
      Animated.delay(600),
      Animated.parallel([
        Animated.timing(coffeeOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(coffeeX, { toValue: 0, duration: 500, easing: spring, useNativeDriver: true }),
        Animated.timing(coffeeScale, { toValue: 1, duration: 500, easing: spring, useNativeDriver: true }),
      ]),
    ]).start();

    // ── 6. WALLET slides in from right (t=700)
    Animated.sequence([
      Animated.delay(700),
      Animated.parallel([
        Animated.timing(walletOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(walletX, { toValue: 0, duration: 500, easing: spring, useNativeDriver: true }),
        Animated.timing(walletScale, { toValue: 1, duration: 500, easing: spring, useNativeDriver: true }),
      ]),
    ]).start();

    // ── 7. CARD slides in from left-bottom (t=800)
    Animated.sequence([
      Animated.delay(800),
      Animated.parallel([
        Animated.timing(cardOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(cardX, { toValue: 0, duration: 500, easing: spring, useNativeDriver: true }),
        Animated.timing(cardScale, { toValue: 1, duration: 500, easing: spring, useNativeDriver: true }),
      ]),
    ]).start();

    // ── 8. ARCS appear (t=900)
    Animated.sequence([
      Animated.delay(900),
      Animated.timing(arcsOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();

    // ── 9. SPARKLES pulse in (t=1000)
    Animated.sequence([
      Animated.delay(1000),
      Animated.timing(sparkleOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();

    // ── 10. GEMINI badge spins & zooms in (t=200)
    Animated.sequence([
      Animated.delay(200),
      Animated.parallel([
        Animated.timing(geminiBadgeOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(geminiBadgeY, { toValue: 0, duration: 600, easing: spring, useNativeDriver: true }),
        Animated.timing(geminiRotate, { toValue: 1, duration: 700, easing: ease, useNativeDriver: true }),
      ]),
    ]).start();

    // ── 11. SKYLINE rises up (t=600)
    Animated.sequence([
      Animated.delay(600),
      Animated.parallel([
        Animated.timing(skylineOpacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(skylineY, { toValue: 0, duration: 800, easing: ease, useNativeDriver: true }),
      ]),
    ]).start();

    // ── 12. CAR drives in from left (t=1200)
    Animated.sequence([
      Animated.delay(1200),
      Animated.parallel([
        Animated.timing(carOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(carX, { toValue: 0, duration: 1200, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]),
    ]).start();

    // ── EXIT PHASE after 5.5 s total ─────────────────────────────
    setTimeout(() => {
      runExitAnimations();
    }, 5500);
  }

  function runExitAnimations() {
    const ease = Easing.in(Easing.cubic);

    // Icons EXPLODE outward and fade
    Animated.parallel([
      Animated.timing(iconsExitOpacity, { toValue: 0, duration: 500, useNativeDriver: true }),
      Animated.timing(iconsExitScale, { toValue: 1.6, duration: 500, easing: ease, useNativeDriver: true }),
      Animated.timing(arcsExitOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
      Animated.timing(geminiExitOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
      Animated.timing(sparkleExitOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),

      // Logo repositions to center (already centered, just scale tweak)
      Animated.timing(logoScaleFinal, { toValue: 0.88, duration: 600, useNativeDriver: true }),
      Animated.timing(logoContainerY, { toValue: -20, duration: 600, useNativeDriver: true }),
    ]).start(() => {
      // Car drives OUT to the right
      Animated.timing(carX, { toValue: SW + 200, duration: 1000, easing: Easing.in(Easing.quad), useNativeDriver: true }).start(() => {
        // Car drives back in from left to final position
        carX.setValue(-150);
        Animated.timing(carX, { toValue: 0, duration: 900, easing: Easing.out(Easing.quad), useNativeDriver: true }).start(() => {
          // Hold clean splash for 1s then exit
          setTimeout(() => onComplete(), 1000);
        });
      });
    });
  }

  const geminiSpin = geminiRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['360deg', '0deg'],
  });

  return (
    <View style={styles.container}>
      {/* ── BACKGROUND ─────────────────────── */}

      {/* ── SPARKLES (scattered) ─────────────*/}
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          { opacity: Animated.multiply(sparkleOpacity, sparkleExitOpacity) },
        ]}
        pointerEvents="none"
      >
        <Sparkle x={SW * 0.05} y={SH * 0.12} size={8} />
        <Sparkle x={SW * 0.88} y={SH * 0.09} size={6} />
        <Sparkle x={SW * 0.78} y={SH * 0.22} size={7} />
        <Sparkle x={SW * 0.12} y={SH * 0.32} size={6} />
        <Sparkle x={SW * 0.90} y={SH * 0.44} size={8} />
        <Sparkle x={SW * 0.05} y={SH * 0.55} size={7} />
        <Sparkle x={SW * 0.82} y={SH * 0.60} size={6} />
        <Sparkle x={SW * 0.45} y={SH * 0.08} size={6} />
        <Sparkle x={SW * 0.60} y={SH * 0.65} size={7} />
        <Sparkle x={SW * 0.25} y={SH * 0.68} size={5} />
      </Animated.View>

      {/* ── GEMINI BADGE ──────────────────── */}
      <Animated.View
        style={[
          styles.geminiBadge,
          {
            opacity: Animated.multiply(geminiBadgeOpacity, geminiExitOpacity),
            transform: [
              { translateY: geminiBadgeY },
              { rotate: geminiSpin },
            ],
          },
        ]}
      >
        <View style={styles.geminiRow}>
          {/* Star icon drawn in SVG */}
          <Svg width={20} height={20} viewBox="0 0 20 20">
            <Path
              d="M10 1 Q11.8 6 16 7 Q19 8 18 10 Q19 12 16 13 Q11.8 14 10 19 Q8.2 14 4 13 Q1 12 2 10 Q1 8 4 7 Q8.2 6 10 1 Z"
              fill="none"
              stroke="white"
              strokeWidth="1.4"
            />
            {/* Color facets */}
            <Path d="M10 1 Q11.8 6 16 7 Q13 6 10 1 Z" fill="#4285F4" opacity="0.8" />
            <Path d="M16 7 Q19 8 18 10 Q16 8 16 7 Z" fill="#EA4335" opacity="0.8" />
            <Path d="M10 19 Q8.2 14 4 13 Q7 14 10 19 Z" fill="#34A853" opacity="0.8" />
            <Path d="M4 13 Q1 12 2 10 Q4 12 4 13 Z" fill="#FBBC05" opacity="0.8" />
          </Svg>
          <Text style={styles.geminiText}>Gemini</Text>
        </View>
        <Text style={styles.geminiWith}>with</Text>
      </Animated.View>

      {/* ── ORBIT ARCS ────────────────────── */}
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          { opacity: Animated.multiply(arcsOpacity, arcsExitOpacity) },
        ]}
        pointerEvents="none"
      >
        <OrbitArcs />
      </Animated.View>

      {/* ── ICON: BOWL (top-left) ─────────── */}
      <Animated.View
        style={[
          styles.iconBowl,
          {
            opacity: Animated.multiply(bowlOpacity, iconsExitOpacity),
            transform: [
              { translateY: bowlY },
              { scale: Animated.multiply(bowlScale, iconsExitScale) },
            ],
          },
        ]}
      >
        <IconBowl />
      </Animated.View>

      {/* ── ICON: COFFEE (mid-left) ───────── */}
      <Animated.View
        style={[
          styles.iconCoffee,
          {
            opacity: Animated.multiply(coffeeOpacity, iconsExitOpacity),
            transform: [
              { translateX: coffeeX },
              { scale: Animated.multiply(coffeeScale, iconsExitScale) },
            ],
          },
        ]}
      >
        <IconCoffee />
      </Animated.View>

      {/* ── ICON: CARD (bottom-left) ──────── */}
      <Animated.View
        style={[
          styles.iconCard,
          {
            opacity: Animated.multiply(cardOpacity, iconsExitOpacity),
            transform: [
              { translateX: cardX },
              { scale: Animated.multiply(cardScale, iconsExitScale) },
            ],
          },
        ]}
      >
        <IconCard />
      </Animated.View>

      {/* ── ICON: BAG (top-right) ─────────── */}
      <Animated.View
        style={[
          styles.iconBag,
          {
            opacity: Animated.multiply(bagOpacity, iconsExitOpacity),
            transform: [
              { translateY: bagY },
              { scale: Animated.multiply(bagScale, iconsExitScale) },
            ],
          },
        ]}
      >
        <IconBag />
      </Animated.View>

      {/* ── ICON: WALLET (bottom-right) ───── */}
      <Animated.View
        style={[
          styles.iconWallet,
          {
            opacity: Animated.multiply(walletOpacity, iconsExitOpacity),
            transform: [
              { translateX: walletX },
              { scale: Animated.multiply(walletScale, iconsExitScale) },
            ],
          },
        ]}
      >
        <IconWallet />
      </Animated.View>

      {/* ── LOGO + TAGLINE (center) ───────── */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: logoOpacity,
            transform: [
              { scale: Animated.multiply(logoScale, logoScaleFinal) },
              { translateY: logoContainerY },
            ],
          },
        ]}
      >
        {/* Speed lines + V mark */}
        <View style={styles.logoMark}>
          <Svg width={120} height={80} viewBox="0 0 160 90">
            {/* Speed lines */}
            <Rect x="0" y="26" width="28" height="7" rx="3.5" fill="white" opacity="0.9" />
            <Rect x="0" y="39" width="22" height="7" rx="3.5" fill="white" opacity="0.75" />
            <Rect x="0" y="52" width="16" height="7" rx="3.5" fill="white" opacity="0.55" />
            {/* Bold V shape */}
            <Path
              d="M40 16 L72 74 L84 50 L96 74 L128 16 L112 16 L84 66 L56 16 Z"
              fill="white"
            />
          </Svg>
        </View>

        {/* "Veyo" wordmark */}
        <Text style={styles.logoText}>Veyo</Text>

        {/* Tagline */}
        <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
          Your ride, on your time.
        </Animated.Text>
      </Animated.View>

      {/* ── CITY SKYLINE ──────────────────── */}
      <Animated.View
        style={[
          styles.skylineContainer,
          {
            opacity: skylineOpacity,
            transform: [{ translateY: skylineY }],
          },
        ]}
      >
        <CitySkyline />

        {/* CAR on the ground */}
        <Animated.View
          style={[
            styles.car,
            {
              opacity: carOpacity,
              transform: [{ translateX: carX }],
            },
          ]}
        >
          <Car />
        </Animated.View>
      </Animated.View>
    </View>
  );
}

// ─────────────────────────────────────────────
//  STYLES
// ─────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C75FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Gemini badge - top-right
  geminiBadge: {
    position: 'absolute',
    top: 54,
    right: 24,
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  geminiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  geminiText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  geminiWith: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    marginRight: 6,
  },

  // Logo
  logoContainer: {
    alignItems: 'center',
    position: 'absolute',
    top: SH * 0.28,
  },
  logoMark: {
    marginBottom: -8,
  },
  logoText: {
    color: 'white',
    fontSize: 64,
    fontWeight: '800',
    letterSpacing: -1,
    lineHeight: 72,
  },
  tagline: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: 0.2,
    marginTop: 8,
  },

  // Floating icons
  iconBowl: {
    position: 'absolute',
    top: SH * 0.14,
    left: SW * 0.06,
  },
  iconCoffee: {
    position: 'absolute',
    top: SH * 0.26,
    left: SW * 0.04,
  },
  iconCard: {
    position: 'absolute',
    top: SH * 0.39,
    left: SW * 0.03,
  },
  iconBag: {
    position: 'absolute',
    top: SH * 0.13,
    right: SW * 0.06,
  },
  iconWallet: {
    position: 'absolute',
    top: SH * 0.38,
    right: SW * 0.03,
  },

  // Skyline
  skylineContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
  },

  // Car
  car: {
    position: 'absolute',
    bottom: 24,
    left: SW * 0.28,
  },
});