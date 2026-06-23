import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CultureCard from '../../components/CultureCard';
import KakaoMap from '../../components/KakaoMap';
import LaundryPopup from '../../components/LaundryPopup';
import TimePickerModal from '../../components/TimePickerModal';
import TimerBanner from '../../components/TimerBanner';

const MOCK_CULTURE_PLACES = [
  { id: 1, name: '광장시장', category: '전통시장', distance: '350m', walkTime: '도보 5분', description: '100년 전통의 서울 대표 전통시장. 빈대떡, 마약김밥 등 다양한 먹거리가 유명합니다.' },
  { id: 2, name: '청계천', category: '관광지', distance: '500m', walkTime: '도보 7분', description: '도심 속 자연을 느낄 수 있는 산책로. 외국인 관광객에게 인기 명소입니다.' },
  { id: 3, name: '을지로 노가리 골목', category: '음식점', distance: '200m', walkTime: '도보 3분', description: '을지로의 숨은 로컬 맛집 골목. 저렴하고 맛있는 한국 안주를 즐길 수 있습니다.' },
];

export default function MapScreen() {
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

  const handleShopSelect = (shop: any) => {
    // shops state에서 최신 데이터로 찾아서 팝업 열기
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

  // selectedShop도 최신 상태로 업데이트
  if (updatedShop) {
    setSelectedShop(updatedShop);
  }

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
        />
      </View>

      {showCulture && (
        <View style={styles.cultureSection}>
          <Text style={styles.cultureTitle}>🎯 세탁 대기 중 이런 곳은 어떠세요?</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            {MOCK_CULTURE_PLACES.map((place) => (
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