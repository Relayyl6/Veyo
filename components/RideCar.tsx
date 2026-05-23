import { View, Text, Image } from 'react-native'
import React from 'react'
import { Ride } from '@/types/data'
import { getEnrichedRide } from '@/lib/dataResolvers'
import { icons } from '@/constants/utils'

const RideCard = ({
    ride: {
    origin_longitude,
    origin_latitude,
    destination_longitude,
    destination_latitude,
    origin_address,
    destination_address,
    created_at,
    ride_time_mins,
    driver_id,
    payment_status,
    id
    },
    index
}: {
    ride: Ride,
    index: string
}) => {

  const rideData = getEnrichedRide(id);
  
  return (
    <View className='flex flex-row items-center justify-center bg-white rounded-lg shadow-sm shadow-neutral-300 mb-3'>
      <View className='flex flex-row items-center justify-between p-3'>
        <View className='flex flex-row items-center justify-between'>
            <Image
              source={{ uri: `https://maps.geoapify.com/v1/staticmap?style=osm-bright-smooth&width=600&height=400&center=lonlat:${origin_longitude},${origin_latitude}&zoom=14&marker=lonlat:${origin_longitude},${origin_latitude};type:material;color:%234c905a;icon:my_location|lonlat:${destination_longitude},${destination_latitude};type:awesome;color:%23bb3f73;size:x-large;icon:flag&apiKey=${process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY}` }}
              alt="map"
              className='w-[80px] h-[90px] rounded-lg'
            />
        </View>

        <View className='flex flex-col mx-5 gap-y-5 flex-1'>
          <View className='flex flex-row items-center gap-x-2'>
            <Image
              source={icons.to}
              alt="to"
              className='w-5 h-5'
            />
            <Text className='text-md font-JakartaMedium'>{origin_address}</Text>
          </View>

          <View className='flex flex-row items-center gap-x-2'>
            <Image
              source={icons.point}
              alt="to"
              className='w-5 h-5'
            />
            <Text className='text-md font-JakartaMedium'>{destination_address}</Text>
          </View>
        </View>
      </View>

      <View className='flex flex-col w-full mt-5 bg-general-500 rounded-lg p-3 items-start justify-center'>

      </View>

      {/* <Text className='text-3xl'>{rideData?.driver?.full_name}</Text> */}
    </View>
  )
}

export default RideCard

