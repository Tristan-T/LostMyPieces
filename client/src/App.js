import React from 'react'; 
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import MainMenu from './components/MainMenu';
import Game from './components/Game';

function App() {
    return (
      <div className="App">
        <Router>
          <Routes>
            <Route path="/" element={<MainMenu />} />
            <Route path="/game" element={<Game />} />
          </Routes>
        </Router>
      </div>
    );
}

export default App;
