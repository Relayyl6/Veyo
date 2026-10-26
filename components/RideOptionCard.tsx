import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export interface RideOption {
  id: string;
  name: string;
  eta: string;
  subtitle: string;
  price: string;
  rawPrice?: number;
  badge?: string;
  badgeType?: 'fastest' | 'eco' | 'recommended';
  iconType: 'car' | 'comfort' | 'ev' | 'bike' | 'black';
  seats?: number;
  imageUrl?: string;
}

interface RideOptionCardProps {
  option: RideOption;
  isSelected?: boolean;
  onSelect?: (option: RideOption) => void;
  layout?: 'row' | 'card';
  style?: object;
}

export default function RideOptionCard({
  option,
  isSelected = false,
  onSelect,
  layout = 'row',
  style,
}: RideOptionCardProps) {
  const renderIcon = () => {
    switch (option.iconType) {
      case 'comfort':
        return <MaterialCommunityIcons name="car-seat" size={20} color="#3122D2" />;
      case 'ev':
        return <Ionicons name="battery-charging" size={20} color="#0D9488" />;
      case 'bike':
        return <Ionicons name="bicycle" size={20} color="#4F46E5" />;
      case 'black':
        return <FontAwesome5 name="car-side" size={20} color="#FFFFFF" />;
      default:
        return <FontAwesome5 name="car" size={18} color="#3122D2" />;
    }
  };

  // 1. Horizontal Carousel Card Format (Image 1: Veyo Black)
  if (layout === 'card') {
    return (
      <TouchableOpacity
        style={[
          styles.carouselCard,
          isSelected && styles.carouselCardSelected,
          style,
        ]}
        activeOpacity={0.85}
        onPress={() => onSelect && onSelect(option)}
      >
        {/* Top-Right Badge */}
        {option.badge && (
          <View style={styles.cardRecommendedBadge}>
            <Text style={styles.cardRecommendedBadgeText}>{option.badge}</Text>
          </View>
        )}

        {/* Car Image Preview */}
        <View style={styles.cardImageFrame}>
          <Image
            source={{
              uri:
                option.imageUrl ||
                'https://images.unsplash.com/photo-1541348263662-e0c8de4259ba?w=800&q=90',
            }}
            style={styles.cardCarImage}
            resizeMode="cover"
          />
        </View>

        {/* Card Footer */}
        <View style={styles.cardFooter}>
          <View style={styles.cardInfoRow}>
            <Text style={styles.cardTitle}>{option.name}</Text>
            <Text style={styles.cardPrice}>{option.price}</Text>
          </View>

          <View style={styles.cardMetaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="person" size={11} color="#9CA3AF" />
              <Text style={styles.metaText}>{option.seats || 4} seats</Text>
            </View>
            <View style={styles.metaDot} />
            <Text style={styles.metaText}>{option.eta}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // 2. Vertical Row Format (Image 2: Economy, Comfort, Veyo EV, Bike)
  return (
    <TouchableOpacity
      style={[
        styles.rowContainer,
        isSelected && styles.rowSelected,
        style,
      ]}
      activeOpacity={0.85}
      onPress={() => onSelect && onSelect(option)}
    >
      {/* Icon Container */}
      <View
        style={[
          styles.rowIconCircle,
          option.iconType === 'ev' && styles.evIconBg,
        ]}
      >
        {renderIcon()}
      </View>

      {/* Middle Text Info */}
      <View style={styles.rowMiddle}>
        <View style={styles.nameRow}>
          <Text style={styles.rowName}>{option.name}</Text>
          {option.badge && (
            <View
              style={[
                styles.badgePill,
                option.badgeType === 'eco' && styles.ecoBadgePill,
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  option.badgeType === 'eco' && styles.ecoBadgeText,
                ]}
              >
                {option.badge}
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.rowSubtitle}>
          {option.eta} • {option.subtitle}
        </Text>
      </View>

      {/* Right Price */}
      <View style={styles.priceContainer}>
        <Text style={styles.rowPrice}>{option.price}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Row Format (Image 2)
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#F1F1F1',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  rowSelected: {
    borderColor: '#3122D2',
    backgroundColor: '#FAF9FF',
  },
  rowIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  evIconBg: {
    backgroundColor: '#CCFBF1',
  },
  rowMiddle: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  rowName: {
    fontFamily: 'JakartaBold',
    fontSize: 15,
    color: '#0B1528',
  },
  badgePill: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontFamily: 'JakartaBold',
    fontSize: 9,
    color: '#1D4ED8',
    letterSpacing: 0.5,
  },
  ecoBadgePill: {
    backgroundColor: '#D1FAE5',
  },
  ecoBadgeText: {
    color: '#059669',
  },
  rowSubtitle: {
    fontFamily: 'JakartaMedium',
    fontSize: 11,
    color: '#858585',
  },
  priceContainer: {
    marginLeft: 8,
  },
  rowPrice: {
    fontFamily: 'JakartaBold',
    fontSize: 15,
    color: '#0B1528',
  },

  // Carousel Card Format (Image 1)
  carouselCard: {
    width: 240,
    backgroundColor: '#1E1B4B',
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    marginRight: 12,
  },
  carouselCardSelected: {
    borderWidth: 2,
    borderColor: '#0286FF',
  },
  cardRecommendedBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#0286FF',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    zIndex: 10,
  },
  cardRecommendedBadgeText: {
    fontFamily: 'JakartaBold',
    fontSize: 8,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  cardImageFrame: {
    height: 120,
    width: '100%',
    backgroundColor: '#0F172A',
  },
  cardCarImage: {
    width: '100%',
    height: '100%',
  },
  cardFooter: {
    padding: 12,
  },
  cardInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontFamily: 'JakartaBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  cardPrice: {
    fontFamily: 'JakartaBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaText: {
    fontFamily: 'JakartaMedium',
    fontSize: 10,
    color: '#9CA3AF',
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#9CA3AF',
  },
});
