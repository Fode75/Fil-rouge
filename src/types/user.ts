// Rôles alignés sur le schéma BDD : user_role ENUM ('admin', 'member', 'volunteer')
export type Role = "admin" | "member" | "volunteer";

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  avatar_url?: string;
}

