export interface City {
  name: string;
  state: string;
}

export const INDIAN_STATES = [
  "Gujarat"
] as const;

export const INDIAN_CITIES: Record<string, string[]> = {
  "Gujarat": ["Surat"]
};

export const SURAT_AREAS = [
  // South & West Surat
  "Adajan", "Athwa", "Vesu", "Piplod", "City Light", "New City Light",
  "Ghod Dod Road", "Parle Point", "Pal", "Pal Gam", "Palanpur Patia",
  "Palanpur Jakatnaka", "Althan", "Bhatar", "Dumas Road", "Magdalla",
  "VIP Road", "Vesu Canal Road", "Someshwara Enclave", "Green City",
  "Rundh", "Pisad", "Astar", "Jahangirabad", "Fulpada",
  "Parvat Patia", "Umra", "Dabholi", "Uttran",

  // East Surat
  "Varachha", "Mota Varachha", "Kapodra", "Katargam", "Sarthana",
  "Singanpore", "Amroli", "Jahangirpura", "Bamroli", "Kosad",
  "Dindoli", "Udhna", "Pandesara", "Sachin", "Limbayat",
  "Mora Bhagal",

  // Central & Old City
  "Majura Gate", "Ring Road", "Nanpura", "Gopipura", "Lal Darwaja",
  "Chowk Bazaar", "Mahidharpura", "Salabatpura", "Begampura",
  "Rustampura", "Nanavat", "Sagrampura", "Tadwadi", "Bhagal",
  "Ichchhanath", "Rander",

  // Outer / Peripheral Areas
  "Olpad", "Hajira", "Kim", "Palsana", "Bardoli", "Kamrej",
  "Abhva", "Gavier", "Laskana", "Pipla", "Vanz",

  // Additional Areas
  "Adajan Patia", "Adajan Gam", "Athwa Gate", "Athwalines",
  "Bhestan", "Bhimrad", "Bhunaswad", "Budhiya", "Canal Road",
  "Causeway Road", "Chalthan", "Chanda Wadi", "Chauta Bazaar",
  "Chorasi", "Dariapur", "Delad", "Dholkuva", "Dumas",
  "Elav", "Erda Nagar", "Falia", "Gaurav Path", "Gayatri Nagar",
  "Godadara", "Gotalawadi", "Haldharu", "Hazira Road", "Hirabaug",
  "Icherampura", "Jahangir Colony", "Jangmuwadi", "Kadodara",
  "Kaji Maidan", "Kansad", "Kaprada", "Kathor", "Khajod",
  "Kharwarnagar", "Khatodara", "Kholvad", "Kosmada",
  "Lajamni Chowk", "Lambe Hanuman Road", "Laxmi Nagar", "Limbada",
  "Lilamand", "Majuragate", "Makkai Pool", "Mandvi",
  "Mangrol", "Manjalpur", "Maroli", "Masudan", "Mithakhali",
  "Moraiya", "Nana Varachha", "Navagam", "Navapur", "Navyug College Road",
  "Old Pal Road", "Old Udhna", "Olpad Sayan Road",
  "Palam", "Panchgini", "Pande Wadi", "Parsi Panchayat Road",
  "Pasodara", "Puna", "Puna Kumbharia Road", "Punagam",
  "Ramji Mandir Road", "Rampura", "Rander Road", "Rangila Park",
  "Rupali Canal Road", "Sayan", "Shahpur", "Sidhpur",
  "Simi Road", "Sisodara", "Soneri Mahal", "Sosyo Circle",
  "Surat Navapur Road", "Suratpanch Hatdi", "Tarsadi",
  "Timaliyad", "Ugat", "Umarwada", "Umra Bridge",
  "Unapani", "Vaibhav Nagar", "Valak", "Vareli",
  "Variav", "Ved", "Velan", "Vidhya Nagar", "Viramgam",
  "Wadi", "Yogi Chowk", "Zampa Bazaar", "Zankhvav"
] as const;

export const getAllCities = (): City[] => {
  const cities: City[] = [];
  Object.entries(INDIAN_CITIES).forEach(([state, stateCities]) => {
    stateCities.forEach(city => {
      cities.push({ name: city, state });
    });
  });
  return cities.sort((a, b) => a.name.localeCompare(b.name));
};

export const getCitiesByState = (state: string): string[] => {
  return INDIAN_CITIES[state] || [];
};

export const getSuratAreas = (): string[] => {
  return [...SURAT_AREAS].sort();
};

export const searchSuratAreas = (query: string): string[] => {
  const lowerQuery = query.toLowerCase();
  return SURAT_AREAS.filter(area => 
    area.toLowerCase().includes(lowerQuery)
  ).sort();
};
