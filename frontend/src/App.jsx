import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CityList from "./components/cityList.jsx";
import SpecialFunctions from "./components/specialFunctions.jsx";

function App() {
    return (
        <div className="App">
            <Routes>
                <Route path="/" element={<CityList />} />
                <Route path="/special-functions" element={<SpecialFunctions />} />
            </Routes>
        </div>
    );
}

export default App;
