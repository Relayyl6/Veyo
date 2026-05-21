import { Image, Keyboard, Pressable, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native'
import React from 'react'
import { InputFieldProps } from '@/types/type'
import FontAwesome from '@expo/vector-icons/FontAwesome'

const InputField = ({
    labelStyle,
    label,
    icon,
    containerStyle,
    inputStyle,
    iconStyle,
    className,
    secure,
    setSecure,
    error, // Add error prop
    handle,
    ...props
}: InputFieldProps) => {
  return (
    <View className="my-1 w-full">
      <Text className={`text-lg font-JakartaSemiBold mb-3 ${labelStyle}`}>
        {label}
      </Text>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className={`flex flex-row justify-start items-center bg-neutral-100 rounded-full relative ${error ? 'border border-red-500' : 'border-neutral-100'} focus:border-primary-500 ${containerStyle}`}>
          {icon && <Image source={icon} className={`w-6 h-6 ml-4 ${iconStyle}`}/>}
          <TextInput
            className={`rounded-full p-4 font-JakartaSemiBold flex-1 text-[15px] text-left ${inputStyle}`}
            secureTextEntry={secure}
            {...props}
          />
          {label === "Password" && (
            <View className='pr-5 gap-5 flex flex-row'>
              <Pressable onPress={handle}>
                <FontAwesome name="arrow-circle-o-right" color="#000000" size={22}/>
              </Pressable>
              <Pressable onPress={() => setSecure?.(!secure)}>
                <FontAwesome name={secure ? 'eye-slash' : 'eye'} color="#000000" size={22}/>
              </Pressable>
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>

      {/* Error message */}
      {error && (
        <Text className="text-red-500 text-sm mt-1 ml-4 font-JakartaMedium flex justify-end">
          {error}
        </Text>
      )}
    </View>
  )
}

export default InputField

const styles = StyleSheet.create({})