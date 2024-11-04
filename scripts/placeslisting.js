var place_id = new URLSearchParams(window.location.search).get("id");
// <div id='app'></div>
const app = Vue.createApp({
    data() {
        return {
            result: {},
            open: null // key: value
        };
    }, // data
    computed: {
        formattedOpeningHours() {
            var openingHours = {};
            for (var text of this.result.opening_hours.weekday_text) {
                var arr = text.split(": ",2);
                openingHours[arr[0]] = arr[1];
            }
            return openingHours;
        }
    }

});
const vm = app.mount('#app');

// google places api query
function doPlaceSearch() {
    // console.log(place_id);
    map = new google.maps.Map(document.getElementById("map"), {
        center: {
            lat: -33.8666,
            lng: 151.1958
        },
        zoom: 15
    });
    service = new google.maps.places.PlacesService(map);
    service.getDetails({
        placeId: place_id
    }, callback);
}

// update result in vue app
function callback(results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
        // console.log(results);
        vm.result = results;
        if (results.opening_hours) {
            vm.open = results.opening_hours.isOpen();
        }
        createMarker(results);
    }
}

// create map marker
function createMarker(place) {
    // console.log(place);

    map = new google.maps.Map(
        document.getElementById('map'), {
            zoom: 15,
            center: place.geometry.location,
        });
    var marker = new google.maps.Marker({
        position: place.geometry.location,
        map: map

    });
}
