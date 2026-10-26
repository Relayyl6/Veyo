import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
} from 'react-native';
import { Ionicons, FontAwesome, Feather, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export interface FoodDetailItem {
  id: string | number;
  title: string;
  price: number;
  rating?: string;
  reviewsCount?: number;
  description: string;
  imageUrl: string;
  tags?: string[];
  restaurantName?: string;
  restaurantAddress?: string;
  cookingTime?: string;
  cuisine?: string;
}

interface FoodDetailModalProps {
  visible: boolean;
  item?: FoodDetailItem | null;
  onClose: () => void;
  onAddToCart?: (item: FoodDetailItem, quantity: number, options: any) => void;
  onTrackOrder?: () => void;
}

const DEFAULT_ITEM: FoodDetailItem = {
  id: 'pizza-margherita',
  title: 'ItaliaCrisp Pizza',
  price: 14.0,
  rating: '4.8',
  reviewsCount: 120,
  description:
    'Classic pizza with tomato sauce, mozzarella, and fresh basil. Baked in a traditional stone oven for that authentic crispiness and authentic Italian flavor profile.',
  imageUrl:
    'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=90',
  tags: ['Vegetarian', 'Popular'],
  restaurantName: 'Brooklyn Bites',
  restaurantAddress: '789 Park Avenue, New York, NY',
  cookingTime: '10 min',
  cuisine: 'Italian',
};

const SIZE_OPTIONS = [
  { id: 'small', label: '8" - Small', price: 12.0 },
  { id: 'regular', label: '10" - Regular', price: 14.0 },
  { id: 'large', label: '12" - Large', price: 16.0 },
];

const FEATURED_ITEMS = [
  {
    id: 'f-1',
    name: 'Classic Margherita',
    category: 'Pizza • Vegetarian',
    price: '$14.00',
    color: '#FDE68A',
  },
  {
    id: 'f-2',
    name: 'Garlic Knots',
    category: 'Sides • Savory',
    price: '$6.50',
    color: '#BAE6FD',
  },
  {
    id: 'f-3',
    name: 'Caesar Salad',
    category: 'Salads • Fresh',
    price: '$8.50',
    color: '#FED7AA',
  },
  {
    id: 'f-4',
    name: 'Tiramisu',
    category: 'Dessert • Sweet',
    price: '$7.00',
    color: '#FEF08A',
  },
];

export default function FoodDetailModal({
  visible,
  item = DEFAULT_ITEM,
  onClose,
  onAddToCart,
  onTrackOrder,
}: FoodDetailModalProps) {
  const currentItem = item || DEFAULT_ITEM;
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedSize, setSelectedSize] = useState<'small' | 'regular' | 'large'>('small');
  const [selectedProtein, setSelectedProtein] = useState('none');
  const [selectedToppings, setSelectedToppings] = useState<Record<string, boolean>>({});
  const [specialInstructions, setSpecialInstructions] = useState('');

  const toggleTopping = (id: string) => {
    setSelectedToppings((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getBasePrice = () => {
    const sizeObj = SIZE_OPTIONS.find((s) => s.id === selectedSize);
    return sizeObj ? sizeObj.price : currentItem.price;
  };

  const calculateTotal = () => {
    let base = getBasePrice();
    if (selectedProtein === 'chicken') base += 3.0;
    if (selectedProtein === 'pepperoni') base += 2.5;
    if (selectedToppings['mozzarella']) base += 1.5;
    if (selectedToppings['mushrooms']) base += 1.0;
    if (selectedToppings['truffle']) base += 2.0;
    return (base * quantity).toFixed(2);
  };

  const handleAdd = () => {
    if (onAddToCart) {
      onAddToCart(currentItem, quantity, {
        size: selectedSize,
        protein: selectedProtein,
        toppings: selectedToppings,
        instructions: specialInstructions,
        finalPrice: calculateTotal(),
      });
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Top Hero Image */}
        <View style={styles.imageFrame}>
          <Image
            source={{ uri: currentItem.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />

          <TouchableOpacity
            style={styles.topBackBtn}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={20} color="#0B1528" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.topFavBtn}
            onPress={() => setIsFavorite(!isFavorite)}
            activeOpacity={0.8}
          >
            <FontAwesome
              name={isFavorite ? 'heart' : 'heart-o'}
              size={18}
              color={isFavorite ? '#EF4444' : '#0B1528'}
            />
          </TouchableOpacity>
        </View>

        {/* Scrollable Customization Content */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Discount Pill & Rating */}
          <View style={styles.discountRatingRow}>
            <View style={styles.discountPill}>
              <Text style={styles.discountPillText}>20% OFF</Text>
            </View>
            <View style={styles.ratingBox}>
              <FontAwesome name="star" size={12} color="#D97706" />
              <Text style={styles.ratingText}>
                {currentItem.rating || '4.8'} ({currentItem.reviewsCount || 120})
              </Text>
            </View>
          </View>

          {/* Title & Price Row */}
          <View style={styles.titlePriceRow}>
            <Text style={styles.title}>{currentItem.title}</Text>
            <Text style={styles.price}>${getBasePrice().toFixed(2)}</Text>
          </View>

          {/* Description */}
          <Text style={styles.description}>{currentItem.description}</Text>

          {/* Restaurant Banner Strip (Brooklyn Bites) */}
          <View style={styles.restaurantCard}>
            <View style={styles.restaurantTopRow}>
              <View style={styles.restaurantIconCircle}>
                <Ionicons name="restaurant" size={18} color="#EA580C" />
              </View>
              <View style={styles.restaurantTextCol}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.restaurantName}>
                    {currentItem.restaurantName || 'Brooklyn Bites'}
                  </Text>
                  <View style={styles.freeDelPill}>
                    <Text style={styles.freeDelText}>Free Delivery</Text>
                  </View>
                </View>
                <Text style={styles.restaurantAddress}>
                  {currentItem.restaurantAddress || '789 Park Avenue, New York, NY'}
                </Text>
              </View>
            </View>

            <View style={styles.restaurantDivider} />

            <View style={styles.restaurantMetaRow}>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={14} color="#6B7280" />
                <View style={{ marginLeft: 6 }}>
                  <Text style={styles.metaSub}>Cooking time</Text>
                  <Text style={styles.metaBold}>{currentItem.cookingTime || '10 min'}</Text>
                </View>
              </View>

              <View style={styles.metaItem}>
                <Ionicons name="fast-food-outline" size={14} color="#6B7280" />
                <View style={{ marginLeft: 6 }}>
                  <Text style={styles.metaSub}>Cuisine</Text>
                  <Text style={styles.metaBold}>{currentItem.cuisine || 'Italian'}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Badges Strip */}
          <View style={styles.tagsRow}>
            <View style={styles.vegBadge}>
              <Ionicons name="leaf-outline" size={12} color="#059669" style={{ marginRight: 4 }} />
              <Text style={styles.vegBadgeText}>Vegetarian</Text>
            </View>

            <View style={styles.popularBadge}>
              <Ionicons name="flame" size={12} color="#EA580C" style={{ marginRight: 4 }} />
              <Text style={styles.popularBadgeText}>Popular</Text>
            </View>
          </View>

          {/* Select Size Row (Small, Regular, Large) */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Select Size :</Text>
            <Text style={styles.sizeSelectionLabel}>
              {selectedSize === 'small' && 'Small (8 inch)'}
              {selectedSize === 'regular' && 'Regular (10 inch)'}
              {selectedSize === 'large' && 'Large (12 inch)'}
            </Text>
          </View>

          <View style={styles.sizeCardRow}>
            {SIZE_OPTIONS.map((size) => {
              const isSelected = selectedSize === size.id;
              return (
                <TouchableOpacity
                  key={size.id}
                  style={[styles.sizeCard, isSelected && styles.sizeCardSelected]}
                  onPress={() => setSelectedSize(size.id as any)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.sizeCardLabel, isSelected && styles.sizeCardLabelSelected]}>
                    {size.label}
                  </Text>
                  <Text style={[styles.sizeCardPrice, isSelected && styles.sizeCardPriceSelected]}>
                    ${size.price.toFixed(2)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Track My Active Order CTA Button */}
          {onTrackOrder && (
            <TouchableOpacity
              style={styles.trackOrderBtn}
              onPress={onTrackOrder}
              activeOpacity={0.88}
            >
              <Ionicons name="car-sport" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.trackOrderBtnText}>Track My Active Order</Text>
            </TouchableOpacity>
          )}

          {/* Choose Your Protein */}
          <View style={[styles.sectionHeaderRow, { marginTop: 18 }]}>
            <Text style={styles.sectionTitle}>Choose your protein</Text>
            <View style={styles.requiredPill}>
              <Text style={styles.requiredPillText}>Required</Text>
            </View>
          </View>

          <View style={styles.optionsList}>
            <TouchableOpacity
              style={[styles.optionRow, selectedProtein === 'none' && styles.optionRowActive]}
              onPress={() => setSelectedProtein('none')}
              activeOpacity={0.8}
            >
              <View style={styles.radioOuter}>
                {selectedProtein === 'none' && <View style={styles.radioInner} />}
              </View>
              <Text style={styles.optionLabel}>None (Classic)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionRow, selectedProtein === 'chicken' && styles.optionRowActive]}
              onPress={() => setSelectedProtein('chicken')}
              activeOpacity={0.8}
            >
              <View style={styles.radioOuter}>
                {selectedProtein === 'chicken' && <View style={styles.radioInner} />}
              </View>
              <Text style={styles.optionLabel}>Grilled Chicken</Text>
              <Text style={styles.optionExtra}>+$3.00</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionRow, selectedProtein === 'pepperoni' && styles.optionRowActive]}
              onPress={() => setSelectedProtein('pepperoni')}
              activeOpacity={0.8}
            >
              <View style={styles.radioOuter}>
                {selectedProtein === 'pepperoni' && <View style={styles.radioInner} />}
              </View>
              <Text style={styles.optionLabel}>Pepperoni</Text>
              <Text style={styles.optionExtra}>+$2.50</Text>
            </TouchableOpacity>
          </View>

          {/* Extra Toppings */}
          <View style={[styles.sectionHeaderRow, { marginTop: 18 }]}>
            <Text style={styles.sectionTitle}>Extra Toppings</Text>
            <Text style={styles.optionalLabel}>Optional</Text>
          </View>

          <View style={styles.optionsList}>
            {[
              { id: 'mozzarella', name: 'Extra Mozzarella', price: '+$1.50' },
              { id: 'mushrooms', name: 'Mushrooms', price: '+$1.00' },
              { id: 'truffle', name: 'Truffle Oil Drizzle', price: '+$2.00' },
            ].map((topping) => {
              const isChecked = selectedToppings[topping.id];
              return (
                <TouchableOpacity
                  key={topping.id}
                  style={[styles.optionRow, isChecked && styles.optionRowActive]}
                  onPress={() => toggleTopping(topping.id)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.checkbox, isChecked && styles.checkboxActive]}>
                    {isChecked && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                  </View>
                  <Text style={styles.optionLabel}>{topping.name}</Text>
                  <Text style={styles.optionExtra}>{topping.price}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Special Instructions */}
          <View style={[styles.sectionHeaderRow, { marginTop: 18 }]}>
            <Text style={styles.sectionTitle}>Special Instructions</Text>
          </View>

          <View style={styles.noteBox}>
            <Feather name="edit-3" size={14} color="#9CA3AF" style={{ marginTop: 2 }} />
            <TextInput
              style={styles.noteInput}
              placeholder="Any special requests? e.g., make it extra crispy"
              placeholderTextColor="#9CA3AF"
              value={specialInstructions}
              onChangeText={setSpecialInstructions}
              multiline
            />
          </View>

          {/* Featured Items Grid */}
          <View style={[styles.sectionHeaderRow, { marginTop: 24 }]}>
            <Text style={styles.sectionTitle}>Featured Items</Text>
          </View>

          <View style={styles.featuredGrid}>
            {FEATURED_ITEMS.map((item) => (
              <View key={item.id} style={styles.featuredCard}>
                <View style={[styles.featuredPlaceholder, { backgroundColor: item.color }]} />
                <View style={styles.featuredContent}>
                  <Text style={styles.featuredName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.featuredCategory} numberOfLines={1}>
                    {item.category}
                  </Text>
                  <View style={styles.featuredBottomRow}>
                    <Text style={styles.featuredPrice}>{item.price}</Text>
                    <TouchableOpacity style={styles.featuredAddBtn} activeOpacity={0.7}>
                      <Ionicons name="add" size={16} color="#3122D2" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Bottom Sticky Action Footer */}
        <View style={styles.footer}>
          {/* Quantity Stepper */}
          <View style={styles.stepper}>
            <TouchableOpacity
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
              style={styles.stepBtn}
            >
              <Feather name="minus" size={15} color="#0B1528" />
            </TouchableOpacity>
            <Text style={styles.stepCount}>{quantity}</Text>
            <TouchableOpacity
              onPress={() => setQuantity(quantity + 1)}
              style={styles.stepBtn}
            >
              <Feather name="plus" size={15} color="#0B1528" />
            </TouchableOpacity>
          </View>

          {/* Add to Cart CTA */}
          <TouchableOpacity
            style={styles.addCartBtn}
            activeOpacity={0.88}
            onPress={handleAdd}
          >
            <Text style={styles.addCartBtnText}>
              ADD ITEM ${calculateTotal()}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  imageFrame: {
    height: 230,
    width: '100%',
    backgroundColor: '#F3F4F6',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  topBackBtn: {
    position: 'absolute',
    top: 14,
    left: 14,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  topFavBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  discountRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  discountPill: {
    backgroundColor: '#ECFDF5',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  discountPillText: {
    fontFamily: 'JakartaBold',
    fontSize: 11,
    color: '#059669',
  },
  titlePriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontFamily: 'JakartaBold',
    fontSize: 22,
    color: '#0B1528',
    flex: 1,
  },
  price: {
    fontFamily: 'JakartaBold',
    fontSize: 20,
    color: '#0286FF',
    marginLeft: 12,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontFamily: 'JakartaBold',
    fontSize: 12,
    color: '#374151',
    marginLeft: 4,
  },
  description: {
    fontFamily: 'JakartaMedium',
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 19,
    marginBottom: 16,
  },

  // Restaurant card
  restaurantCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  restaurantTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  restaurantIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  restaurantTextCol: {
    flex: 1,
  },
  restaurantName: {
    fontFamily: 'JakartaBold',
    fontSize: 14,
    color: '#0B1528',
  },
  freeDelPill: {
    backgroundColor: '#EEF2FF',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  freeDelText: {
    fontFamily: 'JakartaBold',
    fontSize: 9,
    color: '#3122D2',
  },
  restaurantAddress: {
    fontFamily: 'JakartaMedium',
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  restaurantDivider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 10,
  },
  restaurantMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaSub: {
    fontFamily: 'JakartaMedium',
    fontSize: 10,
    color: '#9CA3AF',
  },
  metaBold: {
    fontFamily: 'JakartaBold',
    fontSize: 12,
    color: '#1F2937',
  },

  // Badges
  tagsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  vegBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  vegBadgeText: {
    fontFamily: 'JakartaBold',
    fontSize: 11,
    color: '#059669',
  },
  popularBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  popularBadgeText: {
    fontFamily: 'JakartaBold',
    fontSize: 11,
    color: '#EA580C',
  },

  // Size row
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: 'JakartaBold',
    fontSize: 15,
    color: '#0B1528',
  },
  sizeSelectionLabel: {
    fontFamily: 'JakartaMedium',
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 6,
  },
  sizeCardRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  sizeCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sizeCardSelected: {
    backgroundColor: '#FF6B00',
    borderColor: '#FF6B00',
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  sizeCardLabel: {
    fontFamily: 'JakartaSemiBold',
    fontSize: 12,
    color: '#4B5563',
  },
  sizeCardLabelSelected: {
    color: '#FFFFFF',
    fontFamily: 'JakartaBold',
  },
  sizeCardPrice: {
    fontFamily: 'JakartaBold',
    fontSize: 14,
    color: '#1F2937',
    marginTop: 4,
  },
  sizeCardPriceSelected: {
    color: '#FFFFFF',
  },

  // Track My Active Order CTA
  trackOrderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3122D2',
    borderRadius: 14,
    paddingVertical: 14,
    marginBottom: 16,
    shadowColor: '#3122D2',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  trackOrderBtnText: {
    fontFamily: 'JakartaBold',
    fontSize: 14,
    color: '#FFFFFF',
  },

  // Proteins
  requiredPill: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  requiredPillText: {
    fontFamily: 'JakartaBold',
    fontSize: 10,
    color: '#6B7280',
  },
  optionsList: {
    gap: 8,
    marginBottom: 12,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  optionRowActive: {
    borderColor: '#3122D2',
    backgroundColor: '#EEF2FF',
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#9CA3AF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3122D2',
  },
  optionLabel: {
    flex: 1,
    fontFamily: 'JakartaMedium',
    fontSize: 13,
    color: '#1F2937',
  },
  optionExtra: {
    fontFamily: 'JakartaBold',
    fontSize: 12,
    color: '#6B7280',
  },
  optionalLabel: {
    fontFamily: 'JakartaMedium',
    fontSize: 11,
    color: '#9CA3AF',
    marginLeft: 8,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#9CA3AF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkboxActive: {
    backgroundColor: '#3122D2',
    borderColor: '#3122D2',
  },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    minHeight: 70,
  },
  noteInput: {
    flex: 1,
    marginLeft: 8,
    fontFamily: 'JakartaMedium',
    fontSize: 13,
    color: '#1F2937',
  },

  // Featured grid
  featuredGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featuredCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  featuredPlaceholder: {
    width: '100%',
    height: 90,
  },
  featuredContent: {
    padding: 10,
  },
  featuredName: {
    fontFamily: 'JakartaBold',
    fontSize: 13,
    color: '#0B1528',
  },
  featuredCategory: {
    fontFamily: 'JakartaMedium',
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 2,
  },
  featuredBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  featuredPrice: {
    fontFamily: 'JakartaBold',
    fontSize: 12,
    color: '#0286FF',
  },
  featuredAddBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Sticky bottom footer
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    gap: 12,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  stepBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCount: {
    fontFamily: 'JakartaBold',
    fontSize: 14,
    color: '#0B1528',
    paddingHorizontal: 10,
  },
  addCartBtn: {
    flex: 1,
    backgroundColor: '#FF6B00',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCartBtnText: {
    fontFamily: 'JakartaBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
});
