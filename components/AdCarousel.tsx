import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { dbContent, AdvertRecord } from '@/lib/db';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 32;

const DEFAULT_ADVERTS: AdvertRecord[] = [
  {
    id: 'adv-001',
    title: 'Midnight?',
    subtitle: 'Hot pizza to your hostel',
    cta_text: 'Order Food',
    route: '/(root)/(tabs)/explore',
    image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=600&auto=format&fit=crop',
    gradient_start: '#1A1A1A',
    gradient_end: '#0A0A0A',
    cta_bg: '#10B981',
    display_order: 1,
  },
  {
    id: 'adv-002',
    title: '60% Off',
    subtitle: 'Weekend Special Deal',
    cta_text: 'Order Now',
    route: '/(root)/(tabs)/explore',
    image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop',
    gradient_start: '#1A1828',
    gradient_end: '#0F0E1A',
    cta_bg: '#F97316',
    display_order: 2,
  },
  {
    id: 'adv-003',
    title: 'Free Ride',
    subtitle: 'On your first Veyo trip',
    cta_text: 'Book Now',
    route: '/(utils)/book-ride',
    image_url: 'https://freepngimg.com/thumb/vehicle/93770-renegade-tire-jeep-automotive-2018-exterior.png',
    gradient_start: '#111A2E',
    gradient_end: '#0B1220',
    cta_bg: '#0286FF',
    display_order: 3,
  },
];

export default function AdCarousel() {
  const router = useRouter();
  const [adverts, setAdverts] = useState<AdvertRecord[]>(DEFAULT_ADVERTS);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    let isMounted = true;
    dbContent.getAdverts().then((data) => {
      if (isMounted && data && data.length > 0) {
        setAdverts(data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: any[] }) => {
      if (viewableItems && viewableItems.length > 0) {
        setCurrentIndex(viewableItems[0].index || 0);
      }
    }
  ).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  return (
    <View style={styles.container}>
      <FlatList
        data={adverts}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + 14}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewConfig}
        contentContainerStyle={{ paddingHorizontal: 0 }}
        renderItem={({ item }) => {
          const colors = [
            item.gradient_start || '#1A1A1A',
            item.gradient_end || '#0A0A0A',
          ] as [string, string];

          return (
            <View style={[styles.card, { width: CARD_WIDTH }]}>
              <LinearGradient
                colors={colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardGradient}
              >
                {/* Left Text & CTA */}
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
                    style={[
                      styles.ctaButton,
                      { backgroundColor: item.cta_bg || '#10B981' },
                    ]}
                  >
                    <Text style={styles.ctaText}>{item.cta_text}</Text>
                  </TouchableOpacity>
                </View>

                {/* Right Hero Cutout Image */}
                <Image
                  source={{ uri: item.image_url }}
                  style={styles.heroImage}
                  resizeMode="contain"
                />
              </LinearGradient>
            </View>
          );
        }}
      />

      {/* Pagination Indicators */}
      {adverts.length > 1 && (
        <View style={styles.paginationRow}>
          {adverts.map((item, idx) => (
            <View
              key={idx}
              style={[
                styles.dotBase,
                idx === currentIndex
                  ? [
                      styles.dotActive,
                      { backgroundColor: item.cta_bg || '#0286FF' },
                    ]
                  : styles.dotInactive,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  card: {
    height: 140,
    borderRadius: 24,
    overflow: 'hidden',
    marginRight: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  cardGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  textColumn: {
    width: '58%',
    zIndex: 10,
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontFamily: 'JakartaBold',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: 'JakartaMedium',
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 4,
    marginBottom: 14,
    lineHeight: 17,
  },
  ctaButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 9999,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  ctaText: {
    fontFamily: 'JakartaBold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  heroImage: {
    position: 'absolute',
    right: -16,
    top: 6,
    width: 160,
    height: 140,
    zIndex: 5,
  },
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    gap: 6,
  },
  dotBase: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 24,
  },
  dotInactive: {
    width: 6,
    backgroundColor: '#D1D5DB',
  },
});
