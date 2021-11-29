'use strict';

class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);

  constructor(coords, distance, duration) {
    this.coords = coords; // [lat, lng]
    this.distance = distance; // in km
    this.duration = duration; // in min
  }

  setDescription() {
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

    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    }${this.date.getDate()}`;
  }
}

class Running extends Workout {
  type = 'running';
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
    this.setDescription();
  }

  calcPace() {
    //min/km
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}
class Cycling extends Workout {
  type = 'cycling';

  constructor(coords, distance, duration, elevation) {
    super(coords, distance, duration);
    this.elevation = elevation;
    this.calcSpeed();
    this.setDescription();
  }

  calcSpeed() {
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

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
  mapZoomLevel = 13;
  #workout = [];

  constructor() {
    this.getPosition();

    //   // inputType 값이 change 되면 toggle을 작동합니다.
    inputType.addEventListener('change', this.toggleElevationFields.bind(this));

    form.addEventListener('submit', this.newWorkout.bind(this));

    // form.addEventListener('click', this.movePopup.bind(this));
  }

  getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this.loadMap.bind(this),
        function () {
          alert('could not get your position');
        }
      );
  }

  loadMap(position) {
    console.log(position);
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    const coords = [latitude, longitude];

    this.#map = L.map('map').setView(coords, this.mapZoomLevel);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on('click', this.showForm.bind(this));
  }

  showForm(mapE) {
    form.classList.remove('hidden');
    inputDistance.focus();

    this.#mapEvent = mapE;
  }

  // inputType 값이 change 되면 toggle을 작동합니다.
  toggleElevationFields() {
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
  }

  hideForm() {
    inputDuration.value =
      inputDistance.value =
      inputCadence.value =
      inputElevation.value =
        '';

    //showForm에서 leafletjs on 메서드에서 클릭하면 hidden remove 합니다. 작성후 hideform 메서드의 초기화와 hidden add가 작동합니다. 다시 map을 클릭하면 showForm이 작동하면서 hidden form이 구현됩니다.
    form.classList.add('hidden');

    //display를 none으로 함으로써 기존 추가될때마다 작동하면 transition이 작동하지 않습니다. 이는 추가되는 부분의 form만 transition이 작동하지 않게 해주는 디테일입니다.
    form.style.display = 'none';

    // display가 none이 되었을때에는 display의 어떠한 효과도 없기때문에 form이 겹치는 현상이 생깁니다. 이를 해결하기위해 setTimeout을 이용하여 grid를 다시 설정해줍니다.
    setTimeout(() => (form.style.display = 'grid'), 500);
  }

  newWorkout(e) {
    e.preventDefault();
    const type = inputType.value;
    const distance = Number(inputDistance.value);
    const duration = Number(inputDuration.value);
    const { lat, lng } = this.#mapEvent.latlng;

    let workout;

    // 유한수인지를 판별하는 함수입니다.
    const validValue = (...inputs) => inputs.every(num => Number.isFinite(num));
    // 정수 인지를 판별하는 함수입니다.
    const allPositive = (...inputs) => inputs.every(num => num > 0);

    if (type === 'running') {
      const cadence = Number(inputCadence.value);

      if (
        !validValue(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence)
      )
        return alert('error');

      workout = new Running([lat, lng], duration, distance, cadence);
    }

    if (type === 'cycling') {
      const elevation = Number(inputElevation.value);

      if (
        !validValue(distance, duration, elevation) ||
        !allPositive(distance, duration)
      )
        return alert('error');

      workout = new Cycling([lat, lng], duration, distance, elevation);
    }

    //#workout에 값을 저정해줍니다.
    this.#workout.push(workout);

    // hideform 메서드를 이용해 form의 값들을 초기화해줍니다.
    this.hideForm();

    this.renderWorkout(workout);

    this.movePopup();

    this.renderWorkoutMarker(workout);
  }

  movePopup() {}

  renderWorkout(workout) {
    let html = `
    <li class="workout workout--${workout.type}" data-id="${workout.id}">
      <h2 class="workout__title">${workout.description}</h2>
      <div class="workout__details">
        <span class="workout__icon">${
          workout.type === 'running' ? '🏃' : '🚴‍♀️'
        }</span>
        <span class="workout__value">${workout.distance}</span>
        <span class="workout__unit">km</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⏱</span>
        <span class="workout__value">${workout.duration}</span>
        <span class="workout__unit">min</span>
      </div>`;

    if (workout.type === 'running') {
      html += `    
     <div class="workout__details">
        <span class="workout__icon">⚡️</span>
        <span class="workout__value">${workout.pace.toFixed(1)}</span>
        <span class="workout__unit">min/km</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">🦶🏼</span>
        <span class="workout__value">${workout.cadence}</span>
        <span class="workout__unit">spm</span>
    </div>
  </li>`;
    } else {
      html += `
      
      <div class="workout__details">
      <span class="workout__icon">⚡️</span>
      <span class="workout__value">${workout.speed.toFixed(1)}</span>
      <span class="workout__unit">min/h</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">🦶🏼</span>
      <span class="workout__value">${workout.elevation}</span>
      <span class="workout__unit">m</span>
    </div>
  </li>
      `;
    }

    form.insertAdjacentHTML('afterend', html);
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
          //popup에는 설정 해놓은 css를 참고하여 className을 type으로 변경해서 마커의 색을 running과 cycling을 구분하게 해주었습니다.
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        `${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'}${workout.description}`
      )
      .openPopup();
  }
}

const app = new App();
