/**
 * TimerRing
 *
 * Animated circular progress ring that visualises the countdown.
 * Pure React Native — no SVG dependencies.
 */

import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import { COLORS, FONTS } from '../theme';

interface Props {
  /** 0–1 where 1 = full (timer just started), 0 = empty (completed) */
  progress: number;
  /** Label shown in the center — typically the formatted remaining time */
  label: string;
  /** Sub-label below the main label */
  subLabel?: string;
  size?: number;
  strokeWidth?: number;
  color?: string;
  style?: ViewStyle;
}

function formatMs(ms: number): string {
  if (ms <= 0) return '0:00';
  const totalSecs = Math.ceil(ms / 1000);
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function TimerRing({
  progress,
  label,
  subLabel,
  size = 220,
  strokeWidth = 10,
  color = COLORS.primary,
  style,
}: Props) {
  const animatedProgress = useRef(new Animated.Value(progress)).current;

  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: progress,
      duration: 400,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [progress, animatedProgress]);

  const radius = (size - strokeWidth * 2) / 2;
  const center = size / 2;

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      {/* Background track */}
      <View
        style={[
          styles.track,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: COLORS.surfaceAlt,
          },
        ]}
      />

      {/* Colored arc — simulated with rotating half-circles */}
      <ProgressArc
        progress={animatedProgress}
        size={size}
        strokeWidth={strokeWidth}
        color={color}
        radius={radius}
        center={center}
      />

      {/* Center content */}
      <View style={styles.centerContent}>
        <Text style={styles.label}>{label}</Text>
        {subLabel ? (
          <Text style={styles.subLabel}>{subLabel}</Text>
        ) : null}
      </View>
    </View>
  );
}

/** Renders the colored arc using two rotated half-circles */
function ProgressArc({
  progress,
  size,
  strokeWidth,
  color,
  radius: _radius,
  center: _center,
}: {
  progress: Animated.Value;
  size: number;
  strokeWidth: number;
  color: string;
  radius: number;
  center: number;
}) {
  // Left half rotation: 0→180deg maps to progress 0→0.5
  const leftRotation = progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['0deg', '0deg', '180deg'],
  });

  // Right half rotation: always fills first
  const rightRotation = progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['0deg', '180deg', '180deg'],
  });

  const halfSize = size / 2;

  return (
    <View style={[StyleSheet.absoluteFill, { borderRadius: size / 2, overflow: 'hidden' }]}>
      {/* Right half */}
      <Animated.View
        style={[
          styles.half,
          {
            width: halfSize,
            height: size,
            left: halfSize,
            borderTopRightRadius: halfSize,
            borderBottomRightRadius: halfSize,
            borderRightWidth: strokeWidth,
            borderTopWidth: strokeWidth,
            borderBottomWidth: strokeWidth,
            borderColor: color,
            transform: [
              { translateX: -halfSize / 2 },
              { rotate: rightRotation },
              { translateX: halfSize / 2 },
            ],
          },
        ]}
      />
      {/* Left half */}
      <Animated.View
        style={[
          styles.half,
          {
            width: halfSize,
            height: size,
            left: 0,
            borderTopLeftRadius: halfSize,
            borderBottomLeftRadius: halfSize,
            borderLeftWidth: strokeWidth,
            borderTopWidth: strokeWidth,
            borderBottomWidth: strokeWidth,
            borderColor: color,
            transform: [
              { translateX: halfSize / 2 },
              { rotate: leftRotation },
              { translateX: -halfSize / 2 },
            ],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  track: {
    position: 'absolute',
  },
  half: {
    position: 'absolute',
    top: 0,
    overflow: 'hidden',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  label: {
    fontFamily: FONTS.mono,
    fontSize: 42,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: 2,
  },
  subLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 4,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});

export { formatMs };
