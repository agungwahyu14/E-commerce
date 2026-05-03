import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import EmptyState from '../../components/EmptyState';
import ProductCard from '../../components/ProductCard';
import SkeletonLoader from '../../components/SkeletonLoader';
import { Colors } from '../../constants/colors';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../hooks/useAuth';
import homeService from '../../services/homeService';

const { width } = Dimensions.get('window');
const BANNER_WIDTH = width - 32;

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { cart, totalItems } = useCart();
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  const [allProducts, setAllProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([{ id: 'semua', name: 'Semua', icon: 'grid-outline' }]);
  const [collections, setCollections] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [flashSale, setFlashSale] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchHomeData = async () => {
    try {
      const data = await homeService.getHomeData();

      setBanners(data.banners || []);
      setCategories([{ id: 'semua', name: 'Semua', icon: 'grid-outline' }, ...(data.categories || [])]);
      setCollections(data.collections || []);
      setFeaturedProducts(data.featuredProducts || []);
      setFlashSale(data.flashSale || []);
      setAllProducts(data.allProducts || []);
    } catch (error) {
      console.error('Error fetching home data:', error);
    }
  };

  // Initial Fetch
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await fetchHomeData();
      setIsLoading(false);
    };
    init();
  }, []);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchHomeData();
    setIsRefreshing(false);
  };

  // Filter products locally when category or search changes
  useEffect(() => {
    let filtered = allProducts;

    if (activeCategory !== 'Semua') {
      filtered = filtered.filter(p => p.Category?.name === activeCategory || p.category === activeCategory);
    }

    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setProducts(filtered);
  }, [activeCategory, searchQuery, allProducts]);

  // Render Custom Header (Search, Cart, Chat)
  const renderCustomHeader = () => (
    <View style={styles.customHeaderContainer}>
      <TouchableOpacity
        style={styles.headerSearchContainer}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('Search')}
      >
        <Ionicons name="search" size={20} color={Colors.textSecondary} style={styles.searchIcon} />
        <View style={{ flex: 1 }} pointerEvents="none">
          <TextInput
            style={styles.searchInput}
            placeholder="Cari produk..."
            placeholderTextColor={Colors.textSecondary}
            editable={false}
          />
        </View>
      </TouchableOpacity>

      <View style={styles.headerIconsContainer}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.navigate('Cart')}
        >
          <Ionicons name="cart-outline" size={26} color={Colors.text} />
          {totalItems > 0 && (
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>{totalItems > 99 ? '99+' : totalItems}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.navigate('Chatbot')}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={26} color={Colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render Banners Slider
  const renderBanners = () => (
    <View style={styles.bannerContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        snapToInterval={BANNER_WIDTH + 16}
        decelerationRate="fast"
        contentContainerStyle={styles.bannerScroll}
      >
        {banners.map((banner) => (
          <TouchableOpacity key={banner.id} activeOpacity={0.9}>
            <ImageBackground
              source={{ uri: banner.image_url || banner.image || banner.imageUrl }}
              style={styles.bannerImage}
              imageStyle={styles.bannerImageStyle}
            >
              <View style={styles.bannerOverlay}>
                <Text style={styles.bannerTitle}>{banner.title}</Text>
                <Text style={styles.bannerSubtitle}>{banner.subtitle}</Text>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  // Render Flash Sale
  const renderFlashSale = () => (
    <View style={styles.flashSaleContainer}>
      <View style={styles.sectionHeader}>
        <View style={styles.flashSaleTitleRow}>
          <Text style={styles.sectionTitle}>Flash Sale</Text>
          <View style={styles.timerBadge}>
            <Text style={styles.timerText}>02 : 15 : 45</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('ProductList', { title: 'Flash Sale', type: 'all' })}>
          <Text style={styles.seeAllText}>See all</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.featuredScroll}
      >
        {flashSale.map((product) => {
          // Fake original price
          const originalPrice = product.price * 1.5;
          const formattedPrice = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(product.price);
          const formattedOriginalPrice = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(originalPrice);
          return (
            <TouchableOpacity key={product.id} style={styles.flashSaleCard} activeOpacity={0.8}>
              <Image
                source={{ uri: product.image_url || product.image || product.imageUrl }}
                style={styles.flashSaleImage}
              />
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>-33%</Text>
              </View>
              <View style={styles.flashSaleInfo}>
                <Text style={styles.flashSalePrice}>{formattedPrice}</Text>
                <Text style={styles.originalPrice}>{formattedOriginalPrice}</Text>
                <View style={styles.stockBarContainer}>
                  <View style={[styles.stockBarFill, { width: '70%' }]} />
                  <Text style={styles.stockText}>Tersisa 10</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  // Render Special Collections
  const renderSpecialCollections = () => (
    <View style={styles.collectionsContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Special Collections</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.featuredScroll}
      >
        {collections.map((col) => (
          <TouchableOpacity key={col.id} style={styles.collectionCard} activeOpacity={0.9}>
            <ImageBackground
              source={{ uri: col.image_url || col.image || col.imageUrl }}
              style={styles.collectionImage}
              imageStyle={styles.collectionImageStyle}
            >
              <View style={styles.collectionOverlay}>
                <Text style={styles.collectionTitle}>{col.title}</Text>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  // Render Featured Products
  const renderFeaturedProducts = () => (
    <View style={styles.featuredContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Featured Products</Text>
        <TouchableOpacity onPress={() => navigation.navigate('ProductList', { title: 'Featured Products', type: 'featured' })}>
          <Text style={styles.seeAllText}>See all</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.featuredScroll}
      >
        {featuredProducts.map((product) => (
          <View key={product.id} style={styles.featuredCardWrapper}>
            <ProductCard
              product={product}
              onPress={() => navigation.navigate('ProductDetail', { product })}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );

  // Render Category Tabs
  const renderCategories = () => (
    <View style={styles.categoriesContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <TouchableOpacity onPress={() => navigation.navigate('ProductList', { title: 'Categories', type: 'all' })}>
          <Text style={styles.seeAllText}>See all</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesScroll}
      >
        {categories.map((cat, index) => {
          const isActive = activeCategory === cat.name;
          return (
            <TouchableOpacity
              key={cat.id || index}
              style={styles.categoryItem}
              onPress={() => setActiveCategory(cat.name)}
            >
              <View style={[styles.categoryCircle, isActive && styles.categoryCircleActive]}>
                <Ionicons
                  name={cat.icon || 'grid-outline'}
                  size={24}
                  color={isActive ? Colors.surface : Colors.primary}
                />
              </View>
              <Text style={[styles.categoryLabel, isActive && styles.categoryLabelActive]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {renderCustomHeader()}
      <FlatList
        data={isLoading ? [] : products}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        columnWrapperStyle={styles.row}
        ListHeaderComponent={
          <>
            {renderCategories()}
            {renderBanners()}
            {renderFeaturedProducts()}
            {renderFlashSale()}
            {renderSpecialCollections()}
            <View style={styles.allProductsHeader}>
              <Text style={styles.sectionTitle}>All Products</Text>
              <TouchableOpacity onPress={() => navigation.navigate('ProductList', { title: 'All Products', type: 'all' })}>
                <Text style={styles.seeAllText}>See all</Text>
              </TouchableOpacity>
            </View>
            {isLoading && <SkeletonLoader />}
          </>
        }
        ListEmptyComponent={!isLoading && <EmptyState searchQuery={searchQuery} />}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <ProductCard
              product={item}
              onPress={() => navigation.navigate('ProductDetail', { product: item })}
            />
          </View>
        )}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContainer: {
    paddingBottom: 24,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  cardWrapper: {
    width: '48%', // Mengisi hampir setengah layar agar ada spasi di tengah
  },
  customHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    gap: 12,
    backgroundColor: Colors.background,
    zIndex: 100,
    // Menghapus elevation dan shadow agar menyatu dengan background
  },
  headerSearchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerIconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconButton: {
    position: 'relative',
  },
  badgeContainer: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.background,
    paddingHorizontal: 2,
    zIndex: 1,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  categoriesScroll: {
    paddingHorizontal: 16,
    gap: 16, // Mengatur jarak antar item
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 16,
  },
  categoryCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  categoryCircleActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  categoryLabelActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  bannerContainer: {
    marginBottom: 24,
  },
  bannerScroll: {
    paddingHorizontal: 16,
    gap: 16,
  },
  bannerImage: {
    width: BANNER_WIDTH,
    height: 160,
    justifyContent: 'flex-end',
  },
  bannerImageStyle: {
    borderRadius: 16,
  },
  bannerOverlay: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    justifyContent: 'flex-end',
  },
  bannerTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bannerSubtitle: {
    color: '#E5E7EB',
    fontSize: 14,
  },
  featuredContainer: {
    marginBottom: 24,
  },
  featuredScroll: {
    paddingHorizontal: 16,
  },
  featuredCardWrapper: {
    width: 160,
    marginRight: 16,
  },
  allProductsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  flashSaleContainer: {
    marginBottom: 24,
  },
  flashSaleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timerBadge: {
    backgroundColor: Colors.error,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  timerText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  flashSaleCard: {
    width: 140,
    marginRight: 16,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  flashSaleImage: {
    width: '100%',
    height: 120,
    backgroundColor: Colors.border,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.secondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  flashSaleInfo: {
    padding: 10,
  },
  flashSalePrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.error,
    marginBottom: 2,
  },
  originalPrice: {
    fontSize: 11,
    color: Colors.textSecondary,
    textDecorationLine: 'line-through',
    marginBottom: 8,
  },
  stockBarContainer: {
    height: 14,
    backgroundColor: '#FEE2E2', // light red
    borderRadius: 7,
    overflow: 'hidden',
    justifyContent: 'center',
    position: 'relative',
  },
  stockBarFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: Colors.error,
    borderRadius: 7,
  },
  stockText: {
    fontSize: 9,
    color: '#FFF',
    fontWeight: 'bold',
    textAlign: 'center',
    zIndex: 1,
  },
  collectionsContainer: {
    marginBottom: 24,
  },
  collectionCard: {
    width: 200,
    marginRight: 16,
  },
  collectionImage: {
    width: '100%',
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  collectionImageStyle: {
    borderRadius: 12,
  },
  collectionOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  collectionTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingHorizontal: 8,
  },
});

export default HomeScreen;
