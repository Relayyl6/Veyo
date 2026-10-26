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
import { useUserStore } from '@/store/store';
import RoleSwitcherPill from '@/components/RoleSwitcherPill';

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
  const role = useUserStore((state) => state.role);

  // Modals state
  const [sendModalVisible, setSendModalVisible] = useState(false);
  const [topUpModalVisible, setTopUpModalVisible] = useState(false);
  const [analyticsModalVisible, setAnalyticsModalVisible] = useState(false);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);

  // Dynamic balance states
  const [riderBalance, setRiderBalance] = useState('₦84,200.50');
  const [driverBalance, setDriverBalance] = useState(482.3);
  const [merchantBalance, setMerchantBalance] = useState(1061.22);

  const handleSendSuccess = (amount: number, recipient: string) => {
    const currentNum = 84200.5;
    const nextNum = Math.max(0, currentNum - amount);
    setRiderBalance(`₦${nextNum.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
  };

  const handleDriverCashOut = () => {
    Alert.alert(
      'Instant Cash Out',
      `Transfer $${driverBalance.toFixed(2)} to Wells Fargo (•••• 4455)? Funds will arrive in 1-2 minutes.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Cash Out Now',
          onPress: () => {
            Alert.alert('Transfer Initiated', `$${driverBalance.toFixed(2)} is en route to Wells Fargo.`);
            setDriverBalance(0.0);
          },
        },
      ]
    );
  };

  const handleMerchantCashOut = () => {
    Alert.alert(
      'Settlement Transfer',
      `Manual transfer of $${merchantBalance.toFixed(2)} to Wells Fargo Commercial (•••• 4455)?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Initiate Transfer',
          onPress: () => {
            Alert.alert('Transfer Initiated', `$${merchantBalance.toFixed(2)} transferred to settlement account.`);
            setMerchantBalance(0.0);
          },
        },
      ]
    );
  };

  const displayName = role === 'driver' ? 'Sarah Lee' : role === 'vendor_admin' ? 'Pizza Paradise' : (user?.firstName || 'Leonard');

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
          name={displayName}
          first={displayName}
          image={images.logohor}
          onNotificationPress={() => setAnalyticsModalVisible(true)}
        />
      </View>

      {/* 2. Scrollable Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 70,
          paddingBottom: insets.bottom + 90,
          paddingHorizontal: 16,
          gap: 16,
        }}
      >
        {/* Role Switcher */}
        <RoleSwitcherPill />

        {/* Conditional Role View */}
        {role === 'driver' ? (
          /* ================= DRIVER EARNINGS & WELLS FARGO PAYOUT HUB ================= */
          <>
            {/* Driver Balance & Cash Out Card */}
            <View style={styles.driverPayoutCard}>
              <View style={styles.payoutHeaderRow}>
                <Text style={styles.driverPayoutLabel}>AVAILABLE DRIVER BALANCE</Text>
                <View style={styles.directDepositBadge}>
                  <Ionicons name="checkmark-circle" size={12} color="#059669" />
                  <Text style={styles.directDepositBadgeText}>Wells Fargo Active</Text>
                </View>
              </View>

              <Text style={styles.driverPayoutAmount}>${driverBalance.toFixed(2)}</Text>

              <View style={styles.bankDetailRow}>
                <View style={styles.bankCircle}>
                  <FontAwesome5 name="university" size={16} color="#3122D2" />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.bankTitle}>Wells Fargo Checking</Text>
                  <Text style={styles.bankSub}>•••• 4455 • Instant Deposit Eligible</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.cashOutBtn}
                activeOpacity={0.85}
                onPress={handleDriverCashOut}
              >
                <Ionicons name="flash" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.cashOutBtnText}>Instant Cash Out to Wells Fargo</Text>
              </TouchableOpacity>
            </View>

            {/* Weekly Earnings Breakdown */}
            <View style={styles.earningsBreakdownCard}>
              <Text style={styles.cardHeading}>Weekly Earnings Breakdown</Text>
              <Text style={styles.cardSub}>Oct 20 - Oct 26 • Total: $948.50</Text>

              <View style={styles.breakdownRow}>
                <View style={styles.breakdownItem}>
                  <Text style={styles.breakdownValue}>$612.00</Text>
                  <Text style={styles.breakdownLabel}>Base Fares (189)</Text>
                </View>
                <View style={styles.breakdownItem}>
                  <Text style={styles.breakdownValue}>$124.50</Text>
                  <Text style={styles.breakdownLabel}>Tips (100% Yours)</Text>
                </View>
                <View style={styles.breakdownItem}>
                  <Text style={[styles.breakdownValue, { color: '#059669' }]}>+$212.00</Text>
                  <Text style={styles.breakdownLabel}>Peak Surge Boost</Text>
                </View>
              </View>
            </View>

            {/* Driver Cash Out History */}
            <View style={styles.historyCard}>
              <View style={styles.historyHeaderRow}>
                <Text style={styles.cardHeading}>Recent Driver Payouts</Text>
                <TouchableOpacity onPress={() => setHistoryModalVisible(true)}>
                  <Text style={styles.viewAllText}>STATEMENTS</Text>
                </TouchableOpacity>
              </View>

              {[
                { id: 'dp-1', date: 'Oct 24, 2026', amount: '$380.00', status: 'PAID' },
                { id: 'dp-2', date: 'Oct 17, 2026', amount: '$420.50', status: 'PAID' },
                { id: 'dp-3', date: 'Oct 10, 2026', amount: '$395.00', status: 'PAID' },
              ].map((payout) => (
                <View key={payout.id} style={styles.payoutHistoryItem}>
                  <View style={styles.payoutIconCircle}>
                    <FontAwesome5 name="check" size={12} color="#059669" />
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.payoutDateText}>{payout.date}</Text>
                    <Text style={styles.payoutAccountSub}>Direct Deposit • Wells Fargo •••• 4455</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.payoutAmountText}>{payout.amount}</Text>
                    <View style={styles.paidBadge}>
                      <Text style={styles.paidBadgeText}>{payout.status}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </>
        ) : role === 'vendor_admin' ? (
          /* ================= MERCHANT SETTLEMENTS & STORE REVENUE HUB ================= */
          <>
            {/* Merchant Settlement Card */}
            <View style={styles.driverPayoutCard}>
              <View style={styles.payoutHeaderRow}>
                <Text style={styles.driverPayoutLabel}>MERCHANT SETTLEMENT ACCOUNT</Text>
                <View style={styles.directDepositBadge}>
                  <Ionicons name="business" size={12} color="#0286FF" />
                  <Text style={[styles.directDepositBadgeText, { color: '#0286FF' }]}>Auto Weekly Deposit</Text>
                </View>
              </View>

              <Text style={styles.driverPayoutAmount}>${merchantBalance.toFixed(2)}</Text>

              <View style={styles.bankDetailRow}>
                <View style={styles.bankCircle}>
                  <FontAwesome5 name="university" size={16} color="#3122D2" />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.bankTitle}>Wells Fargo Commercial</Text>
                  <Text style={styles.bankSub}>•••• 4455 • Payout scheduled for Tuesday</Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.cashOutBtn, { backgroundColor: '#3122D2' }]}
                activeOpacity={0.85}
                onPress={handleMerchantCashOut}
              >
                <Ionicons name="arrow-down-circle" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.cashOutBtnText}>Transfer Net Sales Now</Text>
              </TouchableOpacity>
            </View>

            {/* Merchant Financial Quad */}
            <View style={styles.earningsBreakdownCard}>
              <Text style={styles.cardHeading}>Weekly Sales & Commission</Text>
              <Text style={styles.cardSub}>Oct 20 - Oct 26 • Gross Sales: $1,248.50</Text>

              <View style={styles.breakdownRow}>
                <View style={styles.breakdownItem}>
                  <Text style={styles.breakdownValue}>$1,248.50</Text>
                  <Text style={styles.breakdownLabel}>Gross Orders</Text>
                </View>
                <View style={styles.breakdownItem}>
                  <Text style={[styles.breakdownValue, { color: '#EF4444' }]}>-$187.28</Text>
                  <Text style={styles.breakdownLabel}>Veyo Fee (15%)</Text>
                </View>
                <View style={styles.breakdownItem}>
                  <Text style={[styles.breakdownValue, { color: '#059669' }]}>$1,061.22</Text>
                  <Text style={styles.breakdownLabel}>Net Settlement</Text>
                </View>
              </View>
            </View>

            {/* Tax & Statements */}
            <View style={styles.historyCard}>
              <TouchableOpacity
                style={styles.taxStatementBtn}
                onPress={() => Alert.alert('Tax Report', '2026 Form 1099-K summary generated.')}
                activeOpacity={0.8}
              >
                <Ionicons name="document-text-outline" size={20} color="#0286FF" />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.taxTitle}>Merchant Tax Documents (1099-K)</Text>
                  <Text style={styles.taxSub}>Download annual sales & deduction summary</Text>
                </View>
                <Ionicons name="download-outline" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </>
        ) : (
          /* ================= CUSTOMER / RIDER WALLET ================= */
          <>
            {/* Available Balance Card */}
            <WalletBalanceCard
              balance={riderBalance}
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

            {/* Spending Chart Component */}
            <SpendingChart
              onSelectDay={() => setAnalyticsModalVisible(true)}
            />

            {/* Vouchers and Promos Carousel */}
            <View style={styles.vouchersCard}>
              <View style={styles.vouchersHeader}>
                <Ionicons name="pricetag" size={16} color="#0286FF" />
                <Text style={styles.vouchersTitle}>Active Promo Codes</Text>
              </View>
              <Text style={styles.vouchersDesc}>
                Use code <Text style={styles.codeHighlight}>STUDENT50</Text> for 50% off next 3 rides.
              </Text>
            </View>
          </>
        )}
      </ScrollView>

      {/* AUXILIARY REUSABLE MODALS */}
      {/* 1. Send Money Modal */}
      <SendMoneyModal
        visible={sendModalVisible}
        onClose={() => setSendModalVisible(false)}
        onSuccess={handleSendSuccess}
      />

      {/* 2. Top-Up Modal */}
      <TopUpModal
        visible={topUpModalVisible}
        currentBalance={riderBalance}
        onClose={() => setTopUpModalVisible(false)}
      />

      {/* 3. Analytics Modal */}
      <AnalyticsModal
        visible={analyticsModalVisible}
        onClose={() => setAnalyticsModalVisible(false)}
      />

      {/* 4. Full Transaction History Modal */}
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
  vouchersCard: {
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
    marginBottom: 10,
  },
  vouchersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  vouchersTitle: {
    fontFamily: 'JakartaBold',
    fontSize: 14,
    color: '#0B1528',
  },
  vouchersDesc: {
    fontFamily: 'JakartaMedium',
    fontSize: 13,
    color: '#858585',
  },
  codeHighlight: {
    fontFamily: 'JakartaBold',
    color: '#0286FF',
  },

  // Driver & Merchant Payout Card
  driverPayoutCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#3122D2',
    shadowColor: '#3122D2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  payoutHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  driverPayoutLabel: {
    fontFamily: 'JakartaBold',
    fontSize: 11,
    color: '#6366F1',
    letterSpacing: 0.8,
  },
  directDepositBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
    gap: 4,
  },
  directDepositBadgeText: {
    fontFamily: 'JakartaBold',
    fontSize: 10,
    color: '#059669',
  },
  driverPayoutAmount: {
    fontFamily: 'JakartaBold',
    fontSize: 32,
    color: '#0B1528',
    marginBottom: 14,
  },
  bankDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
  },
  bankCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bankTitle: {
    fontFamily: 'JakartaBold',
    fontSize: 13,
    color: '#0B1528',
  },
  bankSub: {
    fontFamily: 'JakartaMedium',
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  cashOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0286FF',
    borderRadius: 14,
    paddingVertical: 14,
    shadowColor: '#0286FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  cashOutBtnText: {
    fontFamily: 'JakartaBold',
    fontSize: 14,
    color: '#FFFFFF',
  },

  // Breakdown Card
  earningsBreakdownCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeading: {
    fontFamily: 'JakartaBold',
    fontSize: 15,
    color: '#0B1528',
  },
  cardSub: {
    fontFamily: 'JakartaMedium',
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    marginBottom: 14,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 12,
  },
  breakdownItem: {
    alignItems: 'center',
  },
  breakdownValue: {
    fontFamily: 'JakartaBold',
    fontSize: 16,
    color: '#0B1528',
  },
  breakdownLabel: {
    fontFamily: 'JakartaMedium',
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
  },

  // History Card
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 10,
  },
  historyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  viewAllText: {
    fontFamily: 'JakartaBold',
    fontSize: 11,
    color: '#3122D2',
  },
  payoutHistoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  payoutIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  payoutDateText: {
    fontFamily: 'JakartaBold',
    fontSize: 13,
    color: '#0B1528',
  },
  payoutAccountSub: {
    fontFamily: 'JakartaMedium',
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 1,
  },
  payoutAmountText: {
    fontFamily: 'JakartaBold',
    fontSize: 14,
    color: '#0B1528',
  },
  paidBadge: {
    backgroundColor: '#ECFDF5',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
    marginTop: 2,
  },
  paidBadgeText: {
    fontFamily: 'JakartaBold',
    fontSize: 9,
    color: '#059669',
  },

  taxStatementBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  taxTitle: {
    fontFamily: 'JakartaBold',
    fontSize: 14,
    color: '#0B1528',
  },
  taxSub: {
    fontFamily: 'JakartaMedium',
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
});
