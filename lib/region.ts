import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

const STORAGE_KEY = 'region.state.v1';
const OVERRIDE_KEY = 'region.override.v1';
const FALLBACK = 'default';

export type RegionResult = {
  region: string;
  permissionDenied: boolean;
};

const US_STATE_CODES = new Set([
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
  'DC',
]);

const LOWERCASE_STATE_CODES = new Set(
  Array.from(US_STATE_CODES).map(code => code.toLowerCase())
);

const STATE_NAME_TO_CODE: Record<string, string> = {
  Alabama: 'AL', Alaska: 'AK', Arizona: 'AZ', Arkansas: 'AR',
  California: 'CA', Colorado: 'CO', Connecticut: 'CT', Delaware: 'DE',
  Florida: 'FL', Georgia: 'GA', Hawaii: 'HI', Idaho: 'ID',
  Illinois: 'IL', Indiana: 'IN', Iowa: 'IA', Kansas: 'KS',
  Kentucky: 'KY', Louisiana: 'LA', Maine: 'ME', Maryland: 'MD',
  Massachusetts: 'MA', Michigan: 'MI', Minnesota: 'MN', Mississippi: 'MS',
  Missouri: 'MO', Montana: 'MT', Nebraska: 'NE', Nevada: 'NV',
  'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY',
  'North Carolina': 'NC', 'North Dakota': 'ND', Ohio: 'OH', Oklahoma: 'OK',
  Oregon: 'OR', Pennsylvania: 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
  'South Dakota': 'SD', Tennessee: 'TN', Texas: 'TX', Utah: 'UT',
  Vermont: 'VT', Virginia: 'VA', Washington: 'WA', 'West Virginia': 'WV',
  Wisconsin: 'WI', Wyoming: 'WY', 'District of Columbia': 'DC',
};

const LOWERCASE_STATE_NAME_TO_CODE = Object.keys(STATE_NAME_TO_CODE).reduce((acc, name) => {
  acc[name.toLowerCase()] = STATE_NAME_TO_CODE[name];
  return acc;
}, {} as Record<string, string>);

const CA_PROVINCE_CODES = new Set([
  'AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'ON', 'PE', 'QC', 'SK', 'NT', 'NU', 'YT'
]);

const LOWERCASE_PROVINCE_CODES = new Set(
  Array.from(CA_PROVINCE_CODES).map(code => code.toLowerCase())
);

const PROVINCE_NAME_TO_CODE: Record<string, string> = {
  Alberta: 'AB',
  'British Columbia': 'BC',
  Manitoba: 'MB',
  'New Brunswick': 'NB',
  'Newfoundland and Labrador': 'NL',
  'Nova Scotia': 'NS',
  Ontario: 'ON',
  'Prince Edward Island': 'PE',
  Quebec: 'QC',
  Saskatchewan: 'SK',
  'Northwest Territories': 'NT',
  Nunavut: 'NU',
  Yukon: 'YT',
};

const LOWERCASE_PROVINCE_NAME_TO_CODE = Object.keys(PROVINCE_NAME_TO_CODE).reduce((acc, name) => {
  acc[name.toLowerCase()] = PROVINCE_NAME_TO_CODE[name];
  return acc;
}, {} as Record<string, string>);

export async function getRegion(): Promise<string> {
  const { region } = await getRegionWithStatus();
  return region;
}

export async function getRegionWithStatus(): Promise<RegionResult> {
  const override = await AsyncStorage.getItem(OVERRIDE_KEY);
  if (override) {
    return { region: override, permissionDenied: false };
  }

  const cached = await AsyncStorage.getItem(STORAGE_KEY);
  const denied = await isPermissionDenied();

  if (cached) {
    if (cached === FALLBACK && !denied) {
      const result = await resolveRegion();
      await AsyncStorage.setItem(STORAGE_KEY, result.region);
      return result;
    }
    return { region: cached, permissionDenied: cached === FALLBACK && denied };
  }

  const result = await resolveRegion();
  await AsyncStorage.setItem(STORAGE_KEY, result.region);
  return result;
}

export async function setRegionOverride(region: string | null): Promise<void> {
  if (region === null) {
    await AsyncStorage.removeItem(OVERRIDE_KEY);
  } else {
    await AsyncStorage.setItem(OVERRIDE_KEY, region);
  }
}

export async function getRegionOverride(): Promise<string | null> {
  return await AsyncStorage.getItem(OVERRIDE_KEY);
}

async function isPermissionDenied(): Promise<boolean> {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    return status !== 'granted';
  } catch (error) {
    console.warn('Failed to get location permissions:', error);
    return true;
  }
}

async function resolveRegion(): Promise<RegionResult> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return { region: FALLBACK, permissionDenied: true };

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Lowest,
    });
    const places = await Location.reverseGeocodeAsync({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    });

    const place = places[0];
    if (!place) {
      return { region: FALLBACK, permissionDenied: false };
    }

    const countryCode = place.isoCountryCode?.toUpperCase();

    if (countryCode === 'US') {
      if (!place.region) return { region: FALLBACK, permissionDenied: false };
      const code = stateNameToCode(place.region);
      return { region: code ?? FALLBACK, permissionDenied: false };
    }

    if (countryCode === 'CA') {
      if (!place.region) return { region: FALLBACK, permissionDenied: false };
      const code = provinceNameToCode(place.region);
      return { region: code ? `CA-${code}` : FALLBACK, permissionDenied: false };
    }

    if (countryCode === 'MX' || countryCode === 'IS' || countryCode === 'RU' || countryCode === 'CN') {
      return { region: countryCode, permissionDenied: false };
    }

    return { region: FALLBACK, permissionDenied: false };
  } catch (error) {
    console.warn('Failed to resolve region from location services:', error);
    return { region: FALLBACK, permissionDenied: false };
  }
}

function stateNameToCode(region: string): string | null {
  if (!region) return null;
  const cleaned = region.trim().toLowerCase();
  if (LOWERCASE_STATE_CODES.has(cleaned)) {
    return cleaned.toUpperCase();
  }
  return LOWERCASE_STATE_NAME_TO_CODE[cleaned] ?? null;
}

function provinceNameToCode(region: string): string | null {
  if (!region) return null;
  const cleaned = region.trim().toLowerCase();
  if (LOWERCASE_PROVINCE_CODES.has(cleaned)) {
    return cleaned.toUpperCase();
  }
  return LOWERCASE_PROVINCE_NAME_TO_CODE[cleaned] ?? null;
}

/** Test/debug helper — clears the cached region so the next call re-prompts. */
export async function resetRegion(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
