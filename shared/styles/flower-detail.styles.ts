import { Platform, StyleSheet } from "react-native";

export const SERIF = Platform.select({
	ios: "Georgia",
	android: "serif",
	default: "Georgia",
});

export const styles = StyleSheet.create({
	root: {
		flex: 1,
		backgroundColor: "#000",
	},
	fill: {
		flex: 1,
	},
	inner: {
		flex: 1,
	},
	spacer: {
		flex: 1,
	},
	info: {
		paddingHorizontal: 28,
		paddingBottom: 12,
	},
	eyebrow: {
		fontSize: 11,
		letterSpacing: 2.4,
		color: "rgba(255,255,255,0.6)",
		fontWeight: "600",
		marginBottom: 10,
	},
	common: {
		fontFamily: SERIF,
		fontSize: 40,
		lineHeight: 46,
		color: "#fff",
		letterSpacing: 0.2,
	},
	latin: {
		fontFamily: SERIF,
		fontStyle: "italic",
		fontSize: 17,
		color: "rgba(255,255,255,0.68)",
		marginTop: 4,
		letterSpacing: 0.3,
	},
	rule: {
		height: StyleSheet.hairlineWidth,
		backgroundColor: "rgba(255,255,255,0.25)",
		marginTop: 18,
		marginBottom: 16,
		width: 56,
	},
	blurbScroll: {
		maxHeight: 190,
	},
	blurb: {
		fontSize: 16,
		lineHeight: 26,
		color: "rgba(255,255,255,0.88)",
	},
	closeBtn: {
		alignSelf: "flex-start",
		margin: 16,
		width: 34,
		height: 34,
		borderRadius: 17,
		borderCurve: "continuous",
		backgroundColor: "rgba(0,0,0,0.42)",
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: "rgba(255,255,255,0.32)",
		alignItems: "center",
		justifyContent: "center",
	},
	closeIcon: {
		color: "rgba(255,255,255,0.9)",
		fontSize: 14,
		fontWeight: "600",
	},
});
