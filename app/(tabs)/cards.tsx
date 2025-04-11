import React, { useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import { AnimatedCard } from '../../components/AnimatedCard';

export default function CardsScreen() {
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  const cards = [
    {
      title: 'First Card',
      content: 'This is the content of the first card. It will expand when tapped.',
    },
    {
      title: 'Second Card',
      content: 'This is the content of the second card. It will expand when tapped.',
    },
    {
      title: 'Third Card',
      content: 'This is the content of the third card. It will expand when tapped.',
    },
  ];

  const handleCardPress = (index: number) => {
    setExpandedCard(expandedCard === index ? null : index);
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {cards.map((card, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleCardPress(index)}
            activeOpacity={0.7}
          >
            <AnimatedCard
              title={card.title}
              content={card.content}
              isExpanded={expandedCard === index}
              onExpand={() => handleCardPress(index)}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
}); 