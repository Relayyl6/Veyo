import React, { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
} from 'react-native';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useUser } from '@clerk/expo';

import { images } from '@/constants/utils';
import Header from '@/components/Header';
import AdCarousel from '@/components/AdCarousel';
import ServiceGrid from '@/components/Options';
import { rides } from '@/constants/data';
import RideCardDeck from '@/components/RideCardDeck';
import VeyoInsightsScreen from '@/components/Insights';
import RoleSwitcherPill from '@/components/RoleSwitcherPill';
import WhereToInput from '@/components/WhereToInput';
import QuickActionGrid from '@/components/QuickActionGrid';
import TrafficAlertBanner from '@/components/TrafficAlertBanner';
import PackageTrackerCard from '@/components/PackageTrackerCard';
import OrderTrackingModal from '@/components/OrderTrackingModal';
import { useLocationStore, useUserStore } from '@/store/store';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useUser();
  const insets = useSafeAreaInsets();
  const role = useUserStore((state) => state.role);

  const {
    userAddress,
    destinationAddress,
    setUserLocation,
    setDestinationLocation,
    setIsLoading,
  } = useLocationStore();

  const [hasPermissions, setHasPermissions] = useState(false);
  const [trackingModalVisible, setTrackingModalVisible] = useState(false);

  useEffect(() => {
    const requestLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setHasPermissions(false);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        let lastKnown = await Location.getLastKnownPositionAsync({});
        if (lastKnown) {
          let addressResult = await Location.reverseGeocodeAsync({
            latitude: lastKnown.coords.latitude,
            longitude: lastKnown.coords.longitude,
          });

          setUserLocation({
            latitude: lastKnown.coords.latitude,
            longitude: lastKnown.coords.longitude,
            address: `${addressResult[0].name || 'Current'}, ${addressResult[0].region || 'Lagos'}`,
          });
        }

        let location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        let addressResult = await Location.reverseGeocodeAsync({
          latitude: location.coords?.latitude!,
          longitude: location.coords?.longitude!,
        });

        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          address: `${addressResult[0].name || 'Current'}, ${addressResult[0].region || 'Lagos'}`,
        });
      } catch (error) {
        console.log('Error getting location:', error);
      } finally {
        setIsLoading(false);
      }
    };

    requestLocation();
  }, []);

  const displayName =
    role === 'driver'
      ? 'Sarah Lee'
      : role === 'vendor_admin'
      ? 'Pizza Paradise'
      : user?.firstName || 'Leonard';

  return (
    <View style={styles.container}>
      {/* 1. Absolute Header */}
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
          onNotificationPress={() => router.push('/(root)/(tabs)/profile')}
        />
      </View>

      {/* 2. Scrollable Content */}
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 58,
          paddingBottom: insets.bottom + 85, // Tab bar clearance
          paddingHorizontal: 12,
          gap: 12,
        }}
      >
        {/* Role Switcher Pill */}
        <RoleSwitcherPill />

        {/* Conditional Role Top Banners */}
        {role === 'driver' ? (
          <View style={styles.roleSummaryCard}>
            <View style={styles.roleSummaryTop}>
              <View style={styles.onlineBadge}>
                <View style={styles.pulseDot} />
                <Text style={styles.onlineText}>DRIVER ONLINE</Text>
              </View>
              <Text style={styles.roleSummarySurge}>● 1.4x Surge Active</Text>
            </View>

            <View style={styles.roleMetricsRow}>
              <View>
                <Text style={styles.roleMetricVal}>$184.50</Text>
                <Text style={styles.roleMetricLbl}>Today's Earnings</Text>
              </View>
              <View>
                <Text style={styles.roleMetricVal}>8 Trips</Text>
                <Text style={styles.roleMetricLbl}>Completed</Text>
              </View>
              <TouchableOpacity
                style={styles.roleActionBtn}
                onPress={() => router.push('/(root)/(tabs)/trips')}
              >
                <Text style={styles.roleActionBtnText}>Live Dispatch →</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : role === 'vendor_admin' ? (
          <View style={styles.roleSummaryCard}>
            <View style={styles.roleSummaryTop}>
              <View style={[styles.onlineBadge, { backgroundColor: '#ECFDF5' }]}>
                <Ionicons name="storefront" size={12} color="#059669" />
                <Text style={[styles.onlineText, { color: '#059669' }]}>STORE OPEN</Text>
              </View>
              <Text style={styles.roleSummarySurge}>10:00 AM - 10:00 PM</Text>
            </View>

            <View style={styles.roleMetricsRow}>
              <View>
                <Text style={styles.roleMetricVal}>$1,248.50</Text>
                <Text style={styles.roleMetricLbl}>Gross Sales Today</Text>
              </View>
              <View>
                <Text style={styles.roleMetricVal}>38 Orders</Text>
                <Text style={styles.roleMetricLbl}>Fulfillment Queue</Text>
              </View>
              <TouchableOpacity
                style={styles.roleActionBtn}
                onPress={() => router.push('/(root)/(tabs)/profile')}
              >
                <Text style={styles.roleActionBtnText}>Manage Hub →</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            {/* Where to Input Component */}
            <WhereToInput
              originText={userAddress || 'Victoria Island, Lagos'}
              destinationText={destinationAddress || 'Where to?'}
              onOriginPress={() => router.push('/(utils)/search?mode=Map')}
              onDestinationPress={() => router.push('/(utils)/search?mode=Map')}
            />

            {/* Quick Action Grid (Book a Ride & Send Items) */}
            <QuickActionGrid
              onBookRidePress={() => router.push('/(utils)/book-ride')}
              onSendItemsPress={() => router.push('/(utils)/send-items')}
            />

            {/* Real-time Traffic Alert Banner */}
            <TrafficAlertBanner
              title="TRAFFIC ALERT"
              subtitle="Avoid Third Mainland Bridge delay? Saves 14 mins"
              buttonText="Reroute"
              onReroutePress={() =>
                Alert.alert('Route Optimized', 'Alternative path selected via Ikorodu Rd.')
              }
            />
          </>
        )}

        {/* Ad Carousel */}
        <AdCarousel />

        {/* Service Grid Options */}
        <ServiceGrid />

        {/* Nearby Ride Card Deck */}
        <RideCardDeck rides={rides.rides} />

        {/* Live En-route Package Tracker Card */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Active Logistics</Text>
          <TouchableOpacity onPress={() => router.push('/(utils)/send-items')}>
            <Text style={styles.viewAllText}>SEND ITEM</Text>
          </TouchableOpacity>
        </View>

        <PackageTrackerCard
          packageId="ID: VEYO-29384-NG"
          statusText="EN ROUTE"
          pickupLocation="Pickup: Victoria Island"
          etaText="Est. 4:15 PM"
          progressPercent={70}
          onPress={() => setTrackingModalVisible(true)}
        />

        {/* Veyo Intelligence Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Veyo Intelligence</Text>
          <TouchableOpacity onPress={() => router.push('/(root)/(tabs)/wallet')}>
            <Text style={styles.viewAllText}>VIEW INSIGHTS</Text>
          </TouchableOpacity>
        </View>

        <VeyoInsightsScreen />
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/(utils)/book-ride')}
        activeOpacity={0.88}
      >
        <FontAwesome5 name="plus" size={18} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Live Order Tracking Modal */}
      <OrderTrackingModal
        visible={trackingModalVisible}
        orderId="VEYO-29384-NG"
        onClose={() => setTrackingModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F8FA',
    position: 'relative',
  },
  scroll: {
    flex: 1,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  sectionTitle: {
    fontFamily: 'JakartaBold',
    fontSize: 15,
    color: '#0B1528',
  },
  viewAllText: {
    fontFamily: 'JakartaBold',
    fontSize: 11,
    color: '#0286FF',
  },
  roleSummaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#3122D2',
    shadowColor: '#3122D2',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  roleSummaryTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 6,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  onlineText: {
    fontFamily: 'JakartaBold',
    fontSize: 10,
    color: '#059669',
    letterSpacing: 0.5,
  },
  roleSummarySurge: {
    fontFamily: 'JakartaBold',
    fontSize: 11,
    color: '#EA580C',
  },
  roleMetricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 12,
  },
  roleMetricVal: {
    fontFamily: 'JakartaBold',
    fontSize: 16,
    color: '#0B1528',
  },
  roleMetricLbl: {
    fontFamily: 'JakartaMedium',
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  roleActionBtn: {
    backgroundColor: '#3122D2',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  roleActionBtnText: {
    fontFamily: 'JakartaBold',
    fontSize: 12,
    color: '#FFFFFF',
  },
  fab: {
    position: 'absolute',
    bottom: 105,
    right: 20,
    zIndex: 50,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#0286FF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0286FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
});
