import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, TouchableOpacity, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';

const API_URL = 'http://raspberrypi.local:5000';

export default function App() {
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [schedule, setSchedule] = useState([]);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await fetch(`${API_URL}/videos`);
      const data = await response.json();
      setVideos(data.videos);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de récupérer les vidéos');
    }
  };

  const uploadVideo = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: 'video/*' });
    if (result.type === 'success') {
      const formData = new FormData();
      formData.append('file', {
        uri: result.uri,
        name: result.name,
        type: 'video/mp4',
      });
      
      try {
        await fetch(`${API_URL}/upload`, {
          method: 'POST',
          body: formData,
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        Alert.alert('Succès', 'Vidéo téléchargée avec succès');
        fetchVideos();
      } catch (error) {
        Alert.alert('Erreur', 'Échec du téléchargement');
      }
    }
  };

  const changeVideo = async (video) => {
    try {
      await fetch(`${API_URL}/change_video`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ video }),
      });
      setSelectedVideo(video);
      Alert.alert('Succès', `Vidéo ${video} en cours de lecture`);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de changer la vidéo');
    }
  };

  const scheduleVideo = async (video, time) => {
    try {
      await fetch(`${API_URL}/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ video, start_time: time }),
      });
      setSchedule([...schedule, { video, time }]);
      Alert.alert('Succès', `Vidéo ${video} programmée à ${time}`);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de programmer la vidéo');
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Gestion des Vidéos</Text>
      <Button title="Téléverser une Vidéo" onPress={uploadVideo} />
      <FlatList
        data={videos}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => changeVideo(item)}>
            <Text style={{ padding: 10, fontSize: 16 }}>{item} {selectedVideo === item ? '✅' : ''}</Text>
          </TouchableOpacity>
        )}
      />
      <Text style={{ marginTop: 20, fontSize: 18, fontWeight: 'bold' }}>Planifier une Vidéo</Text>
      <FlatList
        data={videos}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => scheduleVideo(item, '12:00')}>
            <Text style={{ padding: 10, fontSize: 16 }}>{item} (Planifier à 12:00)</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
