import React, { useState, useEffect, useContext } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { TextInput, Button, Card, useTheme, Title } from 'react-native-paper';
import { getDocumentTemplate, createDocumentTemplate, updateDocumentTemplate } from '../../services/DocumentTemplateService';
import { LanguageContext } from '../../contexts/LanguageContext';
import { typography } from '../../styles/typography';

const EditTemplateScreen = ({ route, navigation }) => {
  const { templateId } = route.params || {};
  const { t } = useContext(LanguageContext);
  const { colors } = useTheme();

  const [name, setName] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [loading, setLoading] = useState(false);

  const isEditing = templateId !== undefined;

  useEffect(() => {
    const loadTemplate = async () => {
      if (isEditing) {
        setLoading(true);
        const template = await getDocumentTemplate(templateId);
        if (template) {
          setName(template.name);
          setHtmlContent(template.htmlContent);
        }
        setLoading(false);
      }
    };
    loadTemplate();
  }, [templateId, isEditing]);

  const handleSave = async () => {
    setLoading(true);
    const templateData = { name, htmlContent };
    
    try {
      if (isEditing) {
        await updateDocumentTemplate(templateId, templateData);
      } else {
        await createDocumentTemplate(templateData);
      }
      navigation.goBack();
    } catch (error) {
      console.error("Failed to save template", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollContent}
    >
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>{isEditing ? t('edit_template') : t('create_template')}</Title>
          <TextInput
            label={t('template_name')}
            value={name}
            onChangeText={setName}
            style={styles.input}
            mode="outlined"
            disabled={loading}
            labelStyle={typography.body}
            inputStyle={typography.body}
          />
          <TextInput
            label={t('html_content')}
            value={htmlContent}
            onChangeText={setHtmlContent}
            style={[styles.input, styles.htmlInput]}
            mode="outlined"
            multiline
            numberOfLines={20}
            disabled={loading}
            labelStyle={typography.body}
            inputStyle={typography.body}
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
  htmlInput: {
    height: 400, // Give more space for HTML content
    textAlignVertical: 'top',
  }
});

export default EditTemplateScreen;
