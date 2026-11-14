import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  Dimensions,
  StyleSheet,
  LayoutAnimation,
  FlatList,
  Platform,
  UIManager,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { RADIUS, SPACING } from '@/constants/designTokens';
import { dbContent, AiPredictionRecord } from '@/lib/db';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const AIPredictionList = () => {
  const router = useRouter();
  const [predictions, setPredictions] = useState<AiPredictionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadPredictions() {
      try {
        setLoading(true);
        const data = await dbContent.getAiPredictions();
        if (isMounted) {
          setPredictions(data);
        }
      } catch (err) {
        console.error('Failed to load AI predictions from database:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadPredictions();
    return () => {
      isMounted = false;
    };
  }, []);

  const renderCard = ({ item }: { item: AiPredictionRecord }) => (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={() => router.push(item.route as any)}
      style={styles.aiCard}
    >
      {/* Background Image */}
      <Image 
        source={{ uri: item.image_url }} 
        style={styles.cardImage}
        resizeMode="cover"
      />
      {/* Gradient Dark Overlay */}
      <View style={styles.cardOverlay}>
        {/* Tag */}
        <View style={styles.tagBadge}>
          <Text style={styles.tagText}>{item.tag}</Text>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.cardTextCol}>
            <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.cardSubtitle} numberOfLines={1}>{item.subtitle}</Text>
          </View>

          {/* Action Button */}
          <View style={styles.cartBtn}>
            <Ionicons name="cart" size={13} color="#FFFFFF" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading && predictions.length === 0) {
    return (
      <View style={[styles.aiCard, { width: 206, height: 114, alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="small" color="#0286FF" />
      </View>
    );
  }

  if (predictions.length === 0) {
    return null;
  }

  return (
    <View style={styles.listWrapper}>
      <FlatList 
        data={predictions}
        renderItem={renderCard}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 2 }}
        snapToInterval={216}
        decelerationRate="fast"
      />
    </View>
  );
};

export const WeatherCard = () => {
  return (
    <View style={styles.weatherCard}>
      <View style={styles.weatherLeft}>
        <View style={styles.weatherIconCircle}>
          <Ionicons name="partly-sunny-outline" size={16} color="#0286FF" />
        </View>
        <View>
          <Text style={styles.weatherTitle}>Cloudy 29°C</Text>
          <Text style={styles.weatherSubtitle}>Perfect weather for travel</Text>
        </View>
      </View>

      <Ionicons name="chevron-forward" size={14} color="#9CA3AF" />
    </View>
  );
};

export const TrafficDigestCard = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={toggle}
      style={styles.trafficBanner}
    >
      <View style={styles.trafficHeaderRow}>
        <View style={styles.trafficIconBox}>
          <FontAwesome5 name="traffic-light" size={14} color="#DC2626" />
        </View>

        <View style={styles.trafficHeaderTextCol}>
          <Text style={styles.trafficTitle}>Traffic Alert: Third Mainland Bridge</Text>
          <Text style={styles.trafficSub}>Congestion reported • Heavy delay expected</Text>
        </View>

        <Ionicons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={14}
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

// ==========================================
// MAIN SCREEN WRAPPER
// ==========================================
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
    gap: 8,
  },
  listWrapper: {
    marginBottom: 2,
  },
  aiCard: {
    width: 206,
    height: 114,
    borderRadius: RADIUS.cardCompact,
    overflow: 'hidden',
    marginRight: 10,
    position: 'relative',
    backgroundColor: '#1E293B',
  },
  cardImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  cardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '56%',
    backgroundColor: 'rgba(11, 21, 40, 0.72)',
    justifyContent: 'flex-end',
    padding: 8,
  },
  tagBadge: {
    backgroundColor: '#EA580C',
    alignSelf: 'flex-start',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
    marginBottom: 4,
  },
  tagText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontFamily: 'JakartaBold',
    letterSpacing: 0.5,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTextCol: {
    flex: 1,
    marginRight: 6,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'JakartaBold',
    lineHeight: 14,
  },
  cardSubtitle: {
    color: '#CBD5E1',
    fontSize: 9,
    fontFamily: 'JakartaMedium',
    marginTop: 1,
  },
  cartBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weatherCard: {
    backgroundColor: '#F0F7FF',
    borderRadius: RADIUS.cardCompact,
    paddingVertical: 8,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E0F2FE',
  },
  weatherLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  weatherIconCircle: {
    backgroundColor: '#DBEAFE',
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weatherTitle: {
    fontSize: 11,
    fontFamily: 'JakartaBold',
    color: '#0B1528',
  },
  weatherSubtitle: {
    fontSize: 9.5,
    fontFamily: 'JakartaMedium',
    color: '#64748B',
  },
  trafficBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.cardCompact,
    padding: 10,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  trafficHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  trafficIconBox: {
    backgroundColor: '#FEF2F2',
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  trafficHeaderTextCol: {
    flex: 1,
    marginRight: 6,
  },
  trafficTitle: {
    fontSize: 11.5,
    fontFamily: 'JakartaBold',
    color: '#991B1B',
  },
  trafficSub: {
    fontSize: 9.5,
    fontFamily: 'JakartaMedium',
    color: '#6B7280',
    marginTop: 1,
  },
  trafficExpandedBody: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#FEE2E2',
  },
  trafficDesc: {
    fontSize: 10.5,
    fontFamily: 'JakartaMedium',
    color: '#4B5563',
    lineHeight: 15,
    marginBottom: 8,
  },
  rerouteBtn: {
    backgroundColor: '#0286FF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  rerouteBtnText: {
    color: '#FFFFFF',
    fontFamily: 'JakartaBold',
    fontSize: 11,
  },
});
