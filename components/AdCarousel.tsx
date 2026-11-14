import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, Dimensions, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { RADIUS, SPACING } from '@/constants/designTokens';
import { dbContent, AdvertRecord } from '@/lib/db';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - (SPACING.screen * 2);

const AdCarousel = () => {
  const router = useRouter();
  const [adverts, setAdverts] = useState<AdvertRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    let isMounted = true;
    async function loadAdvertsFromDb() {
      try {
        setLoading(true);
        const data = await dbContent.getAdverts();
        if (isMounted) {
          setAdverts(data);
        }
      } catch (err) {
        console.error('Failed to load adverts from database:', err);
      } finally {
        if (isMounted) setLoading(false);
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

  if (loading && adverts.length === 0) {
    return (
      <View style={[styles.card, { width: CARD_WIDTH, marginVertical: 4, alignItems: 'center', justifyContent: 'center', backgroundColor: '#1E293B' }]}>
        <ActivityIndicator size="small" color="#0286FF" />
      </View>
    );
  }

  if (adverts.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={adverts}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        snapToInterval={CARD_WIDTH + 10}
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
