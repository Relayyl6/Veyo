import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

interface AnalyticsModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function AnalyticsModal({
  visible,
  onClose,
}: AnalyticsModalProps) {
  const [selectedRange, setSelectedRange] = useState<'7' | '14' | '28' | '30'>('7');

  const RANGES = ['7', '14', '28', '30'] as const;

  const BARS = [
    { day: 'Mon', comm: 20, net: 60 },
    { day: 'Tue', comm: 30, net: 75 },
    { day: 'Wed', comm: 25, net: 80 },
    { day: 'Thu', comm: 45, net: 100 },
    { day: 'Fri', comm: 15, net: 40 },
    { day: 'Sat', comm: 20, net: 50 },
    { day: 'Sun', comm: 10, net: 30 },
  ];

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
          <Text style={styles.headerTitle}>Analytics</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Your performance at a glance</Text>

          {/* Time Filter Pills */}
          <View style={styles.timeFilterRow}>
            {RANGES.map((r) => {
              const active = selectedRange === r;
              return (
                <TouchableOpacity
                  key={r}
                  style={[styles.rangePill, active && styles.rangePillActive]}
                  onPress={() => setSelectedRange(r)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.rangeText, active && styles.rangeTextActive]}>
                    {r} days
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Metric Quad Grid */}
          <View style={styles.metricsGrid}>
            {/* Total Earnings */}
            <View style={[styles.metricCard, { backgroundColor: '#3122D2' }]}>
              <Text style={styles.metricLabelLight}>Total Earnings</Text>
              <Text style={styles.metricValueLight}>₦142,500</Text>
              <Text style={styles.metricSubLight}>+12.5% this week</Text>
            </View>

            {/* Number of Trips */}
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Number of Trips</Text>
              <Text style={styles.metricValue}>42</Text>
              <Text style={styles.metricSub}>3.7% this week</Text>
            </View>

            {/* Total Time Online */}
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Total Time Online</Text>
              <Text style={styles.metricValue}>18h 30m</Text>
              <Text style={styles.metricSub}>2.1h this week</Text>
            </View>

            {/* Driver Rating */}
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Driver Rating</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <FontAwesome name="star" size={14} color="#D97706" />
                <Text style={styles.metricValue}>4.92</Text>
              </View>
              <Text style={styles.metricSub}>Top 5%</Text>
            </View>
          </View>

          {/* Earning Analytics Chart */}
          <View style={styles.chartContainer}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Earning Analytics</Text>
              <TouchableOpacity>
                <Ionicons name="ellipsis-horizontal" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            {/* Stacked Bar Canvas */}
            <View style={styles.chartCanvas}>
              {BARS.map((item) => (
                <View key={item.day} style={styles.chartBarCol}>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barCommission,
                        { height: `${item.comm}%` },
                      ]}
                    />
                    <View
                      style={[
                        styles.barNet,
                        { height: `${item.net}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.dayLabel}>{item.day}</Text>
                </View>
              ))}
            </View>

            {/* Chart Legend */}
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#C7D2FE' }]} />
                <Text style={styles.legendText}>Veyo's Commission</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#3122D2' }]} />
                <Text style={styles.legendText}>Net Earnings</Text>
              </View>
            </View>
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
  title: {
    fontFamily: 'JakartaBold',
    fontSize: 14,
    color: '#858585',
    marginBottom: 14,
  },
  timeFilterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  rangePill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
  },
  rangePillActive: {
    backgroundColor: '#3122D2',
  },
  rangeText: {
    fontFamily: 'JakartaBold',
    fontSize: 11,
    color: '#4B5563',
  },
  rangeTextActive: {
    color: '#FFFFFF',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#F9FAFB',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  metricLabel: {
    fontFamily: 'JakartaMedium',
    fontSize: 11,
    color: '#858585',
    marginBottom: 4,
  },
  metricValue: {
    fontFamily: 'JakartaBold',
    fontSize: 16,
    color: '#0B1528',
    marginBottom: 4,
  },
  metricSub: {
    fontFamily: 'JakartaMedium',
    fontSize: 10,
    color: '#059669',
  },
  metricLabelLight: {
    fontFamily: 'JakartaMedium',
    fontSize: 11,
    color: '#C7D2FE',
    marginBottom: 4,
  },
  metricValueLight: {
    fontFamily: 'JakartaBold',
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  metricSubLight: {
    fontFamily: 'JakartaMedium',
    fontSize: 10,
    color: '#93C5FD',
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    fontFamily: 'JakartaBold',
    fontSize: 14,
    color: '#0B1528',
  },
  chartCanvas: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 140,
    paddingHorizontal: 8,
    marginBottom: 14,
  },
  chartBarCol: {
    alignItems: 'center',
    flex: 1,
  },
  barTrack: {
    width: 14,
    height: 110,
    backgroundColor: '#F3F4F6',
    borderRadius: 7,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barCommission: {
    width: '100%',
    backgroundColor: '#C7D2FE',
  },
  barNet: {
    width: '100%',
    backgroundColor: '#3122D2',
    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,
  },
  dayLabel: {
    fontFamily: 'JakartaMedium',
    fontSize: 9,
    color: '#9CA3AF',
    marginTop: 6,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontFamily: 'JakartaMedium',
    fontSize: 10,
    color: '#6B7280',
  },
});
