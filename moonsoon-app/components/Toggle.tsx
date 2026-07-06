import { Pressable, View } from 'react-native';

// The 40×22 pill is the single sanctioned rounded element in the app.
export function Toggle({
  on,
  onChange,
  accent,
  border,
}: {
  on: boolean;
  onChange: () => void;
  accent: string;
  border: string;
}) {
  return (
    <Pressable
      onPress={onChange}
      style={{
        width: 40,
        height: 22,
        borderRadius: 11,
        backgroundColor: on ? accent : border,
        padding: 2,
        alignItems: on ? 'flex-end' : 'flex-start',
        justifyContent: 'center',
      }}>
      <View
        style={{
          width: 18,
          height: 18,
          borderRadius: 9,
          backgroundColor: '#FFFFFF',
        }}
      />
    </Pressable>
  );
}
