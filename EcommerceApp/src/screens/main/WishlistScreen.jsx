import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProductCard from '../../components/ProductCard';
import { Colors } from '../../constants/colors';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAppModal } from '../../hooks/useAppModal';

const WishlistScreen = ({ navigation }) => {
  const { showModal } = useAppModal();
  const { wishlist, fetchWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchWishlist();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Wishlist</Text>
        <View style={styles.itemCountBadge}>
          <Text style={styles.itemCountText}>{wishlist?.length || 0} Items</Text>
        </View>
      </View>

      {(wishlist?.length ?? 0) === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-dislike-outline" size={80} color={Colors.border} />
          <Text style={styles.emptyText}>Your wishlist is empty</Text>
          <Text style={styles.emptySubtext}>Save items you love and they will appear here.</Text>
        </View>
      ) : (
        <FlatList
          data={wishlist ?? []}
          keyExtractor={(item) => item.id}
          numColumns={1}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <ProductCard
                product={item}
                variant="large"
                onPress={() => navigation.navigate('ProductDetail', { product: item })}
                onAddToCart={() => {
                  addToCart(item, 1);
                  showModal({
                    type: 'success',
                    title: 'Berhasil',
                    message: 'Produk berhasil ditambahkan ke keranjang'
                  });
                }}
              />
            </View>
          )}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.background,
    // borderBottomWidth: 1,
    // borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
  },
  itemCountBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  itemCountText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  listContainer: {
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  cardWrapper: {
    width: '100%',
  },
});

export default WishlistScreen;
