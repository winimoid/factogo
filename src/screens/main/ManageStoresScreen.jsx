import React, { useCallback, useContext, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { FAB, Text, ActivityIndicator, useTheme, Dialog, Portal, Button } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { useStore } from '../../contexts/StoreContext';
import { archiveStore } from '../../services/StoreService';
import StoreListItem from '../../components/store/StoreListItem';
import { LanguageContext } from '../../contexts/LanguageContext';

const ManageStoresScreen = ({ navigation }) => {
  const { t } = useContext(LanguageContext);
  const { colors } = useTheme();
  const { stores, refreshStores, loading } = useStore();
  const [dialogVisible, setDialogVisible] = useState(false);
  const [storeToDelete, setStoreToDelete] = useState(null);

  useFocusEffect(
    useCallback(() => {
      refreshStores();
    }, [])
  );

  const handleEdit = (store) => {
    navigation.navigate('EditStore', { storeId: store.storeId });
  };

  const handleDelete = (store) => {
    setStoreToDelete(store);
    setDialogVisible(true);
  };

  const hideDialog = () => {
    setStoreToDelete(null);
    setDialogVisible(false);
  };

  const confirmDelete = async () => {
    if (storeToDelete) {
      await archiveStore(storeToDelete.storeId);
      refreshStores();
    }
    hideDialog();
  };

  if (loading) {
    return <ActivityIndicator animating={true} style={styles.loader} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {stores.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text>{t('no_stores_found')}</Text>
        </View>
      ) : (
        <FlatList
          data={stores}
          keyExtractor={(item) => item.storeId.toString()}
          renderItem={({ item }) => (
            <StoreListItem store={item} onEdit={handleEdit} onDelete={handleDelete} />
          )}
        />
      )}
      <FAB
        style={[styles.fab, { backgroundColor: colors.primary }]}
        icon="plus"
        onPress={() => navigation.navigate('EditStore')}
      />
      <Portal>
        <Dialog visible={dialogVisible} onDismiss={hideDialog} style={{ borderRadius: 8 }}>
          <Dialog.Title>{t('archive_store_title')}</Dialog.Title>
          <Dialog.Content>
            <Text>{t('archive_store_message', { storeName: storeToDelete?.name })}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideDialog}>{t('cancel')}</Button>
            <Button onPress={confirmDelete} style={{ marginLeft: 8 }}>{t('archive')}</Button>
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
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default ManageStoresScreen;
