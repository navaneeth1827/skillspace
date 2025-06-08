
import React from 'react';
import Navbar from '@/components/Navbar';
import ReceivedApplications from '@/components/ReceivedApplications';

const Applications = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Job Applications</h1>
          <p className="text-muted-foreground">
            Manage applications received for your job postings
          </p>
        </div>
        <ReceivedApplications />
      </div>
    </div>
  );
};

export default Applications;
