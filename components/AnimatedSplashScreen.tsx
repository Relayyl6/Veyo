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
} from 'react-native-svg';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

const { width: SW, height: SH } = Dimensions.get('window');
const CX = SW / 2;

// ─────────────────────────────────────────────
//  EXACT GEOMETRIC LOGO V-MARK
// ─────────────────────────────────────────────
function VeyoLogoMark() {
  return (
    <Svg width={96} height={70} viewBox="0 0 96 70" fill="none">
      {/* 3 Speed lines extending from the left */}
      <Path d="M12 4h26v10H12a5 5 0 010-10z" fill="white" />
      <Path d="M0 24h38v10H0a5 5 0 010-10z" fill="white" />
      <Path d="M12 44h26v10H12a5 5 0 010-10z" fill="white" />
      
      {/* Precision italicized V component intersecting lines */}
      <Path 
        d="M36 4h18.5l14 44.5L82.5 4H96L75.5 66H62L36 4z" 
        fill="white" 
        strokeLinejoin="miter"
      />
    </Svg>
  );
}

// ─────────────────────────────────────────────
//  VECTORS FOR FLOATING ICONS
// ─────────────────────────────────────────────
function IconBowl() {
  return (
    <Svg width={54} height={54} viewBox="0 0 54 54" fill="none">
      <Path d="M6 26c0 15 42 15 42 0H6z" stroke="white" strokeWidth="1.5" />
      <Line x1="4" y1="26" x2="50" y2="26" stroke="white" strokeWidth="1.5" />
      {/* Food contents representation */}
      <Path d="M12 26c2-6 8-8 12 0M22 26c3-9 11-9 14 0M32 26c2-6 6-6 8 0" stroke="white" strokeWidth="1.5" />
      {/* Chopsticks crossing out */}
      <Line x1="34" y1="22" x2="48" y2="2" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
      <Line x1="40" y1="24" x2="54" y2="4" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
    </Svg>
  );
}

function IconCoffee() {
  return (
    <Svg width={46} height={56} viewBox="0 0 46 56" fill="none">
      <Path d="M9 16l5 34c.5 3 24 3 24.5 0l5-34" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
      <Rect x="6" y="10" width="34" height="6" rx="2" stroke="white" strokeWidth="1.5" />
      {/* Vapors */}
      <Path d="M16 6q-3-5 1-6M23 6q-3-5 1-6M30 6q-3-5 1-6" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
    </Svg>
  );
}

function IconCardWithWaves() {
  return (
    <Svg width={90} height={60} viewBox="0 0 90 60" fill="none">
      {/* Credit Card bounding element */}
      <Rect x="2" y="2" width="62" height="42" rx="6" stroke="white" strokeWidth="1.8" />
      <Line x1="2" y1="12" x2="64" y2="12" stroke="white" strokeWidth="1.8" />
      <Rect x="8" y="22" width="12" height="8" rx="1.5" stroke="white" strokeWidth="1.2" />
      <Line x1="26" y1="24" x2="42" y2="24" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <Line x1="26" y1="30" x2="34" y2="30" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      
      {/* Contactless waves aligned perfectly to the right side */}
      <G transform="translate(68, 8)">
        <Path d="M2 6a12 12 0 010 16" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
        <Path d="M7 2a20 20 0 010 24" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
      </G>
    </Svg>
  );
}

function IconBagWithCloche() {
  return (
    <Svg width={64} height={64} viewBox="0 0 64 64" fill="none">
      {/* Paper Bag base layout structure */}
      <Path d="M10 52L15 16h34l5 36H10z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
      <Path d="M15 16l4-8h26l4 8" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
      {/* Handle Clip */}
      <Circle cx="32" cy="5" r="2.5" stroke="white" strokeWidth="1.5" />
      
      {/* Centered Food Cloche Symbol design element */}
      <G transform="translate(19, 24)">
        <Path d="M4 16c0-10 18-10 18 0H4z" stroke="white" strokeWidth="1.2" />
        <Line x1="2" y1="17.5" x2="24" y2="17.5" stroke="white" strokeWidth="1.5" />
        <Circle cx="13" cy="5.5" r="1.5" fill="white" />
      </G>
    </Svg>
  );
}

function IconWalletNaira() {
  return (
    <Svg width={74} height={64} viewBox="0 0 74 64" fill="none">
      {/* Base horizontal wallet container */}
      <Rect x="2" y="14" width="46" height="34" rx="6" stroke="white" strokeWidth="1.6" />
      <Path d="M34 14v10H14V14" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
      
      {/* Nested Naira Emblem construct right beside it */}
      <G transform="translate(44, 24)">
        <Circle cx="14" cy="14" r="13" stroke="white" strokeWidth="1.5" />
        {/* Crisp vector lines mapping Naira Sign */}
        <Path d="M9 20V8l10 12V8" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <Line x1="7" y1="12" x2="21" y2="12" stroke="white" strokeWidth="1.5" />
        <Line x1="7" y1="15.5" x2="21" y2="15.5" stroke="white" strokeWidth="1.5" />
      </G>
    </Svg>
  );
}

