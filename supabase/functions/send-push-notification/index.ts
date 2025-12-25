
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import webpush from "https://deno.land/x/web_push@0.2.2/mod.ts";

const VAPID_PUBLIC_KEY = Deno.env.get("VITE_VAPID_PUBLIC_KEY");
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
  console.error("VAPID keys not configured");
}

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

serve(async (req) => {
  try {
    const { record } = await req.json();

    if (!record || !record.user_id) {
      return new Response("Invalid request payload", { status: 400 });
    }

    // Get the user's push subscription from the profiles table
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("push_subscription")
      .eq("id", record.user_id)
      .single();

    if (error || !profile || !profile.push_subscription) {
      console.log("User profile or push subscription not found:", error);
      return new Response("User profile or push subscription not found", { status: 404 });
    }

    const subscription = profile.push_subscription;

    // Convert subscription object back to the format expected by web-push
    const webPushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
    };

    const payload = JSON.stringify({
      title: "CMMS Alert",
      body: record.message || "You have a new update",
      icon: "/pwa-192x192.png",
      badge: "/pwa-192x192.png",
      data: {
        workOrderId: record.work_order_id,
        notificationId: record.id,
      },
      actions: [
        {
          action: "view",
          title: "View Work Order",
        },
        {
          action: "mark_read",
          title: "Mark as Read",
        },
      ],
    });

    await webpush.sendNotification(
      webPushSubscription,
      payload,
      {
        vapidDetails: {
          subject: "mailto:admin@cmms-app.com",
          publicKey: VAPID_PUBLIC_KEY,
          privateKey: VAPID_PRIVATE_KEY,
        },
      }
    );

    return new Response("Push notification sent successfully.", { status: 200 });
  } catch (error) {
    console.error("Error sending push notification:", error);
    return new Response("Failed to send push notification.", { status: 500 });
  }
});
