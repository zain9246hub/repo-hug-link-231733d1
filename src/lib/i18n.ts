import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Load preferred language from localStorage or browser
const stored = (() => {
  try {
    return localStorage.getItem("app_language");
  } catch {
    return null;
  }
})();
const browser = (navigator?.language || "en").slice(0, 2).toLowerCase();
const initialLng = stored || browser || "en";

const resources = {
  en: {
    translation: {
      settings: {
        title: "Settings",
        notifications: {
          title: "Notifications",
          description: "Manage your notification preferences",
          push: "Push Notifications",
          push_desc: "Receive push notifications on your device",
          email: "Email Notifications",
          email_desc: "Receive property updates via email",
          new_properties: "New Properties",
          new_properties_desc: "Get notified about new listings",
          price_drops: "Price Drops",
          price_drops_desc: "Alert when saved properties reduce price"
        }
      }
    }
  },
  es: {
    translation: {
      settings: {
        title: "Ajustes",
        notifications: {
          title: "Notificaciones",
          description: "Gestiona tus preferencias de notificación",
          push: "Notificaciones push",
          push_desc: "Recibe notificaciones en tu dispositivo",
          email: "Notificaciones por correo",
          email_desc: "Recibe actualizaciones por correo",
          new_properties: "Nuevas propiedades",
          new_properties_desc: "Recibe avisos de nuevos anuncios",
          price_drops: "Bajadas de precio",
          price_drops_desc: "Aviso cuando baje el precio de guardados"
        }
      }
    }
  },
  fr: {
    translation: {
      settings: {
        title: "Paramètres",
        notifications: {
          title: "Notifications",
          description: "Gérez vos préférences de notification",
          push: "Notifications push",
          push_desc: "Recevez des notifications sur votre appareil",
          email: "Notifications e-mail",
          email_desc: "Recevez des mises à jour par e-mail",
          new_properties: "Nouvelles annonces",
          new_properties_desc: "Soyez informé des nouvelles annonces",
          price_drops: "Baisse de prix",
          price_drops_desc: "Alerte lorsque le prix baisse"
        }
      }
    }
  },
  hi: {
    translation: {
      settings: {
        title: "सेटिंग्स",
        notifications: {
          title: "सूचनाएँ",
          description: "अपनी सूचना पसंद प्रबंधित करें",
          push: "पुश सूचनाएँ",
          push_desc: "अपने डिवाइस पर सूचनाएँ प्राप्त करें",
          email: "ईमेल सूचनाएँ",
          email_desc: "ईमेल के माध्यम से संपत्ति अपडेट प्राप्त करें",
          new_properties: "नई संपत्तियाँ",
          new_properties_desc: "नई लिस्टिंग के बारे में सूचित हों",
          price_drops: "कीमत में कमी",
          price_drops_desc: "जब सहेजी गई संपत्तियों की कीमत घटे तो अलर्ट"
        }
      }
    }
  },
  ar: {
    translation: {
      settings: {
        title: "الإعدادات",
        notifications: {
          title: "الإشعارات",
          description: "إدارة تفضيلات الإشعارات",
          push: "إشعارات الدفع",
          push_desc: "استلم إشعارات على جهازك",
          email: "إشعارات البريد الإلكتروني",
          email_desc: "استلم تحديثات العقارات عبر البريد",
          new_properties: "عقارات جديدة",
          new_properties_desc: "تلقَّ تنبيهات عن الإعلانات الجديدة",
          price_drops: "انخفاض السعر",
          price_drops_desc: "تنبيه عند انخفاض سعر العقارات المحفوظة"
        }
      }
    }
  }
} as const;

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLng,
    fallbackLng: "en",
    interpolation: { escapeValue: false },
  });

export default i18n;
