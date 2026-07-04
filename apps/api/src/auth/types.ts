import { UserRole } from "@bioconecta/types";

export type AccessTokenPayload = {
  email: string;
  roles: UserRole[];
  sessionId: string;
  sub: string;
};

export type AuthenticatedRequest = {
  headers: {
    authorization?: string;
  };
  user: AccessTokenPayload;
};

export type PublicUser = {
  email: string;
  emailVerifiedAt: Date | null;
  firstName: string;
  id: string;
  lastName: string;
  phone: string | null;
  roles: UserRole[];
};
