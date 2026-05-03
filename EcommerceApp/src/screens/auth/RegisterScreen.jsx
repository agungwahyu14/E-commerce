import { Ionicons } from '@expo/vector-icons';
import { useState, useRef } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Animated
} from 'react-native';
import { Colors } from '../../constants/colors';
import { useAuth } from '../../hooks/useAuth';

const RegisterScreen = ({ navigation }) => {
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [bannerError, setBannerError] = useState('');

  const [securePassword, setSecurePassword] = useState(true);
  const [secureConfirm, setSecureConfirm] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const shakeAnimation = useRef(new Animated.Value(0)).current;

  const startShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true })
    ]).start();
  };

  const validate = () => {
    let valid = true;
    let newErrors = {};

    if (!name || name.length < 2) {
      newErrors.name = 'Nama minimal 2 karakter';
      valid = false;
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!email || !emailRegex.test(email)) {
      newErrors.email = 'Format email tidak valid';
      valid = false;
    }

    // Password: min 8 karakter, 1 uppercase, 1 digit
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!password || !passwordRegex.test(password)) {
      newErrors.password = 'Min 8 karakter, 1 huruf besar & 1 angka';
      valid = false;
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Konfirmasi password tidak cocok';
      valid = false;
    }

    if (!termsAccepted) {
      setBannerError('Kamu harus menyetujui syarat & ketentuan');
      valid = false;
    }

    setErrors(newErrors);
    if (!valid) startShake();
    return valid;
  };

  const handleRegister = async () => {
    setBannerError('');
    if (!validate()) return;

    setLoading(true);

    try {
      await register(name, email, password);
    } catch (err) {
      startShake();
      // Error sudah ditangani secara global oleh interceptor axios (tampil Modal)
    } finally {
      setLoading(false);
    }
  };

  const getWrapperStyle = (fieldName) => {
    const hasError = errors[fieldName];
    const val = fieldName === 'confirmPassword' ? confirmPassword : 
                fieldName === 'password' ? password : 
                fieldName === 'email' ? email : name;
    
    if (hasError) return [styles.inputWrapper, styles.inputError];
    if (val && !hasError) return [styles.inputWrapper, styles.inputSuccess];
    return styles.inputWrapper;
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          <View style={styles.logoContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="cart" size={40} color={Colors.surface} />
            </View>
          </View>
          <Text style={styles.title}>Buat Akun Baru</Text>
          <Text style={styles.subtitle}>Daftarkan diri Anda untuk mulai berbelanja</Text>

          <Animated.View style={[styles.card, { transform: [{ translateX: shakeAnimation }] }]}>
            {bannerError ? (
              <View style={styles.bannerError}>
                <Ionicons name="alert-circle" size={20} color={Colors.error} />
                <Text style={styles.bannerErrorText}>{bannerError}</Text>
              </View>
            ) : null}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nama Lengkap</Text>
              <View style={getWrapperStyle('name')}>
                <Ionicons name="person-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.inputWithIcon}
                  placeholder="Masukkan nama lengkap"
                  placeholderTextColor={Colors.textSecondary}
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    if (errors.name) setErrors({ ...errors, name: null });
                  }}
                />
              </View>
              {errors.name && (
                <View style={styles.inlineError}>
                  <Ionicons name="alert-circle-outline" size={14} color={Colors.error} />
                  <Text style={styles.inlineErrorText}>{errors.name}</Text>
                </View>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <View style={getWrapperStyle('email')}>
                <Ionicons name="mail-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.inputWithIcon}
                  placeholder="Masukkan alamat email"
                  placeholderTextColor={Colors.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errors.email) setErrors({ ...errors, email: null });
                  }}
                />
              </View>
              {errors.email && (
                <View style={styles.inlineError}>
                  <Ionicons name="alert-circle-outline" size={14} color={Colors.error} />
                  <Text style={styles.inlineErrorText}>{errors.email}</Text>
                </View>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <View style={getWrapperStyle('password')}>
                <Ionicons name="lock-closed-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.inputWithIcon}
                  placeholder="Min 8 karakter, 1 Besar & 1 Angka"
                  placeholderTextColor={Colors.textSecondary}
                  secureTextEntry={securePassword}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password) setErrors({ ...errors, password: null });
                  }}
                />
                <TouchableOpacity onPress={() => setSecurePassword(!securePassword)} style={styles.eyeIcon}>
                  <Ionicons name={securePassword ? "eye-off-outline" : "eye-outline"} size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>
              {errors.password && (
                <View style={styles.inlineError}>
                  <Ionicons name="alert-circle-outline" size={14} color={Colors.error} />
                  <Text style={styles.inlineErrorText}>{errors.password}</Text>
                </View>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Konfirmasi Password</Text>
              <View style={getWrapperStyle('confirmPassword')}>
                <Ionicons name="shield-checkmark-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.inputWithIcon}
                  placeholder="Ulangi password Anda"
                  placeholderTextColor={Colors.textSecondary}
                  secureTextEntry={secureConfirm}
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: null });
                  }}
                />
                <TouchableOpacity onPress={() => setSecureConfirm(!secureConfirm)} style={styles.eyeIcon}>
                  <Ionicons name={secureConfirm ? "eye-off-outline" : "eye-outline"} size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && (
                <View style={styles.inlineError}>
                  <Ionicons name="alert-circle-outline" size={14} color={Colors.error} />
                  <Text style={styles.inlineErrorText}>{errors.confirmPassword}</Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => {
                setTermsAccepted(!termsAccepted);
                setBannerError('');
              }}
              activeOpacity={0.7}
            >
              <Ionicons
                name={termsAccepted ? "checkbox" : "square-outline"}
                size={20}
                color={termsAccepted ? Colors.primary : Colors.textSecondary}
              />
              <Text style={styles.checkboxText}>
                Saya setuju dengan <Text style={styles.linkText}>Syarat Ketentuan</Text> dan <Text style={styles.linkText}>Kebijakan Privasi</Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.registerButton, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={Colors.surface} />
              ) : (
                <Text style={styles.registerButtonText}>Daftar Sekarang</Text>
              )}
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or register with</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialLoginContainer}>
              <TouchableOpacity style={styles.socialButton}>
                <Ionicons name="logo-google" size={24} color="#DB4437" />
                <Text style={styles.socialButtonText}>Google</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.socialButton}>
                <Ionicons name="logo-apple" size={24} color="#000000" />
                <Text style={styles.socialButtonText}>Apple</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Sudah punya akun? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLink}>Masuk di sini</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  formContainer: {
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 64,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 32,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  inputError: {
    borderColor: Colors.error,
    backgroundColor: '#FFF5F5',
  },
  inputSuccess: {
    borderColor: '#4CAF50',
  },
  inputIcon: {
    marginRight: 8,
  },
  inputWithIcon: {
    flex: 1,
    height: 50,
    color: Colors.text,
  },
  eyeIcon: {
    padding: 8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 4,
    paddingRight: 16,
  },
  checkboxText: {
    marginLeft: 8,
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  linkText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  inlineError: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  inlineErrorText: {
    color: Colors.error,
    fontSize: 12,
  },
  bannerError: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  bannerErrorText: {
    color: Colors.error,
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  registerButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  registerButtonText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: 'bold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    marginHorizontal: 10,
    color: Colors.textSecondary,
    fontSize: 14,
  },
  socialLoginContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    backgroundColor: Colors.surface,
  },
  socialButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  loginLink: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default RegisterScreen;
