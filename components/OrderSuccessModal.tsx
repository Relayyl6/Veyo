import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface OrderSuccessModalProps {
  visible: boolean;
  orderId?: string;
  onTrackOrder?: () => void;
  onBackToHome?: () => void;
}

export default function OrderSuccessModal({
  visible,
  orderId = 'VE-90210',
  onTrackOrder,
  onBackToHome,
}: OrderSuccessModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onBackToHome}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* Big Check Circle */}
          <View style={styles.checkCircle}>
            <Ionicons name="checkmark" size={36} color="#FFFFFF" />
          </View>

          {/* Heading & Sub */}
          <Text style={styles.title}>Order Successful!</Text>
          <Text style={styles.subtitle}>
            Your order is on its way. The restaurant is preparing your food.
          </Text>

          {/* Order Number Badge */}
          <View style={styles.orderBadge}>
            <Text style={styles.orderBadgeText}>Order #{orderId}</Text>
          </View>

          {/* Action Buttons */}
          <TouchableOpacity
            style={styles.trackButton}
            activeOpacity={0.88}
            onPress={onTrackOrder}
          >
            <Text style={styles.trackButtonText}>Track Order</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.homeButton}
            activeOpacity={0.8}
            onPress={onBackToHome}
          >
            <Text style={styles.homeButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  checkCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#3122D2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontFamily: 'JakartaExtraBold',
    fontSize: 20,
    color: '#0B1528',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'JakartaMedium',
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  orderBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    marginBottom: 24,
  },
  orderBadgeText: {
    fontFamily: 'JakartaBold',
    fontSize: 11,
    color: '#4B5563',
  },
  trackButton: {
    width: '100%',
    backgroundColor: '#3122D2',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  trackButtonText: {
    fontFamily: 'JakartaBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  homeButton: {
    width: '100%',
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  homeButtonText: {
    fontFamily: 'JakartaBold',
    fontSize: 13,
    color: '#4B5563',
  },
});
