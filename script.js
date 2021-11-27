// 'use strict';

// class Workout {
//   date = new Date();
//   id = (Date.now() + '').slice(-10);
//   clicks = 0;

//   constructor(coords, distance, duration) {
//     // this.date = ...
//     // this.id = ...
//     this.coords = coords; // [lat, lng]
//     this.distance = distance; // in km
//     this.duration = duration; // in min
//   }

//   _setDescription() {
//     // prettier-ignore
//     const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

//     this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
//       months[this.date.getMonth()]
//     } ${this.date.getDate()}`;
//   }

//   click() {
//     this.clicks++;
//   }
// }

// class Running extends Workout {
//   type = 'running';

//   constructor(coords, distance, duration, cadence) {
//     super(coords, distance, duration);
//     this.cadence = cadence;
//     this.calcPace();
//     this._setDescription();
//   }

//   calcPace() {
//     // min/km
//     this.pace = this.duration / this.distance;
//     return this.pace;
//   }
// }

// class Cycling extends Workout {
//   type = 'cycling';

//   constructor(coords, distance, duration, elevationGain) {
//     super(coords, distance, duration);
//     this.elevationGain = elevationGain;
//     // this.type = 'cycling';
//     this.calcSpeed();
//     this._setDescription();
//   }

//   calcSpeed() {
//     // km/h
//     this.speed = this.distance / (this.duration / 60);
//     return this.speed;
//   }
// }

// ///////////////////////////////////////
// // APPLICATION ARCHITECTURE
// const form = document.querySelector('.form');
// const containerWorkouts = document.querySelector('.workouts');
// const inputType = document.querySelector('.form__input--type');
// const inputDistance = document.querySelector('.form__input--distance');
// const inputDuration = document.querySelector('.form__input--duration');
// const inputCadence = document.querySelector('.form__input--cadence');
// const inputElevation = document.querySelector('.form__input--elevation');

// class App {
//   #map;
//   #mapZoomLevel = 13;
//   #mapEvent;
//   #workouts = [];

//   constructor() {
//     // Get user's position
//     this._getPosition();

//     // Get data from local storage
//     this._getLocalStorage();

//     // Attach event handlers
//     form.addEventListener('submit', this._newWorkout.bind(this));
//     inputType.addEventListener('change', this._toggleElevationField);
//     containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));
//   }

//   _getPosition() {
//     if (navigator.geolocation)
//       navigator.geolocation.getCurrentPosition(
//         this._loadMap.bind(this),
//         function () {
//           alert('Could not get your position');
//         }
//       );
//   }

//   _loadMap(position) {
//     const { latitude } = position.coords;
//     const { longitude } = position.coords;
//     // console.log(`https://www.google.pt/maps/@${latitude},${longitude}`);

//     const coords = [latitude, longitude];

//     this.#map = L.map('map').setView(coords, this.#mapZoomLevel);

//     L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
//       attribution:
//         '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
//     }).addTo(this.#map);

//     // Handling clicks on map
//     this.#map.on('click', this._showForm.bind(this));

//     this.#workouts.forEach(work => {
//       this._renderWorkoutMarker(work);
//     });
//   }

//   _showForm(mapE) {
//     this.#mapEvent = mapE;
//     form.classList.remove('hidden');
//     inputDistance.focus();
//   }

//   _hideForm() {
//     // Empty inputs
//     inputDistance.value =
//       inputDuration.value =
//       inputCadence.value =
//       inputElevation.value =
//         '';

//     form.style.display = 'none';
//     form.classList.add('hidden');
//     setTimeout(() => (form.style.display = 'grid'), 1000);
//   }

//   _toggleElevationField() {
//     inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
//     inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
//   }

//   _newWorkout(e) {
//     const validInputs = (...inputs) =>
//       inputs.every(inp => Number.isFinite(inp));
//     const allPositive = (...inputs) => inputs.every(inp => inp > 0);

//     e.preventDefault();

//     // Get data from form
//     const type = inputType.value;
//     const distance = +inputDistance.value;
//     const duration = +inputDuration.value;
//     const { lat, lng } = this.#mapEvent.latlng;
//     let workout;

//     // If workout running, create running object
//     if (type === 'running') {
//       const cadence = +inputCadence.value;

//       // Check if data is valid
//       if (
//         // !Number.isFinite(distance) ||
//         // !Number.isFinite(duration) ||
//         // !Number.isFinite(cadence)
//         !validInputs(distance, duration, cadence) ||
//         !allPositive(distance, duration, cadence)
//       )
//         return alert('Inputs have to be positive numbers!');

