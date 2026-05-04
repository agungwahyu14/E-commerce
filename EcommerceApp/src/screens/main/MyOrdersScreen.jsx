import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import OrderCard from '../../components/OrderCard';
import EmptyState from '../../components/EmptyState';
import SkeletonLoader from '../../components/SkeletonLoader';
import orderService from '../../services/orderService';
import { useAppModal } from '../../hooks/useAppModal';

const STATUS_TABS = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const MyOrdersScreen = ({ navigation }) => {
  const { showModal } = useAppModal();
  const [activeTab, setActiveTab] = useState('all');
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchOrders(activeTab);
  }, [activeTab]);

  const fetchOrders = async (status) => {
    try {
      setIsLoading(true);
      const data = await orderService.getMyOrders(status);
      setOrders(data.orders ?? []);
    } catch (error) {
      console.error('Fetch orders error:', error);
      setOrders([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    showModal({
      type: 'confirm',
      title: 'Batalkan Pesanan',
      message: 'Apakah kamu yakin ingin membatalkan pesanan ini? Tindakan ini tidak dapat diurungkan.',
      confirmText: 'Ya, Batalkan',
      cancelText: 'Tidak',
      onConfirm: async () => {
        try {
          await orderService.cancelOrder(orderId);
          showModal({
            type: 'success',
            title: 'Berhasil',
            message: 'Pesanan berhasil dibatalkan.',
            onConfirm: () => fetchOrders(activeTab),
          });
        } catch (error) {
          showModal({
            type: 'error',
            title: 'Gagal Membatalkan',
            message: error.response?.data?.message || 'Gagal membatalkan pesanan.',
          });
        }
      },
    });
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchOrders(activeTab);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={24} color={Colors.text} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Pesanan Saya</Text>
      <View style={{ width: 24 }} />
    </View>
  );

  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
        {STATUS_TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {renderHeader()}
      {renderTabs()}

      {isLoading && !isRefreshing ? (
        <View style={{ padding: 16 }}>
          <SkeletonLoader />
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <OrderCard
              order={item}
              onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
              onCancel={handleCancelOrder}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              title="Belum ada pesanan"
              message={activeTab === 'all' 
                ? "Ayo mulai belanja dan temukan produk favoritmu!" 
                : `Tidak ada pesanan dengan status ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
              icon="receipt-outline"
            />
          }
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
          }
        />
      )}
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
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  backBtn: {
    padding: 4,
  },
  tabsContainer: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tabsScroll: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activeTab: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  activeTabText: {
    color: Colors.surface,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
});

export default MyOrdersScreen;
