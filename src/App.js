// import logo from './logo.svg';
// import './style.css';
import Map from 'ol/Map.js';
import OSM from 'ol/source/OSM.js';
import TileLayer from 'ol/layer/Tile.js';
import View from 'ol/View.js';
import './App.css';
// import '../src/styles/MapView.css';

import Main from './components/main/Main';
import { useEffect, useRef, useState } from 'react';

import MapViewer from "./components/MapViewer.jsx"
import LayersProvider from "./Providers/LayersProvider.jsx"
function App() {
  const divRef= useRef();
//   const [map , setMap ] = useState()

  
//   useEffect(() => {
//  const layer  =   new TileLayer({
//           source: new OSM(),
//         })
    
//   const view = new View({
//         center: [0, 0],
//         zoom: 2,
//       })
// const newMap = new Map();
// newMap.addLayer(layer);
// newMap.setView(view);
// newMap.setTarget(divRef.current);
    
//     setMap(map)
// }, [])

  return (
<LayersProvider>
  <MapViewer/>
</LayersProvider>
    // <div style={{ height: '100vh', width: '100vw' }} className="App" ref={divRef}>  </div>

  );
}

export default App;
