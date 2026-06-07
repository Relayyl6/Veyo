import React, { useState } from 'react';
import { View, Text, TextInput, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { PressableHybrid } from './CustomPressable'; // Double check your exact path mappings

// 1. Type definitions for our dynamic state structure
interface ShortcutPlace {
  id: string;
  label: string;
  iconName: string;
  iconProvider: 'FontAwesome5' | 'Ionicons' | 'MaterialIcons';
}

// 2. A centralized lookup dictionary to translate strings in state to actual vector components
const IconRenderer = ({ name, provider, color = '#3122D2', size = 18 }: { 
  name: string; 
  provider: ShortcutPlace['iconProvider']; 
  color?: string; 
  size?: number 
}) => {
  switch (provider) {
    case 'Ionicons':
      return <Ionicons name={name as any} size={size} color={color} />;
    case 'MaterialIcons':
      return <MaterialIcons name={name as any} size={size} color={color} />;
    default:
      return <FontAwesome5 name={name} size={size} color={color} />;
  }
};

// 3. Simple list of cool selectable preset icons for your user modal configuration
const AVAILABLE_ICONS: Omit<ShortcutPlace, 'id' | 'label'>[] = [
  { iconName: 'heart', iconProvider: 'FontAwesome5' },
  { iconName: 'star', iconProvider: 'FontAwesome5' },
  { iconName: 'leaf', iconProvider: 'FontAwesome5' },
  { iconName: 'cafe', iconProvider: 'Ionicons' },
  { iconName: 'fitness', iconProvider: 'Ionicons' },
  { iconName: 'storefront', iconProvider: 'Ionicons' },
  { iconName: 'restaurant', iconProvider: 'MaterialIcons' },
  { iconName: 'airport-shuttle', iconProvider: 'MaterialIcons' },
];

export const SavedPlacesRow = () => {
  // 4. State holding our custom pills array
  const [places, setPlaces] = useState<ShortcutPlace[]>([
    { id: '1', label: 'Home', iconName: 'home', iconProvider: 'FontAwesome5' },
    { id: '2', label: 'School', iconName: 'graduation-cap', iconProvider: 'FontAwesome5' },
    { id: '3', label: 'Work', iconName: 'briefcase', iconProvider: 'FontAwesome5' },
  ]);

  // Modal generation state metrics
  const [modalVisible, setModalVisible] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(AVAILABLE_ICONS[0]);

  // 5. Function handling the insertion of new pills dynamically
  const handleAddNewPlace = () => {
    if (!newLabel.trim()) return;

    const newPlace: ShortcutPlace = {
      id: Date.now().toString(), // Generates clean simple unique tracking ID identifiers
      label: newLabel.trim(),
      iconName: selectedIcon.iconName,
      iconProvider: selectedIcon.iconProvider,
    };

    setPlaces([...places, newPlace]);
    
    // Clear inputs and close out input layout sheets
    setNewLabel('');
    setSelectedIcon(AVAILABLE_ICONS[0]);
    setModalVisible(false);
  };

  return (
    <View className="px-5 py-4">
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
        <View className="flex-row gap-5 items-center">
          
          {/* Loop over our state array and map custom active pill entries dynamically */}
          {places.map((place) => (
            <View key={place.id} className="items-center w-[64px]">
              <PressableHybrid
                onPress={() => console.log(`Selected layout shortcut target: ${place.label}`)}
                className="w-14 h-14 bg-indigo-50/70 rounded-full items-center justify-center border border-indigo-100/30"
              >
                <IconRenderer name={place.iconName} provider={place.iconProvider} />
              </PressableHybrid>
              <Text className="text-[#022150] text-xs font-JakartaMedium mt-2 text-center" numberOfLines={1}>
                {place.label}
              </Text>
            </View>
          ))}

          {/* 6. The Add Button (Dashed boundary matching design template profile metrics) */}
          <View className="items-center w-[64px]">
            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              activeOpacity={0.7}
              className="w-14 h-14 border border-dashed border-neutral-300 rounded-full items-center justify-center bg-transparent"
            >
              <FontAwesome5 name="plus" size={16} color="#9CA3AF" />
            </TouchableOpacity>
            <Text className="text-neutral-400 text-xs font-JakartaMedium mt-2 text-center">
              Add
            </Text>
          </View>

        </View>
      </ScrollView>

      {/* Simple configuration overlay popup sheet */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-[32px] p-6 min-h-[350px]">
            <Text className="text-xl font-JakartaBold text-[#022150] mb-4">Add Custom Spot</Text>
            
            {/* Input target element for the name entry text string */}
            <Text className="text-xs font-JakartaSemiBold text-neutral-400 mb-2">PLACE NAME</Text>
            <TextInput
              value={newLabel}
              onChangeText={setNewLabel}
              placeholder="e.g., Gym, Church, Chill Spot"
              placeholderTextColor="#9CA3AF"
              className="w-full bg-neutral-50 border border-neutral-200 h-12 rounded-xl px-4 text-base font-JakartaMedium text-[#022150] mb-5"
            />

            {/* Icon picker selector map logic block layout frame */}
            <Text className="text-xs font-JakartaSemiBold text-neutral-400 mb-2">CHOOSE LOGO</Text>
            <View className="flex-row flex-wrap gap-4 mb-8">
              {AVAILABLE_ICONS.map((icon, idx) => {
                const isSelected = selectedIcon.iconName === icon.iconName;
                return (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => setSelectedIcon(icon)}
                    className={`w-11 h-11 rounded-full items-center justify-center ${isSelected ? 'bg-indigo-600' : 'bg-neutral-100'}`}
                  >
                    <IconRenderer 
                      name={icon.iconName} 
                      provider={icon.iconProvider} 
                      color={isSelected ? '#ffffff' : '#4B5563'} 
                      size={16}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Action control button container context links */}
            <View className="flex-row gap-4">
              <TouchableOpacity 
                onPress={() => setModalVisible(false)} 
                className="flex-1 bg-neutral-100 h-12 rounded-full items-center justify-center"
              >
                <Text className="text-neutral-600 font-JakartaBold">Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={handleAddNewPlace} 
                className="flex-1 bg-[#0286FF] h-12 rounded-full items-center justify-center"
              >
                <Text className="text-white font-JakartaBold">Save</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>

    </View>
  );
};

export default SavedPlacesRow;