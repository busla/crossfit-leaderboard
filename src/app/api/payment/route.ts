import { NextRequest, NextResponse } from "next/server";
import { createPayment } from "../../lib/payment";
import { generateHMAC } from "../../lib/hmac";

export async function POST(req: NextRequest) {
  try {
    const { msisdn, amount, description, orderid, callbackUrl } =
      await req.json();

    const hmac = generateHMAC(msisdn, amount, process.env.AUR_WEB_KEY!);

    const paymentData = {
      msisdn,
      amount,
      description,
      orderid,
      hmac,
      callbackUrl,
    };

    const paymentResponse = await createPayment(paymentData);
    console.log(paymentResponse);
    return NextResponse.json(paymentResponse, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
