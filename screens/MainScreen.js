import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
  ScrollView,
  Modal,
  Platform,
  ImageBackground,
} from "react-native";
import * as Location from "expo-location";
import { LinearGradient } from "expo-linear-gradient";
import Slider from "@react-native-community/slider";
import { useAuth } from "../contexts/AuthContext";
import {
  Ionicons,
  AntDesign,
  Entypo,
  Octicons,
  Feather,
} from "@expo/vector-icons";

// -------------------------
// Funções auxiliares
// -------------------------
const getStatusColor = (status) => {
  switch (status) {
    case "Novo":
      return "#4CAF50";
    case "Em Negociação":
      return "#FF9800";
    case "Fechado":
      return "#2196F3";
    default:
      return "#9E9E9E";
  }
};

const getTypeColor = (tipo) => {
  return tipo === "Qualificado" ? "#673AB7" : "#FF5722";
};

const calcularDistancia = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Raio da Terra em km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// -------------------------
// Componentes de mapa
// -------------------------
const WebMap = ({ location, leads, onLeadPress }) => (
  <View style={styles.webMapContainer}>
    <View style={styles.webMap}>
      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapPlaceholderText}>🗺️ Mapa Interativo</Text>
        <Text style={styles.mapPlaceholderSubtext}>
          {location
            ? `Localização atual: ${location.latitude.toFixed(
                4
              )}, ${location.longitude.toFixed(4)}`
            : "Aguardando localização..."}
        </Text>
      </View>
      <View style={styles.mapMarkers}>
        {leads.map((lead, index) => (
          <TouchableOpacity
            key={lead.id}
            style={[
              styles.mapMarker,
              {
                top: `${20 + index * 15}%`,
                left: `${15 + index * 20}%`,
                backgroundColor: getStatusColor(lead.status),
              },
            ]}
            onPress={() => onLeadPress(lead)}
          >
            <Text style={styles.markerText}>{lead.nome.charAt(0)}</Text>
          </TouchableOpacity>
        ))}
        {location && (
          <View
            style={[styles.currentLocationMarker, { top: "50%", left: "50%" }]}
          >
            <View style={styles.locationPulse} />
            <Text style={styles.locationText}>📍</Text>
          </View>
        )}
      </View>
    </View>
  </View>
);

const MobileMap = ({ location, leads, onLeadPress }) => {
  const MapView = require("react-native-maps").default;
  const { Marker, Callout } = require("react-native-maps");
  return (
    <MapView
      style={styles.map}
      initialRegion={{
        latitude: location?.latitude || -23.5505,
        longitude: location?.longitude || -46.6333,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }}
      showsUserLocation
      showsMyLocationButton
    >
      {leads.map((lead) => (
        <Marker
          key={lead.id}
          coordinate={{
            latitude: lead.latitude,
            longitude: lead.longitude,
          }}
          pinColor={getStatusColor(lead.status)}
          onPress={() => onLeadPress(lead)}
        >
          <Callout>
            <View style={styles.calloutContainer}>
              <Text style={styles.calloutTitle}>{lead.nome}</Text>
              <Text style={styles.calloutSubtitle}>
                {lead.tipo} - {lead.status}
              </Text>
              <Text style={styles.calloutText}>{lead.endereco}</Text>
            </View>
          </Callout>
        </Marker>
      ))}
    </MapView>
  );
};

