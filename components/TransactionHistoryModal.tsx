import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons, Feather, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

interface TransactionHistoryModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function TransactionHistoryModal({
  visible,
  onClose,
}: TransactionHistoryModalProps) {
  const [activeSegment, setActiveSegment] = useState<'History' | 'Ongoing' | 'Scheduled'>('History');
  const [activeFilter, setActiveFilter] = useState('All');

  const FILTERS = ['All', 'Food', 'Car', 'Ride', 'Pay'];

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
          <Text style={styles.headerTitle}>Transaction History</Text>
          <TouchableOpacity style={styles.headerBtn}>
            <Ionicons name="notifications-outline" size={20} color="#0B1528" />
          </TouchableOpacity>
        </View>

        {/* 1. Segments: History | Ongoing | Scheduled */}
        <View style={styles.segmentTrack}>
          {(['History', 'Ongoing', 'Scheduled'] as const).map((seg) => {
            const isActive = activeSegment === seg;
            return (
              <TouchableOpacity
                key={seg}
                style={[styles.segmentBtn, isActive && styles.segmentBtnActive]}
                onPress={() => setActiveSegment(seg)}
                activeOpacity={0.8}
              >
                <Text style={[styles.segmentText, isActive && styles.segmentTextActive]}>
                  {seg}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 2. Horizontal Filter Chips */}
        <View style={styles.chipsRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
            {FILTERS.map((cat) => {
              const isActive = activeFilter === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[styles.filterChip, isActive && styles.filterChipActive]}
                  onPress={() => setActiveFilter(cat)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Promo Card: Pay Transactions */}
          <View style={styles.promoCard}>
            <View style={styles.promoIconCircle}>
              <Ionicons name="card-outline" size={16} color="#3122D2" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.promoTitle}>Pay Transactions</Text>
              <Text style={styles.promoSub}>Enjoy extra benefits in your trip</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </View>

          {/* Group 1: Today */}
          <Text style={styles.groupHeading}>Today</Text>

          {/* Item 1: Dharma Coffee */}
          <View style={styles.txCard}>
            <View style={[styles.txIconCircle, { backgroundColor: '#EEF2FF' }]}>
              <Ionicons name="cafe" size={16} color="#3122D2" />
            </View>
            <View style={styles.txMiddle}>
              <Text style={styles.txTitle}>Dharma Coffee, Ubud</Text>
              <Text style={styles.txTime}>Delivered • 3:39 PM</Text>
              <View style={styles.ratingRow}>
                <Text style={styles.ratedText}>You rated this</Text>
                <Ionicons name="star" size={10} color="#D97706" />
                <Text style={styles.ratedNumber}>4.2</Text>
              </View>
            </View>
            <Text style={styles.txAmount}>₦5,900</Text>
          </View>

          {/* Item 2: Outpost Ubud Living */}
          <View style={styles.txCard}>
            <View style={[styles.txIconCircle, { backgroundColor: '#F0FDF4' }]}>
              <FontAwesome5 name="car" size={14} color="#0CC25F" />
            </View>
            <View style={styles.txMiddle}>
              <Text style={styles.txTitle}>Outpost Ubud Living</Text>
              <Text style={styles.txTime}>Completed • 1:49 PM</Text>
              <View style={styles.ratingRow}>
                <Text style={styles.ratedText}>You rated this</Text>
                <Ionicons name="star" size={10} color="#D97706" />
                <Text style={styles.ratedNumber}>4.8</Text>
              </View>
            </View>
            <Text style={styles.txAmount}>₦3,200</Text>
          </View>

          {/* Group 2: Yesterday, 12 Feb 2024 */}
          <Text style={[styles.groupHeading, { marginTop: 20 }]}>Yesterday, 12 Feb 2024</Text>

          {/* Item 3: Transfer to Bank */}
          <View style={styles.txCard}>
            <View style={[styles.txIconCircle, { backgroundColor: '#FEF2F2' }]}>
              <Ionicons name="arrow-up" size={16} color="#EF4444" />
            </View>
            <View style={styles.txMiddle}>
              <Text style={styles.txTitle}>Transfer to Bank</Text>
              <Text style={styles.txTime}>Processing • 10:15 AM</Text>
              <Text style={styles.txBankDetails}>GTBank ****456</Text>
            </View>
            <Text style={[styles.txAmount, { color: '#EF4444' }]}>-₦15,000</Text>
          </View>
        </ScrollView>
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
  segmentTrack: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderRadius: 14,
    marginHorizontal: 16,
    padding: 3,
    marginBottom: 12,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 11,
  },
  segmentBtnActive: {
    backgroundColor: '#1E293B',
  },
  segmentText: {
    fontFamily: 'JakartaMedium',
    fontSize: 12,
    color: '#94A3B8',
  },
  segmentTextActive: {
    fontFamily: 'JakartaBold',
    color: '#FFFFFF',
  },
  chipsRow: {
    marginBottom: 10,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  filterChipActive: {
    backgroundColor: '#3122D2',
  },
  filterChipText: {
    fontFamily: 'JakartaMedium',
    fontSize: 11,
    color: '#4B5563',
  },
  filterChipTextActive: {
    fontFamily: 'JakartaBold',
    color: '#FFFFFF',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  promoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F8FF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#C3D9FF',
    gap: 12,
    marginBottom: 20,
  },
  promoIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoTitle: {
    fontFamily: 'JakartaBold',
    fontSize: 13,
    color: '#0B1528',
  },
  promoSub: {
    fontFamily: 'JakartaMedium',
    fontSize: 10,
    color: '#6B7280',
    marginTop: 1,
  },
  groupHeading: {
    fontFamily: 'JakartaBold',
    fontSize: 13,
    color: '#0B1528',
    marginBottom: 10,
  },
  txCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    marginBottom: 10,
    gap: 12,
  },
  txIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txMiddle: {
    flex: 1,
  },
  txTitle: {
    fontFamily: 'JakartaBold',
    fontSize: 13,
    color: '#0B1528',
    marginBottom: 2,
  },
  txTime: {
    fontFamily: 'JakartaMedium',
    fontSize: 11,
    color: '#858585',
    marginBottom: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratedText: {
    fontFamily: 'JakartaMedium',
    fontSize: 10,
    color: '#9CA3AF',
  },
  ratedNumber: {
    fontFamily: 'JakartaBold',
    fontSize: 10,
    color: '#D97706',
  },
  txBankDetails: {
    fontFamily: 'JakartaMedium',
    fontSize: 10,
    color: '#9CA3AF',
  },
  txAmount: {
    fontFamily: 'JakartaBold',
    fontSize: 14,
    color: '#0B1528',
  },
});
