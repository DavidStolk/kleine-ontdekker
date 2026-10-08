// Placeholder visuals drawn in code. Replace any of these with AI-made
// illustrations later (e.g. <img src=...>) — the games only use these components.

const SHAPE_PATHS = {
  cirkel: <circle cx="50" cy="50" r="42" />,
  vierkant: <rect x="12" y="12" width="76" height="76" rx="6" />,
  driehoek: <path d="M50 10 L92 86 L8 86 Z" strokeLinejoin="round" />,
  ster: <path d="M50 6l12.6 26.5 29 3.6-21.3 20 5.5 28.7L50 70.8 24.2 84.8l5.5-28.7-21.3-20 29-3.6z" strokeLinejoin="round" />,
  hart: <path d="M50 88C20 66 6 50 6 32 6 18 17 8 30 8c9 0 16 5 20 12 4-7 11-12 20-12 13 0 24 10 24 24 0 18-14 34-44 56z" />,
  rechthoek: <rect x="4" y="26" width="92" height="48" rx="5" />,
  ovaal: <ellipse cx="50" cy="50" rx="44" ry="30" />,
  ruit: <path d="M50 4 L90 50 L50 96 L10 50 Z" strokeLinejoin="round" />,
}

export function Shape({ id, colour, size = '100%', face = false }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className="shape-svg" aria-label={id}>
      <g fill={colour} stroke={colour.toUpperCase() === '#FFFFFF' ? '#D9CDB8' : '#fff'} strokeWidth="5">
        {SHAPE_PATHS[id]}
      </g>
      {face && <Face />}
    </svg>
  )
}

function Face() {
  return (
    <g fill="#fff">
      <circle cx="40" cy="48" r="4.5" />
      <circle cx="60" cy="48" r="4.5" />
      <path d="M40 60q10 9 20 0" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
    </g>
  )
}

/** A paint splat in a given colour (for the colours deck). */
export function Splat({ hex, size = '100%' }) {
  const outline = hex.toUpperCase() === '#FFFFFF' ? '#D9CDB8' : '#fff'
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className="shape-svg">
      <path
        d="M52 8c9 0 10 12 18 13s15-6 20 1-4 14-1 21 11 9 9 18-12 8-15 15 2 16-6 18-12-8-21-8-14 11-22 6 0-14-6-20-17-4-18-13 9-11 9-19-9-13-3-19 14 1 20-3 7-10 16-10z"
        fill={hex}
        stroke={outline}
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <ellipse cx="38" cy="36" rx="9" ry="5" fill="#fff" opacity=".35" transform="rotate(-30 38 36)" />
    </svg>
  )
}

/** Big friendly numeral or letter. */
export function Glyph({ text, colour = '#FF5D8F', className = '' }) {
  return (
    <span className={`glyph ${className}`} style={{ color: colour }}>
      {text}
    </span>
  )
}

// ---------- Countable objects ----------
export const COUNT_KINDS = ['appel', 'ster', 'vis', 'ballon', 'eend']

export function CountObject({ kind, size = '100%' }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className="shape-svg">
      {OBJECTS[kind]}
    </svg>
  )
}

const OBJECTS = {
  appel: (
    <g>
      <path d="M50 28c-8-6-30-8-34 14-4 20 10 46 24 48 6 1 8-3 10-3s4 4 10 3c14-2 28-28 24-48-4-22-26-20-34-14z" fill="#F2383A" />
      <path d="M50 30c0-10 2-16 6-20" stroke="#7A4B2A" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M56 18c8-8 18-6 20-4-4 8-12 10-20 4z" fill="#3CC46B" />
      <ellipse cx="32" cy="44" rx="5" ry="9" fill="#fff" opacity=".4" />
    </g>
  ),
  ster: (
    <path
      d="M50 6l12.6 26.5 29 3.6-21.3 20 5.5 28.7L50 70.8 24.2 84.8l5.5-28.7-21.3-20 29-3.6z"
      fill="#FFC93C"
      stroke="#FF9F1C"
      strokeWidth="4"
      strokeLinejoin="round"
    />
  ),
  vis: (
    <g>
      <path d="M14 50c14-22 44-26 62-8l14-12v40L76 58C58 76 28 72 14 50z" fill="#4CC9F0" />
      <circle cx="34" cy="46" r="5" fill="#fff" />
      <circle cx="35" cy="46" r="2.5" fill="#1d3557" />
      <path d="M50 38q6 12 0 24" stroke="#fff" strokeWidth="3" fill="none" opacity=".6" />
    </g>
  ),
  ballon: (
    <g>
      <path d="M50 78c0 6-4 10-2 18" stroke="#888" strokeWidth="2" fill="none" />
      <ellipse cx="50" cy="40" rx="26" ry="32" fill="#9B5DE5" />
      <path d="M46 72h8l-4 6z" fill="#9B5DE5" />
      <ellipse cx="40" cy="28" rx="6" ry="10" fill="#fff" opacity=".35" />
    </g>
  ),
  eend: (
    <g>
      <ellipse cx="54" cy="64" rx="34" ry="22" fill="#FFD23F" />
      <circle cx="34" cy="38" r="18" fill="#FFD23F" />
      <path d="M14 38l-10 4 10 5z" fill="#FF8C2B" />
      <circle cx="30" cy="34" r="3.5" fill="#1d3557" />
      <path d="M50 60q14 10 26-2" stroke="#F4B400" strokeWidth="4" fill="none" strokeLinecap="round" />
    </g>
  ),
}
