const BASE_URL = 'https://apis.data.go.kr/B551011/KorService2';
const TOUR_API_KEY = '7e52df8ddf6a48242dc153a65162fad73bd20fdcdfc47048bd7c5288dbb88e68';
const KAKAO_REST_KEY = '3625437720f404cc7bde32beeba08ed7';
const CULTURE_BASE_URL = 'https://apis.data.go.kr/B553457/rgnCltrFcltExmnv1';

export interface TourPlace {
  id: string;
  name: string;
  category: string;
  distance: string;
  walkTime: string;
  description: string;
  mapx: string;
  mapy: string;
  image: string;
}

const getWalkTime = (distanceM: number): string => {
  const minutes = Math.round(distanceM / 67);
  return `도보 ${minutes}분`;
};

const getDistance = (distanceM: number): string => {
  if (distanceM < 1000) return `${distanceM}m`;
  return `${(distanceM / 1000).toFixed(1)}km`;
};

const getCategoryName = (contentTypeId: string): string => {
  const map: { [key: string]: string } = {
    '12': '관광지',
    '14': '문화시설',
    '15': '축제/행사',
    '32': '숙박',
    '38': '쇼핑',
    '39': '음식점',
  };
  return map[contentTypeId] || '기타';
};

const haversineRaw = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371000;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const dphi = ((lat2 - lat1) * Math.PI) / 180;
  const dlng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dphi / 2) ** 2 + Math.cos(phi1) * Math.cos(phi2) * Math.sin(dlng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// 주소 → 좌표 변환
const getCoordFromAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
  try {
    const response = await fetch(
      `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(address)}`,
      { headers: { Authorization: `KakaoAK ${KAKAO_REST_KEY}` } }
    );
    const data = await response.json();
    const doc = data?.documents?.[0];
    if (!doc) return null;
    return { lat: parseFloat(doc.y), lng: parseFloat(doc.x) };
  } catch {
    return null;
  }
};

// TourAPI 위치 기반 관광정보
export const fetchNearbyPlaces = async (
  lat: number,
  lng: number,
  radius: number = 1000,
  contentTypeId?: string
): Promise<TourPlace[]> => {
  try {
    let url = `${BASE_URL}/locationBasedList2?serviceKey=${TOUR_API_KEY}&numOfRows=10&pageNo=1&MobileOS=ETC&MobileApp=LaundriP&_type=json&mapX=${lng}&mapY=${lat}&radius=${radius}&arrange=E`;
    if (contentTypeId) url += `&contentTypeId=${contentTypeId}`;

    const response = await fetch(url);
    const text = await response.text();
    const data = JSON.parse(text);
    const items = data?.response?.body?.items?.item || [];

    return items.map((item: any) => ({
      id: item.contentid,
      name: item.title,
      category: getCategoryName(item.contenttypeid),
      distance: getDistance(Math.round(item.dist)),
      walkTime: getWalkTime(Math.round(item.dist)),
      description: item.addr1 || '상세 정보 없음',
      mapx: item.mapx,
      mapy: item.mapy,
      image: (item.firstimage || '').replace('http://', 'https://'),
    }));
  } catch (error) {
    console.log('TourAPI 오류:', error);
    return [];
  }
};

// TourAPI 축제 정보
export const fetchFestivals = async (
  lat: number,
  lng: number
): Promise<TourPlace[]> => {
  try {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const url = `${BASE_URL}/searchFestival2?serviceKey=${TOUR_API_KEY}&numOfRows=10&pageNo=1&MobileOS=ETC&MobileApp=LaundriP&_type=json&eventStartDate=${today}&arrange=E`;

    const response = await fetch(url);
    const text = await response.text();
    //console.log('축제 API 응답:', text.slice(0, 300));

    if (!text.startsWith('{')) return [];
    const data = JSON.parse(text);
    const items = data?.response?.body?.items?.item || [];

    return items.map((item: any) => ({
      id: item.contentid,
      name: item.title,
      category: '축제/행사',
      distance: '',
      walkTime: '',
      description: item.addr1 || '상세 정보 없음',
      mapx: item.mapx,
      mapy: item.mapy,
      image: (item.firstimage || '').replace('http://', 'https://'),
    }));
  } catch (error) {
    console.log('축제 API 오류:', error);
    return [];
  }
};

