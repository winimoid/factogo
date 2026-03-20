import React from 'react';
import { Portal, Dialog, List, Button, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

/**
 * WhatsNewModal - Displays a summary of new features on first launch after update
 * 
 * @param {boolean} visible - Controls modal visibility
 * @param {function} onDismiss - Callback when user dismisses the modal
 * @param {string} version - App version to display in title
 */
const WhatsNewModal = ({ visible, onDismiss, version }) => {
  const { t } = useTranslation();
  const theme = useTheme();

  if (!visible) {
    return null;
  }

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={{ borderRadius: 8 }}>
        <Dialog.Title style={{ fontSize: 22, fontWeight: 'bold', textAlign: 'center' }}>
          {t('whats_new_title', { version })}
        </Dialog.Title>
        
        <Dialog.Content>
          {/* Feature 1: Down Payment Management */}
          <List.Item
            title={t('deposit')}
            description={t('whats_new_deposit')}
            left={(props) => (
              <List.Icon {...props} icon="cash-multiple" color={theme.colors.primary} />
            )}
            titleStyle={{ fontWeight: '600' }}
          />
          
          {/* Feature 2: Customizable VAT/GST */}
          <List.Item
            title={t('gst_label')}
            description={t('whats_new_gst')}
            left={(props) => (
              <List.Icon {...props} icon="percent" color={theme.colors.primary} />
            )}
            titleStyle={{ fontWeight: '600' }}
          />
          
          {/* Feature 3: Auto-fill Customer Suggestions */}
          <List.Item
            title={t('customer_suggestions')}
            description={t('whats_new_suggestions')}
            left={(props) => (
              <List.Icon {...props} icon="account-search" color={theme.colors.primary} />
            )}
            titleStyle={{ fontWeight: '600' }}
          />
        </Dialog.Content>
        
        <Dialog.Actions>
          <Button 
            onPress={onDismiss} 
            mode="contained"
            style={{ paddingHorizontal: 24 }}
            labelStyle={{ fontWeight: '600', fontSize: 16 }}
          >
            {t('lets_go')}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

export default WhatsNewModal;
