import React, { useContext, useState } from 'react';
import { View, StyleSheet, Platform, ScrollView } from 'react-native';
import { Button, useTheme, Card, Title, Paragraph, Portal, Dialog } from 'react-native-paper';
import { LanguageContext } from '../../contexts/LanguageContext';
import { ThemeContext } from '../../contexts/ThemeContext';
import { typography } from '../../styles/typography';
import RNFS from 'react-native-fs';
import RNRestart from 'react-native-restart';
import { zip, unzip } from 'react-native-zip-archive';
import { getSettings, saveSettings } from '../../services/Database';
import { FileSystem, Dirs } from 'react-native-file-access';

const BACKUP_FILE_NAME = 'FactoGo_backup.fctg';
const BACKUP_PATH = `${Dirs.DocumentDir}/${BACKUP_FILE_NAME}`;

const BackupRestoreScreen = () => {
  const { t, locale, setLanguage } = useContext(LanguageContext);
  const { isDarkMode, setAppThemeColors, themes } = useContext(ThemeContext);
  const { colors } = useTheme();
  const [dialog, setDialog] = useState({ visible: false, title: '', message: '', actions: [] });

  const showDialog = (title, message, actions = [{ text: t('ok'), onPress: hideDialog }]) => {
    setDialog({ visible: true, title, message, actions });
  };

  const hideDialog = () => {
    setDialog({ ...dialog, visible: false });
  };

  const createBackup = async () => {
    const tempDir = `${RNFS.CachesDirectoryPath}/backup`;
    const archivePath = `${RNFS.CachesDirectoryPath}/${BACKUP_FILE_NAME}`;

    try {
      const settings = await getSettings();
      const appSettings = {
        language: locale,
        isDarkMode,
        themeName: themes.find(theme => theme.primary === colors.primary)?.name || 'Default',
        companyName: settings?.companyName || '',
        managerName: settings?.managerName || '',
        description: settings?.description || '',
        informations: settings?.informations || '',
      };

      await RNFS.mkdir(tempDir);
      await RNFS.mkdir(`${tempDir}/images`);
      await RNFS.mkdir(`${tempDir}/database`);
      await RNFS.writeFile(`${tempDir}/metadata.json`, JSON.stringify(appSettings, null, 2), 'utf8');

      const dbPath = Platform.OS === 'ios'
        ? `${RNFS.LibraryDirectoryPath}/LocalDatabase/FactoGo.db`
        : `${RNFS.DocumentDirectoryPath.replace('/files', '/databases')}/FactoGo.db`;

      await RNFS.copyFile(dbPath, `${tempDir}/database/FactoGo.db`);

      const imagePaths = ['logo', 'signature', 'stamp'];
      for (const imageName of imagePaths) {
        if (settings?.[imageName]) {
          const sourcePath = settings[imageName].replace('file://', '');
          if (await RNFS.exists(sourcePath)) {
            await RNFS.copyFile(sourcePath, `${tempDir}/images/${imageName}.png`);
          }
        }
      }

      await zip(tempDir, archivePath);

      const archiveData = await FileSystem.readFile(archivePath, 'base64');
      await FileSystem.writeFile(BACKUP_PATH, archiveData, 'base64');

      showDialog(t('backup.success_title'), t('backup.success_message', { path: BACKUP_PATH }));

    } catch (error) {
      console.error(error);
      showDialog(t('backup.error_title'), t('backup.error_message'));
    } finally {
      try { if (await RNFS.exists(tempDir)) await RNFS.unlink(tempDir); } catch {}
      try { if (await RNFS.exists(archivePath)) await RNFS.unlink(archivePath); } catch {}
    }
  };

  const restoreBackup = async () => {
    const tempDir = `${RNFS.CachesDirectoryPath}/restore`;

    try {
      const exists = await FileSystem.exists(BACKUP_PATH);
      if (!exists) {
        showDialog(t('restore.error_title'), t('Fichier de sauvegarde introuvable.'));
        return;
      }

      await unzip(BACKUP_PATH, tempDir);

      const metadataPath = `${tempDir}/metadata.json`;
      const dbPath = `${tempDir}/database/FactoGo.db`;
      if (!(await RNFS.exists(metadataPath) && await RNFS.exists(dbPath))) {
        throw new Error('Fichier de sauvegarde invalide.');
      }

      const targetDbPath = Platform.OS === 'ios'
        ? `${RNFS.LibraryDirectoryPath}/LocalDatabase/FactoGo.db`
        : `${RNFS.DocumentDirectoryPath.replace('/files', '/databases')}/FactoGo.db`;

      await RNFS.copyFile(dbPath, targetDbPath);

      const metadata = JSON.parse(await RNFS.readFile(metadataPath, 'utf8'));
      const newSettings = {
        companyName: metadata.companyName,
        managerName: metadata.managerName,
        description: metadata.description,
        informations: metadata.informations,
      };

      const imageNames = ['logo', 'signature', 'stamp'];
      for (const imageName of imageNames) {
        const sourceImagePath = `${tempDir}/images/${imageName}.png`;
        if (await RNFS.exists(sourceImagePath)) {
          const destImagePath = `${RNFS.DocumentDirectoryPath}/${Date.now()}_${imageName}.png`;
          await RNFS.copyFile(sourceImagePath, destImagePath);
          newSettings[imageName] = destImagePath;
        }
      }

      await saveSettings(newSettings);
      setLanguage(metadata.language);
      const selectedTheme = themes.find(theme => theme.name === metadata.themeName);
      if (selectedTheme) setAppThemeColors(selectedTheme);

      showDialog(
        t('restore.success_title'),
        t('restore.success_message'),
        [{ text: t('ok'), onPress: () => RNRestart.Restart() }]
      );

    } catch (error) {
      console.error(error);
      showDialog(t('restore.error_title'), t('restore.error_message'));
    } finally {
      try { if (await RNFS.exists(tempDir)) await RNFS.unlink(tempDir); } catch {}
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
              onPress={createBackup}
              style={styles.button}
              icon="database-export-outline"
              labelStyle={typography.button}
            >
              {t('backup.title')}
            </Button>
            <Button
              mode="contained"
              onPress={restoreBackup}
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
