"use strict";

import StylesControl from "mapbox-gl-controls/lib/styles";

var changesetsGeojson = {
  type: "FeatureCollection",
  features: [],
};

//
// Create OpenStreetMap Map using Mapbox GL vector tiles
// https://docs.mapbox.com/vector-tiles/reference/mapbox-streets-v8/
//

// Mapbox Account `osmindia`
mapboxgl.accessToken =
  "pk.eyJ1IjoibmRvaXJvbjIiLCJhIjoiY21kMmhjc20yMXg3czJtcHpoZHRtb3VyaiJ9.dRTO6E7ijZe63pyZ92PQLg";

var map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/light-v11",
  center: [121.058, 23.695],
  zoom: 7,
  hash: true,
});

//
// Map controls
//

// Style controls
map.addControl(
  new StylesControl({
    styles: [
      {
        label: "Streets",
        styleName: "Streets",
        styleUrl: "mapbox://styles/mapbox/light-v11",
      },
      {
        label: "Satellite",
        styleName: "Satellite",
        styleUrl: "mapbox://styles/mapbox/satellite-streets-v12",
      },
    ],
    onChange: (style) => filterBoundaries(),
  }),
  "top-left",
);

// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl(), "bottom-right");

// Add geolocate control to the map.
map.addControl(
  new mapboxgl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true,
    },
    trackUserLocation: true,
  }),
  "bottom-right",
);

// Add Mapbox Geocoder
// https://github.com/mapbox/mapbox-gl-geocoder/blob/master/API.md
map.addControl(
  new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl,
    countries: "TW",
  }),
);

// Resize map to fit all of India within the screen
map.fitBounds([
  [118.01, 21.64],
  [122.48, 25.87],
]);

// Edit the OSM map at the location
document.getElementById("edit-map").onclick = function () {
  window.open(
    `https://www.openstreetmap.org/edit?editor=id#map=${map.getZoom()}/${map.getCenter().lngLat.lat}/${map.getCenter().lngLat.lng}`,
  );
};

//
//  Map logic
//

map.on("load", function () {
  // Show country boundaries as per Government of India
  filterBoundaries();

  // Add custom layers
  addMapLayers();

  // Add map interactions
  addMapEvents();
});

//
// Map functions
//

function addMapLayers() {}

// Map events

function addMapEvents() {
  // Change the cursor to a pointer when the mouse is over the places layer.
  map.on("mouseenter", "changesets", function () {
    map.getCanvas().style.cursor = "pointer";
  });

  // Change it back to a pointer when it leaves.
  map.on("mouseleave", "changesets", function () {
    map.getCanvas().style.cursor = "";
  });

  // When a click event occurs on a feature in the csvData layer, open a popup at the
  // location of the feature, with description HTML from its properties.
  map.on("click", "changesets", function (e) {
    console.log(e.features);
    const feature = e.features[0];
    var coordinates = e.lngLat.toArray();

    var lng = e.lngLat.lng;
    var lat = e.lngLat.lat;

    // console.log(moment("20111031", "YYYYMMDD").fromNow())

    // Generate bbox from point coords
    var buffer = 0.05;
    var bbox_osmcha = [
      lng + buffer,
      lat - buffer,
      lng - buffer,
      lat + buffer,
    ].join(",");
    var bbox_wsen = [
      lng - buffer,
      lat - buffer,
      lng + buffer,
      lat + buffer,
    ].join(",");

    var description = `<b>${feature.properties.changes}</b> changes by ${feature.properties.user}`;
    description += `<p>${feature.properties.comment}</p>`;
    description += `<br><a href='https://osmcha.org/filters?filters={"in_bbox":[{"label":"${bbox_osmcha}","value":"${bbox_osmcha}"}],"area_lt":[{"label":"10","value":"10"}]}'>Check neighbourhood acitivy with OSMCha</a>`;
    description += `<br><a href='https://www.openstreetmap.org/history#map=14/${e.lngLat.lat}/${e.lngLat.lng}'>OSM History</a>`;

    // Ensure that if the map is zoomed out such that multiple
    // copies of the feature are visible, the popup appears
    // over the copy being pointed to.
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }

    //add Popup to map

    document.getElementById("map-overlay").innerHTML = description;

    new mapboxgl.Popup().setLngLat(coordinates).setHTML(description).addTo(map);
  });
}

function filterBoundaries() {
  // ['admin-0-boundary-bg', 'admin-0-boundary', 'admin-0-boundary-disputed', 'admin-1-boundary'].forEach(
  //     layer => {
  //         let layerFilter = map.getFilter(layer);
  //         layerFilter[layerFilter.length - 1] = ['match', ['get', 'worldview'],
  //             ['all', 'IN'], true, false
  //         ]
  //         map.setFilter(layer, layerFilter)
  //     })
}
