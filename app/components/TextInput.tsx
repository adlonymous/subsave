import React from 'react';
import { TextInput as PaperTextInput, TextInputProps as PaperTextInputProps } from 'react-native-paper';
import { useTheme } from '@/utils/theme-context';

interface TextInputProps extends Omit<PaperTextInputProps, 'theme'> {
  variant?: 'outlined' | 'flat' | 'filled';
  size?: 'small' | 'medium' | 'large';
}

export const TextInput: React.FC<TextInputProps> = ({
  variant = 'outlined',
  size = 'medium',
  mode,
  style,
  ...props
}) => {
  const { theme } = useTheme();

  const getInputStyle = () => {
    const baseStyle = {
      borderRadius: 8,
    };

    const sizeStyles = {
      small: { height: 40 },
      medium: { height: 48 },
      large: { height: 56 },
    };

    return [baseStyle, sizeStyles[size], style];
  };

  const getInputProps = () => {
    switch (variant) {
      case 'outlined':
        return {
          mode: 'outlined' as const,
        };
      case 'flat':
        return {
          mode: 'flat' as const,
        };
      case 'filled':
        return {
          mode: 'contained' as const,
        };
      default:
        return {
          mode: mode || 'outlined',
        };
    }
  };

  return (
    <PaperTextInput
      {...props}
      {...getInputProps()}
      style={getInputStyle()}
    />
  );
};
