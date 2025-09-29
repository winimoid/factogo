import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card, IconButton, useTheme } from 'react-native-paper';
import { typography } from '../../styles/typography';

const TemplateListItem = ({ template, onEdit, onDelete }) => {
  const theme = useTheme();
  const { name } = template;

  return (
    <Card style={styles.card}>
      <Card.Content style={styles.content}>
        <View style={styles.info}>
          <Text style={[styles.name, { color: theme.colors.onSurface }]}>{name}</Text>
        </View>
        <View style={styles.actions}>
          <IconButton icon="pencil" onPress={() => onEdit(template)} />
          <IconButton icon="delete" onPress={() => onDelete(template)} />
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
  actions: {
    flexDirection: 'row',
  },
});

export default TemplateListItem;