'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

// ================================= App 클래스 ============================================
class App {
  //Private class fields 선언
  #map;
  #mapEvent;
  #workout = [];

  constructor() {
    //생성자 함수를 이용해서 getPosition() 메서드를 트리거 합니다.
    this._getPosition();

    // bind(this)를 하지 않는다면 this.는 form을 바라보게 됩니다.
    form.addEventListener('submit', this._newWorkout.bind(this));

    inputType.addEventListener('change', this._toggleElevationField);
  }

  _getPosition() {
    // 콜백과 오류 콜백 인자 두개를 받습니다.
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        // bind(this)를 사용하여 수동으로 this에 바인딩해줍니다.
        this._loadMap.bind(this),
        function () {
          alert('위치 정보를 받아오지 못했습니다.');
        }
      );
    }
  }
  _loadMap(position) {
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
    this.#map.on('click', this._showForm.bind(this));
  }
  _showForm(mapE) {
    //받아온 mapE는 클릭한 위치정보입니다. 글로벌 변수 mapEvent에 데이터를 복사하였습니다..
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    // 유효성 체크 함수를 만들었습니다. every 함수를 이용합니다.
    // allPositiveNum은 음수인지를 판별하는 함수입니다.
    const validInput = (...inputs) => inputs.every(inp => Number.isFinite(inp));
    const allPositiveNum = (...inputs) => inputs.every(inp => inp > 0);
    e.preventDefault();

    // form에서 데이터를 받아옵니다. inputType은 html select 테그입니다
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;

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

      workout = new Running([lat, lng], distance, duration, cadence);
    }

    // type이 cycling 이라면 cycling 객체를 생성합니다.
    if (type === 'cycling') {
      const elevation = +inputElevation.value;
      if (
        !validInput(distance, duration, elevation) ||
        !allPositiveNum(distance, duration)
      )
        return alert('양수만 입력 가능합니다!');

      workout = new Cycling([lat, lng], distance, duration, elevation);
    }

    // #workout 새로운 객체 추가
    this.#workout.push(workout);

    // 지도에 마커를 workout 렌더링합니다.
    this.renderWorkoutMarker(workout);

    // list에 workout을 렌더링합니다.

    // 이벤트가 발생하고 input를 초기화 해주었습니다.
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        '';
  }

  _renderWorkoutMarker(workout) {
    console.log(workout);
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
}

const app = new App();
