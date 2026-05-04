import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { useAppModal } from '../../hooks/useAppModal';
import checkoutService from '../../services/checkoutService';
import profileService from '../../services/profileService';
import shippingService from '../../services/shippingService';

const { width, height } = Dimensions.get('window');

const CheckoutScreen = ({ route, navigation }) => {
  const { cartItems, totalAmount } = route.params;
  const { showModal } = useAppModal();

  // Address States
  const [addressType, setAddressType] = useState('profile'); // 'profile' or 'manual'
  const [profileAddress, setProfileAddress] = useState(null);
  const [manualAddress, setManualAddress] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
  });

  // Shipping Data States
  const [allShippingOptions, setAllShippingOptions] = useState([]);
  const [couriers, setCouriers] = useState([]);
  const [selectedCourier, setSelectedCourier] = useState(null);
  const [shippingServices, setShippingServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);

  // Loading States
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingShipping, setIsLoadingShipping] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate total weight (default 500g per product)
  const totalWeight = cartItems.reduce((sum, item) => {
    const weight = item.Product?.weight || item.weight || 500;
    return sum + (weight * item.quantity);
  }, 0);

  useEffect(() => {
    fetchProfileAddress();
    fetchShippingOptions();
  }, []);

  const fetchProfileAddress = async () => {
    try {
      setIsLoadingProfile(true);
      const profile = await profileService.getProfile();
      if (profile && profile.address) {
        setProfileAddress({
          name: profile.name,
          phone: profile.phone,
          address: profile.address,
          city: profile.city,
          province: profile.province,
          postalCode: profile.postalCode,
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const fetchShippingOptions = async () => {
    try {
      setIsLoadingShipping(true);
      const response = await shippingService.getAllShippingOptions(totalWeight);

      // Log untuk debug struktur response
      console.log('RAW SHIPPING RESPONSE:', JSON.stringify(response, null, 2));

      // Handle struktur array kurir dengan nested services
      if (Array.isArray(response) && response[0]?.services) {
        setCouriers(response.map(c => ({
          id: c.id,
          name: c.name,
          logo: c.logo || '📦',
        })));
        setAllShippingOptions(response); // simpan full data untuk filter services
      }
      // Handle flat array
      else if (Array.isArray(response) && response[0]?.courier) {
        const uniqueCouriers = [];
        const seen = new Set();
        response.forEach(item => {
          if (item?.courier && !seen.has(item.courier)) {
            seen.add(item.courier);
            uniqueCouriers.push({
              id: item.courier,
              name: item.courierName || item.courier?.toUpperCase() || item.courier,
            });
          }
        });
        setCouriers(uniqueCouriers);
        setAllShippingOptions(response);
      }
      // Handle unexpected structure
      else {
        console.warn('Unexpected shipping response structure:', response);
        setCouriers([]);
        setAllShippingOptions([]);
      }
    } catch (error) {
      console.error('Error fetching shipping options:', error.message);
      showModal({
        type: 'error',
        title: 'Gagal',
        message: 'Gagal memuat opsi pengiriman.',
      });
    } finally {
      setIsLoadingShipping(false);
    }
  };

  const handleCourierSelect = (courier) => {
    setSelectedCourier(courier);
    setSelectedService(null);

    // Handle nested services structure
    if (allShippingOptions[0]?.services) {
      const courierData = allShippingOptions.find(c => c.id === courier.id);
      setShippingServices(courierData?.services || []);
    }
    // Handle flat array structure
    else {
      const services = allShippingOptions.filter(opt => opt.courier === courier.id);
      setShippingServices(services);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price || 0);
  };

  const handleCheckout = async () => {
    if (isSubmitting) return;

    const currentAddress = addressType === 'profile' ? profileAddress : manualAddress;

    // Validasi alamat
    if (!currentAddress?.address || !currentAddress?.city || !currentAddress?.name) {
      showModal({
        type: 'warning',
        title: 'Alamat Tidak Lengkap',
        message: 'Lengkapi nama penerima, alamat, dan kota pengiriman.',
      });
      return;
    }

    // Validasi kurir
    if (!selectedCourier || !selectedService) {
      showModal({
        type: 'warning',
        title: 'Kurir Belum Dipilih',
        message: 'Pilih kurir dan layanan pengiriman terlebih dahulu.',
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const shippingData = {
        courier: selectedCourier.name,
        service: selectedService.service,
        cost: selectedService.finalPrice || selectedService.cost,
        etd: selectedService.etd || '',
        address: currentAddress.address,
        city: currentAddress.city,
        province: currentAddress.province || '',
        postalCode: currentAddress.postalCode || '',
        receiverName: currentAddress.name,
        receiverPhone: currentAddress.phone || '',
      };

      console.log('[Checkout] shippingData:', JSON.stringify(shippingData, null, 2));

      const result = await checkoutService.createCheckout(
        cartItems,
        'midtrans',
        '',
        shippingData
      );

      if (result?.snapToken) {
        navigation.navigate('MidtransPayment', {
          snapToken: result.snapToken,
          orderId: result.orderId,
        });
      } else {
        throw new Error('snapToken tidak ditemukan di response');
      }
    } catch (error) {
      console.error('Checkout error:', error.message);
      showModal({
        type: 'error',
        title: 'Checkout Gagal',
        message: error.message || 'Gagal memproses pesanan. Coba lagi.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isButtonDisabled = () => {
    if (addressType === 'profile' && !profileAddress) return true;
    if (addressType === 'manual' && (!manualAddress.address || !manualAddress.city || !manualAddress.name)) return true;
    if (!selectedCourier || !selectedService) return true;
    return isSubmitting;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Konfirmasi Pesanan</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Section 1: Alamat Pengiriman */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Alamat Pengiriman</Text>

            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[styles.toggleBtn, addressType === 'profile' && styles.toggleBtnActive]}
                onPress={() => setAddressType('profile')}
              >
                <Text style={[styles.toggleText, addressType === 'profile' && styles.toggleTextActive]}>Alamat Profil</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleBtn, addressType === 'manual' && styles.toggleBtnActive]}
                onPress={() => setAddressType('manual')}
              >
                <Text style={[styles.toggleText, addressType === 'manual' && styles.toggleTextActive]}>Alamat Baru</Text>
              </TouchableOpacity>
            </View>

            {addressType === 'profile' ? (
              isLoadingProfile ? (
                <ActivityIndicator color={Colors.primary} style={{ marginVertical: 20 }} />
              ) : profileAddress ? (
                <View style={styles.addressCard}>
                  <View style={styles.addressHeader}>
                    <Ionicons name="location" size={20} color={Colors.primary} />
                    <Text style={styles.receiverName}>{profileAddress.name}</Text>
                  </View>
                  <Text style={styles.receiverPhone}>{profileAddress.phone}</Text>
                  <Text style={styles.addressText}>{profileAddress.address}</Text>
                  <Text style={styles.addressSubText}>
                    {profileAddress.city}, {profileAddress.province}, {profileAddress.postalCode}
                  </Text>
                </View>
              ) : (
                <View style={styles.emptyAddress}>
                  <Text style={styles.emptyText}>Lengkapi alamat di profil kamu</Text>
                  <TouchableOpacity
                    style={styles.editProfileBtn}
                    onPress={() => navigation.navigate('EditProfile')}
                  >
                    <Text style={styles.editProfileBtnText}>Edit Profil</Text>
                  </TouchableOpacity>
                </View>
              )
            ) : (
              <View style={styles.manualForm}>
                <TextInput
                  style={styles.input}
                  placeholder="Nama Penerima"
                  value={manualAddress.name}
                  onChangeText={(text) => setManualAddress({ ...manualAddress, name: text })}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Nomor Telepon"
                  value={manualAddress.phone}
                  onChangeText={(text) => setManualAddress({ ...manualAddress, phone: text })}
                  keyboardType="phone-pad"
                />
                <View style={styles.row}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="Kota"
                    value={manualAddress.city}
                    onChangeText={(text) => setManualAddress({ ...manualAddress, city: text })}
                  />
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="Provinsi"
                    value={manualAddress.province}
                    onChangeText={(text) => setManualAddress({ ...manualAddress, province: text })}
                  />
                </View>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Alamat Lengkap (Jalan, No. Rumah, RT/RW)"
                  value={manualAddress.address}
                  onChangeText={(text) => setManualAddress({ ...manualAddress, address: text })}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Kode Pos"
                  value={manualAddress.postalCode}
                  onChangeText={(text) => setManualAddress({ ...manualAddress, postalCode: text })}
                  keyboardType="number-pad"
                />
              </View>
            )}
          </View>

          {/* Section 2: Pilih Kurir & Layanan */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pilih Kurir & Layanan</Text>
            {isLoadingShipping ? (
              <ActivityIndicator color={Colors.primary} style={{ marginVertical: 10 }} />
            ) : (
              <>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.courierScroll}>
                  {couriers.map((courier) => (
                    <TouchableOpacity
                      key={courier.id}
                      style={[styles.courierChip, selectedCourier?.id === courier.id && styles.courierChipActive]}
                      onPress={() => handleCourierSelect(courier)}
                    >
                      <Text style={[styles.courierChipText, selectedCourier?.id === courier.id && styles.courierChipTextActive]}>
                        {courier.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {!selectedCourier ? (
                  <Text style={styles.infoText}>Pilih kurir untuk melihat opsi pengiriman</Text>
                ) : shippingServices.length > 0 ? (
                  <View style={styles.servicesList}>
                    {shippingServices.map((item, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[styles.serviceCard, selectedService === item && styles.serviceCardActive]}
                        onPress={() => setSelectedService(item)}
                      >
                        <View style={styles.serviceInfo}>
                          <Text style={styles.serviceName}>{item.service} {item.name ? `(${item.name})` : ''}</Text>
                          <Text style={styles.serviceEtd}>Estimasi: {item.etd} </Text>
                        </View>
                        <Text style={styles.servicePrice}>{formatPrice(item.finalPrice || item.cost)}</Text>
                        <Ionicons
                          name={selectedService === item ? "radio-button-on" : "radio-button-off"}
                          size={20}
                          color={selectedService === item ? Colors.primary : Colors.border}
                          style={{ marginLeft: 12 }}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.errorText}>Layanan tidak tersedia</Text>
                )}
              </>
            )}
          </View>

          {/* Section 3: Ringkasan Pesanan */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Ringkasan Pesanan</Text>
              <Text style={styles.weightText}>Total Berat: {(totalWeight / 1000).toFixed(1)}kg</Text>
            </View>
            {cartItems.map((item) => (
              <View key={item.id} style={styles.itemRow}>
                <Image
                  source={{ uri: item.Product?.image_url || item.image_url || 'https://via.placeholder.com/150' }}
                  style={styles.itemImage}
                />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName} numberOfLines={1}>{item.Product?.name || item.name}</Text>
                  <Text style={styles.itemQty}>{item.quantity} x {formatPrice(item.Product?.price || item.price)}</Text>
                </View>
                <Text style={styles.itemSubtotal}>
                  {formatPrice((item.Product?.price || item.price) * item.quantity)}
                </Text>
              </View>
            ))}
          </View>

          {/* Section 4: Ringkasan Pembayaran */}
          <View style={styles.summaryBox}>
            <Text style={styles.summaryTitle}>Ringkasan Pembayaran</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal Produk</Text>
              <Text style={styles.summaryValue}>{formatPrice(totalAmount)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                Ongkos Kirim {selectedCourier && `(${selectedCourier.name} ${selectedService?.service || ''})`}
              </Text>
              <Text style={styles.summaryValue}>
                {selectedService ? formatPrice(selectedService.finalPrice || selectedService.cost) : '-'}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total Pembayaran</Text>
              <Text style={styles.totalValue}>
                {formatPrice(totalAmount + (selectedService?.finalPrice || selectedService?.cost || 0))}
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.payButton, isButtonDisabled() && styles.disabledButton]}
            onPress={handleCheckout}
            disabled={isButtonDisabled()}
          >
            {isSubmitting ? (
              <ActivityIndicator color={Colors.surface} />
            ) : (
              <>
                <Text style={styles.payButtonText}>Lanjut Pembayaran</Text>
                <Ionicons name="chevron-forward" size={20} color={Colors.surface} />
              </>
            )}
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  backBtn: {
    padding: 4,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  toggleBtnActive: {
    backgroundColor: Colors.surface,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  toggleText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: Colors.primary,
  },
  addressCard: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  receiverName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  receiverPhone: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  addressSubText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  emptyAddress: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFF1F1',
    borderRadius: 16,
  },
  emptyText: {
    color: Colors.error,
    marginBottom: 12,
  },
  editProfileBtn: {
    backgroundColor: Colors.error,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editProfileBtnText: {
    color: Colors.surface,
    fontWeight: 'bold',
  },
  manualForm: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    fontSize: 14,
  },
  textArea: {
    height: 80,
  },
  courierScroll: {
    marginBottom: 16,
  },
  courierChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 10,
  },
  courierChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  courierChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  courierChipTextActive: {
    color: Colors.surface,
  },
  servicesList: {
    gap: 12,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  serviceCardActive: {
    borderColor: Colors.primary,
    backgroundColor: '#F0F7FF',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
  },
  serviceEtd: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  servicePrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  infoText: {
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: 14,
    marginTop: 10,
    fontStyle: 'italic',
  },
  errorText: {
    textAlign: 'center',
    color: Colors.error,
    fontSize: 14,
    marginTop: 10,
  },
  weightText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: Colors.background,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  itemQty: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  itemSubtotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
  },
  summaryBox: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    color: Colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  footer: {
    padding: 16,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  payButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  disabledButton: {
    backgroundColor: Colors.border,
  },
  payButtonText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CheckoutScreen;
