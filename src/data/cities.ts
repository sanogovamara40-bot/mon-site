import type { Participant } from '../lib/planner'

export type City = Participant & {
  /** Canonical label for a zone shared by several cities (e.g. New York / Miami). */
  primary?: boolean
}

export const CITIES: City[] = [
  { city: 'Amsterdam', country: 'Pays-Bas', countryCode: 'NL', zone: 'Europe/Amsterdam' },
  { city: 'Athènes', country: 'Grèce', countryCode: 'GR', zone: 'Europe/Athens' },
  { city: 'Auckland', country: 'Nouvelle-Zélande', countryCode: 'NZ', zone: 'Pacific/Auckland' },
  { city: 'Bangkok', country: 'Thaïlande', countryCode: 'TH', zone: 'Asia/Bangkok' },
  { city: 'Berlin', country: 'Allemagne', countryCode: 'DE', zone: 'Europe/Berlin' },
  { city: 'Bogotá', country: 'Colombie', countryCode: 'CO', zone: 'America/Bogota' },
  { city: 'Bruxelles', country: 'Belgique', countryCode: 'BE', zone: 'Europe/Brussels' },
  { city: 'Buenos Aires', country: 'Argentine', countryCode: 'AR', zone: 'America/Argentina/Buenos_Aires' },
  { city: 'Chicago', country: 'États-Unis', countryCode: 'US', zone: 'America/Chicago' },
  { city: 'Copenhague', country: 'Danemark', countryCode: 'DK', zone: 'Europe/Copenhagen' },
  { city: 'Denver', country: 'États-Unis', countryCode: 'US', zone: 'America/Denver' },
  { city: 'Dubaï', country: 'Émirats arabes unis', countryCode: 'AE', zone: 'Asia/Dubai' },
  { city: 'Dublin', country: 'Irlande', countryCode: 'IE', zone: 'Europe/Dublin' },
  { city: 'Helsinki', country: 'Finlande', countryCode: 'FI', zone: 'Europe/Helsinki' },
  { city: 'Hong Kong', country: 'Hong Kong', countryCode: 'HK', zone: 'Asia/Hong_Kong' },
  { city: 'Honolulu', country: 'États-Unis', countryCode: 'US', zone: 'Pacific/Honolulu' },
  { city: 'Istanbul', country: 'Turquie', countryCode: 'TR', zone: 'Europe/Istanbul' },
  { city: 'Jakarta', country: 'Indonésie', countryCode: 'ID', zone: 'Asia/Jakarta' },
  { city: 'Jérusalem', country: 'Israël', countryCode: 'IL', zone: 'Asia/Jerusalem' },
  { city: 'Johannesburg', country: 'Afrique du Sud', countryCode: 'ZA', zone: 'Africa/Johannesburg' },
  { city: 'Kiev', country: 'Ukraine', countryCode: 'UA', zone: 'Europe/Kyiv' },
  { city: 'Kuala Lumpur', country: 'Malaisie', countryCode: 'MY', zone: 'Asia/Kuala_Lumpur' },
  { city: 'Le Caire', country: 'Égypte', countryCode: 'EG', zone: 'Africa/Cairo' },
  { city: 'Lima', country: 'Pérou', countryCode: 'PE', zone: 'America/Lima' },
  { city: 'Lisbonne', country: 'Portugal', countryCode: 'PT', zone: 'Europe/Lisbon' },
  { city: 'Londres', country: 'Royaume-Uni', countryCode: 'GB', zone: 'Europe/London' },
  { city: 'Los Angeles', country: 'États-Unis', countryCode: 'US', zone: 'America/Los_Angeles' },
  { city: 'Madrid', country: 'Espagne', countryCode: 'ES', zone: 'Europe/Madrid' },
  { city: 'Melbourne', country: 'Australie', countryCode: 'AU', zone: 'Australia/Melbourne' },
  { city: 'Mexico', country: 'Mexique', countryCode: 'MX', zone: 'America/Mexico_City' },
  { city: 'Miami', country: 'États-Unis', countryCode: 'US', zone: 'America/New_York' },
  { city: 'Milan', country: 'Italie', countryCode: 'IT', zone: 'Europe/Rome' },
  { city: 'Moscou', country: 'Russie', countryCode: 'RU', zone: 'Europe/Moscow' },
  { city: 'Mumbai', country: 'Inde', countryCode: 'IN', zone: 'Asia/Kolkata' },
  { city: 'Nairobi', country: 'Kenya', countryCode: 'KE', zone: 'Africa/Nairobi' },
  { city: 'New York', country: 'États-Unis', countryCode: 'US', zone: 'America/New_York', primary: true },
  { city: 'Oslo', country: 'Norvège', countryCode: 'NO', zone: 'Europe/Oslo' },
  { city: 'Paris', country: 'France', countryCode: 'FR', zone: 'Europe/Paris' },
  { city: 'Pékin', country: 'Chine', countryCode: 'CN', zone: 'Asia/Shanghai' },
  { city: 'Prague', country: 'Tchéquie', countryCode: 'CZ', zone: 'Europe/Prague' },
  { city: 'Riyad', country: 'Arabie saoudite', countryCode: 'SA', zone: 'Asia/Riyadh' },
  { city: 'Rome', country: 'Italie', countryCode: 'IT', zone: 'Europe/Rome', primary: true },
  { city: 'Santiago', country: 'Chili', countryCode: 'CL', zone: 'America/Santiago' },
  { city: 'São Paulo', country: 'Brésil', countryCode: 'BR', zone: 'America/Sao_Paulo' },
  { city: 'Séoul', country: 'Corée du Sud', countryCode: 'KR', zone: 'Asia/Seoul' },
  { city: 'Shanghai', country: 'Chine', countryCode: 'CN', zone: 'Asia/Shanghai', primary: true },
  { city: 'Singapour', country: 'Singapour', countryCode: 'SG', zone: 'Asia/Singapore' },
  { city: 'Stockholm', country: 'Suède', countryCode: 'SE', zone: 'Europe/Stockholm' },
  { city: 'Sydney', country: 'Australie', countryCode: 'AU', zone: 'Australia/Sydney' },
  { city: 'Tokyo', country: 'Japon', countryCode: 'JP', zone: 'Asia/Tokyo' },
  { city: 'Toronto', country: 'Canada', countryCode: 'CA', zone: 'America/Toronto' },
  { city: 'Vancouver', country: 'Canada', countryCode: 'CA', zone: 'America/Vancouver' },
  { city: 'Varsovie', country: 'Pologne', countryCode: 'PL', zone: 'Europe/Warsaw' },
  { city: 'Vienne', country: 'Autriche', countryCode: 'AT', zone: 'Europe/Vienna' },
  { city: 'Zurich', country: 'Suisse', countryCode: 'CH', zone: 'Europe/Zurich' },
]

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')

export function searchCities(query: string, limit = 8): City[] {
  const needle = normalize(query.trim())
  if (!needle) return CITIES.slice(0, limit)

  return CITIES.filter((city) => {
    const haystack = normalize(`${city.city} ${city.country} ${city.zone} ${city.countryCode}`)
    return haystack.includes(needle)
  }).slice(0, limit)
}

export function findCity(zone: string): City | undefined {
  const matches = CITIES.filter((city) => city.zone === zone)
  return matches.find((city) => city.primary) ?? matches[0]
}
