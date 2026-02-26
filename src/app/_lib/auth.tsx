import { cookies } from "next/headers";
import { tokenVerify } from "./jwt";

export const getCurrentUser = async () => {
  const token = (await cookies()).get("token")?.value;

  if (!token) return null;

  try {
    const decoded = tokenVerify(token) as {
      id: string;
      role: "customer" | "seller";
    };

    return decoded;
  } catch {
    return null;
  }
};