import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import orderService from '../../services/orderService';
import checkoutService from '../../services/checkoutService';
import { useAppModal } from '../../hooks/useAppModal';

const OrderDetailScreen = ({ route, navigation }) => {
  const { orderId } = route.params;
  const { showModal } = useAppModal();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetail();
  }, [orderId]);

  const fetchOrderDetail = async () => {
    try {
      setIsLoading(true);
      const data = await checkoutService.getOrderDetail(orderId);
      setOrder(data.order);
    } catch (error) {
      console.error('Fetch order detail error:', error);
      try {
        const data = await orderService.getOrderById(orderId);
        setOrder(data.order);
      } catch (e) {
        console.error('Fallback fetch error:', e);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    showModal({
      type: 'confirm',
      title: 'Batalkan Pesanan',
      message: 'Apakah kamu yakin ingin membatalkan pesanan ini?',
      confirmText: 'Ya, Batalkan',
      cancelText: 'Tidak',
      onConfirm: async () => {
        try {
          await orderService.cancelOrder(order.id);
          showModal({
            type: 'success',
            title: 'Berhasil',
            message: 'Pesanan berhasil dibatalkan.',
            onConfirm: () => fetchOrderDetail(), // refresh data
          });
        } catch (error) {
          showModal({
            type: 'error',
            title: 'Gagal',
            message: error.response?.data?.message || 'Gagal membatalkan pesanan.',
          });
        }
      },
    });
  };

  const getStatusInfo = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return { icon: 'time-outline', color: '#F97316', label: 'Menunggu Pembayaran', desc: 'Silakan selesaikan pembayaran Anda.' };
      case 'processing': return { icon: 'sync-outline', color: '#3B82F6', label: 'Pesanan Diproses', desc: 'Penjual sedang menyiapkan pesanan Anda.' };
      case 'shipped': return { icon: 'airplane-outline', color: '#8B5CF6', label: 'Pesanan Dikirim', desc: 'Pesanan Anda sedang dalam perjalanan.' };
      case 'delivered': return { icon: 'checkmark-circle-outline', color: '#10B981', label: 'Pesanan Selesai', desc: 'Pesanan telah diterima dengan baik.' };
      case 'cancelled': return { icon: 'close-circle-outline', color: '#EF4444', label: 'Pesanan Dibatalkan', desc: 'Pesanan ini telah dibatalkan.' };
      default: return { icon: 'help-circle-outline', color: Colors.textSecondary, label: status, desc: '' };
    }
  };

  const getPaymentStatusInfo = (status) => {
    switch (status?.toLowerCase()) {
      case 'unpaid': return { color: '#F97316', label: 'BELUM DIBAYAR' };
      case 'paid': return { color: '#10B981', label: 'SUDAH DIBAYAR' };
      case 'failed': return { color: '#EF4444', label: 'PEMBAYARAN GAGAL' };
      case 'expired': return { color: '#64748B', label: 'KADALUARSA' };
      default: return { color: Colors.textSecondary, label: status?.toUpperCase() || '-' };
    }
  };

  const formatPaymentType = (type) => {
    if (!type) return 'Midtrans';
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const formatPrice = (price) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR', 
      minimumFractionDigits: 0 
    }).format(numPrice || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // Parse shipping address if it's a string
  let parsedAddress = null;
  if (order?.shippingAddress) {
    try {
      parsedAddress = typeof order.shippingAddress === 'string' 
        ? JSON.parse(order.shippingAddress) 
        : order.shippingAddress;
    } catch (e) {
      console.error('Error parsing shipping address:', e);
    }
  }

  const statusInfo = getStatusInfo(order?.status);
  const payStatusInfo = getPaymentStatusInfo(order?.paymentStatus);
  
  const shippingCost = parseFloat(order?.shippingCost || 0);
  const totalAmount = parseFloat(order?.totalAmount || 0);
  const productSubtotal = totalAmount - shippingCost;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detail Pesanan</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Status Section */}
        <View style={[styles.statusSection, { backgroundColor: statusInfo.color }]}>
          <Ionicons name={statusInfo.icon} size={40} color={Colors.surface} />
          <View style={styles.statusTextContainer}>
            <Text style={styles.statusLabel}>{statusInfo.label}</Text>
            <Text style={styles.statusDesc}>{statusInfo.desc}</Text>
          </View>
        </View>

        {/* Info Pemesan */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Info Pemesan</Text>
          <View style={styles.userInfoBox}>
            <Ionicons name="person-circle-outline" size={40} color={Colors.textSecondary} />
            <View style={styles.userInfoText}>
              <Text style={styles.userName}>{order?.User?.name || '-'}</Text>
              <Text style={styles.userEmail}>{order?.User?.email || '-'}</Text>
            </View>
          </View>
        </View>

        {/* Timeline Progress */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status Pengiriman</Text>
          <View style={styles.timeline}>
            <TimelineItem label="Pesanan Dibuat" date={order?.createdAt} isDone />
            <TimelineItem label="Pembayaran Berhasil" date={order?.paymentStatus === 'paid' ? order?.updatedAt : null} isDone={order?.paymentStatus === 'paid'} />
            <TimelineItem label="Sedang Diproses" isDone={['processing', 'shipped', 'delivered'].includes(order?.status?.toLowerCase())} />
            <TimelineItem label="Dalam Pengiriman" isDone={['shipped', 'delivered'].includes(order?.status?.toLowerCase())} />
            <TimelineItem label="Pesanan Diterima" isLast isDone={order?.status?.toLowerCase() === 'delivered'} />
          </View>
        </View>

        {/* Section Baru: Informasi Pengiriman */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informasi Pengiriman</Text>
          
          {/* Alamat Card */}
          <View style={styles.shippingCard}>
            <View style={styles.cardIconContainer}>
              <Ionicons name="location" size={24} color={Colors.primary} />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.shippingName}>{order?.shippingAddress?.receiverName || parsedAddress?.receiverName || order?.User?.name || '-'}</Text>
              <Text style={styles.shippingPhone}>{order?.shippingAddress?.receiverPhone || parsedAddress?.receiverPhone || order?.User?.phone || '-'}</Text>
              <Text style={styles.shippingAddressText}>
                {order?.shippingAddress?.address || parsedAddress?.address || '-'}
              </Text>
              <Text style={styles.shippingCityText}>
                {order?.shippingCity || parsedAddress?.city || '-'}, {order?.shippingProvince || parsedAddress?.province || '-'}, {order?.shippingPostalCode || parsedAddress?.postalCode || '-'}
              </Text>
            </View>
          </View>

          {/* Kurir Card */}
          <View style={[styles.shippingCard, { marginTop: 12 }]}>
            <View style={[styles.cardIconContainer, { backgroundColor: '#F0FDF4' }]}>
              <Ionicons name="bicycle" size={24} color="#10B981" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.courierName}>
                {order?.shippingCourier || '-'} {order?.shippingService ? `(${order.shippingService})` : ''}
              </Text>
              {order?.shippingEtd && (
                <Text style={styles.shippingEtd}>Estimasi Pengiriman: {order.shippingEtd} Hari</Text>
              )}
              <Text style={styles.shippingCostText}>Ongkos Kirim: {formatPrice(shippingCost)}</Text>
            </View>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Produk Dipesan</Text>
          {order?.items?.map((item, index) => {
            return (
              <View key={index} style={styles.productItem}>
                <Image 
                  source={{ uri: item.image_url || 'https://via.placeholder.com/150' }} 
                  style={styles.productImage} 
                />
                <View style={styles.productDetails}>
                  <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                  <View style={styles.priceQtyRow}>
                    <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
                    <Text style={styles.productQty}>x{item.quantity}</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Ringkasan Pembayaran */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ringkasan Pembayaran</Text>
          <SummaryRow label="Subtotal Produk" value={formatPrice(productSubtotal)} />
          <SummaryRow label="Biaya Pengiriman" value={formatPrice(shippingCost)} />
          <SummaryRow label="Total Pesanan" value={formatPrice(totalAmount)} isTotal />
          
          <View style={styles.payStatusBox}>
            <Text style={styles.payStatusLabel}>Status Pembayaran</Text>
            <Text style={[styles.payStatusValue, { color: payStatusInfo.color }]}>{payStatusInfo.label}</Text>
          </View>
        </View>

        {/* Payment Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rincian Pembayaran</Text>
          <View style={styles.paymentInfoBox}>
            <View style={styles.paymentMethodRow}>
              <Ionicons name="card-outline" size={24} color={Colors.primary} />
              <Text style={styles.paymentText}>{formatPaymentType(order?.paymentType)}</Text>
            </View>
            
            <View style={styles.paymentDetailGrid}>
              {order?.vaNumber && (
                <View style={styles.paymentDetailItem}>
                  <Text style={styles.paymentDetailLabel}>Nomor VA</Text>
                  <Text style={styles.paymentDetailValue}>{order.vaNumber}</Text>
                </View>
              )}
              <View style={styles.paymentDetailItem}>
                <Text style={styles.paymentDetailLabel}>Waktu Transaksi</Text>
                <Text style={styles.paymentDetailValue}>{formatDate(order?.transactionTime || order?.updatedAt)}</Text>
              </View>
              <View style={styles.paymentDetailItem}>
                <Text style={styles.paymentDetailLabel}>ID Transaksi</Text>
                <Text style={styles.paymentDetailValue} numberOfLines={1}>{order?.transactionId || '-'}</Text>
              </View>
            </View>
          </View>
        </View>

        {order?.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Catatan</Text>
            <Text style={styles.notesText}>{order.notes}</Text>
          </View>
        )}
      </ScrollView>

      {/* Action Footer */}
      <View style={styles.footer}>
        {order?.paymentStatus === 'unpaid' && order?.status === 'pending' ? (
          <View style={{ gap: 8 }}>
            <TouchableOpacity 
              style={styles.primaryActionBtn}
              onPress={() => navigation.navigate('MidtransPayment', { snapToken: order.snapToken, orderId: order.id })}
            >
              <Text style={styles.primaryActionText}>Bayar Sekarang</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={handleCancelOrder}
            >
              <Text style={styles.cancelBtnText}>Batalkan Pesanan</Text>
            </TouchableOpacity>
          </View>
        ) : (order?.status === 'pending' || order?.status === 'processing') ? (
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={handleCancelOrder}
          >
            <Text style={styles.cancelBtnText}>Batalkan Pesanan</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.outlineActionBtn} onPress={() => navigation.navigate('HelpCenter')}>
            <Text style={styles.outlineActionText}>Butuh Bantuan?</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const TimelineItem = ({ label, date, isDone, isLast }) => (
  <View style={styles.timelineItem}>
    <View style={styles.timelineLeft}>
      <View style={[styles.timelineDot, isDone && styles.timelineDotDone]} />
      {!isLast && <View style={[styles.timelineLine, isDone && styles.timelineLineDone]} />}
    </View>
    <View style={styles.timelineRight}>
      <Text style={[styles.timelineLabel, isDone && styles.timelineLabelDone]}>{label}</Text>
      {date && <Text style={styles.timelineDate}>{new Date(date).toLocaleString('id-ID')}</Text>}
    </View>
  </View>
);

const SummaryRow = ({ label, value, isTotal }) => (
  <View style={styles.summaryRow}>
    <Text style={[styles.summaryLabel, isTotal && styles.summaryLabelTotal]}>{label}</Text>
    <Text style={[styles.summaryValue, isTotal && styles.summaryValueTotal]}>{value}</Text>
  </View>
);

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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
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
    paddingBottom: 120,
  },
  statusSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    gap: 16,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.surface,
    marginBottom: 4,
  },
  statusDesc: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  section: {
    backgroundColor: Colors.surface,
    padding: 16,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  userInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 12,
    gap: 12,
  },
  userInfoText: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  userEmail: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  timeline: {
    paddingLeft: 4,
  },
  timelineItem: {
    flexDirection: 'row',
    minHeight: 50,
  },
  timelineLeft: {
    alignItems: 'center',
    width: 20,
    marginRight: 12,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.border,
    zIndex: 1,
  },
  timelineDotDone: {
    backgroundColor: Colors.primary,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.border,
    marginVertical: -2,
  },
  timelineLineDone: {
    backgroundColor: Colors.primary,
  },
  timelineRight: {
    flex: 1,
    paddingBottom: 16,
  },
  timelineLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  timelineLabelDone: {
    color: Colors.text,
    fontWeight: '600',
  },
  timelineDate: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  shippingCard: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F0F7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  shippingName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 2,
  },
  shippingPhone: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  shippingAddressText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  shippingCityText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  courierName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  shippingEtd: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  shippingCostText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  productItem: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  productImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: Colors.background,
  },
  productDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: 4,
  },
  priceQtyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  productQty: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    color: Colors.text,
  },
  summaryLabelTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 8,
  },
  summaryValueTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    marginTop: 8,
  },
  payStatusBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  payStatusLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  payStatusValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  paymentInfoBox: {
    backgroundColor: Colors.background,
    padding: 16,
    borderRadius: 16,
  },
  paymentMethodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: 12,
  },
  paymentText: {
    fontSize: 15,
    color: Colors.text,
    fontWeight: 'bold',
  },
  paymentDetailGrid: {
    gap: 12,
  },
  paymentDetailItem: {
    gap: 4,
  },
  paymentDetailLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  paymentDetailValue: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '600',
  },
  notesText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
    fontStyle: 'italic',
  },
  footer: {
    padding: 16,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  primaryActionBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryActionText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: 'bold',
  },
  outlineActionBtn: {
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  outlineActionText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelBtn: {
    borderWidth: 1,
    borderColor: Colors.error,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelBtnText: {
    color: Colors.error,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default OrderDetailScreen;