//       workout = new Running([lat, lng], distance, duration, cadence);
//     }

//     // If workout cycling, create cycling object
//     if (type === 'cycling') {
//       const elevation = +inputElevation.value;

//       if (
//         !validInputs(distance, duration, elevation) ||
//         !allPositive(distance, duration)
//       )
//         return alert('Inputs have to be positive numbers!');

//       workout = new Cycling([lat, lng], distance, duration, elevation);
//     }

//     // Add new object to workout array
//     this.#workouts.push(workout);

//     // Render workout on map as marker
//     this._renderWorkoutMarker(workout);

//     // Render workout on list
//     this._renderWorkout(workout);

//     // Hide form + clear input fields
//     this._hideForm();

//     // Set local storage to all workouts
//     this._setLocalStorage();
//   }

//   _renderWorkoutMarker(workout) {
//     L.marker(workout.coords)
//       .addTo(this.#map)
//       .bindPopup(
//         L.popup({
//           maxWidth: 250,
//           minWidth: 100,
//           autoClose: false,
//           closeOnClick: false,
//           className: `${workout.type}-popup`,
//         })
//       )
//       .setPopupContent(
//         `${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.description}`
//       )
//       .openPopup();
//   }

//   _renderWorkout(workout) {
//     let html = `
//       <li class="workout workout--${workout.type}" data-id="${workout.id}">
//         <h2 class="workout__title">${workout.description}</h2>
//         <div class="workout__details">
//           <span class="workout__icon">${
//             workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
//           }</span>
//           <span class="workout__value">${workout.distance}</span>
//           <span class="workout__unit">km</span>
//         </div>
//         <div class="workout__details">
//           <span class="workout__icon">⏱</span>
//           <span class="workout__value">${workout.duration}</span>
//           <span class="workout__unit">min</span>
//         </div>
//     `;

//     if (workout.type === 'running')
//       html += `
//         <div class="workout__details">
//           <span class="workout__icon">⚡️</span>
//           <span class="workout__value">${workout.pace.toFixed(1)}</span>
//           <span class="workout__unit">min/km</span>
//         </div>
//         <div class="workout__details">
//           <span class="workout__icon">🦶🏼</span>
//           <span class="workout__value">${workout.cadence}</span>
//           <span class="workout__unit">spm</span>
//         </div>
//       </li>
//       `;

//     if (workout.type === 'cycling')
//       html += `
//         <div class="workout__details">
//           <span class="workout__icon">⚡️</span>
//           <span class="workout__value">${workout.speed.toFixed(1)}</span>
//           <span class="workout__unit">km/h</span>
//         </div>
//         <div class="workout__details">
//           <span class="workout__icon">⛰</span>
//           <span class="workout__value">${workout.elevationGain}</span>
//           <span class="workout__unit">m</span>
//         </div>
//       </li>
//       `;

//     form.insertAdjacentHTML('afterend', html);
//   }

//   _moveToPopup(e) {
//     // BUGFIX: When we click on a workout before the map has loaded, we get an error. But there is an easy fix:
//     if (!this.#map) return;

//     const workoutEl = e.target.closest('.workout');

//     if (!workoutEl) return;

//     const workout = this.#workouts.find(
//       work => work.id === workoutEl.dataset.id
//     );

//     this.#map.setView(workout.coords, this.#mapZoomLevel, {
//       animate: true,
//       pan: {
//         duration: 1,
//       },
//     });

//     // using the public interface
//     // workout.click();
//   }

//   _setLocalStorage() {
//     localStorage.setItem('workouts', JSON.stringify(this.#workouts));
//   }

//   _getLocalStorage() {
//     const data = JSON.parse(localStorage.getItem('workouts'));

//     if (!data) return;

//     this.#workouts = data;

//     this.#workouts.forEach(work => {
//       this._renderWorkout(work);
//     });
//   }

//   reset() {
//     localStorage.removeItem('workouts');
//     location.reload();
//   }
// }

// const app = new App();

