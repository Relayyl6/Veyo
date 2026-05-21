import { Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { ButtonProps } from '@/types/type'

const getBgVariantStyle = (variant: ButtonProps['bgVariant']) => {
    switch (variant) {
        case "secondary":
            return 'bg-gray-500'
            break;
        case "danger":
            return 'bg-red-500'
            break;
        case "success":
            return 'bg-green-500'
            break;
        case "outline":
            return 'bg-transparent border-neutral-300 border-[0.5px]'
            break;
        default:
            return 'bg-[#0286FF]'
            break;
    }
}
const getTextVariantStyle = (variant: ButtonProps["textVariant"]) => {
    switch (variant) {
        case "primary":
            return "text-black";
        case "secondary":
            return "text-gray-100";
        case "danger":
            return "text-red-100";
        case "success":
            return "text-green-100";
        default:
            return "text-white";
    }
};

const CustomButton = ({
    onPress,
    title,
    bgVariant = 'primary',
    textVariant = 'default',
    IconLeft,
    IconRight,
    className,
    ...props
}: ButtonProps) => {
  return (
    <Pressable onPress={onPress} className={`flex rounded-full flex-row items-center justify-center shadow-md shadow-neutral-400/70 p-3 ${getBgVariantStyle(bgVariant)} ${className}`} {...props}>
      {IconLeft && <IconLeft />}
        <Text className={`text-lg font-bold ${getTextVariantStyle(textVariant)}`} numberOfLines={1}>
            {title}
        </Text>
      {IconRight && <IconRight />}
    </Pressable>
  )
}

export default CustomButton

const styles = StyleSheet.create({})