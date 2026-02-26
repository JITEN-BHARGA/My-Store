import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET as string;

// 🔹 Generate JWT with userId + role
export const jwtGeneration = (userId: string, role: string) => {
  const token = jwt.sign({ id: userId, role : role }, secret, { expiresIn: "7d" });
  return token;
};

// 🔹 Verify token and return decoded payload
export const tokenVerify = (token: string) => {
  try {
    const decoded = jwt.verify(token, secret) as { id: string; role: string; iat: number; exp: number };
    return decoded;
  } catch (err) {
    return null; // invalid token
  }
};