
import React, { useContext, useState } from 'react';
import { View, StyleSheet, PermissionsAndroid, Platform, ScrollView } from 'react-native';
import { Button, useTheme, Card, Title, Paragraph, Portal, Dialog } from 'react-native-paper';
import { LanguageContext } from '../../contexts/LanguageContext';
import { typography } from '../../styles/typography';
import RNFS from 'react-native-fs';
import DocumentPicker from '@react-native-documents/picker';
import RNRestart from 'react-native-restart';

const BackupRestoreScreen = () => {
  const { t } = useContext(LanguageContext);
  const { colors } = useTheme();
  const [dialog, setDialog] = useState({ visible: false, title: '', message: '', actions: [] });

  const showDialog = (title, message, actions = [{ text: t('ok'), onPress: hideDialog }]) => {
    setDialog({ visible: true, title, message, actions });
  };

  const hideDialog = () => {
    setDialog({ ...dialog, visible: false });
  };

  const handleBackup = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: t('storage_permission_denied'),
            message: t('storage_permission_denied_message'),
            buttonPositive: t('ok'),
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          createBackup();
        } else {
          showDialog(t('storage_permission_denied'), t('storage_permission_denied_message'));
        }
      } catch (err) {
        console.warn(err);
      }
    } else {
      createBackup();
    }
  };

  const createBackup = async () => {
    const dbPath = Platform.OS === 'ios' 
      ? `${RNFS.LibraryDirectoryPath}/LocalDatabase/FactoGo.db`
      : `/data/data/com.factogo/databases/FactoGo.db`;
    const date = new Date();
    const timestamp = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}_${String(date.getHours()).padStart(2, '0')}${String(date.getMinutes()).padStart(2, '0')}${String(date.getSeconds()).padStart(2, '0')}`;
    const backupPath = `${RNFS.DownloadDirectoryPath}/FactoGo_backup_${timestamp}.db`;

    try {
      await RNFS.copyFile(dbPath, backupPath);
      showDialog(t('backup.success_title'), t('backup.success_message', { path: backupPath }));
    } catch (error) {
      console.error(error);
      showDialog(t('backup.error_title'), t('backup.error_message'));
    }
  };

  const handleRestore = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: t('storage_permission_denied'),
            message: t('storage_permission_denied_message'),
            buttonPositive: t('ok'),
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          pickBackupFile();
        } else {
          showDialog(t('storage_permission_denied'), t('storage_permission_denied_message'));
        }
      } catch (err) {
        console.warn(err);
      }
    } else {
      pickBackupFile();
    }
  };

  const pickBackupFile = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });

      showDialog(
        t('restore.confirm_title'),
        t('restore.confirm_message'),
        [
          { text: t('cancel'), onPress: hideDialog },
          { text: t('ok'), onPress: () => {
              hideDialog();
              restoreBackup(res[0].uri);
            }
          },
        ]
      );
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        showDialog(t('restore.error_title'), t('restore.error_message'));
      }
    }
  };

  const restoreBackup = async (uri) => {
    const dbPath = Platform.OS === 'ios'
      ? `${RNFS.LibraryDirectoryPath}/LocalDatabase/FactoGo.db`
      : `/data/data/com.factogo/databases/FactoGo.db`;
    try {
      await RNFS.copyFile(uri, dbPath);
      showDialog(
        t('restore.success_title'),
        t('restore.success_message'),
        [{ text: t('ok'), onPress: () => RNRestart.Restart() }]
      );
    } catch (error) {
      console.error(error);
      showDialog(t('restore.error_title'), t('restore.error_message'));
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
            <Button
              mode="contained"
              onPress={handleBackup}
              style={styles.button}
              icon="database-export-outline"
              labelStyle={typography.button}
            >
              {t('backup.title')}
            </Button>
            <Button
              mode="contained"
              onPress={handleRestore}
              style={styles.button}
              icon="database-import-outline"
              labelStyle={typography.button}
            >
              {t('restore.title')}
            </Button>
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
});

export default BackupRestoreScreen;

