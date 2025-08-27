import React, { type FC } from 'react';
import { Outlet } from 'react-router-dom';
import { NavBar } from '@/frontend/components/nav-bar';
import { Column } from '@/frontend/components/ui/layout/column';

export const AppLayout: FC = React.memo(function AppLayout() {
  return (
    <Column>
      <NavBar />
      <Outlet />
    </Column>
  );
});
