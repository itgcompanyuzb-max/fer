export interface RegisteredUser {
  id: string;
  email: string;
  name: string;
  password?: string;
  provider?: "email" | "google" | "apple";
  avatar_url?: string;
  createdAt: number;
}

const STORAGE_KEY = "exora_registered_users_db";

const DEFAULT_USERS: RegisteredUser[] = [
  {
    id: "usr_itg",
    email: "itgcompanyuzb@gmail.com",
    name: "ITG Company",
    password: "password123",
    provider: "google",
    avatar_url: "https://lh3.googleusercontent.com/a/default-user=s96-c",
    createdAt: Date.now() - 86400000,
  },
  {
    id: "usr_trader_demo",
    email: "demo@exora.trade",
    name: "Demo Trader",
    password: "password123",
    provider: "email",
    avatar_url: "",
    createdAt: Date.now() - 86400000 * 2,
  },
];

export function getRegisteredUsers(): RegisteredUser[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_USERS;
  }
}

export function isUserRegistered(email: string): boolean {
  const cleanEmail = email.trim().toLowerCase();
  const users = getRegisteredUsers();
  return users.some((u) => u.email.toLowerCase() === cleanEmail);
}

export function getUserByEmail(email: string): RegisteredUser | null {
  const cleanEmail = email.trim().toLowerCase();
  const users = getRegisteredUsers();
  return users.find((u) => u.email.toLowerCase() === cleanEmail) || null;
}

export function registerOrUpdateUser(
  data: { email: string; name?: string; password?: string; provider?: "email" | "google" | "apple"; avatar_url?: string }
): RegisteredUser {
  const cleanEmail = data.email.trim().toLowerCase();
  const users = getRegisteredUsers();
  const existingIdx = users.findIndex((u) => u.email.toLowerCase() === cleanEmail);

  if (existingIdx >= 0) {
    const updated: RegisteredUser = {
      ...users[existingIdx],
      name: data.name || users[existingIdx].name,
      password: data.password || users[existingIdx].password,
      provider: data.provider || users[existingIdx].provider,
      avatar_url: data.avatar_url || users[existingIdx].avatar_url,
    };
    users[existingIdx] = updated;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    } catch {}
    return updated;
  }

  const newUser: RegisteredUser = {
    id: "usr_" + Date.now(),
    email: cleanEmail,
    name: data.name || cleanEmail.split("@")[0] || "Trader",
    password: data.password || "",
    provider: data.provider || "email",
    avatar_url: data.avatar_url || "",
    createdAt: Date.now(),
  };

  users.push(newUser);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  } catch {}
  return newUser;
}

export function updateUserPassword(email: string, newPassword: string): boolean {
  const cleanEmail = email.trim().toLowerCase();
  const users = getRegisteredUsers();
  const existingIdx = users.findIndex((u) => u.email.toLowerCase() === cleanEmail);

  if (existingIdx === -1) {
    return false;
  }

  users[existingIdx].password = newPassword;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  } catch {}
  return true;
}
