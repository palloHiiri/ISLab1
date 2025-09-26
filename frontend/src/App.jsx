import React, { useState, useEffect } from 'react';
import CityList from './components/cityList';
import axios from 'axios';
import './App.css';

function App() {
    return(
        <div className="App">
            <CityList />
        </div>
    )
}

export default App;