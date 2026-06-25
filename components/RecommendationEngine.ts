import AsyncStorage from '@react-native-async-storage/async-storage';

const GEMINI_KEY = process.env.EXPO_PUBLIC_GEMINI_KEY || 'AQ.Ab8RN6Kzci2ry4MoExUH6dr-ZSz66aRpc8mNI5Gv5xL6yqoHYw';
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// 선호도 → 카테고리 mapping
const PREFERENCE_CATEGORY_MAP: { [key: string]: string[] } = {
  history: ['관광지', '문화시설', '전통시장'],
  food: ['음식점', '전통시장'],
  shopping: ['전통시장', '쇼핑'],
  nature: ['관광지'],
  festival: ['축제/행사', '관광지'],
  art: ['문화시설', '관광지'],
};

// 카테고리 → 벡터 인덱스
const CATEGORIES = ['관광지', '음식점', '문화시설', '전통시장', '쇼핑', '축제/행사'];

// 벡터 생성
const toVector = (categories: string[]): number[] => {
  return CATEGORIES.map((cat) => (categories.includes(cat) ? 1 : 0));
};

// Cosine Similarity
const cosineSimilarity = (a: number[], b: number[]): number => {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  if (magA === 0 || magB === 0) return 0;
  return dot / (magA * magB);
};

