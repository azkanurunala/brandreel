// BrandReel — in-browser UGC clip renderer (the fallback used for every
// hook×platform combo that doesn't yet have a real Google Veo clip in the
// manifest). Renders an animated short to a canvas frame-by-frame and encodes
// it with MediaRecorder into a real, playable WebM blob — no external service.
//
// The look is deliberately "social-native": a cinematic product reveal with
// TikTok/Reels-style kinetic auto-captions, a live action rail (avatar, like,
// comment, share, spinning audio disc), animated film grain and a light sweep,
// so the preview reads as an actual posted clip rather than a motion graphic.

function brPickVideoMime() {
  const cands = [
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
    "video/mp4",
  ];
  for (const m of cands) {
    try { if (window.MediaRecorder && MediaRecorder.isTypeSupported(m)) return m; } catch (e) {}
  }
  return "";
}

function brVideoSupported() {
  return !!(window.MediaRecorder && HTMLCanvasElement.prototype.captureStream);
}

// aspect → render dimensions
function brVideoDims(ratio) {
  if (ratio === "1:1") return { w: 720, h: 720 };
  if (ratio === "16:9") return { w: 960, h: 540 };
  return { w: 540, h: 960 }; // 9:16 default
}

// ── small helpers ───────────────────────────────────────────────
function brRoundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}
const brClamp01 = (x) => Math.max(0, Math.min(1, x));
const brEaseOut = (t) => 1 - Math.pow(1 - t, 3);
function brSmooth(a, b, t) { const x = brClamp01((t - a) / (b - a)); return x * x * (3 - 2 * x); }
// spring-ish overshoot for intros
function brSpring(t) { const k = brClamp01(t); return 1 - Math.pow(1 - k, 2.4) * Math.cos(k * 7.5) * (1 - k); }
function brHexA(hex, a) {
  const h = (hex || "#000").replace("#", "");
  const n = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const r = parseInt(n.slice(0, 2), 16) || 0, g = parseInt(n.slice(2, 4), 16) || 0, b = parseInt(n.slice(4, 6), 16) || 0;
  return `rgba(${r},${g},${b},${a})`;
}
function brMix(h1, h2, t) {
  const p = (h) => { const s = (h || "#000").replace("#", ""); const n = s.length === 3 ? s.split("").map((c) => c + c).join("") : s; return [parseInt(n.slice(0, 2), 16) || 0, parseInt(n.slice(2, 4), 16) || 0, parseInt(n.slice(4, 6), 16) || 0]; };
  const a = p(h1), b = p(h2);
  const m = a.map((v, i) => Math.round(v + (b[i] - v) * brClamp01(t)));
  return `rgb(${m[0]},${m[1]},${m[2]})`;
}

// faux but stable social counts derived from the script text
function brHash(str) { let h = 2166136261; for (let i = 0; i < (str || "").length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return Math.abs(h); }
function brCompact(n) {
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}

// ── animated grain tile (built once, reused) ────────────────────
let _brGrain = null;
function brGrainTile() {
  if (_brGrain) return _brGrain;
  const c = document.createElement("canvas");
  c.width = 140; c.height = 140;
  const g = c.getContext("2d");
  const img = g.createImageData(c.width, c.height);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = (Math.random() * 255) | 0;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = (Math.random() * 26) | 0;
  }
  g.putImageData(img, 0, 0);
  _brGrain = c;
  return c;
}

