import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import CultureCard from '../components/CultureCard';

const CULTURE_DATA = [
  { id: 1, name: '광장시장', category: '전통시장', distance: '350m', walkTime: '도보 5분', description: '100년 전통의 서울 대표 전통시장. 빈대떡, 마약김밥 등 다양한 먹거리가 유명합니다.' },
  { id: 2, name: '청계천', category: '관광지', distance: '500m', walkTime: '도보 7분', description: '도심 속 자연을 느낄 수 있는 산책로. 외국인 관광객에게 인기 명소입니다.' },
  { id: 3, name: '을지로 노가리 골목', category: '음식점', distance: '200m', walkTime: '도보 3분', description: '을지로의 숨은 로컬 맛집 골목. 저렴하고 맛있는 한국 안주를 즐길 수 있습니다.' },
  { id: 4, name: '국립중앙박물관', category: '문화시설', distance: '2.1km', walkTime: '도보 25분', description: '한국의 역사와 문화를 한눈에 볼 수 있는 국내 최대 규모의 박물관입니다.' },
  { id: 5, name: '동대문 디자인 플라자', category: '문화시설', distance: '1.2km', walkTime: '도보 15분', description: '자하 하디드가 설계한 세계적인 디자인 문화 공간입니다.' },
];

export default function CultureScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎭 문화 콘텐츠</Text>
        <Text style={styles.subtitle}>을지로 주변 추천 장소</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {['전통시장', '관광지', '음식점', '문화시설'].map((category) => (
          <View key={category} style={styles.section}>
            <Text style={styles.sectionTitle}>
              {category === '전통시장' && '🏪'}
              {category === '관광지' && '🗺️'}
              {category === '음식점' && '🍜'}
              {category === '문화시설' && '🏛️'}
              {' '}{category}
            </Text>
            {CULTURE_DATA
              .filter((p) => p.category === category)
              .map((place) => (
                <CultureCard
                  key={place.id}
                  place={place}
                  onPress={() => {}}
                />
              ))}
          </View>
        ))}
      </ScrollView>
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
});