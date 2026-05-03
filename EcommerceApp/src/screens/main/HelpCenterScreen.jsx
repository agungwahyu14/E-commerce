import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Animated,
  Linking,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import helpService from '../../services/helpService';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const CATEGORIES = [
  { id: 'Pesanan', label: 'Pesanan', icon: '📦' },
  { id: 'Pembayaran', label: 'Pembayaran', icon: '💳' },
  { id: 'Pengiriman', label: 'Pengiriman', icon: '🚚' },
  { id: 'Akun', label: 'Akun', icon: '👤' },
];

const AccordionItem = ({ question, answer }) => {
  const [expanded, setExpanded] = useState(false);
  const animationValue = useRef(new Animated.Value(0)).current;

  const toggleAccordion = () => {
    const config = {
      duration: 300,
      create: { type: 'easeInEaseOut', property: 'opacity' },
      update: { type: 'easeInEaseOut' },
      delete: { type: 'easeInEaseOut', property: 'opacity' },
    };
    LayoutAnimation.configureNext(config);
    setExpanded(!expanded);
    
    Animated.timing(animationValue, {
      toValue: expanded ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  return (
    <View style={styles.accordionCard}>
      <TouchableOpacity 
        style={styles.accordionHeader} 
        onPress={toggleAccordion}
        activeOpacity={0.7}
      >
        <Text style={styles.questionText}>{question}</Text>
        <Ionicons 
          name={expanded ? "chevron-up" : "chevron-down"} 
          size={20} 
          color={Colors.textSecondary} 
        />
      </TouchableOpacity>
      {expanded && (
        <View style={styles.accordionBody}>
          <Text style={styles.answerText}>{answer}</Text>
        </View>
      )}
    </View>
  );
};

const HelpCenterScreen = ({ navigation }) => {
  const [faqs, setFaqs] = useState([]);
  const [filteredFaqs, setFilteredFaqs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);
  const [contactInfo, setContactInfo] = useState({
    whatsapp: '628123456789',
    email: 'support@ecommerce.com',
    phone: '+628123456789'
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterFaqs();
  }, [searchQuery, activeCategory, faqs]);

  const fetchData = async () => {
    try {
      const faqData = await helpService.getFAQs();
      const contactData = await helpService.getContactInfo();
      setFaqs(faqData || []);
      setContactInfo(contactData);
    } catch (error) {
      console.error('Fetch help data error:', error);
    }
  };

  const filterFaqs = () => {
    let result = faqs;
    if (activeCategory) {
      result = result.filter(f => f.category === activeCategory);
    }
    if (searchQuery) {
      result = result.filter(f => 
        f.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.a.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredFaqs(result);
  };

  const handleContact = (type) => {
    switch (type) {
      case 'whatsapp':
        Linking.openURL(`whatsapp://send?phone=${contactInfo.whatsapp}&text=Halo support, saya butuh bantuan.`);
        break;
      case 'email':
        Linking.openURL(`mailto:${contactInfo.email}`);
        break;
      case 'phone':
        Linking.openURL(`tel:${contactInfo.phone}`);
        break;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header Navigation */}
      <View style={styles.headerNav}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerNavTitle}>Pusat Bantuan</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Banner Section */}
        <View style={styles.banner}>
          <Text style={styles.bannerEmoji}>🎧</Text>
          <Text style={styles.bannerTitle}>Ada yang bisa kami bantu?</Text>
          <Text style={styles.bannerSubtitle}>Cari jawaban dari pertanyaan Anda di bawah ini</Text>
        </View>

        {/* Search Section */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={Colors.textSecondary} />
            <TextInput 
              placeholder="Cari kata kunci bantuan..." 
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Category Grid */}
        <View style={styles.categoryGrid}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity 
              key={cat.id} 
              style={[
                styles.categoryCard, 
                activeCategory === cat.id && styles.categoryCardActive
              ]}
              onPress={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
            >
              <Text style={styles.categoryIcon}>{cat.icon}</Text>
              <Text style={[
                styles.categoryLabel,
                activeCategory === cat.id && styles.categoryLabelActive
              ]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* FAQ List */}
        <View style={styles.faqSection}>
          <Text style={styles.sectionTitle}>Pertanyaan Populer</Text>
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq) => (
              <AccordionItem key={faq.id} question={faq.q} answer={faq.a} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Tidak ditemukan hasil untuk "{searchQuery}"</Text>
            </View>
          )}
        </View>

        {/* Contact Section */}
        <View style={styles.contactSection}>
          <Text style={styles.contactHeaderTitle}>Masih butuh bantuan?</Text>
          <Text style={styles.contactHeaderSubtitle}>Hubungi tim kami melalui jalur di bawah ini</Text>
          
          <View style={styles.contactButtons}>
            <ContactButton 
              icon="logo-whatsapp" 
              label="Chat WhatsApp" 
              color="#25D366" 
              onPress={() => handleContact('whatsapp')} 
            />
            <ContactButton 
              icon="mail-outline" 
              label="Email Kami" 
              color={Colors.primary} 
              onPress={() => handleContact('email')} 
            />
            <ContactButton 
              icon="call-outline" 
              label="Telepon" 
              color="#475569" 
              onPress={() => handleContact('phone')} 
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const ContactButton = ({ icon, label, color, onPress }) => (
  <TouchableOpacity 
    style={[styles.contactBtn, { borderColor: color }]} 
    onPress={onPress}
  >
    <Ionicons name={icon} size={20} color={color} />
    <Text style={[styles.contactBtnLabel, { color: color }]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
  },
  headerNavTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  backBtn: {
    padding: 4,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  banner: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: Colors.surface,
  },
  bannerEmoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginTop: -25,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    height: 54,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: Colors.text,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    marginTop: 20,
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '47%',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryCardActive: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(13, 138, 188, 0.05)',
  },
  categoryIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  categoryLabelActive: {
    color: Colors.primary,
  },
  faqSection: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  accordionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  questionText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
    marginRight: 12,
  },
  accordionBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
  },
  answerText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  contactSection: {
    padding: 24,
    backgroundColor: Colors.surface,
    marginTop: 30,
    borderRadius: 24,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  contactHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  contactHeaderSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
  },
  contactButtons: {
    width: '100%',
    gap: 12,
  },
  contactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 10,
  },
  contactBtnLabel: {
    fontSize: 15,
    fontWeight: 'bold',
  },
});

export default HelpCenterScreen;
