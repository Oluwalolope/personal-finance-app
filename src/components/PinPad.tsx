import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../theme';

type Props = { onDigit: (d: string) => void; onDelete: () => void; onBio?: () => void };

const Key = ({ children, onPress }: { children?: React.ReactNode; onPress?: () => void }) => (
  <Pressable
    onPress={onPress}
    disabled={!onPress}
    style={{ width: 76, height: 76, borderRadius: 38, alignItems: 'center', justifyContent: 'center', backgroundColor: onPress ? C.card2 : 'transparent' }}
  >
    {children}
  </Pressable>
);

export default function PinPad({ onDigit, onDelete, onBio }: Props) {
  const digit = (d: string) => (
    <Key key={d} onPress={() => onDigit(d)}>
      <Text style={{ color: C.text, fontSize: 28, fontWeight: '600' }}>{d}</Text>
    </Key>
  );
  const row = (ds: string[]) => (
    <View key={ds.join()} style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 14 }}>{ds.map(digit)}</View>
  );
  return (
    <View>
      {row(['1', '2', '3'])}
      {row(['4', '5', '6'])}
      {row(['7', '8', '9'])}
      <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
        <Key onPress={onBio}>{onBio && <Ionicons name="finger-print" size={34} color={C.blueLight} />}</Key>
        {digit('0')}
        <Key onPress={onDelete}><Ionicons name="backspace-outline" size={30} color={C.text} /></Key>
      </View>
    </View>
  );
}
