/**
 * Payment integration point — Razorpay (India-appropriate default for an
 * INR-priced diploma program).
 *
 * ============================================================================
 * PRODUCTION TODO — this file runs in MOCK MODE by default.
 * ============================================================================
 * To go live:
 *   1. `npm install razorpay`
 *   2. Set real credentials in .env.local:
 *        RAZORPAY_KEY_ID=rzp_live_xxxxxxxx
 *        RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxx
 *        NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxxxxx
 *   3. Replace the mock branches below (`if (isMockMode())`) with real SDK
 *      calls — the real-call shape is written out in comments right next
 *      to each mock so wiring it up is a mechanical change.
 *   4. Add a signature-verification webhook route
 *      (`src/app/api/payment/webhook/route.ts`) that verifies
 *      `x-razorpay-signature` using RAZORPAY_KEY_SECRET before marking an
 *      application as paid.
 *
 * Until then, `createPaymentOrder` and `verifyPayment` simulate a
 * successful Razorpay checkout end-to-end so the application flow can be
 * demoed without real payment credentials or an internet-facing webhook.
 */

export interface PaymentOrder {
  orderId: string;
  amount: number; // in paise (smallest currency unit), matching Razorpay convention
  currency: string;
  receipt: string;
  mock: boolean;
}

export interface PaymentVerificationInput {
  orderId: string;
  paymentId: string;
  signature: string;
}

export interface PaymentVerificationResult {
  verified: boolean;
  mock: boolean;
  paymentId: string;
  orderId: string;
}

function isMockMode(): boolean {
  return !process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET;
}

/**
 * Creates a payment order for the given amount (in INR rupees).
 * In mock mode this simply fabricates an order id — no network call is made.
 */
export async function createPaymentOrder(
  amountInRupees: number,
  receipt: string
): Promise<PaymentOrder> {
  const amountInPaise = Math.round(amountInRupees * 100);

  if (isMockMode()) {
    return {
      orderId: `order_mock_${Date.now().toString(36)}`,
      amount: amountInPaise,
      currency: "INR",
      receipt,
      mock: true,
    };
  }

  // --- Real Razorpay call shape (uncomment once credentials are set) -----
  // import Razorpay from "razorpay";
  // const instance = new Razorpay({
  //   key_id: process.env.RAZORPAY_KEY_ID!,
  //   key_secret: process.env.RAZORPAY_KEY_SECRET!,
  // });
  // const order = await instance.orders.create({
  //   amount: amountInPaise,
  //   currency: "INR",
  //   receipt,
  // });
  // return { orderId: order.id, amount: amountInPaise, currency: "INR", receipt, mock: false };
  // -------------------------------------------------------------------------

  throw new Error(
    "Razorpay credentials are set but the live SDK call is not wired up yet. See src/lib/payment.ts."
  );
}

/**
 * Verifies a completed payment. In mock mode, always returns verified=true
 * so the demo flow can proceed to a confirmation screen.
 */
export async function verifyPayment(
  input: PaymentVerificationInput
): Promise<PaymentVerificationResult> {
  if (isMockMode()) {
    return {
      verified: true,
      mock: true,
      paymentId: input.paymentId || `pay_mock_${Date.now().toString(36)}`,
      orderId: input.orderId,
    };
  }

  // --- Real signature verification (uncomment once credentials are set) --
  // import crypto from "crypto";
  // const body = `${input.orderId}|${input.paymentId}`;
  // const expectedSignature = crypto
  //   .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
  //   .update(body)
  //   .digest("hex");
  // const verified = expectedSignature === input.signature;
  // return { verified, mock: false, paymentId: input.paymentId, orderId: input.orderId };
  // -------------------------------------------------------------------------

  throw new Error(
    "Razorpay credentials are set but signature verification is not wired up yet. See src/lib/payment.ts."
  );
}

export const PROGRAM_FEE_INR = 45000;
export const APPLICATION_FEE_INR = 1000;
