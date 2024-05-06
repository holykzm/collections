import React from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import lazy from '../../../utilities/lazy.js';
import { Loader } from '../../elements/Loader/index.js';
import { MainHeader } from '../../elements/MainHeader/index.js';
import { SidebarLayout } from '../../layouts/Sidebar/index.js';

const PostPage = Loader(lazy(() => import('../../../pages/Post/index.js'), 'PostPage'));

export const TenantRootRoutes = () => {
  const { t } = useTranslation();

  return {
    path: '/admin',
    element: <SidebarLayout variable="tenant" />,
    children: [
      { path: '', element: <Navigate to="/admin/posts" replace /> },
      {
        path: 'posts',
        element: (
          <MainHeader label={t('posts')}>
            <PostPage />
          </MainHeader>
        ),
      },
    ],
  };
};