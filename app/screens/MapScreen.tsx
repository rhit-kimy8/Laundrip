import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CultureCard from '../../components/CultureCard';
import KakaoMap from '../../components/KakaoMap';
import LaundryPopup from '../../components/LaundryPopup';
import TimePickerModal from '../../components/TimePickerModal';
import TimerBanner from '../../components/TimerBanner';
import { fetchNearbyPlaces, TourPlace } from '../../components/TourAPI';

export default function MapScreen() {
  // 모든 useState 먼저 선언
  const [shops, setShops] = useState([
    { id: 1, name: '에코런드렛', lat: 37.5681, lng: 126.9944, washer: 3, dryer: 2, distance: '도보 10분' },
    { id: 2, name: '더런드리', lat: 37.5650, lng: 127.0021, washer: 2, dryer: 3, distance: '도보 9분' },
  ]);
  const [selectedShop, setSelectedShop] = useState<any>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showCulture, setShowCulture] = useState(false);
  const [timerRunning, setTimerRunning] = useState(false);
  const [remainSeconds, setRemainSeconds] = useState(0);
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [culturePlaces, setCulturePlaces] = useState<TourPlace[]>([]);

  // 모든 useEffect 그 다음에 선언
  useEffect(() => {
    if (!timerRunning) return;
    if (remainSeconds <= 0) {
      setTimerRunning(false);
      setShowCulture(false);
      alert('🧺 세탁이 완료되었습니다! 세탁물을 찾으러 가세요.');
      return;
    }
    const interval = setInterval(() => {
      setRemainSeconds((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning, remainSeconds]);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.log('위치 권한 거부');
          return;
        }
        const location = await Location.getCurrentPositionAsync({});
        setCurrentLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      } catch (error) {
        console.log('위치 가져오기 실패:', error);
      }
    })();
  }, []);

  useEffect(() => {
    const loadCulturePlaces = async () => {
      const places = await fetchNearbyPlaces(37.5665, 126.9983, 1000);
      setCulturePlaces(places);
    };
    loadCulturePlaces();
  }, []);

  const [tourPlaces, setTourPlaces] = useState<TourPlace[]>([]);
  useEffect(() => {
  const loadTourPlaces = async () => {
    const [attractions, restaurants, culture] = await Promise.all([
      fetchNearbyPlaces(37.5665, 126.9983, 2000, '12'),
      fetchNearbyPlaces(37.5665, 126.9983, 2000, '39'),
      fetchNearbyPlaces(37.5665, 126.9983, 2000, '14'),
    ]);
    setTourPlaces([...attractions, ...restaurants, ...culture]);
  };
  loadTourPlaces();
  }, []);

  const handleShopSelect = (shop: any) => {
    const latestShop = shops.find((s) => s.id === shop.id);
    setSelectedShop(latestShop || shop);
    setShowPopup(true);
  };

  const handleStartWash = () => {
    setShowPopup(false);
    setShowTimePicker(true);
  };

  const handleTimeConfirm = (minutes: number, type: string) => {
    let updatedShop: any = null;
    setShops((prev) =>
      prev.map((shop) => {
        if (shop.id === selectedShop?.id) {
          const updated = {
            ...shop,
            washer: type === '세탁기' ? Math.max(0, shop.washer - 1) : shop.washer,
            dryer: type === '건조기' ? Math.max(0, shop.dryer - 1) : shop.dryer,
          };
          updatedShop = updated;
          return updated;
        }
        return shop;
      })
    );
    if (updatedShop) setSelectedShop(updatedShop);
    setRemainSeconds(minutes * 60);
    setTimerRunning(true);
    setShowTimePicker(false);
    setShowCulture(true);
  };

  const minutes = Math.floor(remainSeconds / 60);
  const seconds = remainSeconds % 60;

  return (
    <SafeAreaView style={styles.container}>
      {timerRunning && (
        <TimerBanner minutes={minutes} seconds={seconds} />
      )}

      <View style={styles.header}>
        <Text style={styles.headerTitle}>🗺️ Laundry</Text>
      </View>

      <View style={styles.mapContainer}>
        <KakaoMap
         key={JSON.stringify(shops)}
         onShopSelect={handleShopSelect}
         currentLocation={currentLocation}
         shops={shops}
         tourPlaces={tourPlaces}
        />
      </View>

      {showCulture && (
        <View style={styles.cultureSection}>
          <Text style={styles.cultureTitle}>🎯 세탁 대기 중 이런 곳은 어떠세요?</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            {culturePlaces.map((place) => (
              <CultureCard
                key={place.id}
                place={place}
                onPress={() => {}}
              />
            ))}
          </ScrollView>
        </View>
      )}

      <LaundryPopup
        shop={selectedShop}
        visible={showPopup}
        onClose={() => setShowPopup(false)}
        onStartWash={handleStartWash}
      />

      <TimePickerModal
        visible={showTimePicker}
        onConfirm={handleTimeConfirm}
        onClose={() => setShowTimePicker(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  mapContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cultureSection: {
    height: 280,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  cultureTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 12,
  },
});