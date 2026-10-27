import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome, Ionicons, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/expo';
import Header from '@/components/Header';
import { images } from '@/constants/utils';
import CategoryCard from '@/components/CategoryCard';
import CarouselCard from '@/components/CarousalCard';
import FoodDiscoveryCard, { FoodItem } from '@/components/FoodDiscoveryCard';
import VendorStorefrontModal from '@/components/VendorStorefrontModal';
import FoodDetailModal from '@/components/FoodDetailModal';
import CartSummaryModal from '@/components/CartSummaryModal';
import OrderSuccessModal from '@/components/OrderSuccessModal';
import OrderTrackingModal from '@/components/OrderTrackingModal';
import RoleSwitcherPill from '@/components/RoleSwitcherPill';
import { discoveryData } from '@/constants/item';
import { useUserStore } from '@/store/store';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const CARD_HEIGHT = 150;

const FOOD_DISCOVERY_LIST: FoodItem[] = [
  {
    id: 'f1',
    title: 'Chicken Masala',
    cuisine: 'Traditional',
    priceLevel: '₦₦',
    rating: '4.5',
    time: '30 mins',
    cookingTime: '30 mins',
    price: 14.0,
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80',
  },
  {
    id: 'f2',
    title: 'Cheese Burger',
    cuisine: 'Fast Food',
    priceLevel: '₦₦',
    rating: '4.2',
    time: '8 mins',
    cookingTime: '8 mins',
    price: 9.0,
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80',
  },
  {
    id: 'f3',
    title: 'Special Noodles',
    cuisine: 'Asian',
    priceLevel: '₦₦',
    rating: '4.7',
    time: '15 mins',
    cookingTime: '15 mins',
    price: 12.5,
    imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&q=80',
  },
  {
    id: 'f4',
    title: 'Pizza Central',
    cuisine: 'Italian',
    priceLevel: '₦₦₦',
    rating: '4.8',
    time: '18 mins',
    cookingTime: '18 mins',
    price: 14.99,
    imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&q=80',
  },
];

const CATEGORY_CHIPS = [
  { id: 'best_dishes', name: 'Best Dishes', icon: 'restaurant' },
  { id: 'burger', name: 'Burger', icon: 'fast-food' },
  { id: 'noodles', name: 'Noodles', icon: 'pizza' },
  { id: 'juice', name: 'Juice', icon: 'cafe' },
  { id: 'healthy', name: 'Healthy', icon: 'leaf' },
];

