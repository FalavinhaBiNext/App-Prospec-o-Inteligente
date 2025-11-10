import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Modal,
  Image,
  Dimensions,
} from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons, FontAwesome5, MaterialIcons } from "@expo/vector-icons";

const { height } = Dimensions.get("window");

const ModalPerfil = ({ visible, onClose, user, onEditar, onSenha, onLogout }) => {
  const slideAnim = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!user) return null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <BlurView intensity={60} tint="dark" style={styles.overlay}>
        <TouchableOpacity style={styles.overlayTouchable} activeOpacity={1} onPress={onClose} />

        <Animated.View
          style={[
            styles.modalContainer,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close-circle" size={32} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerText}>Meu Perfil</Text>
          </View>

          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: user.foto || "https://i.pravatar.cc/150?img=12" }}
                style={styles.avatar}
              />
              <TouchableOpacity style={styles.editIcon}>
                <MaterialIcons name="photo-camera" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
            <Text style={styles.name}>{user.nome}</Text>
            <Text style={styles.email}>{user.email}</Text>
            <Text style={styles.phone}>{user.telefone}</Text>
          </View>

          <View style={styles.actionList}>
            <TouchableOpacity style={styles.actionItem} onPress={onEditar}>
              <FontAwesome5 name="user-edit" size={18} color="#fff" />
              <Text style={styles.actionText}>Editar Perfil</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem} onPress={onSenha}>
              <Ionicons name="lock-closed-outline" size={20} color="#fff" />
              <Text style={styles.actionText}>Alterar Senha</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionItem, styles.logoutItem]} onPress={onLogout}>
              <Ionicons name="log-out-outline" size={22} color="#ff5252" />
              <Text style={[styles.actionText, { color: "#ff5252" }]}>Sair da Conta</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </BlurView>
    </Modal>
  );
};

export default ModalPerfil;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  overlayTouchable: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    backgroundColor: "#1E1E1E",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 25,
    paddingBottom: 40,
    elevation: 10,
  },
  header: {
    alignItems: "center",
    marginBottom: 10,
  },
  headerText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: -5,
  },
  closeButton: {
    position: "absolute",
    right: 0,
    top: -10,
  },
  profileSection: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 25,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 10,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#fff",
  },
  editIcon: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: "#007BFF",
    borderRadius: 15,
    padding: 5,
  },
  name: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 5,
  },
  email: {
    color: "#ccc",
    fontSize: 14,
  },
  phone: {
    color: "#aaa",
    fontSize: 13,
    marginTop: 2,
  },
  actionList: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
    paddingTop: 15,
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  actionText: {
    color: "#fff",
    fontSize: 15,
    marginLeft: 12,
    fontWeight: "500",
  },
  logoutItem: {
    marginTop: 10,
  },
});
