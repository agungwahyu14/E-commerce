import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../../constants/colors';
import chatbotService from '../../services/chatbotService';

const CHAT_HISTORY_KEY = '@chat_history';
const MAX_HISTORY = 50;

const ChatbotScreen = ({ navigation }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const flatListRef = useRef(null);

  // Initial Load
  useEffect(() => {
    loadChatHistory();
  }, []);

  const loadChatHistory = async () => {
    try {
      const history = await AsyncStorage.getItem(CHAT_HISTORY_KEY);
      if (history) {
        setMessages(JSON.parse(history));
      } else {
        // Initial Greeting
        const welcomeMsg = {
          id: Date.now().toString(),
          text: 'Halo! Saya Asisten Belanja Anda 🤖. Ada yang bisa saya bantu hari ini?',
          sender: 'bot',
          type: 'greeting',
          timestamp: new Date().toISOString(),
        };
        setMessages([welcomeMsg]);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const saveChatHistory = async (newMessages) => {
    try {
      const historyToSave = newMessages.slice(-MAX_HISTORY);
      await AsyncStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(historyToSave));
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  };

  const handleSend = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputText('');
    setSuggestions([]);
    setIsLoading(true);

    // Scroll to end after state update
    setTimeout(() => flatListRef.current?.scrollToEnd(), 100);

    try {
      const response = await chatbotService.sendMessage(text);
      const botMsg = {
        id: (Date.now() + 1).toString(),
        text: response.data.message || 'Maaf, saya sedang tidak bisa memproses permintaan Anda.',
        sender: 'bot',
        type: response.data.type || 'text',
        products: response.data.products,
        orders: response.data.orders,
        timestamp: new Date().toISOString(),
      };

      const finalMessages = [...updatedMessages, botMsg];
      setMessages(finalMessages);
      saveChatHistory(finalMessages);

      // Set contextual suggestions
      if (botMsg.type === 'products') {
        setSuggestions(['Lihat Semua ➜', 'Filter Harga 💰']);
      } else if (botMsg.type === 'orders') {
        setSuggestions(['Detail Pesanan ➜', 'Lacak Paket 🚚']);
      } else {
        setSuggestions(['Rekomendasi Produk ⭐', 'Cek Pesanan 📦']);
      }

    } catch (error) {
      console.error('Send message error:', error);
    } finally {
      setIsLoading(false);
      setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
    }
  };

  const renderMessage = ({ item }) => {
    const isBot = item.sender === 'bot';
    const time = new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
      <View style={[styles.messageWrapper, isBot ? styles.botWrapper : styles.userWrapper]}>
        {isBot && (
          <View style={styles.botAvatar}>
            <Text style={{ fontSize: 16 }}>🤖</Text>
          </View>
        )}
        <View style={[styles.bubble, isBot ? styles.botBubble : styles.userBubble]}>
          <Text style={[styles.messageText, isBot ? styles.botText : styles.userText]}>
            {item.text}
          </Text>

          {/* Render Special Content */}
          {item.type === 'products' && item.products && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productScroll}>
              {item.products.map((prod) => (
                <TouchableOpacity 
                  key={prod.id} 
                  style={styles.miniProductCard}
                  onPress={() => navigation.navigate('ProductDetail', { product: prod })}
                >
                  <Image 
                    source={{ uri: prod.image_url || prod.image || 'https://via.placeholder.com/150' }} 
                    style={styles.miniProductImage} 
                  />
                  <Text style={styles.miniProductName} numberOfLines={1}>{prod.name}</Text>
                  <Text style={styles.miniProductPrice}>
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(prod.price)}
                  </Text>
                  <TouchableOpacity 
                    style={styles.miniViewBtn}
                    onPress={() => navigation.navigate('ProductDetail', { product: prod })}
                  >
                    <Text style={styles.miniViewBtnText}>Lihat</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {item.type === 'orders' && item.orders && (
            <View style={styles.miniOrderList}>
              {item.orders.map((order) => (
                <TouchableOpacity 
                  key={order.id} 
                  style={styles.miniOrderCard}
                  onPress={() => navigation.navigate('OrderDetail', { orderId: order.id })}
                >
                  <View style={styles.miniOrderHeader}>
                    <Text style={styles.miniOrderId}>#{order.id.substring(0, 8).toUpperCase()}</Text>
                    <View style={[styles.miniStatusBadge, { backgroundColor: order.status === 'delivered' ? '#10B981' : '#F59E0B' }]}>
                      <Text style={styles.miniStatusText}>{order.status}</Text>
                    </View>
                  </View>
                  <Text style={styles.miniOrderDate}>{new Date(order.createdAt).toLocaleDateString()}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {item.type === 'greeting' && (
            <View style={styles.quickReplyContainer}>
              {['Cek Pesanan 📦', 'Rekomendasi Produk ⭐', 'Bantuan ❓'].map((reply) => (
                <TouchableOpacity 
                  key={reply} 
                  style={styles.quickReplyChip}
                  onPress={() => handleSend(reply)}
                >
                  <Text style={styles.quickReplyText}>{reply}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={[styles.timestamp, isBot ? styles.botTime : styles.userTime]}>{time}</Text>
        </View>
      </View>
    );
  };

  const renderTypingIndicator = () => {
    if (!isLoading) return null;
    return (
      <View style={[styles.messageWrapper, styles.botWrapper]}>
        <View style={styles.botAvatar}>
          <Text style={{ fontSize: 16 }}>🤖</Text>
        </View>
        <View style={[styles.bubble, styles.botBubble, { width: 60, paddingVertical: 12 }]}>
          <View style={styles.typingDots}>
            <View style={styles.typingDot} />
            <View style={[styles.typingDot, { marginHorizontal: 4 }]} />
            <View style={styles.typingDot} />
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Asisten Belanja 🤖</Text>
          <View style={styles.statusRow}>
            <View style={styles.onlineDot} />
            <Text style={styles.statusText}>Online</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => {
          setMessages([]);
          AsyncStorage.removeItem(CHAT_HISTORY_KEY);
          loadChatHistory();
        }}>
          <Ionicons name="trash-outline" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.chatList}
          ListFooterComponent={renderTypingIndicator}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        />

        {/* Suggestion Chips */}
        {suggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
              {suggestions.map((s) => (
                <TouchableOpacity 
                  key={s} 
                  style={styles.suggestionChip}
                  onPress={() => handleSend(s)}
                >
                  <Text style={styles.suggestionText}>{s}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Input Area */}
        <View style={styles.inputArea}>
          <TextInput
            style={styles.input}
            placeholder="Ketik pesan..."
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity 
            style={[styles.sendBtn, (!inputText.trim() || isLoading) && styles.sendBtnDisabled]}
            onPress={() => handleSend()}
            disabled={!inputText.trim() || isLoading}
          >
            <Ionicons name="send" size={20} color={Colors.surface} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  chatList: {
    padding: 16,
    paddingBottom: 24,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: 16,
    maxWidth: '85%',
  },
  botWrapper: {
    alignSelf: 'flex-start',
  },
  userWrapper: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  botAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bubble: {
    padding: 12,
    borderRadius: 16,
  },
  botBubble: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 0,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  userBubble: {
    backgroundColor: Colors.primary,
    borderTopRightRadius: 0,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  botText: {
    color: Colors.text,
  },
  userText: {
    color: Colors.surface,
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
  },
  botTime: {
    color: Colors.textSecondary,
    textAlign: 'left',
  },
  userTime: {
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'right',
  },
  productScroll: {
    marginTop: 12,
    flexDirection: 'row',
  },
  miniProductCard: {
    width: 120,
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  miniProductImage: {
    width: '100%',
    height: 80,
    borderRadius: 8,
    marginBottom: 6,
  },
  miniProductName: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
  },
  miniProductPrice: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: 'bold',
    marginTop: 2,
  },
  miniViewBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 6,
    alignItems: 'center',
  },
  miniViewBtnText: {
    color: Colors.surface,
    fontSize: 10,
    fontWeight: 'bold',
  },
  miniOrderList: {
    marginTop: 12,
    gap: 8,
  },
  miniOrderCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  miniOrderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  miniOrderId: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.text,
  },
  miniStatusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  miniStatusText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  miniOrderDate: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  quickReplyContainer: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickReplyChip: {
    backgroundColor: Colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  quickReplyText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  suggestionsContainer: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  suggestionChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  suggestionText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    fontSize: 14,
    color: Colors.text,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
  typingDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.textSecondary,
    opacity: 0.5,
  },
});

export default ChatbotScreen;
