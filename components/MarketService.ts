const marketsData = require('./markets.json');

export interface Market {
  id: string;
  name: string;
  category: '전통시장';
  lat: number;
  lng: number;
  address: string;
  items: string;
  distance: string;
  walkTime: string;
  description: string;
  mapx: string;
  mapy: string;
  image: string;
}

const ALL_MARKETS: Market[] = marketsData as Market[];

// Haversine 거리 계산
export const haversine = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371000;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const dphi = ((lat2 - lat1) * Math.PI) / 180;
  const dlng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dphi / 2) ** 2 + Math.cos(phi1) * Math.cos(phi2) * Math.sin(dlng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// 거리 기반 필터링
export const getMarketsNearby = async (
  lat: number,
  lng: number,
  radiusM: number = 2000
): Promise<Market[]> => {
  return ALL_MARKETS
    .map((market) => {
      const dist = haversine(lat, lng, market.lat, market.lng);
      const distStr = dist < 1000 ? `${Math.round(dist)}m` : `${(dist / 1000).toFixed(1)}km`;
      const walkMin = Math.round(dist / 67);
      return {
        ...market,
        distance: distStr,
        walkTime: `도보 ${walkMin}분`,
        _dist: dist,
      };
    })
    .filter((m) => m._dist <= radiusM)
    .sort((a, b) => a._dist - b._dist)
    .map(({ _dist, ...m }) => m);
};

// 키워드 필터링 (AI 연동용)
export const filterMarketsByKeyword = async (
  lat: number,
  lng: number,
  keyword: string,
  radiusM: number = 2000
): Promise<Market[]> => {
  const nearby = await getMarketsNearby(lat, lng, radiusM);
  return nearby.filter((m) =>
    m.items.includes(keyword) || m.name.includes(keyword)
  );
};

// 전체 데이터 반환 (AI 추천용)
export const getAllMarkets = (): Market[] => ALL_MARKETS;   