import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { SearchMapProps, SearchMapItem } from './SearchMap.native';

export type { SearchMapProps, SearchMapItem };

export default function SearchMap({
  items = [],
  selectedItem,
  style,
}: SearchMapProps) {
  return (
    <View style={[styles.container, style]}>
      {/* Simulated Map Visual */}
      <View style={styles.simulatedGrid}>
        <View style={styles.etaPill}>
          <Ionicons name="time" size={12} color="#FFFFFF" />
          <Text style={styles.etaText}>12 min arrival</Text>
        </View>

        <View style={styles.vendorPillOne}>
          <Text style={styles.pillText}>Healthy Habits</Text>
        </View>

        <View style={styles.vendorPillTwo}>
          <Text style={styles.pillText}>Zest Juice Bar</Text>
        </View>

        <View style={styles.courierCircle}>
          <FontAwesome5 name="car" size={10} color="#3122D2" />
        </View>
      </View>

      <View style={styles.webNotice}>
        <Ionicons name="map" size={24} color="#3122D2" />
        <Text style={styles.noticeText}>Interactive Map Active on iOS & Android</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F0F2',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  simulatedGrid: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.85,
    backgroundColor: '#E5EDEF',
  },
  etaPill: {
    position: 'absolute',
    top: 60,
    left: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#3122D2',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 14,
  },
  etaText: {
    fontFamily: 'JakartaBold',
    fontSize: 10,
    color: '#FFFFFF',
  },
  vendorPillOne: {
    position: 'absolute',
    top: 140,
    left: 120,
    backgroundColor: '#3122D2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  vendorPillTwo: {
    position: 'absolute',
    top: 100,
    right: 40,
    backgroundColor: '#0D7A87',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pillText: {
    fontFamily: 'JakartaBold',
    fontSize: 9,
    color: '#FFFFFF',
  },
  courierCircle: {
    position: 'absolute',
    top: 180,
    right: 80,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  webNotice: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  noticeText: {
    fontFamily: 'JakartaBold',
    fontSize: 12,
    color: '#0B1528',
  },
});
