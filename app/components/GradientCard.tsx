import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/utils/theme-context';

// Fallback for LinearGradient
const LinearGradient = ({ children, colors, start, end, style }: any) => {
  return (
    <View style={[style, { backgroundColor: colors[0] }]}>
      {children}
    </View>
  );
};

interface GradientCardProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent';
  style?: ViewStyle;
  padding?: number;
}

export const GradientCard: React.FC<GradientCardProps> = ({
  children,
  variant = 'primary',
  style,
  padding = 20,
}) => {
  const { theme } = useTheme();

  const getGradientColors = () => {
    switch (variant) {
      case 'primary':
        return [theme.colors.surface, theme.colors.surfaceVariant];
      case 'secondary':
        return [theme.colors.surfaceVariant, theme.colors.surface];
      case 'accent':
        return [theme.colors.surface, theme.colors.surfaceVariant, theme.colors.surface];
      default:
        return [theme.colors.surface, theme.colors.surfaceVariant];
    }
  };

  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={getGradientColors()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradient, { padding }]}
      >
        {children}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  gradient: {
    borderRadius: 20,
  },
});
