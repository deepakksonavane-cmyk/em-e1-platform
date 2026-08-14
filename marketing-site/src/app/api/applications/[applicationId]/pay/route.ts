import { NextRequest, NextResponse } from "next/server";
import { createPaymentOrder, verifyPayment, PROGRAM_FEE_INR, APPLICATION_FEE_INR } from "@/lib/payment";
import { findApplication, markApplicationPaid } from "@/lib/applications";

export async function POST(
  request: NextRequest,
  { params }: { params: { applicationId: string } }
) {
  const { applicationId } = params;

  const application = await findApplication(applicationId);
  if (!application) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  const totalDue = PROGRAM_FEE_INR + APPLICATION_FEE_INR;

  // Step 1: create a Razorpay order (mock mode fabricates an order id).
  const order = await createPaymentOrder(totalDue, applicationId);

  // Step 2: in a real integration, the client-side Razorpay Checkout widget
  // would run here and return a payment id + signature. In mock mode we
  // simulate that round trip immediately so the flow can be demoed without
  // real credentials.
  const verification = await verifyPayment({
    orderId: order.orderId,
    paymentId: `pay_mock_${applicationId}`,
    signature: "mock-signature",
  });

  if (!verification.verified) {
    return NextResponse.json({ error: "Payment verification failed" }, { status: 402 });
  }

  const updated = await markApplicationPaid(
    applicationId,
    order.orderId,
    verification.paymentId,
    totalDue
  );

  return NextResponse.json({
    success: true,
    mock: order.mock,
    applicationId,
    paymentId: verification.paymentId,
    amountPaidInr: totalDue,
    status: updated?.status ?? "payment_complete",
  });
}
