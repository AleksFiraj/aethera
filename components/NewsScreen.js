import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const MOCK_NEWS = [
  {
    id: '1',
    title: 'Air Pollution Levels Drop in Major Cities',
    summary: 'Recent studies show a significant decrease in air pollution in urban areas due to new green policies.',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    date: '2024-06-01',
    tag: 'Pollution',
    link: '#'
  },
  {
    id: '2',
    title: 'Sustainable Travel: Top 10 Eco-Friendly Destinations',
    summary: 'Discover the best places to travel sustainably in 2024, from green cities to nature reserves.',
    image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80',
    date: '2024-05-28',
    tag: 'Travel',
    link: '#'
  },
  {
    id: '3',
    title: 'Electric Buses Revolutionize Public Transport',
    summary: 'Cities worldwide are adopting electric buses, reducing emissions and improving air quality.',
    image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=600&q=80',
    date: '2024-05-25',
    tag: 'Sustainability',
    link: '#'
  }
];

const NewsScreen = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);

  useEffect(() => {
    setTimeout(() => {
      setNews(MOCK_NEWS);
      setLoading(false);
    }, 800);
  }, []);

  const openModal = (article) => {
    setSelectedArticle(article);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedArticle(null);
  };

  return (
    <LinearGradient colors={["#e0f7fa", "#b2dfdb", "#81c784"]} style={styles.bg}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerSticky}><Text style={styles.header}>Latest News</Text></View>
        {loading ? (
          <ActivityIndicator size="large" color="#4CAF50" style={{ marginTop: 40 }} />
        ) : news.length === 0 ? (
          <Text style={{ color: '#888', marginTop: 40, fontSize: 16 }}>No news available at the moment.</Text>
        ) : (
          news.map(article => (
            <TouchableOpacity key={article.id} style={styles.card} activeOpacity={0.92} onPress={() => openModal(article)}>
              <Image source={{ uri: article.image }} style={styles.image} />
              <View style={styles.cardContent}>
                <View style={styles.cardHeaderRow}>
                  <View style={[styles.tag, styles[`tag${article.tag}`] || styles.tagDefault]}>
                    <Text style={styles.tagText}>{article.tag}</Text>
                  </View>
                  <View style={styles.dateBadge}>
                    <Ionicons name="calendar" size={13} color="#388E3C" style={{ marginRight: 2 }} />
                    <Text style={styles.dateText}>{article.date}</Text>
                  </View>
                </View>
                <Text style={styles.title}>{article.title}</Text>
                <Text style={styles.summary}>{article.summary}</Text>
                <View style={styles.readMoreRow}>
                  <Text style={styles.readMoreText}>Read more</Text>
                  <Ionicons name="chevron-forward" size={18} color="#388E3C" />
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
      {/* Article Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.modalClose} onPress={closeModal}>
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
            {selectedArticle && (
              <>
                <Image source={{ uri: selectedArticle.image }} style={styles.modalImage} />
                <View style={styles.modalTagRow}>
                  <View style={[styles.tag, styles[`tag${selectedArticle.tag}`] || styles.tagDefault]}>
                    <Text style={styles.tagText}>{selectedArticle.tag}</Text>
                  </View>
                  <View style={styles.dateBadge}>
                    <Ionicons name="calendar" size={13} color="#388E3C" style={{ marginRight: 2 }} />
                    <Text style={styles.dateText}>{selectedArticle.date}</Text>
                  </View>
                </View>
                <Text style={styles.modalTitle}>{selectedArticle.title}</Text>
                <Text style={styles.modalSummary}>{selectedArticle.summary}</Text>
              </>
            )}
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  bg: { flex: 1 },
  container: {
    padding: 18,
    paddingTop: 0,
    alignItems: 'stretch',
  },
  headerSticky: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingTop: 40,
    paddingBottom: 10,
    width: '100%',
    alignItems: 'center',
    zIndex: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 0,
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 26,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0f2f1',
    transition: 'box-shadow 0.2s',
  },
  image: {
    width: '100%',
    height: 160,
  },
  cardContent: {
    padding: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  tag: {
    borderRadius: 12,
    paddingVertical: 3,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
    marginRight: 8,
  },
  tagText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  tagPollution: { backgroundColor: '#ff7043' },
  tagTravel: { backgroundColor: '#29b6f6' },
  tagSustainability: { backgroundColor: '#43a047' },
  tagDefault: { backgroundColor: '#888' },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0f2f1',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  dateText: {
    fontSize: 12,
    color: '#388E3C',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 6,
    marginTop: 2,
  },
  summary: {
    fontSize: 15,
    color: '#555',
    marginBottom: 12,
  },
  readMoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  readMoreText: {
    color: '#388E3C',
    fontWeight: 'bold',
    fontSize: 14,
    marginRight: 2,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 0,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  modalClose: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
    backgroundColor: '#388E3C',
    borderRadius: 20,
    padding: 4,
  },
  modalImage: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },
  modalTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '90%',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 6,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    marginTop: 8,
    marginBottom: 8,
    textAlign: 'center',
    width: '90%',
    alignSelf: 'center',
  },
  modalSummary: {
    fontSize: 16,
    color: '#444',
    marginBottom: 18,
    width: '90%',
    alignSelf: 'center',
    textAlign: 'center',
  },
});

export default NewsScreen; 