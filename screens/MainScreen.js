import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Modal,
  Linking,
} from "react-native";
import * as Location from "expo-location";
import { useAuth } from "../contexts/AuthContext";
import {
  Ionicons,
  Entypo,
  Feather,
  MaterialIcons,
  FontAwesome,
  FontAwesome5,
} from "@expo/vector-icons";
import { Polyline } from "react-native-maps";
import ModalModern from "../components/ModalModern";
import ModalLeads from "../components/ModalLeads";
import ModalFiltroLeads from "../components/ModalFiltroLeads";

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

const calcularDistancia = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Algoritmo de rota otimizada (vizinho mais próximo)
const otimizarRota = (pontos, origem) => {
  let restantes = [...pontos];
  const rota = [];
  let atual = origem;

  while (restantes.length > 0) {
    let maisProximo = restantes.reduce((a, b) => {
      const da = calcularDistancia(
        atual.latitude,
        atual.longitude,
        a.latitude,
        a.longitude
      );
      const db = calcularDistancia(
        atual.latitude,
        atual.longitude,
        b.latitude,
        b.longitude
      );
      return da < db ? a : b;
    });
    rota.push(maisProximo);
    restantes = restantes.filter((p) => p.id !== maisProximo.id);
    atual = maisProximo;
  }
  return rota;
};

const fakeLeads = [
  {
    id: 1,
    nome: "A4 PROMAQ LTDA",
    email: "comercial@a4promaq.com.br",
    telefone: "(41) 3679-1200",
    latitude: -25.32019,
    longitude: -49.05904,
    tipo: "Potencial",
    status: "Novo",
    endereco: "Av. João Scucato Coradin, 181 - Bairro A",
  },
  {
    id: 2,
    nome: "ACA INDÚSTRIA E COMÉRCIO DE PEÇAS LTDA",
    email: "adriano.silva@aca.ind.br",
    telefone: "(41) 3098-8686",
    latitude: -25.49121,
    longitude: -49.14888,
    tipo: "Qualificado",
    status: "Em Negociação",
    endereco: "Av. Thomaz Carmeliano de Miranda, 1142 - Bairro B",
  },
  {
    id: 3,
    nome: "ACESSORIOS BONELLI LTDA",
    email: "pedro@vendas.com",
    telefone: "(41) 3366-3787",
    latitude: -25.49628,
    longitude: -49.16592,
    tipo: "Potencial",
    status: "Novo",
    endereco: "Rua Menino Jesus, 315 - Bairro C",
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
    nome: "ELETROPAR COMPONENTES LTDA",
    email: "vendas@eletropar.com.br",
    telefone: "(41) 3327-5522",
    latitude: -25.428995,
    longitude: -49.273251,
    tipo: "Qualificado",
    status: "Em Negociação",
    endereco: "Av. Sete de Setembro, 4550 - Batel",
  },
];

const user = {
  nome: "Guilherme Oliveira",
  email: "guilherme.oliveira@gmail.com",
  telefone: "(11) 99999-9999",
  endereco: "Rua João Pessoa, 123 - Centro",
};

