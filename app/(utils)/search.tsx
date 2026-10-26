import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  ActivityIndicator,
  Image,
  Platform,
  Alert,
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome, Feather, MaterialIcons } from '@expo/vector-icons';
import PageHeader from '@/components/PageHeader';
import SearchBar from '@/components/SearchBar';
import SearchMap, { SearchMapItem } from '@/components/SearchMap';
import MealCard from '@/components/MealCard';
import Drop, { SearchPill, TrendingItem } from '@/components/drop';
import CategoryCard from '@/components/CategoryCard';
import WhereToInput from '@/components/WhereToInput';
import RideOptionCard, { RideOption } from '@/components/RideOptionCard';
import { PressableHybrid } from '@/components/CustomPressable';
import { useCartStore } from '@/store/store';

const SEARCH_RESULTS: SearchMapItem[] = [
  {
    id: 1,
    title: 'Quinoa Power Bowl',
    distance: '1.2km',
    location: 'Victoria Island',
    price: '$14.50',
    rating: '4.8',
    category: 'Healthy Food',
    vendorName: 'Healthy Habits',
    latitude: 6.4350,
    longitude: 3.4260,
  },
  {
    id: 2,
    title: 'Grilled Atlantic Salmon',
    distance: '0.8km',
    location: 'Lekki Phase 1',
    price: '$22.00',
    rating: '4.9',
    category: 'Healthy Food',
    vendorName: 'Ocean Catch',
    latitude: 6.4420,
    longitude: 3.4370,
  },
  {
    id: 3,
    title: 'Avocado Goddess Bowl',
    distance: '1.5km',
    location: 'Ikoyi Waterfront',
    price: '$16.00',
    rating: '4.7',
    category: 'Salads',
    vendorName: 'Fresh Greens Co',
    latitude: 6.4330,
    longitude: 3.4290,
  },
  {
    id: 4,
    title: 'Cold-Pressed Detox Juice',
    distance: '0.5km',
    location: 'Oniru Beach Way',
    price: '$8.50',
    rating: '4.9',
    category: 'Beverages',
    vendorName: 'Zest Juice Bar',
    latitude: 6.4270,
    longitude: 3.4160,
  },
];

const SEARCH_IMAGES: Record<string, string> = {
  '1': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=90',
  '2': 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=90',
  '3': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=90',
  '4': 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=800&q=90',
};

