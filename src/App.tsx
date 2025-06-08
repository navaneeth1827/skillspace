
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import Index from '@/pages/Index';
import SignIn from '@/pages/SignIn';
import SignUp from '@/pages/SignUp';
import Dashboard from '@/pages/Dashboard';
import Profile from '@/pages/Profile';
import UserSettings from '@/pages/UserSettings';
import Jobs from '@/pages/Jobs';
import JobDetails from '@/pages/JobDetails';
import PostJob from '@/pages/PostJob';
import MyJobs from '@/pages/MyJobs';
import Applications from '@/pages/Applications';
import FindJob from '@/pages/FindJob';
import Tasks from '@/pages/Tasks';
import Calendar from '@/pages/Calendar';
import Messages from '@/pages/Messages';
import Community from '@/pages/Community';
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-background text-foreground">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile/:userId" element={<Profile />} />
              <Route path="/settings" element={<UserSettings />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/job/:id" element={<JobDetails />} />
              <Route path="/post-job" element={<PostJob />} />
              <Route path="/my-jobs" element={<MyJobs />} />
              <Route path="/applications" element={<Applications />} />
              <Route path="/find-job" element={<FindJob />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/messages/:userId" element={<Messages />} />
              <Route path="/community" element={<Community />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <Toaster />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