// 문화기반시설 (박물관/미술관) - 주소→좌표 변환 방식
export const fetchCultureFacilities = async (
  lat: number,
  lng: number,
  radiusM: number = 2000
): Promise<TourPlace[]> => {
  try {
    const KEY = TOUR_API_KEY;
    const YEAR = '2023';

    const [museumRes, galleryRes] = await Promise.all([
      fetch(`${CULTURE_BASE_URL}/clifMsmv1?serviceKey=${KEY}&pageNo=1&numOfRows=30&resultType=json&pblshYr=${YEAR}`),
      fetch(`${CULTURE_BASE_URL}/clifArglv1?serviceKey=${KEY}&pageNo=1&numOfRows=30&resultType=json&pblshYr=${YEAR}`),
    ]);

    const [museumText, galleryText] = await Promise.all([
      museumRes.text(),
      galleryRes.text(),
    ]);

    // console.log('박물관 응답:', museumText.slice(0, 150));
    // console.log('미술관 응답:', galleryText.slice(0, 150));

    const parseAndFilter = async (
  text: string,
  categoryLabel: string,
  nameField: string
): Promise<TourPlace[]> => {
  if (!text.startsWith('{')) return [];
  const data = JSON.parse(text);
  
  // body.data가 배열
  const raw = data?.response?.body?.data;
  if (!raw) return [];
  const items = Array.isArray(raw) ? raw : [raw];

  const results: TourPlace[] = [];
  for (const item of items) {
    const address = item.instAddr;
    if (!address) continue;
    const coord = await getCoordFromAddress(address);
    if (!coord) continue;
    const distM = haversineRaw(lat, lng, coord.lat, coord.lng);
    if (distM > radiusM) continue;

    results.push({
      id: `cf_${item[nameField] || address}`,
      name: item[nameField] || '문화시설',
      category: '문화시설',
      distance: distM < 1000 ? `${Math.round(distM)}m` : `${(distM / 1000).toFixed(1)}km`,
      walkTime: `도보 ${Math.round(distM / 67)}분`,
      description: `${categoryLabel} | ${address}`,
      mapx: String(coord.lng),
      mapy: String(coord.lat),
      image: '',
    });
  }

  return results.sort((a, b) =>
    haversineRaw(lat, lng, parseFloat(a.mapy), parseFloat(a.mapx)) -
    haversineRaw(lat, lng, parseFloat(b.mapy), parseFloat(b.mapx))
  );
};

    const [museums, galleries] = await Promise.all([
      parseAndFilter(museumText, '박물관', 'msmNm'),
      parseAndFilter(galleryText, '미술관', 'arglNm'),
    ]);

    // console.log(`박물관 ${museums.length}개, 미술관 ${galleries.length}개 찾음`);
    return [...museums, ...galleries];

  } catch (error) {
    console.log('문화기반시설 오류:', error);
    return [];
  }
};

export const fetchPlaceDetail = async (contentId: string): Promise<any> => {
  try {
    const url = `${BASE_URL}/detailCommon2?serviceKey=${TOUR_API_KEY}&MobileOS=ETC&MobileApp=LaundriP&_type=json&contentId=${contentId}&defaultYN=Y&firstImageYN=Y&addrinfoYN=Y&overviewYN=Y`;
    const response = await fetch(url);
    const text = await response.text();
    const data = JSON.parse(text);
    const item = data?.response?.body?.items?.item?.[0];
    return item || null;
  } catch (error) {
    console.log('상세정보 오류:', error);
    return null;
  }
};

// KCISA 축제 (미사용이지만 export 유지)
export const fetchFestivalsKCISA = async (): Promise<TourPlace[]> => {
  return [];
};