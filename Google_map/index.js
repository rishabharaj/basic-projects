function initMap() {
  // Create the map centered on Indore
  const indore = { lat: 22.7196, lng: 75.8577 };
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 13,
    center: indore,
    mapTypeControl: false,
  });

  // Create the initial marker for Indore
  const marker = new google.maps.Marker({
    position: indore,
    map: map,
    title: "Indore",
  });

  // Create the search box and link it to the UI element
  const input = document.getElementById("pac-input");
  const searchBox = new google.maps.places.SearchBox(input);

  // Bias the SearchBox results towards current map's viewport
  map.addListener("bounds_changed", () => {
    searchBox.setBounds(map.getBounds());
  });

  // Listen for the event fired when the user selects a prediction
  searchBox.addListener("places_changed", () => {
    const places = searchBox.getPlaces();

    if (places.length === 0) {
      return;
    }

    // For each place, get the location
    const bounds = new google.maps.LatLngBounds();
    
    places.forEach((place) => {
      if (!place.geometry || !place.geometry.location) {
        console.log("Returned place contains no geometry");
        return;
      }

      // Update the marker position and title
      marker.setPosition(place.geometry.location);
      marker.setTitle(place.name);

      // Zoom in and center map on the selected location
      map.setCenter(place.geometry.location);
      map.setZoom(17); // High zoom level for better visibility

      if (place.geometry.viewport) {
        // Only geocodes have viewport
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }
    });
    
    // Optional: fit bounds to show all returned places
    // map.fitBounds(bounds);
  });
}

// Add a global error handler for JavaScript errors
window.onerror = function(message, source, lineno, colno, error) {
  console.error("Error: ", message, "at", source, ":", lineno, ":", colno);
  return true;
};