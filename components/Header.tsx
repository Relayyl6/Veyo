import FontAwesome from '@expo/vector-icons/FontAwesome';
import React from 'react';
import { Image, ImageSourcePropType, Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';

interface HeaderProps {
    name?: string;
    title?: string;
    subtitle?: string;
    first?: string;
    image?: ImageSourcePropType;
    onNotificationPress?: () => void;
}

const Header = ({
    name = "Guest",
    first = "someone",
    title,
    subtitle,
    image,
    onNotificationPress
}: HeaderProps) => {
    const router = useRouter();
    const greeting = name === "Guest" ? "Good morning," : `Hi ${first || name || 'there'}`;
    const displaySubtitle = subtitle || title || (name === "Guest" ? "Welcome back" : "Where to next?");

    return (
        <BlurView 
            intensity={20} 
            tint="light" 
            style={{ overflow: 'hidden', borderRadius: 16 }}
            className='flex flex-row items-center justify-between px-4 py-2 mx-4 z-10'
        >
            
            {/* Profile Section */}
            <View className='flex flex-row items-center gap-x-3 flex-1 mr-24'>
                <Image
                    source={image}
                    alt="User Profile"
                    resizeMode='cover'
                    className='w-12 h-12 rounded-full border border-general-100'
                />
                <View className='flex-1 justify-center'>
                    <Text className='text-sm text-general-200 font-Jakarta' numberOfLines={1}>
                        {greeting}
                    </Text>
                    {name !== "none" && (
                        <Text className='text-sm font-JakartaBold text-black' numberOfLines={1}>
                            {displaySubtitle}
                        </Text>
                    )}
                </View>
            </View>

            {/* Notification Bell & Search */}
            <View className='flex flex-row items-center gap-0.1 absolute right-2'>
                <TouchableOpacity
                    className='w-10 h-10 rounded-full bg-general-500 flex items-center justify-center mr-2'
                    onPress={() => router.push("/(utils)/search")}
                >
                    <FontAwesome name="search" color="#858585" size={16} />
                </TouchableOpacity>

                <TouchableOpacity 
                    className='w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center relative'
                    onPress={onNotificationPress}
                    accessibilityLabel="Open notifications"
                >
                    <FontAwesome name="bell" color="#0286FF" size={20} />
                    
                    {/* Red dot indicator */}
                    <View className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
                </TouchableOpacity>
            </View>

        </BlurView>
    );
};

export default Header;
