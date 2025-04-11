import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity } from 'react-native';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import { FlowerGalleryCard } from '../../components/FlowerGalleryCard';

const SEASONS = ['all', 'spring', 'summer', 'fall', 'winter'];

export default function FlowersScreen() {
  const [selectedSeason, setSelectedSeason] = useState<string | null>(null);
  const [flipCount, setFlipCount] = useState(0);
  
  const handleFlip = () => {
    setFlipCount(prev => prev + 1);
  };
  
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.header}>Flower Gallery</ThemedText>
      <ThemedText style={styles.subheader}>
        Flip through our beautiful flower collection
      </ThemedText>
      
      {/* Season Filter */}
      <View style={styles.filterContainer}>
        <ThemedText style={styles.filterLabel}>Filter by season:</ThemedText>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.seasonFilters}
        >
          {SEASONS.map((season) => (
            <TouchableOpacity
              key={season}
              style={[
                styles.seasonButton,
                selectedSeason === season ? styles.selectedSeasonButton : null,
                season !== 'all' ? { backgroundColor: getSeasonColor(season) } : null
              ]}
              onPress={() => setSelectedSeason(season === 'all' ? null : season)}
            >
              <ThemedText 
                style={[
                  styles.seasonButtonText,
                  selectedSeason === season ? styles.selectedSeasonButtonText : null
                ]}
              >
                {season.charAt(0).toUpperCase() + season.slice(1)}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      {/* Stats */}
      <View style={styles.statsContainer}>
        <ThemedText style={styles.statsText}>
          Flowers viewed: {flipCount}
        </ThemedText>
      </View>
      
      {/* Flower Gallery Card */}
      <View style={styles.cardContainer}>
        <FlowerGalleryCard 
          seasonFilter={selectedSeason ?? undefined}
          onFlip={handleFlip}
          enableHaptics={true}
        />
      </View>
      
      <ThemedText style={styles.tip}>
        Tip: Tap the button to flip to a new flower!
      </ThemedText>
    </ThemedView>
  );
}

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
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 28,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  subheader: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#777',
  },
  filterContainer: {
    marginBottom: 20,
  },
  filterLabel: {
    marginBottom: 8,
    fontWeight: '600',
  },
  seasonFilters: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 5,
  },
  seasonButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    minWidth: 80,
    alignItems: 'center',
  },
  selectedSeasonButton: {
    transform: [{scale: 1.05}],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  seasonButtonText: {
    fontWeight: '500',
  },
  selectedSeasonButtonText: {
    fontWeight: 'bold',
    color: '#fff',
  },
  statsContainer: {
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(200, 200, 200, 0.2)',
  },
  statsText: {
    fontWeight: '600',
  },
  cardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 70, // Space for the flip button
  },
  tip: {
    textAlign: 'center',
    fontStyle: 'italic',
    color: '#888',
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
  }
});

