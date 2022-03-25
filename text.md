1.  navigator.geolocation.getCurrentPosition()을 이용해 현재 위치정보를 가져옵니다. 인자로는 2개를 받습니다. 콜백과 애러 콜백 인자를 받습니다.

2.  leaflet을 이용하여 지도를 구현합니다. 해당 프로잭트에는 CDN을 이용해 라이브러리를 가져왔습니다.

    - script 태그의 defer속성을 이용하여 지도가 먼저 다 로드 한뒤에 main.js를 읽도록 구현했습니다.
    - 지도를 구현하기 위해 map함수에는 html에 있는 요소의 id의 이름과 같아야 합니다.

      ```js
      // index.html
      <div id="map"></div>;

      // main.js
      const map = L.map('map').setView([51.505, -0.09], 13);
      ```

    - 지도에서 eventhandler를 사용 하여 클릭한 지도의 좌표를 받아오려고 합니다.
      방법은 leaflet map 함수의 on메서드를 사용합니다.
      ```js
      map.on('click', function (position) {
        console.log(position);
      });
      ```
