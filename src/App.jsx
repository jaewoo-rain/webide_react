import MainPage from "./pages/MainPage";
import IdePage from "./pages/IdePage";
import { Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";

export default function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/ide/:cid" element={<IdePage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </>
  )

}