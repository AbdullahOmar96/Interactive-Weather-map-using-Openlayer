import Map from "ol/Map.js";
import OSM from "ol/source/OSM.js";
import TileLayer from "ol/layer/Tile.js";
import View from "ol/View.js";
import React, { useEffect, useState, useRef } from "react";
import { createContext } from "react";
import { transform } from "ol/proj";
import { XYZ } from "ol/source";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector.js";
import GeoJSON from "ol/format/GeoJSON.js";
import { Circle as CircleStyle, Fill, Stroke, Style } from "ol/style.js";
import Draw from "ol/interaction/Draw.js";
import Overlay from "ol/Overlay.js";
import { useSelector, useDispatch } from "react-redux";


export const LayersContext = createContext();

export default function LayersProvider(props) {
  const isDraw = useSelector((state) => state.Draw.isDraw);
  const dispatch = useDispatch();
  const [mapObject, setMapObject] = useState();
  const [osmLayersObject, setOsmLayersObject] = useState();
  const [darkLayersObject, setDarkLayersObject] = useState();
  const [drawingInteraction, setDrawingInteraction] = useState();
  const [vector, setVector] = useState();
  const [overlay, setOverlay] = useState();
  // const [isDraw , setIsDraw] = useState(false);
  const popupRef = useRef();
  const mapRef = useRef();
  //--------this only in intial ---------------
  useEffect(() => {
    const pointVec = {
      type: "FeatureCollection",
      features: [
        // {
        //   "type": "Feature",
        //   "properties": {},
        //   "geometry": {
        //     "coordinates": [
        //       [
        //         [
        //           30.838797248246493,
        //           28.13454625577168
        //         ],
        //         [
        //           30.65191286430303,
        //           28.120536361396134
        //         ],
        //         [
        //           30.699667285268106,
        //           27.988253121160156
        //         ],
        //         [
        //           30.86015667710899,
        //           28.010516126300985
        //         ],
        //         [
        //           30.838797248246493,
        //           28.13454625577168
        //         ]
        //       ]
        //     ],
        //     "type": "Polygon"
        //   }
        // },
        // {
        //   "type": "Feature",
        //   "properties": {},
        //   "geometry": {
        //     "coordinates": [
        //       30.756707288087796,
        //       28.152119751576123
        //     ],
        //     "type": "Point"
        //   }
        // },
        // {
        //   "type": "Feature",
        //   "properties": {},
        //   "geometry": {
        //     "coordinates": [
        //       [
        //         30.855991549605164,
        //         28.145069699509207
        //       ],
        //       [
        //         30.89572811539327,
        //         28.052719865620986
        //       ]
        //     ],
        //     "type": "LineString"
        //   }
        // }
      ],
    };

    const map = new Map({});
    const point = [30.756106173102694, 28.08712033718288];

    const projectedPoint = transform(point, "EPSG:4326", "EPSG:3857");
    const view = new View({
      center: projectedPoint,
      zoom: 2,
    });

    map.setView(view);
    // setDarkLayersObject({})
    const osmLayer = new TileLayer({
      source: new OSM(),
      visible: false,
    });

    osmLayer.set("layerName", "OSM");

    // map.addLayer(osmLayer)
    setOsmLayersObject(osmLayer);
    //---------------------------Draw--with intial type (point)-----------------------------
    const darkLayer = new TileLayer({
      source: new XYZ({
        url: "https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}.png",

      }),
      visible: false,
    });

    darkLayer.set("layerName", "DARK");
    setDarkLayersObject(darkLayer);

    const vect = new VectorLayer({
      source: new VectorSource({
        features: new GeoJSON({
          featureProjection: "EPSG:3857",
        }).readFeatures(pointVec),
      }),
      style: new Style({
        image: new CircleStyle({
          radius: 5,
          fill: new Fill({
            color: "rgba(255, 255, 0,0.9)",
          }),
          stroke: new Stroke({
            color: "rgba(0, 255, 0, 0.5)",
          }),
        }),
        stroke: new Stroke({
          color: "rgba(0, 255, 0, 0.5)",
        }),
      }),
    });
    setVector(vect);
    map.addLayer(vect);
    //---------------------------Draw--with intial type (point)-----------------------------

    const drawNew = new Draw({
      source: vect.getSource(),
      type: "Point",
    });
    setDrawingInteraction(drawNew);
    mapRef.current = map;

    if (isDraw == true) {
      console.log("drawing...");
    } else {

      const popup = new Overlay({
        element: popupRef.current,
      });
      setOverlay(popup);
      map.addOverlay(popup);

      setMapObject(map);

      map.on("click", function (evt) {
        popup.setPosition(undefined);
        map.forEachFeatureAtPixel(evt.pixel, function (feature) {
          // console.log(feature);a
          console.log(feature);
          if (isDraw) {
            console.log("drawwing from on");

          } else {
            const coo = feature.getGeometry().getCoordinates();
            const firstOriginalFeature = feature.get("features")[0];
            const cityName = firstOriginalFeature.get("cityName");
            const weather = firstOriginalFeature.get("weather");
            const description = firstOriginalFeature.get("description");
            const maxTemp = firstOriginalFeature.get("maxTemp");
            const minTemp = firstOriginalFeature.get("minTemp");

            // popupRef.current.innerHTML = `City name : ${cityName} <br/> Weather : ${weather} <br/> Desc : ${description} <br/> MAX Temp. :  ${maxTemp} <br/> MIN Temp. : ${minTemp}`;
            function getWeatherImageUrl(weather) {
              switch (weather) {
                  case "Rain":
                      return "https://openweathermap.org/img/wn/10d@2x.png";
                  case "Clouds":
                      return "https://openweathermap.org/img/wn/04d@2x.png";
                  case "Clear":
                      return "https://openweathermap.org/img/wn/01d@2x.png";
                  case "Thunderstorm":
                      return "https://openweathermap.org/img/wn/11d@2x.png";
                  case "Sand":
                      return "https://openweathermap.org/img/wn/50d@2x.png";
                  case "Dust":
                      return "https://openweathermap.org/img/wn/09d@2x.png";
                  case "Mist":
                      return "https://openweathermap.org/img/wn/50d@2x.png";
                  case "Haze":
                      return "https://openweathermap.org/img/wn/02d@2x.png";
                  case "Snow":
                      return "https://openweathermap.org/img/wn/13d@2x.png";
                  default:
                      return "https://openweathermap.org/img/wn/01d@2x.png";
              }
          }
          
          // Generate HTML with weather image dynamically
          popupRef.current.innerHTML = `
              <div class="weatherCard">
                  <div class="currentTemp">
                      <img class="weatherImage" src="${getWeatherImageUrl(weather)}" alt="${weather} Weather">
                      <span class="temp">${maxTemp}&deg;</span>
                      <span class="location">${cityName}</span>
                  </div>
                  <div class="currentWeather">
                      <span class="conditions">${weather}</span>
                      <div class="info">
                          <span class="rain">${description}</span>
                          <span class="wind">MAX Temp.: ${maxTemp} &deg; | MIN Temp.: ${minTemp} &deg;</span>
                      </div>
                  </div>
              </div>
          `;
            popup.setPosition(coo)
          }

          ;
        });
      });
    }

    // console.log(evt);

    ///--------------------------------------------------------------------------------------------
  }, [isDraw]);

  return (
    <LayersContext.Provider
      value={{
        mapRef,
        overlay,
        popupRef,
        vector,
        drawingInteraction,
        setDrawingInteraction,
        mapObject,
        setMapObject,
        osmLayersObject,
        setOsmLayersObject,
        darkLayersObject,
        setDarkLayersObject,
      }}
    >
      {props.children}
    </LayersContext.Provider>
  );
}
