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

const filtrosRaio = [5, 10, 15, 20, 25];
const filtrosStatus = ["Novo", "Em Negociação", "Fechado"];
const filtrosTipo = ["Potencial", "Qualificado"];

const ModalFiltroLeads = ({
  visible,
  leads = [],
  onClose,
  onApply,
  onSelectLead,
  selectedLeads = [],
  onFilterChange,
}) => {
  const slideAnim = useRef(new Animated.Value(800)).current;
  const [localSelection, setLocalSelection] = useState(selectedLeads || []);
  const [selectedRaio, setSelectedRaio] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [selectedTipo, setSelectedTipo] = useState(null);

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

  const toggleSelectLead = (lead) => {
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

  const handleFilterChange = (type, value) => {
    if (type === "raio") setSelectedRaio(value);
    if (type === "status") setSelectedStatus(value);
    if (type === "tipo") setSelectedTipo(value);

    if (onFilterChange) onFilterChange({ raio: selectedRaio, status: selectedStatus, tipo: selectedTipo });
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <BlurView intensity={60} tint="dark" style={styles.overlay}>
        <TouchableOpacity style={styles.overlayTouchable} activeOpacity={1} onPress={onClose} />

        <Animated.View
          style={[styles.modalContainer, { transform: [{ translateY: slideAnim }] }]}
        >
          <View style={styles.header}>
            <Text style={styles.headerText}>Filtrar Leads</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close-circle" size={30} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Filtros */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterSection}>
            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Raio</Text>
              <View style={styles.filterChips}>
                {filtrosRaio.map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={[
                      styles.chip,
                      selectedRaio === r && styles.chipSelected,
                    ]}
                    onPress={() => handleFilterChange("raio", r)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        selectedRaio === r && styles.chipTextSelected,
                      ]}
                    >
                      {r} km
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Status</Text>
              <View style={styles.filterChips}>
                {filtrosStatus.map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.chip,
                      selectedStatus === status && styles.chipSelected,
                    ]}
                    onPress={() => handleFilterChange("status", status)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        selectedStatus === status && styles.chipTextSelected,
                      ]}
                    >
                      {status}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Tipo</Text>
              <View style={styles.filterChips}>
                {filtrosTipo.map((tipo) => (
                  <TouchableOpacity
                    key={tipo}
                    style={[
                      styles.chip,
                      selectedTipo === tipo && styles.chipSelected,
                    ]}
                    onPress={() => handleFilterChange("tipo", tipo)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        selectedTipo === tipo && styles.chipTextSelected,
                      ]}
                    >
                      {tipo}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Listagem */}
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
                    onPress={() => toggleSelectLead(lead)}
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

          {/* Botões */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.footerButton, { backgroundColor: "#4CAF50" }]}
              onPress={() => onApply(localSelection)}
            >
              <Text style={styles.footerButtonText}>Aplicar Filtros</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.footerButton, { backgroundColor: "#FF5252" }]}
              onPress={onClose}
            >
              <Text style={styles.footerButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </BlurView>
    </Modal>
  );
};

export default ModalFiltroLeads;

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
    elevation: 10,
    maxHeight: "90%",
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
  filterSection: {
    marginVertical: 10,
    maxHeight: 140,
  },
  filterGroup: {
    marginRight: 20,
  },
  filterLabel: {
    color: "#bbb",
    fontSize: 14,
    marginBottom: 5,
  },
  filterChips: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  chip: {
    backgroundColor: "#2C2C2C",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    margin: 4,
  },
  chipSelected: {
    backgroundColor: "#3A7AFE",
  },
  chipText: {
    color: "#ccc",
    fontSize: 13,
  },
  chipTextSelected: {
    color: "#fff",
    fontWeight: "bold",
  },
  scrollArea: {
    flexGrow: 1,
    marginBottom: 10,
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
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
  footerButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  footerButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
});
