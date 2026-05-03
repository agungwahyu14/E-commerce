import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Colors } from '../constants/colors';

const SkeletonLoader = () => {
  const animatedValue = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 0.8,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [animatedValue]);

  return (
    <View style={styles.grid}>
      {[1, 2, 3, 4].map((item) => (
        <Animated.View key={item} style={[styles.card, { opacity: animatedValue }]}>
          <View style={styles.imagePlaceholder} />
          <View style={styles.textContainer}>
            <View style={styles.categoryPlaceholder} />
            <View style={styles.titlePlaceholder} />
            <View style={styles.pricePlaceholder} />
          </View>
        </Animated.View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  card: {
    width: '48%',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  imagePlaceholder: {
    width: '100%',
    height: 150,
    backgroundColor: Colors.border,
  },
  textContainer: {
    padding: 12,
  },
  categoryPlaceholder: {
    width: '40%',
    height: 10,
    backgroundColor: Colors.border,
    borderRadius: 4,
    marginBottom: 8,
  },
  titlePlaceholder: {
    width: '90%',
    height: 16,
    backgroundColor: Colors.border,
    borderRadius: 4,
    marginBottom: 12,
  },
  pricePlaceholder: {
    width: '60%',
    height: 18,
    backgroundColor: Colors.border,
    borderRadius: 4,
  },
});

export default SkeletonLoader;
