import React, { useState, useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, ActivityIndicator, Portal, Dialog, RadioButton, Text, TouchableRipple } from 'react-native-paper';
import { useStore } from '../../contexts/StoreContext';
import { LanguageContext } from '../../contexts/LanguageContext';
import { typography } from '../../styles/typography';

const StoreSwitcher = () => {
  const { stores, activeStore, switchStore, loading } = useStore();
  const { t } = useContext(LanguageContext);
  const [visible, setVisible] = useState(false);

  const openDialog = () => setVisible(true);
  const closeDialog = () => setVisible(false);

  const handleSelectStore = (storeId) => {
    const selectedStore = stores.find(s => s.storeId === storeId);
    if (selectedStore) {
      switchStore(selectedStore);
    }
    closeDialog();
  };

  if (loading) {
    return <ActivityIndicator animating={true} />;
  }

  if (!activeStore) {
    return (
      <Button icon="store-alert-outline" mode="contained" onPress={() => { /* Navigate to create store screen */ }}>
        {t('create_store')}
      </Button>
    );
  }

  return (
    <>
      <Button onPress={openDialog} icon="store" labelStyle={typography.button}>
        {activeStore.name}
      </Button>

      <Portal>
        <Dialog visible={visible} onDismiss={closeDialog} style={{ borderRadius: 8 }}>
          <Dialog.Title style={styles.dialogTitle}>{t('manage_stores')}</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group 
              onValueChange={handleSelectStore} 
              value={activeStore?.storeId}
            >
              {stores.filter(s => s.status === 'active').map(store => (
                <TouchableRipple key={store.storeId} onPress={() => handleSelectStore(store.storeId)}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }}>
                    <RadioButton.Android value={store.storeId} />
                    <Text style={styles.dialogParagraph}>{store.name}</Text>
                  </View>
                </TouchableRipple>
              ))}
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={closeDialog}>{t('cancel')}</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
};

const styles = StyleSheet.create({
  dialogTitle: { ...typography.h3 },
  dialogParagraph: { ...typography.body },
});

export default StoreSwitcher;