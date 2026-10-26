import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';

export interface FoodItem {
  id: string | number;
  title: string;
  cuisine: string;
  priceLevel: string; // e.g. "₦₦" or "$$"
  rating: string;
  time: string;
  imageUrl: string;
  price?: string | number;
  cookingTime?: string;
}

interface FoodDiscoveryCardProps {
  item: FoodItem;
  onPress?: (item: FoodItem) => void;
  onQuickAdd?: (item: FoodItem) => void;
  style?: object;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 44) / 2; // 2-column layout with 16px screen padding + 12px gap

export default function FoodDiscoveryCard({
  item,
  onPress,
  onQuickAdd,
  style,
}: FoodDiscoveryCardProps) {
  const displayPrice = item.price
    ? typeof item.price === 'number'
      ? `$${item.price.toFixed(2)}`
      : item.price
    : '$14.00';

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      activeOpacity={0.88}
      onPress={() => onPress && onPress(item)}
    >
      {/* Food Image */}
      <View style={styles.imageFrame}>
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Floating Rating Pill */}
        <View style={styles.ratingBadge}>
          <FontAwesome name="star" size={10} color="#D97706" />
          <Text style={styles.ratingText}>{item.rating}</Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>

        <Text style={styles.cookingTimeText} numberOfLines={1}>
          Cooking Time : {item.cookingTime || item.time}
        </Text>

        <View style={styles.bottomRow}>
          <Text style={styles.priceText}>{displayPrice}</Text>

          <TouchableOpacity
            style={styles.quickAddBtn}
            onPress={(e) => {
              e.stopPropagation();
              if (onQuickAdd) onQuickAdd(item);
              else if (onPress) onPress(item);
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 12,
  },
  imageFrame: {
    height: 120,
    width: '100%',
    backgroundColor: '#F3F4F6',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  ratingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  ratingText: {
    fontFamily: 'JakartaBold',
    fontSize: 10,
    color: '#0B1528',
    marginLeft: 3,
  },
  content: {
    padding: 10,
  },
  title: {
    fontFamily: 'JakartaBold',
    fontSize: 14,
    color: '#0B1528',
  },
  cookingTimeText: {
    fontFamily: 'JakartaMedium',
    fontSize: 11,
    color: '#858585',
    marginTop: 3,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  priceText: {
    fontFamily: 'JakartaBold',
    fontSize: 14,
    color: '#0B1528',
  },
  quickAddBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FF6B00',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },
});
