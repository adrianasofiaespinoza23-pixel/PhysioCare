import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Patients } from './components/Patients';
import { Appointments } from './components/Appointments';
import { Treatments } from './components/Treatments';
import { BillingPage } from './components/Billing';
import { Staff } from './components/Staff';
import { TherapySessions } from './components/TherapySessions';

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');

const renderView = () => {
  switch (currentView) {
    case 'dashboard':
      return <Dashboard />;

    case 'patients':
      return <Patients />;

    case 'appointments':
      return <Appointments />;

    case 'treatments':
      return <Treatments />;

    case 'therapy-sessions':
      return <TherapySessions />;

    case 'billing':
      return <BillingPage />;

    case 'staff':
      return <Staff />;

    default:
      return <Dashboard />;
  }
};

  return (
    <Layout currentView={currentView} onViewChange={setCurrentView}>
      {renderView()}
    </Layout>
  );
}
