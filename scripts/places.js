const app = Vue.createApp({
    data() {
        return {
            results: [],
            category: "Choose Category",
            options: [
                "Choose Category",
                "Amusement Park",
                "Aquarium",
                "Bakery",
                "Bar",
                "Cafe",
                "Clothing Store",
                "Department Store",
                "Electronics Store",
                "Furniture Store",
                "Gym",
                "Home Goods Store",
                "Library",
                "Movie Theater",
                "Museum",
                "Park",
                "Pet Store",
                "Restaurant",
                "Shoe Store",
                "Shopping Mall",
                "Supermarket",
                "Tourist Attraction",
                "Zoo"
            ]  // key: value
        };
    }, // data
});
const vm = app.mount('#app');

// initialize autocomplete and search button
function init() {
    autocomplete = new google.maps.places.Autocomplete((document.getElementById("autocomplete")),
        {
            types: ['geocode']
        })
    document.getElementById("searchBtn").addEventListener("click", doTextSearch);
}

// google places api query
function doTextSearch() {
    var place = autocomplete.getPlace() ?? {name: document.getElementById("autocomplete").value, geometry: {location: {lat: -33.8666,lng: 151.1958}}};
    // console.log(place);
    if (place == null || document.getElementById("autocomplete").value === "") {
        return;
    }
    map = new google.maps.Map(document.getElementById("map"), {
        center: place.geometry.location,
        zoom: 15
    });
    service = new google.maps.places.PlacesService(map);
    if (vm.category === "Choose Category") {
        service.textSearch({
            query: 'famous places in ' + place.name,
        }, callback);
    } else {
        service.textSearch({
            query: vm.category + ' in ' + place.name,
        }, callback);
    }
    autocomplete.set("place",null);
}

// update results of vue app
function callback(results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
        // console.log(results);
        vm.results = results;
        sessionStorage.category = vm.category;
        sessionStorage.input = document.getElementById("autocomplete").value;
    }
}

// restore previous inputs on page back
let select = document.getElementsByTagName("select")[0];
if (sessionStorage.category) vm.category = sessionStorage.category;
if (sessionStorage.input) document.getElementById("autocomplete").value = sessionStorage.input;

// Add logout functionality
document.getElementById('logoutBtn').addEventListener('click', function () {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userFirstName');
    localStorage.removeItem('userLastName');
    window.location.href = 'loginpage.html';
});