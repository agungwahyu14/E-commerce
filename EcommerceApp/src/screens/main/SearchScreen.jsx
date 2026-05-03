import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../../constants/colors';
import ProductCard from '../../components/ProductCard';
import SkeletonLoader from '../../components/SkeletonLoader';
import EmptyState from '../../components/EmptyState';
import productService from '../../services/productService';

const CATEGORIES = ['Electronics', 'Fashion', 'Food', 'Beauty', 'Sports', 'Home', 'Books', 'Toys'];
const SORT_OPTIONS = [
  { label: 'Terbaru', value: 'latest' },
  { label: 'Harga Terendah', value: 'price_asc' },
  { label: 'Harga Tertinggi', value: 'price_desc' },
  { label: 'Rating', value: 'rating' },
];

const RECENT_SEARCHES_KEY = '@recent_searches';

const SearchScreen = ({ navigation }) => {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMoreLoading, setIsMoreLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSort, setSelectedSort] = useState('latest');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [recentSearches, setRecentSearches] = useState([]);

  const inputRef = useRef(null);
  const debounceTimer = useRef(null);

  // Auto focus input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 500); // Give some time for animation to finish
    return () => clearTimeout(timer);
  }, []);

  // Load recent searches
  useEffect(() => {
    loadRecentSearches();
  }, []);

  const loadRecentSearches = async () => {
    try {
      const stored = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading recent searches:', error);
    }
  };

  const saveRecentSearch = async (query) => {
    if (!query.trim()) return;
    try {
      let updated = [query, ...recentSearches.filter(s => s !== query)];
      updated = updated.slice(0, 5); // Keep last 5
      setRecentSearches(updated);
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving recent search:', error);
    }
  };

  const performSearch = async (searchKeyword, category, sort, pageNum = 1, shouldAppend = false) => {
    if (!searchKeyword.trim() && !category) {
      setResults([]);
      return;
    }

    try {
      if (pageNum === 1) setIsLoading(true);
      else setIsMoreLoading(true);

      const params = {
        q: searchKeyword,
        category: category,
        sort: sort,
        page: pageNum,
        limit: 10
      };

      const response = await productService.searchProducts(params);
      const newResults = response.data?.products || [];

      if (shouldAppend) {
        setResults(prev => [...prev, ...newResults]);
      } else {
        setResults(newResults);
      }

      const pagination = response.data?.pagination || {};
      setHasMore(newResults.length > 0 && pagination.page < pagination.totalPages);
      setPage(pageNum);

      if (pageNum === 1 && searchKeyword.trim()) {
        saveRecentSearch(searchKeyword);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
      setIsMoreLoading(false);
    }
  };

  // Handle keyword change with debounce
  const handleKeywordChange = (text) => {
    setKeyword(text);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(() => {
      performSearch(text, selectedCategory, selectedSort, 1, false);
    }, 500);
  };

  const handleCategoryPress = (category) => {
    const newCategory = selectedCategory === category ? null : category;
    setSelectedCategory(newCategory);
    performSearch(keyword, newCategory, selectedSort, 1, false);
  };

  const handleSortPress = (sortValue) => {
    setSelectedSort(sortValue);
    performSearch(keyword, selectedCategory, sortValue, 1, false);
  };

  const loadMore = () => {
    if (!isLoading && !isMoreLoading && hasMore) {
      performSearch(keyword, selectedCategory, selectedSort, page + 1, true);
    }
  };

  const handleRecentSearchPress = (query) => {
    setKeyword(query);
    performSearch(query, selectedCategory, selectedSort, 1, false);
    Keyboard.dismiss();
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color={Colors.textSecondary} />
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder="Cari produk..."
          value={keyword}
          onChangeText={handleKeywordChange}
          returnKeyType="search"
          onSubmitEditing={() => performSearch(keyword, selectedCategory, selectedSort, 1, false)}
        />
        {keyword.length > 0 && (
          <TouchableOpacity onPress={() => handleKeywordChange('')}>
            <Ionicons name="close-circle" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.cancelText}>Batal</Text>
      </TouchableOpacity>
    </View>
  );

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[styles.filterChip, selectedCategory === cat && styles.filterChipActive]}
            onPress={() => handleCategoryPress(cat)}
          >
            <Text style={[styles.filterText, selectedCategory === cat && styles.filterTextActive]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
        {SORT_OPTIONS.map(opt => (
          <TouchableOpacity
            key={opt.value}
            style={[styles.sortChip, selectedSort === opt.value && styles.sortChipActive]}
            onPress={() => handleSortPress(opt.value)}
          >
            <Text style={[styles.sortText, selectedSort === opt.value && styles.sortTextActive]}>{opt.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderRecentSearches = () => {
    if (keyword.length > 0 || results.length > 0 || isLoading) return null;
    if (recentSearches.length === 0) return null;

    return (
      <View style={styles.recentContainer}>
        <View style={styles.recentHeader}>
          <Text style={styles.recentTitle}>Pencarian Terakhir</Text>
          <TouchableOpacity onPress={async () => {
            await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
            setRecentSearches([]);
          }}>
            <Ionicons name="trash-outline" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
        <View style={styles.recentList}>
          {recentSearches.map((s, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.recentChip}
              onPress={() => handleRecentSearchPress(s)}
            >
              <Text style={styles.recentChipText}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {renderHeader()}
      {renderFilters()}

      {isLoading ? (
        <View style={{ padding: 16 }}>
          <SkeletonLoader />
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <ProductCard
                product={item}
                onPress={() => navigation.navigate('ProductDetail', { product: item })}
              />
            </View>
          )}
          ListHeaderComponent={renderRecentSearches}
          ListEmptyComponent={
            !isLoading && keyword.length > 0 ? (
              <EmptyState
                title="Produk tidak ditemukan 😔"
                message="Coba kata kunci lain atau filter kategori berbeda."
              />
            ) : null
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isMoreLoading ? (
              <ActivityIndicator size="small" color={Colors.primary} style={{ marginVertical: 20 }} />
            ) : <View style={{ height: 20 }} />
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
    padding: 16,
    gap: 12,
    backgroundColor: Colors.surface,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: Colors.text,
  },
  cancelText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 16,
  },
  filtersContainer: {
    backgroundColor: Colors.surface,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterScroll: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  filterTextActive: {
    color: Colors.surface,
    fontWeight: 'bold',
  },
  sortChip: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: Colors.background,
  },
  sortChipActive: {
    backgroundColor: '#E0E7FF',
  },
  sortText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  sortTextActive: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  row: {
    justifyContent: 'space-between',
  },
  cardWrapper: {
    width: '48%',
    marginBottom: 16,
  },
  recentContainer: {
    paddingVertical: 16,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  recentList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  recentChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  recentChipText: {
    fontSize: 14,
    color: Colors.text,
  },
});

export default SearchScreen;
