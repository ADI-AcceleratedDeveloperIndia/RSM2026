import { SignJWT, jwtVerify } from "jose";

const SECRET = process.env.CERT_HMAC_SECRET || "default-secret-change-me";

export async function signCertificateUrl(
  certificateId: string,
  issuedAt: number = Date.now()
): Promise<string> {
  const secret = new TextEncoder().encode(SECRET);
  const token = await new SignJWT({ cid: certificateId, iat: issuedAt })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("15m")
    .sign(secret);

  return token;
}

export async function verifyCertificateUrl(token: string): Promise<{
  cid: string;
  iat: number;
} | null> {
  try {
    const secret = new TextEncoder().encode(SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload as { cid: string; iat: number };
  } catch {
    return null;
  }
}










