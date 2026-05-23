declare module "react-native-flip-card" {
	import * as React from "react";
	import { StyleProp, ViewStyle } from "react-native";

	export interface FlipCardProps {
		style?: StyleProp<ViewStyle>;
		friction?: number;
		perspective?: number;
		flipHorizontal?: boolean;
		flipVertical?: boolean;
		flip?: boolean;
		clickable?: boolean;
		alignHeight?: boolean;
		alignWidth?: boolean;
		onFlipEnd?: (isFlipEnd: boolean) => void;
		onFlipStart?: (isFlipStart: boolean) => void;
		useNativeDriver?: boolean;
		children?: React.ReactNode;
	}

	const FlipCard: React.ComponentType<FlipCardProps>;
	export default FlipCard;
}
