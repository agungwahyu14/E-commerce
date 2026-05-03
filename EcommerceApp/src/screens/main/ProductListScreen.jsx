import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Colors } from '../../constants/colors';
import ProductCard from '../../components/ProductCard';
import SkeletonLoader from '../../components/SkeletonLoader';
import EmptyState from '../../components/EmptyState';
import productService from '../../services/productService';
import homeService from '../../services/homeService';
import { useFocusEffect } from '@react-navigation/native';

const ProductListScreen = ({ route, navigation }) => {
  const { title, category: initialCategory, type } = route.params;
  
  const [activeCategory, setActiveCategory] = useState(initialCategory || 'Semua');
  const [categories, setCategories] = useState([{ id: 'semua', name: 'Semua' }]);

  // Fetch categories if type is 'all'
  useFocusEffect(
    useCallback(() => {
      if (type === 'all') {
        const fetchCategories = async () => {
          try {
            const data = await homeService.getHomeData();
            if (data.categories) {
              setCategories([{ id: 'semua', name: 'Semua' }, ...data.categories]);
            }
          } catch (error) {
            console.error('Error fetching categories:', error);
          }
        };
        fetchCategories();
      }
    }, [type])
  );

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
    isRefetching,
  } = useInfiniteQuery({
    queryKey: ['products', type, activeCategory],
    queryFn: async ({ pageParam = 1 }) => {
      let result;
      if (type === 'featured') {
        // Featured products usually don't have pagination in simple APIs, 
        // but we'll assume it might or just return the data.
        result = await productService.getFeaturedProducts();
        // Normalize response to match getProducts if it's just an array
        return Array.isArray(result) ? { products: result, pagination: { totalPages: 1 } } : result;
      } else if (type === 'category') {
        result = await productService.getProducts({ 
          category: activeCategory === 'Semua' ? '' : activeCategory,
          page: pageParam,
          limit: 10 
        });
        return result.data;
      } else {
        // type === 'all'
        result = await productService.getProducts({ 
          category: activeCategory === 'Semua' ? '' : activeCategory,
          page: pageParam,
          limit: 10 
        });
        return result.data;
      }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { pagination } = lastPage;
      if (pagination && pagination.page < pagination.totalPages) {
        return pagination.page + 1;
      }
      return undefined;
    },
  });

  const products = useMemo(() => {
    return data?.pages.flatMap((page) => page.products) || [];
  }, [data]);

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color={Colors.text} />
      </TouchableOpacity>
      <Text style={styles.headerTitle} numberOfLines={1}>
        {activeCategory !== 'Semua' && type === 'all' ? activeCategory : title}
      </Text>
      <TouchableOpacity 
        style={styles.searchButton}
        onPress={() => navigation.navigate('Search')}
      >
        <Ionicons name="search" size={24} color={Colors.text} />
      </TouchableOpacity>
    </View>
  );

  const renderCategoryFilter = () => {
    if (type !== 'all') return null;

    return (
      <View style={styles.filterContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.filterChip,
                activeCategory === cat.name && styles.filterChipActive
              ]}
              onPress={() => setActiveCategory(cat.name)}
            >
              <Text style={[
                styles.filterText,
                activeCategory === cat.name && styles.filterTextActive
              ]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.loaderFooter}>
        <SkeletonLoader item={1} />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {renderHeader()}
      {renderCategoryFilter()}

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <SkeletonLoader />
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          numColumns={2}
          contentContainerStyle={styles.listContainer}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <ProductCard
                product={item}
                onPress={() => navigation.navigate('ProductDetail', { product: item })}
              />
            </View>
          )}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            <EmptyState 
              title="Produk tidak ditemukan" 
              message="Coba cari dengan kategori atau kata kunci lain." 
            />
          }
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={Colors.primary}
              colors={[Colors.primary]}
            />
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginLeft: 12,
  },
  searchButton: {
    padding: 4,
  },
  filterContainer: {
    backgroundColor: Colors.background,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  filterTextActive: {
    color: Colors.surface,
  },
  listContainer: {
    paddingVertical: 16,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  cardWrapper: {
    width: '48%',
  },
  loadingContainer: {
    flex: 1,
    padding: 16,
  },
  loaderFooter: {
    paddingVertical: 16,
  },
});

export default ProductListScreen;
