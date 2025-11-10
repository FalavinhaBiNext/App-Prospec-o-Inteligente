import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Modal,
  ScrollView,
} from "react-native";
import { BlurView } from "expo-blur";
import { FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons";

const ModalLeads = ({ visible, leads, onClose, onSelectLead, selectedLeads = [] }) => {
  const slideAnim = useRef(new Animated.Value(800)).current;
  const [localSelection, setLocalSelection] = useState(selectedLeads || []);

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 800,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const toggleSelect = (lead) => {
    const exists = localSelection.find((l) => l.id === lead.id);
    let updated;
    if (exists) {
      updated = localSelection.filter((l) => l.id !== lead.id);
    } else {
      updated = [...localSelection, lead];
    }
    setLocalSelection(updated);
    if (onSelectLead) onSelectLead(updated);
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <BlurView intensity={60} tint="dark" style={styles.overlay}>
        <TouchableOpacity style={styles.overlayTouchable} activeOpacity={1} onPress={onClose} />

        <Animated.View
          style={[styles.modalContainer, { transform: [{ translateY: slideAnim }] }]}
        >
          <View style={styles.header}>
            <Text style={styles.headerText}>
              Leads Encontrados ({leads.length})
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close-circle" size={30} color="#fff" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea}>
            {leads.length > 0 ? (
              leads.map((lead) => {
                const isSelected = localSelection.some((l) => l.id === lead.id);
                return (
                  <TouchableOpacity
                    key={lead.id}
                    style={[
                      styles.leadCard,
                      isSelected && styles.selectedCard,
                    ]}
                    onPress={() => toggleSelect(lead)}
                    activeOpacity={0.8}
                  >
                    <FontAwesome
                      name="building-o"
                      size={22}
                      color={isSelected ? "#fff" : "#ccc"}
                    />
                    <View style={styles.leadInfoContainer}>
                      <Text
                        style={[
                          styles.leadName,
                          isSelected && { color: "#fff" },
                        ]}
                      >
                        {lead.nome}
                      </Text>
                      <Text style={styles.leadDetail}>{lead.endereco}</Text>
                      <Text style={styles.leadDetail}>{lead.telefone}</Text>
                    </View>

                    {isSelected && (
                      <MaterialIcons name="check-circle" size={24} color="#4CAF50" />
                    )}
                  </TouchableOpacity>
                );
              })
            ) : (
              <Text style={styles.emptyText}>Nenhum lead encontrado.</Text>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </BlurView>
    </Modal>
  );
};

export default ModalLeads;

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
    padding: 20,
    paddingBottom: 30,
    elevation: 10,
    maxHeight: "85%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  headerText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  scrollArea: {
    marginTop: 10,
    marginBottom: 15,
  },
  leadCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2C2C2C",
    borderRadius: 15,
    padding: 12,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  selectedCard: {
    backgroundColor: "#3A7AFE",
    borderColor: "#3A7AFE",
  },
  leadInfoContainer: {
    flex: 1,
    marginLeft: 10,
  },
  leadName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#fff",
  },
  leadDetail: {
    color: "#ccc",
    fontSize: 13,
  },
  emptyText: {
    color: "#aaa",
    textAlign: "center",
    marginTop: 30,
  },
  footer: {
    alignItems: "center",
    marginTop: 10,
  },
  closeButton: {
    backgroundColor: "#4285F4",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
});
