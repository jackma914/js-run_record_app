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

class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);
  constructor(coords, distance, duration) {
    this.coords = coords; // [lat, lng]
    this.distance = distance; // km
    this.duration = duration; // min
  }
}

class Running extends Workout {
  type = 'running';

  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
  }

  calcPace() {
    // min/km
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}
class Cycling extends Workout {
  type = 'cycling';
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
  }
  calcSpeed() {
    // km/h
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

// const run1 = new Running([39, -12], 10, 10, 123);
// const cycling1 = new Cycling([39, -12], 10, 10, 100);
// console.log(run1, cycling1);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
class App {
  #map;
  #mapEvent;
  #workouts = [];

  constructor() {
    this.getPosition();

    form.addEventListener('submit', this.newWorkout.bind(this));

    inputType.addEventListener('change', this.toggleElevationField);
  }

  getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this.loadMap.bind(this),
        function () {
          return alert('위치정보를 찾을수 없습니다.');
        }
      );
  }

  loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    const coords = [latitude, longitude];
    this.#map = L.map('map').setView(coords, 13);
    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    // 지도 클링 handling
    // 자바스크립트의 메서드가아닌 leaflet의 on 메서드 입니다.
    this.#map.on('click', this.showForm.bind(this));
  }

  showForm(mapE) {
    this.#mapEvent = mapE;

    form.classList.remove('hidden');
    inputDistance.focus();
  }

  toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  newWorkout(e) {
    // 유효성 검사 도구 validator
    const validInputs = (...inputs) =>
      inputs.every(inp => Number.isFinite(inp));
    const allPositive = (...inputs) => inputs.every(inp => inp > 0);

    e.preventDefault();

    // form 에서 데이터 받아옵니다.
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;

    // workout running 이면, running 객체 생성
    if (type === 'running') {
      const cadence = +inputCadence.value;
      // 데이터 유효성 검사
      if (
        !validInputs(duration, distance, cadence) ||
        !allPositive(distance, duration, cadence)
        // !Number.isFinite(distance) ||
        // !Number.isFinite(duration) ||
        // !Number.isFinite(cadence)
      )
        return alert('숫자와 양수만 입력 가능합니다. ');

      workout = new Running([lat, lng], distance, duration, cadence);
    }

    // workout cycling 이면, cycling 객체 생성
    if (type === 'cycling') {
      if (type === 'cycling') {
        const elevation = +inputElevation.value;
        // 데이터 유효성 검사
        if (
          !validInputs(duration, distance, elevation) ||
          !allPositive(distance, duration)
          // !Number.isFinite(distance) ||
          // !Number.isFinite(duration) ||
          // !Number.isFinite(cadence)
        )
          return alert('숫자와 양수만 입력 가능합니다. (Elev Gain 음수 가능) ');

        workout = new Cycling([lat, lng], distance, duration, elevation);
      }
    }

    // workout 배열에 새 객체 추가
    this.#workouts.push(workout);
    console.log(this.#workouts);

    // 마커로 지도에 workout 렌더링
    this.renderWorkoutMarker(workout);

    // 리스트에 workout 렌더링

    //hide form + input 필드 초기화
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        '';
  }

  renderWorkoutMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent('workout.distance')
      .openPopup();
  }
}

const app = new App();