// ── social-rail icon paths (centred at 0,0, ~24px box, scaled by caller) ──
function brIconHeart(ctx) { ctx.beginPath(); ctx.moveTo(0, 7); ctx.bezierCurveTo(-9, -1, -7, -10, -1, -6); ctx.bezierCurveTo(0, -5.2, 0, -5.2, 1, -6); ctx.bezierCurveTo(7, -10, 9, -1, 0, 7); ctx.closePath(); }
function brIconChat(ctx) { ctx.beginPath(); ctx.moveTo(-9, -8); ctx.lineTo(9, -8); ctx.quadraticCurveTo(11, -8, 11, -6); ctx.lineTo(11, 3); ctx.quadraticCurveTo(11, 5, 9, 5); ctx.lineTo(-3, 5); ctx.lineTo(-8, 10); ctx.lineTo(-8, 5); ctx.lineTo(-9, 5); ctx.quadraticCurveTo(-11, 5, -11, 3); ctx.lineTo(-11, -6); ctx.quadraticCurveTo(-11, -8, -9, -8); ctx.closePath(); }
function brIconShare(ctx) { ctx.beginPath(); ctx.moveTo(-10, 9); ctx.quadraticCurveTo(-3, -4, 6, -4); ctx.lineTo(6, -9); ctx.lineTo(12, -1); ctx.lineTo(6, 6); ctx.lineTo(6, 1); ctx.quadraticCurveTo(-2, 1, -10, 9); ctx.closePath(); }
function brIconMusic(ctx) { ctx.beginPath(); ctx.arc(-5, 7, 3.4, 0, Math.PI * 2); ctx.moveTo(-1.6, 7); ctx.lineTo(-1.6, -8); ctx.lineTo(8, -10.5); ctx.lineTo(8, 4); ctx.moveTo(8, 4); ctx.arc(4.6, 4, 3.4, 0, Math.PI * 2); }

