import React, { type FC } from 'react';
import { Outlet } from 'react-router-dom';
import { NavBar } from '@/frontend/components/common/nav-bar';
import { Column } from '@/frontend/components/ui/layout/column';

export const NavbarRoute: FC = React.memo(function NavbarRoute() {
  return (
    <Column>
      <NavBar />
      <Outlet />
    </Column>
  );
});
