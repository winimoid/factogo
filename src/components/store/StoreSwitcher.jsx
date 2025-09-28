import React, { useState } from 'react';
import { View } from 'react-native';
import { Menu, Button, ActivityIndicator } from 'react-native-paper';
import { useStore } from '../../contexts/StoreContext';

const StoreSwitcher = () => {
  const { stores, activeStore, switchStore, loading } = useStore();
  const [visible, setVisible] = useState(false);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const handleSelectStore = (store) => {
    switchStore(store);
    closeMenu();
  };

  if (loading) {
    return <ActivityIndicator animating={true} />;
  }

  if (!activeStore) {
    return null; // Or a placeholder/message
  }

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
      <Menu
        visible={visible}
        onDismiss={closeMenu}
        anchor={
          <Button onPress={openMenu} icon="store">
            {activeStore ? activeStore.name : "Select a Store"}
          </Button>
        }
      >
        {stores.filter(s => s.status === 'active').map(store => (
          <Menu.Item 
            key={store.storeId} 
            onPress={() => handleSelectStore(store)} 
            title={store.name} 
          />
        ))}
      </Menu>
    </View>
  );
};

export default StoreSwitcher;
