import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  FlatList,
  Platform,
  UIManager,
  LayoutAnimation,
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { dbContent, AiPredictionRecord } from '@/lib/db';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const DEFAULT_PREDICTIONS: AiPredictionRecord[] = [
  {
    id: 'pred-001',
    title: 'Shawarma order?',
    subtitle: 'Usually ordered at 8 PM',
    tag: 'AI PREDICTION',
    image_url: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?q=80&w=800&auto=format&fit=crop',
    route: '/(root)/(tabs)/explore',
    display_order: 1,
  },
  {
    id: 'pred-002',
    title: 'Late night pizza?',
    subtitle: 'Usually ordered at 11 PM',
    tag: 'AI PREDICTION',
    image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=800&auto=format&fit=crop',
    route: '/(root)/(tabs)/explore',
    display_order: 2,
  },
  {
    id: 'pred-003',
    title: 'Morning coffee run?',
    subtitle: 'Usually ordered at 7:30 AM',
    tag: 'AI PREDICTION',
    image_url: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=800&auto=format&fit=crop',
    route: '/(root)/(tabs)/explore',
    display_order: 3,
  },
];

export const AIPredictionList = () => {
  const router = useRouter();
  const [predictions, setPredictions] = useState<AiPredictionRecord[]>(DEFAULT_PREDICTIONS);

  useEffect(() => {
    let isMounted = true;
    dbContent.getAiPredictions().then((data) => {
      if (isMounted && data && data.length > 0) {
        setPredictions(data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const renderCard = ({ item }: { item: AiPredictionRecord }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => router.push(item.route as any)}
      style={styles.cardContainer}
    >
      {/* Background Image */}
      <Image
        source={{ uri: item.image_url }}
        style={styles.cardCoverImage}
        resizeMode="cover"
      />

      {/* Bottom Gradient / Dark Glass Overlay */}
      <View style={styles.cardOverlay}>
        <View style={styles.tagBadge}>
          <Text style={styles.tagText}>{item.tag || 'AI PREDICTION'}</Text>
        </View>

        <View style={styles.bottomRow}>
          <View style={styles.textColumn}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
          </View>

          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => router.push(item.route as any)}
            activeOpacity={0.8}
          >
            <FontAwesome5 name="shopping-cart" size={15} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.listWrapper}>
      <FlatList
        data={predictions}
        keyExtractor={(item) => item.id}
        renderItem={renderCard}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 4 }}
      />
    </View>
  );
};

export const WeatherCard = () => {
  return (
    <View style={styles.weatherCard}>
      <View style={styles.weatherLeft}>
        <View style={styles.weatherIconCircle}>
          <Ionicons name="partly-sunny" size={24} color="#0286FF" />
        </View>
        <View>
          <Text style={styles.weatherTitle}>Cloudy 29°C</Text>
          <Text style={styles.weatherSubtitle}>Perfect for a walk</Text>
        </View>
      </View>

      {/* Traffic Light Status Pill */}
      <View style={styles.trafficLightPill}>
        <FontAwesome5 name="traffic-light" size={18} color="#EF4444" />
      </View>
    </View>
  );
};

export const TrafficDigestCard = () => {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={toggleExpand}
      style={styles.trafficBanner}
    >
      <View style={styles.trafficHeaderRow}>
        <View style={styles.trafficIconBox}>
          <FontAwesome5 name="car-crash" size={15} color="#DC2626" />
        </View>
        <View style={styles.trafficHeaderTextCol}>
          <Text style={styles.trafficTitle}>Heavy Traffic on Third Mainland Bridge</Text>
          <Text style={styles.trafficSub}>Accident reported 12 mins ago</Text>
        </View>
        <Ionicons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={16}
          color="#6B7280"
        />
      </View>

      {isExpanded && (
        <View style={styles.trafficExpandedBody}>
          <Text style={styles.trafficDesc}>
            Average delay +18 mins towards Lagos Island. Alternative route via Ikorodu Rd saves 12 minutes.
          </Text>
          <TouchableOpacity
            style={styles.rerouteBtn}
            onPress={() => router.push('/(utils)/book-ride')}
          >
            <Text style={styles.rerouteBtnText}>Reroute & Book Ride</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default function VeyoInsightsScreen() {
  return (
    <View style={styles.container}>
      <AIPredictionList />
      <WeatherCard />
      <TrafficDigestCard />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    gap: 12,
  },
  listWrapper: {
    marginBottom: 4,
  },
  cardContainer: {
    width: 295,
    height: 200,
    borderRadius: 24,
    overflow: 'hidden',
    marginRight: 14,
    position: 'relative',
    backgroundColor: '#1E293B',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  cardCoverImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  cardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '62%',
    backgroundColor: 'rgba(10, 16, 28, 0.76)',
    justifyContent: 'flex-end',
    padding: 14,
  },
  tagBadge: {
    backgroundColor: '#EA580C',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  tagText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontFamily: 'JakartaBold',
    letterSpacing: 0.6,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textColumn: {
    flex: 1,
    marginRight: 10,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: 'JakartaBold',
    lineHeight: 24,
  },
  cardSubtitle: {
    color: '#CBD5E1',
    fontSize: 12.5,
    fontFamily: 'JakartaMedium',
    marginTop: 2,
  },
  cartButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weatherCard: {
    backgroundColor: '#F0F7FF',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E0F2FE',
  },
  weatherLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  weatherIconCircle: {
    backgroundColor: '#DBEAFE',
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weatherTitle: {
    fontSize: 15,
    fontFamily: 'JakartaBold',
    color: '#0B1528',
  },
  weatherSubtitle: {
    fontSize: 12,
    fontFamily: 'JakartaMedium',
    color: '#64748B',
    marginTop: 2,
  },
  trafficLightPill: {
    backgroundColor: '#FFFFFF',
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  trafficBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  trafficHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  trafficIconBox: {
    backgroundColor: '#FEF2F2',
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  trafficHeaderTextCol: {
    flex: 1,
    marginRight: 8,
  },
  trafficTitle: {
    fontSize: 13,
    fontFamily: 'JakartaBold',
    color: '#991B1B',
  },
  trafficSub: {
    fontSize: 11,
    fontFamily: 'JakartaMedium',
    color: '#6B7280',
    marginTop: 2,
  },
  trafficExpandedBody: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#FEE2E2',
  },
  trafficDesc: {
    fontSize: 12,
    fontFamily: 'JakartaMedium',
    color: '#4B5563',
    lineHeight: 17,
    marginBottom: 10,
  },
  rerouteBtn: {
    backgroundColor: '#0286FF',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  rerouteBtnText: {
    color: '#FFFFFF',
    fontFamily: 'JakartaBold',
    fontSize: 12,
  },
});
