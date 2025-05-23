var overallWidth = Number(0);

function decodePolyline(polylineStr) {
  let index = 0,
    lat = 0,
    lng = 0;
  const coordinates = [];
  const changes = { latitude: 0, longitude: 0 };

  while (index < polylineStr.length) {
    for (const unit of ["latitude", "longitude"]) {
      let shift = 0,
        result = 0;

      while (true) {
        const byte = polylineStr.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
        if (byte < 0x20) break;
      }

      changes[unit] = result & 1 ? ~(result >> 1) : result >> 1;
    }

    lat += changes.latitude;
    lng += changes.longitude;

    coordinates.push([lng / 1e5, lat / 1e5]);
  }

  return coordinates;
}


function widthButton(input) {
  console.log("Width change called");
  overallWidth = Number(input);
  console.log(`New width is set as ${overallWidth}`);
}

function setDistance() {
  var distances = Number(Math.round(localStorage.getItem("distances") / 1000));
  var elevations = localStorage.getItem("elevations");
  var activities = localStorage.getItem("activities");
  console.log(`Distance conversion completed and set to ${distances}`);
  document.getElementById("distancemeter").innerHTML = distances;
  document.getElementById("elevationmeter").innerHTML = elevations;
  document.getElementById("activitymeter").innerHTML = activities;
}

//Get required packages and load map
function loadMap() {
  require([
    "esri/Basemap",
    "esri/Graphic",
    "esri/layers/GraphicsLayer",
    "esri/layers/GroupLayer",
    "esri/layers/FeatureLayer",
    "esri/symbols/SimpleFillSymbol",
    "esri/renderers/SimpleRenderer",
    "esri/layers/WebTileLayer",
  ], (
    Basemap,
    Graphic,
    GraphicsLayer,
    GroupLayer,
    FeatureLayer,
    SimpleFillSymbol,
    SimpleRenderer,
    WebTileLayer
  ) => {
    //Establish map
    const arcgisMap = document.querySelector("arcgis-map");
    console.log("Map load complete");

    //Add tile layer for basemap
    const basemap_vector = new WebTileLayer({
      urlTemplate:
        "https://{subDomain}.basemaps.cartocdn.com/dark_all/{level}/{col}/{row}.png",
      subDomains: ["a", "b", "c", "d"],
      copyright:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
    });

    //Set as a basemap layer
    const basemap = new Basemap({
      baseLayers: [basemap_vector],
    });

    //Set as map basemap
    arcgisMap.basemap = basemap;
    console.log("Basemap load complete");

    //Establish blank graphics layer
    const graphicsLayer = new GraphicsLayer({
      blendMode: "destination-atop",
    });

    let displayRoute = [];

    // Function to read cookies and concatenate arrays
    function readCookie() {
      displayRoute = [];

      for (let counter = 1; counter <= 40; counter++) {
        const dataUnparsed = localStorage.getItem(`scratchmap_routes${counter}`);
        console.log(`Checking key: scratchmap_routes${counter}`);

        if (dataUnparsed) {
          try {
            const polylineArray = JSON.parse(dataUnparsed);

            for (const encoded of polylineArray) {
              const decoded = decodePolyline(encoded);
              console.log('Decoded:', decoded);
              displayRoute.push(decoded);
            }
          } catch (e) {
            console.error(`Error parsing or decoding data for counter ${counter}:`, e);
          }
        }
      }

      console.log('Final displayRoute:', displayRoute);
    }


    readCookie();

    //Create polyline from users routes
    const polyline = {
      type: "polyline",
      paths: displayRoute,
    };

    /**
     * Uses check width to gather user input from coins, clears routes and rewrites
     */
    function updatePolylineWidth() {
      const width = overallWidth;

      const simpleLineSymbol = {
        type: "simple-line",
        color: [0, 0, 0],
        width: width,
      };

      const polylineGraphic = new Graphic({
        geometry: polyline,
        symbol: simpleLineSymbol,
      });

      graphicsLayer.removeAll();
      graphicsLayer.add(polylineGraphic);
    }

    updatePolylineWidth();

    //Everytime input changes redraw the graphics layer
    document
      .getElementById("coins")
      .addEventListener("click", updatePolylineWidth);

    //When view is ready add layers
    arcgisMap.addEventListener("arcgisViewReadyChange", () => {
      const greyFillSymbol = new SimpleFillSymbol({
        color: [148, 148, 148, 0.75],
        style: "solid",
        outline: {
          color: [255, 255, 255, 1],
          width: 0,
        },
      });

      const greyRenderer = new SimpleRenderer({
        symbol: greyFillSymbol,
      });

      //OSM that will show as scratched section
      const OSM_map = new WebTileLayer({
        urlTemplate:
          "https://{subDomain}.basemaps.cartocdn.com/light_all/{level}/{col}/{row}.png",
        subDomains: ["a", "b", "c", "d"],
        copyright:
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
      });

      //Countries with 'foil' effect
      const scratchFoil = new FeatureLayer({
        url: "https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/World_Countries/FeatureServer/0",
        renderer: greyRenderer,
      });

      arcgisMap.map.add(scratchFoil);

      //Group layers so that blending modes apply
      const groupLayer = new GroupLayer({
        title: "Group Layer",
        layers: [OSM_map, graphicsLayer],
      });

      arcgisMap.map.add(groupLayer);
    });
  });
}

loadMap();
console.log("Full page load completed");