// -------------------------
// Dados simulados
// -------------------------
const fakeLeads = [
  {
    id: 1,
    nome: "A4 PROMAQ LTDA",
    email: "comercial@a4promaq.com.br",
    telefone: "(41) 3679-1200",
    latitude: -25.3201902132732,
    longitude: -49.0590438907532,
    tipo: "Potencial",
    status: "Novo",
    endereco: "Av. JOAO SCUCATO CORADIN, 181 - Bairro A",
  },
  {
    id: 2,
    nome: "ACA INDUSTRIA E COMERCIO DE PECAS PARA AR CONDICIONADO LTDA",
    email: "adriano.silva@aca.ind.br",
    telefone: "(41) 3098-8686",
    latitude: -25.4912198955076,
    longitude: -49.14888793048,
    tipo: "Qualificado",
    status: "Em Negociação",
    endereco: "AV. THOMAZ CARMELIANO DE MIRANDA, 1142 - Bairro B",
  },
  {
    id: 3,
    nome: "ACESSORIOS BONELLI LTDA.",
    email: "pedro@vendas.com",
    telefone: "(41) 3366-3787",
    latitude: -25.4962816861804,
    longitude: -49.1659205988311,
    tipo: "Potencial",
    status: "Novo",
    endereco: "Rua MENINO JESUS, 315 - Bairro C",
  },
  {
    id: 4,
    nome: "AGISA CONTAINNERS LTDA",
    email: "agisa@agisa.com.br",
    telefone: "(41) 3555-3669",
    latitude: -25.436947,
    longitude: -49.247364,
    tipo: "Qualificado",
    status: "Fechado",
    endereco: "Rod. BR-277, 3000 - CIC",
  },
  {
    id: 5,
    nome: "ALUMAIS ESQUADRIAS DE METAL LTDA",
    email: "aspcontasul@gmail.com",
    telefone: "(41) 3287-0966",
    latitude: -25.49572,
    longitude: -49.270251,
    tipo: "Qualificado",
    status: "Fechado",
    endereco: "Rua José Guercheski, 530 - Novo Mundo",
  },
  {
    id: 6,
    nome: "METALÚRGICA CURITIBANA LTDA",
    email: "contato@metalcuritibana.com.br",
    telefone: "(41) 3342-8877",
    latitude: -25.469871,
    longitude: -49.297341,
    tipo: "Potencial",
    status: "Novo",
    endereco: "Rua João Bettega, 2450 - Portão",
  },
  {
    id: 7,
    nome: "ELETROPAR COMPONENTES INDUSTRIAIS LTDA",
    email: "vendas@eletropar.com.br",
    telefone: "(41) 3327-5522",
    latitude: -25.428995,
    longitude: -49.273251,
    tipo: "Qualificado",
    status: "Em Negociação",
    endereco: "Av. Sete de Setembro, 4550 - Batel",
  },
  {
    id: 8,
    nome: "SOLARTECH ENERGIA RENOVÁVEL LTDA",
    email: "contato@solartech.com.br",
    telefone: "(41) 3355-9988",
    latitude: -25.443971,
    longitude: -49.277899,
    tipo: "Potencial",
    status: "Novo",
    endereco: "Rua Itupava, 1320 - Alto da XV",
  },
  {
    id: 9,
    nome: "GRANFER INDÚSTRIA DE MÁQUINAS LTDA",
    email: "comercial@granfer.com.br",
    telefone: "(41) 3669-2211",
    latitude: -25.431212,
    longitude: -49.278801,
    tipo: "Qualificado",
    status: "Fechado",
    endereco: "Rua Francisco Derosso, 640 - Xaxim",
  },
  {
    id: 10,
    nome: "CURITIBA TECH SOLUTIONS LTDA",
    email: "suporte@curitibatech.com.br",
    telefone: "(41) 3024-1234",
    latitude: -25.442183,
    longitude: -49.26741,
    tipo: "Potencial",
    status: "Em Negociação",
    endereco: "Av. República Argentina, 1500 - Água Verde",
  },
  {
    id: 11,
    nome: "AUTO MECÂNICA SANTO INÁCIO LTDA",
    email: "atendimento@santoinacioauto.com.br",
    telefone: "(41) 3335-7700",
    latitude: -25.450774,
    longitude: -49.300211,
    tipo: "Qualificado",
    status: "Fechado",
    endereco: "Rua Dom Pedro II, 980 - Santo Inácio",
  },
  {
    id: 12,
    nome: "PONTO CERTO MATERIAIS DE CONSTRUÇÃO LTDA",
    email: "vendas@pontocerto.com.br",
    telefone: "(41) 3344-1212",
    latitude: -25.480129,
    longitude: -49.257432,
    tipo: "Potencial",
    status: "Novo",
    endereco: "Rua Eng. Rebouças, 2123 - Rebouças",
  },
  {
    id: 13,
    nome: "SUPREMA ALIMENTOS LTDA",
    email: "financeiro@suprema.com.br",
    telefone: "(41) 3369-8877",
    latitude: -25.397521,
    longitude: -49.252764,
    tipo: "Qualificado",
    status: "Em Negociação",
    endereco: "Av. Manoel Ribas, 5650 - Santa Felicidade",
  },
];

