import { View } from 'react-native';
import Svg, { Circle, Ellipse, Line, Path, Polyline } from 'react-native-svg';
import { useTheme } from '@/context/ThemeContext';

export type GlyphVariant = 'home' | 'tarot' | 'horoscope' | 'planner' | 'profile';

interface BackgroundGlyphsProps {
  variant: GlyphVariant;
  opacity?: number;
}

interface GlyphPlacement {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
  size: number;
  rotate?: number;
  glyph:
    | 'crescent'
    | 'star4'
    | 'star6'
    | 'star8'
    | 'circle'
    | 'concentric'
    | 'eye'
    | 'cross'
    | 'saturn'
    | 'sun'
    | 'diamond'
    | 'constellation'
    | 'shooting';
}

const VARIANTS: Record<GlyphVariant, GlyphPlacement[]> = {
  home: [
    { top: 24, right: 24, size: 36, glyph: 'crescent' },
    { top: 100, right: 80, size: 12, glyph: 'star4' },
    { top: 220, left: 24, size: 18, glyph: 'star4', rotate: 18 },
    { bottom: 160, right: 32, size: 28, glyph: 'circle' },
    { bottom: 60, left: 40, size: 8, glyph: 'star4' },
  ],
  tarot: [
    { top: 36, left: 24, size: 30, glyph: 'eye' },
    { top: 120, right: 28, size: 24, glyph: 'star6', rotate: 15 },
    { bottom: 200, left: 28, size: 32, glyph: 'cross' },
    { bottom: 80, right: 40, size: 18, glyph: 'star6' },
  ],
  horoscope: [
    { top: 32, right: 24, size: 44, glyph: 'saturn', rotate: -12 },
    { top: 160, left: 28, size: 22, glyph: 'star8' },
    { bottom: 240, right: 36, size: 14, glyph: 'star8' },
    { bottom: 80, left: 32, size: 26, glyph: 'circle' },
  ],
  planner: [
    { top: 40, right: 36, size: 36, glyph: 'concentric' },
    { top: 220, left: 24, size: 20, glyph: 'diamond', rotate: 30 },
    { bottom: 220, right: 28, size: 38, glyph: 'sun' },
    { bottom: 60, left: 40, size: 12, glyph: 'diamond' },
  ],
  profile: [
    { top: 56, right: 24, size: 80, glyph: 'constellation' },
    { top: 240, left: 24, size: 28, glyph: 'crescent', rotate: -20 },
    { bottom: 100, right: 36, size: 60, glyph: 'shooting' },
  ],
};

