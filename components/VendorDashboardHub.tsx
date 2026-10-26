import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Switch,
  Alert,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons, FontAwesome, Feather, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useVendorStore } from '@/store/store';
import { createNewMenuItem, updateMenuItem, deleteMenuItem } from '@/services/vendorService';

export interface VendorOrderItem {
  id: string;
  orderNumber: string;
  customerName: string;
  itemsSummary: string;
  total: number;
  timeAgo: string;
  status: 'new' | 'preparing' | 'ready' | 'dispatched';
}

const INITIAL_VENDOR_ORDERS: VendorOrderItem[] = [
  {
    id: 'vo-1',
    orderNumber: '#VK-90210',
    customerName: 'Jackub Kurner',
    itemsSummary: '1x Margherita Pizza (Regular), 1x Garlic Knots',
    total: 20.5,
    timeAgo: '4 mins ago',
    status: 'new',
  },
  {
    id: 'vo-2',
    orderNumber: '#VK-90211',
    customerName: 'Sarah Jenkins',
    itemsSummary: '2x Truffle Mushroom Pizza, 1x Caesar Salad',
    total: 44.5,
    timeAgo: '12 mins ago',
    status: 'preparing',
  },
  {
    id: 'vo-3',
    orderNumber: '#VK-90208',
    customerName: 'David Adeleke',
    itemsSummary: '1x Pepperoni Passion, 1x Tiramisu',
    total: 24.5,
    timeAgo: '22 mins ago',
    status: 'ready',
  },
];

export interface CatalogDish {
  id: string;
  name: string;
  category: string;
  price: number;
  prepTime: number;
  inStock: boolean;
  imageUrl: string;
  description?: string;
  isVegetarian?: boolean;
}

const INITIAL_CATALOG: CatalogDish[] = [
  {
    id: 'cat-1',
    name: 'Classic Margherita',
    category: 'Pizza',
    price: 14.0,
    prepTime: 15,
    inStock: true,
    imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&q=80',
    description: 'Stone oven baked authentic Italian dough with fresh mozzarella and basil.',
    isVegetarian: true,
  },
  {
    id: 'cat-2',
    name: 'Pepperoni Passion',
    category: 'Pizza',
    price: 16.5,
    prepTime: 18,
    inStock: true,
    imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&q=80',
    description: 'Double cured pepperoni slices with melted aged provolone.',
    isVegetarian: false,
  },
  {
    id: 'cat-3',
    name: 'Truffle Mushroom',
    category: 'Pizza',
    price: 18.0,
    prepTime: 20,
    inStock: true,
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80',
    description: 'Wild forest mushrooms, white truffle oil drizzle, fresh thyme.',
    isVegetarian: true,
  },
  {
    id: 'cat-4',
    name: 'Garlic Knots',
    category: 'Sides',
    price: 6.5,
    prepTime: 10,
    inStock: true,
    imageUrl: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=500&q=80',
    description: 'Warm oven garlic knots tossed in herb butter and parmesan.',
    isVegetarian: true,
  },
];

interface VendorDashboardHubProps {
  onSignOut?: () => void;
}

