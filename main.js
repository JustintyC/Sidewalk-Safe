var map = L.map('map').setView([49.262401839237086, -123.24506350086884], 15);
var selectingLocation = false;

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

var customIcon = L.icon({
    iconUrl: 'gregor 50x50.jpg',
    iconSize: [38, 38],
    iconAnchor: [19, 38], // point of the icon which will correspond to marker's location
    popupAnchor: [0, -38] // point from which the popup should open relative to the iconAnchor
});

map.on('click', function(e) {
    if (selectingLocation) {
        var description = prompt("Enter a description for this place:");
        if(description) {
            L.marker(e.latlng, {icon: customIcon}).addTo(map) // Use customIcon here
                .bindPopup(description)
                .openPopup();
        }
    }
    selectingLocation = false;    
    document.getElementById('map').style.cursor = '';
});


function onAddButtonPress() {
    selectingLocation = true;
    document.getElementById("map").style.cursor = "crosshair";
    // TODO prompt user to choose a location
}
