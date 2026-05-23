import { StyleSheet } from "react-native";
import { PALETTE, TYPE } from "@/constants/brand";

export const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		padding: 20,
		backgroundColor: PALETTE.ink,
	},
	title: {
		fontSize: 20,
		fontWeight: "bold",
		fontFamily: TYPE.serif,
		color: PALETTE.paper,
		textAlign: "center",
	},
	link: {
		marginTop: 15,
		paddingVertical: 15,
	},
	linkText: {
		fontSize: 16,
		color: PALETTE.accent,
	},
});
