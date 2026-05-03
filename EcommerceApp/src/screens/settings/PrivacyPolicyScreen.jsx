import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

const PrivacyPolicyScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kebijakan Privasi</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.intro}>
          Kami sangat menghargai privasi Anda. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi pribadi Anda saat menggunakan aplikasi kami.
        </Text>

        <Section 
          title="1. Pengumpulan Data" 
          content="Kami mengumpulkan data yang Anda berikan saat mendaftar akun, termasuk nama, alamat email, nomor telepon, dan alamat pengiriman. Kami juga mengumpulkan data transaksi dan interaksi Anda di dalam aplikasi."
        />

        <Section 
          title="2. Penggunaan Data" 
          content="Data Anda digunakan untuk memproses pesanan, mempersonalisasi pengalaman belanja Anda, meningkatkan layanan kami, dan mengirimkan informasi terkait promosi atau pembaruan penting."
        />

        <Section 
          title="3. Keamanan Data" 
          content="Kami menerapkan standar keamanan industri untuk melindungi informasi Anda dari akses yang tidak sah, perubahan, pengungkapan, atau penghancuran yang tidak semestinya."
        />

        <Section 
          title="4. Hak Pengguna" 
          content="Anda berhak untuk mengakses, memperbarui, atau meminta penghapusan data pribadi Anda kapan saja melalui pengaturan profil atau dengan menghubungi layanan pelanggan kami."
        />

        <Section 
          title="5. Perubahan Kebijakan" 
          content="Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu. Setiap perubahan akan diinformasikan melalui notifikasi di dalam aplikasi atau melalui email."
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Terakhir diperbarui: 1 Januari 2025</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const Section = ({ title, content }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <Text style={styles.sectionContent}>{content}</Text>
  </View>
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
  intro: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  sectionContent: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
    textAlign: 'justify',
  },
  footer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: Colors.border,
    fontStyle: 'italic',
  },
});

export default PrivacyPolicyScreen;
