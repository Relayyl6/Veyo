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
import RoleSwitcherPill from '@/components/RoleSwitcherPill';
import DriverProfileHub from '@/components/DriverProfileHub';
import VendorDashboardHub from '@/components/VendorDashboardHub';
import { useUserStore } from '@/store/store';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signOut } = useAuth();
  const { user } = useUser();
  const role = useUserStore((state) => state.role);

  const [preference, setPreference] = useState<PreferenceType>('fast_pickup');

  const displayName = role === 'driver' ? 'Sarah Lee' : (user?.firstName || 'Leonard');

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
        {/* Global Role Switcher Pill */}
        <RoleSwitcherPill />

        {/* Conditional Role-Tailored Views */}
        {role === 'driver' ? (
          /* Driver Role: Sarah Lee's Driver Hub */
          <DriverProfileHub
            onSignOut={handleSignOut}
            onEditPayout={() => Alert.alert('Payout Settings', 'Direct deposits are sent to Wells Fargo (•••• 4455).')}
          />
        ) : role === 'vendor_admin' ? (
          /* Vendor Role: Store Management & Menu CRUD Hub */
          <VendorDashboardHub onSignOut={handleSignOut} />
        ) : (
          /* Customer Role: Leonard's Rider Profile */
          <>
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
                style={styles.inviteButton}
                activeOpacity={0.8}
                onPress={() => Alert.alert('Referral Code', 'Your referral code is: VEYO-LEONARD')}
              >
                <Text style={styles.inviteButtonText}>Invite Friends</Text>
                <Ionicons name="arrow-forward" size={14} color="#FFFFFF" style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            </View>

            {/* Additional Standard List Items */}
            <View style={styles.menuCard}>
              <TouchableOpacity
                style={styles.menuItem}
                activeOpacity={0.8}
                onPress={() => Alert.alert('Payment Methods', 'Manage debit cards, Apple Pay, and Veyo Wallet.')}
              >
                <View style={[styles.menuIconCircle, { backgroundColor: '#EEF2FF' }]}>
                  <Ionicons name="card-outline" size={18} color="#0286FF" />
                </View>
                <View style={styles.menuTextGroup}>
                  <Text style={styles.menuTitle}>Payment Methods</Text>
                  <Text style={styles.menuSub}>Cards, Veyo Wallet, Apple Pay</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
              </TouchableOpacity>

              <View style={styles.menuDivider} />

              <TouchableOpacity
                style={styles.menuItem}
                activeOpacity={0.8}
                onPress={() => Alert.alert('Support 24/7', 'Connect with a live customer care agent.')}
              >
                <View style={[styles.menuIconCircle, { backgroundColor: '#F3F4F6' }]}>
                  <Ionicons name="headset-outline" size={18} color="#374151" />
                </View>
                <View style={styles.menuTextGroup}>
                  <Text style={styles.menuTitle}>Help & Support</Text>
                  <Text style={styles.menuSub}>24/7 priority live assistance</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            {/* Log Out CTA */}
            <TouchableOpacity
              style={styles.logoutButton}
              activeOpacity={0.8}
              onPress={handleSignOut}
            >
              <Ionicons name="log-out-outline" size={18} color="#EF4444" style={{ marginRight: 8 }} />
              <Text style={styles.logoutButtonText}>Log Out</Text>
            </TouchableOpacity>
          </>
        )}
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
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 6,
  },
  userName: {
    fontFamily: 'JakartaBold',
    fontSize: 24,
    color: '#0B1528',
    marginBottom: 8,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0CC25F',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  verifiedBadgeText: {
    fontFamily: 'JakartaBold',
    fontSize: 11,
    color: '#FFFFFF',
    marginLeft: 4,
  },
  topRatedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3122D2',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  topRatedBadgeText: {
    fontFamily: 'JakartaBold',
    fontSize: 11,
    color: '#FFFFFF',
    marginLeft: 4,
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 48,
  },
  menuIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
    fontSize: 12,
    color: '#858585',
    marginTop: 2,
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginLeft: 64,
  },
  sectionHeader: {
    fontFamily: 'JakartaBold',
    fontSize: 11,
    color: '#858585',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  safetyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  safetyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingRight: 16,
    minHeight: 48,
    position: 'relative',
  },
  redAccentBar: {
    width: 4,
    height: '100%',
    backgroundColor: '#EF4444',
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
    marginRight: 12,
  },
  safetyTitle: {
    fontFamily: 'JakartaBold',
    fontSize: 14,
    color: '#0B1528',
    flex: 1,
  },
  pinActivePill: {
    backgroundColor: '#F0FDF4',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C6F6D5',
  },
  pinActiveText: {
    fontFamily: 'JakartaBold',
    fontSize: 9,
    color: '#0CC25F',
    letterSpacing: 0.5,
  },
  referralBanner: {
    backgroundColor: '#3122D2',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#3122D2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  referralTitle: {
    fontFamily: 'JakartaBold',
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  referralSub: {
    fontFamily: 'JakartaMedium',
    fontSize: 12,
    color: '#C3D9FF',
    lineHeight: 18,
    marginBottom: 14,
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#0286FF',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  inviteButtonText: {
    fontFamily: 'JakartaBold',
    fontSize: 12,
    color: '#FFFFFF',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#FEE2E2',
    borderRadius: 16,
    paddingVertical: 14,
    marginBottom: 20,
  },
  logoutButtonText: {
    fontFamily: 'JakartaBold',
    fontSize: 14,
    color: '#EF4444',
  },
});
