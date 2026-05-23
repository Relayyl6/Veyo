import FontAwesome from '@expo/vector-icons/FontAwesome';
import React from 'react';
import { Text, TextInput, View, TouchableOpacity } from 'react-native';

interface SearchBarProps {
    title?: string;
    placeholder?: string;
    value?: string;
    onChangeText?: (text: string) => void;
    onActionPress?: () => void;
}

const SearchBar = ({ 
    title = "Go", 
    placeholder = "Where to?", 
    value,
    onChangeText, 
    onActionPress 
}: SearchBarProps) => {
    return (
        <View className='flex flex-row items-center px-2 py-1.5 bg-white mx-4 mt-2 rounded-full shadow-sm border border-neutral-100'>
            
            {/* Left Search Icon */}
            <View className='w-10 h-10 rounded-full bg-general-500 flex items-center justify-center mr-2'>
                <FontAwesome name="search" color="#858585" size={16} />
            </View>

            <TextInput
                className='flex-1 font-Jakarta text-base text-black'
                placeholder={placeholder}
                placeholderTextColor="#858585"
                value={value}
                onChangeText={onChangeText}
                returnKeyType="search"
                clearButtonMode="while-editing" /* iOS only: adds a little X to clear text */
            />

            {/* Right Action Button */}
            {title && (
                <TouchableOpacity 
                    className='h-12 px-3 rounded-full bg-primary-100 flex items-center justify-center ml-2'
                    onPress={onActionPress}
                >
                    <Text className="font-JakartaBold text-sm text-primary-500">
                        {title}
                    </Text>
                </TouchableOpacity>
            )}
            
        </View>
    );
}

export default SearchBar;