export default function ExploreScreen() {
  const router = useRouter();
  const { user } = useUser();
  const insets = useSafeAreaInsets();
  const role = useUserStore((state) => state.role);

  const [activeCategory, setActiveCategory] = useState('best_dishes');
  const [listData, setListData] = useState(discoveryData);
  const scrollAnim = useSharedValue(0);
  const currentIndexRef = useRef(0);

  // Modals state
  const [vendorModalVisible, setVendorModalVisible] = useState(false);
  const [foodDetailVisible, setFoodDetailVisible] = useState(false);
  const [selectedFoodItem, setSelectedFoodItem] = useState<any>(null);
  const [cartModalVisible, setCartModalVisible] = useState(false);
  const [orderSuccessVisible, setOrderSuccessVisible] = useState(false);
  const [latestOrderId, setLatestOrderId] = useState('VE-90210');
  const [trackingModalVisible, setTrackingModalVisible] = useState(false);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((event) => {
      const newFloatIndex = currentIndexRef.current - event.translationX / width;
      scrollAnim.value = newFloatIndex;
    })
    .onEnd((event) => {
      const dx = event.translationX;
      const vx = event.velocityX;
      const SWIPE_THRESHOLD = width * 0.25;
      const VELOCITY_THRESHOLD = 500;

      let step = 0;
      if (dx < -SWIPE_THRESHOLD || vx < -VELOCITY_THRESHOLD) step = 1;
      else if (dx > SWIPE_THRESHOLD || vx > VELOCITY_THRESHOLD) step = -1;

      const nextIndex = Math.max(0, currentIndexRef.current + step);
      scrollAnim.value = withSpring(nextIndex, { damping: 15, stiffness: 150 });

      runOnJS(() => {
        currentIndexRef.current = nextIndex;
      })();
    });

  const handleCardPress = (item: FoodItem) => {
    if (item.title === 'Pizza Central' || item.cuisine === 'Italian') {
      setVendorModalVisible(true);
    } else {
      setSelectedFoodItem({
        id: item.id,
        title: item.title,
        price: typeof item.price === 'number' ? item.price : 14.0,
        rating: item.rating,
        reviewsCount: 120,
        description: `Freshly prepared ${item.title} crafted with premium ingredients and authentic seasonings.`,
        imageUrl: item.imageUrl,
        tags: [item.cuisine, 'Popular'],
        restaurantName: 'Brooklyn Bites',
        restaurantAddress: '789 Park Avenue, New York, NY',
        cookingTime: item.time,
        cuisine: item.cuisine,
      });
      setFoodDetailVisible(true);
    }
  };

  const handleQuickAdd = (item: FoodItem) => {
    Alert.alert('Added to Cart', `1x ${item.title} added to your cart.`, [
      { text: 'View Cart', onPress: () => setCartModalVisible(true) },
      { text: 'Keep Browsing', style: 'cancel' },
    ]);
  };

  const handleOrderCompleted = (orderId: string) => {
    setLatestOrderId(orderId);
    setOrderSuccessVisible(true);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* 1. Header */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          paddingTop: insets.top,
          paddingBottom: 10,
          backgroundColor: 'transparent',
        }}
      >
        <Header
          name={user?.firstName as string | undefined}
          title="VI, Lagos"
          image={images.logohor}
          onNotificationPress={() => setCartModalVisible(true)}
        />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{
          paddingTop: insets.top + 58,
          paddingBottom: insets.bottom + 85,
          paddingHorizontal: 12,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Role Switcher Pill */}
        <RoleSwitcherPill />

        {/* Vendor Notice Banner when in Merchant Mode */}
        {role === 'vendor_admin' && (
          <View style={styles.vendorModeBanner}>
            <Ionicons name="storefront" size={16} color="#0286FF" />
            <Text style={styles.vendorModeText}>
              Viewing Customer Storefront. Head to Profile tab to manage orders & menu.
            </Text>
          </View>
        )}

        {/* 2. Hero Search Section */}
        <Text style={styles.heroTitle}>Food Discovery</Text>

        {/* Search Input Bar */}
        <TouchableOpacity
          style={styles.searchBarBox}
          activeOpacity={0.88}
          onPress={() => router.push('/(utils)/search')}
        >
          <Ionicons name="search" size={18} color="#858585" />
          <Text style={styles.searchBarPlaceholder}>
            Search for dishes or restaurants
          </Text>
          <View style={styles.filterSlidersIcon}>
            <Ionicons name="options-outline" size={16} color="#3122D2" />
          </View>
        </TouchableOpacity>

        {/* Category Pills Strip */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryPillsRow}
        >
          {CATEGORY_CHIPS.map((chip) => {
            const active = activeCategory === chip.id;
            return (
              <TouchableOpacity
                key={chip.id}
                style={[styles.categoryPill, active && styles.categoryPillActive]}
                onPress={() => setActiveCategory(chip.id)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={chip.icon as any}
                  size={14}
                  color={active ? '#FFFFFF' : '#4B5563'}
                />
                <Text
                  style={[
                    styles.categoryPillText,
                    active && styles.categoryPillTextActive,
                  ]}
                >
                  {chip.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* 3. Veyo Plus Promo Banner (from media reference) */}
        <View style={styles.promoBanner}>
          <Text style={styles.promoTag}>VEYO PLUS PROMO</Text>
          <Text style={styles.promoTitle}>Get 10% off all food orders</Text>
          <Text style={styles.promoSub}>
            Exclusive premium offer valid this week only for our gold members
          </Text>
          <TouchableOpacity
            style={styles.promoClaimBtn}
            onPress={() => Alert.alert('Promo Claimed', '10% discount applied to your checkout cart!')}
            activeOpacity={0.85}
          >
            <Text style={styles.promoClaimText}>Claim Now</Text>
          </TouchableOpacity>
        </View>

        {/* 4. 2-Column Food / Restaurant Grid with Instant Add */}
        <View style={styles.foodGrid}>
          {FOOD_DISCOVERY_LIST.map((item) => (
            <FoodDiscoveryCard
              key={item.id}
              item={item}
              onPress={handleCardPress}
              onQuickAdd={handleQuickAdd}
            />
          ))}
        </View>

        {/* 5. Free Delivery Banner */}
        <TouchableOpacity
          style={styles.freeDeliveryBanner}
          activeOpacity={0.9}
          onPress={() => setCartModalVisible(true)}
        >
          <View style={styles.freeDeliveryTextCol}>
            <Text style={styles.freeDeliveryTitle}>Free Delivery</Text>
            <Text style={styles.freeDeliverySub}>On orders over ₦5,000</Text>
          </View>
          <View style={styles.freeDeliveryArrow}>
            <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        {/* 6. Quick Discovery Swiper Carousel */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Quick Discovery</Text>
          <TouchableOpacity onPress={() => router.push('/(utils)/search')}>
            <Text style={styles.viewAllText}>VIEW ALL</Text>
          </TouchableOpacity>
        </View>

        <GestureDetector gesture={panGesture}>
          <View
            style={{
              height: CARD_HEIGHT + 20,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {listData.map((item, index) => (
              <CarouselCard
                key={item.id}
                item={item}
                index={index}
                scrollAnim={scrollAnim}
                total={listData.length}
              />
            ))}
          </View>
        </GestureDetector>

        {/* 7. Weekend Hangouts Category Grid */}
        <View style={[styles.sectionHeaderRow, { marginTop: 24 }]}>
          <Text style={styles.sectionTitle}>Weekend Hangouts</Text>
          <Ionicons name="arrow-forward" size={18} color="#3122D2" />
        </View>

        <View style={styles.row}>
          <CategoryCard
            flex={1}
            height={280}
            title="Luxe Nightlife"
            subtitle="8 CURATED SPOTS"
            imageUrl="https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=800&q=90"
          />

          <View style={{ width: 12 }} />

          <View style={{ flex: 1, height: 280, justifyContent: 'space-between' }}>
            <CategoryCard
              width="100%"
              height={134}
              title="Quiet Cafes"
              subtitle="12 locations"
              imageUrl="https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=800&q=90"
            />

            <CategoryCard
              width="100%"
              height={134}
              title="Art & Culture"
              subtitle="Museums & Galleries"
              imageUrl="https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=90"
            />
          </View>
        </View>
      </ScrollView>

      {/* MODALS */}
      {/* 1. Vendor Storefront (Pizza Paradise) */}
      <VendorStorefrontModal
        visible={vendorModalVisible}
        onClose={() => setVendorModalVisible(false)}
        onSelectFoodItem={(food) => {
          setSelectedFoodItem({
            id: food.id,
            title: food.name,
            price: food.price,
            rating: '4.8',
            reviewsCount: 120,
            description:
              'Hand-crafted artisan pizza made fresh to order with Italian mozzarella.',
            imageUrl: food.imageUrl,
            tags: ['Italian', 'Popular'],
            restaurantName: 'Pizza Paradise',
            restaurantAddress: '789 Park Avenue, New York, NY',
            cookingTime: '20 min',
            cuisine: 'Italian',
          });
          setFoodDetailVisible(true);
        }}
        onViewCart={() => {
          setVendorModalVisible(false);
          setCartModalVisible(true);
        }}
      />

      {/* 2. Food Detail & Customization with Track Order shortcut */}
      <FoodDetailModal
        visible={foodDetailVisible}
        item={selectedFoodItem}
        onClose={() => setFoodDetailVisible(false)}
        onTrackOrder={() => {
          setFoodDetailVisible(false);
          setTrackingModalVisible(true);
        }}
        onAddToCart={(it, qty) => {
          Alert.alert('Added to Cart', `${qty}x ${it.title} added!`, [
            { text: 'View Cart', onPress: () => setCartModalVisible(true) },
            { text: 'Continue', style: 'cancel' },
          ]);
        }}
      />

      {/* 3. Cart Summary & Checkout */}
      <CartSummaryModal
        visible={cartModalVisible}
        onClose={() => setCartModalVisible(false)}
        onOrderCompleted={handleOrderCompleted}
      />

      {/* 4. Order Completed Modal */}
      <OrderSuccessModal
        visible={orderSuccessVisible}
        orderId={latestOrderId}
        onTrackOrder={() => {
          setOrderSuccessVisible(false);
          setTrackingModalVisible(true);
        }}
        onBackToHome={() => setOrderSuccessVisible(false)}
      />

      {/* 5. Live Delivery Tracking Modal */}
      <OrderTrackingModal
        visible={trackingModalVisible}
        orderId={latestOrderId}
        onClose={() => setTrackingModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F8FA',
  },
  scroll: {
    flex: 1,
  },
  vendorModeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
  },
  vendorModeText: {
    flex: 1,
    fontFamily: 'JakartaMedium',
    fontSize: 12,
    color: '#1E40AF',
    marginLeft: 8,
  },
  heroTitle: {
    fontFamily: 'JakartaBold',
    fontSize: 22,
    color: '#0B1528',
    marginBottom: 14,
  },
  searchBarBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 16,
  },
  searchBarPlaceholder: {
    flex: 1,
    fontFamily: 'JakartaMedium',
    fontSize: 13,
    color: '#858585',
    marginLeft: 10,
  },
  filterSlidersIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#F5F8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryPillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  categoryPillActive: {
    backgroundColor: '#FF6B00',
    borderColor: '#FF6B00',
  },
  categoryPillText: {
    fontFamily: 'JakartaBold',
    fontSize: 12,
    color: '#4B5563',
    marginLeft: 6,
  },
  categoryPillTextActive: {
    color: '#FFFFFF',
  },

  // Promo Banner
  promoBanner: {
    backgroundColor: '#EEF2FF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#C3D9FF',
  },
  promoTag: {
    fontFamily: 'JakartaBold',
    fontSize: 10,
    color: '#3122D2',
    letterSpacing: 0.8,
  },
  promoTitle: {
    fontFamily: 'JakartaBold',
    fontSize: 18,
    color: '#0B1528',
    marginTop: 4,
  },
  promoSub: {
    fontFamily: 'JakartaMedium',
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    marginBottom: 12,
    lineHeight: 16,
  },
  promoClaimBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#3122D2',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  promoClaimText: {
    fontFamily: 'JakartaBold',
    fontSize: 12,
    color: '#FFFFFF',
  },

  foodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  freeDeliveryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0286FF',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 20,
    shadowColor: '#0286FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  freeDeliveryTextCol: {
    flex: 1,
  },
  freeDeliveryTitle: {
    fontFamily: 'JakartaBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  freeDeliverySub: {
    fontFamily: 'JakartaMedium',
    fontSize: 12,
    color: '#E0F2FE',
    marginTop: 2,
  },
  freeDeliveryArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: 'JakartaBold',
    fontSize: 16,
    color: '#0B1528',
  },
  viewAllText: {
    fontFamily: 'JakartaBold',
    fontSize: 12,
    color: '#3122D2',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 20,
  },
});
