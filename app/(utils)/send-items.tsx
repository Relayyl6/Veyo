import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, Feather, FontAwesome5 } from '@expo/vector-icons';

import Map from '@/components/Map';
import WhereToInput from '@/components/WhereToInput';
import PackageTrackerCard from '@/components/PackageTrackerCard';
import OrderTrackingModal from '@/components/OrderTrackingModal';

interface ParcelSize {
  id: string;
  title: string;
  subtitle: string;
  price: string;
  icon: string;
}

const PARCEL_SIZES: ParcelSize[] = [
  {
    id: 'small',
    title: 'Small Parcel',
    subtitle: 'Documents, keys, small gift',
    price: '$6.50',
    icon: 'mail',
  },
  {
    id: 'medium',
    title: 'Medium Box',
    subtitle: 'Up to 5kg, shoe box, electronics',
    price: '$12.00',
    icon: 'cube',
  },
  {
    id: 'large',
    title: 'Large Cargo',
    subtitle: 'Heavy freight, multiple boxes',
    price: '$24.00',
    icon: 'briefcase',
  },
];

export default function SendItemsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [pickup, setPickup] = useState('78 Marina Blvd, Victoria Island');
  const [dropoff, setDropoff] = useState('12 Admiralty Way, Lekki Phase 1');
  const [selectedSize, setSelectedSize] = useState<ParcelSize>(PARCEL_SIZES[0]);

  // Recipient info
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [packageNotes, setPackageNotes] = useState('');

  // Tracking modal
  const [trackingModalVisible, setTrackingModalVisible] = useState(false);
  const [activeTrackingId, setActiveTrackingId] = useState('PKG-8921-NG');

  const handleBookCourier = () => {
    if (!recipientName.trim()) {
      Alert.alert('Recipient Required', 'Please enter recipient name.');
      return;
    }

    const generatedId = `PKG-${Math.floor(1000 + Math.random() * 9000)}-NG`;
    setActiveTrackingId(generatedId);

    Alert.alert(
      'Dispatch Confirmed!',
      `Courier courier assigned. Tracking code: ${generatedId}`,
      [
        {
          text: 'Live Track Shipment',
          onPress: () => setTrackingModalVisible(true),
        },
        {
          text: 'Back to Home',
          onPress: () => router.push('/(root)/(tabs)/home'),
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
        <Text style={styles.headerTitle}>Send Package</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 2. Embedded Map Preview Card */}
        <View style={styles.mapFrame}>
          <Map
            height={190}
            showExpandButton={true}
            showRecenterButton={true}
            showDriverCount={true}
            interactive={true}
          />
        </View>

        {/* 3. Pickup & Dropoff Address Card */}
        <WhereToInput
          pickupAddress={pickup}
          destinationAddress={dropoff}
          onPickupChange={setPickup}
          onDestinationChange={setDropoff}
          onSwapLocations={() => {
            const temp = pickup;
            setPickup(dropoff);
            setDropoff(temp);
          }}
          onSearchPress={() => router.push('/(utils)/search?mode=Map')}
        />

        {/* 4. Parcel Size Selection */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Parcel Dimensions</Text>
        </View>

        <View style={styles.sizesRow}>
          {PARCEL_SIZES.map((size) => {
            const isSelected = selectedSize.id === size.id;
            return (
              <TouchableOpacity
                key={size.id}
                style={[styles.sizeCard, isSelected && styles.sizeCardActive]}
                onPress={() => setSelectedSize(size)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.sizeIconCircle,
                    isSelected && { backgroundColor: '#FFFFFF' },
                  ]}
                >
                  <Ionicons
                    name={size.icon as any}
                    size={18}
                    color={isSelected ? '#0286FF' : '#4B5563'}
                  />
                </View>
                <Text style={[styles.sizeTitle, isSelected && styles.sizeTitleActive]}>
                  {size.title}
                </Text>
                <Text style={[styles.sizeSub, isSelected && styles.sizeSubActive]}>
                  {size.subtitle}
                </Text>
                <Text style={[styles.sizePrice, isSelected && styles.sizePriceActive]}>
                  {size.price}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 5. Recipient Details Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>RECIPIENT CONTACT</Text>

          <Text style={styles.inputLabel}>Full Name</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. Adebayo Ogunlesi"
            value={recipientName}
            onChangeText={setRecipientName}
          />

          <Text style={styles.inputLabel}>Phone Number</Text>
          <TextInput
            style={styles.textInput}
            placeholder="+234 801 234 5678"
            keyboardType="phone-pad"
            value={recipientPhone}
            onChangeText={setRecipientPhone}
          />

          <Text style={styles.inputLabel}>Delivery Instructions</Text>
          <TextInput
            style={[styles.textInput, { height: 60, textAlignVertical: 'top' }]}
            placeholder="Ring gate bell, leave with security guard..."
            multiline
            value={packageNotes}
            onChangeText={setPackageNotes}
          />
        </View>

        {/* 6. Active Shipment Tracker Preview */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recent Shipments</Text>
        </View>

        <PackageTrackerCard
          trackingNumber={activeTrackingId}
          estimatedDelivery="Today • 4:15 PM"
          origin="Victoria Island"
          destination="Lekki Phase 1"
          carrierName="Veyo Express Courier"
          onTrackPress={() => setTrackingModalVisible(true)}
        />
      </ScrollView>

      {/* 7. Bottom Sticky Action Footer */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.footerPriceLabel}>Delivery Fee</Text>
          <Text style={styles.footerPriceValue}>{selectedSize.price}</Text>
        </View>

        <TouchableOpacity
          style={styles.confirmBtn}
          onPress={handleBookCourier}
          activeOpacity={0.88}
        >
          <Text style={styles.confirmBtnText}>Book Courier Dispatch →</Text>
        </TouchableOpacity>
      </View>

      {/* Live Tracking Modal */}
      <OrderTrackingModal
        visible={trackingModalVisible}
        orderId={activeTrackingId}
        onClose={() => setTrackingModalVisible(false)}
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
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  mapFrame: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E6F3FF',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontFamily: 'JakartaBold',
    fontSize: 16,
    color: '#0B1528',
  },
  sizesRow: {
    flexDirection: 'row',
    gap: 10,
  },
  sizeCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    alignItems: 'center',
  },
  sizeCardActive: {
    backgroundColor: '#0286FF',
    borderColor: '#0286FF',
    shadowColor: '#0286FF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  sizeIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  sizeTitle: {
    fontFamily: 'JakartaBold',
    fontSize: 12,
    color: '#0B1528',
    textAlign: 'center',
  },
  sizeTitleActive: {
    color: '#FFFFFF',
  },
  sizeSub: {
    fontFamily: 'JakartaMedium',
    fontSize: 9,
    color: '#858585',
    textAlign: 'center',
    marginTop: 2,
    minHeight: 24,
  },
  sizeSubActive: {
    color: '#E0F2FE',
  },
  sizePrice: {
    fontFamily: 'JakartaBold',
    fontSize: 14,
    color: '#0286FF',
    marginTop: 6,
  },
  sizePriceActive: {
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  cardHeader: {
    fontFamily: 'JakartaBold',
    fontSize: 11,
    color: '#6B7280',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  inputLabel: {
    fontFamily: 'JakartaBold',
    fontSize: 12,
    color: '#374151',
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontFamily: 'JakartaMedium',
    fontSize: 13,
    color: '#1F2937',
    marginBottom: 12,
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
