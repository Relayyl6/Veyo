import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useUserStore, AppUserRole } from '@/store/store';

interface RoleSwitcherPillProps {
  style?: object;
}

const ROLES: { id: AppUserRole; label: string; icon: string; iconType: 'ion' | 'fa5' }[] = [
  { id: 'customer', label: 'Customer', icon: 'person', iconType: 'ion' },
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
    marginVertical: 6,
    alignItems: 'center',
  },
  track: {
    flexDirection: 'row',
    backgroundColor: '#EBF4FF',
    padding: 3,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#C3D9FF',
    shadowColor: '#0286FF',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 16,
    minHeight: 32,
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
    fontSize: 11,
    color: '#4B5563',
  },
  labelActive: {
    color: '#FFFFFF',
  },
});
