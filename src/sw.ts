/// <reference lib="webworker" />

import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate } from 'workbox-strategies';

declare let self: ServiceWorkerGlobalScope;

precacheAndRoute(self.__WB_MANIFEST);

// Runtime caching for same-origin navigations and basic assets
registerRoute(
  ({ request, sameOrigin }) => sameOrigin && (request.destination === 'script' || request.destination === 'style' || request.destination === 'image'),
  new StaleWhileRevalidate({})
);

self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  event.waitUntil(
    (self as any).registration.showNotification(data.title, {
      body: data.body,
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      data: data.data || {},
      actions: data.actions || [],
      requireInteraction: true,
      silent: false,
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const action = event.action;
  const workOrderId = event.notification.data?.workOrderId;
  const notificationId = event.notification.data?.notificationId;

  if (action === 'view' && workOrderId) {
    // Navigate to the work order details page
    event.waitUntil(
      (self as any).clients.openWindow(`/work-orders/${workOrderId}`)
    );
  } else if (action === 'mark_read' && notificationId) {
    // Mark notification as read (this would typically call an API)
    event.waitUntil(
      (self as any).clients.openWindow('/')
    );
  } else {
    // Default action: open the app
    event.waitUntil(
      (self as any).clients.openWindow('/')
    );
  }
});

self.addEventListener('notificationclose', (_event) => {
  // Handle notification close event if needed
  // console.log('Notification was closed', event);
});
