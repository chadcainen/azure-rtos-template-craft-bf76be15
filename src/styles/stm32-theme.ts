
// STM32 Color Palette and Theme Configuration
export const STM32_COLORS = {
  // Primary STM32 Blues
  primary: '#003E7E',
  primaryLight: '#0056B3',
  primaryDark: '#002856',
  
  // Secondary Colors
  secondary: '#39A9DC',
  accent: '#00C5CD',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  
  // Grays
  gray100: '#F8F9FA',
  gray200: '#E9ECEF',
  gray300: '#DEE2E6',
  gray400: '#CED4DA',
  gray500: '#ADB5BD',
  gray600: '#6C757D',
  gray700: '#495057',
  gray800: '#343A40',
  gray900: '#212529',
  
  // Background Colors
  background: '#F5F7FA',
  surface: '#FFFFFF',
  surfaceLight: '#FAFBFC',
  
  // Text Colors
  textPrimary: '#212529',
  textSecondary: '#6C757D',
  textLight: '#ADB5BD',
  
  // Special Colors
  codeBackground: '#1E2A3E',
  codeText: '#D8E0F0',
  highlight: '#FFF3CD',
} as const;

export const STM32_GRADIENTS = {
  primary: 'linear-gradient(135deg, #003E7E 0%, #0056B3 100%)',
  secondary: 'linear-gradient(135deg, #39A9DC 0%, #00C5CD 100%)',
  surface: 'linear-gradient(135deg, #FFFFFF 0%, #F8F9FA 100%)',
  header: 'linear-gradient(135deg, #002856 0%, #003E7E 50%, #0056B3 100%)',
} as const;
