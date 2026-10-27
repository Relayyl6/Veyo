import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome5, Feather } from '@expo/vector-icons';

interface QuickActionGridProps {
  onBookRidePress?: () => void;
  onSendItemsPress?: () => void;
  style?: object;
}

export default function QuickActionGrid({
  onBookRidePress,
  onSendItemsPress,
  style,
}: QuickActionGridProps) {
  return (
    <View style={[styles.container, style]}>
      {/* 1. Book a Ride */}
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={onBookRidePress}
      >
        <View style={[styles.iconContainer, styles.rideIconBg]}>
          <FontAwesome5 name="car" size={18} color="#3122D2" />
        </View>
        <Text style={styles.title}>Book a Ride</Text>
        <Text style={styles.subtitle}>Swift city mobility</Text>
      </TouchableOpacity>

      {/* 2. Send Items */}
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={onSendItemsPress}
      >
        <View style={[styles.iconContainer, styles.parcelIconBg]}>
          <Feather name="box" size={18} color="#0D9488" />
        </View>
        <Text style={styles.title}>Send Items</Text>
        <Text style={styles.subtitle}>Same-day delivery</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
  },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 11,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  rideIconBg: {
    backgroundColor: '#EEF2FF',
  },
  parcelIconBg: {
    backgroundColor: '#CCFBF1',
  },
  title: {
    fontFamily: 'JakartaBold',
    fontSize: 14,
    color: '#0B1528',
    marginBottom: 2,
  },
  subtitle: {
    fontFamily: 'JakartaMedium',
    fontSize: 11,
    color: '#858585',
  },
});
