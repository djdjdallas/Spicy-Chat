// pages/PartnerSelection.js
import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useConversationPartner } from "../features/ConversationPartner";

export const PartnerSelection = ({ navigation }) => {
  const { partners, setCurrentPartner } = useConversationPartner();

  const handlePartnerSelect = (partner) => {
    setCurrentPartner(partner);
    navigation.navigate("Chat", { partnerId: partner.id });
  };

  const renderPartner = ({ item }) => (
    <TouchableOpacity
      style={styles.partnerCard}
      onPress={() => handlePartnerSelect(item)}
    >
      <View style={styles.partnerInfo}>
        <Text style={styles.partnerName}>{item.name}</Text>
        <Text style={styles.partnerStyle}>Style: {item.style}</Text>
        <Text style={styles.partnerGoals}>Focus: {item.goals}</Text>
        <View style={styles.difficultyContainer}>
          <Text style={styles.difficultyLabel}>Level: </Text>
          {[...Array(item.difficultyLevel)].map((_, i) => (
            <Text key={i} style={styles.star}>
              ★
            </Text>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Choose Your Conversation Partner</Text>
      <FlatList
        data={partners}
        renderItem={renderPartner}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 15,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0084ff",
    marginBottom: 20,
  },
  list: {
    padding: 10,
  },
  partnerCard: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  partnerInfo: {
    gap: 5,
  },
  partnerName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  partnerStyle: {
    fontSize: 16,
    color: "#666",
  },
  partnerGoals: {
    fontSize: 16,
    color: "#666",
  },
  difficultyContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  difficultyLabel: {
    fontSize: 16,
    color: "#666",
  },
  star: {
    color: "#0084ff",
    fontSize: 16,
  },
});

export default PartnerSelection;
