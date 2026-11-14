import React, { useState, useRef } from 'react';
import { View, Animated, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import RideCard from './RideCard';
import { RADIUS, SPACING } from '@/constants/designTokens';

export default function RideCardDeck({ rides }: { rides: any[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const anim = useRef(new Animated.Value(0)).current;
  const isAnimating = useRef(false);

  const safeRides = rides && rides.length > 0 ? rides : [];
  const currentRide = safeRides[currentIndex];
  const totalRides = safeRides.length;

  const handleNext = () => {
    if (currentIndex >= totalRides - 1 || isAnimating.current) return;
    isAnimating.current = true;

    Animated.timing(anim, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setCurrentIndex((prev) => prev + 1);
        anim.setValue(0);
        isAnimating.current = false;
      }
    });
  };

  const handlePrev = () => {
    if (currentIndex === 0 || isAnimating.current) return;
    isAnimating.current = true;

    Animated.timing(anim, {
      toValue: -1,
      duration: 220,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setCurrentIndex((prev) => prev - 1);
        anim.setValue(0);
        isAnimating.current = false;
      }
    });
  };

  if (!currentRide) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="car-outline" size={36} color="#D1D5DB" />
        <Text style={styles.emptyText}>No recent rides recorded</Text>
      </View>
    );
  }

  return (
    <View style={styles.deckWrapper}>
      {/* Active Card with subtle slide animation */}
      <Animated.View
        style={{
          opacity: anim.interpolate({
            inputRange: [-1, 0, 1],
            outputRange: [0.5, 1, 0.5],
          }),
          transform: [
            {
              translateX: anim.interpolate({
                inputRange: [-1, 0, 1],
                outputRange: [-60, 0, 60],
              }),
            },
          ],
        }}
      >
        <RideCard ride={currentRide} />
      </Animated.View>

      {/* Clean, Integrated Pagination Strip */}
      {totalRides > 1 && (
        <View style={styles.paginationRow}>
          <TouchableOpacity
            onPress={handlePrev}
            disabled={currentIndex === 0}
            style={[
              styles.navBtn,
              currentIndex === 0 && styles.navBtnDisabled,
            ]}
            activeOpacity={0.7}
          >
            <Ionicons
              name="chevron-back"
              size={14}
              color={currentIndex === 0 ? '#CBD5E1' : '#374151'}
            />
            <Text
              style={[
                styles.navBtnText,
                currentIndex === 0 && styles.navBtnTextDisabled,
              ]}
            >
              Prev
            </Text>
          </TouchableOpacity>

          {/* Dots Indicator */}
          <View style={styles.dotsRow}>
            {safeRides.map((_, idx) => (
              <View
                key={idx}
                style={[
                  styles.dot,
                  idx === currentIndex ? styles.dotActive : styles.dotInactive,
                ]}
              />
            ))}
          </View>

          <TouchableOpacity
            onPress={handleNext}
            disabled={currentIndex === totalRides - 1}
            style={[
              styles.navBtn,
              currentIndex === totalRides - 1 && styles.navBtnDisabled,
            ]}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.navBtnText,
                currentIndex === totalRides - 1 && styles.navBtnTextDisabled,
              ]}
            >
              Next
            </Text>
            <Ionicons
              name="chevron-forward"
              size={14}
              color={currentIndex === totalRides - 1 ? '#CBD5E1' : '#374151'}
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  deckWrapper: {
    marginVertical: 4,
  },
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.card,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  emptyText: {
    fontFamily: 'JakartaMedium',
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 6,
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginTop: 6,
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    gap: 2,
  },
  navBtnDisabled: {
    backgroundColor: 'transparent',
  },
  navBtnText: {
    fontFamily: 'JakartaBold',
    fontSize: 11,
    color: '#374151',
  },
  navBtnTextDisabled: {
    color: '#CBD5E1',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    height: 4,
    borderRadius: 2,
  },
  dotActive: {
    width: 16,
    backgroundColor: '#0286FF',
  },
  dotInactive: {
    width: 6,
    backgroundColor: '#E5E7EB',
  },
});
