import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useCart } from '../../context/CartContext';
import checkoutService from '../../services/checkoutService';

const PaymentSuccessScreen = ({ route, navigation }) => {
  const { orderId } = route.params;
  const { clearCart } = useCart();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    clearCart();
    fetchOrderDetails();

    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, []);

  const fetchOrderDetails = async () => {
    try {
      setIsLoading(true);
      const data = await checkoutService.getOrderDetail(orderId);
      // Response API: { success: true, data: { order: { ... } } }
      // checkoutService returns response.data.data
      setOrder(data.order);
    } catch (error) {
      console.error('Fetch order detail error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeeOrders = () => {
    navigation.replace('MainTabs', { screen: 'Profile' });
    setTimeout(() => {
      navigation.navigate('MyOrders');
    }, 100);
  };

  const formatPrice = (price) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(numPrice || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPaymentType = (type) => {
    if (!type) return 'Midtrans';
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Animated.View style={[styles.iconCircle, { transform: [{ scale: scaleAnim }] }]}>
            <Ionicons name="checkmark-circle" size={100} color={Colors.success} />
          </Animated.View>
          <Text style={styles.title}>Pembayaran Berhasil!</Text>
          <Text style={styles.message}>
            Terima kasih! Pesanan Anda telah kami terima dan sedang dalam proses.
          </Text>
        </View>

        {isLoading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: 20 }} />
        ) : (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Detail Pembayaran</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Order ID</Text>
              <Text style={styles.infoValue}>#{orderId.substring(0, 8).toUpperCase()}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Total Pembayaran</Text>
              <Text style={styles.totalAmount}>{formatPrice(order?.totalAmount)}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Metode</Text>
              <Text style={styles.infoValue}>{formatPaymentType(order?.paymentType)}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Waktu</Text>
              <Text style={styles.infoValue}>{formatDate(order?.updatedAt)}</Text>
            </View>

            <View style={styles.divider} />
            <Text style={styles.statusText}>Status: <Text style={{ color: Colors.success }}>DIBAYAR</Text></Text>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.primaryButton]} 
            onPress={handleSeeOrders}
          >
            <Text style={styles.primaryButtonText}>Lihat Pesanan Saya</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.outlineButton]} 
            onPress={() => navigation.replace('MainTabs', { screen: 'Home' })}
          >
            <Text style={styles.outlineButtonText}>Lanjut Belanja</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 30,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  iconCircle: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  card: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  primaryButtonText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: 'bold',
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: Colors.border,
  },
  outlineButtonText: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PaymentSuccessScreen;
