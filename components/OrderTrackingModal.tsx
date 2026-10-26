import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons, Feather, FontAwesome5 } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import SearchMap from './SearchMap';
import RideChatModal from './RideChatModal';

interface OrderTrackingModalProps {
  visible: boolean;
  orderId?: string;
  onClose: () => void;
}

export default function OrderTrackingModal({
  visible,
  orderId = 'VE-90210',
  onClose,
}: OrderTrackingModalProps) {
  const [chatModalVisible, setChatModalVisible] = useState(false);

  const handleCallCourier = () => {
    Alert.alert('Calling Courier', 'Calling Jackub Kurner (+234 812 345 6789)...');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Top Header Bar */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.headerBtn}>
            <Ionicons name="arrow-back" size={20} color="#0B1528" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Tracking</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Map Canvas with Route */}
        <View style={styles.mapCanvas}>
          <SearchMap
            items={[
              {
                id: 'dest-home',
                title: 'Home',
                latitude: 6.435,
                longitude: 3.426,
              },
            ]}
          />

          {/* Floating Home Pin Label */}
          <View style={styles.homePinPill}>
            <Text style={styles.homePinText}>Home</Text>
          </View>
        </View>

        {/* Bottom Floating Delivery Card */}
        <View style={styles.deliveryCard}>
          <Text style={styles.etaHeading}>
            Estimated delivery time is ~ <Text style={styles.etaTimeHighlight}>3:25 PM</Text>
          </Text>
          <Text style={styles.etaSub}>Your order is already on its way to you!</Text>

          {/* 4-Step Progress Stepper */}
          <View style={styles.stepperRow}>
            {/* Step 1: Placed */}
            <View style={[styles.stepCircle, styles.stepActive]}>
              <Ionicons name="receipt-outline" size={14} color="#FFFFFF" />
            </View>
            <View style={[styles.stepLine, styles.stepLineActive]} />

            {/* Step 2: Preparing */}
            <View style={[styles.stepCircle, styles.stepActive]}>
              <Ionicons name="restaurant-outline" size={14} color="#FFFFFF" />
            </View>
            <View style={[styles.stepLine, styles.stepLineActive]} />

            {/* Step 3: En route */}
            <View style={[styles.stepCircle, styles.stepActive]}>
              <FontAwesome5 name="motorcycle" size={12} color="#FFFFFF" />
            </View>
            <View style={styles.stepLine} />

            {/* Step 4: Delivered */}
            <View style={styles.stepCircle}>
              <Ionicons name="checkmark-done" size={14} color="#94A3B8" />
            </View>
          </View>

          {/* Courier Strip */}
          <View style={styles.courierStrip}>
            <Image
              source={{
                uri: 'https://randomuser.me/api/portraits/men/32.jpg',
              }}
              style={styles.courierAvatar}
            />

            <View style={styles.courierInfo}>
              <Text style={styles.courierName}>Jackub Kurner</Text>
              <Text style={styles.courierRole}>Courier</Text>
            </View>

            {/* Action Pills: Call & Chat */}
            <View style={styles.courierActions}>
              <TouchableOpacity
                style={styles.actionPill}
                activeOpacity={0.8}
                onPress={handleCallCourier}
              >
                <Ionicons name="call" size={13} color="#3122D2" />
                <Text style={styles.actionPillText}>Call</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionPill, styles.chatPill]}
                activeOpacity={0.8}
                onPress={() => setChatModalVisible(true)}
              >
                <Ionicons name="chatbubble-ellipses" size={13} color="#FFFFFF" />
                <Text style={styles.chatPillText}>Chat</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Integrated Chat Modal */}
        <RideChatModal
          visible={chatModalVisible}
          driverName="Jackub Kurner"
          driverAvatar="https://randomuser.me/api/portraits/men/32.jpg"
          etaMinutes={8}
          onClose={() => setChatModalVisible(false)}
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: 'JakartaBold',
    fontSize: 16,
    color: '#0B1528',
  },
  mapCanvas: {
    flex: 1,
    position: 'relative',
  },
  homePinPill: {
    position: 'absolute',
    top: 30,
    alignSelf: 'center',
    backgroundColor: '#3122D2',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  homePinText: {
    fontFamily: 'JakartaBold',
    fontSize: 12,
    color: '#FFFFFF',
  },
  deliveryCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 8,
  },
  etaHeading: {
    fontFamily: 'JakartaBold',
    fontSize: 15,
    color: '#0B1528',
    marginBottom: 4,
  },
  etaTimeHighlight: {
    color: '#3122D2',
  },
  etaSub: {
    fontFamily: 'JakartaMedium',
    fontSize: 12,
    color: '#858585',
    marginBottom: 20,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepActive: {
    backgroundColor: '#3122D2',
  },
  stepLine: {
    flex: 1,
    height: 3,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 4,
  },
  stepLineActive: {
    backgroundColor: '#3122D2',
  },
  courierStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  courierAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  courierInfo: {
    flex: 1,
  },
  courierName: {
    fontFamily: 'JakartaBold',
    fontSize: 14,
    color: '#0B1528',
  },
  courierRole: {
    fontFamily: 'JakartaMedium',
    fontSize: 11,
    color: '#858585',
    marginTop: 1,
  },
  courierActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
  },
  actionPillText: {
    fontFamily: 'JakartaBold',
    fontSize: 11,
    color: '#3122D2',
  },
  chatPill: {
    backgroundColor: '#3122D2',
  },
  chatPillText: {
    fontFamily: 'JakartaBold',
    fontSize: 11,
    color: '#FFFFFF',
  },
});
