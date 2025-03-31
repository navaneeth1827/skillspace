
import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';

import Index from "@/pages/Index";
import Jobs from "@/pages/Jobs";
import PostJob from "@/pages/PostJob";
import Profile from "@/pages/Profile";
import MyJobs from "@/pages/MyJobs";
import Messages from "@/pages/Messages";
import Dashboard from "@/pages/Dashboard";
import Community from "@/pages/Community";
import Calendar from "@/pages/Calendar";
import FindJob from "@/pages/FindJob";
import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/SignUp";
import Tasks from "@/pages/Tasks";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
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
    path: "/messages/:userId",
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
  {
    path: "/tasks",
    element: <Tasks />,
  },
  {
    path: "/sign-in",
    element: <SignIn />,
  },
  {
    path: "/sign-up",
    element: <SignUp />,
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
