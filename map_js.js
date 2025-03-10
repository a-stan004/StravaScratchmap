/**
 * Takes user input value and converts to a number for width value
 * @param {HTMLElement} text field input of width
 * @return {number} width number
 */
function checkWidth(input) {
  var width = Number(input);
  console.log(typeof width);
  console.log(width);
  return width;
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

    //Establish blank graphics layer
    const graphicsLayer = new GraphicsLayer({
      blendMode: "destination-atop",
    });

    //Write cookie to let variable
    let displayRoute = JSON.parse(localStorage.getItem("scratchmap_routes"));

    //Create polyline from users routes
    const polyline = {
      type: "polyline",
      paths: displayRoute,
    };

    /**
      * Uses check width to gather user input, clears routes and rewrites
    */
    function updatePolylineWidth() {
      const width = checkWidth(document.getElementById("widthInput").value);
      console.log('width provided is ', width);

      const simpleLineSymbol = {
        type: "simple-line",
        color: [0, 0, 0],
        width: width
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
    document.getElementById("widthInput").addEventListener("input", updatePolylineWidth);

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
