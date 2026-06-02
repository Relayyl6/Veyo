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
  G,
  Text as SvgText,
} from 'react-native-svg';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

const { width: SW, height: SH } = Dimensions.get('window');
const CX = SW / 2;

// ─────────────────────────────────────────────
//  VEYO LOGO MARK
// ─────────────────────────────────────────────
function VeyoLogoMark() {
  return (
    <Svg width={90} height={70} viewBox="0 0 100 80">
      <Rect x="0" y="24" width="35" height="11" rx="5.5" fill="white" />
      <Rect x="8" y="42" width="27" height="11" rx="5.5" fill="white" />
      <Rect x="16" y="60" width="19" height="11" rx="5.5" fill="white" />
      <Path d="M 40 24 L 66 80 L 85 24 L 68 24 L 59 55 L 53 24 Z" fill="white" />
    </Svg>
  );
}

// ─────────────────────────────────────────────
//  ICONS
// ─────────────────────────────────────────────
function IconBowl() {
  return (
    <Svg width={45} height={45} viewBox="0 0 40 40">
      <Path d="M 5 22 C 5 34, 35 34, 35 22 Z" stroke="white" strokeWidth="1.2" fill="none" />
      <Line x1="4" y1="22" x2="36" y2="22" stroke="white" strokeWidth="1.2" />
      <Path d="M 8 22 C 10 16, 14 16, 16 22 M 14 22 C 16 14, 22 14, 24 22 M 22 22 C 24 16, 30 16, 32 22" stroke="white" strokeWidth="1.2" fill="none" />
      <Line x1="24" y1="20" x2="34" y2="2" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <Line x1="28" y1="21" x2="38" y2="5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M 0 12 L 2 14 L 0 16 L -2 14 Z" fill="white" opacity="0.6" />
      <Path d="M 38 30 L 40 32 L 38 34 L 36 32 Z" fill="white" opacity="0.6" />
    </Svg>
  );
}

function IconCoffee() {
  return (
    <Svg width={45} height={50} viewBox="0 0 40 50">
      <Path d="M 10 15 L 14 42 C 14 45, 26 45, 26 42 L 30 15 Z" stroke="white" strokeWidth="1.2" fill="none" />
      <Rect x="8" y="10" width="24" height="5" rx="2" stroke="white" strokeWidth="1.2" fill="none" />
      <Line x1="12" y1="15" x2="28" y2="15" stroke="white" strokeWidth="1.2" />
      <Path d="M 16 7 Q 14 3 18 0 M 24 7 Q 22 3 26 0" stroke="white" strokeWidth="1.2" fill="none" opacity="0.7" strokeLinecap="round" />
    </Svg>
  );
}

function IconCard() {
  return (
    <Svg width={60} height={60} viewBox="0 0 50 50">
      <Rect x="5" y="10" width="40" height="25" rx="3" stroke="white" strokeWidth="1.2" fill="none" />
      <Line x1="5" y1="16" x2="45" y2="16" stroke="white" strokeWidth="1.2" />
      <Rect x="10" y="21" width="8" height="5" rx="1" stroke="white" strokeWidth="1.2" fill="none" />
      <Line x1="22" y1="23" x2="32" y2="23" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
      <Line x1="22" y1="27" x2="28" y2="27" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
      <G opacity="0.8">
        <Circle cx="25" cy="45" r="12" stroke="white" strokeWidth="1" fill="none" />
        <Path d="M 20 45 A 5 5 0 0 1 23 41" stroke="white" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        <Path d="M 18 48 A 8 8 0 0 1 26 39" stroke="white" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        <Path d="M 16 51 A 11 11 0 0 1 29 37" stroke="white" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      </G>
    </Svg>
  );
}

function IconBag() {
  return (
    <Svg width={45} height={45} viewBox="0 0 40 40">
      <Path d="M 6 36 L 10 10 L 32 18 L 28 38 Z" stroke="white" strokeWidth="1.2" fill="none" strokeLinejoin="round" />
      <Path d="M 10 10 L 14 4 L 35 12 L 32 18" stroke="white" strokeWidth="1.2" fill="none" strokeLinejoin="round" />
      <Path d="M 14 4 L 8 4" stroke="white" strokeWidth="1.2" fill="none" opacity="0.5" />
      <G transform="rotate(18, 18, 25)">
        <Path d="M 12 28 C 12 20, 26 20, 26 28 Z" stroke="white" strokeWidth="1" fill="none" />
        <Line x1="10" y1="28" x2="28" y2="28" stroke="white" strokeWidth="1" />
        <Circle cx="19" cy="19" r="1.5" stroke="white" strokeWidth="1" fill="none" />
      </G>
    </Svg>
  );
}

