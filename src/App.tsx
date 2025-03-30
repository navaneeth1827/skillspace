
import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import Jobs from "@/pages/Jobs";
import PostJob from "@/pages/PostJob";
import Profile from "@/pages/Profile";
import MyJobs from "@/pages/MyJobs";
import Messages from "@/pages/Messages";
import { Navigate } from 'react-router-dom';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/jobs" replace />,
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
    path: "/messages",
    element: <Messages />,
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
