import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  multiGet: jest.fn(),
  multiSet: jest.fn(),
  multiRemove: jest.fn(),
}));

// Import the version check logic (will be created in T015)
// For now, we'll test the logic directly
const LAST_VERSION_SEEN_KEY = 'last_version_seen';
const LEGACY_KEY = 'whats_new_v3_seen';

const checkVersionAndShowModal = async (currentVersion) => {
  const lastVersionSeen = await AsyncStorage.getItem(LAST_VERSION_SEEN_KEY);
  const legacyKey = await AsyncStorage.getItem(LEGACY_KEY);

  // Handle legacy key migration
  if (legacyKey === 'true' && !lastVersionSeen) {
    await AsyncStorage.setItem(LAST_VERSION_SEEN_KEY, currentVersion);
    await AsyncStorage.removeItem(LEGACY_KEY);
    return true; // Show modal for migration case
  }

  // Fresh install or version changed
  if (!lastVersionSeen || lastVersionSeen !== currentVersion) {
    return true; // Show modal
  }

  return false; // Don't show modal
};

const dismissModal = async (currentVersion) => {
  await AsyncStorage.setItem(LAST_VERSION_SEEN_KEY, currentVersion);
  const legacyKey = await AsyncStorage.getItem(LEGACY_KEY);
  if (legacyKey) {
    await AsyncStorage.removeItem(LEGACY_KEY);
  }
};

describe('Version Check Logic', () => {
  const currentVersion = '3.0.0';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Fresh Install', () => {
    it('shows modal when last_version_seen is null (fresh install)', async () => {
      AsyncStorage.getItem.mockResolvedValue(null);

      const shouldShowModal = await checkVersionAndShowModal(currentVersion);

      expect(shouldShowModal).toBe(true);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('last_version_seen');
    });
  });

  describe('Same Version', () => {
    it('hides modal when last_version_seen equals current version', async () => {
      AsyncStorage.getItem.mockResolvedValue('3.0.0');

      const shouldShowModal = await checkVersionAndShowModal('3.0.0');

      expect(shouldShowModal).toBe(false);
    });
  });

  describe('Version Skip Scenario (FR-008)', () => {
    it('shows modal when last_version_seen is older than current version', async () => {
      AsyncStorage.getItem.mockResolvedValue('2.1.0');

      const shouldShowModal = await checkVersionAndShowModal('3.0.0');

      expect(shouldShowModal).toBe(true);
    });

    it('shows modal when skipping multiple versions (e.g., 2.0 to 3.0)', async () => {
      AsyncStorage.getItem.mockResolvedValue('2.0.0');

      const shouldShowModal = await checkVersionAndShowModal('3.0.0');

      expect(shouldShowModal).toBe(true);
    });
  });

  describe('Legacy Key Migration', () => {
    it('migrates from legacy key whats_new_v3_seen to last_version_seen', async () => {
      AsyncStorage.getItem.mockImplementation((key) => {
        if (key === 'last_version_seen') return Promise.resolve(null);
        if (key === 'whats_new_v3_seen') return Promise.resolve('true');
        return Promise.resolve(null);
      });

      const shouldShowModal = await checkVersionAndShowModal('3.0.0');

      expect(shouldShowModal).toBe(true);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('last_version_seen', '3.0.0');
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('whats_new_v3_seen');
    });

    it('does not migrate if last_version_seen already exists', async () => {
      AsyncStorage.getItem.mockImplementation((key) => {
        if (key === 'last_version_seen') return Promise.resolve('3.0.0');
        if (key === 'whats_new_v3_seen') return Promise.resolve('true');
        return Promise.resolve(null);
      });

      const shouldShowModal = await checkVersionAndShowModal('3.0.0');

      expect(shouldShowModal).toBe(false);
      expect(AsyncStorage.setItem).not.toHaveBeenCalledWith('last_version_seen', expect.anything());
      expect(AsyncStorage.removeItem).not.toHaveBeenCalledWith('whats_new_v3_seen');
    });
  });

  describe('Dismiss Modal', () => {
    it('saves current version to last_version_seen on dismiss', async () => {
      await dismissModal('3.0.0');

      expect(AsyncStorage.setItem).toHaveBeenCalledWith('last_version_seen', '3.0.0');
    });

    it('removes legacy key on dismiss if it exists', async () => {
      AsyncStorage.getItem.mockResolvedValue('true');

      await dismissModal('3.0.0');

      expect(AsyncStorage.setItem).toHaveBeenCalledWith('last_version_seen', '3.0.0');
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('whats_new_v3_seen');
    });
  });

  describe('Performance (NFR-001)', () => {
    it('completes version check within 100ms', async () => {
      AsyncStorage.getItem.mockResolvedValue('2.1.0');

      const startTime = Date.now();
      await checkVersionAndShowModal('3.0.0');
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(100);
    });
  });
});
