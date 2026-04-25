import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Image,
  Animated,
  TouchableOpacity,
  Text,
  Dimensions,
  ActivityIndicator,
  Platform
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from './ThemedText';
import { useCacheAssets } from '@/hooks/useCacheAssets';

// Define the flower image interface
interface FlowerImage {
  uri: string;
  description: string;
  season?: string;
  name?: string;
}

// Flower images organized by seasons - in a real app, these would be fetched from an API
const FLOWER_IMAGES: Record<string, FlowerImage[]> = {
  spring: [
    {
      uri: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946',
      description: 'Vibrant pink tulips swaying in the spring breeze, their delicate petals capturing the morning sunlight.',
      name: 'Spring Tulips',
      season: 'spring'
    },
    {
      uri: 'https://images.unsplash.com/photo-1561848955-8797623524ed',
      description: 'Delicate cherry blossoms reaching full bloom, creating a canopy of soft pink against the clear blue sky.',
      name: 'Cherry Blossoms',
      season: 'spring'
    },
    {
      uri: 'https://images.unsplash.com/photo-1554631221-176fea85b6f1',
      description: 'Stunning purple crocuses pushing through the last remnants of winter snow, announcing spring\'s arrival.',
      name: 'Spring Crocuses',
      season: 'spring'
    }
  ],
  summer: [
    {
      uri: 'https://images.unsplash.com/photo-1525310072745-f49212b5ac6d',
      description: 'Brilliant sunflower turning towards the summer sun, its vibrant yellow petals radiating warmth and joy.',
      name: 'Sunflower',
      season: 'summer'
    },
    {
      uri: 'https://images.unsplash.com/photo-1587290336575-08ab8018d54d',
      description: 'Rich red roses symbolizing love and passion, their velvety petals glistening with morning dew.',
      name: 'Red Roses',
      season: 'summer'
    },
    {
      uri: 'https://images.unsplash.com/photo-1533038590840-1f12a7a2120f',
      description: 'Vibrant field of lavender stretching to the horizon, filling the air with its calming fragrance.',
      name: 'Lavender Field',
      season: 'summer'
    }
  ],
  fall: [
    {
      uri: 'https://images.unsplash.com/photo-1593807083175-1b4826314ca8',
      description: 'Warm-hued autumn mums in a seasonal display, their bold colors echoing the changing leaves around them.',
      name: 'Fall Chrysanthemums',
      season: 'fall'
    },
    {
      uri: 'https://images.unsplash.com/photo-1569880153113-76e33fc52d5f',
      description: 'Rustic arrangement of autumn dahlias in rich burgundy and orange hues, capturing fall\'s essence.',
      name: 'Autumn Dahlias',
      season: 'fall'
    },
    {
      uri: 'https://images.unsplash.com/photo-1567653418876-5bb0e566e1c2',
      description: 'Delicate asters with purple-blue petals standing tall against the autumn backdrop of golden leaves.',
      name: 'Purple Asters',
      season: 'fall'
    }
  ],
  winter: [
    {
      uri: 'https://images.unsplash.com/photo-1545168599-847ffcc2ddf9',
      description: 'Elegant white amaryllis blooming indoors, bringing a touch of floral beauty to the winter months.',
      name: 'White Amaryllis',
      season: 'winter'
    },
    {
      uri: 'https://images.unsplash.com/photo-1607307820751-808a3f2d9039',
      description: 'Festive red poinsettia with its star-shaped leaf pattern, traditionally associated with winter celebrations.',
      name: 'Poinsettia',
      season: 'winter'
    },
    {
      uri: 'https://images.unsplash.com/photo-1612470858852-2469710d632a',
      description: 'Delicate snowdrops pushing through the winter frost, their white flowers symbolizing hope and renewal.',
      name: 'Snowdrops',
      season: 'winter'
    }
  ]
};

// Helper function to flatten and combine all seasons
const getAllFlowers = (): FlowerImage[] => {
  return Object.values(FLOWER_IMAGES).flat();
};

