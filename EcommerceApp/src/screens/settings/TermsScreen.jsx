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

const TermsScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Syarat dan Ketentuan</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.intro}>
          Harap baca Syarat dan Ketentuan ini dengan saksama sebelum menggunakan layanan kami. Dengan menggunakan aplikasi ini, Anda setuju untuk terikat oleh aturan berikut.
        </Text>

        <Section 
          title="1. Penerimaan Syarat" 
          content="Penggunaan aplikasi ini menunjukkan bahwa Anda telah membaca, memahami, dan menyetujui semua syarat dan ketentuan yang berlaku tanpa pengecualian."
        />

        <Section 
          title="2. Penggunaan Layanan" 
          content="Layanan kami ditujukan untuk penggunaan pribadi dan non-komersial. Anda dilarang menyalahgunakan sistem kami atau melakukan tindakan yang merugikan pihak lain."
        />

        <Section 
          title="3. Akun Pengguna" 
          content="Anda bertanggung jawab penuh atas kerahasiaan informasi akun dan kata sandi Anda. Segala aktivitas yang terjadi di bawah akun Anda adalah tanggung jawab Anda."
        />

        <Section 
          title="4. Transaksi dan Pembayaran" 
          content="Semua transaksi yang dilakukan melalui aplikasi adalah final. Pembayaran harus dilakukan melalui metode resmi yang disediakan untuk menjamin keamanan transaksi Anda."
        />

        <Section 
          title="5. Larangan Penggunaan" 
          content="Dilarang keras melakukan penipuan, memanipulasi harga, menggunakan perangkat lunak otomatis (bot), atau mengunggah konten yang melanggar hukum."
        />

        <Section 
          title="6. Penyelesaian Sengketa" 
          content="Segala perselisihan yang timbul dari penggunaan layanan ini akan diselesaikan secara musyawarah mufakat, atau melalui jalur hukum yang berlaku di wilayah hukum Indonesia."
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

export default TermsScreen;
