import React, { useContext } from 'react';
import { View, StyleSheet, ScrollView, Linking } from 'react-native';
import { Button, useTheme, Text, Card, Title, Paragraph, Divider } from 'react-native-paper';
import { LanguageContext } from '../../contexts/LanguageContext';
import { AuthContext } from '../../contexts/AuthContext';
import { version as appVersion, lastupdate as lastUpdate } from '../../../package.json';
import { typography } from '../../styles/typography';

const ProfileScreen = () => {
  const { t } = useContext(LanguageContext);
  const { colors } = useTheme();
  const { user, setIsAuthenticated } = useContext(AuthContext);

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  const openURL = (url) => {
    Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Title style={styles.headerTitle}>{t('profile')}</Title>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>{t('user_information')}</Title>
            <Paragraph style={styles.paragraph}>{t('username_label')} {user?.username}</Paragraph>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>{t('app_information')}</Title>
            <Paragraph style={styles.paragraph}>{t('app_name_label')} Facto-Go</Paragraph>
            <Paragraph style={styles.paragraph}>{t('version_label')} {appVersion}</Paragraph>
            <Paragraph style={styles.paragraph}>{t('last_update_label')} {lastUpdate}</Paragraph>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>{t('about_developer')}</Title>
            <Paragraph style={styles.paragraph}>{'Mhénsa Moïse WINIGAH'}</Paragraph>
            <Paragraph style={styles.paragraph}>{'Email: moisewinigah@gmail.com'}</Paragraph>
            <Paragraph style={styles.paragraph}>{'Lomé, Togo'}</Paragraph>
            <Divider style={styles.divider} />
            <Button icon="web" mode="outlined" onPress={() => openURL('https://virtualayers.netlify.app')} style={styles.websiteButton}>
              {t('developer_website')}
            </Button>
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
  divider: {
    marginVertical: 15,
  },
  websiteButton: {
    marginTop: 10,
  }
});

export default ProfileScreen;