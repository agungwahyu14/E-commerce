import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { WishlistProvider } from './src/context/WishlistContext';
import { ErrorProvider } from './src/context/ErrorContext';
import { CartProvider } from './src/context/CartContext';
import { ModalProvider } from './src/context/ModalContext';
import RootNavigator from './src/navigation/RootNavigator';

const queryClient = new QueryClient();

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ModalProvider>
            <ErrorProvider>
              <CartProvider>
                <WishlistProvider>
                  <NavigationContainer>
                    <RootNavigator />
                  </NavigationContainer>
                </WishlistProvider>
              </CartProvider>
            </ErrorProvider>
          </ModalProvider>
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
