const BASE_URL = 'https://apis.data.go.kr/B551011/KorService2';
const TOUR_API_KEY = '7e52df8ddf6a48242dc153a65162fad73bd20fdcdfc47048bd7c5288dbb88e68';
const getApiKey = () => TOUR_API_KEY;

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

const CONTENT_TYPE: { [key: string]: string } = {
  관광지: '12',
  문화시설: '14',
  행사: '15',
  음식점: '39',
};

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

export const fetchNearbyPlaces = async (
  lat: number,
  lng: number,
  radius: number = 1000,
  contentTypeId?: string
): Promise<TourPlace[]> => {
  try {
    let url = `${BASE_URL}/locationBasedList2?serviceKey=${getApiKey()}&numOfRows=10&pageNo=1&MobileOS=ETC&MobileApp=LaundriP&_type=json&mapX=${lng}&mapY=${lat}&radius=${radius}&arrange=E`;

    if (contentTypeId) {
      url += `&contentTypeId=${contentTypeId}`;
    }

    const response = await fetch(url);
    const text = await response.text();
    // console.log('TourAPI 응답:', text.slice(0, 200)); 

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
      image: item.firstimage || '',
    }));
  } catch (error) {
    console.log('TourAPI 오류:', error);
    return [];
  }
};

export const fetchFestivals = async (
  lat: number,
  lng: number
): Promise<TourPlace[]> => {
  try {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const url = `${BASE_URL}/searchFestival2?serviceKey=${getApiKey()}&numOfRows=5&pageNo=1&MobileOS=ETC&MobileApp=LaundriP&_type=json&eventStartDate=${today}&mapX=${lng}&mapY=${lat}&arrange=E`;
    const response = await fetch(url);
    const text = await response.text();
    // console.log('축제 API 응답:', text.slice(0, 200));

    if (text.includes('Unauthorized') || text.includes('<') || !text.startsWith('{')) {
      return [];
    }

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
      image: item.firstimage || '',
    }));
  } catch (error) {
    console.log('축제 API 오류:', error);
    return [];
  }
};