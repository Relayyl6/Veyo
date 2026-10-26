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
import { Ionicons, FontAwesome, Feather } from '@expo/vector-icons';
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
}

interface FoodDetailModalProps {
  visible: boolean;
  item?: FoodDetailItem | null;
  onClose: () => void;
  onAddToCart?: (item: FoodDetailItem, quantity: number, options: any) => void;
}

const DEFAULT_ITEM: FoodDetailItem = {
  id: 'pizza-margherita',
  title: 'Margherita Pizza',
  price: 14.99,
  rating: '4.8',
  reviewsCount: 120,
  description:
    'Classic pizza with tomato sauce, mozzarella, and fresh basil. Baked in a traditional stone oven for that authentic crispiness and authentic Italian flavor profile.',
  imageUrl:
    'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=90',
  tags: ['Vegetarian', 'Popular'],
};

export default function FoodDetailModal({
  visible,
  item = DEFAULT_ITEM,
  onClose,
  onAddToCart,
}: FoodDetailModalProps) {
  const currentItem = item || DEFAULT_ITEM;
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedProtein, setSelectedProtein] = useState('none');
  const [selectedToppings, setSelectedToppings] = useState<Record<string, boolean>>({});
  const [specialInstructions, setSpecialInstructions] = useState('');

  const toggleTopping = (id: string) => {
    setSelectedToppings((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const calculateTotal = () => {
    let base = currentItem.price;
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
        protein: selectedProtein,
        toppings: selectedToppings,
        instructions: specialInstructions,
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
          {/* Title & Price Row */}
          <View style={styles.titlePriceRow}>
            <Text style={styles.title}>{currentItem.title}</Text>
            <Text style={styles.price}>${currentItem.price.toFixed(2)}</Text>
          </View>

          {/* Rating & Tags Row */}
          <View style={styles.tagsRow}>
            <View style={styles.ratingBox}>
              <FontAwesome name="star" size={12} color="#D97706" />
              <Text style={styles.ratingText}>
                {currentItem.rating} ({currentItem.reviewsCount || 120} reviews)
              </Text>
            </View>

            <View style={styles.vegBadge}>
              <Text style={styles.vegBadgeText}>Vegetarian</Text>
            </View>

            <View style={styles.popularBadge}>
              <Text style={styles.popularBadgeText}>Popular</Text>
            </View>
          </View>

          {/* Description */}
          <Text style={styles.description}>{currentItem.description}</Text>

          {/* Section 1: Choose Your Protein */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Choose your protein</Text>
            <View style={styles.requiredPill}>
              <Text style={styles.requiredPillText}>Required</Text>
            </View>
          </View>

          <View style={styles.optionsList}>
            {/* Option A: None (Classic) */}
            <TouchableOpacity
              style={[
                styles.optionRow,
                selectedProtein === 'none' && styles.optionRowActive,
              ]}
              onPress={() => setSelectedProtein('none')}
              activeOpacity={0.8}
            >
              <View style={styles.radioOuter}>
                {selectedProtein === 'none' && <View style={styles.radioInner} />}
              </View>
              <Text style={styles.optionLabel}>None (Classic)</Text>
            </TouchableOpacity>

            {/* Option B: Grilled Chicken */}
            <TouchableOpacity
              style={[
                styles.optionRow,
                selectedProtein === 'chicken' && styles.optionRowActive,
              ]}
              onPress={() => setSelectedProtein('chicken')}
              activeOpacity={0.8}
            >
              <View style={styles.radioOuter}>
                {selectedProtein === 'chicken' && <View style={styles.radioInner} />}
              </View>
              <Text style={styles.optionLabel}>Grilled Chicken</Text>
              <Text style={styles.optionExtra}>+$3.00</Text>
            </TouchableOpacity>

            {/* Option C: Pepperoni */}
            <TouchableOpacity
              style={[
                styles.optionRow,
                selectedProtein === 'pepperoni' && styles.optionRowActive,
              ]}
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

          {/* Section 2: Extra Toppings */}
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

          {/* Section 3: Special Instructions */}
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
              ADD TO CART ${calculateTotal()} →
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
    height: 240,
    width: '100%',
    position: 'relative',
    backgroundColor: '#F3F4F6',
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
    shadowOpacity: 0.15,
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
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 18,
  },
  titlePriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontFamily: 'JakartaBold',
    fontSize: 20,
    color: '#0B1528',
    flex: 1,
  },
  price: {
    fontFamily: 'JakartaBold',
    fontSize: 20,
    color: '#3122D2',
    marginLeft: 8,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontFamily: 'JakartaBold',
    fontSize: 11,
    color: '#0B1528',
  },
  vegBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  vegBadgeText: {
    fontFamily: 'JakartaBold',
    fontSize: 10,
    color: '#059669',
  },
  popularBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  popularBadgeText: {
    fontFamily: 'JakartaBold',
    fontSize: 10,
    color: '#2563EB',
  },
  description: {
    fontFamily: 'JakartaMedium',
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 18,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: 'JakartaBold',
    fontSize: 14,
    color: '#0B1528',
  },
  requiredPill: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  requiredPillText: {
    fontFamily: 'JakartaBold',
    fontSize: 10,
    color: '#3122D2',
  },
  optionalLabel: {
    fontFamily: 'JakartaMedium',
    fontSize: 11,
    color: '#858585',
  },
  optionsList: {
    gap: 8,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#EEEEEE',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  optionRowActive: {
    borderColor: '#3122D2',
    backgroundColor: '#FAF9FF',
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#3122D2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3122D2',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkboxActive: {
    backgroundColor: '#3122D2',
    borderColor: '#3122D2',
  },
  optionLabel: {
    fontFamily: 'JakartaMedium',
    fontSize: 13,
    color: '#0B1528',
    flex: 1,
  },
  optionExtra: {
    fontFamily: 'JakartaBold',
    fontSize: 12,
    color: '#6B7280',
  },
  noteBox: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    gap: 8,
  },
  noteInput: {
    fontFamily: 'JakartaMedium',
    fontSize: 12,
    color: '#0B1528',
    flex: 1,
    minHeight: 50,
    padding: 0,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 12,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 12,
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
    minWidth: 16,
    textAlign: 'center',
  },
  addCartBtn: {
    flex: 1,
    backgroundColor: '#F97316', // Orange CTA matching screenshot
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCartBtnText: {
    fontFamily: 'JakartaBold',
    fontSize: 13,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});
