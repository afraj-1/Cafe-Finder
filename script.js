let map;
let infoWindow;

async function initMap() {
  // Request needed libraries
  const { Map } = await google.maps.importLibrary("maps");
  
  map = new Map(document.getElementById("map"), {
    center: { lat: 12.9716, lng: 77.5946 }, // Default (e.g., Bangalore)
    zoom: 14,
    mapId: "d5a1421cdd562869e20e5d49D", // Replace with your actual Map ID from Google Console
  });

  infoWindow = new google.maps.InfoWindow();
  
  document.getElementById("search-btn").addEventListener("click", findCafesNearMe);
}
function findCafesNearMe() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLoc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        map.setCenter(userLoc);
        searchForCafes(userLoc);
      },
      () => alert("Geolocation failed. Please enable location services.")
    );
  } else {
    alert("Your browser doesn't support geolocation.");
  }
}
async function searchForCafes(location) {
  const { Place, SearchNearbyRankPreference } = await google.maps.importLibrary("places");
  const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

  const request = {
    // UPDATED: Use 'displayName' and ensure it's handled in the loop
    fields: ["displayName", "location", "formattedAddress", "id"],
    locationRestriction: { center: location, radius: 2000 },
    includedPrimaryTypes: ["cafe"],
    maxResultCount: 15,
    rankPreference: SearchNearbyRankPreference.POPULARITY,
  };

  try {
    const { places } = await Place.searchNearby(request);
    const listDiv = document.getElementById("results-list");
    listDiv.innerHTML = ""; 

    if (places && places.length > 0) {
      places.forEach((place) => {
        // IMPROVED LOGIC: Check for displayName and the text inside it
        let name = "Cafe"; 
        if (place.displayName && typeof place.displayName === 'string') {
            name = place.displayName;
        } else if (place.displayName && place.displayName.text) {
            name = place.displayName.text;
        }

        const address = place.formattedAddress || "Address not available";

        const marker = new AdvancedMarkerElement({
          map: map,
          position: place.location,
          title: name,
        });

        marker.addListener("click", () => {
          infoWindow.setContent(`<div style="padding:5px"><strong>${name}</strong><br>${address}</div>`);
          infoWindow.open(map, marker);
        });

        const item = document.createElement("div");
        item.className = "cafe-item";
        item.innerHTML = `
          <span class="cafe-name">${name}</span>
          <span class="cafe-address">${address}</span>
        `;
        
        item.onclick = () => {
          map.panTo(place.location);
          map.setZoom(16);
          infoWindow.setContent(`<div style="padding:5px"><strong>${name}</strong><br>${address}</div>`);
          infoWindow.open(map, marker);
        };
        
        listDiv.appendChild(item);
      });
    } else {
      listDiv.innerHTML = "No cafes found within 2km.";
    }
  } catch (error) {
    console.error("Search failed:", error);
  }
}
