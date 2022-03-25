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
    - popup을 커스텀 하기 위해 L.popup()메서드를 사용해 옵션을 넣어줍니다.

3.  사용자가 지도를 클릭하면 workout input form이 렌더링 됩니다.

    - map.on()메서드로 클릭시 form에 "hidden"를 만들어서 클릭시 "hidden" 클레스가 remove되도록 구현했습니다.

      ```js
      map.on('click', function (mapE) {
        //받아온 mapE는 클릭한 위치정보입니다. 글로벌 변수 mapEvent에 데이터를 복사하였습니다..
        mapEvent = mapE;
        form.classList.remove('hidden');
        inputDistance.focus();
      });
      ```

    - !imoportant 생성됨 form에서 데이터를 입력후 데이터를 submit하는 form.addEventListener() 메서드를 만듭니다. geolocation과는 무관하기 때문에 분리해서 구현했습니다. form 에서 넘어온 데이터를 marker와 연결 해야하기때문에 L.marker 메서드를 form.addEventListener()로 들여옵니다. 여기서 발생하는 두가지 문제가 있습니다. mapEvent와 map 함수의 데이터를 받을수가 없게 되었습니다. 이를 해결하기 위해 geolocation 속에 들어있던 두가지의 데이터를 글로벌 변수(전역 변수)로 만들어 주었습니다.

      ```js
      // 글로벌 변수(전역 변수)
      let map, mapEvent;

      // 콜백과 오류 콜백 인자 두개를 받습니다.
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          function (position) {
            const { latitude } = position.coords;
            const { longitude } = position.coords;

            const coords = [latitude, longitude];

            // map 함수는 글로벌 변수로 만들었습니다.
            map = L.map('map').setView(coords, 13);

            L.tileLayer(
              'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
              {
                attribution:
                  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
              }
            ).addTo(map);

            // 클릭한 곳의 위치정보를 받기 위해 map.on 메서드를 사용합니다.
            map.on('click', function (mapE) {
              //받아온 mapE는 클릭한 위치정보입니다. 글로벌 변수 mapEvent에 데이터를 복사하였습니다..
              mapEvent = mapE;
              form.classList.remove('hidden');
              inputDistance.focus();
            });
          },
          function () {
            alert('위치 정보를 받아오지 못했습니다.');
          }
        );
      }
      ```

    - workout input form의 type을 closest 메서드와 toggle 메서드를 이용해 토글을 구현하겠습니다.
      중요한점은 토글을 구현하기 위해 html을 부모요소와 hidden 클레스가 필요합니다.
      ```js
      inputType.addEventListener('change', function () {
        inputElevation
          .closest('.form__row')
          .classList.toggle('form__row--hidden');
        inputCadence
          .closest('.form__row')
          .classList.toggle('form__row--hidden');
      });
      ```
