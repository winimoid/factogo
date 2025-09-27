import { PermissionsAndroid, Platform } from 'react-native';

export const requestAppPermissions = async () => {
    // Vérifier si on est sur Android
    if (Platform.OS === 'android') {
        try {
        // Liste de toutes les permissions nécessaires
        const permissions = [
            // PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            PermissionsAndroid.PERMISSIONS.CAMERA,
        ];

        // Ajouter les permissions média spécifiques à Android 13+ si nécessaire
        if (Platform.Version >= 33) {
            permissions.push(PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES);
            permissions.push(PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO);
            permissions.push(PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO);
        }

        // Demander toutes les permissions en une seule fois
        const results = await PermissionsAndroid.requestMultiple(permissions);

        // Vérifier si toutes les permissions sont accordées
        const allGranted = Object.values(results).every(
            result => result === PermissionsAndroid.RESULTS.GRANTED
        );

        return allGranted;
        } catch (err) {
        console.warn('Erreur demande permissions:', err);
        return false;
        }
    }
    
    // Pour iOS, on retourne true (les permissions se gèrent différemment)
    return true;
};
