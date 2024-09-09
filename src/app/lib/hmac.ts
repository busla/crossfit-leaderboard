import crypto from "crypto";

export const generateHMAC = (
  msisdn: string,
  amount: number,
  secretKey: string,
): string => {
  const data = `${msisdn}${amount}`;
  return crypto.createHmac("sha256", secretKey).update(data).digest("hex");
};
