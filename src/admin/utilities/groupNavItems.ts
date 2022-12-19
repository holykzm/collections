import { Label, SvgIconComponent, VerifiedUser } from '@mui/icons-material';
import PeopleIcon from '@mui/icons-material/People';

export type GroupItem = {
  id: string;
  label: string;
  href: string;
  Icon: SvgIconComponent;
};

export type Group = {
  id: string;
  label: string;
  items: GroupItem[];
};

const groupNavItems = (collections: Record<keyof { collection: string }, unknown>[]): Group[] => {
  return [
    {
      id: 'group-collections',
      label: 'Content Management',
      items: collections.map((meta) => ({
        id: `${meta.collection}`,
        label: `${meta.collection}`,
        href: `/admin/collections/${meta.collection}`,
        Icon: Label,
      })),
    },
    {
      id: 'group-admin',
      label: 'Admin',
      items: [
        {
          id: 'users',
          label: 'Users',
          href: '/admin/users',
          Icon: PeopleIcon,
        },
        {
          id: 'roles',
          label: 'Roles',
          href: '/admin/roles',
          Icon: VerifiedUser,
        },
      ],
    },
  ];
};

export default groupNavItems;