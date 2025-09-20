import React from 'react';
import { Button as PaperButton, ButtonProps as PaperButtonProps } from 'react-native-paper';
import { useTheme } from '../utils/theme-context';

interface ButtonProps extends Omit<PaperButtonProps, 'theme'> {
  variant?: 'primary' | 'secondary' | 'outlined' | 'text';
  size?: 'small' | 'medium' | 'large';
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  mode,
  buttonColor,
  textColor,
  style,
  ...props
}) => {
  const { theme } = useTheme();

  const getButtonStyle = () => {
    const baseStyle = {
      borderRadius: 16,
      shadowColor: theme.colors.primary,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 6,
    };

    const sizeStyles = {
      small: { paddingVertical: 10, paddingHorizontal: 20 },
      medium: { paddingVertical: 14, paddingHorizontal: 24 },
      large: { paddingVertical: 18, paddingHorizontal: 32 },
    };

    return [baseStyle, sizeStyles[size], style];
  };

  const getButtonProps = () => {
    switch (variant) {
      case 'primary':
        return {
          mode: 'contained' as const,
          buttonColor: buttonColor || theme.colors.primary,
          textColor: textColor || theme.colors.onPrimary,
        };
      case 'secondary':
        return {
          mode: 'contained' as const,
          buttonColor: buttonColor || theme.colors.secondary,
          textColor: textColor || theme.colors.onSecondary,
        };
      case 'outlined':
        return {
          mode: 'outlined' as const,
          buttonColor: 'transparent',
          textColor: textColor || theme.colors.primary,
        };
      case 'text':
        return {
          mode: 'text' as const,
          buttonColor: 'transparent',
          textColor: textColor || theme.colors.primary,
        };
      default:
        return {
          mode: mode || 'contained',
          buttonColor,
          textColor,
        };
    }
  };

  return (
    <PaperButton
      {...props}
      {...getButtonProps()}
      style={getButtonStyle()}
    />
  );
};
