import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useAppModal } from '../../hooks/useAppModal';

const MidtransPaymentScreen = ({ route, navigation }) => {
  const { snapToken, orderId } = route.params;
  const { showModal } = useAppModal();
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Midtrans Snap URL (Sandbox)
  const snapUrl = `https://app.sandbox.midtrans.com/snap/v2/vtweb/${snapToken}`;

  const handleNavigationChange = (navState) => {
    const { url } = navState;
    console.log('[Midtrans URL]:', url);

    // Deteksi status pembayaran dari URL callback
    if (url.includes('payment_success') || url.includes('transaction_status=settlement') || url.includes('transaction_status=capture')) {
      navigation.replace('PaymentSuccess', { orderId });
    } else if (url.includes('payment_failed') || url.includes('transaction_status=deny')) {
      navigation.replace('PaymentFailed', { orderId });
    } else if (url.includes('payment_pending') || url.includes('transaction_status=pending')) {
      navigation.replace('PaymentPending', { orderId });
    }
  };

  const handleLoadProgress = ({ nativeEvent }) => {
    const newProgress = nativeEvent.progress;
    setProgress(newProgress);
    
    Animated.timing(progressAnim, {
      toValue: newProgress,
      duration: 300,
      useNativeDriver: false,
    }).start();

    if (newProgress === 1) {
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  };

  const handleClose = () => {
    showModal({
      type: 'confirm',
      title: 'Batalkan Pembayaran?',
      message: 'Jika Anda keluar sekarang, pesanan Anda akan tetap tersimpan namun statusnya masih pending.',
      confirmText: 'Ya, Keluar',
      cancelText: 'Tetap Disini',
      onConfirm: () => {
        navigation.replace('PaymentPending', { orderId });
      }
    });
  };

  const widthInterpolate = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pembayaran Aman</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <Animated.View 
          style={[
            styles.progressBar, 
            { width: widthInterpolate, opacity: progress === 1 ? 0 : 1 }
          ]} 
        />
      </View>

      {/* WebView */}
      <View style={{ flex: 1 }}>
        <WebView
          source={{ uri: snapUrl }}
          onNavigationStateChange={handleNavigationChange}
          onLoadProgress={handleLoadProgress}
          style={{ flex: 1 }}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={Colors.primary} />
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  closeBtn: {
    padding: 8,
  },
  progressContainer: {
    height: 3,
    width: '100%',
    backgroundColor: '#F1F5F9',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MidtransPaymentScreen;
