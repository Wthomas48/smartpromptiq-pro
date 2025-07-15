import React from 'react';
import Layout from '../components/Layout';
import PromptBuilder from '../components/PromptBuilder';

interface PromptBuilderPageProps {
  user?: {
    name: string;
    email: string;
    avatar?: string;
  } | null;
  onAuthAction?: (action: 'login' | 'signup' | 'logout') => void;
}

export default function PromptBuilderPage({ user, onAuthAction }: PromptBuilderPageProps) {
  return (
    <Layout user={user} onAuthAction={onAuthAction}>
      <PromptBuilder user={user} onAuthAction={onAuthAction} />
    </Layout>
  );
}