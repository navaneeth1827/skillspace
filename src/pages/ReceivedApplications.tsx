
import React from 'react';
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import ReceivedApplicationsList from "@/components/ReceivedApplicationsList";

const ReceivedApplications = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div>
        <Navbar />
        <div className="container py-8 pt-24 max-w-6xl">
          <h1 className="text-2xl font-bold mb-6">Received Applications</h1>
          <p>Please sign in to view applications.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container py-8 pt-24 max-w-6xl">
        <h1 className="text-2xl font-bold mb-6">Received Applications</h1>
        <p className="text-muted-foreground mb-6">
          Applications received for jobs you've posted
        </p>
        <ReceivedApplicationsList />
      </div>
    </div>
  );
};

export default ReceivedApplications;
