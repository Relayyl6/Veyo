import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  Animated,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { Ionicons, FontAwesome5, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { images } from '@/constants/utils';
import { PressableHybrid } from './CustomPressable';
import { RADIUS, SPACING } from '@/constants/designTokens';
import { dbContent, ServiceOptionRecord } from '@/lib/db';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_PADDING = SPACING.screen * 2; // 32px (16 on each side)
const GAP = 10;
const TOTAL = SCREEN_WIDTH - GRID_PADDING - GAP;

// Width ratios: 32% square, 68% rectangle (accounting for gap)
const SQ_W = TOTAL * 0.32;
const REC_W = TOTAL * 0.68;

interface GridItem {
  id: string;
  type: 'square' | 'rectangle';
  title: string;
  subtitle?: string | null;
  iconName?: string | null;
  iconType?: 'ion' | 'fa5' | 'feather' | null;
  iconColor?: string | null;
  iconBg?: string | null;
  bgColor?: string;
  localImage?: any;
  route: string;
  imageOrder?: 'before' | 'after';
  imageClass?: object;
}

const DEFAULT_FUNCTIONAL_GRID: GridItem[] = [
  {
    id: 'srv-func-1',
    type: 'square',
    title: 'New Trip',
    iconName: 'location',
    iconType: 'ion',
    iconColor: '#EA4335',
    iconBg: '#FEE2E2',
    bgColor: '#FFFFFF',
    route: '/(utils)/book-ride',
  },
  {
    id: 'srv-func-2',
    type: 'rectangle',
    title: 'Swift Delivery',
    subtitle: 'Takes minutes\nto your door',
    iconName: 'motorcycle',
    iconType: 'fa5',
    iconColor: '#B45309',
    iconBg: '#FDE68A',
    bgColor: '#FEF3C7',
    route: '/(utils)/send-items',
    imageOrder: 'after',
  },
  {
    id: 'srv-func-3',
    type: 'rectangle',
    title: 'Send Packages',
    subtitle: 'Same-day on-demand\nlogistics',
    iconName: 'package',
    iconType: 'feather',
    iconColor: '#047857',
    iconBg: '#BBF7D0',
    bgColor: '#DCFCE7',
    route: '/(utils)/send-items',
    imageOrder: 'before',
  },
  {
    id: 'srv-func-4',
    type: 'square',
    title: 'Work / Office',
    iconName: 'briefcase',
    iconType: 'ion',
    iconColor: '#0286FF',
    iconBg: '#EBF4FF',
    bgColor: '#FFFFFF',
    route: '/(utils)/book-ride',
  },
];

const DEFAULT_LEISURE_GRID: GridItem[] = [
  {
    id: 'srv-leis-1',
    type: 'rectangle',
    title: 'Roadtrips',
    subtitle: 'Rent SUVs\n& explore cities',
    iconName: 'car-sport',
    iconType: 'ion',
    iconColor: '#0286FF',
    iconBg: '#BAE6FD',
    bgColor: '#E0F2FE',
    route: '/(utils)/book-ride',
    imageOrder: 'after',
    localImage: images.signUpCar,
    imageClass: { position: 'absolute', bottom: -6, right: -8, width: 80, height: 58 },
  },
  {
    id: 'srv-leis-2',
    type: 'square',
    title: 'Dine In',
    iconName: 'restaurant',
    iconType: 'ion',
    iconColor: '#D97706',
    iconBg: '#FEF3C7',
    bgColor: '#FFFFFF',
    route: '/(root)/(tabs)/explore',
  },
  {
    id: 'srv-leis-3',
    type: 'square',
    title: 'Grocery',
    iconName: 'basket',
    iconType: 'ion',
    iconColor: '#047857',
    iconBg: '#D1FAE5',
    bgColor: '#FFFFFF',
    route: '/(root)/(tabs)/explore',
  },
  {
    id: 'srv-leis-4',
    type: 'rectangle',
    title: 'Nightlife',
    subtitle: 'Discover events\naround you',
    iconName: 'beer',
    iconType: 'ion',
    iconColor: '#7C3AED',
    iconBg: '#E9D5FF',
    bgColor: '#F3E8FF',
    route: '/(root)/(tabs)/explore',
    imageOrder: 'before',
    localImage: images.drinks,
    imageClass: { position: 'absolute', bottom: -6, left: -4, width: 72, height: 72 },
  },
];

const DEFAULT_STATES = [
  { id: 'functional', grid: DEFAULT_FUNCTIONAL_GRID },
  { id: 'leisure', grid: DEFAULT_LEISURE_GRID },
];

const MORPH_INTERVAL_MS = 10000;

interface AnimatedCardProps {
  item: GridItem;
  targetWidth: number;
  morphDelay: number;
}

const AnimatedCard = ({ item, targetWidth, morphDelay }: AnimatedCardProps) => {
  const router = useRouter();
  const animWidth = useRef(new Animated.Value(targetWidth)).current;

  useEffect(() => {
    Animated.spring(animWidth, {
      toValue: targetWidth,
      delay: morphDelay,
      useNativeDriver: false,
      tension: 50,
      friction: 8,
    }).start();
  }, [targetWidth, morphDelay]);

  const isSquare = item.type === 'square';

  return (
    <Animated.View
      style={[
        styles.cardOuter,
        {
          width: animWidth,
          borderRadius: RADIUS.cardCompact,
        },
      ]}
    >
      <PressableHybrid
        style={[
          styles.cardInner,
          { backgroundColor: item.bgColor || '#FFFFFF' },
        ]}
        onPress={() => router.push(item.route as any)}
      >
        {isSquare ? (
          /* Square Layout */
          <View style={styles.squareContent}>
            <View
              style={[
                styles.squareIconBox,
                { backgroundColor: item.iconBg || '#F3F4F6' },
              ]}
            >
              {item.iconType === 'fa5' ? (
                <FontAwesome5 name={item.iconName as any} size={15} color={item.iconColor || '#333'} />
              ) : item.iconType === 'feather' ? (
                <Feather name={item.iconName as any} size={16} color={item.iconColor || '#333'} />
              ) : (
                <Ionicons name={(item.iconName as any) || 'ellipse'} size={18} color={item.iconColor || '#333'} />
              )}
            </View>
            <Text
              style={styles.squareTitle}
              numberOfLines={1}
            >
              {item.title}
            </Text>
          </View>
        ) : (
          /* Rectangle Layout */
          <View style={styles.rectContent}>
            {/* Leading element if imageOrder === 'before' */}
            {item.imageOrder === 'before' && (
              item.localImage ? (
                <Image
                  source={item.localImage}
                  style={item.imageClass as any}
                  resizeMode="contain"
                />
              ) : (
                <View
                  style={[
                    styles.rectIconBox,
                    { backgroundColor: item.iconBg || '#E0E7FF' },
                  ]}
                >
                  {item.iconType === 'fa5' ? (
                    <FontAwesome5 name={item.iconName as any} size={16} color={item.iconColor || '#0286FF'} />
                  ) : item.iconType === 'ion' ? (
                    <Ionicons name={item.iconName as any} size={18} color={item.iconColor || '#0286FF'} />
                  ) : (
                    <Feather name={(item.iconName as any) || 'package'} size={18} color={item.iconColor || '#0286FF'} />
                  )}
                </View>
              )
            )}

            {/* Middle text column */}
            <View
              style={[
                styles.rectTextCol,
                item.imageOrder === 'before'
                  ? { alignItems: 'flex-end', paddingLeft: 46 }
                  : { alignItems: 'flex-start', paddingRight: 46 },
              ]}
            >
              <Text
                style={[
                  styles.rectTitle,
                  item.imageOrder === 'before' ? { textAlign: 'right' } : { textAlign: 'left' },
                ]}
                numberOfLines={1}
              >
                {item.title}
              </Text>
              {item.subtitle ? (
                <Text
                  style={[
                    styles.rectSubtitle,
                    item.imageOrder === 'before' ? { textAlign: 'right' } : { textAlign: 'left' },
                  ]}
                  numberOfLines={2}
                >
                  {item.subtitle}
                </Text>
              ) : null}
            </View>

            {/* Trailing element if imageOrder === 'after' */}
            {item.imageOrder === 'after' && (
              item.localImage ? (
                <Image
                  source={item.localImage}
                  style={item.imageClass as any}
                  resizeMode="contain"
                />
              ) : (
                <View
                  style={[
                    styles.rectIconBox,
                    { backgroundColor: item.iconBg || '#FEF3C7' },
                  ]}
                >
                  {item.iconType === 'fa5' ? (
                    <FontAwesome5
                      name={(item.iconName as any) || 'motorcycle'}
                      size={17}
                      color={item.iconColor || '#B45309'}
                    />
                  ) : item.iconType === 'ion' ? (
                    <Ionicons
                      name={(item.iconName as any) || 'car-sport'}
                      size={18}
                      color={item.iconColor || '#0286FF'}
                    />
                  ) : (
                    <Feather
                      name={(item.iconName as any) || 'package'}
                      size={17}
                      color={item.iconColor || '#0286FF'}
                    />
                  )}
                </View>
              )
            )}
          </View>
        )}
      </PressableHybrid>
    </Animated.View>
  );
};

const ServiceGrid = () => {
  const [dbGrids, setDbGrids] = useState<{ id: string; grid: GridItem[] }[]>(DEFAULT_STATES);
  const [stateIndex, setStateIndex] = useState(0);

  useEffect(() => {
    let isMounted = true;
    async function fetchServicesFromDb() {
      try {
        const rows: ServiceOptionRecord[] = await dbContent.getServiceOptions();
        if (!isMounted || !rows || rows.length === 0) return;

        const functionalRows = rows.filter((r) => r.state_id === 'functional');
        const leisureRows = rows.filter((r) => r.state_id === 'leisure');

        const mapToGridItem = (r: ServiceOptionRecord): GridItem => {
          let localImg = undefined;
          let imgClass = undefined;
          if (r.id === 'srv-leis-1') {
            localImg = images.signUpCar;
            imgClass = { position: 'absolute', bottom: -6, right: -8, width: 80, height: 58 };
          } else if (r.id === 'srv-leis-4') {
            localImg = images.drinks;
            imgClass = { position: 'absolute', bottom: -6, left: -4, width: 72, height: 72 };
          }

          return {
            id: r.id,
            type: r.item_type,
            title: r.title,
            subtitle: r.subtitle,
            iconName: r.icon_name,
            iconType: r.icon_type,
            iconColor: r.icon_color,
            iconBg: r.icon_bg,
            bgColor: r.bg_color || '#FFFFFF',
            route: r.route,
            imageOrder: r.image_order || 'after',
            localImage: localImg,
            imageClass: imgClass,
          };
        };

        const states = [
          { id: 'functional', grid: functionalRows.map(mapToGridItem) },
          { id: 'leisure', grid: leisureRows.map(mapToGridItem) },
        ].filter((s) => s.grid.length >= 4);

        if (states.length > 0 && isMounted) {
          setDbGrids(states);
        }
      } catch (err) {
        console.error('Failed to load service options from DB:', err);
      }
    }

    fetchServicesFromDb();
    return () => {
      isMounted = false;
    };
  }, []);

  const startTransition = useCallback(() => {
    if (dbGrids.length > 1) {
      setStateIndex((prev) => (prev + 1) % dbGrids.length);
    }
  }, [dbGrids.length]);

  useEffect(() => {
    if (dbGrids.length <= 1) return;
    const interval = setInterval(startTransition, MORPH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [startTransition, dbGrids.length]);

  const currentGrid = dbGrids[stateIndex]?.grid || dbGrids[0]?.grid;
  if (!currentGrid || currentGrid.length < 4) return null;

  const targetWidths = currentGrid.map((item) =>
    item.type === 'square' ? SQ_W : REC_W
  );
  const morphDelays = [0, 60, 60, 0];

  return (
    <View style={styles.gridContainer}>
      {/* ROW 1 */}
      <View style={styles.row}>
        {[0, 1].map((i) => (
          <AnimatedCard
            key={currentGrid[i].id}
            item={currentGrid[i]}
            targetWidth={targetWidths[i]}
            morphDelay={morphDelays[i]}
          />
        ))}
      </View>

      {/* ROW 2 */}
      <View style={styles.row}>
        {[2, 3].map((i) => (
          <AnimatedCard
            key={currentGrid[i].id}
            item={currentGrid[i]}
            targetWidth={targetWidths[i]}
            morphDelay={morphDelays[i]}
          />
        ))}
      </View>
    </View>
  );
};

export default ServiceGrid;

const styles = StyleSheet.create({
  gridContainer: {
    marginVertical: 4,
    gap: GAP,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: GAP,
    height: 86,
  },
  cardOuter: {
    height: '100%',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  cardInner: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  squareContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  squareIconBox: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  squareTitle: {
    marginTop: 4,
    fontSize: 11,
    fontFamily: 'JakartaBold',
    color: '#111827',
    textAlign: 'center',
  },
  rectContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rectIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rectTextCol: {
    flex: 1,
    zIndex: 10,
    justifyContent: 'center',
  },
  rectTitle: {
    fontSize: 13,
    fontFamily: 'JakartaBold',
    color: '#0B1528',
    lineHeight: 16,
  },
  rectSubtitle: {
    fontSize: 10,
    fontFamily: 'JakartaMedium',
    color: '#4B5563',
    marginTop: 2,
    lineHeight: 13,
  },
});
