import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export type PreferenceType = 'fast_pickup' | 'budget' | 'comfort';

interface AITailoredPreferencesProps {
  selectedPreference?: PreferenceType;
  onSelectPreference?: (pref: PreferenceType) => void;
  style?: object;
}

export default function AITailoredPreferences({
  selectedPreference = 'fast_pickup',
  onSelectPreference,
  style,
}: AITailoredPreferencesProps) {
  const [active, setActive] = useState<PreferenceType>(selectedPreference);

  const handleSelect = (pref: PreferenceType) => {
    setActive(pref);
    if (onSelectPreference) onSelectPreference(pref);
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.sectionHeader}>AI TAILORED EXPERIENCE</Text>

      <View style={styles.gridRow}>
        {/* Left Large Card: Fast Pickup Preference */}
        <TouchableOpacity
          style={[
            styles.largeCard,
            active === 'fast_pickup' && styles.cardActive,
          ]}
          activeOpacity={0.85}
          onPress={() => handleSelect('fast_pickup')}
        >
          <View style={styles.carIconBox}>
            <FontAwesome5 name="car" size={18} color="#3122D2" />
          </View>

          <Text style={styles.cardTitle}>Fast pickup preference</Text>
          <Text style={styles.cardDescription}>
            AI prioritizes nearby drivers over price.
          </Text>
        </TouchableOpacity>

        {/* Right Stacked Column */}
        <View style={styles.stackedCol}>
          {/* Budget-First Card */}
          <TouchableOpacity
            style={[
              styles.smallCard,
              active === 'budget' && styles.cardActive,
            ]}
            activeOpacity={0.85}
            onPress={() => handleSelect('budget')}
          >
            <View style={[styles.smallIconBox, { backgroundColor: '#CCFBF1' }]}>
              <Ionicons name="pricetag" size={14} color="#0D9488" />
            </View>
            <Text style={styles.smallCardTitle}>Budget-first</Text>
          </TouchableOpacity>

          {/* Comfort-First Card */}
          <TouchableOpacity
            style={[
              styles.smallCard,
              active === 'comfort' && styles.cardActive,
            ]}
            activeOpacity={0.85}
            onPress={() => handleSelect('comfort')}
          >
            <View style={[styles.smallIconBox, { backgroundColor: '#F3F4F6' }]}>
              <MaterialCommunityIcons name="car-seat" size={14} color="#6B7280" />
            </View>
            <Text style={styles.smallCardTitle}>Comfort-first</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  sectionHeader: {
    fontFamily: 'JakartaBold',
    fontSize: 11,
    color: '#858585',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
  },
  largeCard: {
    flex: 1.2,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#EEEEEE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    justifyContent: 'space-between',
  },
  cardActive: {
    borderColor: '#3122D2',
    backgroundColor: '#FAF9FF',
  },
  carIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  cardTitle: {
    fontFamily: 'JakartaBold',
    fontSize: 13,
    color: '#0B1528',
    marginBottom: 4,
  },
  cardDescription: {
    fontFamily: 'JakartaMedium',
    fontSize: 11,
    color: '#858585',
    lineHeight: 15,
  },
  stackedCol: {
    flex: 1,
    gap: 10,
  },
  smallCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: '#EEEEEE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    gap: 10,
  },
  smallIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallCardTitle: {
    fontFamily: 'JakartaBold',
    fontSize: 12,
    color: '#0B1528',
    flex: 1,
  },
});
