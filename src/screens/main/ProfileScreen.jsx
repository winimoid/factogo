
import React, { useContext } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, useTheme, Text, Card, Title, Paragraph } from 'react-native-paper';
import { LanguageContext } from '../../contexts/LanguageContext';
import { AuthContext } from '../../contexts/AuthContext';
import { typography } from '../../styles/typography';

const ProfileScreen = () => {
  const { t } = useContext(LanguageContext);
  const { colors } = useTheme();
  const { setIsAuthenticated } = useContext(AuthContext);

  const appVersion = '1.0.0'; // Hardcoded for now, consider using react-native-version-info
  const loggedInUsername = 'user'; // For simplicity, assuming 'user' is logged in

  const handleLogout = () => {
    // In a real app, you would clear the user's session here
    setIsAuthenticated(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Title style={styles.headerTitle}>{t('profile')}</Title>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>{t('user_information')}</Title>
            <Paragraph style={styles.paragraph}>{t('username_label')} {loggedInUsername}</Paragraph>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>{t('app_information')}</Title>
            <Paragraph style={styles.paragraph}>{t('app_name_label')} FactoGo</Paragraph>
            <Paragraph style={styles.paragraph}>{t('version_label')} {appVersion}</Paragraph>
          </Card.Content>
        </Card>

        <Button mode="contained" onPress={handleLogout} style={styles.logoutButton} icon="logout" labelStyle={typography.button}>
          {t('logout')}
        </Button>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.h2,
    textAlign: 'center',
    marginBottom: 25,
  },
  card: {
    width: '100%',
    marginBottom: 20,
    elevation: 4,
    borderRadius: 8,
  },
  cardTitle: {
    ...typography.h3,
    marginBottom: 15,
  },
  paragraph: {
    ...typography.body,
    marginBottom: 5,
  },
  logoutButton: {
    marginTop: 30,
    width: '80%',
    paddingVertical: 10,
  },
});

export default ProfileScreen;
