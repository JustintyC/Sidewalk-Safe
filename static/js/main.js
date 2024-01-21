var markerData = {}; // This will map marker ids to their data
var map = L.map("map").setView([49.262401839237086, -123.24506350086884], 15);
var selectingLocation = false;
var tempLatLng = null;

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "© OpenStreetMap contributors",
}).addTo(map);

var customIcon = L.icon({
  // iconUrl: iconUrl, // Use the iconUrl variable
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -38],
});

var icyIcon = L.icon({
  iconUrl: icyIconUrl, // Use the iconUrl variable
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -38],
});

var darkIcon = L.icon({
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
  var addButton = document.getElementById("add-button");
  addButton.innerText = "Select location on map"
  document.getElementById("map").style.cursor = "crosshair";
}

map.on("popupopen", function (e) {
  console.log(e.popup);
  console.log("working");
  const date = new Date();
  console.log(date);
});

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
  var addButton = document.getElementById("add-button");
  addButton.innerText = "Add";
}

// Function to add a marker with a description to the map
function addMarkerWithDescription(filename, description, latitude, longitude) {
  const markerIcon = getIconForDescription(description);
  const formattedDateTime = getCurrentDateTimePST();
  const popupContent = createPopupContent(description, formattedDateTime);

  const marker = addMarkerToMap(latitude, longitude, markerIcon, popupContent);

  //if (filename) {
  //  addImageToSidebar(filename);
  // }

  markerData[marker._leaflet_id] = {
    filename: filename,
    description: description,
  };

  closeDescriptionPopup();
}

// Function to get the appropriate icon based on the description
function getIconForDescription(description) {
  switch (description) {
    case "Icy":
      return icyIcon;
    case "Dark":
      return darkIcon;
    default:
      return customIcon; // Assuming customIcon is defined elsewhere
  }
}

// Function to create the content for the popup
function createPopupContent(description, dateTime) {
  return description + ": " + dateTime;
}

// Function to add a marker to the map
function addMarkerToMap(lat, lng, icon, popupContent) {
  var marker = L.marker([lat, lng], { icon: icon })
    .addTo(map)
    .bindPopup(popupContent);

  // Add click event listener to marker
  marker.on("click", function () {
    updateSidebar(marker._leaflet_id);
  });

  return marker;
}

function updateSidebar(markerId) {
  var data = markerData[markerId];
  console.log(data);
  if (data) {
    var sidebar = document.getElementById("dynamic");
    var img = document.createElement("img");
    img.src = staticURL + "uploads/" + data.filename; // Ensure this path is correct
    img.style.width = "100px";

    var desc = document.createElement("p");
    desc.innerText = data.description;

    // Clear previous content and add new
    sidebar.innerHTML = "";
    if (data.filename) {
      sidebar.appendChild(img);
      img.style.width = "100%";
    }

    sidebar.appendChild(desc);
  }
}
// Function to add an image to the sidebar
//function addImageToSidebar(filename) {
//  var sidebar = document.getElementById("side-bar");
//  var img = document.createElement("img");
//  img.src = staticUrl + "uploads/" + filename; // Ensure this path is correct
//  img.style.width = "100px";
//  sidebar.appendChild(img);
//}

function uploadData() {
  var formData = new FormData();
  var fileField = document.getElementById("input_image");
  var descriptionField = document.getElementById("description-input");
  var latitudeField = document.getElementById("latitude-input");
  var longitudeField = document.getElementById("longitude-input");

  if (fileField.files[0]) {
    formData.append("input_image", fileField.files[0]);
  }

  if (descriptionField.value == "Icy") {
    iconX = icyIcon;
  } else if (descriptionField.value == "Dark") {
    iconX = darkIcon;
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

function getCurrentDateTimePST() {
  var currentDateTime = new Date();

  // Convert to PST (UTC - 8 hours)
  var pstDateTime = new Date(currentDateTime.getTime() - 8 * 60 * 60 * 1000);

  // Format the date and time
  var day = pstDateTime.getDate().toString().padStart(2, "0");
  var month = (pstDateTime.getMonth() + 1).toString().padStart(2, "0"); // Months are zero-indexed
  var year = pstDateTime.getFullYear().toString().slice(-2); // Get last two digits of year
  var hours = pstDateTime.getHours().toString().padStart(2, "0");
  var minutes = pstDateTime.getMinutes().toString().padStart(2, "0");

  return (
    hours + ":" + minutes + " " + "PST" + " " + day + "/" + month + "/" + year
  );
}
