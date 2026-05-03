import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

const TYPES = [
  { id: 'bank', label: 'Bank Transfer', icon: 'business-outline' },
  { id: 'card', label: 'Kartu Kredit', icon: 'card-outline' },
  { id: 'wallet', label: 'E-Wallet', icon: 'wallet-outline' },
];

const PROVIDERS = {
  bank: ['BCA', 'Mandiri', 'BNI', 'BRI'],
  card: ['Visa', 'Mastercard', 'JCB'],
  wallet: ['GoPay', 'OVO', 'DANA', 'ShopeePay'],
};

const AddPaymentMethodModal = ({ visible, onClose, onSave }) => {
  const [type, setType] = useState('bank');
  const [provider, setProvider] = useState('BCA');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!accountNumber || !accountName) {
      alert('Mohon isi semua field');
      return;
    }

    setIsLoading(true);
    try {
      await onSave({
        type,
        provider,
        accountNumber,
        accountName,
        isDefault,
      });
      // Reset form
      setAccountNumber('');
      setAccountName('');
      setIsDefault(false);
      onClose();
    } catch (error) {
      console.error('Save payment method error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContent}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Tambah Metode Pembayaran</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.form}>
            {/* Type Selection */}
            <Text style={styles.label}>Tipe Pembayaran</Text>
            <View style={styles.typeRow}>
              {TYPES.map((t) => (
                <TouchableOpacity
                  key={t.id}
                  style={[styles.typeBtn, type === t.id && styles.typeBtnActive]}
                  onPress={() => {
                    setType(t.id);
                    setProvider(PROVIDERS[t.id][0]);
                  }}
                >
                  <Ionicons 
                    name={t.icon} 
                    size={20} 
                    color={type === t.id ? Colors.surface : Colors.textSecondary} 
                  />
                  <Text style={[styles.typeLabel, type === t.id && styles.typeLabelActive]}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Provider Selection */}
            <Text style={styles.label}>Pilih Provider</Text>
            <View style={styles.providerRow}>
              {PROVIDERS[type].map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[styles.providerChip, provider === p && styles.providerChipActive]}
                  onPress={() => setProvider(p)}
                >
                  <Text style={[styles.providerText, provider === p && styles.providerTextActive]}>
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Account Number */}
            <Text style={styles.label}>
              {type === 'card' ? 'Nomor Kartu' : 'Nomor Akun / VA'}
            </Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="apps-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="0000 0000 0000 0000"
                value={accountNumber}
                onChangeText={setAccountNumber}
                keyboardType="numeric"
              />
            </View>

            {/* Account Name */}
            <Text style={styles.label}>Nama Pemilik</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Masukkan nama sesuai akun"
                value={accountName}
                onChangeText={setAccountName}
                autoCapitalize="words"
              />
            </View>

            {/* Default Toggle */}
            <View style={styles.defaultRow}>
              <View>
                <Text style={styles.defaultTitle}>Jadikan Utama</Text>
                <Text style={styles.defaultDesc}>Gunakan sebagai metode pembayaran utama</Text>
              </View>
              <Switch
                value={isDefault}
                onValueChange={setIsDefault}
                trackColor={{ false: '#CBD5E1', true: Colors.primary }}
                thumbColor={Platform.OS === 'ios' ? undefined : Colors.surface}
              />
            </View>

            <TouchableOpacity 
              style={[styles.saveBtn, isLoading && styles.saveBtnDisabled]} 
              onPress={handleSave}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={Colors.surface} />
              ) : (
                <Text style={styles.saveBtnText}>Simpan Metode</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: '70%',
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  closeBtn: {
    padding: 4,
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
    marginTop: 16,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  typeBtn: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    gap: 4,
  },
  typeBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  typeLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  typeLabelActive: {
    color: Colors.surface,
    fontWeight: 'bold',
  },
  providerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  providerChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  providerChipActive: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(13, 138, 188, 0.1)',
  },
  providerText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  providerTextActive: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
  },
  defaultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  defaultTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  defaultDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 30,
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

export default AddPaymentMethodModal;
