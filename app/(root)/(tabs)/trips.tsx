import React, { useState, useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Modal,
  Alert,
  TextInput,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/expo';
import {
  FontAwesome5,
  Ionicons,
  MaterialIcons,
  Feather,
} from '@expo/vector-icons';

import Map from '@/components/Map';
import Header from '@/components/Header';
import { useLocationStore, useUserStore } from '@/store/store';
import RoleSwitcherPill from '@/components/RoleSwitcherPill';
import { rides as mockRidesData } from '@/constants/data';
import { getEnrichedRide } from '@/lib/dataResolvers';
import { images } from '@/constants/utils';
import { Ride } from '@/types/data';

// Mobility Reusable Components
import TrafficAlertBanner from '@/components/TrafficAlertBanner';
import QuickActionGrid from '@/components/QuickActionGrid';
import DestinationShortcuts, { ShortcutItem } from '@/components/DestinationShortcuts';
import RideOptionCard, { RideOption } from '@/components/RideOptionCard';
import PackageTrackerCard from '@/components/PackageTrackerCard';
import QuietModeModal from '@/components/QuietModeModal';
import RideChatModal from '@/components/RideChatModal';
import OrderTrackingModal from '@/components/OrderTrackingModal';

interface ScheduledRide {
  id: string;
  title: string;
  date: string;
  time: string;
  origin: string;
  destination: string;
  vehicleType: string;
  estimatedFare: number;
  status: 'confirmed' | 'pending';
}

const INITIAL_SCHEDULED_RIDES: ScheduledRide[] = [
  {
    id: 'sched-1',
    title: 'Airport Departure Transfer',
    date: 'Tomorrow, Oct 27',
    time: '05:30 AM',
    origin: '12 Marine Road, Victoria Island',
    destination: 'Murtala Muhammed International Airport (LOS)',
    vehicleType: 'Veyo Comfort Sedan',
    estimatedFare: 45.0,
    status: 'confirmed',
  },
  {
    id: 'sched-2',
    title: 'Client Meeting Commute',
    date: 'Thursday, Oct 29',
    time: '08:45 AM',
    origin: '7 Alfred Rewane Road, Ikoyi',
    destination: 'Marina Financial Center, Lagos Island',
    vehicleType: 'Veyo Black Executive',
    estimatedFare: 28.5,
    status: 'confirmed',
  },
];

const MOBILITY_OPTIONS: RideOption[] = [
  {
    id: 'opt-econ',
    name: 'Economy',
    eta: '4 mins away',
    subtitle: 'Affordable daily trips',
    price: '₦2,400',
    badge: 'FASTEST',
    badgeType: 'fastest',
    iconType: 'car',
  },
  {
    id: 'opt-comfort',
    name: 'Comfort',
    eta: '6 mins away',
    subtitle: 'Premium cars with AC',
    price: '₦3,800',
    iconType: 'comfort',
  },
  {
    id: 'opt-ev',
    name: 'Veyo EV',
    eta: '8 mins away',
    subtitle: 'Zero emission ride',
    price: '₦2,100',
    badge: 'ECO FRIENDLY',
    badgeType: 'eco',
    iconType: 'ev',
  },
  {
    id: 'opt-bike',
    name: 'Bike',
    eta: '2 mins away',
    subtitle: 'Beat the heavy traffic',
    price: '₦850',
    iconType: 'bike',
  },
];

export default function MobilityScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useUser();
  const { setDestinationLocation, setUserLocation } = useLocationStore();
  const role = useUserStore((state) => state.role);
  const [driverTripStatus, setDriverTripStatus] = useState<'incoming' | 'en_route_pickup' | 'in_trip' | 'idle'>('incoming');

  const [activeTab, setActiveTab] = useState<'mobility' | 'past' | 'scheduled'>('mobility');
  const [scheduledList, setScheduledList] = useState<ScheduledRide[]>(INITIAL_SCHEDULED_RIDES);
  const [selectedRideOption, setSelectedRideOption] = useState<RideOption>(MOBILITY_OPTIONS[0]);

  // Modals state
  const [quietModeVisible, setQuietModeVisible] = useState(false);
  const [chatModalVisible, setChatModalVisible] = useState(false);
  const [trackingModalVisible, setTrackingModalVisible] = useState(false);
  const [supportModalVisible, setSupportModalVisible] = useState(false);
  const [selectedRideForSupport, setSelectedRideForSupport] = useState<any>(null);

  // New Schedule Modal state
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
  const [scheduleTitle, setScheduleTitle] = useState('');
  const [scheduleDate, setScheduleDate] = useState('Tomorrow, 07:00 AM');
  const [scheduleDestination, setScheduleDestination] = useState('International Airport');

  const pastRidesList = useMemo(() => {
    return (mockRidesData.rides || []).map((r) => getEnrichedRide(r.id) || r);
  }, []);

  const handleRebookRide = (ride: any) => {
    if (ride.destination_latitude && ride.destination_longitude) {
      setDestinationLocation({
        latitude: ride.destination_latitude,
        longitude: ride.destination_longitude,
        address: ride.destination_address || 'Selected Destination',
      });
      router.push('/(utils)/book-ride');
    } else {
      router.push('/(utils)/book-ride');
    }
  };

  const handleOpenSupport = (ride: any) => {
    setSelectedRideForSupport(ride);
    setSupportModalVisible(true);
  };

  const handleCancelScheduled = (id: string) => {
    Alert.alert('Cancel Reservation', 'Are you sure you want to cancel this scheduled ride?', [
      { text: 'Keep Reservation', style: 'cancel' },
      {
        text: 'Cancel Ride',
        style: 'destructive',
        onPress: () => {
          setScheduledList((prev) => prev.filter((item) => item.id !== id));
          Alert.alert('Reservation Canceled', 'Your scheduled reservation has been canceled.');
        },
      },
    ]);
  };

  const handleCreateSchedule = () => {
    if (!scheduleTitle.trim()) {
      Alert.alert('Required', 'Please enter a title for this trip.');
      return;
    }
    const newRide: ScheduledRide = {
      id: `sched-${Date.now()}`,
      title: scheduleTitle,
      date: scheduleDate.split(',')[0] || 'Upcoming',
      time: scheduleDate.split(',')[1] || '08:00 AM',
      origin: 'Current Location',
      destination: scheduleDestination,
      vehicleType: 'Veyo Comfort Sedan',
      estimatedFare: 32.0,
      status: 'confirmed',
    };
    setScheduledList([newRide, ...scheduledList]);
    setScheduleModalVisible(false);
    setScheduleTitle('');
    Alert.alert('Trip Scheduled', 'Your upcoming ride has been reserved successfully.');
  };

  return (
    <View style={styles.screenContainer}>
      {/* 1. TOP HEADER BAR */}
      <View style={[styles.headerWrapper, { paddingTop: insets.top }]}>
        <Header
          name={user?.firstName || 'Traveler'}
          first={user?.firstName || 'User'}
          image={images.logohor}
          onNotificationPress={() => router.push('/(root)/(tabs)/profile')}
        />
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + 65,
            paddingBottom: insets.bottom + 90, // Avoid overlap with bottom floating tab bar
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Role Switcher Pill */}
        <RoleSwitcherPill />

        {role === 'driver' ? (
          /* ================= DRIVER LIVE RADAR & DISPATCH MODE ================= */
          <View style={styles.driverDispatchCol}>
            {/* 1. Driver Shift Summary Card */}
            <View style={styles.driverShiftCard}>
              <View style={styles.shiftHeaderRow}>
                <View style={styles.onlineStatusBadge}>
                  <View style={styles.pulseGreenDot} />
                  <Text style={styles.onlineStatusBadgeText}>ONLINE DISPATCH</Text>
                </View>
                <Text style={styles.surgeIndicatorText}>● 1.4x Surge Active</Text>
              </View>

              <View style={styles.shiftMetricsRow}>
                <View style={styles.shiftMetricCol}>
                  <Text style={styles.shiftMetricVal}>$184.50</Text>
                  <Text style={styles.shiftMetricLbl}>Shift Earnings</Text>
                </View>
                <View style={styles.shiftMetricCol}>
                  <Text style={styles.shiftMetricVal}>5h 12m</Text>
                  <Text style={styles.shiftMetricLbl}>Time Online</Text>
                </View>
                <View style={styles.shiftMetricCol}>
                  <Text style={styles.shiftMetricVal}>8</Text>
                  <Text style={styles.shiftMetricLbl}>Trips Done</Text>
                </View>
              </View>
            </View>

            {/* 2. Embedded Navigation & Radar Map */}
            <View style={styles.driverMapFrame}>
              <Map
                height={210}
                showExpandButton={true}
                showRecenterButton={true}
                showDriverCount={true}
                interactive={true}
              />
            </View>

            {/* 3. Driver Dispatch Request Status Card */}
            {driverTripStatus === 'incoming' && (
              <View style={styles.incomingDispatchCard}>
                <View style={styles.dispatchTopRow}>
                  <View style={styles.incomingPill}>
                    <Ionicons name="time" size={12} color="#D97706" />
                    <Text style={styles.incomingPillText}>INCOMING REQUEST (14s)</Text>
                  </View>
                  <Text style={styles.dispatchFare}>$24.50</Text>
                </View>

                {/* Rider Info */}
                <View style={styles.dispatchRiderRow}>
                  <Image
                    source={{ uri: 'https://randomuser.me/api/portraits/men/44.jpg' }}
                    style={styles.dispatchRiderAvatar}
                  />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.dispatchRiderName}>David K.</Text>
                    <Text style={styles.dispatchRiderRating}>★ 4.9 • 120 rides</Text>
                  </View>
                  <View style={styles.surgeBoostBadge}>
                    <Text style={styles.surgeBoostText}>+$3.00 Boost</Text>
                  </View>
                </View>

                {/* Route */}
                <View style={styles.dispatchRouteBox}>
                  <View style={styles.routePointRow}>
                    <View style={[styles.routeDot, { backgroundColor: '#0CC25F' }]} />
                    <Text style={styles.routeAddressText}>78 Marina Blvd (1.8 km • 4 min)</Text>
                  </View>
                  <View style={styles.routeHairline} />
                  <View style={styles.routePointRow}>
                    <View style={[styles.routeDot, { backgroundColor: '#F56565' }]} />
                    <Text style={styles.routeAddressText}>Lekki Phase 1, Admiralty Way (8.4 km)</Text>
                  </View>
                </View>

                {/* Buttons */}
                <View style={styles.dispatchBtnRow}>
                  <TouchableOpacity
                    style={styles.declineBtn}
                    onPress={() => setDriverTripStatus('idle')}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.declineBtnText}>Decline</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.acceptBtn}
                    onPress={() => setDriverTripStatus('en_route_pickup')}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.acceptBtnText}>Accept Ride</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {driverTripStatus === 'en_route_pickup' && (
              <View style={styles.activeTripCard}>
                <View style={styles.dispatchTopRow}>
                  <View style={[styles.incomingPill, { backgroundColor: '#EFF6FF' }]}>
                    <Ionicons name="navigate" size={12} color="#0286FF" />
                    <Text style={[styles.incomingPillText, { color: '#0286FF' }]}>PICKUP EN ROUTE</Text>
                  </View>
                  <Text style={styles.dispatchFare}>ETA 4 min</Text>
                </View>

                <Text style={styles.activeTripTitle}>Picking up David K. at 78 Marina Blvd</Text>

                <View style={styles.activeTripActionRow}>
                  <TouchableOpacity
                    style={styles.chatRiderBtn}
                    onPress={() => setChatModalVisible(true)}
                  >
                    <Ionicons name="chatbubble-ellipses" size={16} color="#3122D2" />
                    <Text style={styles.chatRiderText}>Chat</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.startTripBtn}
                    onPress={() => setDriverTripStatus('in_trip')}
                  >
                    <Text style={styles.startTripText}>Start Trip →</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {driverTripStatus === 'in_trip' && (
              <View style={styles.activeTripCard}>
                <View style={styles.dispatchTopRow}>
                  <View style={[styles.incomingPill, { backgroundColor: '#ECFDF5' }]}>
                    <Ionicons name="car-sport" size={12} color="#059669" />
                    <Text style={[styles.incomingPillText, { color: '#059669' }]}>TRIP IN PROGRESS</Text>
                  </View>
                  <Text style={styles.dispatchFare}>$24.50</Text>
                </View>

                <Text style={styles.activeTripTitle}>Destination: Lekki Phase 1, Admiralty Way</Text>

                <TouchableOpacity
                  style={[styles.startTripBtn, { backgroundColor: '#059669', width: '100%', marginTop: 12 }]}
                  onPress={() => {
                    Alert.alert('Trip Completed!', 'Collected $24.50. Added to driver balance.');
                    setDriverTripStatus('idle');
                  }}
                >
                  <Text style={styles.startTripText}>Complete Trip & Collect Fare ✓</Text>
                </TouchableOpacity>
              </View>
            )}

            {driverTripStatus === 'idle' && (
              <View style={styles.idleCard}>
                <Ionicons name="navigate-outline" size={32} color="#0286FF" />
                <Text style={styles.idleTitle}>Online & Searching for Requests</Text>
                <Text style={styles.idleSub}>High demand near Victoria Island (1.4x Surge Active)</Text>
                <TouchableOpacity
                  style={styles.simulateBtn}
                  onPress={() => setDriverTripStatus('incoming')}
                >
                  <Text style={styles.simulateBtnText}>Simulate New Incoming Request</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* 4. Driver Quick Controls */}
            <View style={styles.driverQuickActions}>
              <TouchableOpacity
                style={styles.driverQuickBtn}
                onPress={() => Alert.alert('Surge Heatmap', 'Downtown Victoria Island & Lekki Phase 1 currently have 1.4x surge.')}
              >
                <Ionicons name="flame" size={18} color="#EA580C" />
                <Text style={styles.driverQuickText}>Heatmap</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.driverQuickBtn}
                onPress={() => Alert.alert('Safety Hub', '24/7 Driver SOS and Incident Hotline active.')}
              >
                <Ionicons name="shield-checkmark" size={18} color="#3122D2" />
                <Text style={styles.driverQuickText}>Safety Hub</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.driverQuickBtn}
                onPress={() => Alert.alert('Break Mode', 'Driver paused. Requests paused for 15 mins.')}
              >
                <Ionicons name="pause-circle" size={18} color="#6B7280" />
                <Text style={styles.driverQuickText}>Break</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
        {/* 2. SEGMENTED TAB SELECTOR (Mobility | Past Trips | Scheduled) */}
        <View style={styles.segmentedControl}>
          <TouchableOpacity
            style={[
              styles.segmentButton,
              activeTab === 'mobility' && styles.segmentButtonActive,
            ]}
            onPress={() => setActiveTab('mobility')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="navigate"
              size={15}
              color={activeTab === 'mobility' ? '#FFFFFF' : '#858585'}
            />
            <Text
              style={[
                styles.segmentText,
                activeTab === 'mobility' && styles.segmentTextActive,
              ]}
            >
              Mobility
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.segmentButton,
              activeTab === 'past' && styles.segmentButtonActive,
            ]}
            onPress={() => setActiveTab('past')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="receipt-outline"
              size={15}
              color={activeTab === 'past' ? '#FFFFFF' : '#858585'}
            />
            <Text
              style={[
                styles.segmentText,
                activeTab === 'past' && styles.segmentTextActive,
              ]}
            >
              Past ({pastRidesList.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.segmentButton,
              activeTab === 'scheduled' && styles.segmentButtonActive,
            ]}
            onPress={() => setActiveTab('scheduled')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="calendar-outline"
              size={15}
              color={activeTab === 'scheduled' ? '#FFFFFF' : '#858585'}
            />
            <Text
              style={[
                styles.segmentText,
                activeTab === 'scheduled' && styles.segmentTextActive,
              ]}
            >
              Scheduled ({scheduledList.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* ============================================================== */}
        {/* TAB 1: MOBILITY HUB (Image 2)                                   */}
        {/* ============================================================== */}
        {activeTab === 'mobility' && (
          <View style={styles.mobilityHubCol}>
            {/* Top Map Card with Traffic Alert Overlay Banner */}
            <View style={styles.heroMapWrapper}>
              <Map
                height={210}
                showExpandButton={true}
                showRecenterButton={true}
                showDriverCount={true}
                interactive={true}
              />

              {/* Traffic Alert Banner (Matches Image 2) */}
              <View style={styles.trafficAlertPosition}>
                <TrafficAlertBanner
                  title="TRAFFIC ALERT"
                  subtitle="Avoid Third Mainland traffic?"
                  buttonText="Reroute"
                  onReroutePress={() =>
                    Alert.alert('Route Optimized', 'Alternative route via Ikorodu Rd selected. Saves 14 mins.')
                  }
                />
              </View>
            </View>

            {/* Quick Action Grid: Book a Ride & Send Items (Matches Image 2) */}
            <QuickActionGrid
              onBookRidePress={() => router.push('/(utils)/search?mode=Map')}
              onSendItemsPress={() =>
                Alert.alert('Send Package', 'Choose parcel size and destination contact.')
              }
            />

            {/* Where to? Shortcuts (Home, School, Work, Add) (Matches Image 2) */}
            <DestinationShortcuts
              onShortcutPress={(s) => {
                if (s.address) {
                  setDestinationLocation({
                    latitude: 6.425,
                    longitude: 3.421,
                    address: s.address,
                  });
                  router.push('/(utils)/search?mode=Map');
                }
              }}
              onAddPress={() => router.push('/(utils)/search')}
              onEditPress={() => Alert.alert('Saved Places', 'Manage your favorite shortcuts.')}
            />

            {/* Ride Options Section (Matches Image 2) */}
            <View style={styles.rideOptionsSection}>
              <View style={styles.rideOptionsHeaderRow}>
                <Text style={styles.rideOptionsTitle}>Ride Options</Text>
                <TouchableOpacity
                  style={styles.scheduleRidePill}
                  activeOpacity={0.8}
                  onPress={() => setScheduleModalVisible(true)}
                >
                  <Ionicons name="calendar-outline" size={13} color="#3122D2" />
                  <Text style={styles.scheduleRidePillText}>Schedule Ride</Text>
                </TouchableOpacity>
              </View>

              {MOBILITY_OPTIONS.map((opt) => (
                <RideOptionCard
                  key={opt.id}
                  option={opt}
                  isSelected={selectedRideOption.id === opt.id}
                  onSelect={(o) => setSelectedRideOption(o)}
                  layout="row"
                />
              ))}
            </View>

            {/* Track Your Packages Card (Matches Image 2) */}
            <PackageTrackerCard
              packageId="ID: VEYO-29384-NG"
              statusText="EN ROUTE"
              pickupLocation="Pickup: Ikeja"
              etaText="Est. 25m"
              progressPercent={65}
              onPress={() => setTrackingModalVisible(true)}
            />

            {/* Quiet Mode & Live Chat Quick Access Strip */}
            <View style={styles.assistStrip}>
              <TouchableOpacity
                style={styles.assistCard}
                activeOpacity={0.85}
                onPress={() => setQuietModeVisible(true)}
              >
                <View style={[styles.assistIconCircle, { backgroundColor: '#EEF2FF' }]}>
                  <Ionicons name="volume-mute" size={16} color="#3122D2" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.assistTitle}>Quiet Mode</Text>
                  <Text style={styles.assistSub}>Ride in peace, stay in silence</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.assistCard}
                activeOpacity={0.85}
                onPress={() => setChatModalVisible(true)}
              >
                <View style={[styles.assistIconCircle, { backgroundColor: '#F0FDF4' }]}>
                  <Ionicons name="chatbubbles" size={16} color="#0CC25F" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.assistTitle}>Driver Chat</Text>
                  <Text style={styles.assistSub}>Chat with Barry John (5 MIN)</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ============================================================== */}
        {/* TAB 2: PAST TRIPS LIST                                          */}
        {/* ============================================================== */}
        {activeTab === 'past' && (
          <View style={styles.listContainer}>
            {pastRidesList.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="car-outline" size={48} color="#C2C2C2" />
                <Text style={styles.emptyStateTitle}>No Past Trips Yet</Text>
                <Text style={styles.emptyStateSubtitle}>
                  Your completed rides and receipts will automatically appear here.
                </Text>
              </View>
            ) : (
              pastRidesList.map((ride: any, index: number) => {
                const isCompleted = ride.ride_status === 'completed';
                const formattedDate = ride.completed_at
                  ? new Date(ride.completed_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })
                  : 'Recent Trip';

                const driverInfo = ride.driver || {
                  first_name: 'Driver',
                  last_name: 'Partner',
                  profile_image_url: 'https://randomuser.me/api/portraits/men/32.jpg',
                  rating: 4.9,
                  car_seats: 4,
                };

                return (
                  <View key={ride.id || index} style={styles.tripCard}>
                    <View style={styles.tripHeader}>
                      <View style={styles.tripIdContainer}>
                        <Ionicons name="car-sport" size={15} color="#0286FF" />
                        <Text style={styles.tripIdText}>
                          {ride.ride_number || `RD-${index + 101}`}
                        </Text>
                        <Text style={styles.tripTimeText}>• {formattedDate}</Text>
                      </View>
                      <View
                        style={[
                          styles.statusBadge,
                          isCompleted ? styles.completedBadge : styles.canceledBadge,
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusBadgeText,
                            isCompleted ? styles.completedText : styles.canceledText,
                          ]}
                        >
                          {ride.ride_status ? ride.ride_status.toUpperCase() : 'COMPLETED'}
                        </Text>
                      </View>
                    </View>

                    {/* Route Timeline */}
                    <View style={styles.routeTimeline}>
                      <View style={styles.timelineRow}>
                        <View style={[styles.timelineIcon, styles.originDot]} />
                        <Text style={styles.addressText} numberOfLines={1}>
                          {ride.origin_address || 'Origin Address'}
                        </Text>
                      </View>
                      <View style={styles.timelineConnector} />
                      <View style={styles.timelineRow}>
                        <View style={[styles.timelineIcon, styles.destDot]} />
                        <Text style={styles.addressText} numberOfLines={1}>
                          {ride.destination_address || 'Destination Address'}
                        </Text>
                      </View>
                    </View>

                    {/* Trip Metrics */}
                    <View style={styles.metricsQuad}>
                      <View style={styles.metricQuadItem}>
                        <Text style={styles.quadLabel}>Total Fare</Text>
                        <Text style={styles.quadValueHighlight}>
                          ₦{Number(ride.total_fare || 14.5).toFixed(2)}
                        </Text>
                      </View>
                      <View style={styles.metricQuadItem}>
                        <Text style={styles.quadLabel}>Distance</Text>
                        <Text style={styles.quadValue}>
                          {ride.distance_km || '4.2'} km
                        </Text>
                      </View>
                      <View style={styles.metricQuadItem}>
                        <Text style={styles.quadLabel}>Duration</Text>
                        <Text style={styles.quadValue}>
                          {ride.ride_time_mins || '18'} mins
                        </Text>
                      </View>
                      <View style={styles.metricQuadItem}>
                        <Text style={styles.quadLabel}>Payment</Text>
                        <Text style={styles.quadValueSuccess}>
                          {ride.payment_status || 'Paid'}
                        </Text>
                      </View>
                    </View>

                    {/* Driver Profile Strip */}
                    <View style={styles.driverStrip}>
                      <Image
                        source={{ uri: driverInfo.profile_image_url }}
                        style={styles.driverAvatar}
                      />
                      <View style={styles.driverInfo}>
                        <Text style={styles.driverName}>
                          {driverInfo.first_name} {driverInfo.last_name}
                        </Text>
                        <Text style={styles.driverVehicle}>
                          Veyo Executive • {driverInfo.car_seats || 4} Seats
                        </Text>
                      </View>
                      <View style={styles.ratingBadge}>
                        <Ionicons name="star" size={12} color="#EAB308" />
                        <Text style={styles.ratingText}>
                          {driverInfo.rating || '4.9'}
                        </Text>
                      </View>
                    </View>

                    {/* Action Footer */}
                    <View style={styles.cardFooter}>
                      <TouchableOpacity
                        style={styles.rebookButton}
                        activeOpacity={0.8}
                        onPress={() => handleRebookRide(ride)}
                      >
                        <Ionicons name="repeat" size={15} color="#0286FF" />
                        <Text style={styles.rebookButtonText}>Rebook Ride</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.supportButton}
                        activeOpacity={0.8}
                        onPress={() => handleOpenSupport(ride)}
                      >
                        <Feather name="help-circle" size={15} color="#666666" />
                        <Text style={styles.supportButtonText}>Trip Support</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* ============================================================== */}
        {/* TAB 3: SCHEDULED TRIPS LIST                                     */}
        {/* ============================================================== */}
        {activeTab === 'scheduled' && (
          <View style={styles.listContainer}>
            {scheduledList.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="calendar-clear-outline" size={48} color="#C2C2C2" />
                <Text style={styles.emptyStateTitle}>No Upcoming Rides</Text>
                <Text style={styles.emptyStateSubtitle}>
                  Planning a flight or commute? Schedule ahead to guarantee your ride.
                </Text>
                <TouchableOpacity
                  style={styles.emptyStateCTA}
                  activeOpacity={0.8}
                  onPress={() => setScheduleModalVisible(true)}
                >
                  <Text style={styles.emptyStateCTAText}>Schedule a Ride</Text>
                </TouchableOpacity>
              </View>
            ) : (
              scheduledList.map((item) => (
                <View key={item.id} style={styles.scheduledCard}>
                  <View style={styles.scheduledCardHeader}>
                    <View style={styles.scheduledTimePill}>
                      <Ionicons name="time-outline" size={14} color="#0286FF" />
                      <Text style={styles.scheduledTimeText}>{item.date}</Text>
                      <Text style={styles.scheduledTimeDot}>•</Text>
                      <Text style={styles.scheduledTimeText}>{item.time}</Text>
                    </View>
                    <View style={styles.confirmedBadge}>
                      <Text style={styles.confirmedBadgeText}>Confirmed</Text>
                    </View>
                  </View>

                  <Text style={styles.scheduledTitle}>{item.title}</Text>

                  <View style={styles.routeTimeline}>
                    <View style={styles.timelineRow}>
                      <View style={[styles.timelineIcon, styles.originDot]} />
                      <Text style={styles.addressText} numberOfLines={1}>
                        {item.origin}
                      </Text>
                    </View>
                    <View style={styles.timelineConnector} />
                    <View style={styles.timelineRow}>
                      <View style={[styles.timelineIcon, styles.destDot]} />
                      <Text style={styles.addressText} numberOfLines={1}>
                        {item.destination}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.scheduledFooterMeta}>
                    <View>
                      <Text style={styles.metaVehicleLabel}>{item.vehicleType}</Text>
                      <Text style={styles.metaFareEstimate}>
                        Est. ₦{item.estimatedFare.toFixed(2)}
                      </Text>
                    </View>

                    <View style={styles.scheduledActionsRow}>
                      <TouchableOpacity
                        style={styles.cancelScheduledBtn}
                        activeOpacity={0.8}
                        onPress={() => handleCancelScheduled(item.id)}
                      >
                        <Text style={styles.cancelScheduledText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.viewRouteBtn}
                        activeOpacity={0.8}
                        onPress={() => router.push('/(utils)/search?mode=Map')}
                      >
                        <Text style={styles.viewRouteText}>View Route</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
          </>
        )}
      </ScrollView>

      {/* AUXILIARY MODALS */}
      {/* 1. Quiet Mode Modal (Image 5) */}
      <QuietModeModal
        visible={quietModeVisible}
        onClose={() => setQuietModeVisible(false)}
      />

      {/* 2. Ride Chat Interface (Image 5) */}
      <RideChatModal
        visible={chatModalVisible}
        driverName="Barry John"
        driverAvatar="https://randomuser.me/api/portraits/men/32.jpg"
        etaMinutes={5}
        onClose={() => setChatModalVisible(false)}
      />

      {/* 3. Live Order / Shipment Tracking (Image 1) */}
      <OrderTrackingModal
        visible={trackingModalVisible}
        orderId="VEYO-29384-NG"
        onClose={() => setTrackingModalVisible(false)}
      />

      {/* 4. Schedule Ride Modal */}
      <Modal
        visible={scheduleModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setScheduleModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.scheduleModalSheet}>
            <Text style={styles.modalSheetTitle}>Schedule a Future Ride</Text>
            <View style={styles.scheduleForm}>
              <Text style={styles.inputLabel}>Trip Purpose / Label</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Flight Departure, Office Commute"
                value={scheduleTitle}
                onChangeText={setScheduleTitle}
              />
              <Text style={styles.inputLabel}>Scheduled Time</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Tomorrow, 07:00 AM"
                value={scheduleDate}
                onChangeText={setScheduleDate}
              />
              <Text style={styles.inputLabel}>Destination</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Destination Address"
                value={scheduleDestination}
                onChangeText={setScheduleDestination}
              />
            </View>
            <View style={styles.scheduleActions}>
              <TouchableOpacity
                style={styles.scheduleCancelBtn}
                onPress={() => setScheduleModalVisible(false)}
              >
                <Text style={styles.scheduleCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.scheduleSubmitBtn}
                onPress={handleCreateSchedule}
              >
                <Text style={styles.scheduleSubmitBtnText}>Confirm Booking</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 5. Trip Support Sheet */}
      <Modal
        visible={supportModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSupportModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.dragHandle} />
            <Text style={styles.modalSheetTitle}>Trip Support & Assistance</Text>
            <Text style={styles.modalSheetSubtitle}>
              Ride {selectedRideForSupport?.ride_number || 'RD-Selected'}
            </Text>

            <TouchableOpacity
              style={styles.supportOption}
              onPress={() => {
                setSupportModalVisible(false);
                Alert.alert('Item Recovery', 'Driver has been alerted regarding a lost item.');
              }}
            >
              <Ionicons name="briefcase-outline" size={20} color="#0286FF" />
              <View style={styles.supportOptionTextContainer}>
                <Text style={styles.supportOptionTitle}>I left an item in the car</Text>
                <Text style={styles.supportOptionDesc}>
                  Contact the driver or file a lost property report.
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.supportOption}
              onPress={() => {
                setSupportModalVisible(false);
                Alert.alert('Dispute Logged', 'A support ticket has been opened.');
              }}
            >
              <Ionicons name="card-outline" size={20} color="#0286FF" />
              <View style={styles.supportOptionTextContainer}>
                <Text style={styles.supportOptionTitle}>Fare or billing query</Text>
                <Text style={styles.supportOptionDesc}>
                  Review receipt breakdown, toll charges, or fare estimate issues.
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.supportOption}
              onPress={() => {
                setSupportModalVisible(false);
                Alert.alert('Invoice Sent', 'An official tax invoice has been emailed to you.');
              }}
            >
              <Ionicons name="download-outline" size={20} color="#0286FF" />
              <View style={styles.supportOptionTextContainer}>
                <Text style={styles.supportOptionTitle}>Download Tax Invoice</Text>
                <Text style={styles.supportOptionDesc}>
                  Get a verified PDF receipt for corporate expense claims.
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setSupportModalVisible(false)}
            >
              <Text style={styles.modalCloseButtonText}>Close Support</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#F6F8FA',
  },
  headerWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'transparent',
    paddingBottom: 10,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#EEEEEE',
    borderRadius: 14,
    padding: 3,
    marginBottom: 16,
  },
  segmentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 9,
    borderRadius: 11,
  },
  segmentButtonActive: {
    backgroundColor: '#3122D2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    fontFamily: 'JakartaMedium',
    fontSize: 12,
    color: '#666666',
  },
  segmentTextActive: {
    fontFamily: 'JakartaBold',
    color: '#FFFFFF',
  },
  mobilityHubCol: {
    gap: 16,
  },
  heroMapWrapper: {
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  trafficAlertPosition: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    zIndex: 20,
  },
  rideOptionsSection: {
    marginTop: 4,
  },
  rideOptionsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  rideOptionsTitle: {
    fontFamily: 'JakartaBold',
    fontSize: 16,
    color: '#0B1528',
  },
  scheduleRidePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  scheduleRidePillText: {
    fontFamily: 'JakartaBold',
    fontSize: 11,
    color: '#3122D2',
  },
  assistStrip: {
    flexDirection: 'column',
    gap: 10,
    marginTop: 4,
  },
  assistCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    gap: 12,
  },
  assistIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assistTitle: {
    fontFamily: 'JakartaBold',
    fontSize: 13,
    color: '#0B1528',
  },
  assistSub: {
    fontFamily: 'JakartaMedium',
    fontSize: 11,
    color: '#858585',
    marginTop: 1,
  },
  listContainer: {
    gap: 12,
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  emptyStateTitle: {
    fontFamily: 'JakartaBold',
    fontSize: 16,
    color: '#0B1528',
    marginTop: 12,
    marginBottom: 6,
  },
  emptyStateSubtitle: {
    fontFamily: 'JakartaMedium',
    fontSize: 12,
    color: '#858585',
    textAlign: 'center',
    lineHeight: 18,
  },
  emptyStateCTA: {
    marginTop: 16,
    backgroundColor: '#3122D2',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 14,
  },
  emptyStateCTAText: {
    fontFamily: 'JakartaBold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  tripCard: {
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
    marginBottom: 12,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tripIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tripIdText: {
    fontFamily: 'JakartaBold',
    fontSize: 13,
    color: '#0B1528',
  },
  tripTimeText: {
    fontFamily: 'JakartaMedium',
    fontSize: 11,
    color: '#858585',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  completedBadge: {
    backgroundColor: '#F0FFF4',
  },
  canceledBadge: {
    backgroundColor: '#FFF5F5',
  },
  statusBadgeText: {
    fontFamily: 'JakartaBold',
    fontSize: 9,
    letterSpacing: 0.5,
  },
  completedText: {
    color: '#0CC25F',
  },
  canceledText: {
    color: '#EF4444',
  },
  routeTimeline: {
    marginVertical: 8,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  timelineIcon: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  originDot: {
    backgroundColor: '#0CC25F',
  },
  destDot: {
    backgroundColor: '#EF4444',
  },
  timelineConnector: {
    width: 1.5,
    height: 14,
    backgroundColor: '#D1D5DB',
    marginLeft: 3.25,
    marginVertical: 2,
  },
  addressText: {
    fontFamily: 'JakartaMedium',
    fontSize: 12,
    color: '#4B5563',
    flex: 1,
  },
  metricsQuad: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 10,
    marginVertical: 10,
  },
  metricQuadItem: {
    alignItems: 'center',
  },
  quadLabel: {
    fontFamily: 'JakartaMedium',
    fontSize: 10,
    color: '#858585',
    marginBottom: 2,
  },
  quadValue: {
    fontFamily: 'JakartaBold',
    fontSize: 12,
    color: '#0B1528',
  },
  quadValueHighlight: {
    fontFamily: 'JakartaBold',
    fontSize: 12,
    color: '#3122D2',
  },
  quadValueSuccess: {
    fontFamily: 'JakartaBold',
    fontSize: 12,
    color: '#0CC25F',
  },
  driverStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 10,
  },
  driverAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontFamily: 'JakartaBold',
    fontSize: 12,
    color: '#0B1528',
  },
  driverVehicle: {
    fontFamily: 'JakartaMedium',
    fontSize: 10,
    color: '#858585',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  ratingText: {
    fontFamily: 'JakartaBold',
    fontSize: 10,
    color: '#D97706',
  },
  cardFooter: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  rebookButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#EEF2FF',
    paddingVertical: 9,
    borderRadius: 12,
  },
  rebookButtonText: {
    fontFamily: 'JakartaBold',
    fontSize: 11,
    color: '#3122D2',
  },
  supportButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    paddingVertical: 9,
    borderRadius: 12,
  },
  supportButtonText: {
    fontFamily: 'JakartaMedium',
    fontSize: 11,
    color: '#4B5563',
  },
  scheduledCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    marginBottom: 12,
  },
  scheduledCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  scheduledTimePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  scheduledTimeText: {
    fontFamily: 'JakartaBold',
    fontSize: 11,
    color: '#3122D2',
  },
  scheduledTimeDot: {
    color: '#3122D2',
  },
  confirmedBadge: {
    backgroundColor: '#F0FFF4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  confirmedBadgeText: {
    fontFamily: 'JakartaBold',
    fontSize: 10,
    color: '#0CC25F',
  },
  scheduledTitle: {
    fontFamily: 'JakartaBold',
    fontSize: 14,
    color: '#0B1528',
    marginBottom: 8,
  },
  scheduledFooterMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  metaVehicleLabel: {
    fontFamily: 'JakartaMedium',
    fontSize: 11,
    color: '#858585',
  },
  metaFareEstimate: {
    fontFamily: 'JakartaBold',
    fontSize: 13,
    color: '#3122D2',
  },
  scheduledActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelScheduledBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#FEE2E2',
  },
  cancelScheduledText: {
    fontFamily: 'JakartaBold',
    fontSize: 11,
    color: '#EF4444',
  },
  viewRouteBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#3122D2',
  },
  viewRouteText: {
    fontFamily: 'JakartaBold',
    fontSize: 11,
    color: '#FFFFFF',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  scheduleModalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
  },
  modalSheetTitle: {
    fontFamily: 'JakartaBold',
    fontSize: 16,
    color: '#0B1528',
    marginBottom: 16,
  },
  scheduleForm: {
    gap: 10,
    marginBottom: 20,
  },
  inputLabel: {
    fontFamily: 'JakartaBold',
    fontSize: 11,
    color: '#4B5563',
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    fontFamily: 'JakartaMedium',
    fontSize: 13,
    color: '#0B1528',
  },
  scheduleActions: {
    flexDirection: 'row',
    gap: 12,
  },
  scheduleCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  scheduleCancelBtnText: {
    fontFamily: 'JakartaBold',
    fontSize: 13,
    color: '#6B7280',
  },
  scheduleSubmitBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#3122D2',
    alignItems: 'center',
  },
  scheduleSubmitBtnText: {
    fontFamily: 'JakartaBold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalSheetSubtitle: {
    fontFamily: 'JakartaMedium',
    fontSize: 12,
    color: '#858585',
    marginBottom: 18,
  },
  supportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 14,
  },
  supportOptionTextContainer: {
    flex: 1,
  },
  supportOptionTitle: {
    fontFamily: 'JakartaBold',
    fontSize: 13,
    color: '#0B1528',
  },
  supportOptionDesc: {
    fontFamily: 'JakartaMedium',
    fontSize: 11,
    color: '#858585',
    marginTop: 2,
  },
  modalCloseButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 18,
  },
  modalCloseButtonText: {
    fontFamily: 'JakartaBold',
    fontSize: 13,
    color: '#4B5563',
  },
  // DRIVER LIVE DISPATCH STYLES
  driverDispatchCol: {
    gap: 16,
  },
  driverShiftCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#3122D2',
    shadowColor: '#3122D2',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  shiftHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  onlineStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
    gap: 6,
  },
  pulseGreenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  onlineStatusBadgeText: {
    fontFamily: 'JakartaBold',
    fontSize: 10,
    color: '#059669',
    letterSpacing: 0.5,
  },
  surgeIndicatorText: {
    fontFamily: 'JakartaBold',
    fontSize: 12,
    color: '#EA580C',
  },
  shiftMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 12,
  },
  shiftMetricCol: {
    alignItems: 'center',
  },
  shiftMetricVal: {
    fontFamily: 'JakartaBold',
    fontSize: 16,
    color: '#0B1528',
  },
  shiftMetricLbl: {
    fontFamily: 'JakartaMedium',
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  driverMapFrame: {
    height: 210,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E6F3FF',
  },
  incomingDispatchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 2,
    borderColor: '#F59E0B',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  dispatchTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  incomingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 4,
  },
  incomingPillText: {
    fontFamily: 'JakartaBold',
    fontSize: 10,
    color: '#D97706',
    letterSpacing: 0.5,
  },
  dispatchFare: {
    fontFamily: 'JakartaBold',
    fontSize: 22,
    color: '#0286FF',
  },
  dispatchRiderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dispatchRiderAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  dispatchRiderName: {
    fontFamily: 'JakartaBold',
    fontSize: 15,
    color: '#0B1528',
  },
  dispatchRiderRating: {
    fontFamily: 'JakartaMedium',
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  surgeBoostBadge: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FDBA74',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  surgeBoostText: {
    fontFamily: 'JakartaBold',
    fontSize: 11,
    color: '#EA580C',
  },
  dispatchRouteBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  routePointRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  routeHairline: {
    width: 2,
    height: 12,
    backgroundColor: '#D1D5DB',
    marginLeft: 3,
    marginVertical: 2,
  },
  routeAddressText: {
    fontFamily: 'JakartaMedium',
    fontSize: 12,
    color: '#374151',
  },
  dispatchBtnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  declineBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  declineBtnText: {
    fontFamily: 'JakartaSemiBold',
    fontSize: 14,
    color: '#6B7280',
  },
  acceptBtn: {
    flex: 2,
    backgroundColor: '#0286FF',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  acceptBtnText: {
    fontFamily: 'JakartaBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  activeTripCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#0286FF',
  },
  activeTripTitle: {
    fontFamily: 'JakartaBold',
    fontSize: 15,
    color: '#0B1528',
    marginTop: 6,
  },
  activeTripActionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },
  chatRiderBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    gap: 6,
  },
  chatRiderText: {
    fontFamily: 'JakartaBold',
    fontSize: 13,
    color: '#3122D2',
  },
  startTripBtn: {
    flex: 2,
    backgroundColor: '#3122D2',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startTripText: {
    fontFamily: 'JakartaBold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  idleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  idleTitle: {
    fontFamily: 'JakartaBold',
    fontSize: 16,
    color: '#0B1528',
    marginTop: 10,
  },
  idleSub: {
    fontFamily: 'JakartaMedium',
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 16,
  },
  simulateBtn: {
    backgroundColor: '#0286FF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  simulateBtnText: {
    fontFamily: 'JakartaBold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  driverQuickActions: {
    flexDirection: 'row',
    gap: 10,
  },
  driverQuickBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    gap: 6,
  },
  driverQuickText: {
    fontFamily: 'JakartaSemiBold',
    fontSize: 12,
    color: '#1F2937',
  },
});
