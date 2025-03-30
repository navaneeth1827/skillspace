import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import Home from "@/pages/Home";
import Jobs from "@/pages/Jobs";
import PostJob from "@/pages/PostJob";
import Profile from "@/pages/Profile";
import MyJobs from "@/pages/MyJobs";
import SignUp from "@/pages/SignUp";
import SignIn from "@/pages/SignIn";
import SignOut from "@/pages/SignOut";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/jobs",
    element: <Jobs />,
  },
  {
    path: "/post-job",
    element: <PostJob />,
  },
  {
    path: "/profile",
    element: <Profile />,
  },
  {
    path: "/profile/:userId",
    element: <Profile />,
  },
  {
    path: "/my-jobs",
    element: <MyJobs />,
  },
  {
    path: "/sign-up",
    element: <SignUp />,
  },
  {
    path: "/sign-in",
    element: <SignIn />,
  },
  {
    path: "/sign-out",
    element: <SignOut />,
  },
]);

function App() {
  return (
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  );
}

export default App;
