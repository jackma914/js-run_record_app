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

//
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    position => {
      console.log(position);
      const { latitude } = position.coords;
      const { longitude } = position.coords;
      console.log(`https://www.google.com/maps/@${latitude},${longitude}`);

      //먼저 var를 const로 바꿔줍니다. map 함수에는 HTML의 body에 "map" id를 가진 요소가 필요합니다. <div id="map"><div>

      //setView와 marker에서 원하는값이 배열이기때문에 latitude와 longitude를 배열고 묶어주겠습니다.
      const coords = [latitude, longitude];
      console.log(coords);

      const map = L.map('map').setView(coords, 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      //leaflet의 on 메소드는 addeventlistener과 같습니다.
      map.on('click', mapEvent => {
        // console.log(mapEvent);
        const { lat, lng } = mapEvent.latlng;

        L.marker({ lat, lng })
          .addTo(map)
          .bindPopup(
            L.popup({
              minWidth: 250,
              minWidth: 100,
              autoClose: false,
              closeOnClick: false,
              className: 'runnung-popup',
            })
          )
          .setPopupContent('workout')
          .openPopup();
      });
    },
    () => {
      alert('could not get your position');
    }
  );
}
