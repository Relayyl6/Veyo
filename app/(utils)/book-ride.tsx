import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, Feather, FontAwesome5 } from '@expo/vector-icons';

import Map from '@/components/Map';
import WhereToInput from '@/components/WhereToInput';
import DestinationShortcuts, { ShortcutItem } from '@/components/DestinationShortcuts';
import RideOptionCard, { RideOption } from '@/components/RideOptionCard';
import TrafficAlertBanner from '@/components/TrafficAlertBanner';
import QuietModeModal from '@/components/QuietModeModal';
import RideChatModal from '@/components/RideChatModal';
import { useLocationStore } from '@/store/store';

const BOOKING_OPTIONS: RideOption[] = [
  {
    id: 'opt-econ',
    name: 'Economy',
    eta: '4 mins away',
    subtitle: 'Affordable daily trips',
    price: '$14.50',
    badge: 'FASTEST',
    badgeType: 'fastest',
    iconType: 'car',
  },
  {
    id: 'opt-comfort',
    name: 'Comfort',
    eta: '6 mins away',
    subtitle: 'Premium sedan with AC',
    price: '$22.00',
    iconType: 'comfort',
  },
  {
    id: 'opt-ev',
    name: 'Veyo EV',
    eta: '8 mins away',
    subtitle: 'Zero-emission electric vehicle',
    price: '$18.00',
    badge: 'ECO FRIENDLY',
    badgeType: 'eco',
    iconType: 'ev',
  },
  {
    id: 'opt-bike',
    name: 'Express Bike',
    eta: '2 mins away',
    subtitle: 'Beat the heavy urban traffic',
    price: '$8.50',
    iconType: 'bike',
  },
  {
    id: 'opt-black',
    name: 'Veyo Black',
    eta: '10 mins away',
    subtitle: 'Luxury chauffeured transport',
    price: '$35.00',
    badge: 'TOP RATED',
    iconType: 'luxury',
  },
];

