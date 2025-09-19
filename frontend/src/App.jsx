import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import Signup from "./pages/Signup/Signup";
import Login from "./pages/Login/Login";
import RouteTitleHandler from "./components/RouteTitle/RouteTitleHandler";
import { Toaster } from "react-hot-toast";
import Reminders from "./pages/Reminders/Reminders";
import Archive from "./pages/Archive/Archive";

const App = () => {
  return (
    <BrowserRouter>
      <RouteTitleHandler />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/reminders" element={<Reminders />} />
        <Route path="/archive" element={<Archive />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>

      <Toaster
        position="top-center"
        toastOptions={{
          success: { duration: 3000 },
          error: { duration: 4000 },
        }}
      />
    </BrowserRouter>
  );
};

export default App;
