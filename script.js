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

// 글로벌 변수로 만듭니다.
// let map, mapEvent;

class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);

  constructor(coord, distance, duration) {
    this.coord = coord; // [lat,lng]
    this.distance = distance; // in km
    this.duration = duration; // in min
  }
}

class Running extends Workout {
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
class Cyling extends Workout {
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

const run1 = new Running([39, -12], 5.2, 24, 178);
const cycling1 = new Cyling([39, -12], 27, 95, 523);
console.log(run1, cycling1);

///////////////////////////////////////////////////////////////////////////'
class App {
  #map;
  #mapEvent;

  constructor() {
    this._getPosition();

    //submit 버튼이 없고 엔터를 누르면 추가 되도록 함수를 만듭니다.
    form.addEventListener('submit', this._newWorkout.bind(this));

    // type의 select가 바뀌면 함수가 실행됩니다.toggle을 이용해 바뀌었을때 새로운 html이 나오도록 설정합니다.
    //elev gain은 부모 요소인 div에 hide 클레스틑 설정해준뒤 toggle을 이용했습니다.

    inputType.addEventListener('change', this._toggleElevationField.bind(this));
  }

  _getPosition() {
    //geolocation API를 이용해 위치정보를 받아오겠습니다.
    //2가지 콜백이 있습니다. 성공 콜백과 실패 콜백이 있습니다.
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert('could not get your position');
        }
      );
  }
  _loadMap(position) {
    // console.log(position);
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    console.log(`https://www.google.com/maps/@${latitude},${longitude}`);

    const coords = [latitude, longitude];

    //L은 leaflet에서 제공하는 중요한 기능입니다. map() 값은 html의 멥이 표시되어햐는 id값이어야합니다.
    this.#map = L.map('map').setView(coords, 20);

    console.log(this);
    //titleLayer은 map의 타일을 바꿀수 있습니다.
    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    // 자바스크립트의 addEventListener 대신 Leaflet 의 on을사용합니다. click 이벤트를 이용해서 좌표를 구합니다.
    // handling clicks on map
    this.#map.on('click', this._showForm.bind(this));
  }
  _showForm(mepE) {
    this.#mapEvent = mepE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }
  _toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }
  _newWorkout(e) {
    e.preventDefault();

    //추가 되거나 리프레쉬가 되면 리셋됩니다.
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        '';

    //display marker
    console.log(this.#mapEvent);
    const { lat, lng } = this.#mapEvent.latlng;
    L.marker({ lat, lng })
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          minWidth: 100,
          maxWidth: 250,
          autoClose: false,
          closeOnClick: false,
          className: 'running-popup',
        })
      )
      .setPopupContent('Workout')
      .openPopup();
  }
}

const app = new App();