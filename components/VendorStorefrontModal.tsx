import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons, FontAwesome, Feather, MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export interface VendorItem {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
}

export interface VendorStorefrontProps {
  visible: boolean;
  onClose: () => void;
  onSelectFoodItem?: (food: any) => void;
  onViewCart?: () => void;
}

const FEATURED_ITEMS: VendorItem[] = [
  {
    id: 'p1',
    name: 'Classic Margherita',
    price: 14.0,
    imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=90',
  },
  {
    id: 'p2',
    name: 'Pepperoni Passion',
    price: 16.5,
    imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&q=90',
  },
  {
    id: 'p3',
    name: 'Truffle Mushroom',
    price: 18.0,
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=90',
  },
  {
    id: 'p4',
    name: 'Prosciutto & Arugula',
    price: 19.5,
    imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=90',
  },
];

const { width } = Dimensions.get('window');
const GRID_CARD_WIDTH = (width - 44) / 2;

export default function VendorStorefrontModal({
  visible,
  onClose,
  onSelectFoodItem,
  onViewCart,
}: VendorStorefrontProps) {
  const [orderMode, setOrderMode] = useState<'Delivery' | 'Pickup' | 'Group Order'>('Delivery');
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Top Hero Banner */}
        <View style={styles.heroFrame}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=90',
            }}
            style={styles.heroImage}
            resizeMode="cover"
          />

          <TouchableOpacity
            style={styles.backBtn}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={20} color="#0B1528" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.favBtn}
            onPress={() => setIsFavorite(!isFavorite)}
            activeOpacity={0.8}
          >
            <FontAwesome
              name={isFavorite ? 'heart' : 'heart-o'}
              size={18}
              color={isFavorite ? '#EF4444' : '#0B1528'}
            />
          </TouchableOpacity>

          {/* Overlapping Vendor Logo */}
          <View style={styles.logoCircle}>
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=200&q=80',
              }}
              style={styles.logoImage}
            />
          </View>
        </View>

        {/* Scrollable Restaurant Profile */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Restaurant Title & Badges */}
          <View style={styles.headerInfo}>
            <Text style={styles.restaurantName}>Pizza Paradise</Text>

            <View style={styles.badgeRow}>
              <View style={styles.veyoPassBadge}>
                <Ionicons name="checkmark-circle" size={13} color="#0286FF" />
                <Text style={styles.veyoPassText}>VeyoPass</Text>
              </View>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.cuisineText}>Italian • Pizza</Text>
            </View>

            <View style={styles.ratingsRow}>
              <Text style={styles.ratingScore}>4.7</Text>
              <FontAwesome name="star" size={12} color="#D97706" />
              <Text style={styles.ratingCount}>1,240 ratings • 1.2 mi • $$</Text>
            </View>

            <Text style={styles.restaurantDesc}>
              Authentic Italian pizzas crafted with hand-tossed dough, San Marzano tomatoes, and fresh mozzarella.
            </Text>

            <View style={styles.openNowBadge}>
              <Text style={styles.openNowText}>OPEN NOW</Text>
              <Text style={styles.hoursText}>10:00 - 22:00</Text>
            </View>
          </View>

          {/* Delivery Metrics Strip */}
          <View style={styles.metricsStrip}>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>$2.99</Text>
              <Text style={styles.metricLabel}>delivery fee</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>20 min</Text>
              <Text style={styles.metricLabel}>prep time</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>$10</Text>
              <Text style={styles.metricLabel}>minimum</Text>
            </View>
          </View>

          {/* Order Mode Segments */}
          <View style={styles.modeSegmentTrack}>
            {(['Delivery', 'Pickup', 'Group Order'] as const).map((mode) => {
              const active = orderMode === mode;
              return (
                <TouchableOpacity
                  key={mode}
                  style={[styles.modeBtn, active && styles.modeBtnActive]}
                  onPress={() => setOrderMode(mode)}
                  activeOpacity={0.8}
                >
                  {mode === 'Group Order' && (
                    <Ionicons
                      name="people-outline"
                      size={14}
                      color={active ? '#0B1528' : '#858585'}
                      style={{ marginRight: 4 }}
                    />
                  )}
                  <Text style={[styles.modeText, active && styles.modeTextActive]}>
                    {mode}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Section: Featured Items */}
          <Text style={styles.sectionHeading}>Featured Items</Text>

          <View style={styles.featuredGrid}>
            {FEATURED_ITEMS.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.gridCard}
                activeOpacity={0.88}
                onPress={() => onSelectFoodItem && onSelectFoodItem(item)}
              >
                <View style={styles.cardImageFrame}>
                  <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.cardPrice}>${item.price.toFixed(2)}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Add a Second Restaurant Pill */}
          <TouchableOpacity style={styles.secondRestBtn} activeOpacity={0.8}>
            <Feather name="plus" size={15} color="#EF4444" />
            <Text style={styles.secondRestText}>Add a second restaurant</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Bottom Sticky Cart Bar */}
        <View style={styles.cartFooter}>
          <TouchableOpacity
            style={styles.viewCartBtn}
            activeOpacity={0.88}
            onPress={onViewCart}
          >
            <View style={styles.cartBtnInner}>
              <Ionicons name="cart" size={18} color="#FFFFFF" />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.cartActionText}>VIEW CART</Text>
                <Text style={styles.cartSubText}>Pizza Paradise</Text>
              </View>
              <View style={styles.cartCountCircle}>
                <Text style={styles.cartCountNumber}>2</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  heroFrame: {
    height: 180,
    width: '100%',
    position: 'relative',
    backgroundColor: '#991B1B',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  backBtn: {
    position: 'absolute',
    top: 14,
    left: 14,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  favBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  logoCircle: {
    position: 'absolute',
    bottom: -24,
    left: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
    backgroundColor: '#000000',
    zIndex: 15,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 32,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  headerInfo: {
    marginBottom: 16,
  },
  restaurantName: {
    fontFamily: 'JakartaBold',
    fontSize: 22,
    color: '#0B1528',
    marginBottom: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  veyoPassBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  veyoPassText: {
    fontFamily: 'JakartaBold',
    fontSize: 12,
    color: '#0286FF',
  },
  bulletDot: {
    color: '#9CA3AF',
  },
  cuisineText: {
    fontFamily: 'JakartaMedium',
    fontSize: 12,
    color: '#6B7280',
  },
  ratingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  ratingScore: {
    fontFamily: 'JakartaBold',
    fontSize: 12,
    color: '#0B1528',
  },
  ratingCount: {
    fontFamily: 'JakartaMedium',
    fontSize: 11,
    color: '#858585',
  },
  restaurantDesc: {
    fontFamily: 'JakartaMedium',
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 10,
  },
  openNowBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0FDF4',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  openNowText: {
    fontFamily: 'JakartaBold',
    fontSize: 10,
    color: '#15803D',
  },
  hoursText: {
    fontFamily: 'JakartaMedium',
    fontSize: 10,
    color: '#4B5563',
  },
  metricsStrip: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  metricItem: {
    alignItems: 'center',
  },
  metricValue: {
    fontFamily: 'JakartaBold',
    fontSize: 13,
    color: '#0B1528',
  },
  metricLabel: {
    fontFamily: 'JakartaMedium',
    fontSize: 10,
    color: '#858585',
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E5E7EB',
  },
  modeSegmentTrack: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    padding: 3,
    marginBottom: 20,
  },
  modeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 11,
  },
  modeBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  modeText: {
    fontFamily: 'JakartaMedium',
    fontSize: 11,
    color: '#6B7280',
  },
  modeTextActive: {
    fontFamily: 'JakartaBold',
    color: '#0B1528',
  },
  sectionHeading: {
    fontFamily: 'JakartaBold',
    fontSize: 16,
    color: '#0B1528',
    marginBottom: 12,
  },
  featuredGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  gridCard: {
    width: GRID_CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardImageFrame: {
    height: 120,
    width: '100%',
    backgroundColor: '#F3F4F6',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardContent: {
    padding: 10,
  },
  cardTitle: {
    fontFamily: 'JakartaBold',
    fontSize: 12,
    color: '#0B1528',
    marginBottom: 2,
  },
  cardPrice: {
    fontFamily: 'JakartaBold',
    fontSize: 12,
    color: '#3122D2',
  },
  secondRestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFF5F5',
    borderRadius: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#FED7D7',
    marginVertical: 8,
  },
  secondRestText: {
    fontFamily: 'JakartaBold',
    fontSize: 12,
    color: '#EF4444',
  },
  cartFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  viewCartBtn: {
    backgroundColor: '#EF4444', // Red CTA matching screenshot
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  cartBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartActionText: {
    fontFamily: 'JakartaBold',
    fontSize: 12,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  cartSubText: {
    fontFamily: 'JakartaMedium',
    fontSize: 10,
    color: '#FEE2E2',
  },
  cartCountCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartCountNumber: {
    fontFamily: 'JakartaBold',
    fontSize: 12,
    color: '#EF4444',
  },
});
