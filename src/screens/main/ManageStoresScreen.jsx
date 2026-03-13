import React, { useCallback, useContext, useState, useEffect } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { FAB, Text, ActivityIndicator, useTheme, Dialog, Portal, Button, Paragraph, List } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useStore } from '../../contexts/StoreContext';
import { archiveStore } from '../../services/StoreService';
import StoreListItem from '../../components/store/StoreListItem';
import { LanguageContext } from '../../contexts/LanguageContext';
import { typography } from '../../styles/typography';

const ManageStoresScreen = ({ navigation }) => {
  const { t } = useContext(LanguageContext);
  const { colors } = useTheme();
  const { stores, refreshStores, loading } = useStore();
  const [dialogVisible, setDialogVisible] = useState(false);
  const [storeToDelete, setStoreToDelete] = useState(null);
  const [whatsNewVisible, setWhatsNewVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        await refreshStores();
      };
      loadData();
    }, [refreshStores])
  );

  useEffect(() => {
    const checkWhatsNew = async () => {
      try {
        const hasSeen = await AsyncStorage.getItem('whats_new_v3_seen');
        if (!hasSeen) {
          setWhatsNewVisible(true);
        }
      } catch (error) {
        console.error('Error checking whats new', error);
      }
    };
    checkWhatsNew();
  }, []);

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

  const dismissWhatsNew = async () => {
    setWhatsNewVisible(false);
    await AsyncStorage.setItem('whats_new_v3_seen', 'true');
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
        {/* Archive Confirmation Dialog */}
        <Dialog visible={dialogVisible} onDismiss={hideDialog} style={{ borderRadius: 8 }}>
          <Dialog.Title style={styles.dialogTitle}>{t('archive_store_title')}</Dialog.Title>
          <Dialog.Content>
            <Paragraph style={styles.dialogParagraph}>{t('archive_store_message', { storeName: storeToDelete?.name })}</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideDialog}>{t('cancel')}</Button>
            <Button onPress={confirmDelete} style={{ marginLeft: 8 }}>{t('archive')}</Button>
          </Dialog.Actions>
        </Dialog>

        {/* What's New Dialog */}
        <Dialog visible={whatsNewVisible} onDismiss={dismissWhatsNew} style={{ borderRadius: 8 }}>
          <Dialog.Title style={styles.dialogTitle}>{t('whats_new_title')}</Dialog.Title>
          <Dialog.Content>
            <List.Item
              title={t('deposit')}
              description={t('whats_new_deposit')}
              left={props => <List.Icon {...props} icon="cash-multiple" />}
            />
            <List.Item
              title={t('gst_label')}
              description={t('whats_new_gst')}
              left={props => <List.Icon {...props} icon="percent" />}
            />
            <List.Item
              title={t('customer_suggestions')}
              description={t('whats_new_suggestions')}
              left={props => <List.Icon {...props} icon="account-search" />}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={dismissWhatsNew}>{t('dismiss')}</Button>
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
  dialogTitle: { ...typography.h3 },
  dialogParagraph: { ...typography.body },
});

export default ManageStoresScreen;
