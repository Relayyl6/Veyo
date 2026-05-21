import { Tabs } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { StyleSheet } from 'react-native';

export default function TabsLayout() {
  const TabBarIcon = (props: {
    name: React.ComponentProps<typeof FontAwesome>['name'];
    color: string;
  }) => {
    return <FontAwesome size={28} style={styles.tabBarIcon} {...props} />;
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#0286FF',
        tabBarInactiveTintColor: '#999999',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E6F3FF',
          borderTopWidth: 1,
          height: 70,
          paddingBottom: 10,
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
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          tabBarLabel: 'Home',
        }}
      />
      <Tabs.Screen
        name="rides"
        options={{
          title: 'Explore',
          headerShown: false,
          tabBarIcon: ({ color }) => <TabBarIcon name="car" color={color} />,
          tabBarLabel: 'Explore',
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: 'Wallet',
          headerShown: false,
          tabBarIcon: ({ color }) => <TabBarIcon name="credit-card" color={color} />,
          tabBarLabel: 'Wallet',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerShown: false,
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
          tabBarLabel: 'Profile',
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

