// Team and user role types

export type UserRole = "viewer" | "editor" | "admin";

export interface TeamMember {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  addedAt: string;
}

export interface Team {
  id: string;
  name: string;
  createdAt: string;
  createdBy: string;
  members: TeamMember[];
}

export const ROLE_LABELS: Record<UserRole, string> = {
  viewer: "Viewer",
  editor: "Editor",
  admin: "Admin",
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  viewer: "Can view dashboards and data",
  editor: "Can create and edit dashboards",
  admin: "Full access including team management",
};
