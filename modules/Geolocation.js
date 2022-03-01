export function GeolocationMap() {
  if (navigator.geolocation)
    navigator.geolocation.getCurrentPosition(
      function (position) {
        const { latitude } = position.coords;
        const { longitude } = position.coords;
        const coords = [latitude, longitude];
        let map = L.map('map').setView(coords, 13);
        L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        // 자바스크립트의 메서드가아닌 leaflet의 on 메서드 입니다.
        map.on('click', function (mapEvent) {
          console.log(mapEvent);
          const { lat, lng } = mapEvent.latlng;

          L.marker([lat, lng])
            .addTo(map)
            .bindPopup(
              L.popup({
                maxWidth: 250,
                minWidth: 100,
                autoClose: false,
                closeOnClick: false,
                className: 'running-popup',
              })
            )
            .setPopupContent('Workout')
            .openPopup();
        });
      },
      function () {
        return alert('위치정보를 찾을수 없습니다.');
      }
    );
}
