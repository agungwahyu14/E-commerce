import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { useCart } from '../../context/CartContext';
import { useAppModal } from '../../hooks/useAppModal';

const CartScreen = ({ navigation }) => {
  const { showModal } = useAppModal();
  const { 
    cart, 
    isLoading, 
    totalItems, 
    selectedItemsCount,
    selectedTotalPrice,
    isAllSelected,
    fetchCart,
    updateQuantity, 
    removeFromCart,
    toggleSelectItem,
    toggleSelectAll
  } = useCart();

  const [isRefreshing, setIsRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchCart();
    }, [])
  );

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchCart();
    setIsRefreshing(false);
  };

  const handleUpdateQuantity = (cartItemId, currentQty, delta) => {
    const newQty = currentQty + delta;
    if (newQty < 1) return;
    updateQuantity(cartItemId, newQty);
  };

  const handleRemoveItem = (cartItemId) => {
    showModal({
      type: 'confirm',
      title: 'Hapus Barang',
      message: 'Apakah Anda yakin ingin menghapus barang ini dari keranjang?',
      confirmText: 'Hapus',
      onConfirm: () => removeFromCart(cartItemId)
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price || 0);
  };

  const renderCartItem = ({ item }) => {
    const product = item.Product || {};
    const imageUrl = product.avatar_url || product.image_url || product.image || product.imageUrl;

    return (
      <View style={styles.cartItem}>
        {/* Checklist Icon */}
        <TouchableOpacity 
          style={styles.checkboxContainer} 
          onPress={() => toggleSelectItem(item.id)}
        >
          <Ionicons 
            name={item.selected ? "checkbox" : "square-outline"} 
            size={24} 
            color={item.selected ? Colors.primary : Colors.border} 
          />
        </TouchableOpacity>

        <Image 
          source={{ uri: imageUrl || 'https://via.placeholder.com/150' }} 
          style={styles.productImage} 
        />
        
        <View style={styles.itemDetails}>
          <View style={styles.itemHeader}>
            <Text style={styles.productName} numberOfLines={1}>{product.name || 'Produk'}</Text>
            <TouchableOpacity 
              style={styles.removeButton} 
              onPress={() => handleRemoveItem(item.id)}
            >
              <Ionicons name="trash-outline" size={20} color={Colors.error} />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.categoryText}>{product.Category?.name || 'Kategori'}</Text>
          <Text style={styles.productPrice}>{formatPrice(product.price)}</Text>
          
          <View style={styles.itemFooter}>
            <View style={styles.quantityContainer}>
              <TouchableOpacity 
                style={styles.qtyButton} 
                onPress={() => handleUpdateQuantity(item.id, item.quantity, -1)}
              >
                <Ionicons name="remove" size={16} color={Colors.text} />
              </TouchableOpacity>
              
              <Text style={styles.quantityText}>{item.quantity}</Text>
              
              <TouchableOpacity 
                style={styles.qtyButton} 
                onPress={() => handleUpdateQuantity(item.id, item.quantity, 1)}
              >
                <Ionicons name="add" size={16} color={Colors.text} />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.itemTotalText}>{formatPrice(product.price * item.quantity)}</Text>
          </View>
        </View>
      </View>
    );
  };

  if (isLoading && cart.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Custom Header with Select All */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>My Cart</Text>
          {cart.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{totalItems}</Text>
            </View>
          )}
        </View>
        
        {cart.length > 0 && (
          <TouchableOpacity 
            style={styles.selectAllContainer}
            onPress={() => toggleSelectAll(!isAllSelected)}
          >
            <Ionicons 
              name={isAllSelected ? "checkbox" : "square-outline"} 
              size={20} 
              color={isAllSelected ? Colors.primary : Colors.textSecondary} 
            />
            <Text style={styles.selectAllText}>Pilih Semua</Text>
          </TouchableOpacity>
        )}
      </View>

      {cart.length === 0 && !isLoading ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="cart-outline" size={80} color={Colors.border} />
          </View>
          <Text style={styles.emptyText}>Keranjang kamu masih kosong 🛒</Text>
          <Text style={styles.emptySubtext}>Yuk, cari barang impianmu sekarang!</Text>
          <TouchableOpacity 
            style={styles.shopButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.shopButtonText}>Mulai Belanja</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={cart}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderCartItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
            }
          />

          <View style={styles.footer}>
            <View style={styles.summaryContainer}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Barang Terpilih</Text>
                <Text style={styles.summaryValue}>{selectedItemsCount} items</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>Total Pembayaran</Text>
                <Text style={styles.totalAmount}>{formatPrice(selectedTotalPrice)}</Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={[
                styles.checkoutButton, 
                selectedItemsCount === 0 && styles.disabledButton
              ]}
              disabled={selectedItemsCount === 0}
              onPress={() => navigation.navigate('Checkout', {
                cartItems: cart.filter(item => item.selected),
                totalAmount: selectedTotalPrice
              })}
            >
              <Text style={styles.checkoutButtonText}>
                Checkout ({selectedItemsCount})
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  badge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 10,
  },
  badgeText: {
    color: Colors.surface,
    fontSize: 12,
    fontWeight: 'bold',
  },
  selectAllContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  selectAllText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  listContent: {
    padding: 20,
    paddingBottom: 150,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  checkboxContainer: {
    padding: 8,
    marginRight: 4,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  productName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.text,
    flex: 1,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 8,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemTotalText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 2,
  },
  qtyButton: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
  },
  quantityText: {
    fontSize: 13,
    fontWeight: 'bold',
    marginHorizontal: 10,
    color: Colors.text,
  },
  removeButton: {
    padding: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    padding: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
  },
  summaryContainer: {
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
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
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  checkoutButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  disabledButton: {
    backgroundColor: Colors.border,
    elevation: 0,
    shadowOpacity: 0,
  },
  checkoutButtonText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 6,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  shopButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 36,
    paddingVertical: 12,
    borderRadius: 12,
  },
  shopButtonText: {
    color: Colors.surface,
    fontSize: 15,
    fontWeight: 'bold',
  },
});

export default CartScreen;
