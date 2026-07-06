import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';

// Shared bottom sheet: dim backdrop, bottom-anchored panel, zero corner radius.
export function BottomSheetModal({
  visible,
  onClose,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const { palette } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Pressable
          onPress={onClose}
          style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.4)' }]}
        />
        <View
          style={{
            backgroundColor: palette.background,
            borderTopWidth: 0.5,
            borderTopColor: palette.border,
            paddingHorizontal: 32,
            paddingTop: 24,
            paddingBottom: insets.bottom + 24,
          }}>
          {children}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
