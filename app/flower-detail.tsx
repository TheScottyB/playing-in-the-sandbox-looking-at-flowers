import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "@/styles/flower-detail.styles";

const MONTH_SHORT = [
	"JAN",
	"FEB",
	"MAR",
	"APR",
	"MAY",
	"JUN",
	"JUL",
	"AUG",
	"SEP",
	"OCT",
	"NOV",
	"DEC",
];

function formatDateLabel(iso: string): string {
	const [y, m, d] = iso.split("-").map(Number);
	if (!y || !m || !d) return iso;
	return `${MONTH_SHORT[m - 1]} ${d} ${y}`;
}

export default function FlowerDetailScreen() {
	const router = useRouter();
	const {
		imageUri,
		common,
		latin,
		blurb,
		state: flowerState,
		date,
	} = useLocalSearchParams<{
		imageUri: string;
		common: string;
		latin: string;
		blurb: string;
		state: string;
		date: string;
	}>();

	const regionLabel =
		!flowerState || flowerState === "default"
			? "YOUR AREA"
			: flowerState.toUpperCase();

	return (
		<View style={styles.root}>
			{/* Hide the native header — back gesture / zoom-out handles dismissal */}
			<Stack.Screen options={{ headerShown: false }} />

			{/* Full-bleed flower image */}
			<Image
				source={
					imageUri
						? { uri: imageUri }
						: require("../assets/defaults/midday.png")
				}
				style={StyleSheet.absoluteFill}
				contentFit="cover"
				cachePolicy="memory-disk"
				preferHighDynamicRange
				accessibilityLabel={common}
			/>

			{/* Gradient: transparent at top, deep black at bottom */}
			<LinearGradient
				colors={[
					"rgba(0,0,0,0)",
					"rgba(0,0,0,0)",
					"rgba(0,0,0,0.65)",
					"rgba(0,0,0,0.97)",
				]}
				locations={[0, 0.38, 0.62, 1]}
				style={StyleSheet.absoluteFill}
				pointerEvents="none"
			/>

			{/* Info panel anchored to the bottom */}
			<SafeAreaView
				style={styles.fill}
				edges={["bottom", "left", "right", "top"]}
			>
				<View style={styles.inner}>
					{/* Close button — top-left, mirrors expand button styling */}
					<Pressable
						style={styles.closeBtn}
						onPress={() => router.back()}
						accessibilityLabel="Close"
						accessibilityRole="button"
						hitSlop={12}
					>
						<Text style={styles.closeIcon}>✕</Text>
					</Pressable>

					{/* Spacer pushes info to the bottom */}
					<View style={styles.spacer} />

					<View style={styles.info}>
						<Text style={styles.eyebrow}>
							{regionLabel} · {formatDateLabel(date ?? "")}
						</Text>

						<Text
							style={styles.common}
							numberOfLines={2}
							adjustsFontSizeToFit
							selectable
						>
							{common}
						</Text>
						<Text style={styles.latin} selectable>
							{latin}
						</Text>

						<View style={styles.rule} />

						<ScrollView
							showsVerticalScrollIndicator={false}
							bounces
							style={styles.blurbScroll}
						>
							<Text style={styles.blurb} selectable>
								{blurb}
							</Text>
							{/* Bottom breathing room inside scroll */}
							<View style={{ height: 24 }} />
						</ScrollView>
					</View>
				</View>
			</SafeAreaView>
		</View>
	);
}