export default function BookRideScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const {
    userAddress,
    destinationAddress,
    setUserLocation,
    setDestinationLocation,
  } = useLocationStore();

  const [pickupText, setPickupText] = useState(userAddress || 'Current Location (VI, Lagos)');
  const [destText, setDestText] = useState(destinationAddress || 'Lekki Phase 1, Admiralty Way');
  const [selectedOption, setSelectedOption] = useState<RideOption>(BOOKING_OPTIONS[0]);
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'card' | 'applepay'>('wallet');

  // Modals state
  const [quietModeVisible, setQuietModeVisible] = useState(false);
  const [chatModalVisible, setChatModalVisible] = useState(false);

  const handleShortcutSelect = (shortcut: ShortcutItem) => {
    setDestText(shortcut.title);
    setDestinationLocation({
      latitude: shortcut.latitude || 6.4474,
      longitude: shortcut.longitude || 3.4723,
      address: shortcut.title,
    });
  };

  const handleConfirmRide = () => {
    Alert.alert(
      'Ride Requested!',
      `Searching for nearby ${selectedOption.name} drivers. Upfront estimate: ${selectedOption.price}`,
      [
        {
          text: 'Open Driver Chat',
          onPress: () => setChatModalVisible(true),
        },
        {
          text: 'View on Map',
          onPress: () => router.push('/(root)/(tabs)/trips'),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* 1. Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color="#0B1528" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book a Ride</Text>
        <TouchableOpacity
          style={styles.quietModeTrigger}
          onPress={() => setQuietModeVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="volume-mute-outline" size={18} color="#3122D2" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 2. Embedded Map Preview Card */}
        <View style={styles.mapFrame}>
          <Map
            height={200}
            showExpandButton={true}
            showRecenterButton={true}
            showDriverCount={true}
            interactive={true}
          />

          <View style={styles.trafficAlertOverlay}>
            <TrafficAlertBanner
              title="LIVE TRAFFIC ALERT"
              subtitle="Expressway flowing smoothly • Save 12 mins"
              buttonText="Optimal"
              onReroutePress={() => Alert.alert('Optimal Route', 'Fastest path chosen.')}
            />
          </View>
        </View>

        {/* 3. Where To Dual Input Component */}
        <WhereToInput
          pickupAddress={pickupText}
          destinationAddress={destText}
          onPickupChange={setPickupText}
          onDestinationChange={setDestText}
          onSwapLocations={() => {
            const temp = pickupText;
            setPickupText(destText);
            setDestText(temp);
          }}
          onSearchPress={() => router.push('/(utils)/search?mode=Map')}
        />

        {/* 4. Destination Shortcuts */}
        <DestinationShortcuts onSelectShortcut={handleShortcutSelect} />

        {/* 5. Vehicle Tier Selection List */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Select Vehicle Tier</Text>
          <Text style={styles.subtext}>4 drivers available nearby</Text>
        </View>

        <View style={styles.optionsList}>
          {BOOKING_OPTIONS.map((opt) => (
            <RideOptionCard
              key={opt.id}
              option={opt}
              isSelected={selectedOption.id === opt.id}
              onSelect={(o) => setSelectedOption(o)}
            />
          ))}
        </View>

        {/* 6. Payment Method Selector */}
        <View style={styles.paymentCard}>
          <Text style={styles.paymentHeader}>PAYMENT METHOD</Text>

          <View style={styles.paymentRow}>
            <TouchableOpacity
              style={[
                styles.paymentPill,
                paymentMethod === 'wallet' && styles.paymentPillActive,
              ]}
              onPress={() => setPaymentMethod('wallet')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="wallet"
                size={14}
                color={paymentMethod === 'wallet' ? '#FFFFFF' : '#3122D2'}
              />
              <Text
                style={[
                  styles.paymentPillText,
                  paymentMethod === 'wallet' && styles.paymentPillTextActive,
                ]}
              >
                Veyo Wallet
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentPill,
                paymentMethod === 'card' && styles.paymentPillActive,
              ]}
              onPress={() => setPaymentMethod('card')}
              activeOpacity={0.8}
            >
              <FontAwesome5
                name="credit-card"
                size={12}
                color={paymentMethod === 'card' ? '#FFFFFF' : '#4B5563'}
              />
              <Text
                style={[
                  styles.paymentPillText,
                  paymentMethod === 'card' && styles.paymentPillTextActive,
                ]}
              >
                •••• 8463
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentPill,
                paymentMethod === 'applepay' && styles.paymentPillActive,
              ]}
              onPress={() => setPaymentMethod('applepay')}
              activeOpacity={0.8}
            >
              <FontAwesome5
                name="apple"
                size={14}
                color={paymentMethod === 'applepay' ? '#FFFFFF' : '#0B1528'}
              />
              <Text
                style={[
                  styles.paymentPillText,
                  paymentMethod === 'applepay' && styles.paymentPillTextActive,
                ]}
              >
                Apple Pay
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* 7. Bottom Sticky Confirm CTA */}
      <View style={styles.footer}>
        <View style={styles.footerPriceCol}>
          <Text style={styles.footerPriceLabel}>Total Upfront</Text>
          <Text style={styles.footerPriceValue}>{selectedOption.price}</Text>
        </View>

        <TouchableOpacity
          style={styles.confirmBtn}
          onPress={handleConfirmRide}
          activeOpacity={0.88}
        >
          <Text style={styles.confirmBtnText}>
            Confirm {selectedOption.name} →
          </Text>
        </TouchableOpacity>
      </View>

      {/* AUXILIARY MODALS */}
      <QuietModeModal
        visible={quietModeVisible}
        onClose={() => setQuietModeVisible(false)}
      />

      <RideChatModal
        visible={chatModalVisible}
        driverName="David K."
        driverAvatar="https://randomuser.me/api/portraits/men/44.jpg"
        etaMinutes={4}
        onClose={() => setChatModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F8FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: 'JakartaBold',
    fontSize: 18,
    color: '#0B1528',
  },
  quietModeTrigger: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  mapFrame: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E6F3FF',
    position: 'relative',
  },
  trafficAlertOverlay: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  sectionTitle: {
    fontFamily: 'JakartaBold',
    fontSize: 16,
    color: '#0B1528',
  },
  subtext: {
    fontFamily: 'JakartaMedium',
    fontSize: 12,
    color: '#6B7280',
  },
  optionsList: {
    gap: 10,
  },
  paymentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  paymentHeader: {
    fontFamily: 'JakartaBold',
    fontSize: 11,
    color: '#6B7280',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  paymentRow: {
    flexDirection: 'row',
    gap: 8,
  },
  paymentPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 6,
  },
  paymentPillActive: {
    backgroundColor: '#0286FF',
    borderColor: '#0286FF',
  },
  paymentPillText: {
    fontFamily: 'JakartaSemiBold',
    fontSize: 12,
    color: '#4B5563',
  },
  paymentPillTextActive: {
    color: '#FFFFFF',
    fontFamily: 'JakartaBold',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    gap: 14,
  },
  footerPriceCol: {
    alignItems: 'flex-start',
  },
  footerPriceLabel: {
    fontFamily: 'JakartaMedium',
    fontSize: 11,
    color: '#858585',
  },
  footerPriceValue: {
    fontFamily: 'JakartaBold',
    fontSize: 22,
    color: '#0286FF',
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: '#0286FF',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#0286FF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  confirmBtnText: {
    fontFamily: 'JakartaBold',
    fontSize: 15,
    color: '#FFFFFF',
  },
});
