'use client'

import { View, Text, TouchableOpacity, ScrollView, StyleSheet, KeyboardAvoidingView, ActivityIndicator, Image, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import PageHeader from '@/components/PageHeader';
import SearchBar from '@/components/SearchBar';
import { useState } from 'react';
import Drop, { SearchPill, TrendingItem } from '@/components/drop';
import CategoryCard from '@/components/CategoryCard';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { icons } from '@/constants/utils';
import { PressableHybrid } from '@/components/CustomPressable';

// Import your newly added MealCard component
import MealCard from '@/components/MealCard';

export default function SearchScreen() {
    const router = useRouter()
    const [ valuer, setValuer ] = useState("")
    const [searchQuery, setSearchQuery] = useState("");

    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [activeTab, setActiveTab] = useState('Map');

    // Cart state to tracking food counts seamlessly
    const [cartCounts, setCartCounts] = useState<{ [key: number]: number }>({});

    const executeSearch = () => {
        if (!searchQuery.trim()) return;
        
        setIsSearching(true);
        // Simulate a 1-second network/API call
        setTimeout(() => {
            setIsSearching(false);
            setHasSearched(true);
        }, 1000);
    };

    const clearSearch = () => {
        setSearchQuery("");
        setHasSearched(false);
        setActiveTab('Map'); // Fallback back to Map on view clear
    };

    const onChangeText = (value: any) => {
        setValuer(value)
    }

    const handleAddToCart = (mealId: number) => {
        setCartCounts((prevCounts) => ({
            ...prevCounts,
            [mealId]: (prevCounts[mealId] || 0) + 1 
        }));
    };

    const recentSearches = ['Sushi', 'Tesla Model 3', 'Downtown', 'illinois'];
    const trendingSearches = [
      'Rainy Day Comfort', 
      'Quick Lunch', 
      'Organic Groceries'
    ];

    // Dummy Mock Pools mapped over views
    const searchResults = [
        { id: 1, title: 'Quinoa Power Bowl', distance: '1.2km', location: 'Victoria Island', price: '$14.50', rating: '4.8', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=90' },
        { id: 2, title: 'Grilled Atlantic Salmon', distance: '0.8km', location: 'Lekki Phase 1', price: '$22.00', rating: '4.9', image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=90' },
    ];

    const mealsData = [
        { id: 1, title: "Chicken Masala", time: "30 mins", price: "14.00", rating: "4.5", imageUrl: "https://freepngimg.com/thumb/food/139209-food-plate-masala-chicken-free-transparent-image-hd.png" },
        { id: 2, title: "Cheese Burger", time: "8 mins", price: "9.00", rating: "4.3", imageUrl: "https://freepngimg.com/thumb/hamburger/8092-hamburger-burger.png" },
        { id: 3, title: "Margherita Pizza", time: "15 mins", price: "12.50", rating: "4.7", imageUrl: "https://freepngimg.com/thumb/pizza/35-pizza-png-image.png" },
        { id: 4, title: "Sushi Platter", time: "20 mins", price: "22.00", rating: "4.8", imageUrl: "https://freepngimg.com/thumb/sushi/23-sushi-png-image.png" },
        { id: 5, title: "Caesar Salad", time: "10 mins", price: "8.50", rating: "4.2", imageUrl: "https://freepngimg.com/thumb/salad/31751-5-salad-transparent.png" }
    ];

    const driversData = [
        { id: 1, name: "Emeka Okafor", vehicle: "Toyota Camry • Black", rating: "4.9", distance: "2 mins away", price: "$12.00", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80" },
        { id: 2, name: "Babajide Alao", vehicle: "Honda Accord • Silver", rating: "4.7", distance: "5 mins away", price: "$15.50", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80" },
        { id: 3, name: "Chinedu Okoye", vehicle: "Hyundai Elantra • Blue", rating: "4.8", distance: "4 mins away", price: "$11.00", image: "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=150&q=80" },
        { id: 4, name: "Blessing Udoh", vehicle: "Mazda 6 • White", rating: "4.9", distance: "7 mins away", price: "$18.00", image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&q=80" }
    ];

    // ==========================================
    // VIEW 1: THE RESULTS PAGE
    // ==========================================
    if (hasSearched) {
        return (
            <SafeAreaView className="flex-1 bg-white">
                <Stack.Screen options={{ headerShown: false }} />
                
                <PageHeader 
                    title={searchQuery} 
                    rightIconName="options-outline"
                    titleColor="text-[#3122D2]"
                    iconColor="#3122D2"
                    onBackPress={clearSearch}
                />

                {/* Tabs Panel */}
                <View className="flex-row border-b border-gray-100 mt-2 px-6">
                    {['Map', 'Food', 'Ride'].map((tab) => (
                        <TouchableOpacity 
                            key={tab}
                            onPress={() => setActiveTab(tab)}
                            className="flex-1 items-center pb-3 relative"
                        >
                            <Text className={`font-JakartaSemiBold text-[15px] ${activeTab === tab ? 'text-[#3122D2]' : 'text-gray-400'}`}>
                                {tab}
                            </Text>
                            {activeTab === tab && (
                                <View className="absolute bottom-0 w-12 h-1 bg-[#3122D2] rounded-t-md" />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                {/* ── CONDITIONAL SUB-VIEWS DEPENDING ON ACTIVE TAB ── */}
                
                {/* A. MAP SUB-VIEW */}
                {activeTab === 'Map' && (
                    <View className="flex-1 bg-[#E8F0F2] relative">
                        <View className="absolute inset-0 opacity-40 bg-gray-300" /> 
                        
                        <TouchableOpacity className="absolute top-6 self-center bg-white rounded-full px-5 py-2.5 flex-row items-center shadow-md shadow-neutral-300">
                            <Ionicons name="search" size={14} color="#3122D2" />
                            <Text className="text-[#3122D2] font-JakartaBold text-xs ml-2">Save this search</Text>
                            <Ionicons name="close" size={16} color="#9CA3AF" className="ml-4" />
                        </TouchableOpacity>

                        <View className="absolute bottom-6 w-full">
                            <ScrollView 
                                horizontal 
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={{ paddingHorizontal: 16 }}
                            >
                                {searchResults.map((item) => (
                                    <PressableHybrid 
                                        key={item.id}
                                        className="bg-white rounded-[20px] w-64 mr-4 shadow-sm shadow-neutral-300 overflow-hidden"
                                    >
                                        <View className="h-32 w-full relative">
                                            <Image source={{ uri: item.image }} className="w-full h-full" resizeMode="cover" />
                                            <View className="absolute top-3 left-3 bg-[#3122D2] px-2.5 py-1 rounded-md">
                                                <Text className="text-white font-JakartaBold text-xs">{item.price}</Text>
                                            </View>
                                            <View className="absolute bottom-3 right-3 bg-white w-7 h-7 rounded-full flex items-center justify-center shadow-sm">
                                                <FontAwesome name="heart" size={12} color="#EF4444" />
                                            </View>
                                        </View>

                                        <View className="p-3">
                                            <View className="flex-row justify-between items-center mb-1">
                                                <Text className="font-JakartaBold text-[15px] text-black" numberOfLines={1}>{item.title}</Text>
                                                <View className="flex-row items-center bg-orange-50 px-1.5 py-0.5 rounded-sm">
                                                    <FontAwesome name="star" size={10} color="#D97706" />
                                                    <Text className="font-JakartaBold text-[10px] text-black ml-1">{item.rating}</Text>
                                                </View>
                                            </View>
                                            <Text className="font-Jakarta text-xs text-gray-500">
                                                <Ionicons name="location-outline" size={10} /> {item.distance} • {item.location}
                                            </Text>
                                        </View>
                                    </PressableHybrid>
                                ))}
                            </ScrollView>
                        </View>
                    </View>
                )}

                {/* B. FOOD SUB-VIEW */}
                {activeTab === 'Food' && (
                    <ScrollView 
                        showsVerticalScrollIndicator={false} 
                        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 }}
                    >
                        <View className="flex-row flex-wrap justify-between">
                            {mealsData.map((meal) => (
                                <MealCard 
                                    key={meal.id}
                                    title={meal.title}
                                    time={meal.time}
                                    price={meal.price}
                                    rating={meal.rating}
                                    imageUrl={meal.imageUrl}
                                    quantity={cartCounts[meal.id] || 0}
                                    onAdd={() => handleAddToCart(meal.id)}
                                />
                            ))}
                        </View>
                    </ScrollView>
                )}

                {/* C. RIDE SUB-VIEW */}
                {activeTab === 'Ride' && (
                    <ScrollView 
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 }}
                    >
                        <View className="flex-row flex-wrap justify-between">
                            {driversData.map((driver) => (
                                <View 
                                    key={driver.id} 
                                    className="w-[48%] bg-white border border-gray-100 rounded-2xl p-3 mb-4 shadow-sm shadow-neutral-100 items-center"
                                >
                                    {/* Driver Avatar Frame */}
                                    <View className="relative w-16 h-16 mb-2">
                                        <Image 
                                            source={{ uri: driver.image }} 
                                            className="w-full h-full rounded-full bg-gray-100" 
                                        />
                                        <View className="absolute bottom-0 right-0 bg-emerald-500 w-3.5 h-3.5 rounded-full border-2 border-white" />
                                    </View>

                                    {/* Ratings Indicator */}
                                    <View className="flex-row items-center bg-gray-50 px-2 py-0.5 rounded-full mb-2">
                                        <FontAwesome name="star" size={10} color="#FBBF24" />
                                        <Text className="text-[11px] font-JakartaBold text-gray-700 ml-1">{driver.rating}</Text>
                                    </View>

                                    {/* Details */}
                                    <Text className="font-JakartaBold text-sm text-gray-900 text-center" numberOfLines={1}>
                                        {driver.name}
                                    </Text>
                                    <Text className="font-Jakarta text-[11px] text-gray-400 text-center mt-0.5" numberOfLines={1}>
                                        {driver.vehicle}
                                    </Text>

                                    <View className="w-full border-t border-dashed border-gray-100 my-3" />

                                    {/* Action Footnotes */}
                                    <View className="w-full flex-row justify-between items-center px-1">
                                        <View>
                                            <Text className="text-[10px] font-Jakarta text-gray-400">Est. Price</Text>
                                            <Text className="text-sm font-JakartaBold text-gray-900">{driver.price}</Text>
                                        </View>
                                        <View className="items-end">
                                            <Text className="text-[10px] font-Jakarta text-right text-indigo-600 font-medium bg-indigo-50 px-1.5 py-0.5 rounded-md">
                                                {driver.distance}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </ScrollView>
                )}
            </SafeAreaView>
        );
    }

    // ==========================================
    // VIEW 2: THE DISCOVERY PAGE (Default)
    // ==========================================
    return (
        <SafeAreaView className="flex-1 bg-white">
            <Stack.Screen options={{ headerShown: false }} />

            <KeyboardAvoidingView
                 behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                 style={{ flex: 1, backgroundColor: 'white' }}
                 keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <PageHeader 
                    title="Search" 
                    rightIconName="filter"
                    titleColor="text-black"
                    iconColor="#000000"
                />

                <SearchBar 
                    value={searchQuery} 
                    onChangeText={setSearchQuery} 
                    onSubmitEditing={executeSearch} 
                    onClearPress={clearSearch}
                />

                {isSearching ? (
                    <View className="flex-1 mt-20 items-center justify-center">
                        <ActivityIndicator size="large" color="#3122D2" />
                        <Text className="mt-4 font-Jakarta text-gray-500">Searching Veyo...</Text>
                    </View>
                ) : (
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <Drop title="Recent Search" next="CLEAR ALL"/>
                        <View className="flex-row flex-wrap px-4 mt-4 mb-6">
                            {recentSearches.map((item, index) => (
                            <SearchPill 
                                key={index} 
                                title={item} 
                                onRemove={() => console.log(`Remove ${item}`)} 
                            />
                            ))}
                        </View>

                        <Drop title="Trending Searches" next="SEE ALL"/>
                        <View className="px-4 mt-2">
                            {trendingSearches.map((item, index) => (
                            <TrendingItem 
                                key={index}
                                index={index + 1} 
                                title={item}
                                onPress={() => {
                                    setSearchQuery(item);
                                    executeSearch();
                                }}
                            />
                            ))}
                        </View>
                        
                        <Drop title="Popular Category" next="SEE ALL"/>
                        <View className='p-4'>
                            <View className='w-full flex flex-row'>
                                <CategoryCard 
                                    flex={1} 
                                    height={220} 
                                    title="Food" 
                                    subtitle="2.4k+ spots" 
                                    imageUrl="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=90" 
                                />
                                <View style={{ width: 12 }} />
                                <CategoryCard 
                                    flex={1} 
                                    height={220} 
                                    title="Mobility" 
                                    subtitle="Express Rides" 
                                    imageUrl="https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=90" 
                                />
                            </View>

                            <View style={{ height: 12 }} />

                            <CategoryCard 
                                width="100%" 
                                height={160} 
                                title="Groceries" 
                                subtitle="Daily Essentials Delivered" 
                                imageUrl="https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=800&q=90" 
                            />
                        </View>
                    </ScrollView>
                )}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
  wrapper: { padding: 16 },
  row: { flexDirection: 'row', width: '100%' }
});