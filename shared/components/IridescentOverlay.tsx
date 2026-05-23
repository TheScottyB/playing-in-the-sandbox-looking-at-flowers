import { LinearGradient } from "expo-linear-gradient";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
	Easing,
	useAnimatedStyle,
	useSharedValue,
	withRepeat,
	withTiming,
} from "react-native-reanimated";

interface IridescentOverlayProps {
	subtle?: boolean;
}

export function IridescentOverlay({ subtle }: IridescentOverlayProps) {
	const alpha = subtle ? 0.55 : 1.0;
	const phase = useSharedValue(0);

	useEffect(() => {
		phase.value = withRepeat(
			withTiming(1, { duration: 8000, easing: Easing.linear }),
			-1,
		);
	}, [phase]);

	const iri1 = useAnimatedStyle(() => {
		"worklet";
		const p = phase.value * Math.PI * 2;
		return {
			opacity: (0.18 + Math.sin(p) * 0.12) * alpha,
			transform: [
				{ translateX: Math.sin(p) * 50 },
				{ translateY: Math.cos(p * 0.7) * 30 },
			],
		};
	});

	const iri2 = useAnimatedStyle(() => {
		"worklet";
		const p = phase.value * Math.PI * 2 + (Math.PI * 2) / 3;
		return {
			opacity: (0.15 + Math.sin(p) * 0.1) * alpha,
			transform: [
				{ translateX: Math.cos(p) * 45 },
				{ translateY: Math.sin(p * 1.3) * 25 },
			],
		};
	});

	const iri3 = useAnimatedStyle(() => {
		"worklet";
		const p = phase.value * Math.PI * 2 + (Math.PI * 4) / 3;
		return {
			opacity: (0.12 + Math.sin(p) * 0.08) * alpha,
			transform: [
				{ translateX: Math.sin(p * 1.1) * 55 },
				{ translateY: Math.cos(p) * 35 },
			],
		};
	});

	const specular = useAnimatedStyle(() => {
		"worklet";
		const p = phase.value * Math.PI * 2 * 0.6;
		return {
			opacity: (0.12 + Math.sin(p) * 0.08) * alpha,
			transform: [
				{ translateX: Math.cos(p) * 70 },
				{ translateY: Math.sin(p * 0.8) * 40 },
			],
		};
	});

	const edgeSheen = useAnimatedStyle(() => {
		"worklet";
		const p = phase.value * Math.PI * 2 * 0.5;
		return {
			borderColor: `rgba(255,255,255,${(0.12 + Math.sin(p) * 0.08) * alpha})`,
		};
	});

	return (
		<View style={iriStyles.container} pointerEvents="none">
			<Animated.View style={[iriStyles.layer, iri1]}>
				<LinearGradient
					colors={[
						"rgba(100,140,255,0.35)",
						"rgba(200,100,255,0.20)",
						"transparent",
					]}
					start={{ x: 0, y: 0 }}
					end={{ x: 1, y: 1 }}
					style={StyleSheet.absoluteFill}
				/>
			</Animated.View>
			<Animated.View style={[iriStyles.layer, iri2]}>
				<LinearGradient
					colors={[
						"rgba(255,100,200,0.30)",
						"rgba(255,180,100,0.15)",
						"transparent",
					]}
					start={{ x: 1, y: 0 }}
					end={{ x: 0, y: 1 }}
					style={StyleSheet.absoluteFill}
				/>
			</Animated.View>
			<Animated.View style={[iriStyles.layer, iri3]}>
				<LinearGradient
					colors={[
						"rgba(100,255,200,0.25)",
						"rgba(100,200,255,0.15)",
						"transparent",
					]}
					start={{ x: 0.5, y: 0 }}
					end={{ x: 0.5, y: 1 }}
					style={StyleSheet.absoluteFill}
				/>
			</Animated.View>
			<Animated.View style={[iriStyles.specular, specular]}>
				<LinearGradient
					colors={["transparent", "rgba(255,255,255,0.28)", "transparent"]}
					start={{ x: 0.3, y: 0.3 }}
					end={{ x: 0.7, y: 0.7 }}
					style={StyleSheet.absoluteFill}
				/>
			</Animated.View>
			<Animated.View style={[iriStyles.edge, edgeSheen]} />
		</View>
	);
}

const iriStyles = StyleSheet.create({
	container: {
		...StyleSheet.absoluteFill,
		overflow: "hidden",
		borderRadius: 18,
	},
	layer: {
		position: "absolute",
		top: -60,
		left: -60,
		right: -60,
		bottom: -60,
	},
	specular: {
		position: "absolute",
		top: -80,
		left: -80,
		right: -80,
		bottom: -80,
	},
	edge: {
		...StyleSheet.absoluteFill,
		borderRadius: 18,
		borderWidth: 1,
		borderColor: "rgba(255,255,255,0.12)",
	},
});