// Draw one frame at progress t∈[0,1].
function brDrawFrame(ctx, W, H, t, o) {
  const cx = W / 2;
  const vertical = H / W > 1.2;              // 9:16
  const square = Math.abs(H / W - 1) < 0.1;  // 1:1
  const ref = vertical ? W / 540 : H / 540;  // scale (height-based for landscape)
  ctx.clearRect(0, 0, W, H);

  // ── cinematic push-in on the whole scene ──
  const push = 1 + 0.055 * brEaseOut(brClamp01(t * 1.05));
  const driftX = Math.sin(t * Math.PI * 1.2) * 6 * ref;
  ctx.save();
  ctx.translate(cx + driftX, H / 2);
  ctx.scale(push, push);
  ctx.translate(-cx, -H / 2);

  // ── animated gradient background ──
  const ang = -0.6 + 0.3 * Math.sin(t * Math.PI);
  const dx = Math.cos(ang), dy = Math.sin(ang);
  const g = ctx.createLinearGradient(cx - dx * W, H / 2 - dy * H, cx + dx * W, H / 2 + dy * H);
  g.addColorStop(0, o.hookColor);
  g.addColorStop(0.55, brMix(o.hookColor, o.logoColor, 0.5));
  g.addColorStop(1, o.logoColor);
  ctx.fillStyle = g; ctx.fillRect(-W, -H, W * 3, H * 3);

  // drifting spotlight
  const glowY = H * (0.32 + 0.05 * Math.sin(t * Math.PI * 2));
  const glowX = cx + Math.cos(t * Math.PI * 1.7) * W * 0.12;
  const rg = ctx.createRadialGradient(glowX, glowY, 0, glowX, glowY, W * 0.8);
  rg.addColorStop(0, brHexA("#ffffff", 0.2));
  rg.addColorStop(1, brHexA("#ffffff", 0));
  ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);

  // diagonal light sweep (passes once around mid-clip)
  const sweep = brSmooth(0.18, 0.5, t) * (1 - brSmooth(0.5, 0.82, t));
  if (sweep > 0.01) {
    const sp = -0.3 + 1.4 * brSmooth(0.18, 0.82, t);
    ctx.save();
    ctx.globalAlpha = sweep * 0.5;
    ctx.translate(W * sp, 0); ctx.rotate(-0.5);
    const lw = W * 0.22;
    const sg = ctx.createLinearGradient(-lw, 0, lw, 0);
    sg.addColorStop(0, "rgba(255,255,255,0)"); sg.addColorStop(0.5, "rgba(255,255,255,0.7)"); sg.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = sg; ctx.fillRect(-lw, -H, lw * 2, H * 3);
    ctx.restore();
  }

  ctx.restore(); // end push-in (chrome + grain sit on top, unscaled)

  // ── animated film grain ──
  const gt = brGrainTile();
  ctx.save();
  ctx.globalAlpha = 0.5;
  const ox = (Math.random() * gt.width) | 0, oy = (Math.random() * gt.height) | 0;
  for (let y = -oy; y < H; y += gt.height) for (let x = -ox; x < W; x += gt.width) ctx.drawImage(gt, x, y);
  ctx.restore();

  // vignette
  const vg = ctx.createRadialGradient(cx, H / 2, H * 0.28, cx, H / 2, H * 0.78);
  vg.addColorStop(0, "rgba(0,0,0,0)");
  vg.addColorStop(1, "rgba(0,0,0,0.34)");
  ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  // top + bottom scrims for chrome legibility
  const ts = ctx.createLinearGradient(0, 0, 0, H * 0.2); ts.addColorStop(0, "rgba(0,0,0,0.32)"); ts.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = ts; ctx.fillRect(0, 0, W, H * 0.2);
  const bs = ctx.createLinearGradient(0, H * 0.72, 0, H); bs.addColorStop(0, "rgba(0,0,0,0)"); bs.addColorStop(1, "rgba(0,0,0,0.5)");
  ctx.fillStyle = bs; ctx.fillRect(0, H * 0.72, W, H * 0.28);

  // ── product hero badge ──
  const intro = brSpring(brSmooth(0.0, 0.34, t));
  const settle = brSmooth(0.28, 0.46, t);
  const gSize = (148 * ref) * (0.6 + 0.4 * brClamp01(intro));
  const gy = (vertical ? H * 0.30 : H * 0.36) - 0.10 * settle * H + (1 - brClamp01(intro)) * 26 * ref;
  const wob = Math.sin(t * Math.PI * 2) * 0.03 * settle;
  const float = Math.sin(t * Math.PI * 2 + 1) * 5 * ref * settle;
  // pulsing halo
  ctx.save();
  ctx.globalAlpha = 0.4 * settle * (0.6 + 0.4 * Math.sin(t * Math.PI * 3));
  const halo = ctx.createRadialGradient(cx, gy + float, gSize * 0.3, cx, gy + float, gSize * 0.95);
  halo.addColorStop(0, brHexA("#ffffff", 0.25)); halo.addColorStop(1, brHexA("#ffffff", 0));
  ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(cx, gy + float, gSize * 0.95, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = brClamp01(intro);
  ctx.translate(cx, gy + float); ctx.rotate(wob);
  ctx.shadowColor = brHexA("#000", 0.38); ctx.shadowBlur = 42 * ref; ctx.shadowOffsetY = 20 * ref;
  ctx.fillStyle = o.logoColor;
  brRoundRect(ctx, -gSize / 2, -gSize / 2, gSize, gSize, 34 * ref); ctx.fill();
  ctx.shadowColor = "transparent";
  // uploaded brand logo — clipped to the rounded badge (cover-fit)
  if (o._logoImg) {
    ctx.save();
    brRoundRect(ctx, -gSize / 2, -gSize / 2, gSize, gSize, 34 * ref); ctx.clip();
    const im = o._logoImg;
    const sc = Math.max(gSize / im.width, gSize / im.height);
    const iw = im.width * sc, ih = im.height * sc;
    ctx.drawImage(im, -iw / 2, -ih / 2, iw, ih);
    ctx.restore();
  }
  // sheen
  brRoundRect(ctx, -gSize / 2, -gSize / 2, gSize, gSize, 34 * ref);
  const sh = ctx.createLinearGradient(0, -gSize / 2, 0, gSize / 2);
  sh.addColorStop(0, "rgba(255,255,255,0.34)"); sh.addColorStop(0.5, "rgba(255,255,255,0)");
  ctx.fillStyle = sh; ctx.fill();
  if (!o._logoImg) {
    ctx.fillStyle = "#fff";
    ctx.font = `700 ${gSize * 0.4}px "Space Grotesk", sans-serif`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(o.glyph, 0, 2 * ref);
  }
  ctx.restore();

  // hook label pill under the badge
  const labA = brSmooth(0.34, 0.5, t);
  if (labA > 0.01) {
    ctx.save(); ctx.globalAlpha = labA;
    ctx.font = `700 ${17 * ref}px "Geist Mono", monospace`;
    const label = (o.hookLabel || "").toUpperCase();
    const tw = ctx.measureText(label).width;
    const ph = 32 * ref, pw = tw + 26 * ref, ly = gy + gSize / 2 + 30 * ref + float;
    ctx.fillStyle = "rgba(255,255,255,0.18)";
    brRoundRect(ctx, cx - pw / 2, ly, pw, ph, ph / 2); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(label, cx, ly + ph / 2 + 1 * ref);
    ctx.restore();
  }

  // ── kinetic auto-captions (TikTok style, word-by-word) ──
  const words = String(o.script || "").split(/\s+/).filter(Boolean);
  if (words.length) {
    const fs = (vertical ? 42 : 38) * ref;
    ctx.font = `800 ${fs}px "Space Grotesk", sans-serif`;
    const maxW = W * 0.82;
    // lay words into centred lines
    const sp = ctx.measureText(" ").width;
    const ws = words.map((w) => ({ w, width: ctx.measureText(w).width }));
    const lines = [[]]; let lw = 0;
    ws.forEach((it) => {
      const add = (lines[lines.length - 1].length ? sp : 0) + it.width;
      if (lw + add > maxW && lines[lines.length - 1].length) { lines.push([]); lw = it.width; }
      else lw += add;
      lines[lines.length - 1].push(it);
    });
    const lineH = fs * 1.16;
    const blockY = vertical ? H * 0.62 : H * 0.66;
    const reveal = brClamp01((t - 0.36) / 0.5);
    const shown = Math.round(reveal * words.length);
    const activeIdx = Math.min(words.length - 1, Math.max(0, shown - 1));
    let idx = 0;
    ctx.textBaseline = "middle";
    lines.forEach((line, li) => {
      const totalW = line.reduce((a, it) => a + it.width, 0) + sp * (line.length - 1);
      let x = cx - totalW / 2;
      const y = blockY + li * lineH;
      line.forEach((it) => {
        const visible = idx < shown;
        const isActive = idx === activeIdx && reveal < 1;
        if (visible) {
          if (isActive) {
            const pop = 1 + 0.08 * Math.sin(t * Math.PI * 8);
            ctx.save();
            ctx.fillStyle = o.hookColor;
            const pad = 9 * ref;
            brRoundRect(ctx, x - pad, y - fs * 0.62 * pop, it.width + pad * 2, fs * 1.18 * pop, 9 * ref);
            ctx.fill();
            ctx.restore();
          }
          ctx.save();
          ctx.shadowColor = "rgba(0,0,0,0.45)"; ctx.shadowBlur = 12 * ref; ctx.shadowOffsetY = 2 * ref;
          ctx.fillStyle = "#fff"; ctx.textAlign = "left";
          ctx.fillText(it.w, x, y);
          ctx.restore();
        }
        x += it.width + sp;
        idx++;
      });
    });
  }

  // ════════ social chrome (overlay) ════════
  const chromeA = brSmooth(0.1, 0.26, t);
  const pad = 22 * ref;
  const h = brHash(o.script || o.brand || "x");
  const likes = brCompact(8000 + (h % 90000));
  const comments = brCompact(120 + (h % 1800));
  const shares = brCompact(400 + (h % 9000));
  // counts tick up slightly across the clip
  const countA = 0.4 + 0.6 * t;

  if (vertical || square) {
    // ── right action rail ──
    ctx.save();
    ctx.globalAlpha = chromeA;
    const railX = W - pad - 22 * ref;
    let railY = H * (square ? 0.42 : 0.5);
    const gap = (square ? 58 : 70) * ref;
    // avatar
    const av = 46 * ref;
    ctx.save();
    ctx.beginPath(); ctx.arc(railX, railY, av / 2 + 2 * ref, 0, Math.PI * 2);
    ctx.fillStyle = "#fff"; ctx.fill();
    ctx.beginPath(); ctx.arc(railX, railY, av / 2, 0, Math.PI * 2);
    ctx.fillStyle = o.logoColor; ctx.fill();
    const initials = String(o.handle || o.brand || "BR").replace("@", "").slice(0, 2).toUpperCase();
    ctx.fillStyle = "#fff"; ctx.font = `700 ${17 * ref}px "Space Grotesk", sans-serif`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(initials, railX, railY + 1 * ref);
    // follow +
    ctx.beginPath(); ctx.arc(railX, railY + av / 2 + 3 * ref, 9 * ref, 0, Math.PI * 2);
    ctx.fillStyle = o.platColor || "#F23E5C"; ctx.fill();
    ctx.strokeStyle = "#fff"; ctx.lineWidth = 2.4 * ref;
    ctx.beginPath(); ctx.moveTo(railX - 4 * ref, railY + av / 2 + 3 * ref); ctx.lineTo(railX + 4 * ref, railY + av / 2 + 3 * ref);
    ctx.moveTo(railX, railY + av / 2 - 1 * ref); ctx.lineTo(railX, railY + av / 2 + 7 * ref); ctx.stroke();
    ctx.restore();
    railY += gap;

    const liked = t > 0.55;
    const items = [
      { icon: brIconHeart, val: likes, fill: liked ? "#FF2D55" : "#fff", beat: liked },
      { icon: brIconChat, val: comments, fill: "#fff" },
      { icon: brIconShare, val: shares, fill: "#fff" },
    ];
    items.forEach((it) => {
      ctx.save();
      ctx.translate(railX, railY);
      const beat = it.beat ? 1 + 0.18 * Math.max(0, Math.sin((t - 0.55) * Math.PI * 6)) * (t < 0.75 ? 1 : 0) : 1;
      ctx.scale(1.5 * ref * beat, 1.5 * ref * beat);
      ctx.shadowColor = "rgba(0,0,0,0.4)"; ctx.shadowBlur = 6;
      it.icon(ctx);
      ctx.fillStyle = it.fill; ctx.fill();
      ctx.restore();
      ctx.fillStyle = "rgba(255,255,255,0.96)";
      ctx.font = `700 ${13 * ref}px "Space Grotesk", sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(it.val, railX, railY + 26 * ref);
      railY += gap;
    });
    // spinning audio disc
    ctx.save();
    ctx.translate(railX, railY + 4 * ref);
    ctx.rotate(t * Math.PI * 4);
    ctx.beginPath(); ctx.arc(0, 0, 19 * ref, 0, Math.PI * 2);
    ctx.fillStyle = "#1a1a1a"; ctx.fill();
    ctx.beginPath(); ctx.arc(0, 0, 7 * ref, 0, Math.PI * 2);
    ctx.fillStyle = o.hookColor; ctx.fill();
    ctx.beginPath(); ctx.arc(0, 0, 2.4 * ref, 0, Math.PI * 2);
    ctx.fillStyle = "#fff"; ctx.fill();
    ctx.restore();
    ctx.restore();

    // ── bottom-left: handle + caption + music ──
    ctx.save();
    ctx.globalAlpha = chromeA;
    const blX = pad, blW = W - pad * 3 - 30 * ref;
    let blY = H - pad - (vertical ? 64 : 50) * ref;
    ctx.fillStyle = "#fff"; ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
    ctx.font = `700 ${19 * ref}px "Space Grotesk", sans-serif`;
    ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 8 * ref;
    ctx.fillText(o.handle || ("@" + (o.brand || "brandreel").toLowerCase()), blX, blY);
    blY += 24 * ref;
    ctx.font = `500 ${15 * ref}px "Plus Jakarta Sans", sans-serif`;
    const capLine = (o.caption || "").split("\n")[0];
    const cl = capLine.length > 42 ? capLine.slice(0, 41) + "…" : capLine;
    ctx.fillStyle = "rgba(255,255,255,0.94)";
    ctx.fillText(cl, blX, blY);
    blY += 22 * ref;
    // music note + marquee
    ctx.save();
    ctx.translate(blX + 6 * ref, blY - 5 * ref); ctx.scale(0.7 * ref, 0.7 * ref); brIconMusic(ctx);
    ctx.fillStyle = "#fff"; ctx.fill(); ctx.restore();
    ctx.font = `500 ${12.5 * ref}px "Plus Jakarta Sans", sans-serif`;
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    const mq = "Original audio · " + (o.brand || "BrandReel") + "   ";
    const shift = (t * 60 * ref) % ctx.measureText(mq).width;
    ctx.fillText(mq + mq, blX + 20 * ref - shift, blY);
    ctx.restore();
  } else {
    // ── landscape (16:9): clean lower-third ──
    ctx.save();
    ctx.globalAlpha = chromeA;
    const blX = pad * 1.4; let blY = H - pad - 30 * ref;
    ctx.fillStyle = "#fff"; ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
    ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 8 * ref;
    ctx.font = `700 ${20 * ref}px "Space Grotesk", sans-serif`;
    ctx.fillText(o.handle || ("@" + (o.brand || "brandreel").toLowerCase()), blX, blY);
    blY += 22 * ref;
    ctx.font = `500 ${15 * ref}px "Plus Jakarta Sans", sans-serif`;
    const capLine = (o.caption || "").split("\n")[0];
    const cl = capLine.length > 64 ? capLine.slice(0, 63) + "…" : capLine;
    ctx.fillStyle = "rgba(255,255,255,0.92)"; ctx.fillText(cl, blX, blY);
    ctx.restore();
  }

  // ── platform watermark (top-left) + brand (top-right) ──
  ctx.save();
  ctx.globalAlpha = chromeA;
  const bd = 40 * ref;
  ctx.fillStyle = o.platColor || "#111";
  brRoundRect(ctx, pad, pad, bd, bd, 11 * ref); ctx.fill();
  ctx.fillStyle = "#fff"; ctx.font = `800 ${15 * ref}px "Geist Mono", monospace`;
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(o.platShort || "TT", pad + bd / 2, pad + bd / 2 + 1 * ref);
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.font = `700 ${17 * ref}px "Space Grotesk", sans-serif`;
  ctx.textAlign = "right";
  ctx.fillText(o.brand || "BrandReel", W - pad, pad + bd / 2 + 1 * ref);
  ctx.restore();

  // ── progress scrubber ──
  const barY = H - 18 * ref, barX = pad, barW = W - pad * 2;
  ctx.fillStyle = "rgba(255,255,255,0.25)";
  brRoundRect(ctx, barX, barY, barW, 4 * ref, 2 * ref); ctx.fill();
  ctx.fillStyle = "#fff";
  brRoundRect(ctx, barX, barY, barW * t, 4 * ref, 2 * ref); ctx.fill();
  ctx.beginPath(); ctx.arc(barX + barW * t, barY + 2 * ref, 5 * ref, 0, Math.PI * 2); ctx.fill();
}

// Render the clip. Returns { url, blob, duration, width, height }.
async function brRenderUGCVideo(o) {
  if (!brVideoSupported()) throw new Error("MediaRecorder/captureStream unsupported");
  const { w, h } = brVideoDims(o.ratio);
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d");
  try { if (document.fonts && document.fonts.ready) await document.fonts.ready; } catch (e) {}

  // paint first frame before capture so the stream isn't blank
  brDrawFrame(ctx, w, h, 0, o);

  const fps = 30;
  let stream, manualFrame = false;
  try {
    stream = canvas.captureStream(0);
    const vt = stream.getVideoTracks()[0];
    manualFrame = !!(vt && typeof vt.requestFrame === "function");
    if (!manualFrame) stream = canvas.captureStream(fps);
  } catch (e) {
    stream = canvas.captureStream(fps);
  }
  const track = stream.getVideoTracks()[0];
  const mime = brPickVideoMime();
  const rec = new MediaRecorder(stream, mime ? { mimeType: mime, videoBitsPerSecond: 5200000 } : undefined);
  const chunks = [];
  rec.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };
  const stopped = new Promise((res) => { rec.onstop = res; });
  rec.start();

  const DUR = (o.duration || 4.8) * 1000;
  const start = performance.now();
  await new Promise((resolve) => {
    const iv = setInterval(() => {
      const el = performance.now() - start;
      const t = brClamp01(el / DUR);
      brDrawFrame(ctx, w, h, t, o);
      if (manualFrame && track && track.requestFrame) { try { track.requestFrame(); } catch (e) {} }
      if (o.onProgress) o.onProgress(t);
      if (el >= DUR) { clearInterval(iv); resolve(); }
    }, 1000 / fps);
  });

  rec.stop();
  await stopped;
  stream.getTracks().forEach((tr) => tr.stop());
  const blob = new Blob(chunks, { type: mime || "video/webm" });
  const url = URL.createObjectURL(blob);
  return { url, blob, duration: DUR / 1000, width: w, height: h, mime: mime || "video/webm" };
}

Object.assign(window, {
  brRenderUGCVideo, brVideoSupported, brVideoDims, brDrawFrame, brPickVideoMime,
});
