export {};

declare global {
  interface CustomJwtSessionClaims {
    org_id?: string;
    org_role?: string;
    org_slug?: string;
    org_permissions?: string[];
    name?: string;
    email?: string;
    picture?: string;
    nickname?: string;
    given_name?: string;
    family_name?: string;
    phone_number?: string;
    email_verified?: boolean;
    phone_number_verified?: boolean;
    updated_at?: string;
  }
}