function IconWallet() {
  return (
    <Svg width={55} height={55} viewBox="0 0 50 50">
      <Rect x="5" y="15" width="30" height="20" rx="2" stroke="white" strokeWidth="1.2" fill="none" />
      <Path d="M 5 20 C 15 20, 25 15, 35 20" stroke="white" strokeWidth="1" fill="none" opacity="0.6" />
      <Path d="M 28 15 L 28 8 C 28 6, 12 6, 12 8 L 12 15" stroke="white" strokeWidth="1.2" fill="none" />
      <G transform="translate(30, 28)">
        <Circle cx="10" cy="10" r="10" stroke="white" strokeWidth="1.2" fill="none" />
        <Circle cx="10" cy="10" r="14" stroke="white" strokeWidth="0.5" fill="none" opacity="0.4" />
        <SvgText x="10" y="15" fontSize="14" fill="white" fontWeight="bold" textAnchor="middle">₦</SvgText>
      </G>
    </Svg>
  );
}

// ─────────────────────────────────────────────
//  BACKGROUND & SKYLINE
// ─────────────────────────────────────────────
function BackgroundElements() {
  return (
    <Svg width={SW} height={SH} viewBox={`0 0 ${SW} ${SH}`} style={StyleSheet.absoluteFillObject} pointerEvents="none">
      <G stroke="white" strokeWidth="0.8" fill="none" strokeDasharray="4,6" opacity="0.4">
        <Path d={`M${CX - 20} ${SH * 0.3} Q${CX - 80} ${SH * 0.25} ${CX - 120} ${SH * 0.15}`} />
        <Path d={`M${CX - 30} ${SH * 0.35} Q${CX - 120} ${SH * 0.38} ${CX - 140} ${SH * 0.45}`} />
        <Path d={`M${CX + 20} ${SH * 0.3} Q${CX + 80} ${SH * 0.22} ${CX + 120} ${SH * 0.18}`} />
        <Path d={`M${CX + 30} ${SH * 0.35} Q${CX + 100} ${SH * 0.4} ${CX + 120} ${SH * 0.48}`} />
      </G>
      <G fill="white" opacity="0.6">
        <Path d="M 60 120 L 62 125 L 67 127 L 62 129 L 60 134 L 58 129 L 53 127 L 58 125 Z" />
        <Path d="M 330 160 L 331 163 L 334 164 L 331 165 L 330 168 L 329 165 L 326 164 L 329 163 Z" />
        <Path d="M 350 350 L 352 355 L 357 357 L 352 359 L 350 364 L 348 359 L 343 357 L 348 355 Z" />
        <Path d="M 50 450 L 51 454 L 55 455 L 51 456 L 50 460 L 49 456 L 45 455 L 49 454 Z" />
        <Path d="M 320 500 L 321 503 L 324 504 L 321 505 L 320 508 L 319 505 L 316 504 L 319 503 Z" />
      </G>
    </Svg>
  );
}

function CitySkyline() {
  return (
    <Svg width={SW} height={180} viewBox={`0 0 ${SW} 180`}>
      <Line x1={0} y1={150} x2={SW} y2={150} stroke="white" strokeWidth="1" opacity="0.4" />
      <Line x1={SW * 0.3} y1={158} x2={SW * 0.7} y2={158} stroke="white" strokeWidth="0.8" opacity="0.3" />
      
      <G stroke="white" strokeWidth="0.8" fill="none" opacity="0.2">
        <Rect x={SW * 0.1} y={100} width={40} height={50} />
        <Rect x={SW * 0.3} y={115} width={30} height={35} />
        <Rect x={SW * 0.75} y={90} width={40} height={60} />
      </G>
      <G stroke="white" strokeWidth="1" fill="none" opacity="0.4">
        <Rect x={SW * 0.25} y={40} width={30} height={110} />
        <Rect x={SW * 0.28} y={50} width={24} height={12} rx="2" />
        <Line x1={SW * 0.25} y1={70} x2={SW * 0.34} y2={70} />
        <Line x1={SW * 0.25} y1={100} x2={SW * 0.34} y2={100} />
        
        <Line x1={SW * 0.3} y1={40} x2={SW * 0.3} y2={25} />
        <Rect x={SW * 0.65} y={60} width={25} height={90} />
      </G>
      
      <Line x1={SW * 0.15} y1={150} x2={SW * 0.15} y2={130} stroke="white" strokeWidth="1.5" opacity="0.5" />
      <Circle cx={SW * 0.15} cy={120} r={12} stroke="white" strokeWidth="1" fill="none" opacity="0.5" />
      
      <Line x1={SW * 0.85} y1={150} x2={SW * 0.85} y2={100} stroke="white" strokeWidth="1.5" opacity="0.5" />
      <Path d={`M${SW * 0.85} 100 Q${SW * 0.85} 90 ${SW * 0.9} 90`} stroke="white" strokeWidth="1" fill="none" opacity="0.5" />
      <Circle cx={SW * 0.9} cy={90} r={2} fill="white" opacity="0.5" />

      <Path d={`M${SW * 0.55} 125 C${SW * 0.55} 110, ${SW * 0.51} 105, ${SW * 0.51} 105 C${SW * 0.51} 105, ${SW * 0.47} 110, ${SW * 0.47} 125 Z`} stroke="#4ADE80" strokeWidth="1.5" fill="none" />
      <Circle cx={SW * 0.51} cy={105} r={8} fill="#4ADE80" />
      <Circle cx={SW * 0.51} cy={105} r={3} fill="white" />
    </Svg>
  );
}

