import React, { useState } from 'react';
import { Pressable, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,

} from 'react-native-reanimated';

interface ModernFlipCardProps {
  style?: StyleProp<ViewStyle>;
  children: [React.ReactNode, React.ReactNode];
}

export default function ModernFlipCard({ style, children }: ModernFlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const rotate = useSharedValue(0);

  // Sync Reanimated shared value with isFlipped state using withSpring
  React.useEffect(() => {
    rotate.value = withSpring(isFlipped ? 180 : 0, {
      mass: 0.8,
      damping: 14,
      stiffness: 90,
    });
  }, [isFlipped]);

  const frontStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { perspective: 1000 },
        { rotateY: `${rotate.value}deg` },
      ],
      backfaceVisibility: 'hidden',
      position: 'absolute',
      width: '100%',
      height: '100%',
    };
  });

  const backStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { perspective: 1000 },
        { rotateY: `${rotate.value + 180}deg` },
      ],
      backfaceVisibility: 'hidden',
      position: 'absolute',
      width: '100%',
      height: '100%',
    };
  });

  const [frontChild, backChild] = children;

  return (
    <Pressable
      onPress={() => setIsFlipped((f) => !f)}
      style={[styles.container, style]}
    >
      <Animated.View style={frontStyle} pointerEvents={isFlipped ? 'none' : 'auto'}>
        {frontChild}
      </Animated.View>
      <Animated.View style={backStyle} pointerEvents={isFlipped ? 'auto' : 'none'}>
        {backChild}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
});