interface FlowerGalleryCardProps {
  initialImage?: number;
  onFlip?: () => void;
  enableHaptics?: boolean;
  seasonFilter?: string;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;
const CARD_HEIGHT = CARD_WIDTH * 1.3;

export const FlowerGalleryCard: React.FC<FlowerGalleryCardProps> = ({
  initialImage = 0,
  onFlip,
  enableHaptics = true,
  seasonFilter
}) => {
  // Get the appropriate flower collection based on season filter
  const getFlowerCollection = () => {
    if (!seasonFilter) {
      return getAllFlowers();
    }
    return FLOWER_IMAGES[seasonFilter] || getAllFlowers();
  };

  const [flowerCollection, setFlowerCollection] = useState(getFlowerCollection());
  const [currentIndex, setCurrentIndex] = useState(initialImage % flowerCollection.length);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [nextImagePreloaded, setNextImagePreloaded] = useState(false);

  // Animation values
  const flipAnimation = useRef(new Animated.Value(0)).current;
  const nextImageIndex = useRef((currentIndex + 1) % flowerCollection.length);

  // Update flower collection when season filter changes
  useEffect(() => {
    const newCollection = getFlowerCollection();
    setFlowerCollection(newCollection);

    // Reset to first image when changing collections
    setCurrentIndex(0);
    nextImageIndex.current = 1 % newCollection.length;

    // Pre-load new images
    preloadNextImage();
  }, [seasonFilter]);

  // Pre-load the next image
  const preloadNextImage = () => {
    setNextImagePreloaded(false);

    // Use different preloading approach based on platform
    if (Platform.OS === 'web') {
      const img = new (globalThis as any).Image();
      img.onload = () => setNextImagePreloaded(true);
      img.src = flowerCollection[nextImageIndex.current].uri;
    } else {
      // For native platforms, use Image.prefetch
      Image.prefetch(flowerCollection[nextImageIndex.current].uri)
        .then(() => setNextImagePreloaded(true))
        .catch(err => console.error('Error preloading image:', err));
    }
  };

  // Cache all images for smoother experience
  useCacheAssets(flowerCollection.map(flower => flower.uri));

  const flipCard = () => {
    if (isLoading) return; // Prevent flipping while loading

    // Trigger haptic feedback if enabled
    if (enableHaptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    // Notify parent component about flip
    if (onFlip) onFlip();

    // Start flip animation
    setIsFlipped(true);
    Animated.spring(flipAnimation, {
      toValue: 1,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start(() => {
      // After front is flipped, prepare to rotate to the next image
      setIsLoading(true);

      // If next image is already loaded, change immediately
      // Otherwise, set a short timeout to show loading indicator
      if (nextImagePreloaded) {
        changeToNextImage();
      } else {
        // Give a brief moment for loading indicator to appear
        setTimeout(changeToNextImage, 500);
      }
    });
  };

  const changeToNextImage = () => {
    // Update to the next image
    setCurrentIndex(nextImageIndex.current);
    nextImageIndex.current = (nextImageIndex.current + 1) % flowerCollection.length;

    // Reset animation
    flipAnimation.setValue(0);
    setIsFlipped(false);
    setIsLoading(false);

    // Preload the next image
    preloadNextImage();
  };

  // Create interpolation for front and back animations
  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['0deg', '90deg', '180deg'],
    extrapolate: 'clamp',
  });

  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['180deg', '270deg', '360deg'],
    extrapolate: 'clamp',
  });

  const frontOpacity = flipAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0, 0],
    extrapolate: 'clamp',
  });

  const backOpacity = flipAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
    extrapolate: 'clamp',
  });

  // Create animated styles
  const frontAnimatedStyle = {
    transform: [
      { perspective: 1000 },
      { rotateY: frontInterpolate }
    ],
    opacity: frontOpacity,
  };

  const backAnimatedStyle = {
    transform: [
      { perspective: 1000 },
      { rotateY: backInterpolate }
    ],
    opacity: backOpacity,
  };

  // Current flower being displayed
  const currentFlower = flowerCollection[currentIndex];

  return (
    <View style={styles.container}>
      {/* Front - Flower Image */}
      <Animated.View style={[styles.card, frontAnimatedStyle]}>
        <Image
          source={{ uri: currentFlower.uri }}
          style={styles.flowerImage}
          resizeMode="cover"
        />
        <View style={styles.cardFooter}>
          <ThemedText type="subtitle">{currentFlower.name}</ThemedText>
          {currentFlower.season && (
            <View style={[
              styles.seasonTag,
              { backgroundColor: getSeasonColor(currentFlower.season) }
            ]}>
              <Text style={styles.seasonText}>
                {currentFlower.season}
              </Text>
            </View>
          )}
        </View>
      </Animated.View>

      {/* Back - Loading or Info */}
      <Animated.View style={[styles.card, styles.cardBack, backAnimatedStyle]}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3498db" />
            <ThemedText style={styles.loadingText}>Loading next flower...</ThemedText>
          </View>
        ) : (
          <View style={styles.infoContainer}>
            <ThemedText type="title">Did you know?</ThemedText>
            <ThemedText style={styles.description}>
              {currentFlower.description}
            </ThemedText>
          </View>
        )}
      </Animated.View>

      {/* Flip Button */}
      <TouchableOpacity
        style={styles.flipButton}
        onPress={flipCard}
        disabled={isLoading}
        activeOpacity={0.7}
      >
        <ThemedText style={styles.flipButtonText}>
          {isFlipped ? "Loading..." : "Flip for Next Flower"}
        </ThemedText>
      </TouchableOpacity>
    </View>
  );
};

// Helper function to get color based on season
const getSeasonColor = (season: string): string => {
  switch (season.toLowerCase()) {
    case 'spring':
      return '#4CAF50'; // Green
    case 'summer':
      return '#FF9800'; // Orange
    case 'fall':
      return '#F44336'; // Red
    case 'winter':
      return '#2196F3'; // Blue
    default:
      return '#9E9E9E'; // Grey
  }
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 20,
    height: CARD_HEIGHT + 60,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 16,
    backfaceVisibility: 'hidden',
    position: 'absolute',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardBack: {
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  flowerImage: {
    width: '100%',
    height: '85%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    height: '15%',
  },
  seasonTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  seasonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
    textTransform: 'capitalize',
  },
  flipButton: {
    position: 'absolute',
    bottom: -40,
    backgroundColor: '#3498db',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  flipButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
  },
  infoContainer: {
    padding: 20,
    alignItems: 'center',
  },
  description: {
    textAlign: 'center',
    marginTop: 15,
    lineHeight: 24,
  },
});
