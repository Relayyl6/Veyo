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
import SavedPlacesRow from '@/components/SavedPlacesRow';
import { useLocationStore } from '@/store/store';
import { rides as mockRidesData } from '@/constants/data';
import { getEnrichedRide } from '@/lib/dataResolvers';
import { images } from '@/constants/utils';
import { Ride } from '@/types/data';

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

const TripsScreen = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useUser();
  const { setDestinationLocation, setUserLocation } = useLocationStore();

  const [activeTab, setActiveTab] = useState<'past' | 'scheduled'>('past');
  const [scheduledList, setScheduledList] = useState<ScheduledRide[]>(INITIAL_SCHEDULED_RIDES);

  // Support modal state
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
    Alert.alert(
      'Cancel Scheduled Trip',
      'Are you sure you want to cancel this scheduled reservation? No cancellation fee applies before driver dispatch.',
      [
        { text: 'Keep Reservation', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            setScheduledList((prev) => prev.filter((item) => item.id !== id));
          },
        },
      ]
    );
  };

  const handleCreateSchedule = () => {
    if (!scheduleTitle.trim()) {
      Alert.alert('Required', 'Please enter a title for your scheduled ride.');
      return;
    }

    const newTrip: ScheduledRide = {
      id: `sched-${Date.now()}`,
      title: scheduleTitle,
      date: scheduleDate,
      time: 'Scheduled',
      origin: 'Current Location',
      destination: scheduleDestination,
      vehicleType: 'Veyo Standard',
      estimatedFare: 32.0,
      status: 'confirmed',
    };

    setScheduledList([newTrip, ...scheduledList]);
    setScheduleModalVisible(false);
    setScheduleTitle('');
    setActiveTab('scheduled');
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
        {/* 2. OVERVIEW METRICS BANNER */}
        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <View style={[styles.metricIconCircle, { backgroundColor: '#EBF4FF' }]}>
              <Ionicons name="time" size={16} color="#0286FF" />
            </View>
            <View>
              <Text style={styles.metricValue}>{pastRidesList.length}</Text>
              <Text style={styles.metricLabel}>Past Trips</Text>
            </View>
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.metricIconCircle, { backgroundColor: '#F0FFF4' }]}>
              <Ionicons name="calendar" size={16} color="#0CC25F" />
            </View>
            <View>
              <Text style={styles.metricValue}>{scheduledList.length}</Text>
              <Text style={styles.metricLabel}>Scheduled</Text>
            </View>
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.metricIconCircle, { backgroundColor: '#FFF5F5' }]}>
              <Ionicons name="shield-checkmark" size={16} color="#3122D2" />
            </View>
            <View>
              <Text style={styles.metricValue}>100%</Text>
              <Text style={styles.metricLabel}>Protected</Text>
            </View>
          </View>
        </View>

        {/* 3. HERO EMBEDDED MAP CARD */}
        <View style={styles.mapSection}>
          <View style={styles.mapHeaderRow}>
            <View style={styles.mapTitleGroup}>
              <Ionicons name="compass" size={18} color="#0286FF" />
              <Text style={styles.mapTitle}>Live Navigation & Area Radar</Text>
            </View>
            <TouchableOpacity
              style={styles.mapActionPill}
              activeOpacity={0.7}
              onPress={() => router.push('/(utils)/map')}
            >
              <Text style={styles.mapActionText}>Explore Full Map</Text>
              <Feather name="arrow-up-right" size={14} color="#0286FF" />
            </TouchableOpacity>
          </View>

          <Map
            height={210}
            showExpandButton={true}
            showRecenterButton={true}
            showDriverCount={true}
            interactive={true}
          />
        </View>

        {/* 4. QUICK ACTION SHORTCUTS */}
        <View style={styles.quickActionRow}>
          <TouchableOpacity
            style={[styles.quickActionButton, styles.primaryQuickAction]}
            activeOpacity={0.8}
            onPress={() => router.push('/(utils)/book-ride')}
          >
            <FontAwesome5 name="car" size={16} color="#FFFFFF" />
            <Text style={styles.primaryQuickActionText}>Book Ride Now</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickActionButton, styles.secondaryQuickAction]}
            activeOpacity={0.8}
            onPress={() => setScheduleModalVisible(true)}
          >
            <Ionicons name="calendar-outline" size={18} color="#0286FF" />
            <Text style={styles.secondaryQuickActionText}>Schedule Future</Text>
          </TouchableOpacity>
        </View>

        {/* 5. SAVED PLACES SHORTCUT ROW */}
        <View style={styles.savedPlacesContainer}>
          <SavedPlacesRow />
        </View>

        {/* 6. SEGMENTED TAB SELECTOR */}
        <View style={styles.segmentedControl}>
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
              size={16}
              color={activeTab === 'past' ? '#FFFFFF' : '#858585'}
            />
            <Text
              style={[
                styles.segmentText,
                activeTab === 'past' && styles.segmentTextActive,
              ]}
            >
              Past Trips ({pastRidesList.length})
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
              size={16}
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

        {/* 7. TAB CONTENT */}
        {activeTab === 'past' ? (
          /* --- PAST TRIPS TAB --- */
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

                const driverInfo = ride.customer ? ride.driverDetails : null;

                return (
                  <View key={ride.id || index} style={styles.tripCard}>
                    {/* Card Top: Number & Status */}
                    <View style={styles.cardHeader}>
                      <View>
                        <Text style={styles.rideNumber}>
                          {ride.ride_number || `Ride #${index + 1}`}
                        </Text>
                        <Text style={styles.rideDate}>{formattedDate}</Text>
                      </View>

                      <View
                        style={[
                          styles.statusBadge,
                          isCompleted
                            ? styles.statusCompletedBadge
                            : styles.statusCanceledBadge,
                        ]}
                      >
                        <View
                          style={[
                            styles.statusDot,
                            { backgroundColor: isCompleted ? '#0CC25F' : '#F56565' },
                          ]}
                        />
                        <Text
                          style={[
                            styles.statusText,
                            { color: isCompleted ? '#2F855A' : '#C53030' },
                          ]}
                        >
                          {isCompleted ? 'Completed' : 'Canceled'}
                        </Text>
                      </View>
                    </View>

                    {/* Route Timeline */}
                    <View style={styles.routeTimeline}>
                      {/* Origin */}
                      <View style={styles.timelineRow}>
                        <View style={[styles.timelineIcon, styles.originDot]} />
                        <Text style={styles.addressText} numberOfLines={1}>
                          {ride.origin_address || 'Origin Address'}
                        </Text>
                      </View>

                      {/* Line connector */}
                      <View style={styles.timelineConnector} />

                      {/* Destination */}
                      <View style={styles.timelineRow}>
                        <View style={[styles.timelineIcon, styles.destDot]} />
                        <Text style={styles.addressText} numberOfLines={1}>
                          {ride.destination_address || 'Destination Address'}
                        </Text>
                      </View>
                    </View>

                    {/* Stats Row */}
                    <View style={styles.statsRow}>
                      <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Total Fare</Text>
                        <Text style={styles.statFare}>
                          ${Number(ride.total_fare || 0).toFixed(2)}
                        </Text>
                      </View>

                      <View style={styles.statDivider} />

                      <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Distance</Text>
                        <Text style={styles.statValue}>
                          {ride.distance_km ? `${ride.distance_km} km` : '4.8 km'}
                        </Text>
                      </View>

                      <View style={styles.statDivider} />

                      <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Duration</Text>
                        <Text style={styles.statValue}>
                          {ride.ride_time_mins ? `${ride.ride_time_mins} min` : '22 min'}
                        </Text>
                      </View>

                      <View style={styles.statDivider} />

                      <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Payment</Text>
                        <Text style={styles.statValue}>
                          {ride.payment_status || 'Paid'}
                        </Text>
                      </View>
                    </View>

                    {/* Driver details snippet if available */}
                    {driverInfo && (
                      <View style={styles.driverSnippet}>
                        <Image
                          source={{
                            uri:
                              driverInfo.avatar_url ||
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
                          }}
                          style={styles.driverAvatar}
                        />
                        <View style={styles.driverMeta}>
                          <Text style={styles.driverName}>
                            {driverInfo.full_name || 'Verified Driver'}
                          </Text>
                          <Text style={styles.driverVehicle}>
                            {driverInfo.vehicle || 'Comfort Vehicle'}
                          </Text>
                        </View>
                        <View style={styles.ratingBadge}>
                          <Ionicons name="star" size={12} color="#EAB308" />
                          <Text style={styles.ratingText}>
                            {driverInfo.rating || '4.9'}
                          </Text>
                        </View>
                      </View>
                    )}

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
        ) : (
          /* --- SCHEDULED TRIPS TAB --- */
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
                  {/* Card Header */}
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

                  {/* Route points */}
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

                  {/* Estimated Details */}
                  <View style={styles.scheduledFooterMeta}>
                    <View>
                      <Text style={styles.metaVehicleLabel}>{item.vehicleType}</Text>
                      <Text style={styles.metaFareEstimate}>
                        Est. ${item.estimatedFare.toFixed(2)}
                      </Text>
                    </View>

                    <View style={styles.scheduledActionsRow}>
                      <TouchableOpacity
                        style={styles.cancelScheduledBtn}
                        activeOpacity={0.8}
                        onPress={() => handleCancelScheduled(item.id)}
                      >
                        <Text style={styles.cancelScheduledBtnText}>Cancel</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.editScheduledBtn}
                        activeOpacity={0.8}
                        onPress={() => router.push('/(utils)/map')}
                      >
                        <Text style={styles.editScheduledBtnText}>View Route</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* 8. TRIP SUPPORT MODAL */}
      <Modal
        visible={supportModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSupportModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalHeaderTitle}>Trip Support & Assistance</Text>
            <Text style={styles.modalHeaderSubtitle}>
              Ride {selectedRideForSupport?.ride_number || 'Details'}
            </Text>

            <View style={styles.supportOptionsList}>
              <TouchableOpacity
                style={styles.supportOptionItem}
                activeOpacity={0.7}
                onPress={() => {
                  setSupportModalVisible(false);
                  Alert.alert(
                    'Lost Item Support',
                    'A support ticket has been registered. We are alerting the driver to verify and contact you securely.'
                  );
                }}
              >
                <View style={[styles.supportOptionIcon, { backgroundColor: '#FFF5F5' }]}>
                  <Ionicons name="briefcase" size={20} color="#F56565" />
                </View>
                <View style={styles.supportOptionTextGroup}>
                  <Text style={styles.supportOptionTitle}>I left an item in the car</Text>
                  <Text style={styles.supportOptionDesc}>
                    Contact driver or report misplaced belongings
                  </Text>
                </View>
                <Feather name="chevron-right" size={18} color="#AAAAAA" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.supportOptionItem}
                activeOpacity={0.7}
                onPress={() => {
                  setSupportModalVisible(false);
                  Alert.alert(
                    'Fare Review',
                    'Our billing team is reviewing this trip fare. You will receive an update in your notifications within 2 hours.'
                  );
                }}
              >
                <View style={[styles.supportOptionIcon, { backgroundColor: '#EBF4FF' }]}>
                  <Ionicons name="card" size={20} color="#0286FF" />
                </View>
                <View style={styles.supportOptionTextGroup}>
                  <Text style={styles.supportOptionTitle}>Fare or billing query</Text>
                  <Text style={styles.supportOptionDesc}>
                    Dispute charges, tolls, or review detailed receipt
                  </Text>
                </View>
                <Feather name="chevron-right" size={18} color="#AAAAAA" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.supportOptionItem}
                activeOpacity={0.7}
                onPress={() => {
                  setSupportModalVisible(false);
                  Alert.alert(
                    'Receipt Emailed',
                    'An itemized PDF receipt has been sent to your registered email address.'
                  );
                }}
              >
                <View style={[styles.supportOptionIcon, { backgroundColor: '#F0FFF4' }]}>
                  <Ionicons name="document-text" size={20} color="#0CC25F" />
                </View>
                <View style={styles.supportOptionTextGroup}>
                  <Text style={styles.supportOptionTitle}>Download Tax Invoice</Text>
                  <Text style={styles.supportOptionDesc}>
                    Get official PDF receipt for expense reporting
                  </Text>
                </View>
                <Feather name="chevron-right" size={18} color="#AAAAAA" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.modalCloseButton}
              activeOpacity={0.8}
              onPress={() => setSupportModalVisible(false)}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 9. SCHEDULE RIDE MODAL */}
      <Modal
        visible={scheduleModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setScheduleModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalHeaderTitle}>Schedule a Future Trip</Text>
            <Text style={styles.modalHeaderSubtitle}>
              Reserve a ride ahead of time for peace of mind
            </Text>

            <View style={styles.scheduleForm}>
              <Text style={styles.inputLabel}>Trip Title / Label</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Flight to Abuja, Morning Commute"
                value={scheduleTitle}
                onChangeText={setScheduleTitle}
                placeholderTextColor="#AAAAAA"
              />

              <Text style={styles.inputLabel}>Date & Departure Time</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Tomorrow, 06:30 AM"
                value={scheduleDate}
                onChangeText={setScheduleDate}
                placeholderTextColor="#AAAAAA"
              />

              <Text style={styles.inputLabel}>Destination</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Where would you like to go?"
                value={scheduleDestination}
                onChangeText={setScheduleDestination}
                placeholderTextColor="#AAAAAA"
              />
            </View>

            <View style={styles.scheduleActions}>
              <TouchableOpacity
                style={styles.scheduleCancelBtn}
                activeOpacity={0.8}
                onPress={() => setScheduleModalVisible(false)}
              >
                <Text style={styles.scheduleCancelBtnText}>Dismiss</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.scheduleSubmitBtn}
                activeOpacity={0.8}
                onPress={handleCreateSchedule}
              >
                <Text style={styles.scheduleSubmitBtnText}>Confirm Reservation</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default TripsScreen;

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#F6F8FA',
    position: 'relative',
  },
  headerWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    backgroundColor: '#F6F8FA',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 12,
    gap: 8,
  },
  metricCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  metricIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricValue: {
    fontFamily: 'JakartaBold',
    fontSize: 14,
    color: '#0B1528',
  },
  metricLabel: {
    fontFamily: 'JakartaMedium',
    fontSize: 10,
    color: '#858585',
  },
  mapSection: {
    marginBottom: 14,
  },
  mapHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  mapTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  mapTitle: {
    fontFamily: 'JakartaBold',
    fontSize: 14,
    color: '#0B1528',
  },
  mapActionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  mapActionText: {
    fontFamily: 'JakartaBold',
    fontSize: 11,
    color: '#0286FF',
  },
  quickActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 14,
    gap: 8,
  },
  primaryQuickAction: {
    backgroundColor: '#0286FF',
    ...Platform.select({
      ios: {
        shadowColor: '#0286FF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  primaryQuickActionText: {
    fontFamily: 'JakartaBold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  secondaryQuickAction: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#C3D9FF',
  },
  secondaryQuickActionText: {
    fontFamily: 'JakartaBold',
    fontSize: 13,
    color: '#0286FF',
  },
  savedPlacesContainer: {
    marginBottom: 14,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#EEEEEE',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  segmentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  segmentButtonActive: {
    backgroundColor: '#0286FF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  segmentText: {
    fontFamily: 'JakartaBold',
    fontSize: 12,
    color: '#666666',
  },
  segmentTextActive: {
    color: '#FFFFFF',
  },
  listContainer: {
    gap: 12,
  },
  tripCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  rideNumber: {
    fontFamily: 'JakartaBold',
    fontSize: 14,
    color: '#0B1528',
  },
  rideDate: {
    fontFamily: 'JakartaMedium',
    fontSize: 11,
    color: '#858585',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusCompletedBadge: {
    backgroundColor: '#F0FFF4',
    borderWidth: 1,
    borderColor: '#C6F6D5',
  },
  statusCanceledBadge: {
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FED7D7',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontFamily: 'JakartaBold',
    fontSize: 10,
  },
  routeTimeline: {
    marginBottom: 12,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
    backgroundColor: '#F56565',
  },
  timelineConnector: {
    width: 2,
    height: 12,
    backgroundColor: '#CED1DD',
    marginLeft: 3,
    marginVertical: 2,
  },
  addressText: {
    flex: 1,
    fontFamily: 'JakartaMedium',
    fontSize: 12,
    color: '#333333',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#F6F8FA',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontFamily: 'JakartaMedium',
    fontSize: 9,
    color: '#858585',
    marginBottom: 2,
  },
  statFare: {
    fontFamily: 'JakartaBold',
    fontSize: 12,
    color: '#0286FF',
  },
  statValue: {
    fontFamily: 'JakartaBold',
    fontSize: 11,
    color: '#333333',
  },
  statDivider: {
    width: 1,
    height: 18,
    backgroundColor: '#CED1DD',
  },
  driverSnippet: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    marginBottom: 10,
    gap: 10,
  },
  driverAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EEEEEE',
  },
  driverMeta: {
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
    paddingVertical: 3,
    borderRadius: 8,
  },
  ratingText: {
    fontFamily: 'JakartaBold',
    fontSize: 11,
    color: '#B46E2A',
  },
  cardFooter: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 4,
  },
  rebookButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EBF4FF',
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  rebookButtonText: {
    fontFamily: 'JakartaBold',
    fontSize: 11,
    color: '#0286FF',
  },
  supportButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F8F8',
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  supportButtonText: {
    fontFamily: 'JakartaBold',
    fontSize: 11,
    color: '#666666',
  },
  scheduledCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#C3D9FF',
    ...Platform.select({
      ios: {
        shadowColor: '#0286FF',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  scheduledCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  scheduledTimePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF4FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  scheduledTimeText: {
    fontFamily: 'JakartaBold',
    fontSize: 10,
    color: '#0286FF',
  },
  scheduledTimeDot: {
    color: '#0286FF',
    fontSize: 10,
  },
  confirmedBadge: {
    backgroundColor: '#F0FFF4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C6F6D5',
  },
  confirmedBadgeText: {
    fontFamily: 'JakartaBold',
    fontSize: 10,
    color: '#2F855A',
  },
  scheduledTitle: {
    fontFamily: 'JakartaBold',
    fontSize: 14,
    color: '#0B1528',
    marginBottom: 10,
  },
  scheduledFooterMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 10,
    marginTop: 4,
  },
  metaVehicleLabel: {
    fontFamily: 'JakartaMedium',
    fontSize: 11,
    color: '#858585',
  },
  metaFareEstimate: {
    fontFamily: 'JakartaBold',
    fontSize: 13,
    color: '#0286FF',
  },
  scheduledActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelScheduledBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FED7D7',
  },
  cancelScheduledBtnText: {
    fontFamily: 'JakartaBold',
    fontSize: 11,
    color: '#E53E3E',
  },
  editScheduledBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#0286FF',
  },
  editScheduledBtnText: {
    fontFamily: 'JakartaBold',
    fontSize: 11,
    color: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 36,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  emptyStateTitle: {
    fontFamily: 'JakartaBold',
    fontSize: 16,
    color: '#0B1528',
    marginTop: 12,
  },
  emptyStateSubtitle: {
    fontFamily: 'JakartaMedium',
    fontSize: 12,
    color: '#858585',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  emptyStateCTA: {
    marginTop: 16,
    backgroundColor: '#0286FF',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  emptyStateCTAText: {
    fontFamily: 'JakartaBold',
    fontSize: 12,
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D9D9D9',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeaderTitle: {
    fontFamily: 'JakartaBold',
    fontSize: 18,
    color: '#0B1528',
  },
  modalHeaderSubtitle: {
    fontFamily: 'JakartaMedium',
    fontSize: 12,
    color: '#858585',
    marginTop: 2,
    marginBottom: 18,
  },
  supportOptionsList: {
    gap: 12,
    marginBottom: 20,
  },
  supportOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8F8F8',
    borderRadius: 14,
    gap: 12,
  },
  supportOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  supportOptionTextGroup: {
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
    backgroundColor: '#EEEEEE',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    fontFamily: 'JakartaBold',
    fontSize: 13,
    color: '#333333',
  },
  scheduleForm: {
    gap: 12,
    marginBottom: 20,
  },
  inputLabel: {
    fontFamily: 'JakartaBold',
    fontSize: 12,
    color: '#333333',
    marginBottom: -4,
  },
  textInput: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: 'JakartaMedium',
    fontSize: 13,
    color: '#0B1528',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  scheduleActions: {
    flexDirection: 'row',
    gap: 10,
  },
  scheduleCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#EEEEEE',
    alignItems: 'center',
  },
  scheduleCancelBtnText: {
    fontFamily: 'JakartaBold',
    fontSize: 13,
    color: '#666666',
  },
  scheduleSubmitBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#0286FF',
    alignItems: 'center',
  },
  scheduleSubmitBtnText: {
    fontFamily: 'JakartaBold',
    fontSize: 13,
    color: '#FFFFFF',
  },
});
