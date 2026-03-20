# Component: WhatsNewModal

The `WhatsNewModal` component is responsible for displaying a summary of the most important new features to the user when they first update or install the app.

## Component Properties (Props)
| Prop | Type | Description |
|------|------|-------------|
| `visible` | `boolean` | Controls whether the modal is visible. |
| `onDismiss` | `function` | Callback function triggered when the user clicks the "Let's go!" button or dismisses the modal. |
| `version` | `string` | The version string to display in the title (e.g., "3.0"). |

## Sub-Components Used
- `react-native-paper.Portal`
- `react-native-paper.Dialog`
- `react-native-paper.List.Item` (with `List.Icon`)
- `react-native-paper.Button`

## Content
The modal content is driven by the following translation keys:
- `whats_new_title`: "What's New in Version {{version}} 🚀" (or equivalent)
- `whats_new_deposit`: Description of the new deposit feature.
- `whats_new_gst`: Description of the new GST feature.
- `whats_new_suggestions`: Description of the new customer suggestions feature.
- `lets_go`: "Let's go!"

## Technical Logic (Internal)
- On the `HomeScreen.jsx` level, a `useEffect` hook will check the `last_version_seen` in `AsyncStorage`.
- If a mismatch is detected, the `visible` prop is set to `true`.
- The `onDismiss` callback updates the `last_version_seen` key in `AsyncStorage`.
