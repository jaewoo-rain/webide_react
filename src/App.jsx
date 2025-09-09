import LoginPage from "./pages/LoginPage";
import IdePage from "./pages/IdePage";
import { Route, Routes } from "react-router-dom";

export default function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/ide" element={<IdePage />} />
      </Routes>
    </>
  )

}