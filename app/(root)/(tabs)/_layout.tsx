import { Tabs } from 'expo-router';
import { Image, StyleSheet, useColorScheme, View } from 'react-native';
import { icons } from '@/constants/utils';
import TabBarIcon from '@/components/TabBarIcon';
import { AnimatedTabBar } from '@/components/AnimatedTabBar';

export default function TabsLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      tabBar={(props) => <AnimatedTabBar {...props} />}
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: 'white',
        tabBarInactiveTintColor: 'white',
        tabBarShowLabel: false,

        tabBarIcon: ({ focused, color }) => {
          let iconSource;
          let displayTitle = "";

          switch (route.name) {
            case 'home':
              iconSource = icons.home;
              displayTitle = "Home";
              break;
            case 'explore':
              iconSource = icons.explore;
              displayTitle = "Explore";
              break;
            case 'trips':
              iconSource = icons.trips;
              displayTitle = "Trips";
              break;
            case 'wallet':
              iconSource = icons.wallet;
              displayTitle = "Wallet";
              break;
            case 'profile':
              iconSource = icons.person; // maps to your person utility icon asset
              displayTitle = "Profile";
              break;
            default:
              iconSource = icons.home;
              displayTitle = "Home";
          } 
          
          
          return (
            <TabBarIcon 
              name={iconSource} // Passes the image asset perfectly to the handler
              title={displayTitle} 
              focused={focused} 
              color={color} 
            />
          );
        },

        tabBarStyle: {
          backgroundColor: 'transparent', // <-- MUST be transparent to see the image behind it
          borderTopWidth: 0, // <-- Removed the border so it doesn't create an ugly line over your image
          elevation: 0,
          borderRadius: 50,
          overflow: 'hidden',
          paddingBottom: 0,
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
          headerShown: false
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          headerShown: false
        }}
      />
      <Tabs.Screen
        name="trips"
        options={{
          title: 'Trips',
          headerShown: false
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: 'Wallet',
          headerShown: false
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerShown: false
        }}
      />
    </Tabs>
  );
}

