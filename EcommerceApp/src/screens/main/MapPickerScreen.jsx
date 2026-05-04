import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Alert,
  Platform,
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';

const { width, height } = Dimensions.get('window');

const MapPickerScreen = ({ navigation, route }) => {
  const mapRef = useRef(null);
  const [region, setRegion] = useState({
    latitude: -6.200000,
    longitude: 106.816666,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  });
  const [markerPosition, setMarkerPosition] = useState({
    latitude: -6.200000,
    longitude: 106.816666,
  });
  const [addressData, setAddressData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);

  useEffect(() => {
    // If initial coordinates are passed, use them
    if (route.params?.initialLocation) {
      const { latitude, longitude } = route.params.initialLocation;
      const lat = parseFloat(latitude);
      const lon = parseFloat(longitude);
      
      const newRegion = {
        latitude: isNaN(lat) ? -6.200000 : lat,
        longitude: isNaN(lon) ? 106.816666 : lon,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };
      setRegion(newRegion);
      setMarkerPosition({ 
        latitude: newRegion.latitude, 
        longitude: newRegion.longitude 
      });
      fetchAddress(newRegion.latitude, newRegion.longitude);
    } else {
      getCurrentLocation();
    }
  }, []);

  const getCurrentLocation = async () => {
    try {
      setIsLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Izin Ditolak', 'Aplikasi membutuhkan akses lokasi untuk fitur ini.');
        setIsLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = location.coords;
      const lat = parseFloat(latitude);
      const lon = parseFloat(longitude);

      const newRegion = {
        latitude: lat,
        longitude: lon,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };

      setRegion(newRegion);
      setMarkerPosition({ latitude: lat, longitude: lon });
      mapRef.current?.animateToRegion(newRegion, 1000);
      fetchAddress(lat, lon);
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Gagal mendapatkan lokasi Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAddress = async (lat, lon) => {
    try {
      setIsReverseGeocoding(true);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'EcommerceApp/1.0',
          },
        }
      );
      const data = await response.json();
      
      if (data) {
        const extracted = {
          address: data.display_name,
          city: data.address.city || data.address.town || data.address.village || '',
          province: data.address.state || '',
          postalCode: data.address.postcode || '',
          latitude: parseFloat(lat),
          longitude: parseFloat(lon),
        };
        setAddressData(extracted);
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    } finally {
      setIsReverseGeocoding(false);
    }
  };

  const handleMapPress = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    setMarkerPosition({ latitude: lat, longitude: lon });
    fetchAddress(lat, lon);
  };

  const handleConfirm = () => {
    if (!addressData) {
      Alert.alert('Peringatan', 'Mohon tunggu hingga alamat terdeteksi atau pilih lokasi lain.');
      return;
    }
    
    // Navigate back with data instead of using callback
    navigation.navigate('EditProfile', {
      selectedLocation: {
        address: addressData.address,
        latitude: parseFloat(addressData.latitude),
        longitude: parseFloat(addressData.longitude),
        city: addressData.city,
        province: addressData.province,
        postalCode: addressData.postalCode,
      }
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="close" size={28} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pilih Lokasi</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_DEFAULT}
          initialRegion={region}
          onPress={handleMapPress}
        >
          <Marker coordinate={markerPosition} />
        </MapView>

        <TouchableOpacity 
          style={styles.myLocationBtn} 
          onPress={getCurrentLocation}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={Colors.primary} />
          ) : (
            <Ionicons name="locate" size={24} color={Colors.primary} />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.addressCard}>
        <Text style={styles.cardTitle}>Detail Lokasi</Text>
        
        {isReverseGeocoding ? (
          <View style={styles.loadingAddress}>
            <ActivityIndicator color={Colors.primary} />
            <Text style={styles.loadingText}>Mencari alamat...</Text>
          </View>
        ) : addressData ? (
          <View style={styles.addressInfo}>
            <Text style={styles.addressText} numberOfLines={2}>{addressData.address}</Text>
            <View style={styles.locationDetails}>
              <View style={styles.detailItem}>
                <Ionicons name="business" size={16} color={Colors.textSecondary} />
                <Text style={styles.detailText}>{addressData.city || '-'}</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="map" size={16} color={Colors.textSecondary} />
                <Text style={styles.detailText}>{addressData.province || '-'}</Text>
              </View>
            </View>
            <Text style={styles.coordText}>
              {parseFloat(addressData.latitude).toFixed(6)}, {parseFloat(addressData.longitude).toFixed(6)}
            </Text>
          </View>
        ) : (
          <Text style={styles.placeholderText}>Ketuk pada peta untuk memilih lokasi</Text>
        )}

        <TouchableOpacity 
          style={[styles.confirmBtn, !addressData && styles.disabledBtn]} 
          onPress={handleConfirm}
          disabled={!addressData}
        >
          <Text style={styles.confirmBtnText}>Konfirmasi Lokasi Ini ✅</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  myLocationBtn: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: Colors.surface,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  addressCard: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.textSecondary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  addressInfo: {
    marginBottom: 20,
  },
  addressText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    lineHeight: 22,
    marginBottom: 10,
  },
  locationDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  coordText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  loadingAddress: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  placeholderText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginVertical: 30,
    fontStyle: 'italic',
  },
  confirmBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  disabledBtn: {
    backgroundColor: Colors.border,
    elevation: 0,
    shadowOpacity: 0,
  },
  confirmBtnText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MapPickerScreen;
