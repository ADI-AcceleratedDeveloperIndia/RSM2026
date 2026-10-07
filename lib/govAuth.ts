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

const ROLE_WEIGHTS: Record<GovRole, number> = {
  superadmin: 100,
  admin: 90,
  state_admin: 80,
  district_admin: 50,
  verifier: 20,
};

export function hasPermission(role: GovRole, requiredRole: GovRole): boolean {
  const userWeight = ROLE_WEIGHTS[role] ?? 0;
  const requiredWeight = ROLE_WEIGHTS[requiredRole] ?? 0;
  return userWeight >= requiredWeight;
}

export function canAccessDistrict(
  userRole: GovRole,
  userDistrict: string | undefined,
  targetDistrict: string
): boolean {
  if (userRole === "superadmin" || userRole === "admin" || userRole === "state_admin") {
    return true;
  }
  if (!userDistrict) return false;
  
  const normUser = userDistrict.trim().toLowerCase();
  const normTarget = targetDistrict.trim().toLowerCase();

  if (normUser === "all districts" || normUser === "state headquarters" || normUser === "all") {
    return true;
  }

  return normUser === normTarget;
}

export function getScopedDistrict(
  session: GovSession | null,
  requestedDistrict?: string | null
): string | null {
  if (!session?.user) return requestedDistrict && requestedDistrict !== "all" ? requestedDistrict : null;
  const { role, district } = session.user;
  if (role === "district_admin" || role === "verifier") {
    return district || requestedDistrict || null;
  }
  return requestedDistrict && requestedDistrict !== "all" ? requestedDistrict : null;
}

