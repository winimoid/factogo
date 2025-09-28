import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { TextInput, Button, Card, useTheme, Text, Title } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchImageLibrary } from 'react-native-image-picker';
import fs from 'react-native-fs';
import { useStore } from '../../contexts/StoreContext';
import { getStore, createStore, updateStore } from '../../services/StoreService';
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
  const [customTexts, setCustomTexts] = useState('');
  const [loading, setLoading] = useState(false);

  const isEditing = storeId !== undefined;

  useEffect(() => {
    if (isEditing) {
      const loadStore = async () => {
        setLoading(true);
        const store = await getStore(storeId);
        if (store) {
          setName(store.name);
          setLogoUrl(store.logoUrl || null);
          setSignatureUrl(store.signatureUrl || null);
          setStampUrl(store.stampUrl || null);
          setCustomTexts(store.customTexts || '');
        }
        setLoading(false);
      };
      loadStore();
    }
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
    const storeData = { name, logoUrl, signatureUrl, stampUrl, customTexts };
    
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
        <Button icon={icon} mode="outlined" onPress={() => selectImage(setter)} style={styles.imageButton}>
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
          
          {renderImagePicker(t('logo'), logoUrl, setLogoUrl, 'image-plus')}
          {renderImagePicker(t('signature'), signatureUrl, setSignatureUrl, 'signature-freehand')}
          {renderImagePicker(t('stamp'), stampUrl, setStampUrl, 'seal')}

          <TextInput
            label={t('custom_texts_json')}
            value={customTexts}
            onChangeText={setCustomTexts}
            style={styles.input}
            mode="outlined"
            labelStyle={typography.body}
            inputStyle={typography.body}
            multiline
            numberOfLines={4}
            disabled={loading}
          />
        </Card.Content>
        <Card.Actions>
          <Button onPress={() => navigation.goBack()} disabled={loading}>{t('cancel')}</Button>
          <Button onPress={handleSave} loading={loading} disabled={loading} mode="contained">{t('save')}</Button>
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
