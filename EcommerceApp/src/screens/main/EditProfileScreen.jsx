import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { useAuth } from '../../hooks/useAuth';
import { useAppModal } from '../../hooks/useAppModal';
import profileService from '../../services/profileService';

const EditProfileScreen = ({ navigation, route }) => {
  const { user, updateUserState } = useAuth();
  const { showModal } = useAppModal();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(user?.avatar_url || null);
  
  // New location states
  const [latitude, setLatitude] = useState(user?.latitude || null);
  const [longitude, setLongitude] = useState(user?.longitude || null);
  const [city, setCity] = useState(user?.city || '');
  const [province, setProvince] = useState(user?.province || '');
  const [postalCode, setPostalCode] = useState(user?.postalCode || '');

  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  // Listen for selected location from MapPicker
  useEffect(() => {
    if (route.params?.selectedLocation) {
      const loc = route.params.selectedLocation;
      setAddress(loc.address);
      setLatitude(parseFloat(loc.latitude));
      setLongitude(parseFloat(loc.longitude));
      setCity(loc.city);
      setProvince(loc.province);
      if (loc.postalCode) setPostalCode(loc.postalCode);

      // Clear params to avoid re-triggering
      navigation.setParams({ selectedLocation: undefined });
    }
  }, [route.params?.selectedLocation]);

  const fetchProfile = async () => {
    try {
      const data = await profileService.getProfile();
      setName(data.name || user?.name);
      setPhone(data.phone || user?.phone || '');
      setAddress(data.address || user?.address || '');
      setBio(data.bio || user?.bio || '');
      setLatitude(data.latitude ? parseFloat(data.latitude) : null);
      setLongitude(data.longitude ? parseFloat(data.longitude) : null);
      setCity(data.city || user?.city || '');
      setProvince(data.province || user?.province || '');
      setPostalCode(data.postalCode || user?.postalCode || '');
      
      if (data.avatar_url) setAvatar(data.avatar_url);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handlePickImage = async (useCamera = false) => {
    try {
      const permissionResult = useCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        showModal({
          type: 'warning',
          title: 'Izin Ditolak',
          message: `Aplikasi membutuhkan izin untuk mengakses ${useCamera ? 'kamera' : 'galeri'} Anda.`
        });
        return;
      }

      const result = useCamera
        ? await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.7,
        })
        : await ImagePicker.launchImageLibraryAsync({
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.7,
        });

      if (!result.canceled) {
        const selectedUri = result.assets[0].uri;
        setAvatar(selectedUri); // Optimistic UI update
        handleUploadAvatar(selectedUri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      showModal({
        type: 'error',
        title: 'Error',
        message: 'Gagal memilih gambar.'
      });
    }
  };

  const showImagePickerOptions = () => {
    showModal({
      type: 'confirm',
      title: 'Ubah Foto Profil',
      message: 'Pilih sumber gambar',
      confirmText: 'Kamera',
      cancelText: 'Galeri',
      onConfirm: () => handlePickImage(true),
      onCancel: () => handlePickImage(false)
    });
  };

  const handleUploadAvatar = async (uri) => {
    try {
      setIsUploading(true);
      const response = await profileService.uploadAvatar(uri);
      if (response.success && response.data.avatar_url) {
        updateUserState({ avatar_url: response.data.avatar_url });
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      showModal({
        type: 'error',
        title: 'Gagal',
        message: 'Gagal mengunggah foto profil.'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const openMapPicker = () => {
    // Navigate without callback function
    navigation.navigate('MapPicker', {
      initialLocation: latitude && longitude ? { 
        latitude: parseFloat(latitude), 
        longitude: parseFloat(longitude) 
      } : null,
    });
  };

  const handleSave = async () => {
    if (!name.trim()) {
      showModal({
        type: 'warning',
        title: 'Error',
        message: 'Nama harus diisi.'
      });
      return;
    }

    try {
      setIsSaving(true);
      const profileData = {
        name,
        phone,
        address,
        bio,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        city,
        province,
        postalCode
      };
      const response = await profileService.updateProfile(profileData);

      if (response.success) {
        updateUserState(profileData);
        showModal({
          type: 'success',
          title: 'Berhasil',
          message: 'Profil berhasil diperbarui!',
          onConfirm: () => navigation.goBack()
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showModal({
        type: 'error',
        title: 'Error',
        message: 'Gagal memperbarui profil.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profil</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrapper}>
              <Image
                source={{ uri: avatar || 'https://ui-avatars.com/api/?name=' + (user?.name || 'User') + '&background=0D8ABC&color=fff&size=128' }}
                style={styles.avatar}
              />
              {isUploading && (
                <View style={styles.uploadLoadingOverlay}>
                  <ActivityIndicator color={Colors.surface} />
                </View>
              )}
              <TouchableOpacity style={styles.editBadge} onPress={showImagePickerOptions}>
                <Ionicons name="camera" size={18} color={Colors.surface} />
              </TouchableOpacity>
            </View>
            <Text style={styles.avatarNote}>Tekan untuk mengubah foto profil</Text>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Informasi Dasar</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nama Lengkap</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Masukkan nama lengkap"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nomor HP</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="08123xxx"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Bio</Text>
                <Text style={styles.charCounter}>{bio.length}/150</Text>
              </View>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={bio}
                onChangeText={setBio}
                placeholder="Ceritakan sedikit tentang Anda"
                multiline
                numberOfLines={4}
                maxLength={150}
                textAlignVertical="top"
              />
            </View>

            <Text style={[styles.sectionTitle, { marginTop: 10 }]}>Alamat & Lokasi</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Pilih Lokasi</Text>
              <TouchableOpacity style={styles.mapBtn} onPress={openMapPicker}>
                <Ionicons name="map-outline" size={20} color={Colors.primary} />
                <Text style={styles.mapBtnText}>Pilih Lokasi di Peta 📍</Text>
              </TouchableOpacity>
              
              {address ? (
                <View style={styles.addressPreview}>
                  <Text style={styles.addressPreviewLabel}>Alamat Terpilih:</Text>
                  <Text style={styles.addressPreviewText}>{address}</Text>
                  <View style={styles.addressMetaRow}>
                    <Text style={styles.addressMetaText}>🏙️ {city || '-'}</Text>
                    <Text style={styles.addressMetaText}>🗺️ {province || '-'}</Text>
                  </View>
                </View>
              ) : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Kode Pos</Text>
              <TextInput
                style={styles.input}
                value={postalCode}
                onChangeText={setPostalCode}
                placeholder="Contoh: 12345"
                keyboardType="number-pad"
                maxLength={5}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color={Colors.surface} />
            ) : (
              <Text style={styles.saveBtnText}>Simpan Perubahan</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: Colors.background,
  },
  uploadLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.surface,
  },
  avatarNote: {
    marginTop: 12,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  formSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 20,
    marginTop: 10,
  },
  inputGroup: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  charCounter: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  mapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F7FF',
    borderWidth: 1,
    borderColor: '#D0E7FF',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  mapBtnText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  addressPreview: {
    marginTop: 12,
    padding: 16,
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  addressPreviewLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  addressPreviewText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  addressMetaRow: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 12,
  },
  addressMetaText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  saveBtnDisabled: {
    opacity: 0.7,
  },
  saveBtnText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditProfileScreen;
