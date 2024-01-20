var map = L.map('map').setView([49.262401839237086, -123.24506350086884], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

map.on('click', function(e) {
    var description = prompt("Enter a description for this place:");
    if(description) {
        L.marker(e.latlng).addTo(map)
            .bindPopup(description)
            .openPopup();
    }
});

var customIcon = L.icon({
    iconUrl: 'path/to/icon.png',
    iconSize: [38, 38], // size of the icon
    iconAnchor: [22, 94], // point of the icon which will correspond to marker's location
    popupAnchor: [-3, -76] // point from which the popup should open relative to the iconAnchor
});

// Use customIcon in L.marker
L.marker(e.latlng, {icon: customIcon}).addTo(map)
    .bindPopup(description)
    .openPopup();
