import { promises as fs } from "node:fs";
import path from "node:path";
import { randomBytes, randomUUID, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const storePath = path.join(process.cwd(), ".data", "users.json");

export type User = {
  id?: string;
  email: string;
  name: string;
  phone?: string;
  image?: string;
  salt?: string;
  passwordHash?: string;
  provider?: string;
  providerAccountId?: string;
  createdAt?: string;
  updatedAt?: string;
};

export async function readUsers(): Promise<User[]> {
  try {
    return JSON.parse(await fs.readFile(storePath, "utf8")) as User[];
  } catch {
    return [];
  }
}

export async function writeUsers(users: User[]) {
  await fs.mkdir(path.dirname(storePath), { recursive: true });
  await fs.writeFile(storePath, JSON.stringify(users, null, 2), "utf8");
}

async function hashPassword(password: string, salt: string) {
  const derived = (await scrypt(password, Buffer.from(salt, "hex"), 64)) as Buffer;
  return derived.toString("hex");
}

export async function createUser(email: string, name: string, password: string) {
  const users = await readUsers();
  const normalizedEmail = email.toLowerCase().trim();
  if (users.some((user) => user.email.toLowerCase() === normalizedEmail)) return false;
  const salt = randomBytes(16).toString("hex");
  const now = new Date().toISOString();
  users.push({
    id: randomUUID(),
    email: normalizedEmail,
    name,
    salt,
    passwordHash: await hashPassword(password, salt),
    provider: "credentials",
    createdAt: now,
    updatedAt: now,
  });
  await writeUsers(users);
  return true;
}

export async function verifyUser(email: string, password: string) {
  const normalizedEmail = email.toLowerCase().trim();
  const user = (await readUsers()).find((entry) => entry.email.toLowerCase() === normalizedEmail);
  if (!user || !user.salt || !user.passwordHash) return null;
  const expected = Buffer.from(user.passwordHash, "hex");
  const actual = Buffer.from(await hashPassword(password, user.salt), "hex");
  return expected.length === actual.length && timingSafeEqual(expected, actual) ? user : null;
}

export async function upsertGoogleUser(profile: { email: string; name: string; image?: string; sub: string }) {
  const users = await readUsers();
  const normalizedEmail = profile.email.toLowerCase().trim();
  let user = users.find((entry) => entry.email.toLowerCase() === normalizedEmail);
  const now = new Date().toISOString();

  if (user) {
    user.name = user.name || profile.name;
    user.image = profile.image || user.image;
    user.provider = user.provider || "google";
    user.providerAccountId = profile.sub || user.providerAccountId;
    user.updatedAt = now;
  } else {
    user = {
      id: randomUUID(),
      email: normalizedEmail,
      name: profile.name || normalizedEmail.split("@")[0],
      image: profile.image,
      provider: "google",
      providerAccountId: profile.sub,
      createdAt: now,
      updatedAt: now,
    };
    users.push(user);
  }

  await writeUsers(users);
  return user;
}

export async function findOrCreateOtpUser(identifier: string, type: "email" | "phone", name?: string) {
  const users = await readUsers();
  const cleanId = identifier.trim().toLowerCase();
  const now = new Date().toISOString();

  let user = users.find((entry) =>
    type === "email" ? entry.email.toLowerCase() === cleanId : entry.phone === cleanId || entry.email === `${cleanId}@smartpilot.local`
  );

  if (!user) {
    user = {
      id: randomUUID(),
      email: type === "email" ? cleanId : `${cleanId}@smartpilot.local`,
      phone: type === "phone" ? cleanId : undefined,
      name: name || (type === "email" ? cleanId.split("@")[0] : `User ${cleanId.slice(-4)}`),
      provider: "otp",
      createdAt: now,
      updatedAt: now,
    };
    users.push(user);
    await writeUsers(users);
  }

  return user;
}

export async function getUserByEmail(email: string) {
  const normalizedEmail = email.toLowerCase().trim();
  const user = (await readUsers()).find((entry) => entry.email.toLowerCase() === normalizedEmail);
  return user ? { id: user.id, email: user.email, name: user.name, image: user.image, phone: user.phone } : null;
}

export async function getUserByIdentifier(identifier: string) {
  const cleanId = identifier.toLowerCase().trim();
  const user = (await readUsers()).find(
    (entry) => entry.email.toLowerCase() === cleanId || entry.phone === cleanId || entry.id === cleanId
  );
  return user ? { id: user.id, email: user.email, name: user.name, image: user.image, phone: user.phone } : null;
}

export function setSession(response: Response, identifier: string) {
  const nextResponse = response as Response & {
    cookies?: { set: (name: string, value: string, options: Record<string, unknown>) => void };
  };
  nextResponse.cookies?.set("smartpilot_session", `user:${identifier}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}