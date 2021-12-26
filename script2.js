'use strict';

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);

  constructor(coords, distance, duration) {
    this.coords = coords; // [lat, lng]
    this.distance = distance; // in km
    this.duration = duration; // in min
    // this.date = new Date();
    // this.id = (new Date() + '').slice(-10);
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
    //min/km
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

// const run1 = new Running([39, 20], 5.2, 24, 178);
// const run2 = new Cycling([39, 20], 52.2, 100, 523);
// console.log(run1, run2);

//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class App {
  #map;
  #mapEvent;
  #workouts = [];

  constructor() {
    this.getPosition();
    // addEvent의 this는 App를 바라보지 않고 form의 this를 바라봅니다. bind(this)로 App를 보라보게 해주었습니다.
    form.addEventListener('submit', this.newWorkout.bind(this));
    inputType.addEventListener('change', this.toggleElevationField);
  }

  getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this.loadMap.bind(this),
        function () {
          alert('Could not get your position');
        }
      );
  }

  loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;

    const coords = [latitude, longitude];
    this.#map = L.map('map').setView(coords, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot//{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    //handleing clicks on map
    // addEvent의 this는 App를 바라보지 않고 map의 this를 바라봅니다. bind(this)로 App를 보라보게 해주었습니다.
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
    //input에 숫자가 아닌 문자가 들어가는지를 판별하는 함수입니다. every 메소드를 이용하여 하나라도 false값이라면 every는 false를 반환합니다.
    const validInputs = (...inputs) =>
      inputs.every(inp => Number.isFinite(inp));
    // 숫자가 정수 인지를 판별합니다.
    const allPositive = (...inputs) => inputs.every(inp => inp > 0);
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;

    e.preventDefault();

    // get data from form
    const type = inputType.value;
    // +를 넣어준 이유는 값이 문자열로 넘어오기때문에 숫자로 바꾸어주었습니다.
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;

    // if activity running, create running object
    if (type === 'running') {
      const cadence = +inputCadence.value;
      //check if data is valid
      //Number.isFinite를 이용하여 숫자가 입력 되었는지 판별합니다. type 의 distance에 문자를 입력하면 NaN가 전달됩니다. NaN는 false 입니다.
      if (
        //아래의 코드 3줄을 validInputs 함수로 대체합니다.
        // !Number.isFinite(distance) ||
        // !Number.isFinite(duration) ||
        // !Number.isFinite(cadence)

        !validInputs(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence)
      )
        return alert('input have to be positive numbers!');

      workout = new Running([lat, lng], distance, duration, cadence);
    }

    // if activity cycling, create cycling object
    if (type === 'cycling') {
      const elevation = +inputElevation.value;
      if (
        !validInputs(distance, duration, elevation) ||
        !allPositive(distance, duration)
      ) {
        return alert('input have to be positive numbers!');
      }

      workout = new Cycling([lat, lng], distance, duration, elevation);
    }

    // add new object to workout array
    this.#workouts.push(workout);

    // render workout on map as marker
    this.renderWorkoutMarker(workout);
    // render workout on list

    //clear field
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
      .setPopupContent('workout')
      .openPopup();
  }
}

const app = new App();
