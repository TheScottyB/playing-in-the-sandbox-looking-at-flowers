// hooks/useOnline.ts
//
// Surfaces whether the device has working internet. Wraps
// @react-native-community/netinfo's listener API in a hook.
//
// Defaults to `true` (assume online) so the first render isn't gated on a
// netinfo round-trip — the first event from the listener will correct it
// within a few hundred ms if we're actually offline.

import NetInfo from "@react-native-community/netinfo";
import { useEffect, useState } from "react";

/** Returns `true` when the device has working internet, `false` when offline. */
export function useOnline(): boolean {
	const [online, setOnline] = useState(true);
	useEffect(() => {
		const unsub = NetInfo.addEventListener((state) => {
			// `isConnected` is the link-layer signal (Wi-Fi associated, cell tower
			// present). `isInternetReachable` is a probe to a known endpoint. Treat
			// both as required; either being `false` flips us offline. Null means
			// "unknown yet" — don't pre-emptively flip to offline on first render.
			const reachable =
				state.isConnected !== false && state.isInternetReachable !== false;
			setOnline(reachable);
		});
		return () => unsub();
	}, []);
	return online;
}