export default function VendorDashboardHub({ onSignOut }: VendorDashboardHubProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [orders, setOrders] = useState<VendorOrderItem[]>(INITIAL_VENDOR_ORDERS);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'new' | 'preparing' | 'ready'>('all');
  const [catalog, setCatalog] = useState<CatalogDish[]>(INITIAL_CATALOG);

  // Dish Modal state
  const [dishModalVisible, setDishModalVisible] = useState(false);
  const [editingDish, setEditingDish] = useState<CatalogDish | null>(null);
  const [dishName, setDishName] = useState('');
  const [dishCategory, setDishCategory] = useState('Pizza');
  const [dishPrice, setDishPrice] = useState('14.00');
  const [dishPrepTime, setDishPrepTime] = useState('15');
  const [dishDescription, setDishDescription] = useState('');
  const [dishImageUrl, setDishImageUrl] = useState('');
  const [dishIsVeg, setDishIsVeg] = useState(false);

  const filteredOrders = orders.filter((o) => {
    if (selectedFilter === 'all') return true;
    return o.status === selectedFilter;
  });

  const handleUpdateOrderStatus = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          if (o.status === 'new') return { ...o, status: 'preparing' };
          if (o.status === 'preparing') return { ...o, status: 'ready' };
          if (o.status === 'ready') return { ...o, status: 'dispatched' };
        }
        return o;
      })
    );
  };

  const handleToggleStock = (dishId: string) => {
    setCatalog((prev) =>
      prev.map((d) => (d.id === dishId ? { ...d, inStock: !d.inStock } : d))
    );
  };

  const handleDeleteDish = (dishId: string, dishName: string) => {
    Alert.alert(
      'Delete Dish',
      `Are you sure you want to remove "${dishName}" from your active menu?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setCatalog((prev) => prev.filter((d) => d.id !== dishId));
            try {
              await deleteMenuItem(dishId);
            } catch (e) {
              console.log('[VendorDashboard] delete error fallback', e);
            }
          },
        },
      ]
    );
  };

  const openAddDishModal = () => {
    setEditingDish(null);
    setDishName('');
    setDishCategory('Pizza');
    setDishPrice('14.00');
    setDishPrepTime('15');
    setDishDescription('');
    setDishImageUrl('https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&q=80');
    setDishIsVeg(false);
    setDishModalVisible(true);
  };

  const openEditDishModal = (dish: CatalogDish) => {
    setEditingDish(dish);
    setDishName(dish.name);
    setDishCategory(dish.category);
    setDishPrice(dish.price.toFixed(2));
    setDishPrepTime(dish.prepTime.toString());
    setDishDescription(dish.description || '');
    setDishImageUrl(dish.imageUrl);
    setDishIsVeg(!!dish.isVegetarian);
    setDishModalVisible(true);
  };

  const handleSaveDish = async () => {
    if (!dishName.trim()) {
      Alert.alert('Required Field', 'Please enter a dish name.');
      return;
    }

    const priceNum = parseFloat(dishPrice) || 12.0;
    const prepNum = parseInt(dishPrepTime, 10) || 15;

    if (editingDish) {
      // Edit existing
      setCatalog((prev) =>
        prev.map((d) =>
          d.id === editingDish.id
            ? {
                ...d,
                name: dishName,
                category: dishCategory,
                price: priceNum,
                prepTime: prepNum,
                description: dishDescription,
                imageUrl: dishImageUrl,
                isVegetarian: dishIsVeg,
              }
            : d
        )
      );
      try {
        await updateMenuItem(editingDish.id, {
          name: dishName,
          category: dishCategory,
          price: priceNum,
          preparationTimeMins: prepNum,
          description: dishDescription,
          imageUrl: dishImageUrl,
          isVegetarian: dishIsVeg,
        });
      } catch (e) {
        console.log('[VendorDashboard] update error fallback', e);
      }
      Alert.alert('Menu Updated', `"${dishName}" has been updated.`);
    } else {
      // Create new
      const newDish: CatalogDish = {
        id: `dish-${Date.now()}`,
        name: dishName,
        category: dishCategory,
        price: priceNum,
        prepTime: prepNum,
        inStock: true,
        imageUrl: dishImageUrl || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&q=80',
        description: dishDescription,
        isVegetarian: dishIsVeg,
      };
      setCatalog((prev) => [newDish, ...prev]);
      try {
        await createNewMenuItem({
          vendorId: 'v-paradise-1',
          name: dishName,
          category: dishCategory,
          price: priceNum,
          preparationTimeMins: prepNum,
          description: dishDescription,
          imageUrl: dishImageUrl,
          isVegetarian: dishIsVeg,
        });
      } catch (e) {
        console.log('[VendorDashboard] create error fallback', e);
      }
      Alert.alert('Dish Created', `"${dishName}" is now live on your menu!`);
    }

    setDishModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {/* 1. Store Header & Live Status Card */}
      <View style={styles.storeCard}>
        <Image
          source={{
            uri: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80',
          }}
          style={styles.storeBanner}
          resizeMode="cover"
        />

        <View style={styles.storeContentRow}>
          <View style={styles.storeLogoBox}>
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=200&q=80',
              }}
              style={styles.storeLogo}
            />
          </View>

          <View style={styles.storeMetaCol}>
            <View style={styles.storeNameRow}>
              <Text style={styles.storeName}>Pizza Paradise</Text>
              <Ionicons name="checkmark-circle" size={16} color="#0286FF" style={{ marginLeft: 4 }} />
            </View>
            <Text style={styles.storeCategory}>Italian • Artisan Pizzeria</Text>
            <Text style={styles.storeHours}>10:00 AM - 10:00 PM</Text>
          </View>
        </View>

        {/* Live Open / Closed Switch */}
        <View style={styles.statusToggleBar}>
          <View style={styles.statusLabelRow}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isOpen ? '#10B981' : '#EF4444' },
              ]}
            />
            <Text style={styles.statusStateText}>
              {isOpen ? 'Accepting Orders (Open)' : 'Store Paused (Closed)'}
            </Text>
          </View>

          <Switch
            value={isOpen}
            onValueChange={setIsOpen}
            trackColor={{ false: '#D1D5DB', true: '#0286FF' }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      {/* 2. Today's Merchant Metrics Quad */}
      <View style={styles.metricsQuad}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Today's Revenue</Text>
          <Text style={styles.metricBig}>$1,248.50</Text>
          <Text style={styles.metricSubGreen}>+14% vs yesterday</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Total Orders</Text>
          <Text style={styles.metricBig}>38</Text>
          <Text style={styles.metricSub}>avg. $32.85 / order</Text>
        </View>
      </View>

      <View style={styles.metricsQuad}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Avg Prep Time</Text>
          <Text style={styles.metricBig}>14 min</Text>
          <Text style={styles.metricSub}>target: &lt; 15 min</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Store Rating</Text>
          <View style={styles.ratingValRow}>
            <FontAwesome name="star" size={15} color="#F59E0B" />
            <Text style={styles.ratingValText}> 4.8</Text>
          </View>
          <Text style={styles.metricSub}>1,240 verified reviews</Text>
        </View>
      </View>

      {/* 3. Live Kitchen Order Fulfillment Queue */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Kitchen Order Queue</Text>
        <Text style={styles.queueCountBadge}>{orders.length} ACTIVE</Text>
      </View>

      {/* Segmented Queue Filter */}
      <View style={styles.filterBar}>
        {(['all', 'new', 'preparing', 'ready'] as const).map((tab) => {
          const isActive = selectedFilter === tab;
          const count = orders.filter((o) => tab === 'all' || o.status === tab).length;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.filterTab, isActive && styles.filterTabActive]}
              onPress={() => setSelectedFilter(tab)}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterTabText, isActive && styles.filterTabTextActive]}>
                {tab.toUpperCase()} ({count})
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="fast-food-outline" size={28} color="#9CA3AF" />
          <Text style={styles.emptyText}>No orders in this stage.</Text>
        </View>
      ) : (
        filteredOrders.map((order) => (
          <View key={order.id} style={styles.orderCard}>
            <View style={styles.orderTopRow}>
              <View>
                <Text style={styles.orderNumber}>{order.orderNumber}</Text>
                <Text style={styles.orderCustomer}>{order.customerName}</Text>
              </View>
              <View style={styles.orderTimeCol}>
                <Text style={styles.orderPrice}>${order.total.toFixed(2)}</Text>
                <Text style={styles.orderTimeAgo}>{order.timeAgo}</Text>
              </View>
            </View>

            <Text style={styles.orderSummary}>{order.itemsSummary}</Text>

            {/* Order Action Button */}
            <View style={styles.orderActionRow}>
              <View
                style={[
                  styles.statusBadge,
                  order.status === 'new' && { backgroundColor: '#FEF3C7' },
                  order.status === 'preparing' && { backgroundColor: '#DBEAFE' },
                  order.status === 'ready' && { backgroundColor: '#D1FAE5' },
                ]}
              >
                <Text
                  style={[
                    styles.statusBadgeText,
                    order.status === 'new' && { color: '#B45309' },
                    order.status === 'preparing' && { color: '#1D4ED8' },
                    order.status === 'ready' && { color: '#047857' },
                  ]}
                >
                  {order.status.toUpperCase()}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.orderNextBtn}
                onPress={() => handleUpdateOrderStatus(order.id)}
                activeOpacity={0.8}
              >
                <Text style={styles.orderNextBtnText}>
                  {order.status === 'new' && 'Start Kitchen Prep →'}
                  {order.status === 'preparing' && 'Mark Ready for Courier →'}
                  {order.status === 'ready' && 'Courier Picked Up ✓'}
                  {order.status === 'dispatched' && 'Completed'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}

      {/* 4. Menu Catalog Management (CRUD) */}
      <View style={[styles.sectionHeaderRow, { marginTop: 24 }]}>
        <View>
          <Text style={styles.sectionTitle}>Menu Catalog</Text>
          <Text style={styles.sectionSubtitle}>{catalog.length} items available</Text>
        </View>

        <TouchableOpacity
          style={styles.addDishBtn}
          onPress={openAddDishModal}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={16} color="#FFFFFF" />
          <Text style={styles.addDishBtnText}>Add Dish</Text>
        </TouchableOpacity>
      </View>

      {/* Catalog Items */}
      {catalog.map((dish) => (
        <View key={dish.id} style={styles.dishCard}>
          <Image
            source={{ uri: dish.imageUrl }}
            style={styles.dishThumbnail}
            resizeMode="cover"
          />

          <View style={styles.dishInfoCol}>
            <View style={styles.dishNameRow}>
              <Text style={styles.dishName}>{dish.name}</Text>
              {dish.isVegetarian && (
                <View style={styles.dishVegPill}>
                  <Text style={styles.dishVegText}>Veg</Text>
                </View>
              )}
            </View>

            <Text style={styles.dishCategory}>
              {dish.category} • {dish.prepTime} mins
            </Text>
            <Text style={styles.dishPrice}>${dish.price.toFixed(2)}</Text>
          </View>

          {/* Actions */}
          <View style={styles.dishActionsCol}>
            {/* In Stock Switch */}
            <View style={styles.stockSwitchRow}>
              <Text style={styles.stockLabel}>{dish.inStock ? 'In Stock' : 'Out'}</Text>
              <Switch
                value={dish.inStock}
                onValueChange={() => handleToggleStock(dish.id)}
                trackColor={{ false: '#D1D5DB', true: '#10B981' }}
                thumbColor="#FFFFFF"
                style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
              />
            </View>

            <View style={styles.dishBtnRow}>
              <TouchableOpacity
                style={styles.dishIconBtn}
                onPress={() => openEditDishModal(dish)}
                activeOpacity={0.7}
              >
                <Feather name="edit-2" size={15} color="#0286FF" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dishIconBtn}
                onPress={() => handleDeleteDish(dish.id, dish.name)}
                activeOpacity={0.7}
              >
                <Ionicons name="trash-outline" size={16} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ))}

      {/* 5. Merchant Payouts & Wells Fargo Bank Card */}
      <View style={styles.payoutCard}>
        <View style={styles.payoutTopRow}>
          <Text style={styles.payoutHeaderLabel}>SETTLEMENT BANK ACCOUNT</Text>
          <TouchableOpacity
            onPress={() => Alert.alert('Bank Account', 'Direct merchant deposits are verified with Wells Fargo (•••• 4455).')}
            activeOpacity={0.7}
          >
            <Feather name="edit-2" size={15} color="#3122D2" />
          </TouchableOpacity>
        </View>

        <View style={styles.payoutDetailRow}>
          <View style={styles.bankIconCircle}>
            <FontAwesome5 name="university" size={18} color="#3122D2" />
          </View>
          <View style={styles.bankTextCol}>
            <Text style={styles.bankName}>Wells Fargo Commercial</Text>
            <Text style={styles.bankAccount}>•••• 4455 • Auto-deposit Daily</Text>
          </View>
        </View>

        <View style={styles.payoutDivider} />

        <View style={styles.financialSummaryRow}>
          <View>
            <Text style={styles.financialLabel}>Gross Sales</Text>
            <Text style={styles.financialValue}>$1,248.50</Text>
          </View>
          <View>
            <Text style={styles.financialLabel}>Commission (15%)</Text>
            <Text style={[styles.financialValue, { color: '#EF4444' }]}>-$187.28</Text>
          </View>
          <View>
            <Text style={styles.financialLabel}>Net Payout</Text>
            <Text style={[styles.financialValue, { color: '#0CC25F' }]}>$1,061.22</Text>
          </View>
        </View>
      </View>

      {/* 6. Vendor Account Settings & Sign Out */}
      <View style={styles.actionsCard}>
        <TouchableOpacity
          style={styles.actionRow}
          onPress={() => Alert.alert('Store Profile', 'Update kitchen address, food hygiene permits, and delivery zones.')}
          activeOpacity={0.8}
        >
          <View style={[styles.actionIconCircle, { backgroundColor: '#F0FDF4' }]}>
            <Ionicons name="business-outline" size={18} color="#16A34A" />
          </View>
          <Text style={styles.actionLabel}>Store Settings & Permits</Text>
          <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
        </TouchableOpacity>

        <View style={styles.actionDivider} />

        <TouchableOpacity
          style={styles.actionRow}
          onPress={onSignOut}
          activeOpacity={0.8}
        >
          <View style={[styles.actionIconCircle, { backgroundColor: '#FEF2F2' }]}>
            <Ionicons name="log-out-outline" size={18} color="#EF4444" />
          </View>
          <Text style={[styles.actionLabel, { color: '#EF4444' }]}>Log Out</Text>
          <Ionicons name="chevron-forward" size={16} color="#EF4444" />
        </TouchableOpacity>
      </View>

      {/* Add / Edit Dish Modal */}
      <Modal
        visible={dishModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDishModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {editingDish ? 'Edit Menu Item' : 'Add New Menu Item'}
            </Text>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
              <Text style={styles.inputLabel}>Dish Name</Text>
              <TextInput
                style={styles.modalInput}
                value={dishName}
                onChangeText={setDishName}
                placeholder="e.g. Truffle Mushroom Pizza"
              />

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Category</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={dishCategory}
                    onChangeText={setDishCategory}
                    placeholder="Pizza, Burger, Sides"
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Price ($)</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={dishPrice}
                    onChangeText={setDishPrice}
                    keyboardType="numeric"
                    placeholder="14.00"
                  />
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Prep Time (Mins)</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={dishPrepTime}
                    onChangeText={setDishPrepTime}
                    keyboardType="numeric"
                    placeholder="15"
                  />
                </View>

                <View style={{ flex: 1, justifyContent: 'center' }}>
                  <Text style={styles.inputLabel}>Vegetarian?</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Switch
                      value={dishIsVeg}
                      onValueChange={setDishIsVeg}
                      trackColor={{ false: '#D1D5DB', true: '#10B981' }}
                    />
                    <Text style={{ marginLeft: 8, fontFamily: 'JakartaMedium', fontSize: 13, color: '#374151' }}>
                      {dishIsVeg ? 'Yes (Veg)' : 'No'}
                    </Text>
                  </View>
                </View>
              </View>

              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.modalInput, { height: 60, textAlignVertical: 'top' }]}
                value={dishDescription}
                onChangeText={setDishDescription}
                multiline
                placeholder="Delicious ingredients, sauce, cheese..."
              />

              <Text style={styles.inputLabel}>Image URL</Text>
              <TextInput
                style={styles.modalInput}
                value={dishImageUrl}
                onChangeText={setDishImageUrl}
                placeholder="https://..."
              />
            </ScrollView>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setDishModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={handleSaveDish}
              >
                <Text style={styles.modalSaveText}>
                  {editingDish ? 'Save Changes' : 'Publish Dish'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  // Store Card
  storeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  storeBanner: {
    width: '100%',
    height: 110,
  },
  storeContentRow: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  storeLogoBox: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
    marginTop: -30,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  storeLogo: {
    width: '100%',
    height: '100%',
  },
  storeMetaCol: {
    flex: 1,
    marginLeft: 12,
  },
  storeNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storeName: {
    fontFamily: 'JakartaBold',
    fontSize: 17,
    color: '#0B1528',
  },
  storeCategory: {
    fontFamily: 'JakartaMedium',
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  storeHours: {
    fontFamily: 'JakartaMedium',
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 1,
  },
  statusToggleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  statusLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusStateText: {
    fontFamily: 'JakartaSemiBold',
    fontSize: 13,
    color: '#1F2937',
  },

  // Metrics
  metricsQuad: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  metricLabel: {
    fontFamily: 'JakartaMedium',
    fontSize: 12,
    color: '#6B7280',
  },
  metricBig: {
    fontFamily: 'JakartaBold',
    fontSize: 20,
    color: '#0B1528',
    marginTop: 4,
  },
  metricSubGreen: {
    fontFamily: 'JakartaSemiBold',
    fontSize: 11,
    color: '#059669',
    marginTop: 2,
  },
  metricSub: {
    fontFamily: 'JakartaMedium',
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  ratingValRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingValText: {
    fontFamily: 'JakartaBold',
    fontSize: 18,
    color: '#0B1528',
  },

  // Kitchen Queue
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: 'JakartaBold',
    fontSize: 16,
    color: '#0B1528',
  },
  sectionSubtitle: {
    fontFamily: 'JakartaMedium',
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  queueCountBadge: {
    fontFamily: 'JakartaBold',
    fontSize: 11,
    color: '#0286FF',
    backgroundColor: '#EBF4FF',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  filterBar: {
    flexDirection: 'row',
    backgroundColor: '#EEEEEE',
    borderRadius: 12,
    padding: 3,
    marginBottom: 12,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  filterTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  filterTabText: {
    fontFamily: 'JakartaBold',
    fontSize: 10,
    color: '#6B7280',
  },
  filterTabTextActive: {
    color: '#0286FF',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  emptyText: {
    fontFamily: 'JakartaMedium',
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 8,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  orderTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  orderNumber: {
    fontFamily: 'JakartaBold',
    fontSize: 14,
    color: '#0B1528',
  },
  orderCustomer: {
    fontFamily: 'JakartaMedium',
    fontSize: 12,
    color: '#6B7280',
    marginTop: 1,
  },
  orderTimeCol: {
    alignItems: 'flex-end',
  },
  orderPrice: {
    fontFamily: 'JakartaBold',
    fontSize: 14,
    color: '#0286FF',
  },
  orderTimeAgo: {
    fontFamily: 'JakartaMedium',
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 1,
  },
  orderSummary: {
    fontFamily: 'JakartaMedium',
    fontSize: 13,
    color: '#374151',
    marginBottom: 12,
  },
  orderActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 10,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontFamily: 'JakartaBold',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  orderNextBtn: {
    backgroundColor: '#3122D2',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  orderNextBtnText: {
    fontFamily: 'JakartaBold',
    fontSize: 12,
    color: '#FFFFFF',
  },

  // Menu Catalog
  addDishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0286FF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  addDishBtnText: {
    fontFamily: 'JakartaBold',
    fontSize: 12,
    color: '#FFFFFF',
    marginLeft: 4,
  },
  dishCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dishThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  dishInfoCol: {
    flex: 1,
    marginLeft: 12,
  },
  dishNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dishName: {
    fontFamily: 'JakartaBold',
    fontSize: 14,
    color: '#0B1528',
  },
  dishVegPill: {
    backgroundColor: '#ECFDF5',
    paddingVertical: 1,
    paddingHorizontal: 5,
    borderRadius: 6,
    marginLeft: 6,
  },
  dishVegText: {
    fontFamily: 'JakartaBold',
    fontSize: 9,
    color: '#059669',
  },
  dishCategory: {
    fontFamily: 'JakartaMedium',
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  dishPrice: {
    fontFamily: 'JakartaBold',
    fontSize: 13,
    color: '#0286FF',
    marginTop: 2,
  },
  dishActionsCol: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 60,
  },
  stockSwitchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockLabel: {
    fontFamily: 'JakartaMedium',
    fontSize: 10,
    color: '#6B7280',
    marginRight: 2,
  },
  dishBtnRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dishIconBtn: {
    padding: 5,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },

  // Payout Card
  payoutCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginTop: 14,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#3122D2',
  },
  payoutTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  payoutHeaderLabel: {
    fontFamily: 'JakartaBold',
    fontSize: 11,
    color: '#6366F1',
    letterSpacing: 0.8,
  },
  payoutDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bankIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  bankTextCol: {
    flex: 1,
  },
  bankName: {
    fontFamily: 'JakartaBold',
    fontSize: 15,
    color: '#0B1528',
  },
  bankAccount: {
    fontFamily: 'JakartaMedium',
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  payoutDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 12,
  },
  financialSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  financialLabel: {
    fontFamily: 'JakartaMedium',
    fontSize: 11,
    color: '#6B7280',
  },
  financialValue: {
    fontFamily: 'JakartaBold',
    fontSize: 14,
    color: '#0B1528',
    marginTop: 2,
  },

  // Actions
  actionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  actionIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  actionLabel: {
    flex: 1,
    fontFamily: 'JakartaSemiBold',
    fontSize: 14,
    color: '#1F2937',
  },
  actionDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 12,
  },

  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    maxHeight: '85%',
  },
  modalTitle: {
    fontFamily: 'JakartaBold',
    fontSize: 18,
    color: '#0B1528',
    marginBottom: 14,
  },
  inputLabel: {
    fontFamily: 'JakartaBold',
    fontSize: 12,
    color: '#374151',
    marginBottom: 6,
  },
  modalInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 9,
    fontFamily: 'JakartaMedium',
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 12,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  modalCancelText: {
    fontFamily: 'JakartaSemiBold',
    fontSize: 14,
    color: '#4B5563',
  },
  modalSaveBtn: {
    flex: 1,
    backgroundColor: '#0286FF',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalSaveText: {
    fontFamily: 'JakartaBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
});
