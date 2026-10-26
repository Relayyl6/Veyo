import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SendMoneyModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: (amount: number, recipient: string) => void;
}

const RECENTS = [
  { id: '1', name: 'Sarah', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
  { id: '2', name: 'Pizza Hub', avatar: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&q=80' },
  { id: '3', name: 'Michael', avatar: 'https://randomuser.me/api/portraits/men/46.jpg' },
  { id: '4', name: 'Amara', avatar: 'https://randomuser.me/api/portraits/women/68.jpg' },
];

export default function SendMoneyModal({
  visible,
  onClose,
  onSuccess,
}: SendMoneyModalProps) {
  const [selectedBank, setSelectedBank] = useState('Veyo Microfinance Bank');
  const [accountNumber, setAccountNumber] = useState('0123456789');
  const [amount, setAmount] = useState('50000');
  const [note, setNote] = useState('');

  const addAmount = (increment: number) => {
    const current = Number(amount) || 0;
    setAmount(String(current + increment));
  };

  const handleSend = () => {
    const num = Number(amount);
    if (!num || num <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid transfer amount.');
      return;
    }

    Alert.alert(
      'Confirm Transfer',
      `Send ₦${Number(amount).toLocaleString()} to Chukwudi Eze?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            if (onSuccess) onSuccess(num, 'Chukwudi Eze');
            Alert.alert('Success', `₦${Number(amount).toLocaleString()} sent to Chukwudi Eze!`);
            onClose();
          },
        },
      ]
    );
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

          <Text style={styles.headerTitle}>Send Money</Text>

          <TouchableOpacity style={styles.headerBtn}>
            <Ionicons name="time-outline" size={20} color="#0B1528" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Recents Horizontal Strip */}
          <Text style={styles.sectionLabel}>RECENTS</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recentsRow}
          >
            {RECENTS.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.recentItem}
                activeOpacity={0.8}
                onPress={() => setAccountNumber('0987654321')}
              >
                <Image source={{ uri: item.avatar }} style={styles.recentAvatar} />
                <Text style={styles.recentName} numberOfLines={1}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Recipient Details */}
          <Text style={[styles.sectionLabel, { marginTop: 16 }]}>Recipient Details</Text>

          {/* Select Bank */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Select Bank</Text>
            <TouchableOpacity style={styles.dropdownBox} activeOpacity={0.8}>
              <Text style={styles.dropdownValue}>{selectedBank}</Text>
              <Ionicons name="chevron-down" size={14} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Account Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Account Number</Text>
            <TextInput
              style={styles.textInput}
              keyboardType="number-pad"
              value={accountNumber}
              onChangeText={setAccountNumber}
              placeholder="Enter 10-digit account number"
            />
          </View>

          {/* Verified Beneficiary Card */}
          <View style={styles.verifiedCard}>
            <View style={styles.verifiedAvatarCircle}>
              <Text style={styles.verifiedAvatarText}>C</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={styles.verifiedName}>Chukwudi Eze</Text>
                <Ionicons name="checkmark-circle" size={14} color="#0286FF" />
              </View>
              <Text style={styles.verifiedSub}>Veyo User</Text>
            </View>
          </View>

          {/* Amount to Send */}
          <Text style={[styles.sectionLabel, { marginTop: 20 }]}>AMOUNT TO SEND</Text>
          <View style={styles.amountDisplayRow}>
            <Text style={styles.currencyPrefix}>₦</Text>
            <TextInput
              style={styles.amountInput}
              keyboardType="number-pad"
              value={amount}
              onChangeText={setAmount}
            />
          </View>

          {/* Quick Increment Chips */}
          <View style={styles.chipsRow}>
            {[10000, 50000, 100000].map((inc) => (
              <TouchableOpacity
                key={inc}
                style={styles.chipButton}
                activeOpacity={0.8}
                onPress={() => addAmount(inc)}
              >
                <Text style={styles.chipText}>+{inc / 1000}k</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Reason for Payment */}
          <View style={[styles.inputGroup, { marginTop: 16 }]}>
            <Text style={styles.inputLabel}>Reason for payment (Optional)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g., Dinner last night"
              placeholderTextColor="#9CA3AF"
              value={note}
              onChangeText={setNote}
            />
          </View>
        </ScrollView>

        {/* Send Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.sendButton}
            activeOpacity={0.88}
            onPress={handleSend}
          >
            <Text style={styles.sendButtonText}>Send Money</Text>
            <Ionicons name="paper-plane" size={16} color="#FFFFFF" />
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
    padding: 16,
  },
  sectionLabel: {
    fontFamily: 'JakartaBold',
    fontSize: 10,
    color: '#858585',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  recentsRow: {
    flexDirection: 'row',
    gap: 14,
    paddingVertical: 6,
  },
  recentItem: {
    alignItems: 'center',
    width: 56,
  },
  recentAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 4,
  },
  recentName: {
    fontFamily: 'JakartaMedium',
    fontSize: 11,
    color: '#4B5563',
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontFamily: 'JakartaMedium',
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 4,
  },
  dropdownBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  dropdownValue: {
    fontFamily: 'JakartaMedium',
    fontSize: 13,
    color: '#0B1528',
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    fontFamily: 'JakartaMedium',
    fontSize: 13,
    color: '#0B1528',
  },
  verifiedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F8FF',
    borderRadius: 16,
    padding: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#C3D9FF',
    marginVertical: 4,
  },
  verifiedAvatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3122D2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedAvatarText: {
    fontFamily: 'JakartaBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  verifiedName: {
    fontFamily: 'JakartaBold',
    fontSize: 13,
    color: '#0B1528',
  },
  verifiedSub: {
    fontFamily: 'JakartaMedium',
    fontSize: 11,
    color: '#858585',
  },
  amountDisplayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    gap: 6,
  },
  currencyPrefix: {
    fontFamily: 'JakartaExtraBold',
    fontSize: 32,
    color: '#3122D2',
  },
  amountInput: {
    fontFamily: 'JakartaExtraBold',
    fontSize: 36,
    color: '#0B1528',
    minWidth: 120,
    textAlign: 'center',
  },
  chipsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 8,
  },
  chipButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 12,
  },
  chipText: {
    fontFamily: 'JakartaBold',
    fontSize: 12,
    color: '#4B5563',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  sendButton: {
    backgroundColor: '#3122D2',
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  sendButtonText: {
    fontFamily: 'JakartaBold',
    fontSize: 15,
    color: '#FFFFFF',
  },
});
