import jwt from "jsonwebtoken";

export const verifyToken = async (
  data: string,
): Promise<string | jwt.JwtPayload> => {
  const payload = jwt.verify(data, process.env.JWT_SECRET!);
  if (typeof payload === "string") return payload;
  if (typeof payload.email !== "string") {
    throw new Error("Invalid token subject");
  }
  return payload.email;
};
