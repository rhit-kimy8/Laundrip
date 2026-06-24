import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CultureCard from '../../components/CultureCard';
import { getMarketsNearby, Market } from '../../components/MarketService';
import PlaceDetailModal from '../../components/PlaceDetailModal';
import { fetchCultureFacilities, fetchFestivals, fetchNearbyPlaces, TourPlace } from '../../components/TourAPI';
const EULJIRO_LAT = 37.5665;
const EULJIRO_LNG = 126.9983;

type FilterType = '전체' | '관광지' | '음식점' | '문화시설' | '전통시장' | '축제/행사';

export default function CultureScreen() {
  const [attractions, setAttractions] = useState<TourPlace[]>([]);
  const [restaurants, setRestaurants] = useState<TourPlace[]>([]);
  const [culture, setCulture] = useState<TourPlace[]>([]);
  const [festivals, setFestivals] = useState<TourPlace[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>('전체');
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
   const loadData = async () => {
  setLoading(true);
  try {
    const [attractionData, restaurantData, cultureData, festivalData, marketData, cultureFacilityData] = await Promise.all([
      fetchNearbyPlaces(EULJIRO_LAT, EULJIRO_LNG, 3000, '12'),   // 3km
      fetchNearbyPlaces(EULJIRO_LAT, EULJIRO_LNG, 3000, '39'),   // 3km
      fetchNearbyPlaces(EULJIRO_LAT, EULJIRO_LNG, 3000, '14'),   // 3km
      fetchFestivals(EULJIRO_LAT, EULJIRO_LNG),
      getMarketsNearby(EULJIRO_LAT, EULJIRO_LNG, 3000),          // 3km
      fetchCultureFacilities(EULJIRO_LAT, EULJIRO_LNG, 5000),    // 5km (중구+종로구 커버)
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

  const FILTERS: FilterType[] = ['전체', '관광지', '음식점', '문화시설', '전통시장', '축제/행사'];

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

  const showAttractions = activeFilter === '전체' || activeFilter === '관광지';
  const showRestaurants = activeFilter === '전체' || activeFilter === '음식점';
  const showCulture = activeFilter === '전체' || activeFilter === '문화시설';
  const showMarkets = activeFilter === '전체' || activeFilter === '전통시장';
  const showFestivals = activeFilter === '전체' || activeFilter === '축제/행사';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎭 문화 콘텐츠</Text>
        <Text style={styles.subtitle}>을지로 주변 추천 장소</Text>
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
          <Text style={styles.loadingText}>주변 관광정보 불러오는 중...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {showAttractions && renderSection('🗺️ 관광지', attractions)}
          {showRestaurants && renderSection('🍜 음식점', restaurants)}
          {showCulture && renderSection('🏛️ 문화시설', culture)}
          {showMarkets && renderSection('🏪 전통시장', markets)}
          {showFestivals && renderSection('🎉 축제/행사', festivals)}
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
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    padding: 20,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    color: '#888',
    fontSize: 14,
  },
  filterScroll: {
    maxHeight: 50,
  },
  filterContainer: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: 'center',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#2a2a3e',
    borderWidth: 1,
    borderColor: '#444',
  },
  filterButtonActive: {
    backgroundColor: '#4FC3F7',
    borderColor: '#4FC3F7',
  },
  filterText: {
    color: '#888',
    fontSize: 13,
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#1a1a2e',
  },
  scroll: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    color: '#4FC3F7',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 12,
    marginTop: 8,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    color: '#888',
    fontSize: 14,
  },
});