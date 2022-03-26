// ======================= Workout class ===========================================
class Workout {
  // 날짜를 받아옵니다.
  date = new Date();
  // id를 생성합니다.
  id = (Date.now() + '').slice(-10);

  constructor(coords, distance, duration) {
    this.coords = coords; // 좌표 [lat, lng]
    this.distance = distance; // 단위는 km 입니다
    this.duration = duration; // 단위는 min 입니다.
  }
}

// ========================== 자식 class ===========================================
class Running extends Workout {
  //type 데이터를 만들었습니다.
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
  //type 데이터를 만들었습니다.

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

// const run1 = new Running([30, -12], 5.2, 24, 178);
// const cycling1 = new Cycling([39, -12], 27, 95, 528);
// console.log(run1, cycling1);
