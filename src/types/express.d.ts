export {};

declare global {
  namespace Express {
    export interface Request {
      token: string | null;
      userId?: number | null;
      roleId?: number | null;
      adminAccess?: boolean | null;
      appAccess?: boolean | null;
      permissions?: Permission[] | null;
    }
  }
}
