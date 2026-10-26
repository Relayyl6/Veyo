import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth, useUser } from '@clerk/expo';
import { Ionicons, Feather, FontAwesome, MaterialIcons } from '@expo/vector-icons';
import Header from '@/components/Header';
import { images } from '@/constants/utils';
import AITailoredPreferences, { PreferenceType } from '@/components/AITailoredPreferences';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signOut } = useAuth();
  const { user } = useUser();

  const [preference, setPreference] = useState<PreferenceType>('fast_pickup');

  const displayName = user?.firstName || 'Leonard';

  const handleSignOut = async () => {
    Alert.alert('Log Out', 'Are you sure you want to log out of Veyo?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
            router.replace('/(auth)/welcome');
          } catch (err) {
            console.error('Sign out error:', err);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* 1. Header */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          paddingTop: insets.top,
          paddingBottom: 10,
          backgroundColor: 'transparent',
        }}
      >
        <Header
          name={displayName}
          first={displayName}
          image={images.logohor}
          onNotificationPress={() => Alert.alert('Notifications', 'No unread notifications.')}
        />
      </View>

      {/* 2. Scrollable Profile Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 70,
          paddingBottom: insets.bottom + 90,
          paddingHorizontal: 16,
        }}
      >
        {/* User Identity Row */}
        <View style={styles.userProfileHeader}>
          <Text style={styles.userName}>{displayName}</Text>

          {/* Badges Strip */}
          <View style={styles.badgesRow}>
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={13} color="#FFFFFF" />
              <Text style={styles.verifiedBadgeText}>Verified Rider</Text>
            </View>

            <View style={styles.topRatedBadge}>
              <FontAwesome name="star" size={11} color="#FFFFFF" />
              <Text style={styles.topRatedBadgeText}>Top Rated</Text>
            </View>
          </View>
        </View>

        {/* AI Tailored Experience */}
        <AITailoredPreferences
          selectedPreference={preference}
          onSelectPreference={(p) => setPreference(p)}
        />

        {/* Menu Section Card */}
        <View style={styles.menuCard}>
          {/* Preferences */}
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.8}
            onPress={() => Alert.alert('Preferences', 'Global app and accessibility settings.')}
          >
            <View style={[styles.menuIconCircle, { backgroundColor: '#EEF2FF' }]}>
              <Ionicons name="settings-outline" size={18} color="#3122D2" />
            </View>
            <View style={styles.menuTextGroup}>
              <Text style={styles.menuTitle}>Preferences</Text>
              <Text style={styles.menuSub}>Global app & accessibility settings</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          {/* Saved Addresses */}
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.8}
            onPress={() => Alert.alert('Saved Addresses', 'Home, Work, School addresses.')}
          >
            <View style={[styles.menuIconCircle, { backgroundColor: '#F0FDF4' }]}>
              <Ionicons name="location-outline" size={18} color="#0CC25F" />
            </View>
            <View style={styles.menuTextGroup}>
              <Text style={styles.menuTitle}>Saved Addresses</Text>
              <Text style={styles.menuSub}>Home, Work, School</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          {/* Favorite Restaurants */}
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.8}
            onPress={() => Alert.alert('Favorite Restaurants', 'Your go-to meals and favorite spots.')}
          >
            <View style={[styles.menuIconCircle, { backgroundColor: '#FFF7ED' }]}>
              <Ionicons name="restaurant-outline" size={18} color="#F97316" />
            </View>
            <View style={styles.menuTextGroup}>
              <Text style={styles.menuTitle}>Favorite Restaurants</Text>
              <Text style={styles.menuSub}>Your go-to meals saved</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Safety & Trust Section */}
        <Text style={styles.sectionHeader}>SAFETY & TRUST</Text>
        <View style={styles.safetyCard}>
          {/* Emergency Contacts */}
          <TouchableOpacity
            style={styles.safetyItem}
            activeOpacity={0.8}
            onPress={() => Alert.alert('Emergency SOS', 'Alert emergency contacts and authorities.')}
          >
            <View style={styles.redAccentBar} />
            <View style={[styles.menuIconCircle, { backgroundColor: '#FEF2F2' }]}>
              <Ionicons name="medical" size={16} color="#EF4444" />
            </View>
            <Text style={styles.safetyTitle}>Emergency Contacts</Text>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          {/* Safety Settings */}
          <TouchableOpacity
            style={styles.safetyItem}
            activeOpacity={0.8}
            onPress={() => Alert.alert('Safety PIN', '4-digit ride verification PIN is active.')}
          >
            <View style={[styles.menuIconCircle, { backgroundColor: '#EEF2FF', marginLeft: 10 }]}>
              <Ionicons name="shield-checkmark-outline" size={16} color="#3122D2" />
            </View>
            <Text style={[styles.safetyTitle, { flex: 1 }]}>Safety Settings</Text>
            <View style={styles.pinActivePill}>
              <Text style={styles.pinActiveText}>PIN ACTIVE</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </View>

        {/* More Section: Referral Hero Banner */}
        <Text style={[styles.sectionHeader, { marginTop: 18 }]}>MORE</Text>

        <View style={styles.referralBanner}>
          <Text style={styles.referralTitle}>Invite Friends, Earn Credits</Text>
          <Text style={styles.referralSub}>
            Get up to ₦5,000 for every successful referral.
          </Text>

          <TouchableOpacity
            style={styles.shareCodeBtn}
            activeOpacity={0.85}
            onPress={() => Alert.alert('Referral Code', 'Your referral code VEYO-LEONARD has been copied!')}
          >
            <Text style={styles.shareCodeText}>Share Code</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Action Grid: Support & Notifications */}
        <View style={styles.actionGridRow}>
          <TouchableOpacity
            style={styles.actionGridCard}
            activeOpacity={0.85}
            onPress={() => Alert.alert('Support Center', '24/7 Veyo Priority Concierge available.')}
          >
            <Ionicons name="help-circle-outline" size={20} color="#3122D2" />
            <Text style={styles.actionGridText}>Support Center</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionGridCard}
            activeOpacity={0.85}
            onPress={() => Alert.alert('Notifications', 'Preferences for Push, SMS, and WhatsApp.')}
          >
            <Ionicons name="notifications-outline" size={20} color="#3122D2" />
            <Text style={styles.actionGridText}>Notifications</Text>
          </TouchableOpacity>
        </View>

        {/* Log Out Button */}
        <TouchableOpacity
          style={styles.logOutButton}
          activeOpacity={0.85}
          onPress={handleSignOut}
        >
          <Text style={styles.logOutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F8FA',
  },
  userProfileHeader: {
    marginBottom: 12,
  },
  userName: {
    fontFamily: 'JakartaBold',
    fontSize: 22,
    color: '#0B1528',
    marginBottom: 8,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#4F46E5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  verifiedBadgeText: {
    fontFamily: 'JakartaBold',
    fontSize: 10,
    color: '#FFFFFF',
  },
  topRatedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F97316',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  topRatedBadgeText: {
    fontFamily: 'JakartaBold',
    fontSize: 10,
    color: '#FFFFFF',
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 18,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuTextGroup: {
    flex: 1,
  },
  menuTitle: {
    fontFamily: 'JakartaBold',
    fontSize: 14,
    color: '#0B1528',
  },
  menuSub: {
    fontFamily: 'JakartaMedium',
    fontSize: 11,
    color: '#858585',
    marginTop: 1,
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 16,
  },
  sectionHeader: {
    fontFamily: 'JakartaBold',
    fontSize: 11,
    color: '#858585',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  safetyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    overflow: 'hidden',
    marginBottom: 16,
  },
  safetyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingRight: 16,
    position: 'relative',
  },
  redAccentBar: {
    width: 4,
    height: 28,
    backgroundColor: '#EF4444',
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
    marginRight: 10,
  },
  safetyTitle: {
    fontFamily: 'JakartaBold',
    fontSize: 14,
    color: '#0B1528',
    flex: 1,
  },
  pinActivePill: {
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  pinActiveText: {
    fontFamily: 'JakartaBold',
    fontSize: 9,
    color: '#0D9488',
    letterSpacing: 0.5,
  },
  referralBanner: {
    backgroundColor: '#2563EB',
    borderRadius: 24,
    padding: 20,
    marginBottom: 14,
  },
  referralTitle: {
    fontFamily: 'JakartaExtraBold',
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  referralSub: {
    fontFamily: 'JakartaMedium',
    fontSize: 12,
    color: '#BFDBFE',
    lineHeight: 18,
    marginBottom: 16,
  },
  shareCodeBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 14,
    alignSelf: 'flex-start',
  },
  shareCodeText: {
    fontFamily: 'JakartaBold',
    fontSize: 12,
    color: '#2563EB',
  },
  actionGridRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  actionGridCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionGridText: {
    fontFamily: 'JakartaBold',
    fontSize: 12,
    color: '#0B1528',
  },
  logOutButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#FEE2E2',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  logOutText: {
    fontFamily: 'JakartaBold',
    fontSize: 14,
    color: '#EF4444',
  },
});
