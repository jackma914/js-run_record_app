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

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

//map을 그롤벌 변수로 바꾸어줍니다.

class App {
  #map;
  #mapEvent;

  constructor() {
    this._getPosition();
  }

  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), () => {
        alert('could not get your position');
      });
    }
  }
  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    console.log(`https://www.google.com/maps/@${latitude},${longitude}`);

    //먼저 var를 const로 바꿔줍니다. map 함수에는 HTML의 body에 "map" id를 가진 요소가 필요합니다. <div id="map"><div>

    //setView와 marker에서 원하는값이 배열이기때문에 latitude와 longitude를 배열고 묶어주겠습니다.
    const coords = [latitude, longitude];

    this.#map = L.map('map').setView(coords, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    //leaflet의 on 메소드는 addeventlistener과 같습니다.
    //map.on 메소드 값을 mapEvent 글로벌 변수로 만들어줍니다.
    this.#map.on('click', mapE => {
      this.#mapEvent = mapE;
      form.classList.remove('hidden');
      inputDistance.focus();

      // console.log(mapEvent);
    });
  }

  _showForm() {}
  _toggleElevationField() {}
  _newWorkout() {}
}

const app = new App();

form.addEventListener('submit', e => {
  e.preventDefault();

  // submit이 실행되면 입력했던 값들이 리셋됩니다.
  inputElevation.value =
    inputCadence.value =
    inputDuration.value =
    inputDistance.value =
      '';

  //디스플레이 마커 입니다.
  const { lat, lng } = mapEvent.latlng;
  L.marker({ lat, lng })
    .addTo(map)
    .bindPopup(
      L.popup({
        minWidth: 250,
        minWidth: 100,
        autoClose: false,
        closeOnClick: false,
        className: 'running-popup',
      })
    )
    .setPopupContent('workout')
    .openPopup();
});

//type의 값이 변하면 토글을 이용해 옵션을 바뀌게 하였습니다.
inputType.addEventListener('change', function () {
  inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
  inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
});
