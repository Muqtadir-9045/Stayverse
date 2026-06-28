if (!coordinates) {
    document.getElementById('map').innerHTML = '<p class="text-muted p-3">Location not available for this listing.</p>';
} else {
    mapboxgl.accessToken = mapToken;

    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v12',
        center: coordinates,
        zoom: 9
    });

    new mapboxgl.Marker({ color: 'red' })
        .setLngLat(coordinates)
        .addTo(map);
}