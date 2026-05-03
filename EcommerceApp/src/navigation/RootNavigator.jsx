import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import { Colors } from '../constants/colors';
import SessionExpiredModal from '../components/SessionExpiredModal';
import GlobalErrorModal from '../components/GlobalErrorModal';
import { useError } from '../context/ErrorContext';
import { setErrorCallback } from '../utils/api';
import { useEffect } from 'react';
const RootNavigator = () => {
  const { 
    isAuthenticated, 
    isLoading, 
    isSessionExpired, 
    handleSessionExpiredConfirm 
  } = useAuth();
  
  const { error, showError, hideError } = useError();

  useEffect(() => {
    setErrorCallback((title, message) => {
      showError(title, message);
    });
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <>
      {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
      <SessionExpiredModal 
        visible={isSessionExpired} 
        onConfirm={handleSessionExpiredConfirm} 
      />
      <GlobalErrorModal 
        visible={error.visible}
        title={error.title}
        message={error.message}
        onConfirm={hideError}
      />
    </>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});

export default RootNavigator;
