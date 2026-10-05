import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

export type GovRole = "superadmin" | "state_admin" | "district_admin" | "verifier" | "admin";

export interface GovSession {
  user: {
    id: string;
    email: string;
    role: GovRole;
    fullName?: string;
    district?: string;
    state?: string;
  };
}

export async function getGovSession(): Promise<GovSession | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  return session as unknown as GovSession;
}

export function hasPermission(role: GovRole, requiredRole: GovRole): boolean {
  const hierarchy: GovRole[] = ["superadmin", "state_admin", "district_admin", "verifier", "admin"];
  return hierarchy.indexOf(role) <= hierarchy.indexOf(requiredRole);
}

export function canAccessDistrict(userRole: GovRole, userDistrict: string | undefined, targetDistrict: string): boolean {
  if (userRole === "superadmin" || userRole === "state_admin") return true;
  if (!userDistrict) return false;
  return userDistrict === targetDistrict;
}