// ─────────────────────────────────────────────
//  COMPREHENSIVE MAIN COMPONENT
// ─────────────────────────────────────────────
export default function AnimatedSplashScreen({ onComplete }: { onComplete: () => void }) {
  const baseOpacity = useRef(new Animated.Value(0)).current;
  const detailOpacity = useRef(new Animated.Value(0)).current;
  
  // Positional animations matching layout floats
  const bowlY = useRef(new Animated.Value(-15)).current;
  const bagY = useRef(new Animated.Value(-15)).current;
  const coffeeX = useRef(new Animated.Value(-20)).current;
  const walletX = useRef(new Animated.Value(20)).current;
  const cardX = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    async function init() {
      await SplashScreen.hideAsync();
      
      // Sequence timing chains mapping natural UI entry speeds
      Animated.timing(baseOpacity, { toValue: 1, duration: 550, useNativeDriver: true }).start(() => {
        Animated.parallel([
          Animated.timing(detailOpacity, { toValue: 1, duration: 700, useNativeDriver: true }),
          Animated.spring(bowlY, { toValue: 0, tension: 40, friction: 5, useNativeDriver: true }),
          Animated.spring(bagY, { toValue: 0, tension: 40, friction: 5, useNativeDriver: true }),
          Animated.spring(coffeeX, { toValue: 0, tension: 35, friction: 6, useNativeDriver: true }),
          Animated.spring(walletX, { toValue: 0, tension: 35, friction: 6, useNativeDriver: true }),
          Animated.spring(cardX, { toValue: 0, tension: 35, friction: 6, useNativeDriver: true }),
        ]).start(() => {
          setTimeout(() => {
            onComplete();
          }, 2500);
        });
      });
    }
    init();
  }, []);

  return (
    <View style={styles.container}>
      {/* Background Micro Stars / Sparkles Layer */}
      <Animated.View style={[StyleSheet.absoluteFillObject, { opacity: detailOpacity }]} pointerEvents="none">
        <Svg width={SW} height={SH} style={StyleSheet.absoluteFillObject}>
          {/* Subtle connecting dotted orbits */}
          <Path d={`M ${SW * 0.25} ${SH * 0.32} Q ${SW * 0.15} ${SH * 0.4} ${SW * 0.22} ${SH * 0.52}`} stroke="rgba(255,255,255,0.25)" strokeDasharray="3 4" fill="none" />
          <Path d={`M ${SW * 0.72} ${SH * 0.4} Q ${SW * 0.85} ${SH * 0.45} ${SW * 0.78} ${SH * 0.55}`} stroke="rgba(255,255,255,0.25)" strokeDasharray="3 4" fill="none" />
          
          {/* Star Node coordinates mapping exact artwork clusters */}
          <Path d="M25 285l2 4l4 2l-4 2l-2 4l-2-4l-4-2l4-2z" fill="white" opacity="0.6"/>
          <Path d="M40 500l1.5 3l3 1.5l-3 1.5l-1.5 3l-1.5-3l-3-1.5l3-1.5z" fill="white" opacity="0.4"/>
          <Path d="M330 320l2 4l4 2l-4 2l-2 4l-2-4l-4-2l4-2z" fill="white" opacity="0.6"/>
          <Path d="M345 520l1.5 3l3 1.5l-3 1.5l-1.5 3l-1.5-3l-3-1.5l3-1.5z" fill="white" opacity="0.4"/>
        </Svg>
      </Animated.View>

      {/* Floating Application Context Icons */}
      <Animated.View style={[StyleSheet.absoluteFillObject, { opacity: detailOpacity }]} pointerEvents="none">
        <Animated.View style={[styles.absoluteIcon, { top: SH * 0.28, left: SW * 0.08, transform: [{ translateY: bowlY }] }]}>
          <IconBowl />
        </Animated.View>
        <Animated.View style={[styles.absoluteIcon, { top: SH * 0.40, left: SW * 0.10, transform: [{ translateX: coffeeX }] }]}>
          <IconCoffee />
        </Animated.View>
        <Animated.View style={[styles.absoluteIcon, { top: SH * 0.54, left: SW * 0.05, transform: [{ translateX: cardX }] }]}>
          <IconCardWithWaves />
        </Animated.View>
        <Animated.View style={[styles.absoluteIcon, { top: SH * 0.33, right: SW * 0.06, transform: [{ translateY: bagY }] }]}>
          <IconBagWithCloche />
        </Animated.View>
        <Animated.View style={[styles.absoluteIcon, { top: SH * 0.55, right: SW * 0.06, transform: [{ translateX: walletX }] }]}>
          <IconWalletNaira />
        </Animated.View>
      </Animated.View>

      {/* Center Branded Identity Wrapper */}
      <Animated.View style={[styles.centerIdentityContainer, { opacity: baseOpacity }]}>
        <VeyoLogoMark />
        <Text style={styles.brandTitleText}>Veyo</Text>
        <Text style={styles.taglineSubtext}>Your ride, on your time.</Text>
      </Animated.View>

      {/* Vector Environment Skyline Base & Vehicle */}
      <View style={styles.sceneryFooterContainer} pointerEvents="none">
        <Svg width={SW} height={200} viewBox={`0 0 ${SW} 200`} fill="none">
          {/* Subtle Skyline Outlines */}
          <Rect x={SW * 0.12} y={110} width={28} height={50} stroke="rgba(255,255,255,0.2)" strokeWidth="1.2" />
          <Rect x={SW * 0.38} y={60} width={42} height={100} stroke="rgba(255,255,255,0.25)" strokeWidth="1.2" />
          {/* Detail windows within high-rise structural skeleton */}
          {[1,2,3,4,5].map((idx) => (
            <Rect key={idx} x={SW * 0.43} y={70 + (idx * 14)} width={12} height={6} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          ))}
          <Rect x={SW * 0.52} y={100} width={34} height={60} stroke="rgba(255,255,255,0.18)" strokeWidth="1.2" />
          <Rect x={SW * 0.70} y={120} width={30} height={40} stroke="rgba(255,255,255,0.2)" strokeWidth="1.2" />
          <Rect x={SW * 0.82} y={95} width={26} height={65} stroke="rgba(255,255,255,0.15)" strokeWidth="1.2" />

          {/* Perfect Horizon baseline platform separator */}
          <Line x1="0" y1="160" x2={SW} y2="160" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
          
          {/* Minimalist streetlamp indicator */}
          <Line x1={SW * 0.68} y1={160} x2={SW * 0.68} y2={125} stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
          <Path d={`M${SW * 0.68} 125 Q${SW * 0.68} 120 ${SW * 0.72} 121`} stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" fill="none" />

          {/* Abstract background platform trees */}
          <Circle cx={SW * 0.22} cy={140} r={14} stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" />
          <Line x1={SW * 0.22} y1={140} x2={SW * 0.22} y2={160} stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />

          {/* Exact Sedan silhouette matching line weights */}
          <G transform={`translate(${CX - 50}, 128)`}>
            <Path 
              d="M3 24c6-4 10-14 20-14h36c12 0 16 10 24 14h12v7H0v-7h3z" 
              stroke="white" 
              strokeWidth="1.5" 
              fill="none" 
            />
            {/* Windows structural framing divider */}
            <Path d="M22 11l-4 13h22V11H22z" stroke="rgba(255,255,255,0.6)" strokeWidth="1" />
            <Path d="M43 11v13h24l-8-13H43z" stroke="rgba(255,255,255,0.6)" strokeWidth="1" />
            {/* Wheels */}
            <Circle cx="16" cy="31" r="7" stroke="white" strokeWidth="1.5" fill="#1A68FF" />
            <Circle cx="16" cy="31" r="2.5" fill="white" />
            <Circle cx="72" cy="31" r="7" stroke="white" strokeWidth="1.5" fill="#1A68FF" />
            <Circle cx="72" cy="31" r="2.5" fill="white" />
          </G>

          {/* Accent Map Pin floating vertically above car */}
          <G transform={`translate(${CX + 5}, 102)`}>
            <Path d="M6 18C1 12 0 10 0 6a6 6 0 0112 0c0 4-1 6-6 12z" fill="#4ADE80" />
            <Circle cx="6" cy="6" r="2.2" fill="#1A68FF" />
          </G>
        </Svg>
      </View>

      {/* Top Header System Integration Branding Badge */}
      <Animated.View style={[styles.geminiIntegrationBadge, { opacity: detailOpacity }]}>
        <Text style={styles.withPrefixText}>with</Text>
        {/* Multicolored Google Gemini Quad-Pointed Star Token */}
        <Svg width={18} height={18} viewBox="0 0 24 24" style={styles.starSpacingMargin}>
          <Path 
            d="M12 0c.5 5.2 4.8 9.5 10 10-5.2.5-9.5 4.8-10 10-.5-5.2-4.8-9.5-10-10 5.2-.5 9.5-4.8 10-10z" 
            fill="white" 
          />
        </Svg>
        <Text style={styles.geminiLabelText}>Gemini</Text>
      </Animated.View>
    </View>
  );
}

// ─────────────────────────────────────────────
//  STYLES CONFIGURATION
// ─────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A68FF', // Flat, deep corporate digital blue match
  },
  centerIdentityContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: SH * 0.1,
  },
  brandTitleText: {
    color: 'white',
    fontSize: 64,
    fontWeight: '900',
    fontStyle: 'italic',
    letterSpacing: -2,
    marginTop: 2,
  },
  taglineSubtext: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
    opacity: 0.95,
  },
  absoluteIcon: {
    position: 'absolute',
  },
  sceneryFooterContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 200,
  },
  geminiIntegrationBadge: {
    position: 'absolute',
    top: 54,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  withPrefixText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 15,
    fontWeight: '400',
  },
  starSpacingMargin: {
    marginHorizontal: 6,
  },
  geminiLabelText: {
    color: 'white',
    fontSize: 19,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
});