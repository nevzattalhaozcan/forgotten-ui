import React from "react";
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from "react-router-dom";
import RootLayout from "./layouts/RootLayout";
import Home from "./pages/Home";
import Discover from "./pages/Discover";
import UserDashboard from "./pages/UserDashboard";
import ClubDashboard from "./pages/ClubDashboard";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<RootLayout />}>
      <Route index element={<Home />} />
      <Route path="discover" element={<Discover />} />
      <Route path="user" element={<UserDashboard />} />
      <Route path="club" element={<ClubDashboard />} />
      <Route path="*" element={<div>Not Found</div>} />
    </Route>
  )
);

const App: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default App;