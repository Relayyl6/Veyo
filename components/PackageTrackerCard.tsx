import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';

interface PackageTrackerCardProps {
  packageId?: string;
  statusText?: string;
  pickupLocation?: string;
  etaText?: string;
  progressPercent?: number; // 0 to 100
  onPress?: () => void;
  style?: object;
}

export default function PackageTrackerCard({
  packageId = 'ID: VEYO-29384-NG',
  statusText = 'EN ROUTE',
  pickupLocation = 'Pickup: Ikeja',
  etaText = 'Est. 25m',
  progressPercent = 65,
  onPress,
  style,
}: PackageTrackerCardProps) {
  return (
    <TouchableOpacity
      style={[styles.container, style]}
      activeOpacity={0.9}
      onPress={onPress}
    >
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Track Your Packages</Text>
          <Text style={styles.subtitle}>1 shipment in transit</Text>
        </View>

        <View style={styles.packageIconCircle}>
          <Feather name="truck" size={16} color="#FFFFFF" />
        </View>
      </View>

      {/* Shipment Status Card */}
      <View style={styles.shipmentCard}>
        <View style={styles.shipmentMetaRow}>
          <Text style={styles.packageIdText}>{packageId}</Text>
          <View style={styles.statusPill}>
            <Text style={styles.statusText}>{statusText}</Text>
          </View>
        </View>

        {/* Progress Track */}
        <View style={styles.progressTrack}>
          <View style={[styles.progressBar, { width: `${progressPercent}%` }]} />
        </View>

        {/* Origin & ETA Row */}
        <View style={styles.locationEtaRow}>
          <Text style={styles.pickupText}>{pickupLocation}</Text>
          <Text style={styles.etaText}>{etaText}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontFamily: 'JakartaBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  subtitle: {
    fontFamily: 'JakartaMedium',
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  packageIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shipmentCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 10,
  },
  shipmentMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  packageIdText: {
    fontFamily: 'JakartaBold',
    fontSize: 12,
    color: '#F8FAFC',
    letterSpacing: 0.5,
  },
  statusPill: {
    backgroundColor: '#0F766E',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontFamily: 'JakartaBold',
    fontSize: 9,
    color: '#5EEAD4',
    letterSpacing: 0.5,
  },
  progressTrack: {
    height: 4,
    backgroundColor: '#334155',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#2DD4BF',
    borderRadius: 2,
  },
  locationEtaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickupText: {
    fontFamily: 'JakartaMedium',
    fontSize: 11,
    color: '#94A3B8',
  },
  etaText: {
    fontFamily: 'JakartaBold',
    fontSize: 11,
    color: '#F8FAFC',
  },
});
