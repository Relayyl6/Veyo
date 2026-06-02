import FontAwesome from '@expo/vector-icons/FontAwesome';
import React from 'react';
import { Image, ImageSourcePropType, Text, View, TouchableOpacity } from 'react-native';
import { NativeTypewriter } from './Check';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';

interface HeaderProps {
    name?: string;
    title?: string;
    first?: string;
    image?: ImageSourcePropType;
    onNotificationPress?: () => void;
}

const Header = ({ name = "Guest", first = "someone", title = "Welcome back", image, onNotificationPress }: HeaderProps) => {
    const router = useRouter()
    return (
        <BlurView 
            intensity={20} 
            tint="light" 
            style={{ overflow: 'hidden', borderRadius: 16 }}
            className='flex flex-row items-center justify-between px-4 py-2 mx-4 z-10'
        >
            
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
                        {name === "Guest" ? "Good morning,": `Hi ${first}`}
                    </Text>
                    {name === "none" ? null : name === "Guest" ? (
                        <Text className='text-sm font-JakartaBold text-black'>
                            {title}
                        </Text>
                    ) : (
                        <NativeTypewriter 
                            texts={[
                            'Heading to school?',
                            'Guy.. observe prices!',
                            'Going to work?',
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
                    
                    {/* Red dot indicator (optional) */}
                    <View className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
                </TouchableOpacity>
            </View>

        </BlurView>
    );
}

export default Header;