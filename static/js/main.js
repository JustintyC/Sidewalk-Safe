var map = L.map("map").setView([49.262401839237086, -123.24506350086884], 15);
var selectingLocation = false;
var tempLatLng = null;

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "© OpenStreetMap contributors",
}).addTo(map);

var customIcon = L.icon({
  iconUrl: iconUrl, // Use the iconUrl variable
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -38],
});

function updatePreviewImg() {
  let inputImagePreview = document.getElementById("input_image_preview");
  let inputImage = document.getElementById("input_image");
  inputImagePreview.src = URL.createObjectURL(inputImage.files[0]);
  inputImagePreview.style.display = "block";
}

function onAddButtonPress() {
  selectingLocation = true;
  document.getElementById("map").style.cursor = "crosshair";
}

map.on("click", function (e) {
  if (selectingLocation) {
    tempLatLng = e.latlng;
    document.getElementById("latitude-input").value = e.latlng.lat;
    document.getElementById("longitude-input").value = e.latlng.lng;
    openPromptPopup();
    selectingLocation = false;
    document.getElementById("map").style.cursor = "";
  }
});

function openPromptPopup() {
  var popup = document.getElementById("description-popup");
  popup.style.visibility = "visible";
}

function closeDescriptionPopup() {
  var popup = document.getElementById("description-popup");
  popup.style.visibility = "hidden";
}

function addMarkerWithDescription(filename, description, latitude, longitude) {
  L.marker([latitude, longitude], { icon: customIcon })
    .addTo(map)
    .bindPopup(description)
    .openPopup();
  closeDescriptionPopup();
  if (filename) {
    var sidebar = document.getElementById("side-bar");
    var img = document.createElement("img");
    img.src = staticUrl + "uploads/" + filename; // Make sure this path is correct
    img.style.width = "100px";
    sidebar.appendChild(img);
  }

  closeDescriptionPopup();
}

function uploadData() {
  var formData = new FormData();
  var fileField = document.getElementById("input_image");
  var descriptionField = document.getElementById("description-input");
  var latitudeField = document.getElementById("latitude-input");
  var longitudeField = document.getElementById("longitude-input");

  if (fileField.files[0]) {
    formData.append("input_image", fileField.files[0]);
  }

  formData.append("description", descriptionField.value);
  formData.append("latitude", latitudeField.value);
  formData.append("longitude", longitudeField.value);

  fetch("/upload", {
    method: "POST",
    body: formData,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }
      return response.json();
    })
    .then((data) => {
      addMarkerWithDescription(
        data.filename,
        data.description,
        data.latitude,
        data.longitude
      );
    })
    .catch((error) => {
      console.error("Error:", error);
    });

  // Prevent the form from submitting traditionally
  return false;
}
