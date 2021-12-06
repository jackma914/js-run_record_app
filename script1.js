'use strict';

class Workout {
  constructor(distance, duration, type) {}
}

// APPLICATION ARCHITECTURE
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

  constructor() {
    this.getPosition();
  }

  getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(this.loadMap.bind(this));
    }
  }

  loadMap(position) {
    const { latitude, longitude } = position.coords;

    this.#map = L.map('map').setView([latitude, longitude], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on('click', this.showForm.bind(this));

    L.marker([latitude, longitude])
      .addTo(this.#map)
      .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
      .openPopup();

    // L.marker(workout.coords)
    //   .addTo(this.#map)
    //   .bindPopup(
    //     L.popup({
    //       maxWidth: 250,
    //       minWidth: 100,
    //       autoClose: false,
    //       closeOnClick: false,
    //       //popup에는 설정 해놓은 css를 참고하여 className을 type으로 변경해서 마커의 색을 running과 cycling을 구분하게 해주었습니다.
    //       className: `${workout.type}-popup`,
    //     })
    //   )
    //   .setPopupContent(
    //     `${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'}${workout.description}`
    //   )
    //   .openPopup();
  }
  showForm(mapE) {
    inputDistance.focus();
    console.log(mapE);
    form.classList.remove('hidden');

    this.#mapEvent = mapE;
  }

  newWorkout() {
    inputType.value;
  }

  renderWorkout() {}
  renderWorkoutMarker() {}
  hideForm() {}
  toggleElevationField() {}
}

const app = new App();
