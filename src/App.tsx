import React, { type JSX } from "react";
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from "react-router-dom";
import RootLayout from "./layouts/RootLayout";
import Home from "./pages/Home";
import Discover from "./pages/Discover";
import UserDashboard from "./pages/UserDashboard";
import ClubDashboard from "./pages/ClubDashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";

function RequireAuth({ children }: { children: JSX.Element }) {
  const token = localStorage.getItem("token");
  if (!token) {
    // save intended location via router state if you like
    return <div className="container">
      <p className="mb-3">You need to sign in first.</p>
      <a className="btn" href="/login">Go to login</a>
    </div>;
  }
  return children;
}

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<RootLayout />}>
      <Route index element={<Home />} />
      <Route path="discover" element={<Discover />} />
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />
      <Route path="user" element={
        <RequireAuth><UserDashboard /></RequireAuth>
      } />
      <Route path="club">
        <Route index element={<RequireAuth><ClubDashboard /></RequireAuth>} />
        <Route path=":id" element={<RequireAuth><ClubDashboard /></RequireAuth>} />
      </Route>
      <Route path="*" element={<div>Not Found</div>} />
    </Route>
  )
);

const App: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default App;