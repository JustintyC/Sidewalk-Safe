var map = L.map('map').setView([49.262401839237086, -123.24506350086884], 15);
var selectingLocation = false;
var tempLatLng = null;

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

var customIcon = L.icon({
    iconUrl: 'images/gregor 50x50.jpg',
    iconSize: [38, 38],
    iconAnchor: [19, 38], // point of the icon which will correspond to marker's location
    popupAnchor: [0, -38] // point from which the popup should open relative to the iconAnchor
});

map.on('click', function(e) {
    if (selectingLocation) {
        tempLatLng = e.latlng;
        openPromptPopup();
        selectingLocation = false;
        document.getElementById('map').style.cursor = '';
    }
});



function updatePreviewImg() {
    let inputImagePreview = document.getElementById("input_image_preview");
    let inputImage = document.getElementById("input_image");
    inputImagePreview.src = URL.createObjectURL(inputImage.files[0]);
}

// inputImage.onchange = function() {
//     inputImagePreview.src = URL.createObjectURL(inputImage.files[0]);
// }


function onAddButtonPress() {
    selectingLocation = true;
    document.getElementById("map").style.cursor = "crosshair";
    // You can display a message to the user if needed
}

function openPromptPopup() {
    var popup = document.getElementById("description-popup");
    popup.style.visibility = 'visible';
}   

function closeDescriptionPopup() {
    var popup = document.getElementById("description-popup");
    popup.style.visibility = 'hidden';
}

function addMarkerWithDescription() {
    var description = document.getElementById('description-input').value;
    if (description) {
        L.marker(tempLatLng, {icon: customIcon}).addTo(map)
            .bindPopup(description)
            .openPopup();
    }
    closeDescriptionPopup();
    document.getElementById('description-input').value = ''; // Reset the input field
}

