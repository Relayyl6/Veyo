import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useUserStore, AppUserRole } from '@/store/store';

interface RoleSwitcherPillProps {
  style?: object;
}

const ROLES: { id: AppUserRole; label: string; icon: string; iconType: 'ion' | 'fa5' }[] = [
  { id: 'customer', label: 'Rider', icon: 'person', iconType: 'ion' },
  { id: 'driver', label: 'Driver', icon: 'car-sport', iconType: 'ion' },
  { id: 'vendor_admin', label: 'Merchant', icon: 'store', iconType: 'fa5' },
];

export default function RoleSwitcherPill({ style }: RoleSwitcherPillProps) {
  const role = useUserStore((state) => state.role);
  const setRole = useUserStore((state) => state.setRole);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.track}>
        {ROLES.map((r) => {
          const isActive = role === r.id;
          return (
            <TouchableOpacity
              key={r.id}
              style={[styles.pill, isActive && styles.pillActive]}
              activeOpacity={0.8}
              onPress={() => setRole(r.id)}
            >
              {r.iconType === 'ion' ? (
                <Ionicons
                  name={r.icon as any}
                  size={14}
                  color={isActive ? '#FFFFFF' : '#6B7280'}
                  style={styles.icon}
                />
              ) : (
                <FontAwesome5
                  name={r.icon}
                  size={12}
                  color={isActive ? '#FFFFFF' : '#6B7280'}
                  style={styles.icon}
                />
              )}
              <Text style={[styles.label, isActive && styles.labelActive]}>
                {r.label}
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
    marginVertical: 10,
    alignItems: 'center',
  },
  track: {
    flexDirection: 'row',
    backgroundColor: '#EBF4FF',
    padding: 4,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#C3D9FF',
    shadowColor: '#0286FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    minHeight: 40,
  },
  pillActive: {
    backgroundColor: '#0286FF',
    shadowColor: '#0286FF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  icon: {
    marginRight: 6,
  },
  label: {
    fontFamily: 'JakartaBold',
    fontSize: 12,
    color: '#4B5563',
  },
  labelActive: {
    color: '#FFFFFF',
  },
});
