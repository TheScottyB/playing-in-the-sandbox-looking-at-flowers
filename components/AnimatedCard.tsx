import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';

const { width } = Dimensions.get('window');

interface AnimatedCardProps {
  title: string;
  content: string;
  isExpanded: boolean;
  onExpand: () => void;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  title,
  content,
  isExpanded,
  onExpand,
}) => {
  const height = useSharedValue(100);
  const opacity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      height: withSpring(height.value, {
        damping: 15,
        stiffness: 100,
      }),
      opacity: withTiming(opacity.value, { duration: 300 }),
    };
  });

  React.useEffect(() => {
    if (isExpanded) {
      height.value = 300;
      opacity.value = 1;
    } else {
      height.value = 100;
      opacity.value = 0;
    }
  }, [isExpanded]);

  return (
    <ThemedView style={styles.container}>
      <Animated.View style={[styles.card, animatedStyle]}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>{title}</ThemedText>
        </View>
        <Animated.View style={[styles.content, { opacity }]}>
          <ThemedText>{content}</ThemedText>
        </Animated.View>
      </Animated.View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width - 32,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  card: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    marginTop: 16,
  },
}); 