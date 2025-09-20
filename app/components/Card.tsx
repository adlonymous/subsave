import React from 'react';
import { Card as PaperCard, CardProps as PaperCardProps } from 'react-native-paper';
import { useTheme } from '@/utils/theme-context';

interface CardProps extends Omit<PaperCardProps, 'theme'> {
  variant?: 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'small' | 'medium' | 'large';
}

export const Card: React.FC<CardProps> = ({
  variant = 'elevated',
  padding = 'medium',
  style,
  children,
  ...props
}) => {
  const { theme } = useTheme();

  const getCardStyle = () => {
    const baseStyle = {
      borderRadius: 12,
      marginVertical: 4,
    };

    const paddingStyles = {
      none: { padding: 0 },
      small: { padding: 8 },
      medium: { padding: 16 },
      large: { padding: 24 },
    };

    return [baseStyle, paddingStyles[padding], style];
  };

  const getCardProps = () => {
    switch (variant) {
      case 'elevated':
        return {
          mode: 'elevated' as const,
          elevation: 2,
        };
      case 'outlined':
        return {
          mode: 'outlined' as const,
          elevation: 0,
        };
      case 'filled':
        return {
          mode: 'contained' as const,
          elevation: 0,
        };
      default:
        return {
          mode: 'elevated',
          elevation: 2,
        };
    }
  };

  return (
    <PaperCard
      {...props}
      {...getCardProps()}
      style={getCardStyle()}
    >
      {children}
    </PaperCard>
  );
};
