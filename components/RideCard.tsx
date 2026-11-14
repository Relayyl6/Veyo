import React, { useEffect, useState } from 'react';
import { View, Text, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getEnrichedRide } from '@/lib/dataResolvers';
import { useRideMap } from '@/lib/RoadMapUrl';
import { Ride } from '@/types/data';
import { RADIUS, SPACING, COLORS } from '@/constants/designTokens';

const RideCard = ({
  ride: {
    id,
    origin_longitude,
    origin_latitude,
    destination_longitude,
    destination_latitude,
    origin_address,
    destination_address,
    completed_at,
    ride_time_mins,
    distance_km,
    total_fare,
    ride_status,
    payment_status,
    driver_rating,
  },
}: {
  ride: Ride;
}) => {
  const { mapUrl, loading, error } = useRideMap({
    origin_latitude,
    origin_longitude,
    destination_latitude,
    destination_longitude,
  });
  const [emerMapUrl, setEmerMapUrl] = useState<string | null>(null);

  const rideData = getEnrichedRide(id);

  const formattedDate = completed_at
    ? new Date(completed_at).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    : '—';

  const formattedFare = total_fare != null ? `$${total_fare.toFixed(2)}` : '—';

  const statusLabel =
    ride_status?.charAt(0).toUpperCase() + ride_status?.slice(1).toLowerCase();

  const paymentLabel =
    payment_status?.charAt(0).toUpperCase() + payment_status?.slice(1).toLowerCase();

  const originMarker =
    origin_longitude && origin_latitude
      ? `lonlat:${origin_longitude},${origin_latitude};type:material;color:%234c905a;icon:map-marker`
      : '';

  const destinationMarker =
    destination_longitude && destination_latitude
      ? `lonlat:${destination_longitude},${destination_latitude};type:material;color:%23bb3f73;icon:map-marker`
      : '';

  const markers = [originMarker, destinationMarker].filter(Boolean).join('|');
  const centerLat = origin_latitude ?? destination_latitude ?? 0;
  const centerLon = origin_longitude ?? destination_longitude ?? 0;

  useEffect(() => {
    if (loading || !error) return;

    setEmerMapUrl(
      `https://maps.geoapify.com/v1/staticmap` +
        `?style=osm-bright-smooth` +
        `&width=600&height=400` +
        `&center=lonlat:${centerLon},${centerLat}` +
        `&zoom=14` +
        (markers ? `&marker=${markers}` : ``) +
        `&apiKey=${process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY}`
    );
  }, [loading, error, centerLon, centerLat, markers]);

  const finalMapUrl = mapUrl ?? emerMapUrl;

  const isCompleted = ride_status === 'completed';
  const isCanceled = ride_status === 'canceled';

  return (
    <View style={styles.cardContainer}>
      <View style={styles.topRow}>
        {/* Map Thumbnail */}
        {loading ? (
          <View style={styles.mapBoxPlaceholder}>
            <ActivityIndicator size="small" color="#9CA3AF" />
          </View>
        ) : error && !finalMapUrl ? (
          <View style={[styles.mapBoxPlaceholder, { backgroundColor: '#FEF2F2' }]}>
            <Ionicons name="alert-circle-outline" size={20} color="#EF4444" />
            <Text style={styles.mapErrorText}>Map unavailable</Text>
          </View>
        ) : !finalMapUrl ? (
          <View style={styles.mapBoxPlaceholder}>
            <Ionicons name="map-outline" size={20} color="#D1D5DB" />
            <Text style={styles.mapErrorText}>No map found</Text>
          </View>
        ) : (
          <Image
            source={{ uri: finalMapUrl }}
            style={styles.mapImage}
            resizeMode="cover"
          />
        )}

        {/* Addresses & Metrics */}
        <View style={styles.addressColumn}>
          {/* Origin */}
          <View style={styles.addressRow}>
            <View style={styles.originDot} />
            <Text style={styles.addressText} numberOfLines={1}>
              {origin_address?.split(',')[0] || 'Pickup'}
            </Text>
          </View>

          {/* Stepper Connector (No stray bare arrow!) */}
          <View style={styles.stepperTrack}>
            <View style={styles.stepperDashes} />
          </View>

          {/* Destination */}
          <View style={styles.addressRow}>
            <View style={styles.destDot} />
            <Text style={styles.addressText} numberOfLines={1}>
              {destination_address?.split(',')[0] || 'Dropoff'}
            </Text>
          </View>

          {/* Date & Distance Sub-strip */}
          <View style={styles.metricsRow}>
            <Text style={styles.dateText}>{formattedDate}</Text>
            <Text style={styles.dotDivider}>•</Text>
            <Text style={styles.metaText}>{distance_km} km</Text>
            <Text style={styles.dotDivider}>•</Text>
            <Text style={styles.metaText}>{ride_time_mins} mins</Text>
          </View>
        </View>

        {/* Total Fare */}
        <Text style={styles.fareText}>{formattedFare}</Text>
      </View>

      <View style={styles.divider} />

      {/* Driver Strip & Semantic Badges */}
      <View style={styles.bottomRow}>
        {/* Driver Profile */}
        <View style={styles.driverLeft}>
          {rideData?.driver?.avatar_url ? (
            <Image
              source={{ uri: rideData.driver.avatar_url }}
              style={styles.driverAvatar}
            />
          ) : (
            <View style={styles.driverAvatarFallback}>
              <Text style={styles.driverInitial}>
                {rideData?.driver?.full_name?.[0] ?? 'D'}
              </Text>
            </View>
          )}

          <View style={styles.driverInfoCol}>
            <Text style={styles.driverName} numberOfLines={1}>
              {rideData?.driver?.full_name ?? 'Driver'}
            </Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={11} color="#FBBF24" />
              <Text style={styles.ratingText}>
                {driver_rating?.toFixed(1) ?? '5.0'}
              </Text>
            </View>
          </View>
        </View>

        {/* Badges */}
        <View style={styles.badgesRow}>
          {ride_status && (
            <View
              style={[
                styles.badgePill,
                isCompleted
                  ? styles.badgeCompleted
                  : isCanceled
                  ? styles.badgeCanceled
                  : styles.badgeActive,
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  isCompleted
                    ? styles.badgeTextCompleted
                    : isCanceled
                    ? styles.badgeTextCanceled
                    : styles.badgeTextActive,
                ]}
              >
                {statusLabel}
              </Text>
            </View>
          )}

          {payment_status && (
            <View
              style={[
                styles.badgePill,
                payment_status === 'paid' ? styles.badgeCompleted : styles.badgeActive,
              ]}
            >
              <Ionicons
                name="wallet"
                size={10}
                color={payment_status === 'paid' ? '#059669' : '#D97706'}
              />
              <Text
                style={[
                  styles.badgeText,
                  payment_status === 'paid'
                    ? styles.badgeTextCompleted
                    : styles.badgeTextActive,
                ]}
              >
                {paymentLabel}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default RideCard;

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.card,
    padding: SPACING.card,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  mapBoxPlaceholder: {
    width: 78,
    height: 78,
    borderRadius: 12,
    marginRight: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 4,
  },
  mapImage: {
    width: 78,
    height: 78,
    borderRadius: 12,
    marginRight: 10,
    backgroundColor: '#F3F4F6',
  },
  mapErrorText: {
    fontSize: 9,
    fontFamily: 'JakartaMedium',
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 2,
  },
  addressColumn: {
    flex: 1,
    justifyContent: 'center',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  originDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  destDot: {
    width: 7,
    height: 7,
    borderRadius: 1.5,
    backgroundColor: '#0B1528',
    marginRight: 6,
  },
  stepperTrack: {
    marginLeft: 3,
    height: 8,
    justifyContent: 'center',
  },
  stepperDashes: {
    width: 1,
    height: 8,
    borderStyle: 'dashed',
    borderWidth: 0.8,
    borderColor: '#D1D5DB',
  },
  addressText: {
    fontSize: 12,
    fontFamily: 'JakartaBold',
    color: '#1F2937',
    flex: 1,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  dateText: {
    fontSize: 10,
    fontFamily: 'JakartaMedium',
    color: '#9CA3AF',
  },
  dotDivider: {
    fontSize: 9,
    color: '#CBD5E1',
  },
  metaText: {
    fontSize: 10,
    fontFamily: 'JakartaMedium',
    color: '#6B7280',
  },
  fareText: {
    fontSize: 14,
    fontFamily: 'JakartaBold',
    color: '#0B1528',
    marginLeft: 6,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 10,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  driverLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  driverAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E5E7EB',
  },
  driverAvatarFallback: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverInitial: {
    fontSize: 11,
    fontFamily: 'JakartaBold',
    color: '#6B7280',
  },
  driverInfoCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  driverName: {
    fontSize: 11.5,
    fontFamily: 'JakartaSemiBold',
    color: '#374151',
    maxWidth: 90,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginLeft: 2,
  },
  ratingText: {
    fontSize: 10.5,
    fontFamily: 'JakartaBold',
    color: '#4B5563',
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 3,
  },
  badgeCompleted: {
    backgroundColor: '#ECFDF5',
  },
  badgeCanceled: {
    backgroundColor: '#FEF2F2',
  },
  badgeActive: {
    backgroundColor: '#FFFBEB',
  },
  badgeText: {
    fontSize: 10,
    fontFamily: 'JakartaBold',
  },
  badgeTextCompleted: {
    color: '#059669',
  },
  badgeTextCanceled: {
    color: '#DC2626',
  },
  badgeTextActive: {
    color: '#D97706',
  },
});
