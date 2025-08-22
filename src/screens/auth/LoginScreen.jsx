
import React, { useState, useContext } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { TextInput, Button, Text, useTheme, Card, Title, Snackbar, ActivityIndicator } from 'react-native-paper';
import { LanguageContext } from '../../contexts/LanguageContext';
import { AuthContext } from '../../contexts/AuthContext';
import { addUser, getUser } from '../../services/Database';
import { typography } from '../../styles/typography';

const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const { t } = useContext(LanguageContext);
  const { colors } = useTheme();
  const { setIsAuthenticated } = useContext(AuthContext);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const user = await getUser(username);
      if (user && user.password === password) {
        setIsAuthenticated(true);
      } else {
        // For simplicity, we'll create a new user if they don't exist
        if (!user) {
          await addUser(username, password);
          setIsAuthenticated(true);
        } else {
          setSnackbarMessage(t('invalid_credentials'));
          setSnackbarVisible(true);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Image source={require('../../assets/images/logo.png')} style={styles.logo} />
      <Title style={styles.appTitle}>{t('app_title')}</Title>
      <Text style={styles.slogan}>{t('app_slogan')}</Text>

      <Card style={styles.card} elevation={4}>
        <Card.Content>
          <TextInput
            label={t('username')}
            value={username}
            onChangeText={setUsername}
            style={styles.input}
            mode="outlined"
            labelStyle={typography.body}
            inputStyle={typography.body}
            left={<TextInput.Icon icon="account-outline" />}
          />
          <TextInput
            label={t('password')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
            mode="outlined"
            labelStyle={typography.body}
            inputStyle={typography.body}
            left={<TextInput.Icon icon="lock-outline" />}
          />
          <Button mode="contained" onPress={handleLogin} style={styles.button} labelStyle={typography.button} icon="login" disabled={loading}>
            {loading ? <ActivityIndicator color={colors.onPrimary} /> : t('login')}
          </Button>
        </Card.Content>
      </Card>

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
        {snackbarMessage}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  appTitle: {
    ...typography.h1,
    marginBottom: 10,
  },
  slogan: {
    ...typography.body,
    color: 'gray',
    marginBottom: 30,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    padding: 10,
    borderRadius: 10,
  },
  input: {
    marginBottom: 15,
    borderRadius: 8,
  },
  button: {
    marginTop: 10,
    paddingVertical: 8,
  },
});

export default LoginScreen;
