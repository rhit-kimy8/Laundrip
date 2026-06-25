import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

const KAKAO_MAP_KEY = 'ca8e6f0255a104a0c23afeabb67a3f1b';

const generateMapHTML = (
  apiKey: string,
  currentLocation: { latitude: number; longitude: number; } | null,
  shops: any[],
  tourPlaces: any[],
  showShops: boolean
) => `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
<script src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false"></script>
<style>
html, body { margin:0; padding:0; width:100%; height:100%; }
#map { width:100%; height:100%; }
</style>
</head>
<body>
<div id="map"></div>
<script>
kakao.maps.load(function() {
  var container = document.getElementById('map');
  var options = {
    center: new kakao.maps.LatLng(37.5665, 126.9983),
    level: 5
  };
  var map = new kakao.maps.Map(container, options);

  // 현재 위치 파란 점
  var userLocation = ${JSON.stringify(currentLocation)};
  if (userLocation) {
    var userOverlay = new kakao.maps.CustomOverlay({
      position: new kakao.maps.LatLng(userLocation.latitude, userLocation.longitude),
      content:
        '<div style="position:relative;">' +
        '<div style="width:14px;height:14px;background:#2196F3;border:3px solid white;border-radius:50%;position:absolute;top:-7px;left:-7px;"></div>' +
        '</div>',
      yAnchor: 0.5,
      xAnchor: 0.5
    });
    userOverlay.setMap(map);
  }

  // 세탁소 마커 (showShops가 true일 때만)
  var showShops = ${JSON.stringify(showShops)};
  if (showShops) {
    var shops = ${JSON.stringify(shops)};
    shops.forEach(function(shop) {
      var div = document.createElement('div');
      div.innerHTML =
        '<div style="background:#1e1e2e;border:2px solid #4FC3F7;border-radius:12px;padding:6px 8px;text-align:center;cursor:pointer;width:70px;">' +
        '<div style="font-size:16px;">🧺</div>' +
        '<div style="color:white;font-size:9px;font-weight:bold;text-align:center;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:60px;margin:0 auto;">' + shop.name + '</div>' +
        '<div style="color:#4FC3F7;font-size:8px;margin-top:2px;text-align:center;">세탁' + shop.washer + ' · 건조' + shop.dryer + '</div>' +
        '</div>';

      div.addEventListener('click', function() {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'shop',
          payload: shop
        }));
      });

      var overlay = new kakao.maps.CustomOverlay({
        position: new kakao.maps.LatLng(shop.lat, shop.lng),
        content: div,
        yAnchor: 1
      });
      overlay.setMap(map);
    });
  }

  // 관광지/음식점/문화시설 마커
  var categoryIcon = {
    '관광지': '🗺️',
    '음식점': '🍜',
    '문화시설': '🏛️',
    '숙박': '🏨',
    '쇼핑': '🛍️',
    '축제/행사': '🎉',
    '전통시장': '🏪',
    '기타': '📍'
  };

  var tourPlaces = ${JSON.stringify(tourPlaces)};
  tourPlaces.forEach(function(place) {
    if (!place.mapx || !place.mapy) return;

    var icon = categoryIcon[place.category] || '📍';
    var div = document.createElement('div');
    div.innerHTML =
      '<div style="background:rgba(30,30,46,0.9);border:1.5px solid #aaa;border-radius:10px;padding:4px 7px;text-align:center;cursor:pointer;white-space:nowrap;">' +
      '<div style="font-size:13px;">' + icon + '</div>' +
      '<div style="color:#fff;font-size:9px;max-width:55px;overflow:hidden;text-overflow:ellipsis;">' + place.name + '</div>' +
      '</div>';

    div.addEventListener('click', function() {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'place',
        payload: place
      }));
    });

    var overlay = new kakao.maps.CustomOverlay({
      position: new kakao.maps.LatLng(parseFloat(place.mapy), parseFloat(place.mapx)),
      content: div,
      yAnchor: 1
    });
    overlay.setMap(map);
  });

});
</script>
</body>
</html>
`;

interface KakaoMapProps {
  showShops?: boolean;
  onShopSelect: (shop: any) => void;
  onPlaceSelect: (place: any) => void;
  currentLocation: { latitude: number; longitude: number; } | null;
  shops: {
    id: number;
    name: string;
    lat: number;
    lng: number;
    washer: number;
    dryer: number;
    distance: string;
  }[];
  tourPlaces: {
    id: string;
    name: string;
    category: string;
    mapx: string;
    mapy: string;
  }[];
}

export default function KakaoMap({ onShopSelect, onPlaceSelect, currentLocation, shops, tourPlaces, showShops = true }: KakaoMapProps) {
  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'shop') {
        onShopSelect(data.payload);
      } else if (data.type === 'place') {
        onPlaceSelect(data.payload);
      }
    } catch (error) {
      console.log('메시지 파싱 오류', error);
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        source={{
          html: generateMapHTML(KAKAO_MAP_KEY, currentLocation, shops, tourPlaces, showShops),
        }}
        style={styles.webview}
        onMessage={handleMessage}
        javaScriptEnabled
        domStorageEnabled
        mixedContentMode="always"
        originWhitelist={['*']}
        onError={(e) => console.log('WEBVIEW ERROR', e.nativeEvent)}
        onHttpError={(e) => console.log('HTTP ERROR', e.nativeEvent)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, borderRadius: 16, overflow: 'hidden' },
  webview: { flex: 1 },
});