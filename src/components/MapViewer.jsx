import React, { useContext, useRef, useEffect, useState } from "react";

import Draw from "ol/interaction/Draw.js";
import { LayersContext } from "../Providers/LayersProvider";
import Feature from "ol/Feature.js"
import Point from 'ol/geom/Point.js';
import { transform } from "ol/proj";
import { Icon, Style } from 'ol/style.js';


import VectorSource from "ol/source/Vector";
import ClusterSource from "ol/source/Cluster";

import VectorLayer from "ol/layer/Vector.js";

import { useSelector, useDispatch } from "react-redux";
import { setIsDraw } from "../store/slice/draw.js"


import "../styles/MapView.css";

export default function MapViewer() {
  const isDraw = useSelector(state => state.Draw.isDraw);
  const dispatch = useDispatch()
  const {
    mapRef, popupRef, overlay, vector, drawingInteraction, setDrawingInteraction, mapObject, setMapObject, osmLayersObject, setOsmLayersObject, darkLayersObject, setDarkLayersObject, } = useContext(LayersContext);
  const [clusterFeatures, setClusterFeatures] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchedPlace, setsearchedPlace] = useState([])
  const mapDiv = useRef();
  const actRef = useRef();
  // const mapRef = useRef()
  //---------this hook is called  in any onChange [mapObject, osmLayersObject, darkLayersObject]  ----------//
  useEffect(() => {
    if (mapObject) {
      mapObject.setTarget(mapDiv.current);
    }
    if (osmLayersObject && mapObject) {
      mapObject.addLayer(osmLayersObject);
    }
    if (darkLayersObject && mapObject) {
      mapObject.addLayer(darkLayersObject);
    }

  }, [mapObject, osmLayersObject, darkLayersObject]);

  const toggleLayer = (lyname) => {
    [osmLayersObject, darkLayersObject].forEach((layer) => {
      layer.setVisible(false);
      const name = layer.get("layerName");
      if (name == lyname) {
        layer.setZIndex(-1);
        layer.setVisible(true)
      }
    })
  };


  const drawSelectionHandler = (e) => {
    const active = e.target.checked;
    // setIsDraw(true)
    actRef.current = active;
    if (active) {
      dispatch(setIsDraw(true))
      // setIsDraw(true)
      // console.log(isDraw);
      // setIsDraw(false)
      mapObject.addInteraction(drawingInteraction);
    } else {
      mapObject.removeInteraction(drawingInteraction);
      dispatch(setIsDraw(false))

    }
  }

  const handleMapType = (e) => {
    const type = e.target.value;

    const drawNew = new Draw({
      source: vector.getSource(),
      type: type,
    });
    setDrawingInteraction(drawNew);
  };
// useeffect to handle interactions between map and features
  useEffect(() => {
    if (actRef.current) {
      mapObject.getInteractions().forEach((interaction) => {
        if (interaction instanceof Draw) {
          mapObject.removeInteraction(interaction);
          mapObject.addInteraction(drawingInteraction);
        }
      });
    }
  }, [drawingInteraction, isDraw]);


