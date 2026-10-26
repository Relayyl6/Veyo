import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUser } from '@clerk/expo';
import { Ionicons, Feather, FontAwesome5 } from '@expo/vector-icons';
import Header from '@/components/Header';
import { images } from '@/constants/utils';

// Reusable Wallet Components
import WalletBalanceCard from '@/components/WalletBalanceCard';
import StudentBudgetCard from '@/components/StudentBudgetCard';
import SpendingChart from '@/components/SpendingChart';
import SendMoneyModal from '@/components/SendMoneyModal';
import TopUpModal from '@/components/TopUpModal';
import AnalyticsModal from '@/components/AnalyticsModal';
import TransactionHistoryModal from '@/components/TransactionHistoryModal';

export default function WalletScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useUser();

  // Modals state
  const [sendModalVisible, setSendModalVisible] = useState(false);
  const [topUpModalVisible, setTopUpModalVisible] = useState(false);
  const [analyticsModalVisible, setAnalyticsModalVisible] = useState(false);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);

  // Dynamic balance state
  const [balance, setBalance] = useState('₦84,200.50');

  const handleSendSuccess = (amount: number, recipient: string) => {
    // Deduct from local balance
    const currentNum = 84200.5;
    const nextNum = Math.max(0, currentNum - amount);
    setBalance(`₦${nextNum.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* 1. Blurred Absolute Header */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          paddingTop: insets.top,
          paddingBottom: 10,
          backgroundColor: 'transparent',
        }}
      >
        <Header
          name={user?.firstName as string | undefined}
          first={user?.firstName as string | undefined}
          image={images.logohor}
          onNotificationPress={() => setAnalyticsModalVisible(true)}
        />
      </View>

      {/* 2. Scrollable Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 70,
          paddingBottom: insets.bottom + 90, // Tab bar clearance
          paddingHorizontal: 16,
          gap: 16,
        }}
      >
        {/* Available Balance Card */}
        <WalletBalanceCard
          balance={balance}
          savedAmount="SAVED ₦4,250"
          lastTransaction="Last: Dharma Coffee - ₦5,900"
          onTopUpPress={() => setTopUpModalVisible(true)}
          onSendPress={() => setSendModalVisible(true)}
          onHistoryPress={() => setHistoryModalVisible(true)}
        />

        {/* Student Mode Card */}
        <StudentBudgetCard
          monthlyLimit="₦20,000"
          spentAmount="₦13,400"
          remainingAmount="₦6,600"
          spentPercent={67}
          onToggle={(active) =>
            Alert.alert(
              'Student Transport Mode',
              active ? 'Budget protection active. Ride discounts applied!' : 'Student mode deactivated.'
            )
          }
        />

        {/* Promo & Split Bill Row */}
        <View style={styles.promoSplitRow}>
          {/* Promo Card */}
          <TouchableOpacity
            style={styles.promoCard}
            activeOpacity={0.85}
            onPress={() => Alert.alert('Promo Applied', '10% off your next 3 food orders!')}
          >
            <Text style={styles.promoSubLabel}>VEYO PLUS</Text>
            <Text style={styles.promoHeading}>PROMO</Text>
            <Text style={styles.promoDescription}>Get 10% off all food orders</Text>
          </TouchableOpacity>

          {/* Split Bill Card */}
          <TouchableOpacity
            style={styles.splitCard}
            activeOpacity={0.85}
            onPress={() => Alert.alert('Split Bill', 'Select ride or food order to split with contacts.')}
          >
            <Text style={styles.splitSubLabel}>SPLIT BILL</Text>
            <View style={styles.startGroupBtn}>
              <Text style={styles.startGroupText}>Start Group</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Spending Hub Weekly Bar Chart */}
        <SpendingChart
          selectedDay="Thu"
          onSelectDay={(d) => console.log('Selected day:', d.day)}
        />

        {/* Vouchers & Credits */}
        <View style={styles.vouchersCard}>
          <Text style={styles.vouchersTitle}>Vouchers & Credits</Text>
          <View style={styles.voucherItem}>
            <View style={styles.voucherIconCircle}>
              <FontAwesome5 name="car" size={14} color="#3122D2" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.voucherName}>Ride Credits</Text>
              <Text style={styles.voucherBalance}>₦1,500 Available</Text>
            </View>
            <TouchableOpacity
              style={styles.useCreditBtn}
              activeOpacity={0.8}
              onPress={() => Alert.alert('Ride Credits', '₦1,500 will be auto-deducted on your next ride.')}
            >
              <Text style={styles.useCreditText}>Use</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Auxiliary Modals */}
      <SendMoneyModal
        visible={sendModalVisible}
        onClose={() => setSendModalVisible(false)}
        onSuccess={handleSendSuccess}
      />

      <TopUpModal
        visible={topUpModalVisible}
        currentBalance={balance}
        onClose={() => setTopUpModalVisible(false)}
      />

      <AnalyticsModal
        visible={analyticsModalVisible}
        onClose={() => setAnalyticsModalVisible(false)}
      />

      <TransactionHistoryModal
        visible={historyModalVisible}
        onClose={() => setHistoryModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F8FA',
  },
  promoSplitRow: {
    flexDirection: 'row',
    gap: 12,
  },
  promoCard: {
    flex: 1.1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  promoSubLabel: {
    fontFamily: 'JakartaBold',
    fontSize: 9,
    color: '#858585',
    letterSpacing: 0.5,
  },
  promoHeading: {
    fontFamily: 'JakartaExtraBold',
    fontSize: 16,
    color: '#D97706',
    marginVertical: 4,
  },
  promoDescription: {
    fontFamily: 'JakartaMedium',
    fontSize: 11,
    color: '#6B7280',
    lineHeight: 15,
  },
  splitCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    justifyContent: 'space-between',
  },
  splitSubLabel: {
    fontFamily: 'JakartaBold',
    fontSize: 9,
    color: '#858585',
    letterSpacing: 0.5,
  },
  startGroupBtn: {
    backgroundColor: '#3122D2',
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  startGroupText: {
    fontFamily: 'JakartaBold',
    fontSize: 11,
    color: '#FFFFFF',
  },
  vouchersCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  vouchersTitle: {
    fontFamily: 'JakartaBold',
    fontSize: 14,
    color: '#0B1528',
    marginBottom: 12,
  },
  voucherItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  voucherIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voucherName: {
    fontFamily: 'JakartaBold',
    fontSize: 13,
    color: '#0B1528',
  },
  voucherBalance: {
    fontFamily: 'JakartaMedium',
    fontSize: 11,
    color: '#0CC25F',
    marginTop: 1,
  },
  useCreditBtn: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 12,
  },
  useCreditText: {
    fontFamily: 'JakartaBold',
    fontSize: 11,
    color: '#3122D2',
  },
});
