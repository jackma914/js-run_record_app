'use strict';

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
  #mapZoomLevel = 13;
  #mapEvent;
  #workouts = [];

  constructor() {
    //생성자 함수를 이용해서 getPosition() 메서드를 트리거 합니다.
    this._getPosition();

    // 로컬 스토리지 에서 데이터를 가져옵니다.
    this._getLocalStorage();

    // 이벤트 헨들러
    // bind(this)를 하지 않는다면 this.는 form을 바라보게 됩니다.
    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toggleElevationField);
    containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));
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
    this.#map = L.map('map').setView(coords, this.#mapZoomLevel);

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    // 클릭한 곳의 위치정보를 받기 위해 map.on 메서드를 사용합니다.
    this.#map.on('click', this._showForm.bind(this));

    this.#workouts.forEach(work => {
      this._renderWorkoutMarker(work);
    });
  }

  _showForm(mapE) {
    //받아온 mapE는 클릭한 위치정보입니다. 글로벌 변수 mapEvent에 데이터를 복사하였습니다..
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _hideForm() {
    // input 초기화
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        '';

    // form.style.display = 'none';
    form.classList.add('hidden');
    // setTimeout(() => (form.style.display = 'grid'), 1000);
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
    this.#workouts.push(workout);

    // 지도에 마커를 workout 렌더링합니다.
    this._renderWorkoutMarker(workout);

    // list에 workout을 렌더링합니다.
    this._rednerWorkoutList(workout);

    // 이벤트가 발생하고 input를 초기화 해주었습니다.
    this._hideForm();

    // local storage
    this._setLocalStorage();
  }

  _renderWorkoutMarker(workout) {
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
      .setPopupContent(
        `${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.description}`
      )
      .openPopup();
  }

  _rednerWorkoutList(workout) {
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
      </div>
    `;

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
    </li>
      `;

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
    </li>
      `;

    form.insertAdjacentHTML('afterend', html);
  }

  _moveToPopup(e) {
    const workoutEl = e.target.closest('.workout');
    console.log(workoutEl);

    if (!workoutEl) return;
    const workout = this.#workouts.find(
      work => work.id === workoutEl.dataset.id
    );

    console.log(workout);

    this.#map.setView(workout.coords, this.#mapZoomLevel, {
      animate: true,
      pan: {
        duration: 1,
      },
    });
  }

  _setLocalStorage() {
    //setItem 메서드를 이용해 데이터를 추가합니다. 인자로는 키와 데이터가 필요합니다. 데이터는 문자열이여야합니다. JSON.stringify를사용해 문자열로 변환합니다.
    localStorage.setItem('workouts', JSON.stringify(this.#workouts));
  }

  _getLocalStorage() {
    //getItem을 이용해 데이터를 가져옵니다. JSON.parse를 이용해 데이터를 문자열에서 객체로 변환하여 받아옵니다.
    const data = JSON.parse(localStorage.getItem('workouts'));

    if (!data) return;

    // workouts 배열에는 새로고침되면 데이터는 항상 비어있습니다. _getLocalStorage() 메서드는 앱이 시작되면 즉시 실행되는 메서드입니다. 실행즉시 받아온 데이터를 #workouts에 넣어줍니다.
    this.#workouts = data;
    // 넣어준 데이터를 forEach 메서드를 통해 list에 데이터를 넣어줍니다. forEach메서드를 사용한 이유는 새로운 배열을 생성하고 싶지 않기때문입니다. 예를들어 map 메서드는 새로운 배열을 리턴합니다.
    // 지도에는 오류가 발생합니다. 이유는 _getLocalStorage() 메서드는 앱이 켜지고 바로 호출 되는 메서드입니다. _renderWorkoutMarker() 메서드가 받은 데이터로 마커를 실행할 시점에는 지도가 로드 되지 않았습니다.
    this.#workouts.forEach(work => {
      this._rednerWorkoutList(work);
    });
  }

  // _reset() {
  //   localStorage.removeItem('workouts');
  //   location.reload();
  // }
}

const app = new App();