// Haversine 거리 계산
const haversine = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371000;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const dphi = ((lat2 - lat1) * Math.PI) / 180;
  const dlng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dphi / 2) ** 2 + Math.cos(phi1) * Math.cos(phi2) * Math.sin(dlng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export interface RecommendedPlace {
  id: string;
  name: string;
  category: string;
  distance: string;
  walkTime: string;
  description: string;
  mapx: string;
  mapy: string;
  image: string;
  score: number;
}

// 메인 추천 함수
export const getRecommendations = async (
  places: any[],
  userLat: number,
  userLng: number,
  remainMinutes: number
): Promise<RecommendedPlace[]> => {
  // 1. 사용자 선호도 로드
  let preferences: string[] = [];
  try {
    const saved = await AsyncStorage.getItem('user_preferences');
    if (saved) preferences = JSON.parse(saved);
  } catch {
    preferences = [];
  }

  // 2. 사용자 선호 카테고리 벡터 생성
  const preferredCategories = preferences.flatMap(
    (pref) => PREFERENCE_CATEGORY_MAP[pref] || []
  );
  const userVector = toVector([...new Set(preferredCategories)]);

  // 3. 도보 왕복 가능 시간 계산 (잔여 시간의 80%만 사용, 여유 확보)
  const availableMinutes = remainMinutes * 0.8;
  const maxWalkSeconds = (availableMinutes / 2) * 60; // 편도
  const maxDistanceM = maxWalkSeconds * 67; // 67m/분

  // 4. 1차 필터링: 거리 조건
  const nearbyPlaces = places.filter((place) => {
    if (!place.mapx || !place.mapy) return false;
    const dist = haversine(
      userLat, userLng,
      parseFloat(place.mapy), parseFloat(place.mapx)
    );
    return dist <= maxDistanceM;
  });

  // 5. 2차 필터링 + 점수화: Cosine Similarity + 거리 가중치
  const scored = nearbyPlaces.map((place) => {
    const dist = haversine(
      userLat, userLng,
      parseFloat(place.mapy), parseFloat(place.mapx)
    );

    // 장소 카테고리 벡터
    const placeVector = toVector([place.category]);

    // Cosine Similarity (선호도 점수)
    const similarityScore = cosineSimilarity(userVector, placeVector);

    // 거리 점수 (가까울수록 높음, 0~1)
    const distanceScore = 1 - dist / maxDistanceM;

    // 최종 점수 (선호도 70% + 거리 30%)
    const finalScore = similarityScore * 0.7 + distanceScore * 0.3;

    const distStr = dist < 1000 ? `${Math.round(dist)}m` : `${(dist / 1000).toFixed(1)}km`;
    const walkMin = Math.round(dist / 67);

    return {
      ...place,
      distance: distStr,
      walkTime: `도보 ${walkMin}분`,
      score: finalScore,
    };
  });

  // 6. 점수 내림차순 정렬 후 상위 5개
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
};

// Gemini API로 다국어 장소 소개 생성
export const generatePlaceDescription = async (
  placeName: string,
  category: string,
  address: string,
  language: string = 'English'
): Promise<string> => {
  try {
    const prompt = `You are a travel guide for foreign tourists in Seoul, Korea.
Write a short, friendly 2-3 sentence description of "${placeName}" (${category}) located at "${address}" in ${language}.
Focus on what makes it special for tourists. Be concise and engaging.`;

    const response = await fetch(GEMINI_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${GEMINI_KEY}`,
  },
  body: JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { maxOutputTokens: 50, temperature: 0.3 },
  }),
});

    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  } catch (error) {
    console.log('Gemini API 오류:', error);
    return '';
  }
};

// 선호도 기반 추천 (Cosine Similarity만)
export const getPreferenceBasedRecommendations = async (
  places: any[],
  userLat: number,
  userLng: number,
  remainMinutes: number
): Promise<RecommendedPlace[]> => {
  let preferences: string[] = [];
  try {
    const saved = await AsyncStorage.getItem('user_preferences');
    if (saved) preferences = JSON.parse(saved);
  } catch {
    preferences = [];
  }

  const preferredCategories = preferences.flatMap(
    (pref) => PREFERENCE_CATEGORY_MAP[pref] || []
  );
  const userVector = toVector([...new Set(preferredCategories)]);
  const availableMinutes = remainMinutes * 0.8;
  const maxDistanceM = (availableMinutes / 2) * 60 * 67;

  return places
    .filter((place) => {
      if (!place.mapx || !place.mapy) return false;
      const dist = haversine(userLat, userLng, parseFloat(place.mapy), parseFloat(place.mapx));
      return dist <= maxDistanceM;
    })
    .map((place) => {
      const dist = haversine(userLat, userLng, parseFloat(place.mapy), parseFloat(place.mapx));
      const placeVector = toVector([place.category]);
      const similarityScore = cosineSimilarity(userVector, placeVector);
      const distanceScore = 1 - dist / maxDistanceM;
      const finalScore = similarityScore * 0.7 + distanceScore * 0.3;
      const distStr = dist < 1000 ? `${Math.round(dist)}m` : `${(dist / 1000).toFixed(1)}km`;
      return {
        ...place,
        distance: distStr,
        walkTime: `도보 ${Math.round(dist / 67)}분`,
        score: finalScore,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
};

// Gemini AI 추천
export const getAIRecommendations = async (
  places: any[],
  userLat: number,
  userLng: number,
  remainMinutes: number,
  preferences: string[]
): Promise<RecommendedPlace[]> => {
  try {
    const availableMinutes = remainMinutes * 0.8;
    const maxDistanceM = (availableMinutes / 2) * 60 * 67;

    // 거리 필터링
    const nearby = places
      .filter((place) => {
        if (!place.mapx || !place.mapy) return false;
        const dist = haversine(userLat, userLng, parseFloat(place.mapy), parseFloat(place.mapx));
        return dist <= maxDistanceM;
      })
      .slice(0, 20);

    if (nearby.length === 0) return [];

    const prefLabels = preferences.map((p) => ({
      history: '역사/문화',
      food: '미식',
      shopping: '쇼핑',
      nature: '자연/산책',
      festival: '축제/행사',
      art: '예술',
    }[p] || p));

    const placeList = nearby.map((p, i) =>
      `${i + 1}. ${p.name} (${p.category}) - ${p.distance || '근처'}`
    ).join('\n');

    const prompt = `You are a travel assistant for foreign tourists in Seoul.
User preferences: ${prefLabels.join(', ')}
Available time: ${remainMinutes} minutes (can walk ${Math.round(maxDistanceM)}m one way)

Nearby places:
${placeList}

Pick the TOP 3 best places for this user based on their preferences and available time.
Respond ONLY with a JSON array of place numbers like: [2, 5, 1]
No explanation, just the JSON array.`;

    const response = await fetch(`${GEMINI_URL}?key=${GEMINI_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 50, temperature: 0.3 },
      }),
    });

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
    const clean = text.replace(/```json|```/g, '').trim();
    const indices: number[] = JSON.parse(clean);

    console.log('Gemini 응답:', JSON.stringify(data).slice(0, 300));
    console.log('Gemini 텍스트:', text);

    return indices
      .map((i) => nearby[i - 1])
      .filter(Boolean)
      .map((place) => {
        const dist = haversine(userLat, userLng, parseFloat(place.mapy), parseFloat(place.mapx));
        return {
          ...place,
          distance: dist < 1000 ? `${Math.round(dist)}m` : `${(dist / 1000).toFixed(1)}km`,
          walkTime: `도보 ${Math.round(dist / 67)}분`,
          score: 1,
        };
      });
  } catch (error) {
    console.log('Gemini 추천 오류:', error);
    return [];
  }
};