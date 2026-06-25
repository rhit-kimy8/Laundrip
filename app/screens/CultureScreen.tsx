import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CultureCard from '../../components/CultureCard';
import { getMarketsNearby, Market } from '../../components/MarketService';
import PlaceDetailModal from '../../components/PlaceDetailModal';
import TimerBanner from '../../components/TimerBanner';
import { fetchCultureFacilities, fetchFestivals, fetchNearbyPlaces, TourPlace } from '../../components/TourAPI';
import { useLanguage } from '../contexts/LanguageContext';

const EULJIRO_LAT = 37.5665;
const EULJIRO_LNG = 126.9983;

export default function CultureScreen() {
  const { T } = useLanguage();
  const [attractions, setAttractions] = useState<TourPlace[]>([]);
  const [restaurants, setRestaurants] = useState<TourPlace[]>([]);
  const [culture, setCulture] = useState<TourPlace[]>([]);
  const [festivals, setFestivals] = useState<TourPlace[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('전체');
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);

  // 타이머 배너용
  const [remainSeconds, setRemainSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);

  // 타이머 동기화
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const saved = await AsyncStorage.getItem('timer_end_time');
        if (saved) {
          const endTime = parseInt(saved);
          const remain = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
          setRemainSeconds(remain);
          setTimerRunning(remain > 0);
        }
      } catch {}
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [attractionData, restaurantData, cultureData, festivalData, marketData, cultureFacilityData] = await Promise.all([
          fetchNearbyPlaces(EULJIRO_LAT, EULJIRO_LNG, 3000, '12'),
          fetchNearbyPlaces(EULJIRO_LAT, EULJIRO_LNG, 3000, '39'),
          fetchNearbyPlaces(EULJIRO_LAT, EULJIRO_LNG, 3000, '14'),
          fetchFestivals(EULJIRO_LAT, EULJIRO_LNG),
          getMarketsNearby(EULJIRO_LAT, EULJIRO_LNG, 3000),
          fetchCultureFacilities(EULJIRO_LAT, EULJIRO_LNG, 5000),
        ]);
        setAttractions(attractionData);
        setRestaurants(restaurantData);
        setCulture([...cultureData, ...cultureFacilityData]);
        setFestivals(festivalData);
        setMarkets(marketData);
      } catch (error) {
        console.log('데이터 로드 오류:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const FILTERS = [
    T.filterAll, T.filterTourist, T.filterFood,
    T.filterCulture, T.filterMarket, T.filterFestival
  ];

  const renderSection = (title: string, data: (TourPlace | Market)[]) => {
    if (data.length === 0) return null;
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {data.map((place) => (
          <CultureCard
            key={place.id}
            place={place}
            onPress={() => {
              setSelectedPlace(place);
              setShowDetail(true);
            }}
          />
        ))}
      </View>
    );
  };

  const showAttractions = activeFilter === T.filterAll || activeFilter === T.filterTourist;
  const showRestaurants = activeFilter === T.filterAll || activeFilter === T.filterFood;
  const showCulture = activeFilter === T.filterAll || activeFilter === T.filterCulture;
  const showMarkets = activeFilter === T.filterAll || activeFilter === T.filterMarket;
  const showFestivals = activeFilter === T.filterAll || activeFilter === T.filterFestival;

  const timerMinutes = Math.floor(remainSeconds / 60);
  const timerSeconds = remainSeconds % 60;

  return (
    <SafeAreaView style={styles.container}>
      {/* 타이머 배너 */}
      {timerRunning && <TimerBanner minutes={timerMinutes} seconds={timerSeconds} />}

      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.title}>{T.cultureTitle}</Text>
        <Text style={styles.subtitle}>{T.cultureSubtitle}</Text>
      </View>

      {/* 필터 버튼 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContainer}
      >
        {FILTERS.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterButton,
              activeFilter === filter && styles.filterButtonActive,
            ]}
            onPress={() => setActiveFilter(filter)}
          >
            <Text style={[
              styles.filterText,
              activeFilter === filter && styles.filterTextActive,
            ]}>
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4FC3F7" />
          <Text style={styles.loadingText}>{T.noResult}</Text>
        </View>
      ) : (
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {showAttractions && renderSection('🗺️ ' + T.filterTourist, attractions)}
          {showRestaurants && renderSection('🍜 ' + T.filterFood, restaurants)}
          {showCulture && renderSection('🏛️ ' + T.filterCulture, culture)}
          {showMarkets && renderSection('🏪 ' + T.filterMarket, markets)}
          {showFestivals && renderSection('🎉 ' + T.filterFestival, festivals)}
        </ScrollView>
      )}

      <PlaceDetailModal
        place={selectedPlace}
        visible={showDetail}
        onClose={() => setShowDetail(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  header: { padding: 20, paddingBottom: 8 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  subtitle: { color: '#888', fontSize: 14 },
  filterScroll: {
  maxHeight: 60,
  minHeight: 60,
},
filterContainer: {
  paddingHorizontal: 16,
  gap: 8,
  alignItems: 'center',
  paddingVertical: 8, // 위아래 여백 추가
},
filterButton: {
  paddingHorizontal: 14,
  paddingVertical: 8,
  borderRadius: 20,
  backgroundColor: '#2a2a3e',
  borderWidth: 1,
  borderColor: '#444',
},
  filterButtonActive: { backgroundColor: '#4FC3F7', borderColor: '#4FC3F7' },
  filterText: { color: '#888', fontSize: 13, fontWeight: '600' },
  filterTextActive: { color: '#1a1a2e' },
  scroll: { paddingHorizontal: 16, marginTop: 8 },
  section: { marginBottom: 8 },
  sectionTitle: { color: '#4FC3F7', fontWeight: 'bold', fontSize: 16, marginBottom: 12, marginTop: 8 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  loadingText: { color: '#888', fontSize: 14 },
});