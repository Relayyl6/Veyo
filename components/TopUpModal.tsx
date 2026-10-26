import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

interface TopUpModalProps {
  visible: boolean;
  currentBalance?: string;
  onClose: () => void;
}

export default function TopUpModal({
  visible,
  currentBalance = '₦42,500.00',
  onClose,
}: TopUpModalProps) {
  const copyToClipboard = (label: string, value: string) => {
    Alert.alert('Copied!', `${label} (${value}) copied to clipboard.`);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.headerBtn}>
            <Ionicons name="arrow-back" size={20} color="#0B1528" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Top Up</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.heroTitle}>Fund Your Wallet</Text>
          <Text style={styles.heroSub}>
            Transfer funds to the account details below to instantly top up your Veyo Wallet.
          </Text>

          {/* Current Balance Box */}
          <View style={styles.balancePill}>
            <View style={styles.balanceIconCircle}>
              <Ionicons name="wallet-outline" size={14} color="#3122D2" />
            </View>
            <View>
              <Text style={styles.balanceLabel}>CURRENT BALANCE</Text>
              <Text style={styles.balanceAmount}>{currentBalance}</Text>
            </View>
          </View>

          {/* Bank Transfer Details Card */}
          <View style={styles.bankCard}>
            <View style={styles.bankHeaderRow}>
              <Ionicons name="business-outline" size={16} color="#3122D2" />
              <Text style={styles.bankSectionTitle}>Bank Transfer Details</Text>
            </View>

            {/* Field 1: Bank Name */}
            <View style={styles.detailRow}>
              <View>
                <Text style={styles.detailLabel}>Bank Name</Text>
                <Text style={styles.detailValue}>Veyo Microfinance Bank</Text>
              </View>
              <TouchableOpacity
                onPress={() => copyToClipboard('Bank Name', 'Veyo Microfinance Bank')}
                style={styles.copyBtn}
              >
                <Feather name="copy" size={15} color="#3122D2" />
              </TouchableOpacity>
            </View>

            {/* Field 2: Account Number */}
            <View style={styles.detailRow}>
              <View>
                <Text style={styles.detailLabel}>Account Number</Text>
                <Text style={[styles.detailValue, styles.accountNumberHighlight]}>
                  812 345 6789
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => copyToClipboard('Account Number', '8123456789')}
                style={styles.copyBtn}
              >
                <Feather name="copy" size={15} color="#3122D2" />
              </TouchableOpacity>
            </View>

            {/* Field 3: Account Name */}
            <View style={styles.detailRow}>
              <View>
                <Text style={styles.detailLabel}>Account Name</Text>
                <Text style={styles.detailValue}>John Doe - Veyo</Text>
              </View>
              <TouchableOpacity
                onPress={() => copyToClipboard('Account Name', 'John Doe - Veyo')}
                style={styles.copyBtn}
              >
                <Feather name="copy" size={15} color="#3122D2" />
              </TouchableOpacity>
            </View>

            {/* Transfer Note */}
            <View style={styles.noteBox}>
              <Ionicons name="information-circle-outline" size={15} color="#0D9488" />
              <Text style={styles.noteText}>
                Transfers to this account are usually credited within 1–3 minutes.
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Footer Actions */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.shareBtn}
            activeOpacity={0.88}
            onPress={() => copyToClipboard('Account Details', 'Veyo MFB 8123456789')}
          >
            <Ionicons name="share-social-outline" size={16} color="#FFFFFF" />
            <Text style={styles.shareBtnText}>Share Details</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.troubleBtn} activeOpacity={0.8}>
            <Ionicons name="help-circle-outline" size={14} color="#6B7280" />
            <Text style={styles.troubleText}>Having trouble?</Text>
          </TouchableOpacity>
        </View>
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  heroTitle: {
    fontFamily: 'JakartaExtraBold',
    fontSize: 22,
    color: '#0B1528',
    marginBottom: 6,
  },
  heroSub: {
    fontFamily: 'JakartaMedium',
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 20,
  },
  balancePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderRadius: 16,
    padding: 12,
    gap: 12,
    marginBottom: 20,
  },
  balanceIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceLabel: {
    fontFamily: 'JakartaBold',
    fontSize: 9,
    color: '#3122D2',
    letterSpacing: 0.5,
  },
  balanceAmount: {
    fontFamily: 'JakartaBold',
    fontSize: 15,
    color: '#0B1528',
  },
  bankCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  bankHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  bankSectionTitle: {
    fontFamily: 'JakartaBold',
    fontSize: 14,
    color: '#0B1528',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailLabel: {
    fontFamily: 'JakartaMedium',
    fontSize: 11,
    color: '#858585',
    marginBottom: 2,
  },
  detailValue: {
    fontFamily: 'JakartaBold',
    fontSize: 14,
    color: '#0B1528',
  },
  accountNumberHighlight: {
    fontSize: 18,
    color: '#3122D2',
  },
  copyBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#CCFBF1',
    borderRadius: 12,
    padding: 10,
    marginTop: 14,
  },
  noteText: {
    fontFamily: 'JakartaMedium',
    fontSize: 11,
    color: '#0D9488',
    flex: 1,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    alignItems: 'center',
    gap: 12,
  },
  shareBtn: {
    backgroundColor: '#3122D2',
    borderRadius: 16,
    paddingVertical: 14,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  shareBtnText: {
    fontFamily: 'JakartaBold',
    fontSize: 15,
    color: '#FFFFFF',
  },
  troubleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  troubleText: {
    fontFamily: 'JakartaMedium',
    fontSize: 12,
    color: '#6B7280',
  },
});
