import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { useWishlist } from '../context/WishlistContext';

const ProductCard = ({ product, onPress, variant = 'grid', onAddToCart }) => {
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Format harga ke Rupiah
  const formattedPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(product.price);

  const { toggleWishlist, isInWishlist } = useWishlist();
  const isLoved = isInWishlist(product.id);
  const isLarge = variant === 'large';

  return (
    <TouchableOpacity 
      style={[styles.card, isLarge && styles.cardLarge]} 
      onPress={onPress} 
      activeOpacity={0.8}
    >
      <View style={[styles.imageContainer, isLarge && styles.imageContainerLarge]}>
        {!imageError ? (
          <Image 
            source={{ uri: product.image_url || product.image || product.imageUrl }} 
            style={[styles.image, isLarge && styles.imageLarge]} 
            resizeMode="cover"
            onLoadStart={() => setIsImageLoading(true)}
            onLoadEnd={() => setIsImageLoading(false)}
            onError={() => {
              setImageError(true);
              setIsImageLoading(false);
            }}
          />
        ) : (
          <View style={[styles.errorPlaceholder, isLarge && styles.imageLarge]}>
            <Text style={styles.errorIcon}>🖼️</Text>
          </View>
        )}

        {isImageLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="small" color={Colors.primary} />
          </View>
        )}

        <TouchableOpacity 
          style={styles.loveButton} 
          onPress={() => toggleWishlist(product)}
        >
          <Ionicons 
            name={isLoved ? "heart" : "heart-outline"} 
            size={isLarge ? 22 : 18} 
            color={isLoved ? Colors.error : Colors.textSecondary} 
          />
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.category}>{product.Category?.name || product.category || 'Product'}</Text>
        <Text style={[styles.name, isLarge && styles.nameLarge]} numberOfLines={2}>{product.name}</Text>
        
        <View style={[styles.priceRatingContainer, isLarge && styles.priceRatingContainerLarge]}>
          <Text style={[styles.price, isLarge && styles.priceLarge]}>{formattedPrice}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#FBBF24" />
            <Text style={styles.rating}>{product.rating || '5.0'}</Text>
          </View>
        </View>

        {isLarge && onAddToCart && (
          <TouchableOpacity 
            style={styles.addToCartBtn} 
            onPress={(e) => {
              e.stopPropagation();
              onAddToCart();
            }}
          >
            <Ionicons name="cart-outline" size={18} color={Colors.surface} />
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardLarge: {
    marginBottom: 20,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 150,
    backgroundColor: Colors.border,
  },
  imageLarge: {
    height: 220,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  errorPlaceholder: {
    width: '100%',
    height: 150,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorIcon: {
    fontSize: 40,
  },
  loveButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.surface,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  infoContainer: {
    padding: 12,
  },
  category: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginBottom: 4,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  name: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
    lineHeight: 20,
  },
  nameLarge: {
    fontSize: 16,
    marginBottom: 12,
  },
  priceRatingContainer: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    gap: 4,
  },
  priceRatingContainerLarge: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  price: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  priceLarge: {
    fontSize: 18,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  addToCartBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  addToCartText: {
    color: Colors.surface,
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default ProductCard;
