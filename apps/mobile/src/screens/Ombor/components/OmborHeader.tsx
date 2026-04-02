import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from './omborTypes';

export default function OmborHeader() {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Ionicons name="cube-outline" size={28} color={C.primary} />
        <Text style={styles.headerTitle}>Ombor</Text>
      </View>
      <View style={styles.avatar}>
        <Ionicons name="person" size={20} color={C.secondary} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection:       'row',
    alignItems:          'center',
    justifyContent:      'space-between',
    paddingHorizontal:   16,
    paddingVertical:     12,
    backgroundColor:     C.white,
    borderBottomWidth:   1,
    borderBottomColor:   C.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           10,
  },
  headerTitle: {
    fontSize:   28,
    fontWeight: '800',
    color:      C.text,
  },
  avatar: {
    width:           36,
    height:          36,
    borderRadius:    18,
    backgroundColor: '#E5E7EB',
    alignItems:      'center',
    justifyContent:  'center',
  },
});
