
// iPad Pro 13" M4 device frame.
// Base size: 1032 × 1376 (≈ half native 2064 × 2752, aspect 0.75 portrait).
// In the screenshot stage we scale this up by 1.4–1.6× to fit the
// 2064 × 2752 App Store iPad asset.
//
// Differences from iPhone:
//   - No notch, no dynamic island. Front camera lives on the long edge.
//   - Status bar is a thin row (time left, icons right) — only ~24px tall.
//   - Outer bezel is uniform ~14px on all sides.
//   - Rounded outer corners ~40px, inner screen corners ~28px.
//   - Home indicator is the same gesture pill, just visually proportionate.

function IPadStatusBar({ dark = false, time = '9:41' }) {
  const c = dark ? '#fff' : '#1a1410';
  return (
    <div style={{
      height: 28, padding: '0 28px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      position: 'relative', zIndex: 20,
      fontFamily: '-apple-system, "SF Pro", system-ui',
      fontSize: 14, fontWeight: 600, color: c,
    }}>
      <span style={{ letterSpacing: 0.2 }}>{time}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* wifi */}
        <svg width="16" height="11" viewBox="0 0 16 11">
          <path d="M8 2c2.2 0 4.2.9 5.6 2.3l1.1-1.1A8.4 8.4 0 008 .5 8.4 8.4 0 001.3 3.2l1.1 1.1A7.4 7.4 0 018 2z" fill={c}/>
          <path d="M8 5c1.3 0 2.5.5 3.4 1.3l1.1-1.1A6 6 0 008 3.5a6 6 0 00-4.5 1.7l1.1 1.1A4.7 4.7 0 018 5z" fill={c}/>
          <circle cx="8" cy="9" r="1.4" fill={c}/>
        </svg>
        {/* battery */}
        <svg width="25" height="11" viewBox="0 0 25 11">
          <rect x="0.5" y="0.5" width="22" height="10" rx="2.5" stroke={c} strokeOpacity="0.35" fill="none"/>
          <rect x="2" y="2" width="19" height="7" rx="1.5" fill={c}/>
          <path d="M23 4v3c.7-.25 1.2-.9 1.2-1.5S23.7 4.25 23 4z" fill={c} fillOpacity="0.4"/>
        </svg>
      </div>
    </div>
  );
}

function IPadDevice({
  children, width = 1032, height = 1376, dark = false,
  background,
}) {
  const bezel = 14;
  const outerR = 40;
  const innerR = 28;
  const bg = background ?? (dark ? '#000' : '#F2F2F7');
  return (
    <div style={{
      width, height,
      borderRadius: outerR,
      background: '#0a0a0a',
      padding: bezel,
      boxSizing: 'border-box',
      boxShadow: '0 60px 120px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.12)',
      position: 'relative',
      fontFamily: '-apple-system, system-ui, sans-serif',
      WebkitFontSmoothing: 'antialiased',
    }}>
      {/* landscape front camera dot — sits on left long edge in portrait */}
      <div style={{
        position: 'absolute', left: 5, top: '50%', transform: 'translateY(-50%)',
        width: 6, height: 6, borderRadius: '50%',
        background: '#1a1a1a', boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.05)',
      }} />
      {/* inner screen */}
      <div style={{
        width: '100%', height: '100%',
        borderRadius: innerR, overflow: 'hidden',
        background: bg,
        position: 'relative',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* status bar */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}>
          <IPadStatusBar dark={dark} />
        </div>
        {/* content — reserves status bar height */}
        <div style={{ flex: 1, paddingTop: 28, overflow: 'hidden', position: 'relative' }}>
          {children}
        </div>
        {/* home indicator */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 60,
          height: 22, display: 'flex', justifyContent: 'center', alignItems: 'flex-end',
          paddingBottom: 6, pointerEvents: 'none',
        }}>
          <div style={{
            width: 168, height: 4, borderRadius: 100,
            background: dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.25)',
          }} />
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { IPadDevice, IPadStatusBar });
