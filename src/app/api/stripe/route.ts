import { auth, currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { stripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";

const paymentsUrl = absoluteUrl("/subscription");

/*
  This route will create a checkout session or open billing portal with stripe
  It first checks to see if there is a authorized user using clerk
  Second it checks if that user has a subscription using userId
    If they do - it opens the billing portal
    If they do not - it opens the checkout sewssion with the defined product
  Finally it returns the user to paymentsUrl when complete
*/

export async function GET() {
  try {
    const { userId } = auth();
    const user = await currentUser();

    if (!userId || !user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userSubscription = await prismadb.subscription.findUnique({
      where: {
        userId,
      },
    });

    if (userSubscription && userSubscription.stripeCustomerId) {
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: userSubscription.stripeCustomerId,
        return_url: paymentsUrl, //payment url?
      });

      return new NextResponse(
        JSON.stringify({
          url: stripeSession.url,
        })
      );
    }

    const stripeSession = await stripe.checkout.sessions.create({
      success_url: paymentsUrl,
      cancel_url: paymentsUrl,
      payment_method_types: ["card"],
      mode: "subscription",
      billing_address_collection: "auto",
      customer_email: user.emailAddresses[0].emailAddress,
      line_items: [
        {
          price_data: {
            currency: "USD",
            product_data: {
              name: "Attires.ai Subscription",
              description: "Visualize up to 100 outfits per month",
            },
            unit_amount: 399,
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId,
      },
    });

    return new NextResponse(
      JSON.stringify({
        url: stripeSession.url,
      })
    );
  } catch (error) {
    console.log("[STRIPE_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
