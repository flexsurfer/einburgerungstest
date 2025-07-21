import { Text, StyleSheet } from 'react-native'

export const Star = () => {
  return <Text style={styles.star}>★</Text>
}

const styles = StyleSheet.create({
  star: {
    fontSize: 20,
    color: '#F1C40F',
  }
}) 