// Register service worker for push notifications
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  console.warn('Service worker registration is temporarily disabled while auditing the Vercel blank-screen issue.');
  return null;
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
      } as NotificationOptions);
    });
  } else {
    new Notification(title, { body, icon: '/favicon.ico' });
  }
};
