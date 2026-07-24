'use client';

import React, { use } from 'react';
import VerifikasiPage from '../page';

export default function VerifikasiIdPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  
  // Set window location or pass param if needed
  return <VerifikasiPage routeId={resolvedParams?.id} />;
}
