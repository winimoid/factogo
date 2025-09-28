import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStoresForUser } from '../services/StoreService'; 

const StoreContext = createContext();

export const StoreProvider = ({ children, userId }) => {
  const [stores, setStores] = useState([]);
  const [activeStore, setActiveStore] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStores = async () => {
      if (!userId) {
        setLoading(false);
        return;
      };
      
      try {
        setLoading(true);
        const userStores = await getStoresForUser(userId);
        setStores(userStores);

        const lastActiveStoreId = await AsyncStorage.getItem(`@activeStore_${userId}`);
        
        if (lastActiveStoreId) {
          const lastActive = userStores.find(s => s.storeId === parseInt(lastActiveStoreId, 10));
          if (lastActive) {
            setActiveStore(lastActive);
          } else if (userStores.length > 0) {
            setActiveStore(userStores[0]);
          }
        } else if (userStores.length > 0) {
          setActiveStore(userStores[0]);
        }
      } catch (error) {
        console.error("Failed to load stores", error);
      } finally {
        setLoading(false);
      }
    };

    loadStores();
  }, [userId]);

  const switchStore = async (store) => {
    setActiveStore(store);
    if (store) {
      await AsyncStorage.setItem(`@activeStore_${userId}`, store.storeId.toString());
    } else {
      await AsyncStorage.removeItem(`@activeStore_${userId}`);
    }
  };

  const refreshStores = async () => {
    if (!userId) return;
    try {
      const userStores = await getStoresForUser(userId);
      setStores(userStores);

      // If there is an active store, find its updated version in the new list.
      if (activeStore) {
        const updatedActiveStore = userStores.find(s => s.storeId === activeStore.storeId);
        if (updatedActiveStore) {
          // If found, update the activeStore state with the fresh data.
          setActiveStore(updatedActiveStore);
        } else {
          // If the old active store no longer exists (e.g., archived), set a new default.
          const newActive = userStores.length > 0 ? userStores[0] : null;
          switchStore(newActive);
        }
      } else if (userStores.length > 0) {
        // If there was no active store, set one.
        switchStore(userStores[0]);
      }
    } catch (error) {
      console.error("Failed to refresh stores", error);
    }
  };

  return (
    <StoreContext.Provider value={{ stores, activeStore, switchStore, refreshStores, loading }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => useContext(StoreContext);
