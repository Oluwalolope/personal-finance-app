import React, { ReactNode } from 'react';
import { View, Text, Pressable, TextInput, TextInputProps, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { C } from '../theme';

export const Card = ({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) => (
  <View style={[s.card, style]}>{children}</View>
);

export const Title = ({ children }: { children: ReactNode }) => <Text style={s.title}>{children}</Text>;

type Kind = 'primary' | 'ghost' | 'yellow' | 'white';
type BtnProps = { label: string; onPress: () => void; kind?: Kind; style?: StyleProp<ViewStyle> };
const bg: Record<Kind, string> = { primary: C.blue, ghost: C.card2, yellow: C.yellow, white: '#FFFFFF' };
const fg: Record<Kind, string> = { primary: '#FFFFFF', ghost: C.text, yellow: '#2A1C00', white: C.blue };
export const Btn = ({ label, onPress, kind = 'primary', style }: BtnProps) => (
  <Pressable onPress={onPress} style={[s.btn, { backgroundColor: bg[kind] }, style]}>
    <Text style={[s.btnTxt, { color: fg[kind] }]}>{label}</Text>
  </Pressable>
);

export const Field = (props: TextInputProps) => (
  <TextInput placeholderTextColor={C.mute} {...props} style={[s.input, props.style]} />
);

type ChipProps = { label: string; active: boolean; onPress: () => void };
export const Chip = ({ label, active, onPress }: ChipProps) => (
  <Pressable onPress={onPress} style={[s.chip, active && { backgroundColor: C.blue }]}>
    <Text style={{ color: C.text, fontWeight: '600' }}>{label}</Text>
  </Pressable>
);

type BarProps = { value: number; max: number; color?: string };
export const Bar = ({ value, max, color = C.green }: BarProps) => {
  const pct = max > 0 ? Math.min(Math.max(value / max, 0), 1) : 0;
  return (
    <View style={s.track}>
      <View style={{ width: `${pct * 100}%`, height: '100%', backgroundColor: color, borderRadius: 4 }} />
    </View>
  );
};

const s = StyleSheet.create({
  card: { backgroundColor: C.card, borderRadius: 20, padding: 16, marginBottom: 14 },
  title: { color: C.text, fontSize: 18, fontWeight: '700', marginBottom: 10 },
  btn: { paddingVertical: 14, paddingHorizontal: 20, borderRadius: 30, alignItems: 'center' },
  btnTxt: { fontWeight: '700', fontSize: 15 },
  input: { backgroundColor: C.card2, color: C.text, borderRadius: 14, padding: 14, fontSize: 16, marginBottom: 10 },
  chip: { backgroundColor: C.card2, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, marginRight: 8, marginBottom: 8 },
  track: { height: 8, backgroundColor: C.card2, borderRadius: 4, overflow: 'hidden', marginTop: 8 },
});
