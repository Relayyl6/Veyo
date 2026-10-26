import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';

export interface ShortcutItem {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bgColor: string;
  address?: string;
}

interface DestinationShortcutsProps {
  onShortcutPress?: (shortcut: ShortcutItem) => void;
  onAddPress?: () => void;
  onEditPress?: () => void;
  style?: object;
}

const DEFAULT_SHORTCUTS: ShortcutItem[] = [
  {
    id: 'home',
    name: 'Home',
    icon: 'home-outline',
    color: '#0286FF',
    bgColor: '#EBF4FF',
    address: '12 Marine Road, Victoria Island',
  },
  {
    id: 'school',
    name: 'School',
    icon: 'school-outline',
    color: '#3122D2',
    bgColor: '#EEF2FF',
    address: 'University of Lagos, Akoka',
  },
  {
    id: 'work',
    name: 'Work',
    icon: 'briefcase-outline',
    color: '#0D9488',
    bgColor: '#CCFBF1',
    address: 'Marina Financial Center, Lagos Island',
  },
];

export default function DestinationShortcuts({
  onShortcutPress,
  onAddPress,
  onEditPress,
  style,
}: DestinationShortcutsProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Where to?</Text>
        <TouchableOpacity onPress={onEditPress} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.shortcutsRow}>
        {DEFAULT_SHORTCUTS.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.shortcutItem}
            activeOpacity={0.8}
            onPress={() => onShortcutPress && onShortcutPress(item)}
          >
            <View style={[styles.iconCircle, { backgroundColor: item.bgColor }]}>
              <Ionicons name={item.icon} size={18} color={item.color} />
            </View>
            <Text style={styles.shortcutName}>{item.name}</Text>
          </TouchableOpacity>
        ))}

        {/* Add Shortcut */}
        <TouchableOpacity
          style={styles.shortcutItem}
          activeOpacity={0.8}
          onPress={onAddPress}
        >
          <View style={styles.addCircle}>
            <Feather name="plus" size={18} color="#9CA3AF" />
          </View>
          <Text style={styles.shortcutName}>Add</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
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
    marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: 'JakartaBold',
    fontSize: 16,
    color: '#0B1528',
  },
  editText: {
    fontFamily: 'JakartaBold',
    fontSize: 12,
    color: '#3122D2',
  },
  shortcutsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  shortcutItem: {
    alignItems: 'center',
    width: 64,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  addCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    backgroundColor: '#FAFAFA',
  },
  shortcutName: {
    fontFamily: 'JakartaMedium',
    fontSize: 11,
    color: '#4B5563',
  },
});
