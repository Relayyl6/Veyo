import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';

interface WalletBalanceCardProps {
  balance?: string;
  savedAmount?: string;
  lastTransaction?: string;
  onTopUpPress?: () => void;
  onSendPress?: () => void;
  onHistoryPress?: () => void;
  style?: object;
}

export default function WalletBalanceCard({
  balance = '₦84,200.50',
  savedAmount = 'SAVED ₦4,250',
  lastTransaction = 'Last: Dharma Coffee - ₦5,900',
  onTopUpPress,
  onSendPress,
  onHistoryPress,
  style,
}: WalletBalanceCardProps) {
  return (
    <View style={[styles.container, style]}>
      {/* Top Row: Available Balance Label + Saved Pill */}
      <View style={styles.topRow}>
        <Text style={styles.label}>AVAILABLE BALANCE</Text>
        <View style={styles.savedPill}>
          <Text style={styles.savedPillText}>{savedAmount}</Text>
        </View>
      </View>

      {/* Main Balance Display */}
      <Text style={styles.balanceText}>{balance}</Text>

      {/* Action Buttons: Top Up & Send */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.actionButton, styles.topUpButton]}
          activeOpacity={0.85}
          onPress={onTopUpPress}
        >
          <Feather name="plus" size={16} color="#FFFFFF" />
          <Text style={styles.topUpButtonText}>Top Up</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.sendButton]}
          activeOpacity={0.85}
          onPress={onSendPress}
        >
          <Ionicons name="paper-plane-outline" size={15} color="#3122D2" />
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Activity Footer */}
      <View style={styles.footerRow}>
        <View style={styles.footerLeft}>
          <Ionicons name="time-outline" size={13} color="#858585" />
          <Text style={styles.footerText} numberOfLines={1}>
            {lastTransaction}
          </Text>
        </View>

        <TouchableOpacity
          onPress={onHistoryPress}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.historyLink}>History &gt;</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontFamily: 'JakartaBold',
    fontSize: 10,
    color: '#858585',
    letterSpacing: 0.5,
  },
  savedPill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  savedPillText: {
    fontFamily: 'JakartaBold',
    fontSize: 9,
    color: '#059669',
    letterSpacing: 0.5,
  },
  balanceText: {
    fontFamily: 'JakartaExtraBold',
    fontSize: 28,
    color: '#0B1528',
    marginBottom: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    gap: 6,
  },
  topUpButton: {
    backgroundColor: '#3122D2',
  },
  topUpButtonText: {
    fontFamily: 'JakartaBold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  sendButton: {
    backgroundColor: '#EEF2FF',
  },
  sendButtonText: {
    fontFamily: 'JakartaBold',
    fontSize: 13,
    color: '#3122D2',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flex: 1,
    marginRight: 8,
  },
  footerText: {
    fontFamily: 'JakartaMedium',
    fontSize: 11,
    color: '#6B7280',
    flex: 1,
  },
  historyLink: {
    fontFamily: 'JakartaBold',
    fontSize: 11,
    color: '#3122D2',
  },
});
