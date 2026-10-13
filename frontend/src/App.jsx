import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import Signup from "./pages/Signup/Signup";
import Login from "./pages/Login/Login";
import RouteTitleHandler from "./components/RouteTitle/RouteTitleHandler";
import Reminders from "./pages/Reminders/Reminders";
import Archive from "./pages/Archive/Archive";
import NotFound from "./pages/NotFound/NotFound";
import AppLayout from "./components/layout/AppLayout";
import { Toaster } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";

const App = () => {
  return (
    <BrowserRouter>
      <TooltipProvider delayDuration={300}>
        <RouteTitleHandler />
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/reminders" element={<Reminders />} />
            <Route path="/archive" element={<Archive />} />
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          {/* any other URL (e.g. /index.html or a typo) */}
          <Route path="*" element={<NotFound />} />
        </Routes>

        <Toaster position="top-center" closeButton />
      </TooltipProvider>
    </BrowserRouter>
  );
};

export default App;
