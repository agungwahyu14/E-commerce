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

const EditProfileScreen = ({ navigation }) => {
  const { user, updateUserState } = useAuth();
  const { showModal } = useAppModal();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(user?.avatar_url || null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await profileService.getProfile();
      setName(data.name || user?.name);
      setPhone(data.phone || user?.phone || '');
      setAddress(data.address || user?.address || '');
      setBio(data.bio || user?.bio || '');
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
        // Update global auth state so changes reflect immediately everywhere
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
        bio
      };
      const response = await profileService.updateProfile(profileData);

      if (response.success) {
        // Update global state with all new data
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
              <Text style={styles.label}>Alamat Lengkap</Text>
              <TextInput
                style={[styles.input, styles.textArea, { height: 80 }]}
                value={address}
                onChangeText={setAddress}
                placeholder="Jl. Contoh No. 123..."
                multiline
                numberOfLines={3}
                textAlignVertical="top"
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
  headerContainer: {
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  avatarNote: {
    marginTop: 12,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  formSection: {
    paddingHorizontal: 20,
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
