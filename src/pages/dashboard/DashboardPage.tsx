"use client";

import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function DashboardPage() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/dashboard/browse');
  }, [navigate]);

  return null;
}
