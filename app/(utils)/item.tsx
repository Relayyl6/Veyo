import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, Feather, FontAwesome } from '@expo/vector-icons';
import { useCartStore } from '@/store/store';

const SIZE_OPTIONS = [
  { id: 'small', label: '8" - Small', price: 12.0 },
  { id: 'regular', label: '10" - Regular', price: 14.0 },
  { id: 'large', label: '12" - Large', price: 16.0 },
];

export default function ItemDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  const title = (params.title as string) || 'ItaliaCrisp Pizza';
  const rawPrice = parseFloat(params.price as string) || 14.0;
  const imageUrl =
    (params.imageUrl as string) ||
    'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=90';

  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<'small' | 'regular' | 'large'>('small');
  const [selectedProtein, setSelectedProtein] = useState('none');
  const [selectedToppings, setSelectedToppings] = useState<Record<string, boolean>>({});
  const [instructions, setInstructions] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);

  const toggleTopping = (id: string) => {
    setSelectedToppings((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getBasePrice = () => {
    const sizeObj = SIZE_OPTIONS.find((s) => s.id === selectedSize);
    return sizeObj ? sizeObj.price : rawPrice;
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

  const handleAddToCart = () => {
    Alert.alert(
      'Added to Cart',
      `${quantity}x ${title} ($${calculateTotal()}) added to your cart!`,
      [
        {
          text: 'View Cart',
          onPress: () => router.push('/(root)/(tabs)/explore'),
        },
        {
          text: 'Continue Browsing',
          onPress: () => router.back(),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* 1. Hero Image & Top Bar */}
      <View style={styles.heroFrame}>
        <Image source={{ uri: imageUrl }} style={styles.heroImage} resizeMode="cover" />

        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color="#0B1528" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.favBtn}
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

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 2. Title & Pricing */}
        <View style={styles.discountRow}>
          <View style={styles.discountPill}>
            <Text style={styles.discountPillText}>20% OFF</Text>
          </View>
          <View style={styles.ratingRow}>
            <FontAwesome name="star" size={12} color="#D97706" />
            <Text style={styles.ratingText}>4.8 (120 reviews)</Text>
          </View>
        </View>

        <View style={styles.titleRow}>
          <Text style={styles.titleText}>{title}</Text>
          <Text style={styles.priceText}>${getBasePrice().toFixed(2)}</Text>
        </View>

        <Text style={styles.descText}>
          Classic pizza with tomato sauce, mozzarella, and fresh basil. Baked in a traditional
          stone oven for that authentic crispiness and authentic Italian flavor profile.
        </Text>

        {/* 3. Restaurant Strip */}
        <View style={styles.restaurantCard}>
          <View style={styles.restaurantTop}>
            <View style={styles.restaurantIcon}>
              <Ionicons name="restaurant" size={16} color="#EA580C" />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.restaurantName}>Brooklyn Bites</Text>
                <View style={styles.freeDelPill}>
                  <Text style={styles.freeDelText}>Free Delivery</Text>
                </View>
              </View>
              <Text style={styles.restaurantAddress}>789 Park Avenue, New York, NY</Text>
            </View>
          </View>

          <View style={styles.restaurantDivider} />

          <View style={styles.restaurantMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color="#6B7280" />
              <Text style={styles.metaText}>10 min prep</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="pizza-outline" size={14} color="#6B7280" />
              <Text style={styles.metaText}>Artisan Italian</Text>
            </View>
          </View>
        </View>

        {/* 4. Select Size */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Select Size :</Text>
          <Text style={styles.sectionSub}>
            {selectedSize === 'small' && 'Small (8 inch)'}
            {selectedSize === 'regular' && 'Regular (10 inch)'}
            {selectedSize === 'large' && 'Large (12 inch)'}
          </Text>
        </View>

        <View style={styles.sizesRow}>
          {SIZE_OPTIONS.map((size) => {
            const isSelected = selectedSize === size.id;
            return (
              <TouchableOpacity
                key={size.id}
                style={[styles.sizeBox, isSelected && styles.sizeBoxActive]}
                onPress={() => setSelectedSize(size.id as any)}
                activeOpacity={0.8}
              >
                <Text style={[styles.sizeLabel, isSelected && styles.sizeLabelActive]}>
                  {size.label}
                </Text>
                <Text style={[styles.sizePrice, isSelected && styles.sizePriceActive]}>
                  ${size.price.toFixed(2)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 5. Protein Selection */}
        <View style={[styles.sectionHeaderRow, { marginTop: 18 }]}>
          <Text style={styles.sectionTitle}>Choose your protein</Text>
        </View>

        <View style={styles.optionsList}>
          {[
            { id: 'none', label: 'None (Classic)', extra: '' },
            { id: 'chicken', label: 'Grilled Chicken', extra: '+$3.00' },
            { id: 'pepperoni', label: 'Pepperoni', extra: '+$2.50' },
          ].map((prot) => {
            const active = selectedProtein === prot.id;
            return (
              <TouchableOpacity
                key={prot.id}
                style={[styles.optionRow, active && styles.optionRowActive]}
                onPress={() => setSelectedProtein(prot.id)}
                activeOpacity={0.8}
              >
                <View style={styles.radioOuter}>
                  {active && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.optionLabel}>{prot.label}</Text>
                {prot.extra ? <Text style={styles.optionExtra}>{prot.extra}</Text> : null}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 6. Extra Toppings */}
        <View style={[styles.sectionHeaderRow, { marginTop: 18 }]}>
          <Text style={styles.sectionTitle}>Extra Toppings</Text>
          <Text style={styles.optionalText}>Optional</Text>
        </View>

        <View style={styles.optionsList}>
          {[
            { id: 'mozzarella', label: 'Extra Mozzarella', price: '+$1.50' },
            { id: 'mushrooms', label: 'Fresh Mushrooms', price: '+$1.00' },
            { id: 'truffle', label: 'Truffle Oil Drizzle', price: '+$2.00' },
          ].map((top) => {
            const isChecked = selectedToppings[top.id];
            return (
              <TouchableOpacity
                key={top.id}
                style={[styles.optionRow, isChecked && styles.optionRowActive]}
                onPress={() => toggleTopping(top.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.checkbox, isChecked && styles.checkboxActive]}>
                  {isChecked && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                </View>
                <Text style={styles.optionLabel}>{top.label}</Text>
                <Text style={styles.optionExtra}>{top.price}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 7. Special Instructions */}
        <View style={[styles.sectionHeaderRow, { marginTop: 18 }]}>
          <Text style={styles.sectionTitle}>Special Instructions</Text>
        </View>

        <View style={styles.instructionsBox}>
          <Feather name="edit-3" size={14} color="#9CA3AF" style={{ marginTop: 2 }} />
          <TextInput
            style={styles.instructionsInput}
            placeholder="Any requests? e.g., well-done crust, sauce on side"
            placeholderTextColor="#9CA3AF"
            value={instructions}
            onChangeText={setInstructions}
            multiline
          />
        </View>
      </ScrollView>

      {/* 8. Bottom Sticky Footer */}
      <View style={styles.footer}>
        <View style={styles.stepper}>
          <TouchableOpacity
            style={styles.stepBtn}
            onPress={() => setQuantity(Math.max(1, quantity - 1))}
          >
            <Feather name="minus" size={16} color="#0B1528" />
          </TouchableOpacity>
          <Text style={styles.stepNum}>{quantity}</Text>
          <TouchableOpacity
            style={styles.stepBtn}
            onPress={() => setQuantity(quantity + 1)}
          >
            <Feather name="plus" size={16} color="#0B1528" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.addCartBtn}
          onPress={handleAddToCart}
          activeOpacity={0.88}
        >
          <Text style={styles.addCartText}>ADD ITEM ${calculateTotal()}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  heroFrame: {
    height: 240,
    position: 'relative',
    backgroundColor: '#F3F4F6',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  backBtn: {
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
  favBtn: {
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
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  discountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontFamily: 'JakartaBold',
    fontSize: 12,
    color: '#374151',
    marginLeft: 4,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleText: {
    fontFamily: 'JakartaBold',
    fontSize: 22,
    color: '#0B1528',
    flex: 1,
  },
  priceText: {
    fontFamily: 'JakartaBold',
    fontSize: 20,
    color: '#0286FF',
    marginLeft: 12,
  },
  descText: {
    fontFamily: 'JakartaMedium',
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 19,
    marginBottom: 16,
  },
  restaurantCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  restaurantTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  restaurantIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
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
  restaurantMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontFamily: 'JakartaMedium',
    fontSize: 12,
    color: '#4B5563',
    marginLeft: 4,
  },
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
  sectionSub: {
    fontFamily: 'JakartaMedium',
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 6,
  },
  optionalText: {
    fontFamily: 'JakartaMedium',
    fontSize: 11,
    color: '#9CA3AF',
    marginLeft: 8,
  },
  sizesRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  sizeBox: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sizeBoxActive: {
    backgroundColor: '#FF6B00',
    borderColor: '#FF6B00',
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  sizeLabel: {
    fontFamily: 'JakartaSemiBold',
    fontSize: 12,
    color: '#4B5563',
  },
  sizeLabelActive: {
    color: '#FFFFFF',
    fontFamily: 'JakartaBold',
  },
  sizePrice: {
    fontFamily: 'JakartaBold',
    fontSize: 14,
    color: '#1F2937',
    marginTop: 4,
  },
  sizePriceActive: {
    color: '#FFFFFF',
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
  instructionsBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    minHeight: 70,
  },
  instructionsInput: {
    flex: 1,
    marginLeft: 8,
    fontFamily: 'JakartaMedium',
    fontSize: 13,
    color: '#1F2937',
  },
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
  stepNum: {
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
  addCartText: {
    fontFamily: 'JakartaBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
});
