import { Image, Keyboard, Pressable, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';
import React from 'react';
import { InputFieldProps } from '@/types/type';
import FontAwesome from '@expo/vector-icons/FontAwesome';

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
  error,
  handle,
  placeholderTextColor = '#9CA3AF',
  ...props
}: InputFieldProps & { placeholderTextColor?: string }) => {
  return (
    <View className="my-1 w-full">
      <Text className={`text-xs font-JakartaSemiBold mb-1 text-neutral-700 ${labelStyle}`}>
        {label}
      </Text>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View
          className={`flex flex-row justify-start items-center bg-neutral-100 rounded-full relative ${
            error ? 'border border-red-500' : 'border-neutral-100'
          } focus:border-primary-500 ${containerStyle}`}
        >
          {icon && <Image source={icon} className={`w-5 h-5 ml-3.5 ${iconStyle}`} resizeMode="contain" />}
          <TextInput
            className={`rounded-full py-2.5 px-3 font-JakartaMedium flex-1 text-[14px] text-left text-neutral-900 ${inputStyle}`}
            placeholderTextColor={placeholderTextColor}
            secureTextEntry={secure}
            {...props}
          />
          {label === 'Password' && (
            <View className="pr-4 gap-4 flex flex-row items-center">
              <Pressable onPress={handle} hitSlop={8}>
                <FontAwesome name="arrow-circle-o-right" color="#64748B" size={18} />
              </Pressable>
              <Pressable onPress={() => setSecure?.(!secure)} hitSlop={8}>
                <FontAwesome name={secure ? 'eye-slash' : 'eye'} color="#64748B" size={18} />
              </Pressable>
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>

      {/* Error message */}
      {error && (
        <Text className="text-red-500 text-xs mt-1 ml-3 font-JakartaMedium">
          {error}
        </Text>
      )}
    </View>
  );
};

export default InputField;

const styles = StyleSheet.create({});
