import { Image, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { GoogleInputProps } from '@/types/type';
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { icons } from '@/constants/utils';

const GOOGLE_PLACES_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY!

const Places = ({
    icon,
    initialLocation,
    containerStyle,
    textInputBackgroundColor,
    handlePress
}: GoogleInputProps) => {

  return (
    <View className={`flex flex-row items-center justify-center relative z-50 rounded-xl ${containerStyle} mb-3`}>
      <GooglePlacesAutocomplete
          fetchDetails
          placeholder='Where are you heading?'
          debounce={200}
          styles={{
              textInputContainer: {
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 20,
                  marginHorizontal: 20,
                  position: 'relative',
                  shadowColor: "#d4d4d4"
              },
              textInput: {
                  backgroundColor: textInputBackgroundColor || 'white',
                  fontSize: 16,
                  fontWeight: "600",
                  marginTop: 5,
                  width: "100%",
                  borderRadius: 200
              },
              listView: {
                  backgroundColor: textInputBackgroundColor || 'white',
                  position: 'relative',
                  borderRadius: 10,
                  shadowColor: "#d4d4d4",
                  zIndex: 99
              }
          }}
          onPress={(data, details = null) => {
              handlePress({
                  latitude: details?.geometry.location.lat!,  
                  longitude: details?.geometry.location.lng!,
                  address: data.description
              })
          }}
          query={{
              key: GOOGLE_PLACES_API_KEY,
              language: 'en'
          }}
          renderLeftButton={() => (
              <View className='justify-center items-center w-6 h-6'>
                  <Image
                      source={icon ? icon : icons.search}
                      className='w-6 h-6'
                      resizeMode='contain'
                  />
              </View>
          )}
          textInputProps={{
              placeholderTextColor: 'gray',
              placeholder: initialLocation ?? "Where would you want to go?"
          }}
      />
    </View>
  )
}

export default Places