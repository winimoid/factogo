import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { TextInput, Button, Text, Switch, useTheme, Card, Title, Paragraph, Snackbar, Divider, ActivityIndicator, Portal, Dialog } from 'react-native-paper';
import { LanguageContext } from '../../contexts/LanguageContext';
import { ThemeContext } from '../../contexts/ThemeContext';
import { useStore } from '../../contexts/StoreContext';
import { updateStore } from '../../services/StoreService';
import { launchImageLibrary } from 'react-native-image-picker';
import fs from 'react-native-fs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { typography } from '../../styles/typography';

const SettingsScreen = ({ navigation }) => {
  const { t, setLanguage, locale } = useContext(LanguageContext);
  const { toggleTheme, isDarkMode, setAppThemeColors, themes, currentThemeColors } = useContext(ThemeContext);
  const { activeStore, switchStore } = useStore();
  const { colors } = useTheme();

  const [storeName, setStoreName] = useState('');
  const [logo, setLogo] = useState(null);
  const [customTexts, setCustomTexts] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const [dialogVisible, setDialogVisible] = useState(false);
  const [imageToDelete, setImageToDelete] = useState({ setter: null });

  useEffect(() => {
    if (activeStore) {
      setStoreName(activeStore.name);
      setLogo(activeStore.logoUrl);
      setCustomTexts(activeStore.customTexts);
    }
  }, [activeStore]);

  const handleSave = async () => {
    if (!activeStore) return;
    setLoading(true);
    try {
      const updatedStore = { ...activeStore, name: storeName, logoUrl: logo, customTexts };
      await updateStore(activeStore.storeId, updatedStore);
      switchStore(updatedStore); // Update the active store in the context
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
              value={storeName}
              onChangeText={setStoreName}
              style={styles.input}
              mode="outlined"
              labelStyle={typography.body}
              inputStyle={typography.body}
            />
            <TextInput
              label={t('custom_texts_json')}
              value={customTexts}
              onChangeText={setCustomTexts}
              style={styles.input}
              mode="outlined"
              labelStyle={typography.body}
              inputStyle={typography.body}
            />

            {renderImagePicker('logo', logo, setLogo, 'image-plus')}

          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>{t('store_management')}</Title>
            <Button
              icon="store"
              mode="contained"
              onPress={() => navigation.navigate('ManageStores')}
            >
              {t('manage_stores')}
            </Button>
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

        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>{t('app_theme_colors')}</Title>
            <View style={styles.themeSelectionContainer}>
              {themes.map((themeItem) => (
                <TouchableOpacity
                  key={themeItem.name}
                  style={[
                    styles.themeOption,
                    currentThemeColors.name === themeItem.name && { borderColor: colors.primary, borderWidth: 2 },
                  ]}
                  onPress={() => setAppThemeColors(themeItem)}
                >
                  <View
                    style={[
                      styles.colorPreview,
                      { backgroundColor: themeItem.primary },
                    ]}
                  />
                  <View
                    style={[
                      styles.colorPreview,
                      { backgroundColor: themeItem.secondary },
                    ]}
                  />
                  <Text style={styles.themeOptionText}>{themeItem.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card.Content>
        </Card>

        <Button mode="contained" onPress={handleSave} style={styles.saveButton} icon="content-save" disabled={loading} labelStyle={typography.button}>
          {loading ? <ActivityIndicator color={colors.onPrimary} /> : t('save')}
        </Button>
      </ScrollView>

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

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={hideDialog} style={{ borderRadius: 8 }}>
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
    width: 80,
    height: 80,
  },
  previewImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 50,
  },
  deleteButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 2,
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
  themeSelectionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  themeOption: {
    alignItems: 'center',
    padding: 10,
    margin: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    width: '45%',
  },
  colorPreview: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: '#eee',
  },
  themeOptionText: {
    ...typography.body,
    marginTop: 5,
    textAlign: 'center',
  },
});

export default SettingsScreen;