// fetch data and push in empty array for starting clusterd features
  useEffect(() => {

    const mapCitiesToFeatures = (cities) => {
      const features = [];
      cities.forEach((city) => {

        const lon = city.city.coord.lon
        const lat = city.city.coord.lat
        const cityName = city.city.name
        const weather = city.weather[0].main
        const description = city.weather[0].description
        const maxTemp = city.main.temp_max
        const minTemp = city.main.temp_min

        const originalCoord = [lon, lat]
        
        const transformedCoord = transform(originalCoord, 'EPSG:4326', 'EPSG:3857')
        // console.log(originalCoord);
        const feature = new Feature({
          geometry: new Point(transformedCoord),
        
          cityName,
          weather,
          description,
          maxTemp,
          minTemp,
        });
        features.push(feature);
      });
      return features;
    }
  
    const getWeatherData = async () => {
      const resObject = await fetch("/citiesWeather.json");


      const data = await resObject.json();
      // setCitiesWeather(data);
      const citiesFeatures = await mapCitiesToFeatures(data.cities)
      setClusterFeatures(citiesFeatures)

    }
    getWeatherData();


    // add overlay

  }, [isDraw])
  useEffect(() => {
    if (clusterFeatures.length) {
      const source = new VectorSource({
        features: clusterFeatures
      });
      const clusterSource = new ClusterSource({
        // source: source ,
        source,
        distance: 60, // distancence between two points to be considered as a cluster 
        // Distance in pixels within which features will be clustered together.

        minDistance: 20,// Minimum distance in pixels between clusters.
        //  Will be capped at the configured distance.
        //  By default no minimum distance is guaranteed.
        //  This config can be used to avoid overlapping icons.
        //  As a tradoff, the cluster feature's position will no longer be the center of all its features.


      })

      const clusterLAyer = new VectorLayer({
        source: clusterSource,
        style: (feature) => {
          // console.log(feature);
          const weather = feature.get("features")[0].get("weather");
          // console.log(weather);

          switch (weather) {
            case "Rain":
              return new Style({
                image: new Icon({
                  scale: 0.5,
                  src: "https://openweathermap.org/img/wn/10d@2x.png",
                  color: "#89f7fe"
                })
              })

            case "Clouds":

              return new Style({
                image: new Icon({
                  scale: 0.5,
                  src: "https://openweathermap.org/img/wn/04d@2x.png",
                  color: "#89f7fe"
                })
              })
            case "Clear":

              return new Style({
                image: new Icon({
                  scale: 0.5,
                  src: "https://openweathermap.org/img/wn/01d@2x.png",
                  color: "#FBB825"
                })
              })
            case "Thunderstorm":

              return new Style({
                image: new Icon({
                  scale: 0.5,
                  src: "https://openweathermap.org/img/wn/11d@2x.png"

                })
              })
            case "Sand":
              return new Style({
                image: new Icon({
                  scale: 0.5,
                  src: "https://openweathermap.org/img/wn/50d@2x.png",

                  color: "#FBB825"
                })
              })
            case "Dust":
              return new Style({
                image: new Icon({
                  scale: 0.5,
                  src: "https://openweathermap.org/img/wn/09d@2x.png",

                })
              })

            case "Mist":
              return new Style({
                image: new Icon({
                  scale: 0.5,
                  src: "https://openweathermap.org/img/wn/50d@2x.png",
                  src: "https://openweathermap.org/img/wn/50d@2x.png",
                  color: "#f8b00e"
                })
              })
            case "Haze":
              return new Style({
                image: new Icon({
                  scale: 0.5,
                  src: "https://openweathermap.org/img/wn/02d@2x.png",
                  color: "#f8b00e"
                })
              })
            case "Snow":
              return new Style({
                image: new Icon({
                  scale: 0.5,
                  src: "https://openweathermap.org/img/wn/13d@2x.png",

                  color: "#f8b00e"
                })
              })

            default:
              return new Style({
                image: new Icon({
                  scale: 0.5,
                  src: "https://openweathermap.org/img/wn/01d@2x.png"
                })
              })


          }

        }
      })
      mapObject.addLayer(clusterLAyer)

    }


  }, [clusterFeatures])

  useEffect(() => {
    // const placeName 


    const key = setTimeout(() => {
      const getPlaceCoord = async () => {
        // const placeName = "cairo"
        let response = await fetch(`https://nominatim.openstreetmap.org/search?q=${searchQuery}&format=json`)
        // let response = await fetch(`https://nominatim.openstreetmap.org/search?q=minia&format=json`)

        if (!response.ok) { throw response }

        let data = await response.json()

        console.log("ddd", data);
        setsearchedPlace(data)
      }
      getPlaceCoord()

    }, 1000)
    //--------------debouncing------------
    //---------return called first and then  useEffect
    return () => {
      clearTimeout(key)
    }
  }, [searchQuery]);

  const moveMap = (lon, lat) => {
    const projectedCoord = transform([parseFloat(lon), parseFloat(lat)], "EPSG:4326", "EPSG:3857")

    console.log("secet", lon, lat);
    mapObject.getView().animate({ zoom: 10 }, { center: projectedCoord })
  }
  // console.log(drawingInteraction);

  return (
    <>

      {isDraw && <div>tretb</div>}
      <div>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="searchPlace" style={{ marginRight: '10px' }}>Search Place</label>
          <input
            type="text"
            id="searchPlace"
            onInput={(e) => setSearchQuery(e.target.value)}
            style={{ padding: '5px', borderRadius: '5px', border: '1px solid #ccc' }}
          />
        </div>

        <select
          onChange={(e) => {
            moveMap(searchedPlace[e.target.value].lon, searchedPlace[e.target.value].lat)
          }}
          style={{
            display: searchedPlace.length > 0 ? 'block' : 'none',
            padding: '5px',
            borderRadius: '5px',
            border: '1px solid #ccc'
          }}
        >
          {searchedPlace.map((place, index) => (
            <option key={place.place_id} value={index}>{place.display_name}</option>
          ))}
        </select>
      </div>



      <div ref={popupRef}
        style={{
          top: "10px",
          left: "10px",
          position: "absolute",
          width:"300px",
          height:"200px",
          zIndex: 100,
          backgroundColor: "white",
          padding: "10px",
          borderRadius: "10px",
          boxShadow: "0 0 10px rgba(0,0,0,0.5)",
        }}></div>
      <div
        className="map-wrapper"
        style={{
          height: "425px",
          width: "100%",
          display: "flex",
        }}
      >
        <div
          style={{
            height: "100%",
            width: "100%",
          }}
          ref={mapDiv}
          className="App"
        >

          <div
            className="controls"
            style={{
              paddingRight: "0px",
              paddingLeft: "0px",
              paddingTop: "10px",
              paddingBottom: "0px",
              margin: "0px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexDirection: "column",
            }}
          >
            <div className="qq"
             style={{ display: "inline-flex", flexDirection: "row" }}
             >
              <div>
                <div style={{ display: "block", margin: "15px" }}>
                  <label htmlFor="DARK" id="darkMode" style={{ display: "inline" }}>
                    {osmLayersObject && darkLayersObject.get("layerName")}
                  </label>
                  <input
                    style={{ marginRight: "10px", display: "inline" }}
                    onClick={(e) => {
                      toggleLayer(e.target.id);
                    }}
                    type="radio"
                    id="DARK"
                    name="layer"
                  />
                </div>
                <div style={{ display: "block" }}>
                  <label htmlFor="OSM" id="osmMode">
                    {darkLayersObject && osmLayersObject.get("layerName")}
                  </label>
                  <input
                    style={{ marginRight: "10px" }}
                    onChange={(e) => {
                      toggleLayer(e.target.id);
                    }}
                    type="radio"
                    id="OSM"
                    name="layer"
                  />
                </div>
              </div>
              <div>
                <img src="https://openweathermap.org/img/wn/10d@2x.png" />
                <p>Rain</p>
              </div>
              <div>
                <img src="https://openweathermap.org/img/wn/04d@2x.png" />
                <p>Clouds</p>
              </div>
              <div>
                <img src="https://openweathermap.org/img/wn/01d@2x.png" />
                <p>Clear</p>

              </div>
              <div>
                <img src="https://openweathermap.org/img/wn/11d@2x.png" />
                <p>Thunderstorm</p>
              </div>

              <div>
                <img src="https://openweathermap.org/img/wn/09d@2x.png" />
                <p>Dust</p>
              </div>
              <div>
                <img src="https://openweathermap.org/img/wn/02d@2x.png" />
                <p>Haze</p>
              </div>
              <div>
                <img src="https://openweathermap.org/img/wn/13d@2x.png" />
                <p>Snow</p>
              </div>
              <div>
                <img src="https://openweathermap.org/img/wn/50d@2x.png" />
                <p>Mist</p>
              </div>


            </div>
            <div style={{ marginLeft: "20px", marginRight: "0px", paddingRight: "0px", fontFamily: "Arial, sans-serif" }}>
              <span style={{ fontSize: "16px", marginRight: "10px", fontWeight: "bold" }}>Developed By</span>
              <span style={{ fontSize: "16px", fontWeight: "bold" }}>Abdullah Omar </span>
            </div>

          </div>
        </div>

      </div>
    </>
  );
}
