import { Routes, Route, BrowserRouter } from 'react-router-dom';
import Home from './components/Home';
import GameWrapper from './components/GameWrapper';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/host/:gameId" element={<GameWrapper view="host" />} />
        <Route path="/lobby/:gameId" element={<GameWrapper view="player" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
