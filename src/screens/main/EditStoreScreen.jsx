import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { TextInput, Button, Card, useTheme, Text, Title, Menu } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchImageLibrary } from 'react-native-image-picker';
import fs from 'react-native-fs';
import { useStore } from '../../contexts/StoreContext';
import { getStore, createStore, updateStore } from '../../services/StoreService';
import { getDocumentTemplates } from '../../services/DocumentTemplateService';
import { LanguageContext } from '../../contexts/LanguageContext';
import { typography } from '../../styles/typography';

const EditStoreScreen = ({ route, navigation }) => {
  const { storeId } = route.params || {};
  const { t } = useContext(LanguageContext);
  const { colors } = useTheme();
  const { refreshStores } = useStore();

  const [name, setName] = useState('');
  const [logoUrl, setLogoUrl] = useState(null);
  const [signatureUrl, setSignatureUrl] = useState(null);
  const [stampUrl, setStampUrl] = useState(null);
  const [headerText, setHeaderText] = useState('');
  const [footerText, setFooterText] = useState('');
  const [documentTemplateId, setDocumentTemplateId] = useState(1); // Default to 1
  const [templates, setTemplates] = useState([]);
  const [menuVisible, setMenuVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const isEditing = storeId !== undefined;

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      const availableTemplates = await getDocumentTemplates();
      setTemplates(availableTemplates);

      if (isEditing) {
        const store = await getStore(storeId);
        if (store) {
          setName(store.name);
          setLogoUrl(store.logoUrl || null);
          setSignatureUrl(store.signatureUrl || null);
          setStampUrl(store.stampUrl || null);
          setDocumentTemplateId(store.documentTemplateId || 1);
          
          // Handle customTexts parsing
          if (store.customTexts) {
            try {
              const parsedTexts = JSON.parse(store.customTexts);
              setHeaderText(parsedTexts.header || '');
              setFooterText(parsedTexts.footer || '');
            } catch (e) {
              // Fallback for old plain text data
              setHeaderText(store.customTexts);
              setFooterText('');
            }
          } else {
            setHeaderText('');
            setFooterText('');
          }
        }
      }
      setLoading(false);
    };
    loadInitialData();
  }, [storeId, isEditing]);

  const selectImage = (setter) => {
    launchImageLibrary({ mediaType: 'photo' }, async (response) => {
      if (response.didCancel) return;
      if (response.errorCode) {
        console.error('ImagePicker Error: ', response.errorMessage);
        return;
      }
      if (response.assets && response.assets.length > 0) {
        const asset = response.assets[0];
        const newPath = `file://${fs.DocumentDirectoryPath}/${Date.now()}_${asset.fileName}`;
        try {
          await fs.copyFile(asset.uri, newPath);
          setter(newPath);
        } catch (error) {
          console.error(t('error_copying_image'), error);
        }
      }
    });
  };

  const handleSave = async () => {
    setLoading(true);
    const customTexts = JSON.stringify({ header: headerText, footer: footerText });
    const storeData = { name, logoUrl, signatureUrl, stampUrl, customTexts, documentTemplateId };
    
    try {
      if (isEditing) {
        await updateStore(storeId, storeData);
      } else {
        const ownerUserId = 1; // Placeholder - should come from AuthContext
        await createStore({ ...storeData, ownerUserId });
      }
      await refreshStores();
      navigation.goBack();
    } catch (error) {
      console.error("Failed to save store", error);
    } finally {
      setLoading(false);
    }
  };

  const renderImagePicker = (label, imageUri, setter, icon) => (
    <View style={styles.imagePickerContainer}>
      <Text style={styles.imageLabel}>{label}</Text>
      <View style={styles.imageControls}>
        <Button icon={icon} mode="outlined" onPress={() => selectImage(setter)} style={styles.imageButton} labelStyle={typography.button}>
          {imageUri ? t('change') : t('select')}
        </Button>
        {imageUri && (
          <View style={styles.previewContainer}>
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
            <TouchableOpacity onPress={() => setter(null)} style={styles.deleteButton}>
              <Icon name="close-circle" size={24} color={colors.error} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  const selectedTemplateName = templates.find(t => t.templateId === documentTemplateId)?.name || 'Select';

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollContent}
    >
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>{isEditing ? t('edit_store') : t('create_store')}</Title>
          <TextInput
            label={t('store_name')}
            value={name}
            onChangeText={setName}
            style={styles.input}
            mode="outlined"
            labelStyle={typography.body}
            inputStyle={typography.body}
            disabled={loading}
          />

          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <View>
                <Button 
                  mode="outlined" 
                  onPress={() => setMenuVisible(true)} 
                  style={styles.input}
                  icon="file-document-outline"
                  labelStyle={typography.button}
                >
                  {`${t('document_template')}: ${selectedTemplateName}`}
                </Button>
              </View>
            }>
            {templates.map(template => (
              <Menu.Item 
                key={template.templateId}
                onPress={() => {
                  setDocumentTemplateId(template.templateId);
                  setMenuVisible(false);
                }} 
                title={template.name} 
              />
            ))}
          </Menu>
          
          {renderImagePicker(t('logo'), logoUrl, setLogoUrl, 'image-plus')}
          {renderImagePicker(t('signature'), signatureUrl, setSignatureUrl, 'signature-freehand')}
          {renderImagePicker(t('stamp'), stampUrl, setStampUrl, 'seal')}

          <TextInput
            label={t('header_text')}
            value={headerText}
            onChangeText={setHeaderText}
            style={styles.input}
            mode="outlined"
            labelStyle={typography.body}
            inputStyle={typography.body}
            multiline
            numberOfLines={3}
            disabled={loading}
          />
          <TextInput
            label={t('footer_text')}
            value={footerText}
            onChangeText={setFooterText}
            style={styles.input}
            mode="outlined"
            labelStyle={typography.body}
            inputStyle={typography.body}
            multiline
            numberOfLines={3}
            disabled={loading}
          />
        </Card.Content>
        <Card.Actions>
          <Button onPress={() => navigation.goBack()} disabled={loading} labelStyle={typography.button}>{t('cancel')}</Button>
          <Button onPress={handleSave} loading={loading} disabled={loading} mode="contained" labelStyle={typography.button}>{t('save')}</Button>
        </Card.Actions>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
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
    marginBottom: 16,
  },
  imagePickerContainer: {
    marginBottom: 20,
  },
  imageLabel: {
    ...typography.body,
    marginBottom: 8,
  },
  imageControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageButton: {
    flex: 1,
    marginRight: 16,
  },
  previewContainer: {
    position: 'relative',
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  deleteButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: 'white',
    borderRadius: 12,
  },
});

export default EditStoreScreen;
