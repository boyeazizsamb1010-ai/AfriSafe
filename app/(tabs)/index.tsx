import * as Location from 'expo-location';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const [position, setPosition] = useState<string>('Position non encore capturée');
  const [chargement, setChargement] = useState<boolean>(false);

const envoyerSOS = async () => {
    setChargement(true);

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'Activez le GPS pour utiliser AfriSafe.');
      setChargement(false);
      return;
    }

    const loc = await Location.getCurrentPositionAsync({});
    const lat = loc.coords.latitude.toFixed(6);
    const lon = loc.coords.longitude.toFixed(6);

    setPosition(`Lat: ${lat} | Lon: ${lon}`);

    // Envoyer au serveur Flask
    try {
      const response = await fetch('http://192.168.100.2:5000/sos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude: lat, longitude: lon }),
      });

      const result = await response.json();
      setChargement(false);

      Alert.alert(
        '🚨 SOS Envoyé !',
        `SMS envoyé au +221783537160\n\nLatitude: ${lat}\nLongitude: ${lon}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      setChargement(false);
      Alert.alert('Erreur', 'Impossible de contacter le serveur.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titre}>AfriSafe</Text>
      <Text style={styles.sousTitre}>Appuyez en cas d'urgence</Text>

      <TouchableOpacity
        style={[styles.boutonSOS, chargement && styles.boutonChargement]}
        onPress={envoyerSOS}
        disabled={chargement}
      >
        <Text style={styles.texteSOS}>
          {chargement ? '...' : 'SOS'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.position}>{position}</Text>

      <Text style={styles.info}>
        Votre position GPS sera envoyée automatiquement
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titre: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1D9E75',
    marginBottom: 8,
  },
  sousTitre: {
    fontSize: 16,
    color: '#666',
    marginBottom: 60,
  },
  boutonSOS: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#E24B4A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  boutonChargement: {
    backgroundColor: '#aaa',
  },
  texteSOS: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  position: {
    fontSize: 13,
    color: '#1D9E75',
    marginBottom: 16,
    fontWeight: 'bold',
  },
  info: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});