import React from 'react';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBudget } from '../store';

export default function EyeToggle({ color = '#fff' }: { color?: string }) {
  const { hide, toggleHide } = useBudget();
  return (
    <Pressable onPress={toggleHide} hitSlop={10}>
      <Ionicons name={hide ? 'eye-off-outline' : 'eye-outline'} size={20} color={color} />
    </Pressable>
  );
}
