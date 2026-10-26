import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DayData {
  day: string;
  amount: number; // in thousands or units
  heightPercent: number; // 0 to 100
}

const DEFAULT_DAYS: DayData[] = [
  { day: 'Mon', amount: 4.2, heightPercent: 40 },
  { day: 'Tue', amount: 5.8, heightPercent: 55 },
  { day: 'Wed', amount: 3.5, heightPercent: 35 },
  { day: 'Thu', amount: 9.4, heightPercent: 90 },
  { day: 'Fri', amount: 7.2, heightPercent: 70 },
  { day: 'Sat', amount: 6.0, heightPercent: 60 },
  { day: 'Sun', amount: 2.8, heightPercent: 30 },
];

interface SpendingChartProps {
  days?: DayData[];
  selectedDay?: string;
  onSelectDay?: (day: DayData) => void;
  style?: object;
}

export default function SpendingChart({
  days = DEFAULT_DAYS,
  selectedDay = 'Thu',
  onSelectDay,
  style,
}: SpendingChartProps) {
  const [activeDay, setActiveDay] = useState(selectedDay);

  const handleDayPress = (item: DayData) => {
    setActiveDay(item.day);
    if (onSelectDay) onSelectDay(item);
  };

  return (
    <View style={[styles.container, style]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>Spending Hub</Text>
        <TouchableOpacity style={styles.dropdownButton} activeOpacity={0.8}>
          <Text style={styles.dropdownText}>This Week</Text>
          <Ionicons name="chevron-down" size={13} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Chart Canvas */}
      <View style={styles.chartCanvas}>
        {days.map((item) => {
          const isSelected = activeDay === item.day;
          return (
            <TouchableOpacity
              key={item.day}
              style={styles.barColumn}
              activeOpacity={0.85}
              onPress={() => handleDayPress(item)}
            >
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    { height: `${item.heightPercent}%` },
                    isSelected && styles.barFillSelected,
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.dayLabel,
                  isSelected && styles.dayLabelSelected,
                ]}
              >
                {item.day}
              </Text>
            </TouchableOpacity>
          );
        })}
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontFamily: 'JakartaBold',
    fontSize: 15,
    color: '#0B1528',
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  dropdownText: {
    fontFamily: 'JakartaMedium',
    fontSize: 11,
    color: '#4B5563',
  },
  chartCanvas: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    paddingHorizontal: 6,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
  },
  barTrack: {
    width: 22,
    height: 95,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    backgroundColor: '#E0E7FF',
    borderRadius: 8,
  },
  barFillSelected: {
    backgroundColor: '#3122D2',
  },
  dayLabel: {
    fontFamily: 'JakartaMedium',
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 8,
  },
  dayLabelSelected: {
    fontFamily: 'JakartaBold',
    color: '#3122D2',
  },
});
