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

    - !important 생성됨 form에서 데이터를 입력후 데이터를 submit하는 form.addEventListener() 메서드를 만듭니다. geolocation과는 무관하기 때문에 분리해서 구현했습니다. form 에서 넘어온 데이터를 marker와 연결 해야하기때문에 L.marker 메서드를 form.addEventListener()로 들여옵니다. 여기서 발생하는 두가지 문제가 있습니다. mapEvent와 map 함수의 데이터를 받을수가 없게 되었습니다. 이를 해결하기 위해 geolocation 속에 들어있던 두가지의 데이터를 글로벌 변수(전역 변수)로 만들어 주었습니다.

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

    - form이 submit이 되면 input 부분의 데이터들이 초기화가 되도록 구현하였습니다.
      중요한 점은 element.value를 적지 않으면 에러가 발생합니다.

      ```js
      inputDistance.value =
        inputDuration.value =
        inputCadence.value =
        inputElevation.value =
          '';
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

4.  코드를 class를 생성하여 구현하겠습니다(기술 차트 참조).

    - App 클래스를 생성합니다.

      ```js
      class App (){
          constructor() {}
          _getPosition() {}
          _loadMap() {}
          _showForm() {}
          _toggleElevationField() {}
          _newWorkout() {}
      }
      ```

    - 먼저 현재 위치를 받아오는 \_getPosition() 메서드를 구현하겠습니다.

      ```js
      _getPosition() {
        // 콜백과 오류 콜백 인자 두개를 받습니다.
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(

            //첫번째 인자로 _loadMap 메서드에 데이터를 보내줍니다. 여기서 중요한점은 bind(this)입니다. bind를 하지 않고 데이터를 보내게 된다면 에러가 발생합니다. 이유는 여기서 _loadMap 메서드는 getCurrentPosition의 콜백 함수인 일반함수로 호출 됩니다. 그렇기 때문에 _loadMap()의 this키워드는 정의되지 않았습니다. 이 경우에는 bind()를 이용해서 수동으로 바인딩 해주면 해결됩니다.
            this._loadMap.bind(this),
            function () {
              alert('위치 정보를 받아오지 못했습니다.');
            }
          );
        }
      }
      ```

    - \_getPosition() 메서드에서 보내진 값을 \_loadMap() 메서드로 받아옵니다.
      아래 예제에서 글로벌 변수앞에 this.#이 붇은 이유는 다음에서 설명하겠습니다.

      ```js
      _loadMap(position) {

        // 위에서 bind(this)를 하지 않았다면 _loadMap()메서드는 에러와 undefined를 반환합니다.
        console.log(this);
        const { latitude } = position.coords;
        const { longitude } = position.coords;

        const coords = [latitude, longitude];

        // map 함수는 글로벌 변수로 만들었습니다.
        this.#map = L.map('map').setView(coords, 13);

        L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(this.#map);

        // 클릭한 곳의 위치정보를 받기 위해 map.on 메서드를 사용합니다.
        this.#map.on('click', function (mapE) {
          //받아온 mapE는 클릭한 위치정보입니다. 글로벌 변수 mapEvent에 데이터를 복사하였습니다..
          this.#mapEvent = mapE;
          form.classList.remove('hidden');
          inputDistance.focus();
        });
      }
      ```

    - private class field를 이용해 데이터를 안전하게 보관하겠습니다. 아래 private class field를 사용하려면 선언한 변수 앞에 this.#을 입력해야합니다.

      ```js

      class App {
        //Private class fields 선언
        #map;
        #mapEvent;

        constructor() {
        }

        ...
      ```

    - \_newWorkout, \_toggleElevationField 구현하기위해 class 밖에 구현 되어있던 addEventListener를 constructor 생성자 함수에 넣어줌으로써 이벤트는 항상 사용할수 있게 구현합니다. 인자로 메서드를 호출합니다.

      ```js
      constructor() {
        ...

        // bind(this)를 하지 않는다면 this.는 form을 바라보게 됩니다.
        form.addEventListener('submit', this._newWorkout.bind(this));
        // _toggleElevationField 메서드는 this를 수동으로 반딘힝 하지 않아도 구동됩니다.
        inputType.addEventListener('change', this._toggleElevationField);
      }
      ```

5.  workout 클래스 생성, Running, Cycling 자식 클래스를 생성합니다.

    - Workout 부모 클래스의 생성자 함수에는 coords,distance,duration를 받아옵니다(이는 자식 클래스에서도 쓰이는 공통으로 사용하는 데이터입니다.)
      ```js
        constructor(coords, distance, duration) {
        this.coords = coords; // 좌표
        this.distance = distance; // 단위는 km 입니다
        this.duration = duration; // 단위는 min 입니다.
        }
      ```
    - data,id 생성, Date.now() 메소드는 UTC 기준으로 1970년 1월 1일 0시 0분 0초부터 현재까지 경과된 밀리 초를 반환합니다.

      ```js
      // 날짜를 받아옵니다.
      date = new Date();
      // id를 생성합니다.
      id = (Date.now() + '').slice(-10);
      ```

    - 자식 컴포넌트인 Running,Cycling에서 부모 클래스에서 변수를 받아오기 위해 super를 사용하여 부모 생성자를 호출합니다.
      ```js
      class Running extends Workout {
        constructor(coords, distance, duration, cadence) {
          super(coords, distance, duration);
          this.cadence = cadence;
        }
      }
      ```
    - Running 에서는 pace, Cycling 에서는 speed를 구하는 메서드를 생성합니다. Running과 Cycling 인스턴스를 생성 하여 console.log() 보면 pace와 speed가 계산되어 들어가 있는걸 확인할수 있습니다.

      ```js

      calcPace() {
        // pace 구하는 공식입니다. min/km
        this.pace = this.duration / this.distance;
        return this.pace;
      }

        calcSpeed() {
        // speed를 구하는 공식입니다.h를 구해야하기때문에 /60을 해줍니다. km/h
        this.speed = this.distance / (this.duration / 60);
        return this.speed;
      }
      ```

6.  새로운 Running,Cycling을 생성후 workouts 배열에 push 합니다. 리스트,지도를 marker와 렌더링됩니다. workout input form에서 데이터를 보내기전 유효성 검사도 구현합니다.

    - 먼저 유효성 검사를 위해 생성한 함수와 type에 따라 적용해 보았습니다.
      숫자만 적을수 있고 양수만 입력가능합니다( elevation 제외)
      중요할점은 cycling에서 elevation은 고도를 뜻합니다. 즉 내려가는 구간이 존재하므로 음수를 사용해야합니다.

      ```js
      _newWorkout(e) {
        // 유효성 체크 함수를 만들었습니다. every 함수를 이용합니다.
        // allPositiveNum은 음수인지를 판별하는 함수입니다.
        const validInput = (...inputs) =>
          inputs.every(inp => Number.isFinite(inp));

        const allPositiveNum = (...inputs) =>
          inputs.every(inp => inp > 0);


        e.preventDefault();

        // form에서 데이터를 받아옵니다. inputType은 html select 테그입니다
        const type = inputType.value;
        const distance = +inputDistance.value;
        const duration = +inputDuration.value;

        // type이 running 이라면 running 객체를 생성합니다.
        if (type === 'running') {
          const cadence = +inputCadence.value;

          //데이터가 유효성 체크합니다.
          if (
            // !Number.isFinite(distance) ||
            // !Number.isFinite(duration) ||
            // !Number.isFinite(cadence)
            !validInput(distance, duration, cadence) ||
            !allPositiveNum(distance, duration, cadence)
          )
            return alert('양수만 입력 가능합니다!');
        }

        // type이 cycling 이라면 cycling 객체를 생성합니다.
        // elevation은 "고도" 이므로 음수도 사용가능합니다.
        if (type === 'cycling') {
          const elevation = +inputElevation.value;
          if (
            !validInput(distance, duration, elevation) ||
            !allPositiveNum(distance, duration)
          )
            return alert('양수만 입력 가능합니다!');
        }
      ```

    * 유효성에서 통과한다면 새로운 객체를 생성합니다.

      ```js
      // type이 running 이라면 running 객체를 생성합니다.
      if (type === 'running') {
        const cadence = +inputCadence.value;

        //데이터가 유효성 체크합니다.
        if (
          !validInput(distance, duration, cadence) ||
          !allPositiveNum(distance, duration, cadence)
        ) {
          return alert('양수만 입력 가능합니다!');
        }

        const workout = new Running([lat, lng], distance, duration, cadence);
      }

      // type이 cycling 이라면 cycling 객체를 생성합니다.
      if (type === 'cycling') {
        const elevation = +inputElevation.value;
        if (
          !validInput(distance, duration, elevation) ||
          !allPositiveNum(distance, duration)
        )
          return alert('양수만 입력 가능합니다!');

        const workout = new Cycling([lat, lng], distance, duration, elevation);
      }
      ```

    * 데이터를 담아놓을 workouts 배열을 private으로 생성합니다.

      ```js
        #workout = [];
      ```

    * 생성한 배열에 workout 객체를 push해서 넣어주도록 하겠습니다. push는 running, cycling 둘중 하나에 무조건 구현되기 때문에 if문 밖에 구현했습니다.
      ```js
      // #workout 새로운 객체 추가
      this.#workout.push(workout);
      ```
    * 여기서 새로운 문제가 발생합니다. if문에 있는 const workout은 블록스코프 이기때문에 글로벌 let workout을 생성한뒤 재할당을 해주었습니다.

      ```js
      let workout;

      if (type === 'running') {
        const cadence = +inputCadence.value;

        //데이터가 유효성 체크합니다.
        if (
          !validInput(distance, duration, cadence) ||
          !allPositiveNum(distance, duration, cadence)
        ) {
          return alert('양수만 입력 가능합니다!');
        }

        workout = new Running([lat, lng], distance, duration, cadence);
      }
      ```

    * 새로 생성된 workout의 데이터와 마커를 렌더링합니다.
      렌더링중 type별로 마커의 색상을 다르게하는 className옵션에 type을 더이상 가져올수 없습니다. 이를 해결하기위해 Running, Cycling 클래스에 직접 type을 정의했습니다. 이제 workout에 type데이터가 존제합니다.

      ```js

        // 지도에 마커를 workout 렌더링합니다.
        this.renderWorkoutMarker(workout);

      renderWorkoutMarker(workout) {
        L.marker(workout.coords)
          .addTo(this.#map)
          .bindPopup(
            //팝업 마커를 커스텀을 위해 L.popup 메서드를 이용해 옵션을 넣어줍니다.
            L.popup({
              maxWidth: 250,
              minWidth: 100,
              autoClose: false,
              closeOnClick: false,
              className: `${workout.type}-popup`,
            })
          )
          .setPopupContent()
          .openPopup();
      }
      ```
