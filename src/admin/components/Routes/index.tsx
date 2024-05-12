import React from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { getLoginUrl } from '../../utilities/urlGenerator.js';
import { Loading } from '../elements/Loading/index.js';
import { useAuth } from '../utilities/Auth/index.js';
import { UserInvitationRoutes } from './UserInvitation/index.js';
import { AuthRoutes } from './Auth/index.js';
import { GuestInvitationRoutes } from './GuestInvitation/index.js';
import { MeRoutes } from './Me/index.js';
import { NavigateLoginRoutes } from './NavigateLogin/index.js';
import { NoRoutes } from './NoRoutes/index.js';
import { PortalRootRoutes } from './PortalRoot/index.js';
import { PostRoutes } from './Post/index.js';
import { SettingRoutes } from './Setting/index.js';
import { TenantRootRoutes } from './TenantRoot/index.js';

export const Routes: React.FC = () => {
  const { me, tenantRole } = useAuth();

  const portalRouter = createBrowserRouter([
    PortalRootRoutes(),
    MeRoutes(),
    AuthRoutes(),
    UserInvitationRoutes(),
    NoRoutes(),
  ]);
  const portalGuestRouter = createBrowserRouter([
    AuthRoutes(),
    GuestInvitationRoutes(),
    NavigateLoginRoutes(),
  ]);

  const tenantRouter = createBrowserRouter([
    TenantRootRoutes(),
    PostRoutes(),
    SettingRoutes(tenantRole?.isAdmin || false),
    NoRoutes(),
  ]);

  if (me === undefined) return <Loading />;

  const hostParts = window.location.host.split('.');
  const subdomain = hostParts.length > 2 ? hostParts.slice(0, -2).join('.') : null;
  if (subdomain) {
    if (me === null) {
      window.location.href = getLoginUrl();
      return;
    }

    return <RouterProvider router={tenantRouter} />;
  } else {
    return <RouterProvider router={me ? portalRouter : portalGuestRouter} />;
  }
};