const MainScreen = () => {
  const [location, setLocation] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [slideAnim] = useState(new Animated.Value(-100));
  const [bairroFiltro, setBairroFiltro] = useState("");
  const [raioFiltro, setRaioFiltro] = useState(5);
  const [leadsFiltrados, setLeadsFiltrados] = useState(fakeLeads);
  const { user, logout } = useAuth();

  // Obtém localização atual
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permissão negada", "Acesso à localização negado");
        return;
      }
      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation.coords);
    })();
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleLeadPress = (lead) => {
    setSelectedLead(lead);
    setModalVisible(true);
  };

  const filtrarLeads = () => {
    let filtrados = fakeLeads;

    if (bairroFiltro.trim() !== "") {
      filtrados = filtrados.filter((lead) =>
        lead.endereco.toLowerCase().includes(bairroFiltro.toLowerCase())
      );
    }

    if (location && raioFiltro > 0) {
      filtrados = filtrados.filter((lead) => {
        const distancia = calcularDistancia(
          location.latitude,
          location.longitude,
          lead.latitude,
          lead.longitude
        );
        return distancia <= raioFiltro;
      });
    }

    setLeadsFiltrados(filtrados);
  };

  const handleLogout = () => {
    Alert.alert("Sair", "Deseja realmente sair do aplicativo?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", onPress: () => logout() },
    ]);
  };

  return (
    <ImageBackground
      source={require("../assets/backgroundLogin.jpg")}
      style={styles.backgroundImage}
      resizeMode="cover"
      blurRadius={2}
      opacity={0.6}
      backgroundColor="#000"
    >
      <View style={styles.container}>
        {/* Header */}
        <LinearGradient
          colors={["#006b8bff", "#242424ff"]}
          style={styles.header}
        >
          <Animated.View
            style={[
              styles.headerContent,
              { transform: [{ translateY: slideAnim }] },
            ]}
          >
            <View style={{ textAlign: "center" }}>
              <Text style={{ color: "#fff", fontSize: 18 }}>
                BARRA DE PESQUISA - IMPLEMENTAR
              </Text>
            </View>
          </Animated.View>
        </LinearGradient>

        {/* 🔍 Filtros */}
        {/* <View style={styles.filtroContainer}>
          <TextInput
            style={styles.inputFiltro}
            placeholder="Filtrar por bairro..."
            value={bairroFiltro}
            onChangeText={setBairroFiltro}
          />
          <View style={styles.raioContainer}>
            <Text style={styles.labelRaio}>Raio: {raioFiltro} km</Text>
            <Slider
              style={{ width: 150 }}
              minimumValue={1}
              maximumValue={50}
              step={1}
              value={raioFiltro}
              onValueChange={setRaioFiltro}
            />
          </View>
          <TouchableOpacity style={styles.botaoFiltro} onPress={filtrarLeads}>
            <Text style={styles.botaoFiltroTexto}>Aplicar Filtro</Text>
          </TouchableOpacity>
        </View> */}

        {/* 🗺️ Mapa */}
        {/* <View style={styles.mapContainer}>
          {Platform.OS === "web" ? (
            <WebMap
              location={location}
              leads={leadsFiltrados}
              onLeadPress={handleLeadPress}
            />
          ) : (
            <MobileMap
              location={location}
              leads={leadsFiltrados}
              onLeadPress={handleLeadPress}
            />
          )}
        </View> */}

        {/* Lista de leads */}
        {/* <View style={styles.leadsContainer}>
          <Text style={styles.leadsTitle}>
            Leads Próximos ({leadsFiltrados.length})
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.leadsScroll}
          >
            {leadsFiltrados.map((lead) => (
              <TouchableOpacity
                key={lead.id}
                style={styles.leadCard}
                onPress={() => handleLeadPress(lead)}
              >
                <View style={styles.leadHeader}>
                  <Text style={styles.leadName}>{lead.nome}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(lead.status) },
                    ]}
                  >
                    <Text style={styles.statusText}>{lead.status}</Text>
                  </View>
                </View>
                <Text style={styles.leadType}>{lead.tipo}</Text>
                <Text style={styles.leadAddress}>{lead.endereco}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View> */}

        {/* Footer */}
        <View
          style={styles.footer}
        >
          <Animated.View
            style={[
              styles.headerContent,
              { transform: [{ translateY: slideAnim }] },
            ]}
          >
            <View style={styles.userInfo}>
              <View>
                <Feather name="userss" size={24} color="#fff" />
              </View>
              <View>
                <Feather name="user" size={24} color="#fff" />
              </View>
              <View>
                <Feather name="user" size={24} color="#fff" />
              </View>
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
              >
                <Entypo name="log-out" size={24} color="#fff" />
                <Text style={styles.logoutButtonText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              {selectedLead && (
                <>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>{selectedLead.nome}</Text>
                    <TouchableOpacity
                      style={styles.modalClose}
                      onPress={() => setModalVisible(false)}
                    >
                      <Text style={styles.modalCloseText}>×</Text>
                    </TouchableOpacity>
                  </View>

                  <ScrollView style={styles.modalBody}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Email:</Text>
                      <Text style={styles.detailValue}>
                        {selectedLead.email}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Telefone:</Text>
                      <Text style={styles.detailValue}>
                        {selectedLead.telefone}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Endereço:</Text>
                      <Text style={styles.detailValue}>
                        {selectedLead.endereco}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Tipo:</Text>
                      <View
                        style={[
                          styles.typeBadge,
                          { backgroundColor: getTypeColor(selectedLead.tipo) },
                        ]}
                      >
                        <Text style={styles.typeText}>{selectedLead.tipo}</Text>
                      </View>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Status:</Text>
                      <View
                        style={[
                          styles.statusBadgeModal,
                          {
                            backgroundColor: getStatusColor(
                              selectedLead.status
                            ),
                          },
                        ]}
                      >
                        <Text style={styles.statusTextModal}>
                          {selectedLead.status}
                        </Text>
                      </View>
                    </View>
                  </ScrollView>

                  <View style={styles.modalFooter}>
                    <TouchableOpacity style={styles.actionButton}>
                      <Text style={styles.actionButtonText}>Ligar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                      <Text style={styles.actionButtonText}>WhatsApp</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButtonPrimary}>
                      <Text style={styles.actionButtonPrimaryText}>
                        Visitar
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </View>
        </Modal>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    flex: 1,
  },
  container: {
    flex: 1,
    height: "90%",
    marginBottom: "10%",
  },
  header: {
    marginTop: 60,
    marginHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 16,
    width: "100dvw",
    borderRadius: 50,
    height: 70,
    justifyContent: "center",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "90%",
    paddingHorizontal: 10,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  userAvatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  userDetails: {
    flex: 1,
    marginRight: 10,
  },
  userName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  userEmail: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 12,
  },
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    paddingRight: 12,
    minWidth: 60,
    alignItems: "center",
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  mapContainer: {
    flex: 1,
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  map: {
    flex: 1,
  },
  webMapContainer: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
  },
  webMap: {
    flex: 1,
    position: "relative",
    backgroundColor: "#f0f8ff",
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f8ff",
    borderRadius: 16,
  },
  mapPlaceholderText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2196F3",
    marginBottom: 8,
  },
  mapPlaceholderSubtext: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  mapMarkers: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  mapMarker: {
    position: "absolute",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  markerText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  currentLocationMarker: {
    position: "absolute",
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  locationPulse: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2196F3",
    opacity: 0.3,
  },
  locationText: {
    fontSize: 20,
    zIndex: 1,
  },
  calloutContainer: {
    padding: 10,
    minWidth: 150,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 2,
  },
  calloutSubtitle: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  calloutText: {
    fontSize: 11,
    color: "#888",
  },
  leadsContainer: {
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingBottom: 16,
    borderRadius: 20,
    paddingTop: 16,
    paddingLeft: 16,
    paddingRight: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
    maxHeight: "25%",
    margin: 16,
  },
  leadsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  leadsScroll: {
    flexDirection: "row",
    padding: 8,
  },
  leadCard: {
    backgroundColor: "#f8f9fa",
    padding: 15,
    marginRight: 10,
    borderRadius: 15,
    minWidth: 150,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  leadHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  leadName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginLeft: 8,
  },
  statusText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  leadType: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  leadAddress: {
    fontSize: 11,
    color: "#888",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  modalClose: {
    padding: 5,
  },
  modalCloseText: {
    fontSize: 24,
    color: "#999",
  },
  modalBody: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 14,
    color: "#333",
    flex: 1,
    textAlign: "right",
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  typeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  statusBadgeModal: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusTextModal: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  footerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    width: "100%",
    borderRadius: 50,
    height: 70,
    justifyContent: "center",
  },
  footer: {
    marginTop: 60,
    marginHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 16,
    width: "100dvw",
    borderRadius: 50,
    height: 70,
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "rgba(209, 209, 209, 0.2)",
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    alignItems: "center",
  },
  actionButtonText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "600",
  },
  actionButtonPrimary: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: "#667eea",
    borderRadius: 10,
    alignItems: "center",
  },
  actionButtonPrimaryText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  filtroContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 10,
    padding: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputFiltro: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
    fontSize: 14,
  },
  raioContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  labelRaio: {
    fontSize: 14,
    color: "#333",
  },
  botaoFiltro: {
    backgroundColor: "#667eea",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  botaoFiltroTexto: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});

export default MainScreen;
