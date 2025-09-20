import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

// Fallback for LinearGradient
const LinearGradient = ({ children, colors, start, end, style }: any) => {
  return (
    <View style={[style, { backgroundColor: colors[0] }]}>
      {children}
    </View>
  );
};

interface GradientBackgroundProps {
  children: React.ReactNode;
  colors?: string[];
  direction?: 'vertical' | 'horizontal' | 'diagonal';
  style?: ViewStyle;
}

export const GradientBackground: React.FC<GradientBackgroundProps> = ({
  children,
  colors = ['#14F195', '#9945FF'],
  direction = 'diagonal',
  style,
}) => {
  const getGradientProps = () => {
    switch (direction) {
      case 'vertical':
        return { start: { x: 0, y: 0 }, end: { x: 0, y: 1 } };
      case 'horizontal':
        return { start: { x: 0, y: 0 }, end: { x: 1, y: 0 } };
      case 'diagonal':
      default:
        return { start: { x: 0, y: 0 }, end: { x: 1, y: 1 } };
    }
  };

  return (
    <LinearGradient
      colors={colors}
      {...getGradientProps()}
      style={[styles.gradient, style]}
    >
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
});
