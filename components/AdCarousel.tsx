import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { RADIUS, SPACING } from '@/constants/designTokens';
import { dbContent, AdvertRecord } from '@/lib/db';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - (SPACING.screen * 2);

const DEFAULT_ADVERTS: AdvertRecord[] = [
  {
    id: 'adv-001',
    title: '60% Off Meals',
    subtitle: 'Weekend special deals from local chefs',
    cta_text: 'Order Food',
    route: '/(root)/(tabs)/explore',
    image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop',
    gradient_start: '#1E1B4B',
    gradient_end: '#0F172A',
    cta_bg: '#F97316',
    display_order: 1,
  },
  {
    id: 'adv-002',
    title: 'First Ride Free',
    subtitle: 'Comfort rides with top rated drivers',
    cta_text: 'Book Ride',
    route: '/(utils)/book-ride',
    image_url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=600&auto=format&fit=crop',
    gradient_start: '#0B1528',
    gradient_end: '#1E3A8A',
    cta_bg: '#0286FF',
    display_order: 2,
  },
  {
    id: 'adv-003',
    title: 'Midnight Cravings?',
    subtitle: 'Hot pizza & shawarma delivered to your door',
    cta_text: 'Order Now',
    route: '/(root)/(tabs)/explore',
    image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=600&auto=format&fit=crop',
    gradient_start: '#31111D',
    gradient_end: '#1A0B10',
    cta_bg: '#10B981',
    display_order: 3,
  },
];

const AdCarousel = () => {
  const router = useRouter();
  const [adverts, setAdverts] = useState<AdvertRecord[]>(DEFAULT_ADVERTS);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    let isMounted = true;
    async function loadAdvertsFromDb() {
      try {
        const data = await dbContent.getAdverts();
        if (isMounted && data && data.length > 0) {
          setAdverts(data);
        }
      } catch (err) {
        console.error('Failed to load adverts from database:', err);
      }
    }

    loadAdvertsFromDb();
    return () => {
      isMounted = false;
    };
  }, []);

  const onViewRef = useRef(({ viewableItems }: { viewableItems: any[] }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  });

  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });

  return (
    <View style={styles.container}>
      <FlatList
        data={adverts}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + 10}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={onViewRef.current}
        viewabilityConfig={viewConfigRef.current}
        renderItem={({ item }) => {
          const gradientColors = [item.gradient_start || '#0B1528', item.gradient_end || '#1E3A8A'] as [string, string];
          return (
            <View style={[styles.card, { width: CARD_WIDTH }]}>
              <LinearGradient
                colors={gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
              >
                {/* Left Content */}
                <View style={styles.textColumn}>
                  <Text style={styles.title} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.subtitle} numberOfLines={2}>
                    {item.subtitle}
                  </Text>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => router.push(item.route as any)}
                    style={[styles.ctaBtn, { backgroundColor: item.cta_bg || '#0286FF' }]}
                  >
                    <Text style={styles.ctaText}>{item.cta_text}</Text>
                  </TouchableOpacity>
                </View>

                {/* Right Hero Image */}
                <Image
                  source={{ uri: item.image_url }}
                  style={styles.heroImage}
                  resizeMode="cover"
                />
              </LinearGradient>
            </View>
          );
        }}
      />

      {/* Pagination Dots */}
      {adverts.length > 1 && (
        <View style={styles.paginationDots}>
          {adverts.map((_, idx) => (
            <View
              key={idx}
              style={[
                styles.dot,
                idx === currentIndex ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

export default AdCarousel;

const styles = StyleSheet.create({
  container: {
    marginVertical: 2,
  },
  card: {
    height: 118,
    borderRadius: RADIUS.card,
    overflow: 'hidden',
    marginRight: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  gradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    position: 'relative',
  },
  textColumn: {
    flex: 1,
    zIndex: 10,
    justifyContent: 'center',
    paddingRight: 12,
  },
  title: {
    fontSize: 16,
    fontFamily: 'JakartaBold',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 11,
    fontFamily: 'JakartaMedium',
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 3,
    marginBottom: 8,
    lineHeight: 15,
  },
  ctaBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  ctaText: {
    fontFamily: 'JakartaBold',
    fontSize: 11,
    color: '#FFFFFF',
  },
  heroImage: {
    width: 88,
    height: 88,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
    gap: 5,
  },
  dot: {
    height: 3.5,
    borderRadius: 2,
  },
  dotActive: {
    width: 14,
    backgroundColor: '#0286FF',
  },
  dotInactive: {
    width: 5,
    backgroundColor: '#D1D5DB',
  },
});
