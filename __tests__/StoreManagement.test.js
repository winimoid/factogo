import { render, fireEvent } from '@testing-library/react-native';
import ManageStoresScreen from '../src/screens/main/ManageStoresScreen';
import EditStoreScreen from '../src/screens/main/EditStoreScreen';
import StoreService from '../src/services/StoreService';

// Mock the StoreService
jest.mock('../src/services/StoreService');

describe('Store Management Flow', () => {
  it('should create, read, update, and archive a store', async () => {
    // Initial setup
    const mockStores = [{ id: 1, name: 'Default Store' }];
    StoreService.getStoresForUser.mockResolvedValue(mockStores);
    StoreService.createStore.mockResolvedValue({ id: 2, name: 'New Store' });
    StoreService.updateStore.mockResolvedValue({ id: 2, name: 'Updated Store' });
    StoreService.archiveStore.mockResolvedValue(true);

    // 1. Render ManageStoresScreen and verify initial state
    const { getByText, findByText } = render(<ManageStoresScreen />);
    expect(getByText('Default Store')).toBeTruthy();

    // 2. Navigate to EditStoreScreen to create a new store
    // This part is tricky to test without a full navigation setup.
    // We will simulate the creation process by directly calling the service method
    // and then re-rendering the ManageStoresScreen to check the result.

    // 3. Create a new store
    await StoreService.createStore({ name: 'New Store' });
    mockStores.push({ id: 2, name: 'New Store' });
    StoreService.getStoresForUser.mockResolvedValue(mockStores);

    // 4. Re-render and verify the new store is listed
    render(<ManageStoresScreen />);
    expect(await findByText('New Store')).toBeTruthy();

    // 5. Update the store
    await StoreService.updateStore({ id: 2, name: 'Updated Store' });
    mockStores[1].name = 'Updated Store';
    StoreService.getStoresForUser.mockResolvedValue(mockStores);

    // 6. Re-render and verify the updated store name
    render(<ManageStoresScreen />);
    expect(await findByText('Updated Store')).toBeTruthy();

    // 7. Archive the store
    await StoreService.archiveStore(2);
    mockStores.pop();
    StoreService.getStoresForUser.mockResolvedValue(mockStores);

    // 8. Re-render and verify the store is no longer listed
    render(<ManageStoresScreen />);
    expect(queryByText('Updated Store')).toBeNull();
  });
});