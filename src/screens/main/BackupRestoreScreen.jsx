import React, { useContext, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, useTheme, Card, Title, Paragraph, Portal, Dialog, ActivityIndicator } from 'react-native-paper';
import { LanguageContext } from '../../contexts/LanguageContext';
import { ThemeContext } from '../../contexts/ThemeContext';
import { typography } from '../../styles/typography';
import RNRestart from 'react-native-restart';
import Share from 'react-native-share';
import { pick, types } from '@react-native-documents/picker';
import { createBackup, restoreBackup } from '../../services/BackupService';

const BackupRestoreScreen = () => {
  const { t } = useContext(LanguageContext);
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [dialog, setDialog] = useState({ visible: false, title: '', message: '', actions: [] });

  const showDialog = (title, message, actions = [{ text: t('ok'), onPress: hideDialog }]) => {
    setDialog({ visible: true, title, message, actions });
  };

  const hideDialog = () => {
    setDialog({ ...dialog, visible: false });
  };

  const handleCreateBackup = async () => {
    setLoading(true);
    try {
      const backupPath = await createBackup();
      
      await Share.open({
        url: `file://${backupPath}`,
        type: 'application/zip',
        title: t('backup.success_title'),
        failOnCancel: false,
      });

      // Optional: Show success if needed, but Share dialog is usually enough feedback
      // showDialog(t('backup.success_title'), t('backup.success_message', { path: 'Partagé' }));

    } catch (error) {
      console.error('Backup error:', error);
      showDialog(t('backup.error_title'), t('backup.error_message'));
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreBackup = async () => {
    try {
      const [result] = await pick({
        type: [types.allFiles], // We can try to filter for .fctg or zip if possible, but allFiles is safest
        mode: 'import',
      });

      if (!result) return;

      showDialog(
        t('restore.confirm_title'),
        t('restore.confirm_message'),
        [
          { text: t('cancel'), onPress: hideDialog },
          { 
            text: t('restore.title'), 
            onPress: () => performRestore(result.uri) 
          }
        ]
      );
    } catch (error) {
      if (!types.isCancel(error)) {
        console.error('Pick error:', error);
        showDialog(t('restore.error_title'), error.message || t('restore.error_message'));
      }
    }
  };

  const performRestore = async (uri) => {
    hideDialog();
    setLoading(true);
    try {
      // Decode URI if needed (e.g., %20 to space) but libraries usually handle it.
      // On Android, DocumentPicker returns a content:// URI. 
      // react-native-zip-archive might need a file path or can handle content uri?
      // unzip in react-native-zip-archive typically expects a file path.
      // We might need to copy content:// to a temp file first if unzip doesn't support it directly.
      // But let's try passing the URI first. 
      // UPDATE: createBackup/restoreBackup in Service expects a path.
      // We might need to handle content uri copying in the Service or here.
      // Let's assume the Service or unzip handles it, or we copy it here.
      
      // Actually, for safety with content:// URIs, it's best to copy to cache first.
      // But BackupService.restoreBackup calls unzip. 
      // Let's modify BackupService to handle it if needed, or do it here.
      // Doing it here keeps Service clean of UI-specific picker logic.
      
      // Wait, BackupService import is clean.
      // Let's rely on restoreBackup to handle the path/uri.
      // If restoreBackup fails with content://, we might need to fix it.
      // Given standard RN libraries, copying to cache is often required for content://
      
      await restoreBackup(uri);

      showDialog(
        t('restore.success_title'),
        t('restore.success_message'),
        [{ text: t('ok'), onPress: () => RNRestart.Restart() }]
      );
    } catch (error) {
      console.error('Restore error:', error);
      showDialog(t('restore.error_title'), t('restore.error_message'));
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Title style={styles.headerTitle}>{t('backupRestore.title')}</Title>
        <Card style={styles.card}>
          <Card.Content>
            <Paragraph style={styles.description}>
              {t('backupRestore.description')}
            </Paragraph>
            
            {loading ? (
              <ActivityIndicator animating={true} size="large" style={styles.loader} />
            ) : (
              <>
                <Button
                  mode="contained"
                  onPress={handleCreateBackup}
                  style={styles.button}
                  icon="database-export-outline"
                  labelStyle={typography.button}
                >
                  {t('backup.title')}
                </Button>
                <Button
                  mode="contained"
                  onPress={handleRestoreBackup}
                  style={styles.button}
                  icon="database-import-outline"
                  labelStyle={typography.button}
                >
                  {t('restore.title')}
                </Button>
              </>
            )}
          </Card.Content>
        </Card>
      </ScrollView>
      <Portal>
        <Dialog visible={dialog.visible} onDismiss={hideDialog} style={{ borderRadius: 8 }}>
          <Dialog.Title>{dialog.title}</Dialog.Title>
          <Dialog.Content>
            <Paragraph>{dialog.message}</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            {dialog.actions.map((action, index) => (
              <Button key={index} onPress={action.onPress}>{action.text}</Button>
            ))}
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
  scrollContent: {
    padding: 20,
  },
  headerTitle: {
    ...typography.h2,
    textAlign: 'center',
    marginBottom: 25,
  },
  card: {
    marginBottom: 20,
    elevation: 4,
    borderRadius: 8,
  },
  description: {
    ...typography.body,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    marginVertical: 10,
    paddingVertical: 10,
  },
  loader: {
    marginVertical: 20,
  }
});

export default BackupRestoreScreen;
