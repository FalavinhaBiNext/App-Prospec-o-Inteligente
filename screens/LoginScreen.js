import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
  Image,
  ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useAuth } from '../contexts/AuthContext';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('demo@falavinha.com');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const { login } = useAuth();

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    if (!result.success) {
      Alert.alert('Erro', result.error || 'Falha ao fazer login');
    }
    setLoading(false);
  };

  return (
    <ImageBackground
      source={require('../assets/backgroundLogin.jpg')}
      style={styles.backgroundImage}
      resizeMode="cover"
      blurRadius={2}
    >
      <LinearGradient
        colors={['rgba(72, 73, 75, 0.85)', 'rgba(0, 0, 0, 0.25)']}
        style={styles.overlay}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
            {/* Logo */}
            <View style={styles.logoContainer}>
              <Image
                source={require('../assets/FalavinhaLogoWhite.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
              <Text style={styles.subtitle}>Prospecção Inteligente</Text>
            </View>

            {/* 🧊 Formulário com efeito vidro jateado */}
            <BlurView intensity={80} tint="light" style={styles.glassContainer}>

              <View style={styles.innerGlass}>
              <Text style={[styles.subtitle, {textAlign: 'center', color: '#5a5a5aff', fontSize: 38}]}>SEJA BEM VINDO</Text>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Email</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="#999"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Senha</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Senha"
                    placeholderTextColor="#999"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                  />
                </View>

                <TouchableOpacity
                  style={[styles.button, loading && styles.buttonDisabled]}
                  onPress={handleLogin}
                  disabled={loading}
                >
                  <Text style={styles.buttonText}>
                    {loading ? 'Entrando...' : 'Entrar'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.forgotPassword}>
                  <Text style={styles.forgotPasswordText}>
                    Esqueceu sua senha?
                  </Text>
                </TouchableOpacity>
              </View>
            </BlurView>

            {/* Rodapé */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Versão 1.0.0</Text>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 30,
  },
  logoImage: {
    width: 320,
    height: 200,
    marginBottom: 20,
    borderRadius: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 24,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 30,
  },

  // 🧊 Novo estilo de vidro jateado
  glassContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 10,
  },

  innerGlass: {
    padding: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },

  inputContainer: {
    marginBottom: 20,
  },

  inputLabel: {
    fontSize: 22,
    color: '#333',
    marginBottom: 5,
    fontWeight: 'bold',
  },
  
  input: {
    height: 50,
    backgroundColor: 'rgba(255,255,255)',
    borderRadius: 12,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 7,
  },
  button: {
    backgroundColor: '#0089acff',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: '#a0aec0',
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  forgotPassword: {
    alignItems: 'center',
    marginTop: 20,
  },
  forgotPasswordText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
  },
});

export default LoginScreen;
