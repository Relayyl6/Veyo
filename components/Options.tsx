import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  Animated,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, FontAwesome5, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { images } from '@/constants/utils';
import { PressableHybrid } from './CustomPressable';
import { RADIUS, SPACING } from '@/constants/designTokens';
import { dbContent, ServiceOptionRecord } from '@/lib/db';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_PADDING = SPACING.screen * 2; // 32px (16 on each side)
const GAP = 8;
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
  localImage?: any;
  bgClass: string;
  route: string;
  imageOrder?: 'before' | 'after';
  imageClass?: object;
}

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
        className={`flex-1 ${item.bgClass} justify-between p-2.5 overflow-hidden relative`}
        onPress={() => router.push(item.route as any)}
      >
        {isSquare ? (
          // Square Layout
          <View className="flex-1 items-center justify-center">
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
              className="mt-1 text-[11px] font-JakartaBold text-neutral-800 text-center leading-tight"
              numberOfLines={1}
            >
              {item.title}
            </Text>
          </View>
        ) : (
          // Rectangle Layout
          <View className="flex-1 flex-row items-center justify-between">
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

            <View
              className={`flex-1 z-10 justify-center ${
                item.imageOrder === 'before' ? 'items-end pl-14' : 'items-start pr-14'
              }`}
            >
              <Text
                className={`text-[13px] font-JakartaBold text-neutral-900 leading-tight ${
                  item.imageOrder === 'before' ? 'text-right' : 'text-left'
                }`}
                numberOfLines={1}
              >
                {item.title}
              </Text>
              {item.subtitle && (
                <Text
                  className={`text-[9.5px] font-JakartaMedium text-neutral-600 mt-0.5 leading-snug ${
                    item.imageOrder === 'before' ? 'text-right' : 'text-left'
                  }`}
                  numberOfLines={2}
                >
                  {item.subtitle}
                </Text>
              )}
            </View>

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
                  <FontAwesome5
                    name={(item.iconName as any) || 'motorcycle'}
                    size={18}
                    color={item.iconColor || '#B45309'}
                  />
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
  const [dbGrids, setDbGrids] = useState<{ id: string; grid: GridItem[] }[]>([]);
  const [loading, setLoading] = useState(true);
  const [stateIndex, setStateIndex] = useState(0);

  useEffect(() => {
    let isMounted = true;
    async function fetchServicesFromDb() {
      try {
        setLoading(true);
        const rows: ServiceOptionRecord[] = await dbContent.getServiceOptions();
        if (!isMounted || !rows || rows.length === 0) return;

        // Group rows by state_id ('functional' and 'leisure')
        const functionalRows = rows.filter((r) => r.state_id === 'functional');
        const leisureRows = rows.filter((r) => r.state_id === 'leisure');

        const mapToGridItem = (r: ServiceOptionRecord): GridItem => {
          let bgClass = 'bg-white';
          if (r.bg_color) {
            bgClass = `bg-[${r.bg_color}]`;
          }
          let localImg = undefined;
          let imgClass = undefined;
          if (r.id === 'srv-leis-1') {
            localImg = images.signUpCar;
            imgClass = { position: 'absolute', bottom: -6, right: -10, width: 82, height: 60 };
          } else if (r.id === 'srv-leis-4') {
            localImg = images.drinks;
            imgClass = { position: 'absolute', bottom: -8, left: -4, width: 75, height: 75 };
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
            bgClass,
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

        if (states.length > 0) {
          setDbGrids(states);
        }
      } catch (err) {
        console.error('Failed to load service options from DB:', err);
      } finally {
        if (isMounted) setLoading(false);
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

  if (loading && dbGrids.length === 0) {
    return (
      <View style={[styles.gridContainer, { height: 168, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="small" color="#0286FF" />
      </View>
    );
  }

  if (dbGrids.length === 0) {
    return null;
  }

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
    justifyContent: 'space-between',
    height: 80,
  },
  cardOuter: {
    height: '100%',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  squareIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rectIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
