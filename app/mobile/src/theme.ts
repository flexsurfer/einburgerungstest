import { useSubscription } from '@flexsurfer/reflex'
import { SUB_IDS } from 'shared/sub-ids'

export const lightColors = {
  bgColor: '#ffffff',
  textColor: '#2C3E50',
  accentColor: '#F1C40F',
  accentLight: 'rgba(241, 196, 15, 0.1)',
  accentMedium: 'rgba(241, 196, 15, 0.2)',
  successColor: '#28a745',
  successLight: 'rgba(40, 167, 69, 0.1)',
  errorColor: '#E74C3C',
  errorLight: 'rgba(231, 76, 60, 0.1)',
  borderColor: '#E8E8E8',
  shadowColor: 'rgba(44, 62, 80, 0.08)',
}

export const darkColors = {
  bgColor: '#121212',
  textColor: '#ffffff',
  accentColor: '#FFD700',
  accentLight: 'rgba(255, 215, 0, 0.1)',
  accentMedium: 'rgba(255, 215, 0, 0.2)',
  successColor: '#2ecc71',
  successLight: 'rgba(46, 204, 113, 0.1)',
  errorColor: '#e74c3c',
  errorLight: 'rgba(231, 76, 60, 0.1)',
  borderColor: '#333333',
  shadowColor: 'rgba(255, 255, 255, 0.05)',
}

export type Colors = typeof lightColors

export const useColors = (): Colors => {
  const theme = useSubscription([SUB_IDS.THEME])
  return theme === 'dark' ? darkColors : lightColors
} 