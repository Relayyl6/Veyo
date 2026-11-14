import React, { useState, useRef } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { RADIUS, SPACING } from '@/constants/designTokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - (SPACING.screen * 2);

const advertData = [
  {
    id: '1',
    title: '60% Off Meals',
    subtitle: 'Weekend special deals from local chefs',
    ctaText: 'Order Food',
    route: '/(root)/(tabs)/explore',
    image: { uri: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=400&auto=format&fit=crop' },
    gradient: ['#1E1B4B', '#0F172A'] as [string, string],
    ctaBg: '#F97316',
  },
  {
    id: '2',
    title: 'First Ride Free',
    subtitle: 'Comfort rides with top rated drivers',
    ctaText: 'Book Ride',
    route: '/(utils)/book-ride',
    image: { uri: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=400&auto=format&fit=crop' },
    gradient: ['#0B1528', '#1E3A8A'] as [string, string],
    ctaBg: '#0286FF',
  },
  {
    id: '3',
    title: 'Midnight Cravings?',
    subtitle: 'Hot pizza & shawarma delivered to your door',
    ctaText: 'Order Now',
    route: '/(root)/(tabs)/explore',
    image: { uri: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=400&auto=format&fit=crop' },
    gradient: ['#31111D', '#1A0B10'] as [string, string],
    ctaBg: '#10B981',
  },
];

const AdCarousel = () => {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);

  const onViewRef = useRef(({ viewableItems }: { viewableItems: any[] }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  });

  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });

  return (
    <View style={styles.container}>
      <FlatList
        data={advertData}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        snapToInterval={CARD_WIDTH + 10}
        decelerationRate="fast"
        onViewableItemsChanged={onViewRef.current}
        viewabilityConfig={viewConfigRef.current}
        renderItem={({ item }) => (
          <View style={[styles.card, { width: CARD_WIDTH }]}>
            <LinearGradient
              colors={item.gradient}
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
                  style={[styles.ctaBtn, { backgroundColor: item.ctaBg }]}
                >
                  <Text style={styles.ctaText}>{item.ctaText}</Text>
                </TouchableOpacity>
              </View>

              {/* Right Hero Image */}
              <Image
                source={item.image}
                style={styles.heroImage}
                resizeMode="cover"
              />
            </LinearGradient>
          </View>
        )}
      />

      {/* Pagination Dots */}
      <View style={styles.paginationDots}>
        {advertData.map((_, idx) => (
          <View
            key={idx}
            style={[
              styles.dot,
              idx === currentIndex ? styles.dotActive : styles.dotInactive,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

export default AdCarousel;

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  card: {
    height: 110,
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
    padding: 12,
    position: 'relative',
  },
  textColumn: {
    flex: 1,
    zIndex: 10,
    justifyContent: 'center',
    paddingRight: 10,
  },
  title: {
    fontSize: 16,
    fontFamily: 'JakartaBold',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 10.5,
    fontFamily: 'JakartaMedium',
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
    marginBottom: 8,
    lineHeight: 14,
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
    width: 86,
    height: 86,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
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
