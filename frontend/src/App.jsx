import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import Signup from "./pages/Signup/Signup";
import Login from "./pages/Login/Login";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import RouteTitleHandler from "./components/RouteTitle/RouteTitleHandler";

const App = () => {
  return (
    <BrowserRouter>
      <RouteTitleHandler />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
      <ToastContainer position="top-center" autoClose={500}/>
    </BrowserRouter>
  );
};

export default App;
