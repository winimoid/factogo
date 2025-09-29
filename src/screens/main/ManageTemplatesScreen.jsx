import React, { useCallback, useContext, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { FAB, Text, ActivityIndicator, useTheme, Dialog, Portal, Button } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { deleteDocumentTemplate, getDocumentTemplates } from '../../services/DocumentTemplateService';
import TemplateListItem from '../../components/template/TemplateListItem';
import { LanguageContext } from '../../contexts/LanguageContext';

const ManageTemplatesScreen = ({ navigation }) => {
  const { t } = useContext(LanguageContext);
  const { colors } = useTheme();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);

  const loadTemplates = useCallback(async () => {
    setLoading(true);
    const data = await getDocumentTemplates();
    setTemplates(data);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTemplates();
    }, [loadTemplates])
  );

  const handleEdit = (template) => {
    navigation.navigate('EditTemplate', { templateId: template.templateId });
  };

  const handleDelete = (template) => {
    setTemplateToDelete(template);
    setDialogVisible(true);
  };

  const hideDialog = () => {
    setTemplateToDelete(null);
    setDialogVisible(false);
  };

  const confirmDelete = async () => {
    if (templateToDelete) {
      await deleteDocumentTemplate(templateToDelete.templateId);
      loadTemplates(); // Refresh the list
    }
    hideDialog();
  };

  if (loading) {
    return <ActivityIndicator animating={true} style={styles.loader} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {templates.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text>{t('no_templates_found')}</Text>
        </View>
      ) : (
        <FlatList
          data={templates}
          keyExtractor={(item) => item.templateId.toString()}
          renderItem={({ item }) => (
            <TemplateListItem template={item} onEdit={handleEdit} onDelete={handleDelete} />
          )}
        />
      )}
      <FAB
        style={[styles.fab, { backgroundColor: colors.primary }]}
        icon="plus"
        onPress={() => navigation.navigate('EditTemplate')}
      />
      <Portal>
        <Dialog visible={dialogVisible} onDismiss={hideDialog} style={{ borderRadius: 8 }}>
          <Dialog.Title>{t('delete_template_title')}</Dialog.Title>
          <Dialog.Content>
            <Text>{t('delete_template_message', { templateName: templateToDelete?.name })}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideDialog}>{t('cancel')}</Button>
            <Button onPress={confirmDelete} style={{ marginLeft: 8 }}>{t('delete')}</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default ManageTemplatesScreen;