const MainScreen = () => {
  const [location, setLocation] = useState(null);
  const [modalFiltroVisible, setModalFiltroVisible] = useState(false);
  const [modalLeadVisible, setModalLeadVisible] = useState(false);
  const [modalPerfilVisible, setModalPerfilVisible] = useState(false);
  const [modalListLeadsVisible, setModalListLeadsVisible] = useState(false);
  const [modalRotaVisible, setModalRotaVisible] = useState(false);
  const [leadSelecionado, setLeadSelecionado] = useState(null);
  const [raioFiltro, setRaioFiltro] = useState(null);
  const [leadsFiltrados, setLeadsFiltrados] = useState([]);
  const [leadsSelecionados, setLeadsSelecionados] = useState([]);
  const [rotaCoordenadas, setRotaCoordenadas] = useState([]);
  const { logout } = useAuth();

  const MapView = require("react-native-maps").default;
  const { Marker } = require("react-native-maps");

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
  }, []);

  const handleLogout = () => {
    Alert.alert("Sair", "Deseja realmente sair?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", onPress: () => logout() },
    ]);
  };

  const handleLeadClick = () => {
    if (!location) return;
    const leadsOrdenados = [...fakeLeads]
      .map((lead) => ({
        ...lead,
        distancia: calcularDistancia(
          location.latitude,
          location.longitude,
          lead.latitude,
          lead.longitude
        ),
      }))
      .sort((a, b) => a.distancia - b.distancia);
    setLeadsFiltrados(leadsOrdenados);
    setModalFiltroVisible(true);
  };

  const handleSelectRaio = (raio) => {
    if (!location) return;
    setRaioFiltro(raio);
    const leadsDentroRaio = fakeLeads
      .map((lead) => ({
        ...lead,
        distancia: calcularDistancia(
          location.latitude,
          location.longitude,
          lead.latitude,
          lead.longitude
        ),
      }))
      .filter((lead) => lead.distancia <= raio)
      .sort((a, b) => a.distancia - b.distancia);
    setLeadsFiltrados(leadsDentroRaio);
  };

  const handleOpenWhatsApp = (telefone) => {
    const numeroLimpo = telefone.replace(/\D/g, "");
    const url = `https://wa.me/55${numeroLimpo}`;
    Linking.openURL(url).catch(() =>
      Alert.alert("Erro", "Não foi possível abrir o WhatsApp")
    );
  };

  const handleMarkerPress = (lead) => {
    setLeadSelecionado(lead);
    if (modalFiltroVisible === true) {
      setModalFiltroVisible(false);
    }

    setModalLeadVisible(true);
  };

  const handlePerfilClick = () => {
    setModalPerfilVisible(true);
  };

  const handleRotaClick = () => {
    setModalRotaVisible(true);
  };

  const toggleSelecionarLead = (lead) => {
    setLeadsSelecionados((prev) => {
      const jaSelecionado = prev.find((l) => l.id === lead.id);
      return jaSelecionado
        ? prev.filter((l) => l.id !== lead.id)
        : [...prev, lead];
    });
  };

  const handleCriarRotaMultipla = () => {
    if (!location || leadsSelecionados.length < 2) {
      Alert.alert("Selecione pelo menos 2 empresas");
      return;
    }
    const otimizados = otimizarRota(leadsSelecionados, location);
    const coords = [
      { latitude: location.latitude, longitude: location.longitude },
      ...otimizados.map((l) => ({
        latitude: l.latitude,
        longitude: l.longitude,
      })),
    ];
    setRotaCoordenadas(coords);

    const origin = `${location.latitude},${location.longitude}`;
    const destination = `${otimizados[otimizados.length - 1].latitude},${
      otimizados[otimizados.length - 1].longitude
    }`;
    const waypoints = otimizados
      .slice(0, -1)
      .map((l) => `${l.latitude},${l.longitude}`)
      .join("|");
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${waypoints}&travelmode=driving`;

    Linking.openURL(url);
  };

  const handleCancelarRota = () => {
    setLeadsSelecionados([]);
    setRotaCoordenadas([]);
  };

  return (
    <View style={styles.container}>
      {location && (
        <MapView
          style={styles.map}
          region={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.08,
            longitudeDelta: 0.08,
          }}
          showsUserLocation
        >
          {(raioFiltro ? leadsFiltrados : fakeLeads).map((lead) => (
            <Marker
              key={lead.id}
              coordinate={{
                latitude: lead.latitude,
                longitude: lead.longitude,
              }}
              pinColor={getStatusColor(lead.status)}
              onPress={() => handleMarkerPress(lead)}
            />
          ))}

          {/* Exibe a rota no mapa */}
          {rotaCoordenadas.length > 1 && (
            <Polyline
              coordinates={rotaCoordenadas}
              strokeColor="#007BFF"
              strokeWidth={4}
            />
          )}
        </MapView>
      )}

      <ModalModern
        visible={modalPerfilVisible}
        onClose={() => setModalPerfilVisible(false)}
        user={{
          nome: "Guilherme Oliveira",
          email: "guilherme@empresa.com",
          telefone: "(41) 98888-7777",
          foto: "https://i.pravatar.cc/150?img=12",
        }}
        onEditar={() =>
          Alert.alert("Editar Perfil", "Função em desenvolvimento.")
        }
        onSenha={() =>
          Alert.alert("Alterar Senha", "Função em desenvolvimento.")
        }
        onLogout={() => logout()}
      />

      {/* Botões Usuario */}
      <View style={styles.userContainer}>
        <TouchableOpacity style={styles.userButton} onPress={handlePerfilClick}>
          <FontAwesome name="user-circle-o" size={36} color="#fff" />
          <View>
            <Text style={styles.userButtonTextNome}>{user.nome}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Botões de rota */}
      {leadsSelecionados.length > 1 && (
        <View style={styles.rotaContainer}>
          <TouchableOpacity
            style={styles.botaoRota}
            onPress={handleCriarRotaMultipla}
          >
            <FontAwesome5 name="route" size={20} color="#fff" />
            <Text style={styles.textoRota}>
              Criar Rota ({leadsSelecionados.length} paradas)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.botaoRota,
              { backgroundColor: "#d9534f", marginTop: 10 },
            ]}
            onPress={handleCancelarRota}
          >
            <Entypo name="cross" size={20} color="#fff" />
            <Text style={styles.textoRota}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      )}

      <ModalFiltroLeads
        visible={modalFiltroVisible}
        leads={leadsFiltrados}
        onClose={() => setModalFiltroVisible(false)}
        onSelectLead={(selecionados) => setLeadsSelecionados(selecionados)}
        selectedLeads={leadsSelecionados}
        onApply={(selecionados) => {
          setLeadsSelecionados(selecionados);
          setModalFiltroVisible(false);
        }}
        onFilterChange={(filtros) => {
          console.log("Filtros aplicados:", filtros);
        }}
      />

      {/* Modal de Rota */}
      <Modal
        visible={modalRotaVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalRotaVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Leads Encontrados</Text>

            <View style={styles.tagContainer}>
              {[5, 10, 15, 20, 25].map((km) => (
                <TouchableOpacity
                  key={km}
                  style={[
                    styles.tag,
                    raioFiltro === km && styles.tagSelecionada,
                  ]}
                  onPress={() => handleSelectRaio(km)}
                >
                  <Text
                    style={[
                      styles.tagText,
                      raioFiltro === km && styles.tagTextSelecionada,
                    ]}
                  >
                    {km} km
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <ScrollView style={{ marginTop: 10, maxHeight: 300 }}>
              {leadsFiltrados.map((lead) => {
                const selecionado = leadsSelecionados.find(
                  (l) => l.id === lead.id
                );
                return (
                  <TouchableOpacity
                    key={lead.id}
                    style={[
                      styles.leadCard,
                      selecionado && { backgroundColor: "#e0f7e9" },
                    ]}
                    onPress={() => toggleSelecionarLead(lead)}
                  >
                    <FontAwesome
                      name={selecionado ? "check-circle" : "circle-thin"}
                      size={18}
                      color={selecionado ? "#4CAF50" : "#ccc"}
                      style={{ marginRight: 8 }}
                    />
                    <View>
                      <Text style={styles.leadName}>{lead.nome}</Text>
                      <Text style={styles.leadInfo}>{lead.endereco}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity
              style={[styles.applyButton, { marginTop: 15 }]}
              onPress={() => setModalRotaVisible(false)}
            >
              <Text style={styles.applyButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Novo Modal de Leads */}
      <ModalLeads
        visible={modalListLeadsVisible}
        leads={leadsFiltrados}
        onClose={() => setModalListLeadsVisible(false)}
        onSelectLead={(selecionados) => setLeadsSelecionados(selecionados)}
        selectedLeads={leadsSelecionados}
      />

      {/* Modal de informações do lead */}
      <Modal
        visible={modalLeadVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalLeadVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {leadSelecionado && (
              <>
                <Text style={styles.modalTitle}>
                  <FontAwesome name="building-o" size={20} color="#000" />{" "}
                  {leadSelecionado.nome}
                </Text>
                <Text>Email: {leadSelecionado.email}</Text>
                <Text>Telefone: {leadSelecionado.telefone}</Text>
                <Text>Endereço: {leadSelecionado.endereco}</Text>
                <Text>Status: {leadSelecionado.status}</Text>
                <Text>Tipo: {leadSelecionado.tipo}</Text>

                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      { backgroundColor: "#25D366" },
                    ]}
                    onPress={() => handleOpenWhatsApp(leadSelecionado.telefone)}
                  >
                    <FontAwesome name="whatsapp" size={20} color="#fff" />
                    <Text style={styles.buttonText}>WhatsApp</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      { backgroundColor: "#4285F4" },
                    ]}
                    onPress={() => {
                      setLeadsSelecionados([leadSelecionado]);
                      setModalLeadVisible(false);
                    }}
                  >
                    <FontAwesome5 name="route" size={20} color="#fff" />
                    <Text style={styles.buttonText}>Criar Rota</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      { backgroundColor: "#FFA000" },
                    ]}
                  >
                    <FontAwesome name="folder-open" size={20} color="#fff" />
                    <Text style={styles.buttonText}>Criar Contato</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
            <TouchableOpacity
              style={[styles.applyButton, { marginTop: 15 }]}
              onPress={() => setModalLeadVisible(false)}
            >
              <Text style={styles.applyButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Barra Inferior */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={handleRotaClick}>
          <FontAwesome5 name="route" size={20} color="#fff" />
          <Text style={styles.navText}>Rotas</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => setModalListLeadsVisible(true)}>
          <Feather name="users" size={22} color="#fff" />
          <Text style={styles.navText}>Leads</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setModalPerfilVisible(true)}
        >
          <MaterialIcons name="person-outline" size={26} color="#fff" />
          <Text style={styles.navText}>Perfil</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setModalFiltroVisible(true)}
        >
          <MaterialIcons name="person-outline" size={26} color="#fff" />
          <Text style={styles.navText}>Filtrar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={handleLogout}>
          <Entypo name="log-out" size={22} color="#fff" />
          <Text style={styles.navText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default MainScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1, marginTop: 40, marginBottom: 40 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    elevation: 10,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 10,
  },
  tag: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#f1f1f1",
    borderRadius: 15,
    margin: 5,
  },
  tagSelecionada: { backgroundColor: "#007BFF" },
  tagText: { color: "#333" },
  tagTextSelecionada: { color: "#fff", fontWeight: "bold" },
  leadCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  leadName: { fontWeight: "bold", color: "#222" },
  leadInfo: { color: "#666" },

  userContainer: {
    position: "absolute",
    top: 60,
    left: 10,
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    borderRadius: 30,
    paddingRight: 18,
    paddingLeft: 6,
  },
  userButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    justifyContent: "flex-start",
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  userButtonTextNome: { color: "#fff", marginLeft: 6, fontWeight: "bold" },
  userButtonTextEmail: {
    color: "#fff",
    marginLeft: 6,
    fontWeight: "ultralight",
    fontStyle: "italic",
    fontSize: 10,
  },
  applyButton: {
    backgroundColor: "#007BFF",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  applyButtonText: { color: "#fff", fontWeight: "600" },
  rotaContainer: {
    position: "absolute",
    bottom: 140,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  botaoRota: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4285F4",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 5,
  },
  textoRota: { color: "#fff", fontWeight: "bold", marginLeft: 8 },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  buttonText: { color: "#fff", marginLeft: 6, fontWeight: "bold" },
  bottomNav: {
    position: "absolute",
    bottom: 70,
    left: 0,
    right: 0,
    backgroundColor: "#1a1a1a",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
    marginHorizontal: 20,
    borderRadius: 30,
  },
  navItem: { alignItems: "center" },
  navText: { color: "#fff", fontSize: 12, marginTop: 4 },
});
