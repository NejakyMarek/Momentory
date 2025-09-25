import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY;
if (!secretKey) {
  // Make failure explicit in non-test envs; keep dev DX clear with descriptive error
  throw new Error("Missing STRIPE_SECRET_KEY environment variable.");
}

export const stripe = new Stripe(secretKey, {
  apiVersion: "2024-06-20" as Stripe.LatestApiVersion
});