function Car() {
  return (
    <Svg width={110} height={40} viewBox="0 0 110 40">
      <Path d="M 12 30 L 16 18 Q 22 10 35 10 L 65 10 Q 75 10 82 18 L 92 30 L 92 36 Q 92 38 88 38 L 12 38 Z" stroke="white" strokeWidth="1" fill="none" strokeLinejoin="round" />
      <Path d="M 35 10 L 25 18 L 48 18 L 48 10 Z" stroke="white" strokeWidth="0.8" fill="none" opacity="0.6" />
      <Path d="M 50 10 L 50 18 L 78 18 L 65 10 Z" stroke="white" strokeWidth="0.8" fill="none" opacity="0.6" />
      <Line x1="12" y1="30" x2="92" y2="30" stroke="white" strokeWidth="0.5" opacity="0.4" />
      <Circle cx="30" cy="38" r="7" stroke="white" strokeWidth="1" fill="#1C75FF" />
      <Circle cx="30" cy="38" r="2" fill="white" opacity="0.8" />
      <Circle cx="75" cy="38" r="7" stroke="white" strokeWidth="1" fill="#1C75FF" />
      <Circle cx="75" cy="38" r="2" fill="white" opacity="0.8" />
    </Svg>
  );
}

// ═════════════════════════════════════════════
//  MAIN SPLASH COMPONENT
// ═════════════════════════════════════════════
export default function AnimatedSplashScreen({ onComplete }: { onComplete: () => void }) {
  const baseOpacity = useRef(new Animated.Value(0)).current;
  const detailOpacity = useRef(new Animated.Value(0)).current;
  
  // Icon Floats
  const bowlY = useRef(new Animated.Value(-20)).current;
  const bagY = useRef(new Animated.Value(-20)).current;
  const coffeeX = useRef(new Animated.Value(-20)).current;
  const walletX = useRef(new Animated.Value(20)).current;
  const cardX = useRef(new Animated.Value(-20)).current;
  
  // Car Animation (Starts offscreen left)
  const carTranslateX = useRef(new Animated.Value(-SW)).current;

  // Exit Animation
  const globalScale = useRef(new Animated.Value(1)).current;
  const globalOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    async function boot() {
      await SplashScreen.hideAsync();
      runSequence();
    }
    boot();
  }, []);

  function runSequence() {
    const spring = Easing.out(Easing.back(1.2));

    // 1. Fade in the Base
    Animated.timing(baseOpacity, { 
      toValue: 1, 
      duration: 600, 
      useNativeDriver: true 
    }).start(() => {
      
      // 2. Animate details, icons, and car driving in
      Animated.parallel([
        Animated.timing(detailOpacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(bowlY, { toValue: 0, duration: 800, easing: spring, useNativeDriver: true }),
        Animated.timing(bagY, { toValue: 0, duration: 800, easing: spring, useNativeDriver: true }),
        Animated.timing(coffeeX, { toValue: 0, duration: 800, easing: spring, useNativeDriver: true }),
        Animated.timing(walletX, { toValue: 0, duration: 800, easing: spring, useNativeDriver: true }),
        Animated.timing(cardX, { toValue: 0, duration: 800, easing: spring, useNativeDriver: true }),
        
        // Car drives in to center position (0 relative to wrapper)
        Animated.timing(carTranslateX, { toValue: 0, duration: 1200, easing: Easing.out(Easing.cubic), useNativeDriver: true })
      ]).start(() => {
        
        // 3. Hold, then exit
        setTimeout(() => {
          Animated.parallel([
            // Car drives off right
            Animated.timing(carTranslateX, { toValue: SW, duration: 900, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
            
            // Screen zooms and fades
            Animated.timing(globalOpacity, { toValue: 0, duration: 500, delay: 300, useNativeDriver: true }),
            Animated.timing(globalScale, { toValue: 1.15, duration: 600, delay: 200, easing: Easing.in(Easing.cubic), useNativeDriver: true })
          ]).start(() => {
            onComplete();
          });
        }, 2000);
        
      });
    });
  }

  return (
    <Animated.View style={[styles.container, { opacity: globalOpacity, transform: [{ scale: globalScale }] }]}>
      
      <Animated.View style={[StyleSheet.absoluteFillObject, { opacity: detailOpacity }]} pointerEvents="none">
        <BackgroundElements />
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFillObject, { opacity: detailOpacity }]} pointerEvents="none">
        <Animated.View style={[styles.iconFloat, { top: SH * 0.15, left: SW * 0.1, transform: [{ translateY: bowlY }] }]}>
          <IconBowl />
        </Animated.View>
        <Animated.View style={[styles.iconFloat, { top: SH * 0.35, left: SW * 0.1, transform: [{ translateX: coffeeX }] }]}>
          <IconCoffee />
        </Animated.View>
        <Animated.View style={[styles.iconFloat, { top: SH * 0.55, left: SW * 0.05, transform: [{ translateX: cardX }] }]}>
          <IconCard />
        </Animated.View>
        <Animated.View style={[styles.iconFloat, { top: SH * 0.18, right: SW * 0.08, transform: [{ translateY: bagY }] }]}>
          <IconBag />
        </Animated.View>
        <Animated.View style={[styles.iconFloat, { top: SH * 0.52, right: SW * 0.08, transform: [{ translateX: walletX }] }]}>
          <IconWallet />
        </Animated.View>
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFillObject, { opacity: baseOpacity }]}>
        <View style={styles.logoContainer}>
          <VeyoLogoMark />
          <Text style={styles.logoText}>Veyo</Text>
          <Text style={styles.tagline}>Your ride, on your time.</Text>
        </View>

        <View style={styles.skylineContainer}>
          <CitySkyline />
          <Animated.View style={[styles.carWrapper, { transform: [{ translateX: carTranslateX }] }]}>
            <Car />
          </Animated.View>
        </View>
      </Animated.View>

      <Animated.View style={[styles.geminiBadge, { opacity: detailOpacity }]}>
        <Text style={styles.geminiWith}>with</Text>
        <Svg width={20} height={20} viewBox="0 0 20 20" style={{ marginHorizontal: 5 }}>
          <Path d="M10 1 Q11.8 6 16 7 Q19 8 18 10 Q19 12 16 13 Q11.8 14 10 19 Q8.2 14 4 13 Q1 12 2 10 Q1 8 4 7 Q8.2 6 10 1 Z" fill="none" stroke="white" strokeWidth="0.8" />
          <Path d="M10 1 Q11.8 6 16 7 Q13 6 10 1 Z" fill="#4285F4" />
          <Path d="M16 7 Q19 8 18 10 Q16 8 16 7 Z" fill="#EA4335" />
          <Path d="M10 19 Q8.2 14 4 13 Q7 14 10 19 Z" fill="#34A853" />
          <Path d="M4 13 Q1 12 2 10 Q4 12 4 13 Z" fill="#FBBC05" />
        </Svg>
        <Text style={styles.geminiText}>Gemini</Text>
      </Animated.View>

    </Animated.View>
  );
}

// ─────────────────────────────────────────────
//  STYLES
// ─────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C75FF',
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
  },
  logoText: {
    color: 'white',
    fontSize: 60,
    fontWeight: '900',
    fontStyle: 'italic',
    letterSpacing: -1.5,
    marginTop: -5,
  },
  tagline: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 16,
    marginTop: 8,
    letterSpacing: 0.2,
  },
  skylineContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 180,
  },
  carWrapper: {
    position: 'absolute',
    bottom: 25,
    left: '32%', 
  },
  iconFloat: {
    position: 'absolute',
  },
  geminiBadge: {
    position: 'absolute',
    top: 60,
    right: 25,
    flexDirection: 'row',
    alignItems: 'center',
  },
  geminiText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  geminiWith: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
  },
});