function Glyph({
  glyph,
  size,
  color,
}: {
  glyph: GlyphPlacement['glyph'];
  size: number;
  color: string;
}) {
  const sw = 0.5;
  switch (glyph) {
    case 'crescent':
      return (
        <Svg width={size} height={size} viewBox="0 0 32 32">
          <Path
            d="M22 4 a14 14 0 1 0 0 24 a10 10 0 1 1 0 -24 z"
            stroke={color}
            strokeWidth={sw}
            fill="none"
          />
        </Svg>
      );
    case 'star4':
      return (
        <Svg width={size} height={size} viewBox="0 0 32 32">
          <Path
            d="M16 2 L18 14 L30 16 L18 18 L16 30 L14 18 L2 16 L14 14 Z"
            stroke={color}
            strokeWidth={sw}
            fill="none"
          />
        </Svg>
      );
    case 'star6':
      return (
        <Svg width={size} height={size} viewBox="0 0 32 32">
          <Path
            d="M16 2 L19 14 L30 16 L19 18 L16 30 L13 18 L2 16 L13 14 Z"
            stroke={color}
            strokeWidth={sw}
            fill="none"
          />
          <Line x1="16" y1="6" x2="16" y2="26" stroke={color} strokeWidth={sw} />
          <Line x1="6" y1="16" x2="26" y2="16" stroke={color} strokeWidth={sw} />
        </Svg>
      );
    case 'star8':
      return (
        <Svg width={size} height={size} viewBox="0 0 32 32">
          {[0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5].map((deg) => (
            <Line
              key={deg}
              x1="16"
              y1="2"
              x2="16"
              y2="30"
              stroke={color}
              strokeWidth={sw}
              transform={`rotate(${deg} 16 16)`}
            />
          ))}
        </Svg>
      );
    case 'circle':
      return (
        <Svg width={size} height={size} viewBox="0 0 32 32">
          <Circle cx="16" cy="16" r="14" stroke={color} strokeWidth={sw} fill="none" />
        </Svg>
      );
    case 'concentric':
      return (
        <Svg width={size} height={size} viewBox="0 0 32 32">
          <Circle cx="16" cy="16" r="14" stroke={color} strokeWidth={sw} fill="none" />
          <Circle cx="16" cy="16" r="8" stroke={color} strokeWidth={sw} fill="none" />
        </Svg>
      );
    case 'eye':
      return (
        <Svg width={size} height={size} viewBox="0 0 32 32">
          <Path d="M2 16 L16 4 L30 16 L16 28 Z" stroke={color} strokeWidth={sw} fill="none" />
          <Circle cx="16" cy="16" r="4" stroke={color} strokeWidth={sw} fill="none" />
        </Svg>
      );
    case 'cross':
      return (
        <Svg width={size} height={size} viewBox="0 0 32 32">
          <Line x1="16" y1="2" x2="16" y2="30" stroke={color} strokeWidth={sw} />
          <Line x1="2" y1="16" x2="30" y2="16" stroke={color} strokeWidth={sw} />
        </Svg>
      );
    case 'saturn':
      return (
        <Svg width={size} height={size} viewBox="0 0 32 32">
          <Circle cx="16" cy="16" r="6" stroke={color} strokeWidth={sw} fill="none" />
          <Ellipse
            cx="16"
            cy="16"
            rx="14"
            ry="4"
            stroke={color}
            strokeWidth={sw}
            fill="none"
            transform="rotate(-20 16 16)"
          />
        </Svg>
      );
    case 'sun':
      return (
        <Svg width={size} height={size} viewBox="0 0 32 32">
          <Circle cx="16" cy="16" r="6" stroke={color} strokeWidth={sw} fill="none" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <Line
              key={deg}
              x1="16"
              y1="0"
              x2="16"
              y2="4"
              stroke={color}
              strokeWidth={sw}
              transform={`rotate(${deg} 16 16)`}
            />
          ))}
        </Svg>
      );
    case 'diamond':
      return (
        <Svg width={size} height={size} viewBox="0 0 32 32">
          <Path d="M16 2 L30 16 L16 30 L2 16 Z" stroke={color} strokeWidth={sw} fill="none" />
        </Svg>
      );
    case 'constellation':
      return (
        <Svg width={size} height={size} viewBox="0 0 80 80">
          <Polyline
            points="8,18 28,12 46,28 62,16 70,46"
            stroke={color}
            strokeWidth={sw}
            fill="none"
          />
          {[
            [8, 18],
            [28, 12],
            [46, 28],
            [62, 16],
            [70, 46],
          ].map(([x, y]) => (
            <Circle
              key={`${x}-${y}`}
              cx={x}
              cy={y}
              r="1.2"
              stroke={color}
              strokeWidth={sw}
              fill={color}
            />
          ))}
        </Svg>
      );
    case 'shooting':
      return (
        <Svg width={size} height={size} viewBox="0 0 60 60">
          <Line x1="6" y1="50" x2="44" y2="14" stroke={color} strokeWidth={sw} />
          <Path d="M44 14 L48 10 L52 14 L48 18 Z" stroke={color} strokeWidth={sw} fill="none" />
        </Svg>
      );
  }
}

export function BackgroundGlyphs({ variant, opacity }: BackgroundGlyphsProps) {
  const { palette, accent, effectiveMode } = useTheme();
  const op = opacity ?? (effectiveMode === 'dark' ? 0.07 : 0.04);
  const placements = VARIANTS[variant];

  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
        backgroundColor: palette.background,
      }}>
      {placements.map((p, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            top: p.top,
            bottom: p.bottom,
            left: p.left,
            right: p.right,
            opacity: op,
            transform: p.rotate ? [{ rotate: `${p.rotate}deg` }] : undefined,
          }}>
          <Glyph glyph={p.glyph} size={p.size} color={accent} />
        </View>
      ))}
    </View>
  );
}
