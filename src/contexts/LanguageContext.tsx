import React, { createContext, useContext, useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

type Language = 'en' | 'ml' | 'hi' | 'ta';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    'app.title': 'Kerala Health Records',
    'nav.dashboard': 'Dashboard',
    'nav.appointments': 'Appointments',
    'nav.records': 'Health Records',
    'nav.chat': 'Health Assistant',
    'nav.profile': 'Profile',
    'nav.logout': 'Logout',
    'login.title': 'Login to Kerala Health',
    'login.subtitle': 'Access your digital health records',
    'login.abha': 'ABHA ID',
    'login.phone': 'Phone Number',
    'login.email': 'Email Address',
    'login.name': 'Full Name',
    'login.userType': 'User Type',
    'login.language': 'Preferred Language',
    'login.submit': 'Login / Register',
    'login.migrant': 'Migrant Worker',
    'login.local': 'Local Resident',
    'login.returning': 'Returning Indian',
    'login.foreigner': 'Foreign National',
    'dashboard.welcome': 'Welcome back',
    'dashboard.upcomingAppointments': 'Upcoming Appointments',
    'dashboard.recentRecords': 'Recent Health Records',
    'dashboard.activeAlerts': 'Active Health Alerts',
    'appointments.title': 'Appointments',
    'appointments.book': 'Book New Appointment',
    'appointments.upcoming': 'Upcoming',
    'appointments.completed': 'Completed',
    'records.title': 'Health Records',
    'records.upload': 'Upload New Record',
    'chat.title': 'Health Assistant',
    'chat.placeholder': 'Ask me about your health...',
    'profile.title': 'Profile Settings',
    'profile.personal': 'Personal Information',
    'profile.emergency': 'Emergency Contact',
    'profile.save': 'Save Changes'
  },
  ml: {
    'app.title': 'കേരള ആരോഗ്യ രേഖകൾ',
    'nav.dashboard': 'ഡാഷ്‌ബോർഡ്',
    'nav.appointments': 'അപ്പോയിന്റ്മെന്റുകൾ',
    'nav.records': 'ആരോഗ്യ രേഖകൾ',
    'nav.chat': 'ആരോഗ്യ സഹായി',
    'nav.profile': 'പ്രൊഫൈൽ',
    'nav.logout': 'ലോഗൗട്ട്',
    'login.title': 'കേരള ആരോഗ്യത്തിലേക്ക് ലോഗിൻ ചെയ്യുക',
    'login.subtitle': 'നിങ്ങളുടെ ഡിജിറ്റൽ ആരോഗ്യ രേഖകൾ ആക്സസ് ചെയ്യുക',
    'login.abha': 'ABHA ഐഡി',
    'login.phone': 'ഫോൺ നമ്പർ',
    'login.email': 'ഇമെയിൽ വിലാസം',
    'login.name': 'പൂർണ്ണമായ പേര്',
    'login.userType': 'ഉപയോക്തൃ തരം',
    'login.language': 'മുൻഗണനാ ഭാഷ',
    'login.submit': 'ലോഗിൻ / രജിസ്റ്റർ',
    'login.migrant': 'കുടിയേറ്റ തൊഴിലാളി',
    'login.local': 'പ്രാദേശിക നിവാസി',
    'login.returning': 'തിരിച്ചുവരുന്ന ഇന്ത്യക്കാരൻ',
    'login.foreigner': 'വിദേശ പൗരൻ',
    'dashboard.welcome': 'തിരികെ സ്വാഗതം',
    'dashboard.upcomingAppointments': 'വരാനുള്ള അപ്പോയിന്റ്മെന്റുകൾ',
    'dashboard.recentRecords': 'സമീപകാല ആരോഗ്യ രേഖകൾ',
    'dashboard.activeAlerts': 'സജീവ ആരോഗ്യ അലേർട്ടുകൾ',
    'appointments.title': 'അപ്പോയിന്റ്മെന്റുകൾ',
    'appointments.book': 'പുതിയ അപ്പോയിന്റ്മെന്റ് ബുക്ക് ചെയ്യുക',
    'appointments.upcoming': 'വരാനുള്ളവ',
    'appointments.completed': 'പൂർത്തിയായത്',
    'records.title': 'ആരോഗ്യ രേഖകൾ',
    'records.upload': 'പുതിയ രേഖ അപ്‌ലോഡ് ചെയ്യുക',
    'chat.title': 'ആരോഗ്യ സഹായി',
    'chat.placeholder': 'നിങ്ങളുടെ ആരോഗ്യത്തെക്കുറിച്ച് എന്നോട് ചോദിക്കുക...',
    'profile.title': 'പ്രൊഫൈൽ ക്രമീകരണങ്ങൾ',
    'profile.personal': 'വ്യക്തിഗത വിവരങ്ങൾ',
    'profile.emergency': 'അടിയന്തര ബന്ധം',
    'profile.save': 'മാറ്റങ്ങൾ സംരക്ഷിക്കുക'
  },
  hi: {
    'app.title': 'केरल स्वास्थ्य रिकॉर्ड',
    'nav.dashboard': 'डैशबोर्ड',
    'nav.appointments': 'अपॉइंटमेंट',
    'nav.records': 'स्वास्थ्य रिकॉर्ड',
    'nav.chat': 'स्वास्थ्य सहायक',
    'nav.profile': 'प्रोफाइल',
    'nav.logout': 'लॉगआउट',
    'login.title': 'केरल स्वास्थ्य में लॉगिन करें',
    'login.subtitle': 'अपने डिजिटल स्वास्थ्य रिकॉर्ड एक्सेस करें',
    'login.abha': 'ABHA ID',
    'login.phone': 'फोन नंबर',
    'login.email': 'ईमेल पता',
    'login.name': 'पूरा नाम',
    'login.userType': 'उपयोगकर्ता प्रकार',
    'login.language': 'पसंदीदा भाषा',
    'login.submit': 'लॉगिन / रजिस्टर',
    'login.migrant': 'प्रवासी कर्मचारी',
    'login.local': 'स्थानीय निवासी',
    'login.returning': 'वापस आने वाला भारतीय',
    'login.foreigner': 'विदेशी नागरिक',
    'dashboard.welcome': 'वापस स्वागत है',
    'dashboard.upcomingAppointments': 'आगामी अपॉइंटमेंट',
    'dashboard.recentRecords': 'हाल के स्वास्थ्य रिकॉर्ड',
    'dashboard.activeAlerts': 'सक्रिय स्वास्थ्य अलर्ट',
    'appointments.title': 'अपॉइंटमेंट',
    'appointments.book': 'नई अपॉइंटमेंट बुक करें',
    'appointments.upcoming': 'आगामी',
    'appointments.completed': 'पूर्ण',
    'records.title': 'स्वास्थ्य रिकॉर्ड',
    'records.upload': 'नया रिकॉर्ड अपलोड करें',
    'chat.title': 'स्वास्थ्य सहायक',
    'chat.placeholder': 'अपने स्वास्थ्य के बारे में मुझसे पूछें...',
    'profile.title': 'प्रोफाइल सेटिंग्स',
    'profile.personal': 'व्यक्तिगत जानकारी',
    'profile.emergency': 'आपातकालीन संपर्क',
    'profile.save': 'परिवर्तन सहेजें'
  },
  ta: {
    'app.title': 'கேரளா சுகாதார பதிவுகள்',
    'nav.dashboard': 'டாஷ்போர்டு',
    'nav.appointments': 'சந்திப்புகள்',
    'nav.records': 'சுகாதார பதிவுகள்',
    'nav.chat': 'சுகாதார உதவியாளர்',
    'nav.profile': 'சுயவிவரம்',
    'nav.logout': 'வெளியேறு',
    'login.title': 'கேரளா சுகாதாரத்தில் உள்நுழையவும்',
    'login.subtitle': 'உங்கள் டிஜிட்டல் சுகாதார பதிவுகளை அணுகவும்',
    'login.abha': 'ABHA ஐடி',
    'login.phone': 'தொலைபேசி எண்',
    'login.email': 'மின்னஞ்சல் முகவரி',
    'login.name': 'முழு பெயர்',
    'login.userType': 'பயனர் வகை',
    'login.language': 'விருப்ப மொழி',
    'login.submit': 'உள்நுழைய / பதிவு',
    'login.migrant': 'புலம்பெயர்ந்த தொழிலாளர்',
    'login.local': 'உள்ளூர் குடியிருப்பாளர்',
    'login.returning': 'திரும்பும் இந்தியர்',
    'login.foreigner': 'வெளிநாட்டு குடிமகன்',
    'dashboard.welcome': 'மீண்டும் வரவேற்கிறோம்',
    'dashboard.upcomingAppointments': 'வரவிருக்கும் சந்திப்புகள்',
    'dashboard.recentRecords': 'சமீபத்திய சுகாதார பதிவுகள்',
    'dashboard.activeAlerts': 'செயலில் உள்ள சுகாதார எச்சரிக்கைகள்',
    'appointments.title': 'சந்திப்புகள்',
    'appointments.book': 'புதிய சந்திப்பை பதிவு செய்யுங்கள்',
    'appointments.upcoming': 'வரவிருக்கும்',
    'appointments.completed': 'முடிந்தது',
    'records.title': 'சுகாதார பதிவுகள்',
    'records.upload': 'புதிய பதிவு பதிவேற்றுக',
    'chat.title': 'சுகாதார உதவியாளர்',
    'chat.placeholder': 'உங்கள் சுகாதாரம் பற்றி என்னிடம் கேளுங்கள்...',
    'profile.title': 'சுயவிவர அமைப்புகள்',
    'profile.personal': 'தனிப்பட்ட தகவல்',
    'profile.emergency': 'அவசர தொடர்பு',
    'profile.save': 'மாற்றங்களை சேமிக்கவும்'
  }
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useLocalStorage<Language>('health_language', 'en');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}