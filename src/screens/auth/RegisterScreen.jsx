
import React, { useState, useContext } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { TextInput, Button, Text, useTheme, Card, Title, Snackbar, ActivityIndicator } from 'react-native-paper';
import { LanguageContext } from '../../contexts/LanguageContext';
import { AuthContext } from '../../contexts/AuthContext';
import { addUser } from '../../services/Database';
import { version as appVersion } from '../../../package.json';
import { typography } from '../../styles/typography';

const RegisterScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const { t } = useContext(LanguageContext);
  const { colors } = useTheme();

  const validateForm = () => {
    let isValid = true;

    // Validate username
    if (!username || username.trim() === '') {
      setUsernameError(t('username_required'));
      isValid = false;
    } else if (username.trim().length < 3) {
      setUsernameError(t('username_min_length'));
      isValid = false;
    } else {
      setUsernameError('');
    }

    // Validate password
    if (!password || password.trim() === '') {
      setPasswordError(t('password_required'));
      isValid = false;
    } else if (password.trim().length < 4) {
      setPasswordError(t('password_min_length'));
      isValid = false;
    } else {
      setPasswordError('');
    }

    return isValid;
  };

  const handleRegister = async () => {
    // Validate before proceeding
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await addUser(username.trim(), password.trim());
      setSnackbarMessage(t('user_registered_successfully'));
      setSnackbarVisible(true);
      setTimeout(() => {
        navigation.navigate('Login');
      }, 2000);
    } catch (error) {
      setSnackbarMessage(t('error_registering_user'));
      setSnackbarVisible(true);
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
            onChangeText={(text) => {
              setUsername(text);
              if (usernameError) setUsernameError('');
            }}
            error={!!usernameError}
            helperText={usernameError}
            style={styles.input}
            mode="outlined"
            labelStyle={typography.body}
            inputStyle={typography.body}
            left={<TextInput.Icon icon="account-outline" />}
          />
          <TextInput
            label={t('password')}
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (passwordError) setPasswordError('');
            }}
            error={!!passwordError}
            helperText={passwordError}
            secureTextEntry
            style={styles.input}
            mode="outlined"
            labelStyle={typography.body}
            inputStyle={typography.body}
            left={<TextInput.Icon icon="lock-outline" />}
          />
          <Button mode="contained" onPress={handleRegister} style={styles.button} labelStyle={typography.button} icon="account-plus" disabled={loading}>
            {loading ? <ActivityIndicator color={colors.onPrimary} /> : t('register')}
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

      <Text style={styles.versionText}>v{appVersion}</Text>
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
  versionText: {
    position: 'absolute',
    bottom: 20,
    fontSize: 12,
    color: 'gray',
    textAlign: 'center',
  },
});

export default RegisterScreen;
