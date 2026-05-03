import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { useAppModal } from '../../hooks/useAppModal';
import productService from '../../services/productService';
import ProductCard from '../../components/ProductCard';
import SkeletonLoader from '../../components/SkeletonLoader';

const { width } = Dimensions.get('window');

const ProductDetailScreen = ({ route, navigation }) => {
  const { product: initialProduct } = route.params;
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { showModal } = useAppModal();
  const insets = useSafeAreaInsets();

  const [product, setProduct] = useState(initialProduct);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const isLoved = isInWishlist(product.id);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setIsDetailLoading(true);
        const data = await productService.getProductById(product.id);
        if (data.product) {
          setProduct(data.product);
        }
        setRelatedProducts(data.relatedProducts || []);
      } catch (error) {
        console.error('Error fetching product detail:', error);
      } finally {
        setIsDetailLoading(false);
      }
    };
    fetchDetail();
  }, [product.id]);

  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const formattedPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(product.price);

  const onAddToCart = async () => {
    try {
      await addToCart(product, quantity);
      showModal({
        type: 'success',
        title: 'Berhasil',
        message: 'Produk berhasil ditambahkan ke keranjang',
        confirmText: 'OK'
      });
    } catch (error) {
      // Error handled by global interceptor/context
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Image Section */}
        <View style={styles.imageContainer}>
          {!imageError ? (
            <Image 
              source={{ uri: product.image_url || product.image || product.imageUrl }} 
              style={styles.image} 
              resizeMode="cover"
              onLoadStart={() => setIsImageLoading(true)}
              onLoadEnd={() => setIsImageLoading(false)}
              onError={() => {
                setImageError(true);
                setIsImageLoading(false);
              }}
            />
          ) : (
            <View style={styles.errorPlaceholderDetail}>
              <Text style={styles.errorIconDetail}>🖼️</Text>
            </View>
          )}

          {isImageLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={Colors.primary} />
            </View>
          )}
          
          {/* Overlays */}
          <TouchableOpacity 
            style={[styles.overlayButton, styles.backButton, { top: insets.top + 10 }]} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.overlayButton, styles.wishlistButton, { top: insets.top + 10 }]} 
            onPress={() => toggleWishlist(product)}
          >
            <Ionicons 
              name={isLoved ? "heart" : "heart-outline"} 
              size={24} 
              color={isLoved ? Colors.error : Colors.text} 
            />
          </TouchableOpacity>
        </View>

        {/* Content Section */}
        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{product.Category?.name || product.category || 'Elektronik'}</Text>
            </View>
            <View style={[styles.stockBadge, { backgroundColor: product.stock > 0 ? '#E8F5E9' : '#FFEBEE' }]}>
              <Text style={[styles.stockText, { color: product.stock > 0 ? '#2E7D32' : '#C62828' }]}>
                {product.stock > 0 ? 'Tersedia' : 'Habis'}
              </Text>
            </View>
          </View>

          <Text style={styles.productName}>{product.name}</Text>

          <View style={styles.ratingRow}>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Ionicons 
                  key={i} 
                  name={i <= Math.floor(product.rating || 5) ? "star" : "star-outline"} 
                  size={16} 
                  color="#FBBF24" 
                />
              ))}
            </View>
            <Text style={styles.ratingText}>{product.rating || '5.0'} (120 Review)</Text>
          </View>

          <Text style={styles.priceText}>{formattedPrice}</Text>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Deskripsi Produk</Text>
          <Text style={styles.description}>
            {product.description || 'Tidak ada deskripsi untuk produk ini. Produk berkualitas tinggi dengan jaminan garansi resmi dan kualitas terbaik di kelasnya.'}
          </Text>

          <View style={styles.divider} />

          {/* Quantity Selector */}
          <View style={styles.quantityRow}>
            <Text style={styles.sectionTitle}>Jumlah</Text>
            <View style={styles.selector}>
              <TouchableOpacity 
                style={styles.qtyBtn} 
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Ionicons name="remove" size={20} color={Colors.text} />
              </TouchableOpacity>
              <Text style={styles.qtyText}>{quantity}</Text>
              <TouchableOpacity 
                style={styles.qtyBtn} 
                onPress={() => setQuantity(Math.min(product.stock || 99, quantity + 1))}
              >
                <Ionicons name="add" size={20} color={Colors.text} />
              </TouchableOpacity>
            </View>
          </View>
          {/* Related Products Section */}
          <View style={styles.relatedSection}>
            <Text style={styles.sectionTitle}>Produk Terkait</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.relatedScroll}
            >
              {relatedProducts.map((item) => (
                <View key={item.id} style={styles.relatedCardWrapper}>
                  <ProductCard
                    product={item}
                    onPress={() => {
                      // Navigate to same screen with new product
                      navigation.push('ProductDetail', { product: item });
                    }}
                  />
                </View>
              ))}
              {relatedProducts.length === 0 && !isDetailLoading && (
                <Text style={styles.emptyRelated}>Tidak ada produk terkait</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Footer */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Animated.View style={{ flex: 1, transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity 
            style={styles.footerWishlistBtn}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={() => toggleWishlist(product)}
            activeOpacity={1}
          >
            <Ionicons name={isLoved ? "heart" : "heart-outline"} size={20} color={isLoved ? Colors.error : Colors.text} />
            <Text style={styles.footerWishlistText}>Wishlist</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={{ flex: 2, transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity 
            style={styles.footerCartBtn}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={onAddToCart}
            activeOpacity={1}
          >
            <Ionicons name="cart-outline" size={20} color={Colors.surface} />
            <Text style={styles.footerCartText}>Tambah ke Keranjang</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 300,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  errorPlaceholderDetail: {
    width: '100%',
    height: 300,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorIconDetail: {
    fontSize: 60,
  },
  overlayButton: {
    position: 'absolute',
    top: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  backButton: {
    left: 16,
  },
  wishlistButton: {
    right: 16,
  },
  contentContainer: {
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  categoryBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  categoryText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  stockBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  stockText: {
    fontSize: 12,
    fontWeight: '600',
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  priceText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: Colors.textSecondary,
  },
  quantityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 100, // Space for footer
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
  },
  qtyBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  qtyText: {
    paddingHorizontal: 20,
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  footerWishlistBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  footerWishlistText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  footerCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    gap: 8,
  },
  footerCartText: {
    color: Colors.surface,
    fontSize: 14,
    fontWeight: 'bold',
  },
  relatedSection: {
    marginTop: 24,
    marginBottom: 40,
  },
  relatedScroll: {
    paddingTop: 8,
  },
  relatedCardWrapper: {
    width: 150,
    marginRight: 16,
  },
  emptyRelated: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
});

export default ProductDetailScreen;
