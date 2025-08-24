import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { TextInput, Button, Text, Switch, useTheme, Card, Title, Snackbar, Divider, ActivityIndicator, Portal, Dialog, Paragraph } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LanguageContext } from '../../contexts/LanguageContext';
import { ThemeContext } from '../../contexts/ThemeContext';
import { saveSettings, getSettings } from '../../services/Database';
import { launchImageLibrary } from 'react-native-image-picker';
import fs from 'react-native-fs';
import { openSettings } from 'react-native-permissions';
import { typography } from '../../styles/typography';

const SettingsScreen = () => {
  const [companyName, setCompanyName] = useState('');
  const [logo, setLogo] = useState(null);
  const [managerName, setManagerName] = useState('');
  const [signature, setSignature] = useState(null);
  const [stamp, setStamp] = useState(null);
  const [description, setDescription] = useState('');
  const [informations, setInformations] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [imageToDelete, setImageToDelete] = useState({ setter: null });


  const { t, setLanguage, locale } = useContext(LanguageContext);
  const { toggleTheme, isDarkMode } = useContext(ThemeContext);
  const { colors } = useTheme();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const settings = await getSettings();
    if (settings) {
      setCompanyName(settings.companyName);
      setLogo(settings.logo);
      setManagerName(settings.managerName);
      setSignature(settings.signature);
      setStamp(settings.stamp);
      setDescription(settings.description);
      setInformations(settings.informations);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const settings = { companyName, logo, managerName, signature, stamp, description, informations };
      await saveSettings(settings);
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const selectImage = (setter) => {
    launchImageLibrary({ mediaType: 'photo' }, async (response) => {
      if (response.assets && response.assets.length > 0) {
        const asset = response.assets[0];
        const newPath = `${fs.DocumentDirectoryPath}/${Date.now()}_${asset.fileName}`;
        try {
          await fs.copyFile(asset.uri, newPath);
          setter(newPath);
        } catch (error) {
          console.error(t('error_copying_image'), error);
        }
      }
    });
  };

  const showDeleteDialog = (setter) => {
    setImageToDelete({ setter });
    setDialogVisible(true);
  };

  const hideDialog = () => {
    setDialogVisible(false);
    setImageToDelete({ setter: null });
  };

  const handleDeleteImage = () => {
    if (imageToDelete.setter) {
      imageToDelete.setter(null);
    }
    hideDialog();
  };

  const renderImagePicker = (label, image, setter, icon) => (
    <View style={styles.imagePickerContainer}>
      <Button icon={icon} mode="outlined" onPress={() => selectImage(setter)} style={styles.imageButton} labelStyle={typography.button}>
        {image ? t(`change_${label}`) : t(`select_${label}`)}
      </Button>
      {image && (
        <View style={styles.previewContainer}>
          <Image source={{ uri: image.startsWith('file://') ? image : `file://${image}` }} style={styles.previewImage} />
          <TouchableOpacity onPress={() => showDeleteDialog(setter)} style={styles.deleteButton}>
            <Icon name="close-circle" size={24} color={colors.error} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );


  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Title style={styles.headerTitle}>{t('settings')}</Title>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>{t('company_information')}</Title>
            <TextInput
              label={t('company_name')}
              value={companyName}
              onChangeText={setCompanyName}
              style={styles.input}
              mode="outlined"
              labelStyle={typography.body}
              inputStyle={typography.body}
            />
            <TextInput
              label={t('manager_name')}
              value={managerName}
              onChangeText={setManagerName}
              style={styles.input}
              mode="outlined"
              labelStyle={typography.body}
              inputStyle={typography.body}
            />
            <TextInput
              label={t('description')}
              value={description}
              onChangeText={setDescription}
              style={styles.input}
              mode="outlined"
              labelStyle={typography.body}
              inputStyle={typography.body}
            />
            <TextInput
              label={t('informations')}
              value={informations}
              onChangeText={setInformations}
              style={styles.input}
              mode="outlined"
              labelStyle={typography.body}
              inputStyle={typography.body}
            />

            {renderImagePicker('logo', logo, setLogo, 'image-plus')}
            {renderImagePicker('signature', signature, setSignature, 'signature-freehand')}
            {renderImagePicker('stamp', stamp, setStamp, 'seal')}

          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>{t('app_preferences')}</Title>
            <View style={styles.preferenceItem}>
              <Text style={styles.preferenceLabel}>{t('language')}</Text>
              <View style={styles.languageButtons}>
                <Button mode={locale === 'en' ? 'contained' : 'outlined'} onPress={() => setLanguage('en')} style={styles.languageButton} labelStyle={typography.button}>
                  {t('english')}
                </Button>
                <Button mode={locale === 'fr' ? 'contained' : 'outlined'} onPress={() => setLanguage('fr')} style={styles.languageButton} labelStyle={typography.button}>
                  {t('french')}
                </Button>
              </View>
            </View>
            <Divider style={styles.divider} />
            <View style={styles.preferenceItem}>
              <Text style={styles.preferenceLabel}>{t('theme')}</Text>
              <Switch value={isDarkMode} onValueChange={toggleTheme} />
            </View>
          </Card.Content>
        </Card>

        <Button mode="contained" onPress={handleSave} style={styles.saveButton} icon="content-save" disabled={loading} labelStyle={typography.button}>
          {loading ? <ActivityIndicator color={colors.onPrimary} /> : t('save')}
        </Button>
      </ScrollView>

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={hideDialog} style={{ borderRadius: 8}}>
          <Dialog.Title>{t('delete_image_title')}</Dialog.Title>
          <Dialog.Content>
            <Paragraph>{t('delete_image_confirm')}</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideDialog}>{t('cancel')}</Button>
            <Button onPress={handleDeleteImage} color={colors.error}>{t('delete')}</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: t('dismiss'),
          onPress: () => {
            setSnackbarVisible(false);
          },
        }}
      >
        {t('settings_saved_successfully')}
      </Snackbar>
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
  cardTitle: {
    ...typography.h3,
    marginBottom: 15,
  },
  input: {
    marginBottom: 15,
  },
  imagePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    justifyContent: 'space-between',
  },
  imageButton: {
    flex: 1,
    marginRight: 10,
  },
  previewContainer: {
    position: 'relative',
  },
  previewImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 40,
  },
  deleteButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  preferenceLabel: {
    ...typography.body,
  },
  languageButtons: {
    flexDirection: 'row',
  },
  languageButton: {
    marginHorizontal: 5,
  },
  divider: {
    marginVertical: 10,
  },
  saveButton: {
    marginTop: 20,
    paddingVertical: 10,
  },
});

export default SettingsScreen;