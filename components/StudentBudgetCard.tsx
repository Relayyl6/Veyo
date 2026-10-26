import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StudentBudgetCardProps {
  monthlyLimit?: string;
  spentAmount?: string;
  remainingAmount?: string;
  spentPercent?: number; // 0 to 100
  initialActive?: boolean;
  onToggle?: (active: boolean) => void;
  style?: object;
}

export default function StudentBudgetCard({
  monthlyLimit = '₦20,000',
  spentAmount = '₦13,400',
  remainingAmount = '₦6,600',
  spentPercent = 67,
  initialActive = true,
  onToggle,
  style,
}: StudentBudgetCardProps) {
  const [isActive, setIsActive] = useState(initialActive);

  const handleToggle = (val: boolean) => {
    setIsActive(val);
    if (onToggle) onToggle(val);
  };

  return (
    <View style={[styles.container, style]}>
      {/* Top Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <View style={styles.iconCircle}>
            <Ionicons name="school" size={16} color="#FFFFFF" />
          </View>
          <View>
            <Text style={styles.title}>Student Mode</Text>
            <Text style={styles.subtitle}>Transport Budget Mode Active</Text>
          </View>
        </View>

        <Switch
          value={isActive}
          onValueChange={handleToggle}
          trackColor={{ false: '#4B5563', true: '#3122D2' }}
          thumbColor="#FFFFFF"
        />
      </View>

      {/* Monthly Limit Info */}
      <View style={styles.limitRow}>
        <Text style={styles.limitLabel}>Monthly Limit</Text>
        <Text style={styles.limitValue}>{monthlyLimit}</Text>
      </View>

      {/* Progress Track */}
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressBar,
            { width: `${Math.min(100, Math.max(0, spentPercent))}%` },
          ]}
        />
      </View>

      {/* Spent vs Remaining Info */}
      <View style={styles.statsRow}>
        <Text style={styles.statText}>Spent: {spentAmount}</Text>
        <Text style={styles.statText}>Remaining: {remainingAmount}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E1B4B',
    borderRadius: 24,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#3122D2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'JakartaBold',
    fontSize: 15,
    color: '#FFFFFF',
  },
  subtitle: {
    fontFamily: 'JakartaMedium',
    fontSize: 10,
    color: '#A5B4FC',
    marginTop: 1,
  },
  limitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  limitLabel: {
    fontFamily: 'JakartaMedium',
    fontSize: 11,
    color: '#94A3B8',
  },
  limitValue: {
    fontFamily: 'JakartaBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#312E81',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#6366F1',
    borderRadius: 3,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statText: {
    fontFamily: 'JakartaMedium',
    fontSize: 11,
    color: '#CBD5E1',
  },
});
