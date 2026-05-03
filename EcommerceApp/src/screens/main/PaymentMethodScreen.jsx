import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useAppModal } from '../../hooks/useAppModal';
import paymentMethodService from '../../services/paymentMethodService';
import AddPaymentMethodModal from '../../components/AddPaymentMethodModal';
import SkeletonLoader from '../../components/SkeletonLoader';
import EmptyState from '../../components/EmptyState';

const PaymentMethodScreen = ({ navigation }) => {
  const { showModal } = useAppModal();
  const [methods, setMethods] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchMethods();
  }, []);

  const fetchMethods = async () => {
    try {
      setIsLoading(true);
      const data = await paymentMethodService.getPaymentMethods();
      setMethods(data || []);
    } catch (error) {
      console.error('Fetch payment methods error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchMethods();
    setIsRefreshing(false);
  };

  const handleAddMethod = async (data) => {
    try {
      await paymentMethodService.addPaymentMethod(data);
      await fetchMethods();
    } catch (error) {
      console.error('Add payment method error:', error);
      throw error;
    }
  };

  const handleDelete = (id) => {
    showModal({
      type: 'confirm',
      title: 'Hapus Metode Pembayaran',
      message: 'Apakah Anda yakin ingin menghapus metode pembayaran ini?',
      confirmText: 'Hapus',
      onConfirm: async () => {
        try {
          await paymentMethodService.deletePaymentMethod(id);
          await fetchMethods();
        } catch (error) {
          console.error('Delete error:', error);
        }
      }
    });
  };

  const handleSetDefault = async (id) => {
    try {
      await paymentMethodService.setDefault(id);
      await fetchMethods();
    } catch (error) {
      console.error('Set default error:', error);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'bank': return '🏦';
      case 'card': return '💳';
      case 'wallet': return '💚';
      default: return '💰';
    }
  };

  const maskNumber = (num) => {
    if (!num) return '';
    const last4 = num.slice(-4);
    return `•••• •••• ${last4}`;
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.providerInfo}>
          <Text style={styles.providerIcon}>{getIcon(item.type)}</Text>
          <View>
            <Text style={styles.providerName}>{item.provider}</Text>
            <Text style={styles.accountNumber}>{maskNumber(item.accountNumber)}</Text>
          </View>
        </View>
        {item.isDefault && (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultText}>Utama</Text>
          </View>
        )}
      </View>
      
      <Text style={styles.accountName}>{item.accountName}</Text>

      <View style={styles.divider} />

      <View style={styles.actions}>
        {!item.isDefault && (
          <TouchableOpacity 
            style={styles.actionBtn} 
            onPress={() => handleSetDefault(item.id)}
          >
            <Ionicons name="checkmark-circle-outline" size={18} color={Colors.primary} />
            <Text style={styles.actionText}>Atur Utama</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          style={[styles.actionBtn, { marginLeft: 'auto' }]} 
          onPress={() => handleDelete(item.id)}
        >
          <Ionicons name="trash-outline" size={18} color={Colors.error} />
          <Text style={[styles.actionText, { color: Colors.error }]}>Hapus</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Metode Pembayaran</Text>
        <View style={{ width: 24 }} />
      </View>

      {isLoading && !isRefreshing ? (
        <View style={{ padding: 16 }}>
          <SkeletonLoader />
        </View>
      ) : (
        <FlatList
          data={methods}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          renderItem={renderItem}
          ListEmptyComponent={
            <EmptyState
              title="Belum ada metode pembayaran"
              message="Tambahkan kartu atau akun bank Anda untuk kemudahan bertransaksi."
              icon="card-outline"
            />
          }
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
          }
        />
      )}

      <TouchableOpacity 
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={32} color={Colors.surface} />
      </TouchableOpacity>

      <AddPaymentMethodModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleAddMethod}
      />
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
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  providerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  providerIcon: {
    fontSize: 28,
  },
  providerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  accountNumber: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  defaultBadge: {
    backgroundColor: 'rgba(13, 138, 188, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(13, 138, 188, 0.2)',
  },
  defaultText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  accountName: {
    fontSize: 15,
    color: Colors.text,
    fontWeight: '500',
    marginBottom: 16,
    marginLeft: 40,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: Colors.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});

export default PaymentMethodScreen;
