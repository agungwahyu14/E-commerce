import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/main/HomeScreen';
import CartScreen from '../screens/main/CartScreen';
import WishlistScreen from '../screens/main/WishlistScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import EditProfileScreen from '../screens/main/EditProfileScreen';
import ProductDetailScreen from '../screens/main/ProductDetailScreen';
import SearchScreen from '../screens/main/SearchScreen';
import MyOrdersScreen from '../screens/main/MyOrdersScreen';
import OrderDetailScreen from '../screens/main/OrderDetailScreen';
import HelpCenterScreen from '../screens/main/HelpCenterScreen';
import SettingsScreen from '../screens/main/SettingsScreen';
import ProductListScreen from '../screens/main/ProductListScreen';
import ChatbotScreen from '../screens/main/ChatbotScreen';
import ChangePasswordScreen from '../screens/settings/ChangePasswordScreen';
import PrivacyPolicyScreen from '../screens/settings/PrivacyPolicyScreen';
import TermsScreen from '../screens/settings/TermsScreen';
import CheckoutScreen from '../screens/main/CheckoutScreen';
import MidtransPaymentScreen from '../screens/main/MidtransPaymentScreen';
import PaymentSuccessScreen from '../screens/payment/PaymentSuccessScreen';
import PaymentFailedScreen from '../screens/payment/PaymentFailedScreen';
import PaymentPendingScreen from '../screens/payment/PaymentPendingScreen';
import MapPickerScreen from '../screens/main/MapPickerScreen';
import { Colors } from '../constants/colors';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Cart') {
            iconName = focused ? 'cart' : 'cart-outline';
          } else if (route.name === 'Wishlist') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Wishlist" component={WishlistScreen} />
      <Tab.Screen name="Cart" component={CartScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const MainNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen 
        name="MapPicker" 
        component={MapPickerScreen} 
        options={{ 
          headerShown: false,
          gestureEnabled: true,
          cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
        }}
      />
      <Stack.Screen 
        name="Search" 
        component={SearchScreen} 
        options={{
          gestureEnabled: false,
          cardStyleInterpolator: CardStyleInterpolators.forFadeFromCenter,
        }}
      />
      <Stack.Screen name="MyOrders" component={MyOrdersScreen} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
      <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="ProductList" component={ProductListScreen} />
      <Stack.Screen 
        name="Chatbot" 
        component={ChatbotScreen} 
        options={{
          gestureEnabled: true,
          cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
        }}
      />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="Terms" component={TermsScreen} />
      
      {/* Checkout & Payment */}
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="MidtransPayment" component={MidtransPaymentScreen} />
      <Stack.Screen name="PaymentSuccess" component={PaymentSuccessScreen} />
      <Stack.Screen name="PaymentFailed" component={PaymentFailedScreen} />
      <Stack.Screen name="PaymentPending" component={PaymentPendingScreen} />
    </Stack.Navigator>
  );
};

export default MainNavigator;
