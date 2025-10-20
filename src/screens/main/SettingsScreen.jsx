import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { TextInput, Button, Text, Switch, useTheme, Card, Title, Paragraph, Snackbar, Divider, ActivityIndicator, Portal, Dialog, RadioButton, TouchableRipple } from 'react-native-paper';
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
  const [headerText, setHeaderText] = useState('');
  const [footerText, setFooterText] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [languageDialogVisible, setLanguageDialogVisible] = useState(false);
  const [imageToDelete, setImageToDelete] = useState({ setter: null });

  const availableLanguages = [
    { code: 'en', name: t('english') },
    { code: 'fr', name: t('french') },
    { code: 'ee', name: t('ewe') },
    { code: 'it', name: t('italian') },
    { code: 'es', name: t('spanish') },
    { code: 'ja', name: t('japanese') },
  ];

  useEffect(() => {
    if (activeStore) {
      setStoreName(activeStore.name);
      setLogo(activeStore.logoUrl);
      if (activeStore.customTexts) {
        try {
          const parsedTexts = JSON.parse(activeStore.customTexts);
          setHeaderText(parsedTexts.header || '');
          setFooterText(parsedTexts.footer || '');
        } catch (e) {
          setHeaderText(activeStore.customTexts);
          setFooterText('');
        }
      } else {
        setHeaderText('');
        setFooterText('');
      }
    }
  }, [activeStore]);

  const handleSave = async () => {
    if (!activeStore) return;
    setLoading(true);
    try {
      const customTexts = JSON.stringify({ header: headerText, footer: footerText });
      const updatedStore = { ...activeStore, name: storeName, logoUrl: logo, customTexts };
      await updateStore(activeStore.storeId, updatedStore);
      switchStore(updatedStore);
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
    setDeleteDialogVisible(true);
  };

  const hideDeleteDialog = () => {
    setDeleteDialogVisible(false);
    setImageToDelete({ setter: null });
  };

  const handleDeleteImage = () => {
    if (imageToDelete.setter) {
      imageToDelete.setter(null);
    }
    hideDeleteDialog();
  };

  const handleLanguageSelect = (selectedLocale) => {
    setLanguage(selectedLocale);
    setLanguageDialogVisible(false);
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

  const currentLanguageName = availableLanguages.find(lang => lang.code === locale)?.name || locale;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Title style={styles.headerTitle}>{t('settings')}</Title>

        {/* Company Information Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>{t('company_information')}</Title>
            <TextInput label={t('company_name')} value={storeName} onChangeText={setStoreName} style={styles.input} mode="outlined" />
            <TextInput label={t('header_text')} value={headerText} onChangeText={setHeaderText} style={styles.input} mode="outlined" multiline numberOfLines={3} />
            <TextInput label={t('footer_text')} value={footerText} onChangeText={setFooterText} style={styles.input} mode="outlined" multiline numberOfLines={3} />
            {renderImagePicker('logo', logo, setLogo, 'image-plus')}
          </Card.Content>
        </Card>

        {/* Management Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>{t('management')}</Title>
            <Button icon="store" mode="contained" onPress={() => navigation.navigate('ManageStores')} style={styles.managementButton} labelStyle={typography.button}>
              {t('manage_stores')}
            </Button>
            <Button icon="file-document" mode="contained" onPress={() => navigation.navigate('ManageTemplates')} labelStyle={typography.button}>
              {t('manage_templates')}
            </Button>
          </Card.Content>
        </Card>

        {/* App Preferences Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>{t('app_preferences')}</Title>
            <TouchableRipple onPress={() => setLanguageDialogVisible(true)}>
              <View style={styles.preferenceItem}>
                <Text style={styles.preferenceLabel}>{t('language')}</Text>
                <Text style={styles.preferenceValue}>{currentLanguageName}</Text>
              </View>
            </TouchableRipple>
            <Divider style={styles.divider} />
            <View style={styles.preferenceItem}>
              <Text style={styles.preferenceLabel}>{t('theme')}</Text>
              <Switch value={isDarkMode} onValueChange={toggleTheme} />
            </View>
          </Card.Content>
        </Card>

        {/* Theme Colors Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>{t('app_theme_colors')}</Title>
            <View style={styles.themeSelectionContainer}>
              {themes.map((themeItem) => (
                <TouchableOpacity
                  key={themeItem.name}
                  style={[ styles.themeOption, currentThemeColors.name === themeItem.name && { borderColor: colors.primary, borderWidth: 2 }]}
                  onPress={() => setAppThemeColors(themeItem)}
                >
                  <View style={[ styles.colorPreview, { backgroundColor: themeItem.primary }]} />
                  <View style={[ styles.colorPreview, { backgroundColor: themeItem.secondary }]} />
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

      <Snackbar visible={snackbarVisible} onDismiss={() => setSnackbarVisible(false)} duration={3000}>
        {t('settings_saved_successfully')}
      </Snackbar>

      {/* Delete Confirmation Dialog */}
      <Portal>
        <Dialog visible={deleteDialogVisible} onDismiss={hideDeleteDialog} style={{ borderRadius: 8 }}>
          <Dialog.Title>{t('delete_image_title')}</Dialog.Title>
          <Dialog.Content><Paragraph>{t('delete_image_confirm')}</Paragraph></Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideDeleteDialog}>{t('cancel')}</Button>
            <Button onPress={handleDeleteImage} buttonColor={colors.error}>{t('delete')}</Button>
          </Dialog.Actions>
        </Dialog>

        {/* Language Selection Dialog */}
        <Dialog visible={languageDialogVisible} onDismiss={() => setLanguageDialogVisible(false)} style={{ borderRadius: 8 }}>
          <Dialog.Title>{t('select_language')}</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group onValueChange={handleLanguageSelect} value={locale}>
              {availableLanguages.map(lang => (
                <TouchableRipple key={lang.code} onPress={() => handleLanguageSelect(lang.code)}>
                  <View style={styles.languageOption}>
                    <RadioButton.Android value={lang.code} />
                    <Text style={styles.languageOptionText}>{lang.name}</Text>
                  </View>
                </TouchableRipple>
              ))}
            </RadioButton.Group>
          </Dialog.Content>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20 },
  headerTitle: { ...typography.h2, textAlign: 'center', marginBottom: 25 },
  card: { marginBottom: 20, elevation: 4, borderRadius: 8 },
  cardTitle: { ...typography.h3, marginBottom: 15 },
  input: { marginBottom: 15 },
  imagePickerContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, justifyContent: 'space-between' },
  imageButton: { flex: 1, marginRight: 10 },
  previewContainer: { position: 'relative', width: 80, height: 80 },
  previewImage: { width: 80, height: 80, resizeMode: 'contain', borderWidth: 1, borderColor: '#ddd', borderRadius: 50 },
  deleteButton: { position: 'absolute', top: -10, right: -10, backgroundColor: 'white', borderRadius: 12, padding: 2 },
  managementButton: { marginBottom: 10 },
  preferenceItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15 },
  preferenceLabel: { ...typography.body, fontSize: 16 },
  preferenceValue: { ...typography.body, fontSize: 16, color: '#888' },
  languageOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  languageOptionText: { ...typography.body, marginLeft: 10, fontSize: 16 },
  divider: { marginVertical: 5 },
  saveButton: { marginTop: 20, paddingVertical: 10 },
  themeSelectionContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around', marginTop: 10 },
  themeOption: { alignItems: 'center', padding: 10, margin: 5, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, width: '45%' },
  colorPreview: { width: 30, height: 30, borderRadius: 15, marginBottom: 5, borderWidth: 1, borderColor: '#eee' },
  themeOptionText: { ...typography.body, marginTop: 5, textAlign: 'center' },
});

export default SettingsScreen;
