import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import checkoutService from '../../services/checkoutService';
import { useAppModal } from '../../hooks/useAppModal';

const CheckoutScreen = ({ route, navigation }) => {
  const { cartItems, totalAmount } = route.params;
  const { showModal } = useAppModal();
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price || 0);
  };

  const handleCheckout = async () => {
    try {
      setIsLoading(true);
      
      console.log('[Checkout Screen] Starting Checkout Process...');
      const result = await checkoutService.createCheckout(
        cartItems,
        'midtrans', // default payment method
        notes
      );

      if (result.snapToken) {
        navigation.navigate('MidtransPayment', {
          snapToken: result.snapToken,
          orderId: result.orderId,
        });
      } else {
        throw new Error('Gagal mendapatkan token pembayaran');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      showModal({
        type: 'error',
        title: 'Checkout Gagal',
        message: error.response?.data?.message || 'Terjadi kesalahan saat memproses pesanan Anda.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Konfirmasi Pesanan</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Order Items */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ringkasan Pesanan</Text>
            {cartItems.map((item) => (
              <View key={item.id} style={styles.itemRow}>
                <Image 
                  source={{ uri: item.Product.image_url || item.Product.image || 'https://via.placeholder.com/150' }} 
                  style={styles.itemImage} 
                />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName} numberOfLines={1}>{item.Product.name}</Text>
                  <Text style={styles.itemQty}>{item.quantity} x {formatPrice(item.Product.price)}</Text>
                </View>
                <Text style={styles.itemSubtotal}>
                  {formatPrice(item.Product.price * item.quantity)}
                </Text>
              </View>
            ))}
          </View>

          {/* Notes Input */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Catatan Pesanan (Opsional)</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="Contoh: Tolong bungkus yang rapi ya..."
              multiline
              numberOfLines={4}
              value={notes}
              onChangeText={setNotes}
              textAlignVertical="top"
            />
          </View>

          {/* Price Summary */}
          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>{formatPrice(totalAmount)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Biaya Layanan</Text>
              <Text style={styles.summaryValue}>{formatPrice(0)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total Pembayaran</Text>
              <Text style={styles.totalValue}>{formatPrice(totalAmount)}</Text>
            </View>
          </View>
        </ScrollView>

        {/* Footer Action */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.payButton, isLoading && styles.disabledButton]}
            onPress={handleCheckout}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.surface} />
            ) : (
              <>
                <Text style={styles.payButtonText}>Bayar Sekarang</Text>
                <Ionicons name="chevron-forward" size={20} color={Colors.surface} />
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  backBtn: {
    padding: 4,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: Colors.background,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  itemQty: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  itemSubtotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
  },
  notesInput: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    height: 100,
    fontSize: 14,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryBox: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 20,
    marginBottom: 40,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  footer: {
    padding: 20,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  payButton: {
    backgroundColor: Colors.primary,
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    elevation: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  disabledButton: {
    opacity: 0.7,
  },
  payButtonText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CheckoutScreen;
