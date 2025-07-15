import React from 'react';
import Layout from '../components/Layout';
import Home from '../components/Home';

interface HomePageProps {
  user?: {
    name: string;
    email: string;
    avatar?: string;
  } | null;
  onAuthAction?: (action: 'login' | 'signup' | 'logout') => void;
}

export default function HomePage({ user, onAuthAction }: HomePageProps) {
  return (
    <Layout user={user} onAuthAction={onAuthAction}>
      <Home />
    </Layout>
  );
}