import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Clipboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import checkoutService from '../../services/checkoutService';
import { useAppModal } from '../../hooks/useAppModal';

const PaymentPendingScreen = ({ route, navigation }) => {
  const { orderId } = route.params;
  const { showModal } = useAppModal();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const pollingRef = useRef(null);

  useEffect(() => {
    fetchOrderDetails();
    
    // Polling setiap 10 detik
    pollingRef.current = setInterval(() => {
      fetchOrderDetails(false);
    }, 10000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  useEffect(() => {
    // Stop polling jika status bukan pending lagi
    if (order && order.paymentStatus !== 'unpaid' && order.status !== 'pending') {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      
      // Redirect jika status berubah jadi paid
      if (order.paymentStatus === 'paid') {
        navigation.replace('PaymentSuccess', { orderId });
      } else if (order.paymentStatus === 'failed' || order.paymentStatus === 'expired') {
        navigation.replace('PaymentFailed', { orderId });
      }
    }
  }, [order]);

  const fetchOrderDetails = async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      const data = await checkoutService.getOrderDetail(orderId);
      // Response API: { success: true, data: { order: { ... } } }
      setOrder(data.order);
    } catch (error) {
      console.error('Fetch order detail error:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchOrderDetails(false);
  };

  const handleSync = async () => {
    try {
      setIsSyncing(true);
      await checkoutService.syncOrderStatus(orderId);
      await fetchOrderDetails(false);
      showModal({
        type: 'success',
        title: 'Status Terupdate',
        message: 'Status pembayaran Anda telah diperbarui.'
      });
    } catch (error) {
      showModal({
        type: 'error',
        title: 'Gagal Update',
        message: 'Gagal mengambil status terbaru dari server.'
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const copyToClipboard = (text) => {
    Clipboard.setString(text);
    showModal({
      type: 'info',
      title: 'Disalin',
      message: 'Nomor VA berhasil disalin ke clipboard.'
    });
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

  if (isLoading && !order) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={[Colors.primary]} />
        }
      >
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Ionicons name="time" size={80} color="#F59E0B" />
          </View>
          <Text style={styles.title}>Menunggu Pembayaran</Text>
          <Text style={styles.message}>
            Silakan selesaikan pembayaran Anda agar pesanan dapat segera diproses.
          </Text>
        </View>

        {/* Detail Pembayaran */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Detail Pembayaran</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Order ID</Text>
            <Text style={styles.infoValue}>#{orderId.substring(0, 8).toUpperCase()}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Total Tagihan</Text>
            <Text style={styles.totalAmount}>{formatPrice(order?.totalAmount)}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Metode</Text>
            <Text style={styles.infoValue}>{formatPaymentType(order?.paymentType)}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Waktu Transaksi</Text>
            <Text style={styles.infoValue}>{formatDate(order?.createdAt)}</Text>
          </View>

          {order?.vaNumber && (
            <View style={styles.vaContainer}>
              <Text style={styles.vaLabel}>Nomor Virtual Account</Text>
              <View style={styles.vaBox}>
                <Text style={styles.vaNumber}>{order.vaNumber}</Text>
                <TouchableOpacity onPress={() => copyToClipboard(order.vaNumber)}>
                  <Ionicons name="copy-outline" size={20} color={Colors.primary} />
                </TouchableOpacity>
              </View>
              <Text style={styles.bankName}>{order.bankName?.toUpperCase()}</Text>
            </View>
          )}
        </View>

        {/* Instruksi Singkat */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Instruksi</Text>
          <Text style={styles.instructionText}>
            1. Gunakan aplikasi m-banking atau ATM pilihan Anda.{"\n"}
            2. Masukkan nomor Virtual Account di atas.{"\n"}
            3. Pastikan nominal sesuai dengan total tagihan.{"\n"}
            4. Simpan bukti transfer jika diperlukan.
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.syncButton]} 
            onPress={handleSync}
            disabled={isSyncing}
          >
            {isSyncing ? (
              <ActivityIndicator color={Colors.primary} size="small" />
            ) : (
              <>
                <Ionicons name="refresh" size={20} color={Colors.primary} />
                <Text style={styles.syncButtonText}>Refresh Status</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.primaryButton]} 
            onPress={() => navigation.replace('MainTabs', { screen: 'Profile', params: { screen: 'MyOrders' } })}
          >
            <Text style={styles.primaryButtonText}>Cek Pesanan Saya</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: 8,
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
  vaContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  vaLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  vaBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  vaNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    letterSpacing: 1,
  },
  bankName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: 'right',
  },
  instructionText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  buttonContainer: {
    marginTop: 10,
    gap: 12,
  },
  button: {
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  primaryButtonText: {
    color: Colors.surface,
    fontSize: 15,
    fontWeight: 'bold',
  },
  syncButton: {
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: Colors.surface,
  },
  syncButtonText: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  outlineButton: {
    backgroundColor: 'transparent',
  },
  outlineButtonText: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
});

export default PaymentPendingScreen;
