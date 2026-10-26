import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TrafficAlertBannerProps {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  onReroutePress?: () => void;
  style?: object;
}

export default function TrafficAlertBanner({
  title = 'TRAFFIC ALERT',
  subtitle = 'Avoid Third Mainland traffic?',
  buttonText = 'Reroute',
  onReroutePress,
  style,
}: TrafficAlertBannerProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconCircle}>
        <Ionicons name="warning" size={18} color="#D97706" />
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        activeOpacity={0.8}
        onPress={onReroutePress}
      >
        <Text style={styles.buttonText}>{buttonText}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontFamily: 'JakartaBold',
    fontSize: 10,
    color: '#858585',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontFamily: 'JakartaBold',
    fontSize: 12,
    color: '#0B1528',
    marginTop: 1,
  },
  button: {
    backgroundColor: '#3122D2',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 14,
    marginLeft: 8,
  },
  buttonText: {
    fontFamily: 'JakartaBold',
    fontSize: 11,
    color: '#FFFFFF',
  },
});
