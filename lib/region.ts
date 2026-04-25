import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

const STORAGE_KEY = 'region.state.v1';
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

export async function getRegion(): Promise<string> {
  const { region } = await getRegionWithStatus();
  return region;
}

export async function getRegionWithStatus(): Promise<RegionResult> {
  const cached = await AsyncStorage.getItem(STORAGE_KEY);
  if (cached) {
    const denied = await isPermissionDenied();
    return { region: cached, permissionDenied: cached === FALLBACK && denied };
  }

  const result = await resolveRegion();
  await AsyncStorage.setItem(STORAGE_KEY, result.region);
  return result;
}

async function isPermissionDenied(): Promise<boolean> {
  const { status } = await Location.getForegroundPermissionsAsync();
  return status !== 'granted';
}

async function resolveRegion(): Promise<RegionResult> {
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
  if (!place || place.isoCountryCode !== 'US' || !place.region) {
    return { region: FALLBACK, permissionDenied: false };
  }

  const code = stateNameToCode(place.region);
  return { region: code ?? FALLBACK, permissionDenied: false };
}

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

function stateNameToCode(region: string): string | null {
  if (US_STATE_CODES.has(region)) return region;
  return STATE_NAME_TO_CODE[region] ?? null;
}

/** Test/debug helper — clears the cached region so the next call re-prompts. */
export async function resetRegion(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
