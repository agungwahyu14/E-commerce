import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';

const SettingsScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pengaturan</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Akun</Text>
        <SettingItem
          icon="person-outline"
          label="Edit Profil"
          onPress={() => navigation.navigate('EditProfile')}
        />
        <SettingItem
          icon="lock-closed-outline"
          label="Ubah Kata Sandi"
          onPress={() => navigation.navigate('ChangePassword')}
        />

        <Text style={styles.sectionTitle}>Notifikasi</Text>
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <Ionicons name="notifications-outline" size={22} color={Colors.primary} />
            <Text style={styles.settingLabel}>Notifikasi Aplikasi</Text>
          </View>
          <Switch value={true} trackColor={{ false: '#CBD5E1', true: Colors.primary }} />
        </View>

        <Text style={styles.sectionTitle}>Lainnya</Text>
        <SettingItem icon="shield-checkmark-outline" label="Kebijakan Privasi" onPress={() => navigation.navigate('PrivacyPolicy')} />
        <SettingItem icon="document-text-outline" label="Syarat dan Ketentuan" onPress={() => navigation.navigate('Terms')} />
      </ScrollView>
    </SafeAreaView>
  );
};

const SettingItem = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.settingRow} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.settingLeft}>
      <Ionicons name={icon} size={22} color={Colors.primary} />
      <Text style={styles.settingLabel}>{label}</Text>
    </View>
    <Ionicons name="chevron-forward" size={18} color={Colors.border} />
  </TouchableOpacity>
);

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
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  backBtn: {
    padding: 4,
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginTop: 24,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontSize: 15,
    color: Colors.text,
    fontWeight: '500',
  },
});

export default SettingsScreen;