const MEALS_DATA = [
  { id: 1, title: 'Quinoa Power Bowl', time: '15 mins', price: '14.50', rating: '4.8', imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=90' },
  { id: 2, title: 'Grilled Atlantic Salmon', time: '20 mins', price: '22.00', rating: '4.9', imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=90' },
  { id: 3, title: 'Chicken Tikka Masala', time: '25 mins', price: '16.00', rating: '4.6', imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=90' },
  { id: 4, title: 'Fresh Margherita Pizza', time: '18 mins', price: '13.50', rating: '4.7', imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=90' },
  { id: 5, title: 'Dragon Roll Sushi', time: '15 mins', price: '18.00', rating: '4.9', imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&q=90' },
  { id: 6, title: 'Cold-Pressed Detox Juice', time: '5 mins', price: '8.50', rating: '4.9', imageUrl: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=800&q=90' },
];

const MOBILITY_CAROUSEL: RideOption[] = [
  {
    id: 'opt-black',
    name: 'Veyo Black',
    eta: '3 min arrival',
    subtitle: 'VIP Chauffeur',
    price: '₦4,200',
    badge: 'RECOMMENDED',
    badgeType: 'recommended',
    iconType: 'black',
    seats: 4,
    imageUrl: 'https://images.unsplash.com/photo-1541348263662-e0c8de4259ba?w=800&q=90',
  },
  {
    id: 'opt-elite',
    name: 'Veyo Elite',
    eta: '5 min arrival',
    subtitle: 'Luxury Sedan',
    price: '₦3,500',
    iconType: 'comfort',
    seats: 4,
    imageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=90',
  },
  {
    id: 'opt-econ',
    name: 'Veyo Economy',
    eta: '4 min arrival',
    subtitle: 'Quick Daily Ride',
    price: '₦2,400',
    badge: 'FASTEST',
    badgeType: 'fastest',
    iconType: 'car',
    seats: 4,
    imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&q=90',
  },
];

export default function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ q?: string; category?: string; mode?: string }>();

  const [searchQuery, setSearchQuery] = useState(params.q || params.category || '');
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(Boolean(params.q || params.category));
  const [activeTab, setActiveTab] = useState<'Map' | 'Cards' | 'Grid'>(
    (params.mode as any) || 'Map'
  );

  const [favorites, setFavorites] = useState<Record<string, boolean>>({ '1': true });
  const [selectedCard, setSelectedCard] = useState<SearchMapItem | null>(SEARCH_RESULTS[0]);
  const [savePillVisible, setSavePillVisible] = useState(true);
  const [discoveryType, setDiscoveryType] = useState<'food' | 'mobility'>('food');
  const [destinationInput, setDestinationInput] = useState('');

  // Cart store integration
  const { addItem, getItemCount, getSubtotal } = useCartStore();
  const [cartCounts, setCartCounts] = useState<Record<number, number>>({});

  const recentSearches = ['Healthy Food', 'Sushi Master', 'Pizza Paradise', 'Juice Bar'];
  const trendingSearches = [
    'Quinoa Power Bowl',
    'Rainy Day Comforts',
    'Avocado Super Greens',
    'Organic Cold Pressed',
  ];

  // Hydrate if route params change
  useEffect(() => {
    if (params.q || params.category) {
      setSearchQuery(params.q || params.category || '');
      setHasSearched(true);
      if (params.mode && ['Map', 'Cards', 'Grid'].includes(params.mode)) {
        setActiveTab(params.mode as any);
      }
    }
  }, [params.q, params.category, params.mode]);

  const executeSearch = (overrideQuery?: string) => {
    const queryToUse = overrideQuery || searchQuery;
    if (!queryToUse.trim()) return;

    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      setHasSearched(true);
    }, 400);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setHasSearched(false);
    setActiveTab('Map');
  };

  const toggleFavorite = (id: string | number) => {
    setFavorites((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleAddToCart = (meal: any) => {
    setCartCounts((prev) => ({
      ...prev,
      [meal.id]: (prev[meal.id] || 0) + 1,
    }));

    addItem(
      {
        id: `m-${meal.id}`,
        vendor_id: 'v-1',
        name: meal.title,
        price: Number(meal.price.replace('$', '')),
        category: 'Food',
        is_available: true,
      } as any,
      { id: 'v-1', name: meal.vendorName || 'Healthy Habits' }
    );
  };

  const handleTrackOrder = (item: SearchMapItem) => {
    Alert.alert(
      'Track Order',
      `Order for ${item.title} is currently 12 mins away from your location.`,
      [
        { text: 'View Map Route', onPress: () => setActiveTab('Map') },
        { text: 'OK', style: 'cancel' },
      ]
    );
  };

  // ==========================================
  // VIEW 1: SEARCH RESULTS (MAP, CARDS, GRID)
  // ==========================================
  if (hasSearched) {
    return (
      <SafeAreaView style={styles.resultsContainer} edges={['top']}>
        <Stack.Screen options={{ headerShown: false }} />

        {/* 1. Header (Matches Screenshot: Back Arrow, Title, Filter Sliders) */}
        <PageHeader
          title={searchQuery || 'Healthy Food'}
          rightIconName="options-outline"
          titleColor="text-[#3122D2]"
          iconColor="#3122D2"
          onBackPress={clearSearch}
          onRightIconPress={() =>
            Alert.alert(
              'Search Filter',
              'Filter by Delivery Time, Price Range, Dietary Preferences, and Rating.'
            )
          }
        />

        {/* 2. View Mode Tabs (Map | Cards | Grid) */}
        <View style={styles.tabBar}>
          {(['Map', 'Cards', 'Grid'] as const).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={styles.tabButton}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {tab}
                </Text>
                {isActive && <View style={styles.tabUnderline} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 3. SUB-VIEW A: MAP VIEW WITH CARDS CAROUSEL */}
        {activeTab === 'Map' && (
          <View style={styles.mapCanvasWrapper}>
            {/* Real Interactive Map Canvas */}
            <SearchMap
              items={SEARCH_RESULTS}
              selectedItem={selectedCard}
              onSelectMarker={(item) => setSelectedCard(item)}
            />

            {/* Floating "Save this search" pill (Matches Screenshot) */}
            {savePillVisible && (
              <TouchableOpacity
                style={styles.savePill}
                activeOpacity={0.85}
                onPress={() =>
                  Alert.alert(
                    'Search Saved',
                    `"${searchQuery || 'Healthy Food'}" has been added to your saved searches.`
                  )
                }
              >
                <Ionicons name="search" size={13} color="#3122D2" />
                <Text style={styles.savePillText}>Save this search</Text>
                <TouchableOpacity
                  onPress={() => setSavePillVisible(false)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close" size={15} color="#9CA3AF" style={{ marginLeft: 8 }} />
                </TouchableOpacity>
              </TouchableOpacity>
            )}

            {/* Bottom Horizontal Floating Cards Carousel (Matches Screenshot) */}
            <View style={styles.carouselContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.carouselScroll}
                snapToInterval={280}
                decelerationRate="fast"
              >
                {SEARCH_RESULTS.map((item) => {
                  const isFav = favorites[String(item.id)];
                  const isSelected = selectedCard?.id === item.id;
                  const imgUri =
                    SEARCH_IMAGES[String(item.id)] ||
                    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=90';

                  return (
                    <PressableHybrid
                      key={item.id}
                      onPress={() => setSelectedCard(item)}
                      style={[
                        styles.carouselCard,
                        isSelected && styles.carouselCardSelected,
                      ]}
                    >
                      {/* Image Frame */}
                      <View style={styles.cardImageFrame}>
                        <Image
                          source={{ uri: imgUri }}
                          style={styles.cardImage}
                          resizeMode="cover"
                        />

                        {/* Top-Left Price Badge */}
                        <View style={styles.priceBadge}>
                          <Text style={styles.priceBadgeText}>{item.price}</Text>
                        </View>

                        {/* Bottom-Right Favorite Heart */}
                        <TouchableOpacity
                          style={styles.favBadge}
                          activeOpacity={0.8}
                          onPress={() => toggleFavorite(item.id)}
                        >
                          <FontAwesome
                            name="heart"
                            size={12}
                            color={isFav ? '#EF4444' : '#CCCCCC'}
                          />
                        </TouchableOpacity>
                      </View>

                      {/* Card Meta Content */}
                      <View style={styles.cardContent}>
                        <View style={styles.cardTitleRow}>
                          <Text style={styles.cardTitle} numberOfLines={1}>
                            {item.title}
                          </Text>
                          <View style={styles.ratingBadge}>
                            <FontAwesome name="star" size={10} color="#D97706" />
                            <Text style={styles.ratingText}>{item.rating}</Text>
                          </View>
                        </View>

                        <Text style={styles.distanceText}>
                          <Ionicons name="location-outline" size={11} color="#858585" />{' '}
                          {item.distance} • {item.location}
                        </Text>

                        {/* Action CTA Button */}
                        <TouchableOpacity
                          style={styles.trackOrderButton}
                          activeOpacity={0.8}
                          onPress={() => handleTrackOrder(item)}
                        >
                          <Feather name="book-open" size={13} color="#3122D2" />
                          <Text style={styles.trackOrderText}>Track Order</Text>
                        </TouchableOpacity>
                      </View>
                    </PressableHybrid>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        )}

        {/* 4. SUB-VIEW B: CARDS VIEW (Vertical Feed) */}
        {activeTab === 'Cards' && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.cardsFeedContent}
          >
            {SEARCH_RESULTS.map((item) => {
              const imgUri =
                SEARCH_IMAGES[String(item.id)] ||
                'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=90';
              const isFav = favorites[String(item.id)];

              return (
                <View key={item.id} style={styles.verticalFeedCard}>
                  <View style={styles.verticalCardImageFrame}>
                    <Image source={{ uri: imgUri }} style={styles.verticalCardImage} />
                    <View style={styles.priceBadge}>
                      <Text style={styles.priceBadgeText}>{item.price}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.favBadge}
                      activeOpacity={0.8}
                      onPress={() => toggleFavorite(item.id)}
                    >
                      <FontAwesome
                        name="heart"
                        size={12}
                        color={isFav ? '#EF4444' : '#CCCCCC'}
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.verticalCardBody}>
                    <View style={styles.cardTitleRow}>
                      <Text style={styles.verticalCardTitle}>{item.title}</Text>
                      <View style={styles.ratingBadge}>
                        <FontAwesome name="star" size={11} color="#D97706" />
                        <Text style={styles.ratingText}>{item.rating}</Text>
                      </View>
                    </View>

                    <Text style={styles.vendorSubtitle}>
                      By {item.vendorName || 'Veyo Kitchen'} • {item.distance} away
                    </Text>

                    <View style={styles.dietaryPillsRow}>
                      <View style={styles.dietaryPill}>
                        <Ionicons name="leaf" size={10} color="#0CC25F" />
                        <Text style={styles.dietaryPillText}>Fresh & Organic</Text>
                      </View>
                      <View style={styles.dietaryPill}>
                        <Ionicons name="flash" size={10} color="#0286FF" />
                        <Text style={styles.dietaryPillText}>Fast Prep (~15m)</Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={styles.feedAddButton}
                      activeOpacity={0.8}
                      onPress={() => handleAddToCart(item)}
                    >
                      <Ionicons name="cart-outline" size={15} color="#FFFFFF" />
                      <Text style={styles.feedAddButtonText}>Add to Order</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        )}

        {/* 5. SUB-VIEW C: GRID VIEW (2-Column Grid) */}
        {activeTab === 'Grid' && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.gridContent}
          >
            <View style={styles.gridWrapper}>
              {MEALS_DATA.map((meal) => (
                <MealCard
                  key={meal.id}
                  title={meal.title}
                  time={meal.time}
                  price={meal.price}
                  rating={meal.rating}
                  imageUrl={meal.imageUrl}
                  quantity={cartCounts[meal.id] || 0}
                  onAdd={() => handleAddToCart(meal)}
                />
              ))}
            </View>
          </ScrollView>
        )}

        {/* Floating Cart Pill if items exist */}
        {getItemCount() > 0 && (
          <TouchableOpacity
            style={styles.floatingCartPill}
            activeOpacity={0.9}
            onPress={() =>
              Alert.alert(
                'Shopping Cart',
                `You have ${getItemCount()} items ($${getSubtotal()}). Ready for checkout?`,
                [
                  { text: 'Checkout', onPress: () => router.push('/(root)/(tabs)/wallet') },
                  { text: 'Keep Browsing', style: 'cancel' },
                ]
              )
            }
          >
            <View style={styles.cartCountCircle}>
              <Text style={styles.cartCountText}>{getItemCount()}</Text>
            </View>
            <Text style={styles.cartBarText}>View Order</Text>
            <Text style={styles.cartBarTotal}>${getSubtotal()}</Text>
          </TouchableOpacity>
        )}
      </SafeAreaView>
    );
  }

  // ==========================================
  // VIEW 2: DISCOVERY SEARCH PAGE (Default)
  // ==========================================
  return (
    <SafeAreaView style={styles.discoveryContainer} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <PageHeader
          title="Search & Explore"
          rightIconName="options-outline"
          titleColor="text-black"
          iconColor="#000000"
          onBackPress={() => {
            if (router.canGoBack()) router.back();
            else router.push('/(root)/(tabs)/home');
          }}
        />

        {/* Discovery Switcher: Food vs Mobility (Matches Image 1) */}
        <View style={styles.discoveryTypeTrack}>
          <TouchableOpacity
            style={[
              styles.discoveryTypeBtn,
              discoveryType === 'food' && styles.discoveryTypeBtnActive,
            ]}
            onPress={() => setDiscoveryType('food')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="restaurant-outline"
              size={13}
              color={discoveryType === 'food' ? '#FFFFFF' : '#6B7280'}
            />
            <Text
              style={[
                styles.discoveryTypeText,
                discoveryType === 'food' && styles.discoveryTypeTextActive,
              ]}
            >
              Food Discovery
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.discoveryTypeBtn,
              discoveryType === 'mobility' && styles.discoveryTypeBtnActive,
            ]}
            onPress={() => setDiscoveryType('mobility')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="car-outline"
              size={14}
              color={discoveryType === 'mobility' ? '#FFFFFF' : '#6B7280'}
            />
            <Text
              style={[
                styles.discoveryTypeText,
                discoveryType === 'mobility' && styles.discoveryTypeTextActive,
              ]}
            >
              Mobility Destination
            </Text>
          </TouchableOpacity>
        </View>

        {discoveryType === 'mobility' ? (
          /* =================================================== */
          /* MOBILITY DESTINATION SEARCH (Matches Image 1 Left)  */
          /* =================================================== */
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40, gap: 14 }}
          >
            {/* 1. "Where to?" Dual Input Card */}
            <Text style={styles.mobilitySectionTitle}>Where to?</Text>
            <WhereToInput
              originText="Current Location"
              destinationText={destinationInput}
              isEditable={true}
              onDestinationChange={setDestinationInput}
              onDestinationPress={() => executeSearch(destinationInput || 'Victoria Island')}
            />

            {/* 2. Recent Destinations */}
            <View style={styles.recentSectionHeader}>
              <Text style={styles.mobilitySectionTitle}>Recent</Text>
              <TouchableOpacity onPress={() => console.log('See All')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.recentRow}>
              <TouchableOpacity
                style={styles.recentBox}
                activeOpacity={0.8}
                onPress={() => {
                  setDestinationInput('Work (Marina)');
                  executeSearch('Marina');
                }}
              >
                <View style={[styles.recentIconSquare, { backgroundColor: '#EEF2FF' }]}>
                  <Ionicons name="briefcase-outline" size={16} color="#3122D2" />
                </View>
                <Text style={styles.recentBoxTitle}>Work</Text>
                <Text style={styles.recentBoxSubtitle}>15 mins away</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.recentBox}
                activeOpacity={0.8}
                onPress={() => {
                  setDestinationInput('Home (VI)');
                  executeSearch('Victoria Island');
                }}
              >
                <View style={[styles.recentIconSquare, { backgroundColor: '#FFF7ED' }]}>
                  <Ionicons name="home-outline" size={16} color="#F97316" />
                </View>
                <Text style={styles.recentBoxTitle}>Home</Text>
                <Text style={styles.recentBoxSubtitle}>32 mins away</Text>
              </TouchableOpacity>
            </View>

            {/* Full-Width Card: Eko Gym & Fitness */}
            <TouchableOpacity
              style={styles.gymCard}
              activeOpacity={0.8}
              onPress={() => {
                setDestinationInput('Eko Gym & Fitness');
                executeSearch('Eko Gym');
              }}
            >
              <View style={[styles.recentIconSquare, { backgroundColor: '#CCFBF1' }]}>
                <Ionicons name="barbell-outline" size={16} color="#0D9488" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.gymCardTitle}>Eko Gym & Fitness</Text>
                <Text style={styles.gymCardSub}>Victoria Island, Lagos</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
            </TouchableOpacity>

            {/* 3. Vehicle Type Horizontal Cards Carousel */}
            <Text style={[styles.mobilitySectionTitle, { marginTop: 6 }]}>Vehicle Type</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 4 }}
            >
              {MOBILITY_CAROUSEL.map((veh) => (
                <RideOptionCard
                  key={veh.id}
                  option={veh}
                  layout="card"
                  onSelect={(v) => {
                    setDestinationInput(v.name);
                    executeSearch('Victoria Island');
                  }}
                />
              ))}
            </ScrollView>
          </ScrollView>
        ) : (
          /* =================================================== */
          /* FOOD DISCOVERY SEARCH (Matches Image 1 Right)       */
          /* =================================================== */
          <>
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={() => executeSearch()}
              onClearPress={clearSearch}
              placeholder="Search dishes or restaurants..."
            />

            {/* Quick Category Chips */}
            <View style={styles.categoryPillsScroll}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
                {['Healthy Food', 'Sushi', 'Italian Pizza', 'Burgers', 'Fresh Drinks', 'Express Rides'].map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryFilterPill,
                      searchQuery === cat && styles.categoryFilterPillActive,
                    ]}
                    onPress={() => {
                      setSearchQuery(cat);
                      executeSearch(cat);
                    }}
                  >
                    <Text
                      style={[
                        styles.categoryFilterPillText,
                        searchQuery === cat && styles.categoryFilterPillTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {isSearching ? (
              <View style={styles.searchingLoader}>
                <ActivityIndicator size="large" color="#3122D2" />
                <Text style={styles.searchingText}>Searching Veyo Engine...</Text>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Recent Searches */}
                <Drop title="Recent Search" next="CLEAR ALL" />
                <View style={styles.recentPillsWrapper}>
                  {recentSearches.map((item, index) => (
                    <SearchPill
                      key={index}
                      title={item}
                      onRemove={() => console.log(`Remove ${item}`)}
                    />
                  ))}
                </View>

                {/* Trending Searches */}
                <Drop title="Trending Searches" next="SEE ALL" />
                <View style={{ paddingHorizontal: 16 }}>
                  {trendingSearches.map((item, index) => (
                    <TrendingItem
                      key={index}
                      index={index + 1}
                      title={item}
                      onPress={() => {
                        setSearchQuery(item);
                        executeSearch(item);
                      }}
                    />
                  ))}
                </View>

                {/* Visual Discovery Cards */}
                <Drop title="Popular Categories" next="SEE ALL" />
                <View style={{ paddingHorizontal: 16, paddingTop: 10 }}>
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <CategoryCard
                      flex={1}
                      height={200}
                      title="Healthy Dining"
                      subtitle="Nutritious & Fresh"
                      imageUrl="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=90"
                    />
                    <CategoryCard
                      flex={1}
                      height={200}
                      title="Express Mobility"
                      subtitle="Cars & Couriers"
                      imageUrl="https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=90"
                    />
                  </View>

                  <View style={{ height: 12 }} />

                  <CategoryCard
                    width="100%"
                    height={150}
                    title="Gourmet & Groceries"
                    subtitle="Delivered to your doorstep"
                    imageUrl="https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=90"
                  />
                </View>
              </ScrollView>
            )}
          </>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  resultsContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  discoveryContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F1F1',
    marginTop: 8,
    paddingHorizontal: 20,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: 10,
    position: 'relative',
  },
  tabText: {
    fontFamily: 'JakartaSemiBold',
    fontSize: 15,
    color: '#9CA3AF',
  },
  tabTextActive: {
    color: '#3122D2',
    fontFamily: 'JakartaBold',
  },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    width: 48,
    height: 3,
    backgroundColor: '#3122D2',
    borderRadius: 2,
  },
  mapCanvasWrapper: {
    flex: 1,
    position: 'relative',
  },
  savePill: {
    position: 'absolute',
    top: 16,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  savePillText: {
    fontFamily: 'JakartaBold',
    fontSize: 12,
    color: '#3122D2',
    marginLeft: 6,
  },
  carouselContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    zIndex: 20,
  },
  carouselScroll: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  carouselCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: 270,
    marginRight: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  carouselCardSelected: {
    borderColor: '#3122D2',
    borderWidth: 1.5,
  },
  cardImageFrame: {
    height: 128,
    width: '100%',
    position: 'relative',
    backgroundColor: '#F3F4F6',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  priceBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#3122D2',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priceBadgeText: {
    fontFamily: 'JakartaBold',
    fontSize: 11,
    color: '#FFFFFF',
  },
  favBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: '#FFFFFF',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  cardContent: {
    padding: 12,
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    flex: 1,
    fontFamily: 'JakartaBold',
    fontSize: 14,
    color: '#0B1528',
    marginRight: 6,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  ratingText: {
    fontFamily: 'JakartaBold',
    fontSize: 10,
    color: '#B46E2A',
  },
  distanceText: {
    fontFamily: 'JakartaMedium',
    fontSize: 11,
    color: '#858585',
    marginBottom: 10,
  },
  trackOrderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.2,
    borderColor: '#3122D2',
    backgroundColor: '#FFFFFF',
  },
  trackOrderText: {
    fontFamily: 'JakartaBold',
    fontSize: 11,
    color: '#3122D2',
  },
  cardsFeedContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  verticalFeedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  verticalCardImageFrame: {
    height: 160,
    width: '100%',
    position: 'relative',
    backgroundColor: '#F3F4F6',
  },
  verticalCardImage: {
    width: '100%',
    height: '100%',
  },
  verticalCardBody: {
    padding: 14,
  },
  verticalCardTitle: {
    fontFamily: 'JakartaBold',
    fontSize: 16,
    color: '#0B1528',
  },
  vendorSubtitle: {
    fontFamily: 'JakartaMedium',
    fontSize: 12,
    color: '#858585',
    marginTop: 2,
    marginBottom: 8,
  },
  dietaryPillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  dietaryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F6F8FA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  dietaryPillText: {
    fontFamily: 'JakartaBold',
    fontSize: 10,
    color: '#475A99',
  },
  feedAddButton: {
    backgroundColor: '#0286FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
  },
  feedAddButtonText: {
    fontFamily: 'JakartaBold',
    fontSize: 12,
    color: '#FFFFFF',
  },
  gridContent: {
    padding: 16,
    paddingBottom: 40,
  },
  gridWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  floatingCartPill: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    backgroundColor: '#0B1528',
    borderRadius: 28,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    zIndex: 30,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  cartCountCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#0286FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartCountText: {
    fontFamily: 'JakartaBold',
    fontSize: 11,
    color: '#FFFFFF',
  },
  cartBarText: {
    fontFamily: 'JakartaBold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  cartBarTotal: {
    fontFamily: 'JakartaBold',
    fontSize: 13,
    color: '#0CC25F',
  },
  categoryPillsScroll: {
    marginVertical: 10,
  },
  categoryFilterPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: '#F6F8FA',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  categoryFilterPillActive: {
    backgroundColor: '#EBF4FF',
    borderColor: '#0286FF',
  },
  categoryFilterPillText: {
    fontFamily: 'JakartaBold',
    fontSize: 11,
    color: '#666666',
  },
  categoryFilterPillTextActive: {
    color: '#0286FF',
  },
  searchingLoader: {
    flex: 1,
    marginTop: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchingText: {
    marginTop: 12,
    fontFamily: 'JakartaMedium',
    fontSize: 13,
    color: '#858585',
  },
  recentPillsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginTop: 12,
    marginBottom: 16,
  },
  discoveryTypeTrack: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    marginHorizontal: 16,
    padding: 3,
    marginBottom: 14,
  },
  discoveryTypeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 11,
  },
  discoveryTypeBtnActive: {
    backgroundColor: '#3122D2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  discoveryTypeText: {
    fontFamily: 'JakartaMedium',
    fontSize: 12,
    color: '#6B7280',
  },
  discoveryTypeTextActive: {
    fontFamily: 'JakartaBold',
    color: '#FFFFFF',
  },
  mobilitySectionTitle: {
    fontFamily: 'JakartaBold',
    fontSize: 16,
    color: '#0B1528',
  },
  recentSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  seeAllText: {
    fontFamily: 'JakartaBold',
    fontSize: 12,
    color: '#3122D2',
  },
  recentRow: {
    flexDirection: 'row',
    gap: 12,
  },
  recentBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  recentIconSquare: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  recentBoxTitle: {
    fontFamily: 'JakartaBold',
    fontSize: 13,
    color: '#0B1528',
    marginBottom: 2,
  },
  recentBoxSubtitle: {
    fontFamily: 'JakartaMedium',
    fontSize: 11,
    color: '#858585',
  },
  gymCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  gymCardTitle: {
    fontFamily: 'JakartaBold',
    fontSize: 13,
    color: '#0B1528',
  },
  gymCardSub: {
    fontFamily: 'JakartaMedium',
    fontSize: 11,
    color: '#858585',
    marginTop: 1,
  },
});
