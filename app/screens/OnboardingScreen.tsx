import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PREFERENCES = [
  { id: 'history', label: '역사/문화', icon: '🏛️', description: '박물관, 유적지, 전통문화' },
  { id: 'food', label: '미식', icon: '🍜', description: '전통음식, 로컬 맛집, 시장음식' },
  { id: 'shopping', label: '쇼핑', icon: '🛍️', description: '전통시장, 쇼핑거리' },
  { id: 'nature', label: '자연/산책', icon: '🌿', description: '공원, 하천, 산책로' },
  { id: 'festival', label: '축제/행사', icon: '🎉', description: '지역 축제, 문화행사' },
  { id: 'art', label: '예술', icon: '🎨', description: '미술관, 갤러리, 공연' },
];

interface OnboardingScreenProps {
  onComplete: () => void;
}

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [selected, setSelected] = useState<string[]>([]);

  const togglePreference = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleComplete = async () => {
    try {
      await AsyncStorage.setItem('user_preferences', JSON.stringify(selected));
      onComplete();
    } catch (error) {
      console.log('선호도 저장 오류:', error);
      onComplete();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>🧺</Text>
        <Text style={styles.title}>LaundriP에 오신 것을{'\n'}환영합니다!</Text>
        <Text style={styles.subtitle}>
          세탁 대기 시간 동안{'\n'}어떤 걸 즐기고 싶으신가요?
        </Text>
        <Text style={styles.hint}>복수 선택 가능</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {PREFERENCES.map((pref) => (
          <TouchableOpacity
            key={pref.id}
            style={[
              styles.card,
              selected.includes(pref.id) && styles.cardSelected,
            ]}
            onPress={() => togglePreference(pref.id)}
          >
            <Text style={styles.cardIcon}>{pref.icon}</Text>
            <View style={styles.cardText}>
              <Text style={[
                styles.cardLabel,
                selected.includes(pref.id) && styles.cardLabelSelected,
              ]}>
                {pref.label}
              </Text>
              <Text style={styles.cardDesc}>{pref.description}</Text>
            </View>
            {selected.includes(pref.id) && (
              <Text style={styles.checkmark}>✓</Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.button,
            selected.length === 0 && styles.buttonDisabled,
          ]}
          onPress={handleComplete}
          disabled={selected.length === 0}
        >
          <Text style={styles.buttonText}>
            {selected.length === 0 ? '관심사를 선택해주세요' : '시작하기 →'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipButton} onPress={handleComplete}>
          <Text style={styles.skipText}>건너뛰기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  logo: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#aaa',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
  hint: {
    fontSize: 12,
    color: '#4FC3F7',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a3e',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: 12,
  },
  cardSelected: {
    borderColor: '#4FC3F7',
    backgroundColor: '#1a2a3a',
  },
  cardIcon: {
    fontSize: 32,
  },
  cardText: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  cardLabelSelected: {
    color: '#4FC3F7',
  },
  cardDesc: {
    fontSize: 12,
    color: '#888',
  },
  checkmark: {
    fontSize: 20,
    color: '#4FC3F7',
    fontWeight: 'bold',
  },
  footer: {
    padding: 20,
    gap: 8,
  },
  button: {
    backgroundColor: '#4FC3F7',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#333',
  },
  buttonText: {
    color: '#1a1a2e',
    fontWeight: 'bold',
    fontSize: 16,
  },
  skipButton: {
    alignItems: 'center',
    padding: 8,
  },
  skipText: {
    color: '#666',
    fontSize: 14,
  },
});