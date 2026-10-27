import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, Feather, FontAwesome5 } from '@expo/vector-icons';
import RideChatModal from '@/components/RideChatModal';
import { useLocationStore } from '@/store/store';

export default function TripDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setDestinationLocation } = useLocationStore();
  const [chatModalVisible, setChatModalVisible] = useState(false);

  const handleRebook = () => {
    setDestinationLocation({
      latitude: 6.4474,
      longitude: 3.4723,
      address: 'Lekki Phase 1, Admiralty Way',
    });
    router.push('/(utils)/book-ride');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* 1. Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color="#0B1528" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trip Details</Text>
        <TouchableOpacity
          style={styles.shareBtn}
          onPress={() => Alert.alert('Share Receipt', 'Invoice PDF link copied.')}
          activeOpacity={0.8}
        >
          <Ionicons name="share-outline" size={18} color="#3122D2" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 2. Top Trip Summary Card */}
        <View style={styles.card}>
          <View style={styles.topRow}>
            <View>
              <Text style={styles.tripId}>RD-20240812-001</Text>
              <Text style={styles.tripDate}>Today • 2:30 PM</Text>
            </View>
            <View style={styles.completedPill}>
              <Text style={styles.completedPillText}>COMPLETED</Text>
            </View>
          </View>

          {/* Route Timeline */}
          <View style={styles.timelineBox}>
            <View style={styles.timelineRow}>
              <View style={[styles.timelineDot, { backgroundColor: '#0CC25F' }]} />
              <View style={styles.timelineTextCol}>
                <Text style={styles.timelineLabel}>PICKUP</Text>
                <Text style={styles.timelineAddress}>Victoria Island, Lagos</Text>
              </View>
            </View>

            <View style={styles.timelineLine} />

            <View style={styles.timelineRow}>
              <View style={[styles.timelineDot, { backgroundColor: '#F56565' }]} />
              <View style={styles.timelineTextCol}>
                <Text style={styles.timelineLabel}>DROPOFF</Text>
                <Text style={styles.timelineAddress}>Lekki Phase 1, Admiralty Way</Text>
              </View>
            </View>
          </View>

          {/* Metrics Quad */}
          <View style={styles.metricsQuad}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Total Fare</Text>
              <Text style={styles.metricValueBlue}>₦3,400</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Distance</Text>
              <Text style={styles.metricValue}>6.8 km</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Duration</Text>
              <Text style={styles.metricValue}>22 mins</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Payment</Text>
              <Text style={styles.metricValueGreen}>Wallet</Text>
            </View>
          </View>
        </View>

        {/* 3. Driver Profile Strip */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>DRIVER PARTNER</Text>

          <View style={styles.driverRow}>
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&q=80',
              }}
              style={styles.driverAvatar}
            />

            <View style={styles.driverMeta}>
              <Text style={styles.driverName}>Sarah Lee</Text>
              <Text style={styles.driverVehicle}>2023 Tesla Model 3 • Red Luxury</Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={12} color="#F59E0B" />
                <Text style={styles.ratingText}> 4.78 • 189 trips</Text>
              </View>
            </View>

            <View style={styles.driverActionButtons}>
              <TouchableOpacity
                style={styles.chatActionBtn}
                onPress={() => setChatModalVisible(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="chatbubble-ellipses" size={16} color="#3122D2" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.callActionBtn}
                onPress={() => Alert.alert('Call Driver', 'Connecting to driver Sarah Lee...')}
                activeOpacity={0.8}
              >
                <Ionicons name="call" size={16} color="#0CC25F" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 4. Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.rebookBtn}
            onPress={handleRebook}
            activeOpacity={0.85}
          >
            <Ionicons name="repeat" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.rebookBtnText}>Rebook This Ride</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.supportBtn}
            onPress={() =>
              Alert.alert(
                'Trip Support',
                'Choose support category:\n1. Lost Item\n2. Fare Dispute\n3. Driver Feedback'
              )
            }
            activeOpacity={0.8}
          >
            <Feather name="help-circle" size={16} color="#4B5563" style={{ marginRight: 6 }} />
            <Text style={styles.supportBtnText}>Trip Support & Dispute</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Driver Chat Modal */}
      <RideChatModal
        visible={chatModalVisible}
        driverName="Sarah Lee"
        driverAvatar="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&q=80"
        etaMinutes={0}
        onClose={() => setChatModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F8FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: 'JakartaBold',
    fontSize: 18,
    color: '#0B1528',
  },
  shareBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    fontFamily: 'JakartaBold',
    fontSize: 11,
    color: '#6B7280',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  tripId: {
    fontFamily: 'JakartaBold',
    fontSize: 16,
    color: '#0B1528',
  },
  tripDate: {
    fontFamily: 'JakartaMedium',
    fontSize: 12,
    color: '#858585',
    marginTop: 2,
  },
  completedPill: {
    backgroundColor: '#ECFDF5',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  completedPillText: {
    fontFamily: 'JakartaBold',
    fontSize: 10,
    color: '#059669',
    letterSpacing: 0.5,
  },
  timelineBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  timelineTextCol: {
    flex: 1,
  },
  timelineLabel: {
    fontFamily: 'JakartaBold',
    fontSize: 9,
    color: '#9CA3AF',
    letterSpacing: 0.5,
  },
  timelineAddress: {
    fontFamily: 'JakartaMedium',
    fontSize: 13,
    color: '#1F2937',
    marginTop: 1,
  },
  timelineLine: {
    width: 2,
    height: 16,
    backgroundColor: '#D1D5DB',
    marginLeft: 4,
    marginVertical: 4,
  },
  metricsQuad: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 14,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricLabel: {
    fontFamily: 'JakartaMedium',
    fontSize: 11,
    color: '#858585',
  },
  metricValue: {
    fontFamily: 'JakartaBold',
    fontSize: 14,
    color: '#0B1528',
    marginTop: 2,
  },
  metricValueBlue: {
    fontFamily: 'JakartaBold',
    fontSize: 16,
    color: '#0286FF',
    marginTop: 2,
  },
  metricValueGreen: {
    fontFamily: 'JakartaBold',
    fontSize: 14,
    color: '#059669',
    marginTop: 2,
  },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#C3D9FF',
  },
  driverMeta: {
    flex: 1,
    marginLeft: 12,
  },
  driverName: {
    fontFamily: 'JakartaBold',
    fontSize: 15,
    color: '#0B1528',
  },
  driverVehicle: {
    fontFamily: 'JakartaMedium',
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  ratingText: {
    fontFamily: 'JakartaBold',
    fontSize: 11,
    color: '#4B5563',
  },
  driverActionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  chatActionBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  callActionBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  rebookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0286FF',
    borderRadius: 16,
    paddingVertical: 14,
    shadowColor: '#0286FF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  rebookBtnText: {
    fontFamily: 'JakartaBold',
    fontSize: 15,
    color: '#FFFFFF',
  },
  supportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  supportBtnText: {
    fontFamily: 'JakartaSemiBold',
    fontSize: 14,
    color: '#4B5563',
  },
});
