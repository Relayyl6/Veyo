import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Switch,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons, FontAwesome, Feather, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

interface DriverActivityItem {
  id: string;
  title: string;
  time: string;
  payoutAccount: string;
  status: 'COMPLETED' | 'CANCELLED';
  type: 'ride' | 'delivery';
}

const RECENT_ACTIVITIES: DriverActivityItem[] = [
  {
    id: 'act-1',
    title: 'Downtown Drop-off',
    time: 'Today, 2:30 PM',
    payoutAccount: 'Wells Fargo',
    status: 'COMPLETED',
    type: 'ride',
  },
  {
    id: 'act-2',
    title: 'Food Delivery',
    time: 'Today, 1:15 PM',
    payoutAccount: 'Wells Fargo',
    status: 'COMPLETED',
    type: 'delivery',
  },
  {
    id: 'act-3',
    title: 'Airport Run (JFK)',
    time: 'Yesterday, 8:45 AM',
    payoutAccount: 'Wells Fargo',
    status: 'COMPLETED',
    type: 'ride',
  },
];

interface DriverProfileHubProps {
  onSignOut?: () => void;
  onEditPayout?: () => void;
}

export default function DriverProfileHub({ onSignOut, onEditPayout }: DriverProfileHubProps) {
  const [isReceivingRequests, setIsReceivingRequests] = useState(true);
  const [payoutModalVisible, setPayoutModalVisible] = useState(false);
  const [bankName, setBankName] = useState('Wells Fargo');
  const [accountNumber, setAccountNumber] = useState('•••• 4455');
  const [isSaved, setIsSaved] = useState(false);

  const toggleOnline = () => {
    setIsReceivingRequests((prev) => !prev);
  };

  const handleSavePayout = () => {
    setPayoutModalVisible(false);
    setIsSaved(true);
    Alert.alert('Payout Method Updated', `Direct deposit set to ${bankName} (${accountNumber}).`);
  };

  return (
    <View style={styles.container}>
      {/* 1. Receiving Requests Status Card */}
      <View style={styles.statusCard}>
        <View style={styles.statusTextCol}>
          <Text style={styles.driverNameHeading}>Sarah Lee</Text>
          <View style={styles.statusIndicatorRow}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isReceivingRequests ? '#10B981' : '#9CA3AF' },
              ]}
            />
            <Text style={styles.statusLabel}>
              {isReceivingRequests ? 'Receiving requests' : 'Offline'}
            </Text>
          </View>
        </View>

        <Switch
          value={isReceivingRequests}
          onValueChange={toggleOnline}
          trackColor={{ false: '#D1D5DB', true: '#3122D2' }}
          thumbColor="#FFFFFF"
          ios_backgroundColor="#D1D5DB"
          style={styles.switch}
        />
      </View>

      {/* 2. Driver Identity Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarWrapper}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&q=80',
            }}
            style={styles.avatarImage}
            resizeMode="cover"
          />
          {/* Verified Driver Badge */}
          <View style={styles.verifiedDriverBadge}>
            <Ionicons name="checkmark-circle" size={13} color="#FFFFFF" style={{ marginRight: 4 }} />
            <Text style={styles.verifiedDriverText}>Verified Driver</Text>
          </View>
        </View>

        <Text style={styles.profileName}>Sarah Lee</Text>
        <View style={styles.ratingRow}>
          <FontAwesome name="star" size={14} color="#F59E0B" />
          <Text style={styles.ratingValue}> 4.78</Text>
        </View>
      </View>

      {/* 3. Vehicle Information Card */}
      <View style={styles.vehicleCard}>
        <View style={styles.vehicleHeaderRow}>
          <View style={styles.vehicleIconCircle}>
            <Ionicons name="car-sport" size={20} color="#3122D2" />
          </View>
          <View style={styles.vehicleTextCol}>
            <Text style={styles.vehicleTitle}>2023 Tesla Model 3</Text>
            <Text style={styles.vehicleSubtitle}>Red Luxury Sedan</Text>
          </View>
          <View style={styles.licensePlateBadge}>
            <Text style={styles.licensePlateText}>TES1234</Text>
          </View>
        </View>

        <View style={styles.vehicleImageFrame}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&q=80',
            }}
            style={styles.vehicleImage}
            resizeMode="cover"
          />
        </View>
      </View>

      {/* 4. Payout Account Card */}
      <View style={styles.payoutCard}>
        <View style={styles.payoutTopRow}>
          <Text style={styles.payoutHeaderLabel}>PAYOUT ACCOUNT</Text>
          <TouchableOpacity
            onPress={() => {
              if (onEditPayout) onEditPayout();
              else setPayoutModalVisible(true);
            }}
            activeOpacity={0.7}
            style={styles.payoutEditBtn}
          >
            <Feather name="edit-2" size={15} color="#3122D2" />
          </TouchableOpacity>
        </View>

        <View style={styles.payoutDetailRow}>
          <View style={styles.bankIconCircle}>
            <FontAwesome5 name="university" size={18} color="#3122D2" />
          </View>
          <View style={styles.bankTextCol}>
            <Text style={styles.bankName}>{bankName}</Text>
            <Text style={styles.bankAccount}>{accountNumber}</Text>
          </View>
          <View style={styles.directDepositPill}>
            <Ionicons name="shield-checkmark" size={12} color="#0CC25F" />
            <Text style={styles.directDepositText}>Active</Text>
          </View>
        </View>
      </View>

      {/* 5. Stats Quad (Total Rides & Total Orders) */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <View style={[styles.statIconCircle, { backgroundColor: '#EEF2FF' }]}>
            <FontAwesome5 name="route" size={16} color="#3122D2" />
          </View>
          <Text style={styles.statLabel}>Total Rides</Text>
          <Text style={styles.statNumber}>189</Text>
        </View>

        <View style={styles.statBox}>
          <View style={[styles.statIconCircle, { backgroundColor: '#FFF7ED' }]}>
            <FontAwesome5 name="shopping-bag" size={16} color="#EA580C" />
          </View>
          <Text style={styles.statLabel}>Total Orders</Text>
          <Text style={styles.statNumber}>74</Text>
        </View>
      </View>

      {/* 6. Acceptance Rate Card */}
      <View style={styles.acceptanceCard}>
        <View style={styles.acceptanceTopRow}>
          <View style={styles.acceptanceIconCircle}>
            <Ionicons name="checkmark-circle-outline" size={20} color="#0D9488" />
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.acceptanceLabel}>Acceptance Rate</Text>
            <Text style={styles.acceptanceValue}>94%</Text>
          </View>
          {/* Progress Bar */}
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: '94%' }]} />
          </View>
        </View>
      </View>

      {/* 7. Safety Performance Card */}
      <View style={styles.safetyCard}>
        <View style={styles.safetyHeaderRow}>
          <Ionicons name="shield-checkmark" size={18} color="#3122D2" />
          <Text style={styles.safetyTitle}>Safety Performance</Text>
        </View>

        <View style={styles.safetyMetricsRow}>
          <View style={styles.safetyMetricBox}>
            <Text style={styles.safetyMetricLabel}>ACCEPTANCE</Text>
            <Text style={styles.safetyMetricValueDark}>89%</Text>
          </View>

          <View style={styles.safetyMetricBox}>
            <Text style={styles.safetyMetricLabel}>CANCELLATION</Text>
            <Text style={styles.safetyMetricValueRed}>4.1%</Text>
          </View>
        </View>
      </View>

      {/* 8. Recent Activity Feed */}
      <View style={styles.activitySection}>
        <View style={styles.activityHeaderRow}>
          <Text style={styles.activitySectionTitle}>Recent Activity</Text>
          <TouchableOpacity
            onPress={() => Alert.alert('Activity History', 'Showing Sarah Lee’s past 189 trips & deliveries.')}
            activeOpacity={0.7}
          >
            <Text style={styles.viewAllText}>VIEW ALL</Text>
          </TouchableOpacity>
        </View>

        {RECENT_ACTIVITIES.map((act) => (
          <View key={act.id} style={styles.activityItemCard}>
            <View style={styles.activityIconCircle}>
              {act.type === 'ride' ? (
                <Ionicons name="car" size={18} color="#3122D2" />
              ) : (
                <Ionicons name="restaurant" size={18} color="#EA580C" />
              )}
            </View>

            <View style={styles.activityTextCol}>
              <Text style={styles.activityTitle}>{act.title}</Text>
              <View style={styles.activitySubRow}>
                <Ionicons name="time-outline" size={12} color="#9CA3AF" />
                <Text style={styles.activityTime}>{act.time}</Text>
              </View>
            </View>

            <View style={styles.activityRightCol}>
              <Text style={styles.activityBank}>{act.payoutAccount}</Text>
              <View style={styles.completedPill}>
                <Text style={styles.completedPillText}>{act.status}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* 9. Driver Actions & Sign Out */}
      <View style={styles.actionsCard}>
        <TouchableOpacity
          style={styles.actionRow}
          onPress={() => Alert.alert('Documents', 'Driver License & Insurance are active and verified until Dec 2027.')}
          activeOpacity={0.8}
        >
          <View style={[styles.actionIconCircle, { backgroundColor: '#F0FDF4' }]}>
            <Ionicons name="document-text-outline" size={18} color="#16A34A" />
          </View>
          <Text style={styles.actionLabel}>Documents & Insurance</Text>
          <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
        </TouchableOpacity>

        <View style={styles.actionDivider} />

        <TouchableOpacity
          style={styles.actionRow}
          onPress={() => Alert.alert('Tax & 1099', '2026 Year-to-Date tax statement generated.')}
          activeOpacity={0.8}
        >
          <View style={[styles.actionIconCircle, { backgroundColor: '#EEF2FF' }]}>
            <Ionicons name="receipt-outline" size={18} color="#3122D2" />
          </View>
          <Text style={styles.actionLabel}>Tax & 1099 Earnings</Text>
          <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
        </TouchableOpacity>

        <View style={styles.actionDivider} />

        <TouchableOpacity
          style={styles.actionRow}
          onPress={onSignOut}
          activeOpacity={0.8}
        >
          <View style={[styles.actionIconCircle, { backgroundColor: '#FEF2F2' }]}>
            <Ionicons name="log-out-outline" size={18} color="#EF4444" />
          </View>
          <Text style={[styles.actionLabel, { color: '#EF4444' }]}>Log Out</Text>
          <Ionicons name="chevron-forward" size={16} color="#EF4444" />
        </TouchableOpacity>
      </View>

      {/* Payout Edit Modal */}
      <Modal
        visible={payoutModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPayoutModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Payout Account</Text>
            <Text style={styles.modalSub}>
              Enter your banking details for direct instant driver payouts.
            </Text>

            <Text style={styles.inputLabel}>Bank Name</Text>
            <TextInput
              style={styles.modalInput}
              value={bankName}
              onChangeText={setBankName}
              placeholder="e.g. Chase, Wells Fargo"
            />

            <Text style={styles.inputLabel}>Account Number</Text>
            <TextInput
              style={styles.modalInput}
              value={accountNumber}
              onChangeText={setAccountNumber}
              placeholder="•••• 4455"
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setPayoutModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={handleSavePayout}
              >
                <Text style={styles.modalSaveText}>Save Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  // 1. Status Card
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  statusTextCol: {
    flex: 1,
  },
  driverNameHeading: {
    fontFamily: 'JakartaBold',
    fontSize: 18,
    color: '#0B1528',
    marginBottom: 4,
  },
  statusIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusLabel: {
    fontFamily: 'JakartaMedium',
    fontSize: 13,
    color: '#6B7280',
  },
  switch: {
    transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }],
  },

  // 2. Profile Card
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: '#C3D9FF',
  },
  verifiedDriverBadge: {
    position: 'absolute',
    top: -4,
    right: -24,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#065F46',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  verifiedDriverText: {
    fontFamily: 'JakartaBold',
    fontSize: 10,
    color: '#FFFFFF',
  },
  profileName: {
    fontFamily: 'JakartaBold',
    fontSize: 20,
    color: '#0B1528',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingValue: {
    fontFamily: 'JakartaBold',
    fontSize: 14,
    color: '#0B1528',
  },

  // 3. Vehicle Card
  vehicleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  vehicleHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  vehicleIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  vehicleTextCol: {
    flex: 1,
  },
  vehicleTitle: {
    fontFamily: 'JakartaBold',
    fontSize: 15,
    color: '#0B1528',
  },
  vehicleSubtitle: {
    fontFamily: 'JakartaMedium',
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  licensePlateBadge: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  licensePlateText: {
    fontFamily: 'JakartaBold',
    fontSize: 12,
    color: '#1F2937',
    letterSpacing: 0.5,
  },
  vehicleImageFrame: {
    width: '100%',
    height: 140,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  vehicleImage: {
    width: '100%',
    height: '100%',
  },

  // 4. Payout Account Card
  payoutCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#3122D2',
    shadowColor: '#3122D2',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  payoutTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  payoutHeaderLabel: {
    fontFamily: 'JakartaBold',
    fontSize: 11,
    color: '#6366F1',
    letterSpacing: 0.8,
  },
  payoutEditBtn: {
    padding: 4,
  },
  payoutDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bankIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  bankTextCol: {
    flex: 1,
  },
  bankName: {
    fontFamily: 'JakartaBold',
    fontSize: 16,
    color: '#0B1528',
  },
  bankAccount: {
    fontFamily: 'JakartaMedium',
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  directDepositPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  directDepositText: {
    fontFamily: 'JakartaBold',
    fontSize: 11,
    color: '#059669',
    marginLeft: 4,
  },

  // 5. Stats Quad
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  statIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statLabel: {
    fontFamily: 'JakartaMedium',
    fontSize: 12,
    color: '#6B7280',
  },
  statNumber: {
    fontFamily: 'JakartaBold',
    fontSize: 22,
    color: '#0B1528',
    marginTop: 2,
  },

  // 6. Acceptance Card
  acceptanceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  acceptanceTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  acceptanceIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#CCFBF1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptanceLabel: {
    fontFamily: 'JakartaMedium',
    fontSize: 12,
    color: '#6B7280',
  },
  acceptanceValue: {
    fontFamily: 'JakartaBold',
    fontSize: 18,
    color: '#0B1528',
    marginTop: 2,
  },
  progressBarTrack: {
    width: 80,
    height: 10,
    backgroundColor: '#E0F2FE',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#0D9488',
    borderRadius: 5,
  },

  // 7. Safety Performance Card
  safetyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  safetyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  safetyTitle: {
    fontFamily: 'JakartaBold',
    fontSize: 14,
    color: '#0B1528',
    marginLeft: 8,
  },
  safetyMetricsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  safetyMetricBox: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  safetyMetricLabel: {
    fontFamily: 'JakartaBold',
    fontSize: 10,
    color: '#6B7280',
    letterSpacing: 0.5,
  },
  safetyMetricValueDark: {
    fontFamily: 'JakartaBold',
    fontSize: 20,
    color: '#0B1528',
    marginTop: 4,
  },
  safetyMetricValueRed: {
    fontFamily: 'JakartaBold',
    fontSize: 20,
    color: '#EF4444',
    marginTop: 4,
  },

  // 8. Recent Activity
  activitySection: {
    marginBottom: 16,
  },
  activityHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  activitySectionTitle: {
    fontFamily: 'JakartaBold',
    fontSize: 15,
    color: '#0B1528',
  },
  viewAllText: {
    fontFamily: 'JakartaBold',
    fontSize: 12,
    color: '#3122D2',
  },
  activityItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  activityIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityTextCol: {
    flex: 1,
  },
  activityTitle: {
    fontFamily: 'JakartaBold',
    fontSize: 14,
    color: '#0B1528',
  },
  activitySubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  activityTime: {
    fontFamily: 'JakartaMedium',
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  activityRightCol: {
    alignItems: 'flex-end',
  },
  activityBank: {
    fontFamily: 'JakartaBold',
    fontSize: 13,
    color: '#0B1528',
    marginBottom: 4,
  },
  completedPill: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  completedPillText: {
    fontFamily: 'JakartaBold',
    fontSize: 10,
    color: '#4B5563',
    letterSpacing: 0.4,
  },

  // 9. Actions Card
  actionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    minHeight: 48,
  },
  actionIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  actionLabel: {
    flex: 1,
    fontFamily: 'JakartaSemiBold',
    fontSize: 14,
    color: '#1F2937',
  },
  actionDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 12,
  },

  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  modalTitle: {
    fontFamily: 'JakartaBold',
    fontSize: 18,
    color: '#0B1528',
    marginBottom: 4,
  },
  modalSub: {
    fontFamily: 'JakartaMedium',
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 16,
  },
  inputLabel: {
    fontFamily: 'JakartaBold',
    fontSize: 12,
    color: '#374151',
    marginBottom: 6,
  },
  modalInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontFamily: 'JakartaMedium',
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 14,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  modalCancelText: {
    fontFamily: 'JakartaSemiBold',
    fontSize: 14,
    color: '#4B5563',
  },
  modalSaveBtn: {
    flex: 1,
    backgroundColor: '#0286FF',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalSaveText: {
    fontFamily: 'JakartaBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
});
