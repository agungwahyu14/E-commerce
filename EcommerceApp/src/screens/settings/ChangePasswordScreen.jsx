import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useAppModal } from '../../hooks/useAppModal';
import profileService from '../../services/profileService';

const ChangePasswordScreen = ({ navigation }) => {
  const { showModal } = useAppModal();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!currentPassword) newErrors.currentPassword = 'Kata sandi saat ini wajib diisi';
    
    if (!newPassword) {
      newErrors.newPassword = 'Kata sandi baru wajib diisi';
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'Kata sandi minimal 8 karakter';
    } else if (!/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      newErrors.newPassword = 'Harus mengandung huruf besar dan angka';
    }
    
    if (confirmPassword !== newPassword) {
      newErrors.confirmPassword = 'Konfirmasi kata sandi tidak cocok';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      await profileService.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      
      showModal({
        type: 'success',
        title: 'Berhasil',
        message: 'Kata sandi berhasil diubah',
        onConfirm: () => navigation.goBack()
      });
    } catch (error) {
      console.error('Change password error:', error);
      if (error.response?.status === 401) {
        setErrors({ currentPassword: 'Kata sandi saat ini tidak benar' });
      } else {
        showModal({
          type: 'error',
          title: 'Gagal',
          message: error.response?.data?.message || 'Terjadi kesalahan saat mengubah kata sandi'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderInput = (label, value, setValue, show, setShow, errorKey) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={[
        styles.inputWrapper,
        errors[errorKey] && styles.inputError
      ]}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={(text) => {
            setValue(text);
            if (errors[errorKey]) {
              setErrors({ ...errors, [errorKey]: null });
            }
          }}
          secureTextEntry={!show}
          placeholder={`Masukkan ${label.toLowerCase()}`}
          placeholderTextColor={Colors.textSecondary}
        />
        <TouchableOpacity onPress={() => setShow(!show)} style={styles.eyeIcon}>
          <Ionicons name={show ? "eye-off-outline" : "eye-outline"} size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>
      {errors[errorKey] && <Text style={styles.errorText}>{errors[errorKey]}</Text>}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ubah Kata Sandi</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={20} color={Colors.primary} />
            <Text style={styles.infoText}>
              Pastikan kata sandi baru Anda kuat dan belum pernah digunakan sebelumnya.
            </Text>
          </View>

          {renderInput('Kata Sandi Saat Ini', currentPassword, setCurrentPassword, showCurrent, setShowCurrent, 'currentPassword')}
          {renderInput('Kata Sandi Baru', newPassword, setNewPassword, showNew, setShowNew, 'newPassword')}
          {renderInput('Konfirmasi Kata Sandi Baru', confirmPassword, setConfirmPassword, showConfirm, setShowConfirm, 'confirmPassword')}

          <TouchableOpacity
            style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.surface} />
            ) : (
              <Text style={styles.submitBtnText}>Simpan Perubahan</Text>
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
    padding: 24,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(13, 138, 188, 0.05)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 12,
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    height: 52,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
  },
  eyeIcon: {
    padding: 4,
  },
  inputError: {
    borderColor: Colors.error,
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    elevation: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitBtnText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ChangePasswordScreen;
