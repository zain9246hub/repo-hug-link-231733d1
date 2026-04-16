// Register service worker for push notifications
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (!('serviceWorker' in navigator)) return null;
  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    return registration;
  } catch (err) {
    console.error('SW registration failed:', err);
    return null;
  }
};

export const requestPushPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) return false;
  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

export const showLocalNotification = (title: string, body: string, url?: string) => {
  if (Notification.permission !== 'granted') return;
  
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification(title, {
        body,
        icon: '/favicon.ico',
        tag: `notif-${Date.now()}`,
        data: { url: url || '/notifications' },
        vibrate: [200, 100, 200],
      });
    });
  } else {
    new Notification(title, { body, icon: '/favicon.ico' });
  }
};
