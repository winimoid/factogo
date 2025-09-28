import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, IconButton, useTheme } from 'react-native-paper';
import { typography } from '../../styles/typography';

const StoreListItem = ({ store, onEdit, onDelete }) => {
  const theme = useTheme();
  const { name, status } = store;

  return (
    <Card style={styles.card}>
      <Card.Content style={styles.content}>
        <View style={styles.info}>
          <Text style={[styles.name, { color: theme.colors.onSurface }]}>{name}</Text>
          <Text style={[styles.status, { color: status === 'active' ? theme.colors.primary : 'gray' }]}>
            {status}
          </Text>
        </View>
        <View style={styles.actions}>
          <IconButton icon="pencil" onPress={() => onEdit(store)} />
          <IconButton icon="delete" onPress={() => onDelete(store)} />
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    marginHorizontal: 16,
    elevation: 4,
    borderRadius: 8,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  info: {
    flex: 1,
  },
  name: {
    ...typography.h3,
  },
  status: {
    ...typography.body,
    fontSize: 14,
    textTransform: 'capitalize',
  },
  actions: {
    flexDirection: 'row',
  },
});

export default StoreListItem;
