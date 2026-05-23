import FontAwesome from '@expo/vector-icons/FontAwesome';
import React from 'react';
import { Image, ImageSourcePropType, Text, View, TouchableOpacity } from 'react-native';
import { NativeTypewriter } from './Check';

interface HeaderProps {
    name?: string;
    title?: string;
    image: ImageSourcePropType;
    onNotificationPress?: () => void;
}

const Header = ({ name = "Guest", title = "Welcome back", image, onNotificationPress }: HeaderProps) => {
    return (
        <View className='flex flex-row items-center justify-between px-4 py-2 bg-white mx-4 mt-2 rounded-2xl shadow-sm z-10'>
            
            {/* Profile Section */}
            <View className='flex flex-row items-center gap-x-3'>
                <Image
                    source={image}
                    alt="User Profile"
                    resizeMode='cover'
                    className='w-12 h-12 rounded-full border border-general-100'
                />
                <View className='line-clamp-1'>
                    <Text className='text-sm text-general-200 font-Jakarta'>
                        {name === "Guest" ? "Good morning,": `Hi ${name}`}
                    </Text>
                    {name === "Guest" ? (
                        <Text className='text-sm font-JakartaBold text-black'>
                            {title}
                        </Text>
                    ) : (
                        <NativeTypewriter 
                            texts={[
                              'Heading to school?',
                              'Guy... observe prices na!',
                              'Or on your way to work?',
                              'Craving something?',
                              'Like what you see?',
                              'Nnayi, CLOCK IT!!!'
                            ]}
                            typingSpeed={50}
                            pauseDelay={1500}
                            className="text-sm font-JakartaBold text-black" 
                        /> 
                    )}
                </View>
            </View>

            {/* Notification Bell */}
            <TouchableOpacity 
                className='w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center relative'
                onPress={onNotificationPress}
                accessibilityLabel="Open notifications"
            >
                <FontAwesome name="bell" color="#0286FF" size={20} />
                
                {/* Red dot indicator (optional) */}
                <View className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
            </TouchableOpacity>

        </View>
    );
}

export default Header;