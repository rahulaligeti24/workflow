import { useEffect, useState } from "react";
import Home from "./components/Pages/Home";
import SignIn from "./components/Pages/SignIn";
import SignUp from "./components/Pages/SignUp";
import Dashboard from "./components/Pages/Dashboard";
import "./App.css";

const getRouteFromPath = () => {
  const path = window.location.pathname.toLowerCase();

  if (path === "/signin") return "signin";
  if (path === "/signup") return "signup";
  if (path === "/dashboard") return "dashboard";

  return "home";
};

function App() {
  const [route, setRoute] = useState(getRouteFromPath);

  useEffect(() => {
    const handleLocationChange = () => setRoute(getRouteFromPath());

    const handleDocumentClick = (event) => {
      const link = event.target.closest('a[href^="/"]');

      if (!link) {
        return;
      }

      const href = link.getAttribute("href");
      if (!href) {
        return;
      }

      event.preventDefault();
      window.history.pushState({}, "", href);
      handleLocationChange();
    };

    window.addEventListener("popstate", handleLocationChange);
    document.addEventListener("click", handleDocumentClick);

    return () => {
      window.removeEventListener("popstate", handleLocationChange);
      document.removeEventListener("click", handleDocumentClick);
    };
  }, []);

  if (route === "signin") {
    return <SignIn />;
  }

  if (route === "signup") {
    return <SignUp />;
  }

  if (route === "dashboard") {
    return <Dashboard />;
  }

  return <Home />;
}

export default App;
