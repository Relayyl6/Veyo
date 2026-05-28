import FontAwesome from '@expo/vector-icons/FontAwesome';
import React from 'react';
import { Text, TextInput, View, TouchableOpacity } from 'react-native';

interface SearchBarProps {
    title?: string;
    placeholder?: string;
    value?: string;
    onChangeText?: (text: string) => void;
    onClearPress?: () => void; 
    onActionPress?: () => void;
    onSubmitEditing?: () => void;
}

const SearchBar = ({ 
    title = "Go", 
    placeholder = "Where to?", 
    value,
    onChangeText, 
    onClearPress,
    onActionPress,
    onSubmitEditing
}: SearchBarProps) => {
    const handleClear = () => {
        if (onChangeText) {
            onChangeText(''); // Instantly clears the text in the parent state
        }
        if (onClearPress) {
            onClearPress(); // Triggers any extra actions you want when cleared
        }
    };
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
                onSubmitEditing={onSubmitEditing}
            />

            {/* Right Action Button */}
            {value?.length as number > 0 && (
                <TouchableOpacity 
                    className='w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center ml-2'
                    onPress={handleClear}
                    activeOpacity={0.7}
                >
                    <FontAwesome name="times" color="#858585" size={18} />
                </TouchableOpacity>
            )}
            
        </View>
    );
}

export default SearchBar;



