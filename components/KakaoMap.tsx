import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

const KAKAO_MAP_KEY = 'ca8e6f0255a104a0c23afeabb67a3f1b';

const generateMapHTML = (
  apiKey: string,
  currentLocation: {
    latitude: number;
    longitude: number;
  } | null,
  shops: any[]
) => `
<!DOCTYPE html>
<html>

<head>
<meta charset="utf-8" />

<meta
name="viewport"
content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
/>

<script src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false"></script>

<style>
html, body {
  margin:0;
  padding:0;
  width:100%;
  height:100%;
}

#map {
  width:100%;
  height:100%;
}
</style>

</head>

<body>

<div id="map"></div>

<script>

kakao.maps.load(function() {

  var container =
    document.getElementById('map');

  var options = {
    center: new kakao.maps.LatLng(37.5665, 126.9983),
    level: 5
  };

  var map =
  new kakao.maps.Map(
    container,
    options
  );

var userLocation =
  ${JSON.stringify(currentLocation)};

if (userLocation) {

  // 현재 위치를 지도 중심으로 설정, 원하면 주석 해제시 사용가능
  // map.setCenter(
  //   new kakao.maps.LatLng(
  //     userLocation.latitude,
  //     userLocation.longitude
  //   )
  // );

  var userOverlay =
    new kakao.maps.CustomOverlay({
      position: new kakao.maps.LatLng(
        userLocation.latitude,
        userLocation.longitude
      ),

      content:
        '<div style="position:relative;">' +

        '<div style="' +
        'width:30px;' +
        'height:30px;' +
        // 'background:rgba(33,150,243,0.25);' +
        'border-radius:50%;' +
        'position:absolute;' +
        'top:-15px;' +
        'left:-15px;' +
        '"></div>' +

        '<div style="' +
        'width:14px;' +
        'height:14px;' +
        'background:#2196F3;' +
        'border:3px solid white;' +
        'border-radius:50%;' +
        'position:absolute;' +
        'top:-7px;' +
        'left:-7px;' +
        '"></div>' +

        '<div style="' +
        'position:absolute;' +
        'top:15px;' +
        'left:-25px;' +
        'width:70px;' +
        'text-align:center;' +
        'font-size:11px;' +
        'font-weight:bold;' +
        'color:#2196F3;' +
        // '">현재 위치</div>' +

        '</div>',

      yAnchor: 0.5,
      xAnchor: 0.5
    });

  userOverlay.setMap(map);
}

var shops = ${JSON.stringify(shops)};

  shops.forEach(function(shop) {

    var markerPosition =
      new kakao.maps.LatLng(
        shop.lat,
        shop.lng
      );

    var div =
      document.createElement('div');

    div.innerHTML =
      '<div style="background:#1e1e2e;border:2px solid #4FC3F7;border-radius:12px;padding:8px 12px;text-align:center;cursor:pointer;">' +
      '<div style="font-size:20px;">🧺</div>' +
      '<div style="color:white;font-size:11px;font-weight:bold;">' +
      shop.name +
      '</div>' +
      '<div style="color:#4FC3F7;font-size:10px;">세탁 ' +
      shop.washer +
      ' · 건조 ' +
      shop.dryer +
      '</div>' +
      '</div>';

    div.addEventListener('click', function() {

      window.ReactNativeWebView.postMessage(
        JSON.stringify(shop)
      );

    });

    var overlay =
      new kakao.maps.CustomOverlay({
        position: markerPosition,
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
  onShopSelect: (shop: any) => void;
  currentLocation: {
    latitude: number;
    longitude: number;
  } | null;
  shops: {
    id: number;
    name: string;
    lat: number;
    lng: number;
    washer: number;
    dryer: number;
    distance: string;
  }[];
}

export default function KakaoMap({
  onShopSelect,
  currentLocation,
  shops
}: KakaoMapProps) {

  const handleMessage = (event: any) => {
    try {
      const shop =
        JSON.parse(
          event.nativeEvent.data
        );

      onShopSelect(shop);

    } catch (error) {

      console.log(
        '메시지 파싱 오류',
        error
      );

    }
  };

  return (
    <View style={styles.container}>
      <WebView
        source={{
          html: generateMapHTML(
            KAKAO_MAP_KEY,
            currentLocation,
            shops
            ),
        }}
        style={styles.webview}
        onMessage={handleMessage}
        javaScriptEnabled
        domStorageEnabled
        mixedContentMode="always"
        originWhitelist={['*']}

        onLoad={() =>
          console.log(
            '지도 로드 성공'
          )
        }

        onError={(e) =>
          console.log(
            'WEBVIEW ERROR',
            e.nativeEvent
          )
        }

        onHttpError={(e) =>
          console.log(
            'HTTP ERROR',
            e.nativeEvent
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },

  webview: {
    flex: 1,
  },
});