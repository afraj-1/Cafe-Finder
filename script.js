let map;
let infoWindow;

async function initMap() {
    const { Map } = await google.maps.importLibrary("maps");
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

    map = new Map(document.getElementById("map"), {
        center: { lat: 12.9716, lng: 77.5946 },
        zoom: 14,
    });

    infoWindow = new google.maps.InfoWindow();

    document.getElementById("search-btn").addEventListener("click", findCafesNearMe);
}

async function findCafesNearMe() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLoc = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                map.setCenter(userLoc);
                showCafesPopup(userLoc);
            },
            () => {
                alert("Geolocation failed. Using default location.");
                showCafesPopup({ lat: 12.9716, lng: 77.5946 });
            }
        );
    } else {
        alert("Geolocation not supported. Using default location.");
        showCafesPopup({ lat: 12.9716, lng: 77.5946 });
    }
}

async function showCafesPopup(location) {
    try {
        const { Place } = await google.maps.importLibrary("places");
        const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

        const request = {
            location: location,
            radius: 2000,
            type: ["cafe"],
        };

        const places = await Place.searchNearby(request);

        if (!places || places.length === 0) {
            alert("No cafes found nearby.");
            return;
        }

        let popupContent = "<strong>Cafes near you:</strong><br><ul>";

        places.forEach((place) => {
            const name = place.name || "Unnamed Cafe";
            const address = place.address || "No address available";

            popupContent += `<li><b>${name}</b> - ${address}</li>`;

            new AdvancedMarkerElement({
                position: place.location,
                map: map,
                title: name,
            });
        });

        popupContent += "</ul>";

        infoWindow.setContent(popupContent);
        infoWindow.setPosition(location);
        infoWindow.open(map);

    } catch (error) {
        console.error("Places API error:", error);
        alert("Error fetching cafes: " + error.message);
    }
}
