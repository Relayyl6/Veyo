import { View, Text, Image, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { getEnrichedRide } from '@/lib/dataResolvers'
import { Ionicons } from '@expo/vector-icons'
import { useRideMap } from '@/lib/RoadMapUrl'
import { Ride } from '@/types/data'
// import { ActivityIndicator } from './nativewindui/ActivityIndicator'

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
  ride: Ride
}) => {
  const { mapUrl, loading, error } = useRideMap({
    origin_latitude,
    origin_longitude,
    destination_latitude,
    destination_longitude
  });
  const [emerMapUrl, setEmerMapUrl] = useState<string | null>(null)

  const rideData = getEnrichedRide(id)

  const formattedDate = completed_at
    ? new Date(completed_at).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    : '—'

  const formattedFare = total_fare != null
    ? `$${total_fare.toFixed(2)}`
    : '—'

  const statusLabel =
    ride_status?.charAt(0).toUpperCase() +
    ride_status?.slice(1).toLowerCase()

  const paymentLabel =
    payment_status?.charAt(0).toUpperCase() +
    payment_status?.slice(1).toLowerCase()

  const originMarker =
  origin_longitude && origin_latitude
    ? `lonlat:${origin_longitude},${origin_latitude};type:material;color:%234c905a;icon:map-marker`
    : "";

  const destinationMarker =
    destination_longitude && destination_latitude
      ? `lonlat:${destination_longitude},${destination_latitude};type:material;color:%23bb3f73;icon:map-marker`
      : "";

  const markers = [originMarker, destinationMarker].filter(Boolean).join("|");

  const centerLat = origin_latitude ?? destination_latitude ?? 0;
  const centerLon = origin_longitude ?? destination_longitude ?? 0;

  useEffect(() => {
    // If it's still loading or there is no error, do nothing.
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

  return (
    // Only changed this wrapper class to remove outer margins (p-4 remains)
    <View className="bg-white rounded-2xl shadow-lg shadow-neutral-200 p-4">
      <View className="flex flex-row items-start relative">
        {/* 1. LOADING STATE */}
        {loading ? (
          <View className="w-[110px] h-[110px] rounded-xl mr-3 bg-neutral-100 flex items-center justify-center border border-neutral-200">
            <ActivityIndicator size="small" color="#d4d4d4" />
          </View>
        ) 

        // {/* 2. ERROR STATE (Error is true, but fallback map hasn't loaded yet) */}
        : error && !finalMapUrl ? (
          <View className="w-[110px] h-[110px] rounded-xl mr-3 bg-red-50 flex items-center justify-center border border-red-100 p-2 text-center">
            <Ionicons name="alert-circle-outline" size={24} color="#ef4444" />
            <Text className="text-red-400 font-JakartaMedium mt-1 text-[10px] text-center">
              Map unavailable
            </Text>
          </View>
        ) 

        // {/* 3. EMPTY STATE (No loading, no error, but still no URL available) */}
        : !finalMapUrl ? (
          <View className="w-[110px] h-[110px] rounded-xl mr-3 bg-white flex items-center justify-center shadow-sm shadow-neutral-200 border border-neutral-100 p-2">
            <Ionicons name="map-outline" size={24} color="#d4d4d4" />
            <Text className="text-neutral-400 font-JakartaMedium mt-1 text-[10px] text-center">
              No map found
            </Text>
          </View>
        ) 

        // {/* 4. SUCCESS STATE */}
        : (
          <Image
            source={{ uri: finalMapUrl }}
            className="w-[110px] h-[110px] rounded-xl mr-3 bg-neutral-100"
            resizeMode="cover"
          />
        )}

        <View className="flex-1 mt-1">
          <View className="flex flex-row items-center mb-0.5">
            <View className="w-3 h-3 rounded-full border-2 border-green-500 mr-2" />
            <Text
              className="text-xs font-semibold text-neutral-800"
              numberOfLines={1}
            >
              {origin_address.split(',')[0]}
            </Text>
          </View>

          <Ionicons name="arrow-up" />
          <View className="ml-[5px] h-2 border-l border-dashed border-neutral-300 mb-0.5" />

          <View className="flex flex-row items-center mb-2">
            <View className="w-3 h-3 rounded-full border-2 border-neutral-800 bg-neutral-800 mr-2" />
            <Text
              className="text-xs font-semibold text-neutral-800"
              numberOfLines={1}
            >
              {destination_address.split(',')[0]}
            </Text>
          </View>

          <Text className="text-xs text-neutral-400 mb-1">{formattedDate}</Text>

          <View className="flex flex-row items-center gap-2">
            <Text className="text-xs text-neutral-500 gap-0.5"><Ionicons name="location" /> {distance_km} km</Text>
            <Text className="text-neutral-300">•</Text>
            <Text className="text-xs text-neutral-500"><Ionicons name="timer" /> {ride_time_mins} mins</Text>
          </View>
        </View>

        <Text className="text-sm font-bold text-neutral-900 ml-2 font-JakartaMedium">
          {formattedFare}
        </Text>
      </View>

      <View className="h-px bg-neutral-100 my-2" />

      <View className="flex flex-row items-center justify-between">
        <View className="flex-1 flex flex-row items-center gap-2 mr-2">
          {rideData?.driver?.avatar_url ? (
            <View className="border border-black rounded-full">
              <Image
                source={{ uri: rideData.driver.avatar_url }}
                className="w-8 h-8 border border-white rounded-full"
              />
            </View>
          ) : (
            <View className="w-8 h-8 rounded-full bg-neutral-200 items-center justify-center">
              <Text className="text-neutral-500 text-[6px] font-semibold">
                {rideData?.driver?.full_name?.[0] ?? '?'}
              </Text>
            </View>
          )}

          <View className="flex-1 flex-row items-center min-w-0">
            <Text
              className="text-xs font-medium text-neutral-800 flex-shrink"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {rideData?.driver?.full_name ?? 'Driver'}
            </Text>
            <Text className="text-xs ml-1">⭐</Text>
            <Text className="text-xs font-medium text-neutral-700 ml-1">
              {driver_rating?.toFixed(1) ?? '—'}
            </Text>
          </View>
        </View>

        <View className="flex flex-row items-center flex-shrink gap-1">
          {ride_status && (
            <View
              className={`flex flex-row items-center ${
                            ride_status === "searching"
                              ? "bg-yellow-50 text-yellow-600"
                              : ride_status === "accepted"
                              ? "bg-blue-50 text-blue-600"
                              : ride_status === "arrived"
                              ? "bg-purple-50 text-purple-600"
                              : ride_status === "in_transit"
                              ? "bg-orange-50 text-orange-600"
                              : ride_status === "completed"
                              ? "bg-green-50 text-green-600"
                              : ride_status === "canceled"
                              ? "bg-red-50 text-red-600"
                              : ""
                          } px-2 py-1 rounded-full`}
            >
              <Text
                className={`text-[10px] font-semibold ${
                              ride_status === "searching"
                                ? "text-yellow-600"
                                : ride_status === "accepted"
                                ? "text-blue-600"
                                : ride_status === "arrived"
                                ? "text-purple-600"
                                : ride_status === "in_transit"
                                ? "text-orange-600"
                                : ride_status === "completed"
                                ? "text-green-600"
                                : ride_status === "canceled"
                                ? "text-red-600"
                                : ""
                            }`}
                numberOfLines={1}
              >
                {statusLabel}
              </Text>
            </View>
          )}

          {payment_status && (
            <View
              className={`flex flex-row items-center ${
                            payment_status === "pending"
                              ? "bg-yellow-50 text-yellow-600"
                              : payment_status === "paid"
                              ? "bg-green-50 text-green-600"
                              : payment_status === "failed"
                              ? "bg-red-50 text-red-600"
                              : payment_status === "refunded"
                              ? "bg-purple-50 text-purple-600"
                              : ""
                          } px-2 py-1 rounded-full gap-1`}
            >
              <Ionicons
                name="wallet"
                size={10}
              />
              <Text
                className={`text-[10px] font-semibold ${
                              payment_status === "pending"
                                ? "text-yellow-600"
                                : payment_status === "paid"
                                ? "text-green-600"
                                : payment_status === "failed"
                                ? "text-red-600"
                                : payment_status === "refunded"
                                ? "text-purple-600"
                                : ""
                            }`}
                numberOfLines={1}
              >
                {paymentLabel}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  )
}

export default RideCard