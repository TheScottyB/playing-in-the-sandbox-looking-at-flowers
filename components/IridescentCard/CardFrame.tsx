// components/IridescentCard/CardFrame.tsx
import { memo } from 'react';
import Svg, {
  Circle,
  G,
  Line,
  Path as SvgPath,
  Rect,
  Text as SvgText,
} from 'react-native-svg';

import { TOKENS } from './tokens';

export type CardFrameProps = {
  /** Single character displayed top-left and (rotated 180°) bottom-right. */
  cornerGlyph: string;
  /** Monospace footer baseline, e.g. "SPECIMEN · ROSA RUBIGINOSA" */
  footer: string;
  /** Whether the front-side circular vignette is drawn. Back side passes false. */
  showVignette?: boolean;
};

const W = TOKENS.cardWidth;
const H = TOKENS.cardHeight;
const R = TOKENS.cornerRadius;

const CompassPip = () => (
  <G>
    <SvgPath
      d="M0 -18 L4 -4 L18 0 L4 4 L0 18 L-4 4 L-18 0 L-4 -4 Z"
      fill={TOKENS.ink}
    />
    <Circle r={3.2} fill="rgba(0,0,0,0.55)" />
  </G>
);

const Corner = ({ glyph, flip = false }: { glyph: string; flip?: boolean }) => (
  <G transform={flip ? `translate(${W} ${H}) rotate(180)` : 'translate(0 0)'}>
    <SvgText
      x={22}
      y={44}
      fontFamily='"Inter Tight", Helvetica, sans-serif'
      fontWeight="600"
      fontSize={34}
      letterSpacing={-0.7}
      fill={TOKENS.ink}
    >
      {glyph}
    </SvgText>
    {/* Small compass-pip beneath the glyph */}
    <G transform="translate(34 70) scale(0.55)">
      <CompassPip />
    </G>
  </G>
);

export const CardFrame = memo(function CardFrame({
  cornerGlyph,
  footer,
  showVignette = true,
}: CardFrameProps) {
  return (
    <Svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
      {/* Cream cardstock body */}
      <Rect x={0} y={0} width={W} height={H} rx={R} ry={R} fill={TOKENS.cardstock} />

      {/* Outer keyline */}
      <Rect
        x={10}
        y={10}
        width={W - 20}
        height={H - 20}
        rx={16}
        ry={16}
        fill="none"
        stroke={TOKENS.inkLine}
        strokeWidth={1}
      />
      {/* Inner keyline */}
      <Rect
        x={16}
        y={16}
        width={W - 32}
        height={H - 32}
        rx={12}
        ry={12}
        fill="none"
        stroke={TOKENS.inkSoft}
        strokeWidth={0.5}
      />

      <Corner glyph={cornerGlyph} />
      <Corner glyph={cornerGlyph} flip />

      {showVignette && (
        <G transform={`translate(${W / 2} ${H / 2 - 30})`}>
          <Circle r={112} fill="none" stroke={TOKENS.inkLine} strokeWidth={1.25} />
          <Circle r={92} fill="none" stroke={TOKENS.inkSoft} strokeWidth={0.5} />
        </G>
      )}

      {/* Footer baseline. Bumped from fontSize 7.5 / alpha 0.7 / letterSpacing
          3.4 — at the prototype's 360px viewBox those rendered as a near-grey
          smear when scaled up to the app's 360–440px on real screens. Slightly
          larger and darker reads as "specimen card baseline" instead of
          "graphic-design squiggle". */}
      <G transform={`translate(${W / 2} ${H - 40})`}>
        <Line x1={-120} y1={0} x2={120} y2={0} stroke="rgba(10,10,12,0.6)" strokeWidth={0.6} />
        <SvgText
          y={17}
          textAnchor="middle"
          fontFamily="Menlo, ui-monospace, monospace"
          fontSize={9}
          letterSpacing={2.8}
          fill="rgba(10,10,12,0.85)"
        >
          {footer}
        </SvgText>
      </G>
    </Svg>
  );
});
