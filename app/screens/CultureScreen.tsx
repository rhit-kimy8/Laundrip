import { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import CultureCard from '../../components/CultureCard';
import { fetchFestivals, fetchNearbyPlaces, TourPlace } from '../../components/TourAPI';

// 을지로 4가 기준 좌표
const EULJIRO_LAT = 37.5665;
const EULJIRO_LNG = 126.9983;

export default function CultureScreen() {
  const [attractions, setAttractions] = useState<TourPlace[]>([]);
  const [restaurants, setRestaurants] = useState<TourPlace[]>([]);
  const [culture, setCulture] = useState<TourPlace[]>([]);
  const [festivals, setFestivals] = useState<TourPlace[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [attractionData, restaurantData, cultureData, festivalData] = await Promise.all([
          fetchNearbyPlaces(EULJIRO_LAT, EULJIRO_LNG, 1000, '12'),
          fetchNearbyPlaces(EULJIRO_LAT, EULJIRO_LNG, 1000, '39'),
          fetchNearbyPlaces(EULJIRO_LAT, EULJIRO_LNG, 1000, '14'),
          fetchFestivals(EULJIRO_LAT, EULJIRO_LNG),
        ]);
        setAttractions(attractionData);
        setRestaurants(restaurantData);
        setCulture(cultureData);
        setFestivals(festivalData);
      } catch (error) {
        console.log('데이터 로드 오류:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const renderSection = (title: string, data: TourPlace[]) => {
    if (data.length === 0) return null;
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {data.map((place) => (
          <CultureCard
            key={place.id}
            place={place}
            onPress={() => {}}
          />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎭 문화 콘텐츠</Text>
        <Text style={styles.subtitle}>을지로 주변 추천 장소</Text>
      </View>

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
          {renderSection('🗺️ 관광지', attractions)}
          {renderSection('🍜 음식점', restaurants)}
          {renderSection('🏛️ 문화시설', culture)}
          {renderSection('🎉 축제/행사', festivals)}

          {attractions.length === 0 &&
           restaurants.length === 0 &&
           culture.length === 0 &&
           festivals.length === 0 && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>주변 관광정보를 찾을 수 없습니다.</Text>
            </View>
          )}
        </ScrollView>
      )}
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
  scroll: {
    paddingHorizontal: 16,
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    color: '#888',
    fontSize: 14,
  },
});