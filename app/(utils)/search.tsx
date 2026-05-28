import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import PageHeader from '@/components/PageHeader';
import SearchBar from '@/components/SearchBar';
import { useState } from 'react';
import Drop, { SearchPill, TrendingItem } from '@/components/drop';
import MealCard from '@/components/MealCard';
import CategoryCard from '@/components/CategoryCard';

export default function SearchScreen() {
    const router = useRouter()
    const [ valuer, setValuer ] = useState("")
    const [cartCounts, setCartCounts] = useState<{ [key: number]: number }>({});

    // 2. Create the function to accumulate the count
    const handleAddToCart = (mealId: number) => {
        setCartCounts((prevCounts) => ({
        ...prevCounts,
        // If it exists, add 1. If it doesn't, start at 1.
        [mealId]: (prevCounts[mealId] || 0) + 1 
        }));
    };
    const onChangeText = (value: any) => {
        setValuer(value)
    }
    const recentSearches = ['Sushi', 'Tesla Model 3', 'Downtown', 'illinois'];
    const trendingSearches = [
      'Rainy Day Comfort', 
      'Quick Lunch', 
      'Organic Groceries'
    ];

    const meals = [
        {
            id: 1,
            title: "Chicken Masala",
            time: "30 mins",
            price: "14.00",
            rating: "4.5",
            imageUrl: "https://freepngimg.com/thumb/food/139209-food-plate-masala-chicken-free-transparent-image-hd.png" 
        },
        {
            id: 2,
            title: "Cheese Burger",
            time: "8 mins",
            price: "9.00",
            rating: "4.3",
            imageUrl: "https://freepngimg.com/thumb/hamburger/8092-hamburger-burger.png"
        },
        {
            id: 3,
            title: "Margherita Pizza",
            time: "15 mins",
            price: "12.50",
            rating: "4.7",
            imageUrl: "https://freepngimg.com/thumb/pizza/35-pizza-png-image.png"
        },
        {
            id: 4,
            title: "Sushi Platter",
            time: "20 mins",
            price: "22.00",
            rating: "4.8",
            imageUrl: "https://freepngimg.com/thumb/sushi/23-sushi-png-image.png"
        },
        {
            id: 5,
            title: "Caesar Salad",
            time: "10 mins",
            price: "8.50",
            rating: "4.2",
            imageUrl: "https://freepngimg.com/thumb/salad/31751-5-salad-transparent.png"
        }
    ];

  return (
    <SafeAreaView className="flex-1 bg-white backdrop-blur-sm">
      {/* This strictly tells Expo Router to hide the header for this screen */}
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView className='flex-1 bg-white'>
        <PageHeader 
            title="Search" 
            rightIconName="filter"
            titleColor="text-black"
            iconColor="#000000"
        />

        <SearchBar value={valuer} onChangeText={onChangeText} />

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
                index={index + 1} // +1 so it starts at 1 instead of 0
                title={item}
                onPress={() => console.log(`Searched for ${item}`)}
            />
            ))}
        </View>
        
        <Drop title="Popular Category" next="SEE ALL"/>
        {/* <View className="flex-row flex-wrap justify-between px-4 pt-4">
            {meals.map((meal) => (
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
        </View> */}
        <View className='p-4'>
            {/* Top Row: Two Cards */}
            <View className='w-full flex flex-row'>
                <CategoryCard 
                flex={1} // Takes up half the row
                height={220} 
                title="Food" 
                subtitle="2.4k+ spots" 
                imageUrl="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=90" 
                />
                <View style={{ width: 12 }} /> {/* Gap */}
                <CategoryCard 
                    flex={1} // Takes up half the row
                    height={220} 
                    title="Mobility" 
                    subtitle="Express Rides" 
                    imageUrl="https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=90" 
                />
            </View>

            <View style={{ height: 12 }} /> {/* Vertical Gap */}

            {/* Bottom Row: One Full-Width Card */}
            <CategoryCard 
                width="100%" 
                height={160} 
                title="Groceries" 
                subtitle="Daily Essentials Delivered" 
                imageUrl="https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=800&q=90" 
            />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: { padding: 16 },
  row: { flexDirection: 'row', width: '100%' }
});