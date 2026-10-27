import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface WhereToInputProps {
  originText?: string;
  destinationText?: string;
  onOriginPress?: () => void;
  onDestinationPress?: () => void;
  onDestinationChange?: (text: string) => void;
  isEditable?: boolean;
  style?: object;
}

export default function WhereToInput({
  originText = 'Current Location',
  destinationText = '',
  onOriginPress,
  onDestinationPress,
  onDestinationChange,
  isEditable = false,
  style,
}: WhereToInputProps) {
  return (
    <View style={[styles.container, style]}>
      {/* 1. Origin Row */}
      <TouchableOpacity
        style={styles.inputBox}
        activeOpacity={0.8}
        onPress={onOriginPress}
      >
        <View style={styles.originIconCircle}>
          <View style={styles.originInnerDot} />
        </View>
        <Text style={styles.originText} numberOfLines={1}>
          {originText}
        </Text>
      </TouchableOpacity>

      {/* Connecting Indicator Line */}
      <View style={styles.connectorContainer}>
        <View style={styles.connectorDot} />
        <View style={styles.connectorDot} />
      </View>

      {/* 2. Destination Row */}
      {isEditable ? (
        <View style={[styles.inputBox, styles.destinationBox]}>
          <Ionicons name="location" size={18} color="#F97316" style={styles.destIcon} />
          <TextInput
            placeholder="Enter destination..."
            placeholderTextColor="#858585"
            value={destinationText}
            onChangeText={onDestinationChange}
            style={styles.textInput}
          />
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.inputBox, styles.destinationBox]}
          activeOpacity={0.8}
          onPress={onDestinationPress}
        >
          <Ionicons name="location" size={18} color="#F97316" style={styles.destIcon} />
          <Text
            style={[
              styles.destinationText,
              !destinationText && styles.placeholderText,
            ]}
            numberOfLines={1}
          >
            {destinationText || 'Enter destination...'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 10,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F8FC',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  destinationBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#C3D9FF',
    marginTop: 8,
  },
  originIconCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#3122D2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  originInnerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3122D2',
  },
  destIcon: {
    marginRight: 10,
  },
  originText: {
    fontFamily: 'JakartaMedium',
    fontSize: 13,
    color: '#0B1528',
    flex: 1,
  },
  destinationText: {
    fontFamily: 'JakartaBold',
    fontSize: 13,
    color: '#0B1528',
    flex: 1,
  },
  placeholderText: {
    fontFamily: 'JakartaMedium',
    color: '#858585',
  },
  textInput: {
    fontFamily: 'JakartaMedium',
    fontSize: 13,
    color: '#0B1528',
    flex: 1,
    padding: 0,
  },
  connectorContainer: {
    position: 'absolute',
    left: 31,
    top: 48,
    zIndex: 2,
    gap: 3,
  },
  connectorDot: {
    width: 2.5,
    height: 2.5,
    borderRadius: 1.5,
    backgroundColor: '#C3D9FF',
  },
});
