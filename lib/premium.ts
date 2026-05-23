import AsyncStorage from "@react-native-async-storage/async-storage";
import { todayLocalIso } from "./dailyFlower";
import { checkPremiumStatus } from "./purchases";

const PREMIUM_KEY = "specimen_sandbox_premium_status";
const SEARCH_COUNT_KEY = "specimen_sandbox_search_count";
const LAST_SEARCH_DATE_KEY = "specimen_sandbox_last_search_date";

export const FREE_SEARCH_LIMIT = 3;

export async function isPremiumUser(): Promise<boolean> {
	return checkPremiumStatus();
}

export async function setPremiumStatus(status: boolean): Promise<void> {
	try {
		await AsyncStorage.setItem(PREMIUM_KEY, status ? "true" : "false");
	} catch (e) {
		console.error("Failed to save premium status:", e);
	}
}

export async function getSearchQuotaRemaining(): Promise<number> {
	try {
		const today = todayLocalIso();
		const lastSearchDate = await AsyncStorage.getItem(LAST_SEARCH_DATE_KEY);

		if (lastSearchDate !== today) {
			// New day, reset count
			await AsyncStorage.setItem(SEARCH_COUNT_KEY, "0");
			await AsyncStorage.setItem(LAST_SEARCH_DATE_KEY, today);
			return FREE_SEARCH_LIMIT;
		}

		const countStr = await AsyncStorage.getItem(SEARCH_COUNT_KEY);
		const count = countStr ? parseInt(countStr, 10) : 0;
		return Math.max(0, FREE_SEARCH_LIMIT - count);
	} catch (e) {
		console.error("Failed to get search quota:", e);
		return 0;
	}
}

export async function incrementSearchQuotaUsed(): Promise<number> {
	try {
		const today = todayLocalIso();
		await AsyncStorage.setItem(LAST_SEARCH_DATE_KEY, today);

		const countStr = await AsyncStorage.getItem(SEARCH_COUNT_KEY);
		const count = countStr ? parseInt(countStr, 10) : 0;
		const newCount = count + 1;

		await AsyncStorage.setItem(SEARCH_COUNT_KEY, String(newCount));
		return Math.max(0, FREE_SEARCH_LIMIT - newCount);
	} catch (e) {
		console.error("Failed to increment search count:", e);
		return 0;
	}
}
