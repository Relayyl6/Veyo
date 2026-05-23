import { Tabs } from 'expo-router';
import { Image, StyleSheet, useColorScheme, View } from 'react-native';
import { icons } from '@/constants/utils';
import TabBarIcon from '@/components/TabBarIcon';

export default function TabsLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: 'white',
        tabBarInactiveTintColor: 'white',
        tabBarShowLabel: false,

        tabBarBackground: () => {
          // Dynamically choose the image based on the theme
          const bgImage = colorScheme === 'dark' 
            ? require('@/assets/images/tabbar-dark.png') 
            : require('@/assets/images/tabbar-light.png');

          return (
            <Image 
              source={bgImage} 
              style={StyleSheet.absoluteFill} // Makes the image fill the entire tab bar area
              resizeMode="cover" // Ensures the waves stretch nicely across the whole pill
            />
          );
        },
        
        // 2. Add your tabBarIcon configuration here
        tabBarIcon: ({ focused, color }) => {
          return (
            <TabBarIcon 
              title={route.name} 
              focused={focused} 
              color={color} 
            />
          );
        },

        tabBarStyle: {
          // backgroundColor: '#FFFFFF',
          // borderTopColor: '#E6F3FF',
          // borderTopWidth: 1,
          backgroundColor: 'transparent', // <-- MUST be transparent to see the image behind it
          borderTopWidth: 0, // <-- Removed the border so it doesn't create an ugly line over your image
          elevation: 0,
          borderRadius: 50,
          overflow: 'hidden',
          paddingBottom: 37,
          marginHorizontal: 20,
          marginBottom: 20,
          height: 70,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexDirection: 'row',
          position: 'absolute'
        },
        headerStyle: {
          backgroundColor: '#F5F8FF',
          borderBottomColor: '#E6F3FF',
          borderBottomWidth: 1,
        },
        headerTintColor: '#0286FF',
        headerTitleStyle: {
          fontFamily: 'Jakarta-Bold',
          fontSize: 18,
        },
        headerShadowVisible: false,
      })}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon 
              name={icons.home} 
              title="Home" 
              color={color} 
              focused={focused} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={icons.explore}
              title="Explore" 
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="trips"
        options={{
          title: 'Trips',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={icons.trips}
              title="Trips" 
              color={color}
              focused={focused}
            />
          ),
          
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: 'Wallet',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={icons.wallet}
              title="Wallet" 
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={icons.person}
              title="Profile" 
              color={color}
              focused={focused}
            />
          ),
          
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarIcon: {
    marginBottom: -3,
  },
});

