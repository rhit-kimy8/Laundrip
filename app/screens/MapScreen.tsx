import { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CultureCard from '../components/CultureCard';
import LaundryPopup from '../components/LaundryPopup';
import TimePickerModal from '../components/TimePickerModal';
import TimerBanner from '../components/TimerBanner';

const MOCK_LAUNDRY_SHOPS = [
  { id: 1, name: '을지로 런드리', washer: 3, dryer: 2, distance: '도보 3분', lat: 37.5665, lng: 126.9780 },
  { id: 2, name: '중구 코인세탁', washer: 1, dryer: 3, distance: '도보 7분', lat: 37.5670, lng: 126.9795 },
];

const MOCK_CULTURE_PLACES = [
  { id: 1, name: '광장시장', category: '전통시장', distance: '350m', walkTime: '도보 5분', description: '100년 전통의 서울 대표 전통시장. 빈대떡, 마약김밥 등 다양한 먹거리가 유명합니다.' },
  { id: 2, name: '청계천', category: '관광지', distance: '500m', walkTime: '도보 7분', description: '도심 속 자연을 느낄 수 있는 산책로. 외국인 관광객에게 인기 명소입니다.' },
  { id: 3, name: '을지로 노가리 골목', category: '음식점', distance: '200m', walkTime: '도보 3분', description: '을지로의 숨은 로컬 맛집 골목. 저렴하고 맛있는 한국 안주를 즐길 수 있습니다.' },
];

export default function MapScreen() {
  const [selectedShop, setSelectedShop] = useState<any>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showCulture, setShowCulture] = useState(false);
  const [timerRunning, setTimerRunning] = useState(false);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [remainSeconds, setRemainSeconds] = useState(0);

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

  const handleShopPress = (shop: any) => {
    setSelectedShop(shop);
    setShowPopup(true);
  };

  const handleStartWash = () => {
    setShowPopup(false);
    setShowTimePicker(true);
  };

  const handleTimeConfirm = (minutes: number) => {
    const seconds = minutes * 60;
    setTotalSeconds(seconds);
    setRemainSeconds(seconds);
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

      {/* 지도 영역 (모의 지도) */}
      <View style={styles.mapArea}>
        <Text style={styles.mapLabel}>🗺️ 을지로 4가 주변</Text>

        {MOCK_LAUNDRY_SHOPS.map((shop) => (
          <TouchableOpacity
            key={shop.id}
            style={styles.marker}
            onPress={() => handleShopPress(shop)}
          >
            <Text style={styles.markerIcon}>🧺</Text>
            <Text style={styles.markerName}>{shop.name}</Text>
            <Text style={styles.markerInfo}>
              세탁 {shop.washer}대 · 건조 {shop.dryer}대
            </Text>
          </TouchableOpacity>
        ))}

        {!timerRunning && (
          <Text style={styles.hint}>세탁소 아이콘을 눌러보세요!</Text>
        )}
      </View>

      {/* 문화 콘텐츠 추천 */}
      {showCulture && (
        <View style={styles.cultureSection}>
          <Text style={styles.cultureTitle}>🎯 세탁 대기 중 이런 곳은 어떠세요?</Text>
          {MOCK_CULTURE_PLACES.map((place) => (
            <CultureCard
              key={place.id}
              place={place}
              onPress={() => {}}
            />
          ))}
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
  mapArea: {
    flex: 1,
    backgroundColor: '#16213e',
    margin: 16,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  mapLabel: {
    color: '#4FC3F7',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  marker: {
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#4FC3F7',
  },
  markerIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  markerName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  markerInfo: {
    color: '#4FC3F7',
    fontSize: 13,
  },
  hint: {
    color: '#555',
    fontSize: 13,
    marginTop: 8,
  },
  cultureSection: {
    maxHeight: '45%',
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