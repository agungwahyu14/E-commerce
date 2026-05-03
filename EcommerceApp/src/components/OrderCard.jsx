import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { useAppModal } from '../hooks/useAppModal';

const OrderCard = ({ order, onPress }) => {
  const { showModal } = useAppModal();
  const { id, createdAt, status, paymentStatus, OrderItems, totalAmount, paymentMethod, vaNumber } = order;
  
  // Format data
  const orderId = id.substring(0, 8).toUpperCase();
  const date = new Date(createdAt).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const formattedPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(totalAmount || 0);

  // Status Badge Config
  const getStatusConfig = (status, type = 'order') => {
    if (type === 'payment') {
      switch (status?.toLowerCase()) {
        case 'unpaid': return { color: '#F97316', label: 'Belum Bayar' };
        case 'paid': return { color: '#10B981', label: 'Dibayar' };
        case 'failed': return { color: '#EF4444', label: 'Gagal' };
        case 'expired': return { color: '#64748B', label: 'Kadaluarsa' };
        case 'refunded': return { color: '#3B82F6', label: 'Dikembalikan' };
        default: return { color: Colors.textSecondary, label: status };
      }
    }
    
    switch (status?.toLowerCase()) {
      case 'pending': return { color: '#F97316', label: 'Menunggu' };
      case 'processing': return { color: '#3B82F6', label: 'Diproses' };
      case 'shipped': return { color: '#8B5CF6', label: 'Dikirim' };
      case 'delivered': return { color: '#10B981', label: 'Selesai' };
      case 'cancelled': return { color: '#EF4444', label: 'Dibatalkan' };
      default: return { color: Colors.textSecondary, label: status };
    }
  };

  const statusConfig = getStatusConfig(status);
  const payStatusConfig = getStatusConfig(paymentStatus, 'payment');

  // Product Info
  const firstItem = OrderItems?.[0]?.Product || OrderItems?.[0] || {};
  const otherItemsCount = OrderItems?.length - 1;
  const productText = otherItemsCount > 0 
    ? `${firstItem.name} dan ${otherItemsCount} produk lainnya`
    : firstItem.name;

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={onPress}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.orderId}>Order #{orderId}</Text>
          <Text style={styles.date}>{date}</Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 4 }}>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.color + '20' }]}>
            <Text style={[styles.statusText, { color: statusConfig.color }]}>{statusConfig.label}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: payStatusConfig.color + '15', paddingVertical: 2 }]}>
            <Text style={[styles.statusText, { color: payStatusConfig.color, fontSize: 10 }]}>{payStatusConfig.label}</Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.imagesRow}>
          {OrderItems?.slice(0, 3).map((item, index) => (
            <Image 
              key={index}
              source={{ uri: item.Product?.image_url || item.Product?.image || 'https://via.placeholder.com/150' }}
              style={styles.productThumbnail}
            />
          ))}
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={1}>{productText}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.totalLabel}>Total Belanja</Text>
            <Text style={styles.totalPrice}>{formattedPrice}</Text>
          </View>
        </View>
      </View>

      {/* Footer / Actions */}
      <View style={styles.footer}>
        {status?.toLowerCase() === 'pending' && (
          <>
            <TouchableOpacity 
              style={[styles.actionBtn, styles.cancelBtn]}
              onPress={() => {
                showModal({
                  type: 'confirm',
                  title: 'Batalkan Pesanan',
                  message: 'Apakah Anda yakin ingin membatalkan pesanan ini?',
                  confirmText: 'Ya, Batalkan',
                  onConfirm: () => {
                    // Logic untuk batalkan (biasanya panggil API)
                    console.log('Batalkan order', id);
                  }
                });
              }}
            >
              <Text style={styles.cancelBtnText}>Batalkan</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.primaryBtn]}>
              <Text style={styles.primaryBtnText}>Bayar Sekarang</Text>
            </TouchableOpacity>
          </>
        )}
        {(status?.toLowerCase() === 'processing' || status?.toLowerCase() === 'shipped') && (
          <TouchableOpacity style={[styles.actionBtn, styles.outlineBtn]}>
            <Text style={styles.outlineBtnText}>Lacak Pesanan</Text>
          </TouchableOpacity>
        )}
        {status?.toLowerCase() === 'delivered' && (
          <>
            <TouchableOpacity style={[styles.actionBtn, styles.outlineBtn]}>
              <Text style={styles.outlineBtnText}>Beri Ulasan</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.primaryBtn]}>
              <Text style={styles.primaryBtnText}>Beli Lagi</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: 12,
  },
  orderId: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.text,
  },
  date: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imagesRow: {
    flexDirection: 'row',
    marginRight: 12,
  },
  productThumbnail: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: Colors.background,
    marginRight: -15, // Staggered effect
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  totalPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    gap: 10,
  },
  actionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    minWidth: 100,
    alignItems: 'center',
  },
  primaryBtn: {
    backgroundColor: Colors.primary,
  },
  primaryBtnText: {
    color: Colors.surface,
    fontWeight: 'bold',
    fontSize: 13,
  },
  outlineBtn: {
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  outlineBtnText: {
    color: Colors.primary,
    fontWeight: 'bold',
    fontSize: 13,
  },
  cancelBtn: {
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelBtnText: {
    color: Colors.textSecondary,
    fontWeight: 'bold',
    fontSize: 13,
  },
});

export default OrderCard;
