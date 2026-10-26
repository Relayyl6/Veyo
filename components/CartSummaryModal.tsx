import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { Ionicons, Feather, FontAwesome5 } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export interface CartItemType {
  id: string;
  title: string;
  price: number;
  quantity: number;
  time: string;
  rating: string;
  imageUrl: string;
}

interface CartSummaryModalProps {
  visible: boolean;
  onClose: () => void;
  onOrderCompleted?: (orderId: string) => void;
}

const DEFAULT_CART_ITEMS: CartItemType[] = [
  {
    id: 'c1',
    title: 'Noodles Twistara',
    price: 5.33,
    quantity: 1,
    time: '15-20 min',
    rating: '4.9',
    imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&q=80',
  },
  {
    id: 'c2',
    title: 'Chickens Stick',
    price: 8.34,
    quantity: 1,
    time: '15-20 min',
    rating: '4.9',
    imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&q=80',
  },
];

export default function CartSummaryModal({
  visible,
  onClose,
  onOrderCompleted,
}: CartSummaryModalProps) {
  const [items, setItems] = useState<CartItemType[]>(DEFAULT_CART_ITEMS);
  const [step, setStep] = useState<'cart' | 'checkout'>('cart');
  const [selectedPayment, setSelectedPayment] = useState<'mastercard' | 'paypal' | 'applepay'>('mastercard');

  const updateQuantity = (id: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((it) => {
          if (it.id === id) {
            const nextQty = it.quantity + delta;
            return nextQty > 0 ? { ...it, quantity: nextQty } : null;
          }
          return it;
        })
        .filter(Boolean) as CartItemType[]
    );
  };

  const subtotal = items.reduce((acc, it) => acc + it.price * it.quantity, 0);
  const promoDiscount = 2.2;
  const deliveryFee = 6.0;
  const tax = 2.0;
  const total = Math.max(0, subtotal - promoDiscount + deliveryFee + tax).toFixed(2);

  const handlePay = () => {
    const generatedId = `VE-${Math.floor(10000 + Math.random() * 90000)}`;
    if (onOrderCompleted) onOrderCompleted(generatedId);
    setStep('cart');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView
        style={[styles.container, step === 'checkout' && styles.darkContainer]}
        edges={['top', 'bottom']}
      >
        {/* Header */}
        <View style={[styles.header, step === 'checkout' && styles.darkHeader]}>
          <TouchableOpacity
            onPress={() => (step === 'checkout' ? setStep('cart') : onClose())}
            style={styles.headerBtn}
          >
            <Ionicons
              name="arrow-back"
              size={20}
              color={step === 'checkout' ? '#FFFFFF' : '#0B1528'}
            />
          </TouchableOpacity>

          <Text style={[styles.headerTitle, step === 'checkout' && styles.darkTitle]}>
            {step === 'cart' ? 'My Cart List' : 'Checkout'}
          </Text>

          <TouchableOpacity style={styles.headerBtn}>
            <Feather
              name="more-vertical"
              size={18}
              color={step === 'checkout' ? '#FFFFFF' : '#0B1528'}
            />
          </TouchableOpacity>
        </View>

        {step === 'cart' ? (
          /* STEP 1: MY CART LIST */
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Cart Items */}
            <View style={styles.itemsList}>
              {items.map((it) => (
                <View key={it.id} style={styles.cartCard}>
                  <Image source={{ uri: it.imageUrl }} style={styles.itemImage} />
                  <View style={styles.itemMiddle}>
                    <Text style={styles.itemTitle}>{it.title}</Text>
                    <Text style={styles.itemTimeRating}>
                      ⏱ {it.time} • ★ {it.rating}
                    </Text>
                    <Text style={styles.itemPrice}>${it.price.toFixed(2)}</Text>
                  </View>

                  <View style={styles.stepperPill}>
                    <TouchableOpacity
                      onPress={() => updateQuantity(it.id, -1)}
                      style={styles.stepperBtn}
                    >
                      <Feather name="minus" size={12} color="#0B1528" />
                    </TouchableOpacity>
                    <Text style={styles.stepperCount}>
                      {String(it.quantity).padStart(2, '0')}
                    </Text>
                    <TouchableOpacity
                      onPress={() => updateQuantity(it.id, 1)}
                      style={styles.stepperBtn}
                    >
                      <Feather name="plus" size={12} color="#0B1528" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>

            {/* Delivery Address Card */}
            <Text style={styles.sectionLabel}>Delivery Address</Text>
            <View style={styles.addressCard}>
              <View style={styles.addressIconCircle}>
                <Ionicons name="location-outline" size={18} color="#3122D2" />
              </View>
              <Text style={styles.addressText} numberOfLines={2}>
                11/2 Diriyah, Road no A3, Riyadh (SA)
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
            </View>

            {/* Promo Code Strip */}
            <View style={styles.promoRow}>
              <View style={styles.promoCodeBox}>
                <Text style={styles.promoCodeText}>3H4-KU70</Text>
              </View>
              <View style={styles.promoStatusPill}>
                <Text style={styles.promoStatusText}>Promo-code Confirmed</Text>
              </View>
            </View>

            {/* Order Summary */}
            <Text style={[styles.sectionLabel, { marginTop: 16 }]}>Order Summary</Text>
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Order Amount</Text>
                <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Promo-code</Text>
                <Text style={[styles.summaryValue, { color: '#F97316' }]}>
                  -${promoDiscount.toFixed(2)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Delivery</Text>
                <Text style={styles.summaryValue}>${deliveryFee.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tax</Text>
                <Text style={styles.summaryValue}>${tax.toFixed(2)}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>Total Amount</Text>
                <Text style={styles.totalValue}>${total}</Text>
              </View>
            </View>
          </ScrollView>
        ) : (
          /* STEP 2: CHECKOUT (Dark Theme) */
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.darkSectionLabel}>DELIVERY ADDRESS</Text>
            <View style={styles.darkAddressCard}>
              <Ionicons name="location" size={18} color="#F97316" />
              <Text style={styles.darkAddressText}>
                11/2 Diriyah, Road no A3, Riyadh (SA)
              </Text>
            </View>

            <Text style={[styles.darkSectionLabel, { marginTop: 16 }]}>ORDER ITEMS</Text>
            <View style={styles.darkItemCard}>
              <Image
                source={{ uri: items[0]?.imageUrl || DEFAULT_CART_ITEMS[0].imageUrl }}
                style={styles.darkItemImg}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.darkItemTitle}>{items[0]?.title || 'Noodles Twistara'}</Text>
                <Text style={styles.darkItemMeta}>15-20 min • ★ 4.9</Text>
                <Text style={styles.darkItemPrice}>${items[0]?.price.toFixed(2)}</Text>
              </View>
              <Text style={styles.darkQtyText}>01</Text>
            </View>

            <Text style={[styles.darkSectionLabel, { marginTop: 18 }]}>PAYMENT METHOD</Text>
            <View style={styles.paymentMethodsCol}>
              {/* MasterCard */}
              <TouchableOpacity
                style={[
                  styles.paymentRow,
                  selectedPayment === 'mastercard' && styles.paymentRowActive,
                ]}
                onPress={() => setSelectedPayment('mastercard')}
                activeOpacity={0.8}
              >
                <FontAwesome5 name="cc-mastercard" size={20} color="#EB001B" />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.paymentName}>Master Card</Text>
                  <Text style={styles.paymentMeta}>•••• 9843</Text>
                </View>
                <View
                  style={[
                    styles.radioOuterDark,
                    selectedPayment === 'mastercard' && styles.radioActiveDark,
                  ]}
                >
                  {selectedPayment === 'mastercard' && <View style={styles.radioInnerDark} />}
                </View>
              </TouchableOpacity>

              {/* PayPal */}
              <TouchableOpacity
                style={[
                  styles.paymentRow,
                  selectedPayment === 'paypal' && styles.paymentRowActive,
                ]}
                onPress={() => setSelectedPayment('paypal')}
                activeOpacity={0.8}
              >
                <FontAwesome5 name="paypal" size={18} color="#0079C1" />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.paymentName}>PayPal</Text>
                  <Text style={styles.paymentMeta}>user@gmail.com</Text>
                </View>
                <View
                  style={[
                    styles.radioOuterDark,
                    selectedPayment === 'paypal' && styles.radioActiveDark,
                  ]}
                >
                  {selectedPayment === 'paypal' && <View style={styles.radioInnerDark} />}
                </View>
              </TouchableOpacity>

              {/* Apple Pay */}
              <TouchableOpacity
                style={[
                  styles.paymentRow,
                  selectedPayment === 'applepay' && styles.paymentRowActive,
                ]}
                onPress={() => setSelectedPayment('applepay')}
                activeOpacity={0.8}
              >
                <FontAwesome5 name="apple-pay" size={24} color="#FFFFFF" />
                <Text style={[styles.paymentName, { flex: 1, marginLeft: 10 }]}>Apple Pay</Text>
                <View
                  style={[
                    styles.radioOuterDark,
                    selectedPayment === 'applepay' && styles.radioActiveDark,
                  ]}
                >
                  {selectedPayment === 'applepay' && <View style={styles.radioInnerDark} />}
                </View>
              </TouchableOpacity>

              {/* Add Payment Method */}
              <TouchableOpacity style={styles.addPaymentBtn} activeOpacity={0.8}>
                <Feather name="plus" size={15} color="#94A3B8" />
                <Text style={styles.addPaymentText}>Add Payment Method</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}

        {/* Bottom CTA Button */}
        <View style={[styles.footer, step === 'checkout' && styles.darkFooter]}>
          {step === 'cart' ? (
            <TouchableOpacity
              style={styles.proceedBtn}
              activeOpacity={0.88}
              onPress={() => setStep('checkout')}
            >
              <Text style={styles.proceedBtnText}>Proceed to Payment</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.payNowBtn}
              activeOpacity={0.88}
              onPress={handlePay}
            >
              <Text style={styles.payNowBtnText}>Pay Now • ${total}</Text>
            </TouchableOpacity>
          )}
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
  darkContainer: {
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  darkHeader: {
    borderBottomColor: '#1E293B',
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: 'JakartaBold',
    fontSize: 16,
    color: '#0B1528',
  },
  darkTitle: {
    color: '#FFFFFF',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  itemsList: {
    gap: 12,
    marginBottom: 20,
  },
  cartCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    gap: 12,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  itemMiddle: {
    flex: 1,
  },
  itemTitle: {
    fontFamily: 'JakartaBold',
    fontSize: 13,
    color: '#0B1528',
    marginBottom: 2,
  },
  itemTimeRating: {
    fontFamily: 'JakartaMedium',
    fontSize: 10,
    color: '#858585',
    marginBottom: 4,
  },
  itemPrice: {
    fontFamily: 'JakartaBold',
    fontSize: 13,
    color: '#3122D2',
  },
  stepperPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 6,
    gap: 8,
  },
  stepperBtn: {
    padding: 2,
  },
  stepperCount: {
    fontFamily: 'JakartaBold',
    fontSize: 11,
    color: '#0B1528',
    minWidth: 16,
    textAlign: 'center',
  },
  sectionLabel: {
    fontFamily: 'JakartaBold',
    fontSize: 13,
    color: '#0B1528',
    marginBottom: 8,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    marginBottom: 12,
  },
  addressIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressText: {
    fontFamily: 'JakartaMedium',
    fontSize: 12,
    color: '#4B5563',
    flex: 1,
  },
  promoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  promoCodeBox: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  promoCodeText: {
    fontFamily: 'JakartaBold',
    fontSize: 12,
    color: '#0B1528',
  },
  promoStatusPill: {
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  promoStatusText: {
    fontFamily: 'JakartaBold',
    fontSize: 11,
    color: '#F97316',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontFamily: 'JakartaMedium',
    fontSize: 12,
    color: '#6B7280',
  },
  summaryValue: {
    fontFamily: 'JakartaBold',
    fontSize: 12,
    color: '#0B1528',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 4,
  },
  totalLabel: {
    fontFamily: 'JakartaBold',
    fontSize: 14,
    color: '#0B1528',
  },
  totalValue: {
    fontFamily: 'JakartaExtraBold',
    fontSize: 16,
    color: '#3122D2',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  darkFooter: {
    borderTopColor: '#1E293B',
  },
  proceedBtn: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  proceedBtnText: {
    fontFamily: 'JakartaBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  payNowBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payNowBtnText: {
    fontFamily: 'JakartaBold',
    fontSize: 14,
    color: '#0F172A',
  },
  darkSectionLabel: {
    fontFamily: 'JakartaBold',
    fontSize: 11,
    color: '#94A3B8',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  darkAddressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  darkAddressText: {
    fontFamily: 'JakartaMedium',
    fontSize: 12,
    color: '#F8FAFC',
    flex: 1,
  },
  darkItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 12,
  },
  darkItemImg: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  darkItemTitle: {
    fontFamily: 'JakartaBold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  darkItemMeta: {
    fontFamily: 'JakartaMedium',
    fontSize: 10,
    color: '#94A3B8',
  },
  darkItemPrice: {
    fontFamily: 'JakartaBold',
    fontSize: 12,
    color: '#38BDF8',
  },
  darkQtyText: {
    fontFamily: 'JakartaBold',
    fontSize: 12,
    color: '#FFFFFF',
    marginRight: 6,
  },
  paymentMethodsCol: {
    gap: 10,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  paymentRowActive: {
    borderColor: '#F97316',
  },
  paymentName: {
    fontFamily: 'JakartaBold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  paymentMeta: {
    fontFamily: 'JakartaMedium',
    fontSize: 10,
    color: '#94A3B8',
  },
  radioOuterDark: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#64748B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActiveDark: {
    borderColor: '#F97316',
  },
  radioInnerDark: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F97316',
  },
  addPaymentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  addPaymentText: {
    fontFamily: 'JakartaMedium',
    fontSize: 12,
    color: '#94A3B8',
  },
});
