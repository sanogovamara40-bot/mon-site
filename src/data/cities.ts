import type { Participant } from '../lib/planner'

export type City = Participant & {
  /** Canonical label for a zone shared by several cities (e.g. New York / Miami). */
  primary?: boolean
}

export const CITIES: City[] = [
  { city: 'Abidjan', country: "Côte d'Ivoire", countryCode: 'CI', zone: 'Africa/Abidjan', primary: true },
  { city: 'Accra', country: 'Ghana', countryCode: 'GH', zone: 'Africa/Accra' },
  { city: 'Addis-Abeba', country: 'Éthiopie', countryCode: 'ET', zone: 'Africa/Addis_Ababa' },
  { city: 'Alger', country: 'Algérie', countryCode: 'DZ', zone: 'Africa/Algiers' },
  { city: 'Amsterdam', country: 'Pays-Bas', countryCode: 'NL', zone: 'Europe/Amsterdam' },
  { city: 'Athènes', country: 'Grèce', countryCode: 'GR', zone: 'Europe/Athens' },
  { city: 'Atlanta', country: 'États-Unis', countryCode: 'US', zone: 'America/New_York' },
  { city: 'Auckland', country: 'Nouvelle-Zélande', countryCode: 'NZ', zone: 'Pacific/Auckland', primary: true },
  { city: 'Bamako', country: 'Mali', countryCode: 'ML', zone: 'Africa/Bamako' },
  { city: 'Bangkok', country: 'Thaïlande', countryCode: 'TH', zone: 'Asia/Bangkok' },
  { city: 'Barcelone', country: 'Espagne', countryCode: 'ES', zone: 'Europe/Madrid' },
  { city: 'Berlin', country: 'Allemagne', countryCode: 'DE', zone: 'Europe/Berlin', primary: true },
  { city: 'Bogotá', country: 'Colombie', countryCode: 'CO', zone: 'America/Bogota' },
  { city: 'Boston', country: 'États-Unis', countryCode: 'US', zone: 'America/New_York' },
  { city: 'Brisbane', country: 'Australie', countryCode: 'AU', zone: 'Australia/Brisbane' },
  { city: 'Bruxelles', country: 'Belgique', countryCode: 'BE', zone: 'Europe/Brussels', primary: true },
  { city: 'Budapest', country: 'Hongrie', countryCode: 'HU', zone: 'Europe/Budapest' },
  { city: 'Buenos Aires', country: 'Argentine', countryCode: 'AR', zone: 'America/Argentina/Buenos_Aires' },
  { city: 'Caracas', country: 'Venezuela', countryCode: 'VE', zone: 'America/Caracas' },
  { city: 'Casablanca', country: 'Maroc', countryCode: 'MA', zone: 'Africa/Casablanca' },
  { city: 'Chicago', country: 'États-Unis', countryCode: 'US', zone: 'America/Chicago', primary: true },
  { city: 'Conakry', country: 'Guinée', countryCode: 'GN', zone: 'Africa/Conakry' },
  { city: 'Copenhague', country: 'Danemark', countryCode: 'DK', zone: 'Europe/Copenhagen' },
  { city: 'Cotonou', country: 'Bénin', countryCode: 'BJ', zone: 'Africa/Porto-Novo' },
  { city: 'Dakar', country: 'Sénégal', countryCode: 'SN', zone: 'Africa/Dakar' },
  { city: 'Dar es Salaam', country: 'Tanzanie', countryCode: 'TZ', zone: 'Africa/Dar_es_Salaam' },
  { city: 'Denver', country: 'États-Unis', countryCode: 'US', zone: 'America/Denver', primary: true },
  { city: 'Doha', country: 'Qatar', countryCode: 'QA', zone: 'Asia/Qatar' },
  { city: 'Douala', country: 'Cameroun', countryCode: 'CM', zone: 'Africa/Douala', primary: true },
  { city: 'Dubaï', country: 'Émirats arabes unis', countryCode: 'AE', zone: 'Asia/Dubai', primary: true },
  { city: 'Dublin', country: 'Irlande', countryCode: 'IE', zone: 'Europe/Dublin' },
  { city: 'Genève', country: 'Suisse', countryCode: 'CH', zone: 'Europe/Zurich' },
  { city: 'Harare', country: 'Zimbabwe', countryCode: 'ZW', zone: 'Africa/Harare' },
  { city: 'Helsinki', country: 'Finlande', countryCode: 'FI', zone: 'Europe/Helsinki' },
  { city: 'Hong Kong', country: 'Hong Kong', countryCode: 'HK', zone: 'Asia/Hong_Kong' },
  { city: 'Honolulu', country: 'États-Unis', countryCode: 'US', zone: 'Pacific/Honolulu' },
  { city: 'Houston', country: 'États-Unis', countryCode: 'US', zone: 'America/Chicago' },
  { city: 'Istanbul', country: 'Turquie', countryCode: 'TR', zone: 'Europe/Istanbul' },
  { city: 'Jakarta', country: 'Indonésie', countryCode: 'ID', zone: 'Asia/Jakarta' },
  { city: 'Jérusalem', country: 'Israël', countryCode: 'IL', zone: 'Asia/Jerusalem' },
  { city: 'Johannesburg', country: 'Afrique du Sud', countryCode: 'ZA', zone: 'Africa/Johannesburg', primary: true },
  { city: 'Kampala', country: 'Ouganda', countryCode: 'UG', zone: 'Africa/Kampala' },
  { city: 'Kiev', country: 'Ukraine', countryCode: 'UA', zone: 'Europe/Kyiv' },
  { city: 'Kigali', country: 'Rwanda', countryCode: 'RW', zone: 'Africa/Kigali' },
  { city: 'Kinshasa', country: 'RD Congo', countryCode: 'CD', zone: 'Africa/Kinshasa' },
  { city: 'Kuala Lumpur', country: 'Malaisie', countryCode: 'MY', zone: 'Asia/Kuala_Lumpur' },
  { city: 'La Paz', country: 'Bolivie', countryCode: 'BO', zone: 'America/La_Paz' },
  { city: 'Lagos', country: 'Nigeria', countryCode: 'NG', zone: 'Africa/Lagos' },
  { city: 'Le Caire', country: 'Égypte', countryCode: 'EG', zone: 'Africa/Cairo' },
  { city: 'Libreville', country: 'Gabon', countryCode: 'GA', zone: 'Africa/Libreville' },
  { city: 'Lima', country: 'Pérou', countryCode: 'PE', zone: 'America/Lima' },
  { city: 'Lisbonne', country: 'Portugal', countryCode: 'PT', zone: 'Europe/Lisbon', primary: true },
  { city: 'Lomé', country: 'Togo', countryCode: 'TG', zone: 'Africa/Lome' },
  { city: 'Londres', country: 'Royaume-Uni', countryCode: 'GB', zone: 'Europe/London', primary: true },
  { city: 'Los Angeles', country: 'États-Unis', countryCode: 'US', zone: 'America/Los_Angeles', primary: true },
  { city: 'Luanda', country: 'Angola', countryCode: 'AO', zone: 'Africa/Luanda' },
  { city: 'Lyon', country: 'France', countryCode: 'FR', zone: 'Europe/Paris' },
  { city: 'Madrid', country: 'Espagne', countryCode: 'ES', zone: 'Europe/Madrid', primary: true },
  { city: 'Manille', country: 'Philippines', countryCode: 'PH', zone: 'Asia/Manila' },
  { city: 'Maputo', country: 'Mozambique', countryCode: 'MZ', zone: 'Africa/Maputo' },
  { city: 'Marseille', country: 'France', countryCode: 'FR', zone: 'Europe/Paris' },
  { city: 'Melbourne', country: 'Australie', countryCode: 'AU', zone: 'Australia/Melbourne', primary: true },
  { city: 'Mexico', country: 'Mexique', countryCode: 'MX', zone: 'America/Mexico_City', primary: true },
  { city: 'Miami', country: 'États-Unis', countryCode: 'US', zone: 'America/New_York' },
  { city: 'Milan', country: 'Italie', countryCode: 'IT', zone: 'Europe/Rome' },
  { city: 'Montevideo', country: 'Uruguay', countryCode: 'UY', zone: 'America/Montevideo' },
  { city: 'Montréal', country: 'Canada', countryCode: 'CA', zone: 'America/Toronto' },
  { city: 'Moscou', country: 'Russie', countryCode: 'RU', zone: 'Europe/Moscow', primary: true },
  { city: 'Mumbai', country: 'Inde', countryCode: 'IN', zone: 'Asia/Kolkata', primary: true },
  { city: 'Munich', country: 'Allemagne', countryCode: 'DE', zone: 'Europe/Berlin' },
  { city: 'Nairobi', country: 'Kenya', countryCode: 'KE', zone: 'Africa/Nairobi', primary: true },
  { city: 'New York', country: 'États-Unis', countryCode: 'US', zone: 'America/New_York', primary: true },
  { city: 'Oslo', country: 'Norvège', countryCode: 'NO', zone: 'Europe/Oslo' },
  { city: 'Ouagadougou', country: 'Burkina Faso', countryCode: 'BF', zone: 'Africa/Ouagadougou' },
  { city: 'Panama', country: 'Panama', countryCode: 'PA', zone: 'America/Panama' },
  { city: 'Paris', country: 'France', countryCode: 'FR', zone: 'Europe/Paris', primary: true },
  { city: 'Pékin', country: 'Chine', countryCode: 'CN', zone: 'Asia/Shanghai' },
  { city: 'Perth', country: 'Australie', countryCode: 'AU', zone: 'Australia/Perth' },
  { city: 'Prague', country: 'Tchéquie', countryCode: 'CZ', zone: 'Europe/Prague' },
  { city: 'Quito', country: 'Équateur', countryCode: 'EC', zone: 'America/Guayaquil' },
  { city: 'Reykjavik', country: 'Islande', countryCode: 'IS', zone: 'Atlantic/Reykjavik' },
  { city: 'Riyad', country: 'Arabie saoudite', countryCode: 'SA', zone: 'Asia/Riyadh' },
  { city: 'Rome', country: 'Italie', countryCode: 'IT', zone: 'Europe/Rome', primary: true },
  { city: 'San Francisco', country: 'États-Unis', countryCode: 'US', zone: 'America/Los_Angeles' },
  { city: 'San José', country: 'Costa Rica', countryCode: 'CR', zone: 'America/Costa_Rica' },
  { city: 'Santiago', country: 'Chili', countryCode: 'CL', zone: 'America/Santiago', primary: true },
  { city: 'São Paulo', country: 'Brésil', countryCode: 'BR', zone: 'America/Sao_Paulo', primary: true },
  { city: 'Seattle', country: 'États-Unis', countryCode: 'US', zone: 'America/Los_Angeles' },
  { city: 'Séoul', country: 'Corée du Sud', countryCode: 'KR', zone: 'Asia/Seoul', primary: true },
  { city: 'Shanghai', country: 'Chine', countryCode: 'CN', zone: 'Asia/Shanghai', primary: true },
  { city: 'Singapour', country: 'Singapour', countryCode: 'SG', zone: 'Asia/Singapore', primary: true },
  { city: 'Stockholm', country: 'Suède', countryCode: 'SE', zone: 'Europe/Stockholm' },
  { city: 'Sydney', country: 'Australie', countryCode: 'AU', zone: 'Australia/Sydney', primary: true },
  { city: 'Taipei', country: 'Taïwan', countryCode: 'TW', zone: 'Asia/Taipei' },
  { city: 'Tokyo', country: 'Japon', countryCode: 'JP', zone: 'Asia/Tokyo', primary: true },
  { city: 'Toronto', country: 'Canada', countryCode: 'CA', zone: 'America/Toronto', primary: true },
  { city: 'Toulouse', country: 'France', countryCode: 'FR', zone: 'Europe/Paris' },
  { city: 'Tunis', country: 'Tunisie', countryCode: 'TN', zone: 'Africa/Tunis' },
  { city: 'Vancouver', country: 'Canada', countryCode: 'CA', zone: 'America/Vancouver', primary: true },
  { city: 'Varsovie', country: 'Pologne', countryCode: 'PL', zone: 'Europe/Warsaw' },
  { city: 'Vienne', country: 'Autriche', countryCode: 'AT', zone: 'Europe/Vienna' },
  { city: 'Washington', country: 'États-Unis', countryCode: 'US', zone: 'America/New_York' },
  { city: 'Wellington', country: 'Nouvelle-Zélande', countryCode: 'NZ', zone: 'Pacific/Auckland' },
  { city: 'Yaoundé', country: 'Cameroun', countryCode: 'CM', zone: 'Africa/Douala' },
  { city: 'Zurich', country: 'Suisse', countryCode: 'CH', zone: 'Europe/Zurich', primary: true },
]

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[’'`-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

export function searchCities(query: string, limit = 8): City[] {
  const needle = normalize(query.trim())
  if (!needle) return CITIES.slice(0, limit)

  return CITIES.map((city) => {
    const name = normalize(city.city)
    const rest = normalize(`${city.country} ${city.zone} ${city.countryCode}`)
    const score = name === needle ? 3 : name.startsWith(needle) ? 2 : name.includes(needle) ? 1 : rest.includes(needle) ? 0 : -1
    return { city, score }
  })
    .filter((entry) => entry.score >= 0)
    .sort((a, b) => b.score - a.score || a.city.city.localeCompare(b.city.city, 'fr'))
    .slice(0, limit)
    .map((entry) => entry.city)
}

export function findCity(zone: string): City | undefined {
  const matches = CITIES.filter((city) => city.zone === zone)
  return matches.find((city) => city.primary) ?? matches[0]
}
