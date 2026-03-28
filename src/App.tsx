import { Routes, Route } from "react-router-dom";
import GameMenu from "./pages/GameMenu";
import Game from "./pages/Game";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<GameMenu />} />
      <Route path="/game" element={<Game />} />
    </Routes>
  );
}