// ------------------------------------------------------------------------------

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
    // prettier-ignore
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
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
    this.setDescription();
  }

  calcSpeed() {
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

const run1 = new Running();
const run2 = new Cycling([30, -12], 5.2, 24, 178);
// console.log(run1, run2);

// --------------App------------------------------

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class App {
  // private 인스턴스 필드
  #map;
  #mapEvent;
  #workouts = [];

  constructor() {
    this.getPosition();
    //디스플레이 마커
    form.addEventListener('submit', this.newWorkout.bind(this));

    // closest 중요 !!Important
    inputType.addEventListener('change', this.toggleElevationField);
  }

  //
  getPosition() {
    if (navigator.geolocation)
      // getCurrentPosition 메소드에는 성공 값과 에러 값을 받습니다.
      navigator.geolocation.getCurrentPosition(
        this.loadMap.bind(this),
        function () {
          alert('could not get your position');
        }
      );
  }

  loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    const coords = [latitude, longitude];

    this.#map = L.map('map').setView(coords, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    //위치를 데이터를 showForm으로 보냅니다.
    this.#map.on('click', this.showForm.bind(this));
  }

  showForm(mapE) {
    form.classList.remove('hidden');
    inputDistance.focus();

    //showForm에서 받아온 위치 데이터를 전역변수로 설정해줍니다.
    this.#mapEvent = mapE;
  }

  hideForm() {
    // hide form + clear input fields, 이벤트가 활성화 된뒤에는 input의 숫자는 초기화 됩니다.
    inputDuration.value =
      inputDistance.value =
      inputCadence.value =
      inputElevation.value =
        '';

    // 하나의 form이 완성되면 input form이 hidden됩니다.
    form.classList.add('hidden');

    // 아래의 두줄의 코드는 옵션정도로 생각하면됩니다. 위의 add hidden 코드로인해 추가되면서 기존 가지고있던 css의 .form에서 display가 none이 됩니다. setTimeout을 이용하여 grid를 다시 추가해줬습니다.
    form.style.display = 'none';
    setTimeout(() => (form.style.display = 'grid'), 1000);
  }

  toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  newWorkout(e) {
    e.preventDefault();

    // validInputs는 아래 3줄의 코드를 every 메서드를 이용하여 간결한 코드로 만들었습니다.
    // !Number.isFinite(distance) ||
    //   !Number.isFinite(duration) ||
    //   !Number.isFinite(cadence);
    const validInputs = (...inputs) =>
      inputs.every(num => Number.isFinite(num));

    // running의 cadence에는 - 숫자가 들어갈수 없습니다. 하지만 elevation은 - 를 사용할수 있습니다. - 를 골라내는 함수를 만들었습니다.
    const allPositive = (...inputs) => inputs.every(num => num > 0);

    // get data from form 폼에서 데이터를 받아옵니다.
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;

    // 아래 if 문에 있는 workout은 스코프 체인으로 인해 밖에서 사용할수 없습니다. 블록 범위 밖에서 선언함으로써 사용이 가능해집니다.
    let workout;

    // if workout running, create running object
    if (type === 'running') {
      const cadence = +inputCadence.value;

      // check if data is valid
      // validInputs 함수를 이용하여 input의 값이 유한수가 아닌것을 골라서 에러를 출력합니다.
      if (
        !validInputs(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence)
      )
        return alert('Input have to be positive numbers!');

      workout = new Running([lat, lng], distance, duration, cadence);
    }

    // if workout cycling, create running object

    if (type === 'cycling') {
      const elevation = +inputElevation.value;

      // check if data is valid
      // validInputs 함수를 이용하여 input의 값이 유한수가 아닌것을 골라서 에러를 출력합니다.
      if (
        !validInputs(distance, duration, elevation) ||
        !allPositive(distance, duration)
      )
        return alert('Input have to be positive numbers!');

      workout = new Cycling([lat, lng], distance, duration, elevation);
    }

    // add new object to workout array, workout으로 받아온 Running의 값을 push 메서드로 #workouts에 담아줍니다.
    this.#workouts.push(workout);

    // render workout on map as marker
    this.renderWorkoutMarker(workout);

    // render workout on list
    this.renderWorkout(workout);

    // hide form + clear input fields, 이벤트가 활성화 된뒤에는 input의 숫자는 초기화 됩니다.
    this.hideForm();
  }

  renderWorkoutMarker(workout) {
    // render workout on map as marker 디스플레이 마커
    console.log(workout);

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

  renderWorkout(workout) {
    let html = `   
    <li class="workout workout--${workout.type}" data-id="${workout.id}">
      <h2 class="workout__title">${workout.description}</h2>
      <div class="workout__details">
        <span class="workout__icon">${
          workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
        }</span>
        <span class="workout__value">${workout.distance}</span>
        <span class="workout__unit">km</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⏱</span>
        <span class="workout__value">${workout.duration}</span>
        <span class="workout__unit">min</span>
      </div>`;

    if (workout.type === 'running')
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

    if (workout.type === 'cycling')
      html += `
          <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed(1)}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevationGain}</span>
            <span class="workout__unit">m</span>
          </div>
        </li> -->`;

    form.insertAdjacentHTML('afterend', html);
  }
}

const app = new App();
