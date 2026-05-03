import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import checkoutService from '../../services/checkoutService';

const PaymentFailedScreen = ({ route, navigation }) => {
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
  }, []);

  const fetchOrderDetails = async () => {
    try {
      setIsLoading(true);
      const data = await checkoutService.getOrderDetail(orderId);
      // Response API: { success: true, data: { order: { ... } } }
      setOrder(data.order);
    } catch (error) {
      console.error('Fetch order detail error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(numPrice || 0);
  };

  const handleTryAgain = () => {
    if (order?.snapToken) {
      navigation.navigate('MidtransPayment', {
        snapToken: order.snapToken,
        orderId: order.id,
      });
    } else {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Ionicons name="close-circle" size={100} color={Colors.error} />
          </View>
          <Text style={styles.title}>Pembayaran Gagal</Text>
          <Text style={styles.message}>
            Mohon maaf, transaksi Anda gagal diproses. Silakan coba kembali atau hubungi layanan bantuan jika saldo Anda terpotong.
          </Text>
        </View>

        {isLoading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: 20 }} />
        ) : (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Detail Transaksi</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Order ID</Text>
              <Text style={styles.infoValue}>#{orderId.substring(0, 8).toUpperCase()}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Total Tagihan</Text>
              <Text style={styles.totalAmount}>{formatPrice(order?.totalAmount)}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Status</Text>
              <Text style={[styles.infoValue, { color: Colors.error }]}>{order?.paymentStatus?.toUpperCase() || 'GAGAL'}</Text>
            </View>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.primaryButton]} 
            onPress={handleTryAgain}
          >
            <Text style={styles.primaryButtonText}>Coba Lagi</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.outlineButton]} 
            onPress={() => navigation.replace('MainTabs', { screen: 'Cart' })}
          >
            <Text style={styles.outlineButtonText}>Kembali ke Keranjang</Text>
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

export default PaymentFailedScreen;
