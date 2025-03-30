
import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';

import Jobs from "@/pages/Jobs";
import PostJob from "@/pages/PostJob";
import Profile from "@/pages/Profile";
import MyJobs from "@/pages/MyJobs";
import Messages from "@/pages/Messages";
import Dashboard from "@/pages/Dashboard";
import Community from "@/pages/Community";
import Calendar from "@/pages/Calendar";
import FindJob from "@/pages/FindJob";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: "/jobs",
    element: <Jobs />,
  },
  {
    path: "/find-job",
    element: <FindJob />,
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
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
  {
    path: "/community",
    element: <Community />,
  },
  {
    path: "/calendar",
    element: <Calendar />,
  },
]);

function App() {
  return (
    <React.StrictMode>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </React.StrictMode>
  );
}

export default App;
