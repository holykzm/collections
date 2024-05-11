import '@auth/express';

declare module '@auth/express' {
  interface Session {
    user?: {
      id: string;
      email: string;
      name: string;
      projects: {
        [key: string]: {
          id: string;
          subdomain: string;
          description: string | null;
          iconUrl: string | null;
          enabled: boolean;
          role: {
            id: string;
            projectId: string;
            name: string;
            description: string;
            isAdmin: boolean;
            createdAt: Date;
            updatedAt: Date;
            permissions: [];
          };
        };
      };
    };
  }
}
