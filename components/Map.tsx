import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { MapProps } from './Map.native';

export type { MapProps };

export default function Map({
  height = 240,
  showExpandButton = true,
  showDriverCount = true,
  containerStyle,
}: MapProps) {
  return (
    <View style={[styles.container, { height }, containerStyle]}>
      {/* Top Bar Preview */}
      <View style={styles.topBar}>
        {showDriverCount && (
          <View style={styles.pill}>
            <View style={styles.dot} />
            <Text style={styles.pillText}>GPS Native Preview</Text>
          </View>
        )}
        {showExpandButton && (
          <View style={styles.expandPill}>
            <Text style={styles.expandText}>Mobile GPS</Text>
            <Feather name="maximize-2" size={12} color="#0286FF" />
          </View>
        )}
      </View>

      {/* Center Web Notice */}
      <View style={styles.centerNotice}>
        <View style={styles.iconCircle}>
          <Ionicons name="map" size={28} color="#0286FF" />
        </View>
        <Text style={styles.title}>Live Interactive Map</Text>
        <Text style={styles.subtitle}>
          Native hardware GPS and turn-by-turn routing are optimized for iOS and Android devices.
        </Text>
      </View>

      {/* Bottom Info Strip */}
      <View style={styles.bottomStrip}>
        <Ionicons name="navigate-circle" size={18} color="#0286FF" />
        <Text style={styles.bottomText}>Veyo Intelligent Mobility Engine</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 20,
    backgroundColor: '#F5F8FF',
    borderWidth: 1,
    borderColor: '#E6F3FF',
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'space-between',
  },
  topBar: {
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EBF4FF',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#0CC25F',
    marginRight: 6,
  },
  pillText: {
    fontFamily: 'JakartaBold',
    fontSize: 11,
    color: '#0B1528',
  },
  expandPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#C3D9FF',
  },
  expandText: {
    fontFamily: 'JakartaBold',
    fontSize: 11,
    color: '#0286FF',
  },
  centerNotice: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#EBF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontFamily: 'JakartaBold',
    fontSize: 14,
    color: '#0B1528',
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: 'JakartaMedium',
    fontSize: 11,
    color: '#858585',
    textAlign: 'center',
    lineHeight: 16,
  },
  bottomStrip: {
    height: 40,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8,
  },
  bottomText: {
    fontFamily: 'JakartaMedium',
    fontSize: 11,
    color: '#364573',
  },
});
