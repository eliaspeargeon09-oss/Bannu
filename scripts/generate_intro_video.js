import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const OUTPUT_VIDEO = '/public/intro.mp4';
const FPS = 24;
const DURATION = 14; // 14 seconds
const TOTAL_FRAMES = FPS * DURATION;
const WIDTH = 1080;
const HEIGHT = 720;

console.log(`Generating ${TOTAL_FRAMES} frames at ${WIDTH}x${HEIGHT}...`);

// Generate SVG string for frame index
function getSvgForFrame(i) {
  const t = i / FPS; // time in seconds (0 to 14)

  // Stage 1: Spacecraft Journey (0 to 3.5s)
  if (t < 3.5) {
    const progress = t / 3.5;
    const shipX = 200 + progress * 500;
    const shipY = 360 + Math.sin(t * 3) * 20;

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
      <rect width="${WIDTH}" height="${HEIGHT}" fill="#040711" />
      <!-- Starfield -->
      ${Array.from({ length: 45 }).map((_, idx) => {
        const sx = ((idx * 83 + progress * 800) % WIDTH);
        const sy = (idx * 37) % HEIGHT;
        const size = (idx % 3) + 1;
        return `<circle cx="${sx}" cy="${sy}" r="${size}" fill="#94a3b8" opacity="0.8" />`;
      }).join('')}
      <!-- Distant Nebula -->
      <circle cx="800" cy="250" r="280" fill="#0891b2" opacity="0.12" filter="blur(40px)" />
      <circle cx="350" cy="450" r="220" fill="#7c3aed" opacity="0.08" filter="blur(30px)" />

      <!-- Spacecraft Odyssey-9 -->
      <g transform="translate(${shipX}, ${shipY}) rotate(12)">
        <!-- Engine thrust plume -->
        <polygon points="-80,0 -160,-12 -220,0 -160,12" fill="#38bdf8" opacity="0.9" />
        <polygon points="-80,0 -130,-6 -170,0 -130,6" fill="#ffffff" opacity="0.95" />
        <!-- Ship Hull -->
        <polygon points="120,0 20,-35 -80,-25 -70,0 -80,25 20,35" fill="#e2e8f0" stroke="#38bdf8" stroke-width="2" />
        <!-- Cockpit Visor -->
        <polygon points="80,0 35,-12 35,12" fill="#0284c7" stroke="#38bdf8" stroke-width="1.5" />
        <!-- Wing Fins -->
        <polygon points="0,-30 -40,-75 -70,-65 -40,-25" fill="#cbd5e1" stroke="#0ea5e9" stroke-width="2" />
        <polygon points="0,30 -40,75 -70,65 -40,25" fill="#cbd5e1" stroke="#0ea5e9" stroke-width="2" />
      </g>

      <!-- HUD Telemetry Overlay -->
      <text x="60" y="80" fill="#38bdf8" font-family="monospace" font-size="20" font-weight="bold">TRANSMISSION: ODYSSEY-9 // INTERSTELLAR TRANSIT</text>
      <text x="60" y="110" fill="#94a3b8" font-family="monospace" font-size="14">VELOCITY: 0.42c · SUBSYSTEMS NOMINAL · CREW: BANNU</text>
      <line x1="60" y1="125" x2="600" y2="125" stroke="#0284c7" stroke-width="1" />
    </svg>`;
  }

  // Stage 2: Internal Damage & System Failure (3.5s to 7.0s)
  if (t < 7.0) {
    const flash = Math.sin((t - 3.5) * 16) > 0;
    const bgCol = flash ? "#3b0707" : "#0d0404";
    const alertCol = flash ? "#ef4444" : "#f87171";

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
      <rect width="${WIDTH}" height="${HEIGHT}" fill="${bgCol}" />

      <!-- Cockpit Emergency Console Silhouette -->
      <path d="M0,720 L150,480 L350,540 L730,540 L930,480 L1080,720 Z" fill="#18181b" stroke="#7f1d1d" stroke-width="3" />

      <!-- Cracked windshield lines -->
      <path d="M540,200 L620,320 L580,380 L690,440" stroke="#fca5a5" stroke-width="3" fill="none" opacity="0.8" />
      <path d="M620,320 L520,340 L480,410" stroke="#fca5a5" stroke-width="2" fill="none" opacity="0.8" />

      <!-- Center Warning Diamond -->
      <g transform="translate(540, 260)">
        <polygon points="0,-80 80,0 0,80 -80,0" fill="#7f1d1d" stroke="${alertCol}" stroke-width="4" />
        <text x="0" y="10" fill="#ffffff" font-family="sans-serif" font-size="38" font-weight="900" text-anchor="middle">!</text>
      </g>

      <!-- Flashing Warning Banner -->
      <rect x="240" y="380" width="600" height="70" rx="10" fill="#450a0a" stroke="${alertCol}" stroke-width="2" />
      <text x="540" y="425" fill="${alertCol}" font-family="monospace" font-size="24" font-weight="bold" text-anchor="middle" letter-spacing="2">
        CRITICAL FAILURE // PROPULSION COLLAPSE
      </text>

      <text x="540" y="620" fill="#fca5a5" font-family="monospace" font-size="18" text-anchor="middle">
        EMERGENCY DESCENT INITIATED · TERRAIN IMPACT IMMINENT
      </text>
    </svg>`;
  }

  // Stage 3: Crash Landing Impact (7.0s to 10.5s)
  if (t < 10.5) {
    const progress = (t - 7.0) / 3.5;
    const impactScale = 1 + progress * 0.4;
    const dustAlpha = Math.min(1, progress * 1.5);

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
      <!-- Alien sky during crash -->
      <rect width="${WIDTH}" height="${HEIGHT}" fill="#0f172a" />
      <path d="M0,0 L${WIDTH},0 L${WIDTH},450 L0,400 Z" fill="#1e1b4b" opacity="0.7" />

      <!-- Alien Mountain spires -->
      <polygon points="0,520 180,260 360,520" fill="#090d16" />
      <polygon points="300,520 480,200 660,520" fill="#0f172a" />
      <polygon points="600,520 780,240 960,520" fill="#090d16" />
      <polygon points="850,520 980,310 1080,520" fill="#060910" />

      <!-- Crashed ship embedded in terrain, smoking -->
      <g transform="translate(680, 460) rotate(-22)">
        <polygon points="120,0 20,-35 -80,-25 -70,0 -80,25 20,35" fill="#475569" stroke="#f97316" stroke-width="2" />
        <!-- Smoke plume rising -->
        <circle cx="-50" cy="-40" r="30" fill="#334155" opacity="0.6" />
        <circle cx="-70" cy="-90" r="45" fill="#1e293b" opacity="0.5" />
        <circle cx="-90" cy="-150" r="60" fill="#0f172a" opacity="0.4" />
        <!-- Fire glow -->
        <circle cx="-40" cy="-10" r="18" fill="#f97316" opacity="0.8" />
        <circle cx="-40" cy="-10" r="8" fill="#fef08a" />
      </g>

      <!-- Ground crags -->
      <rect x="0" y="500" width="${WIDTH}" height="220" fill="#070b14" />
      <path d="M0,500 Q300,470 600,510 T${WIDTH},490 L${WIDTH},720 L0,720 Z" fill="#0a101d" />

      <text x="60" y="80" fill="#f97316" font-family="monospace" font-size="20" font-weight="bold">IMPACT RECORDED // HULL INTEGRITY AT 14%</text>
      <text x="60" y="110" fill="#94a3b8" font-family="monospace" font-size="14">ATMOSPHERE: UNCHARTED PLANET · LIFE SUPPORT: ACTIVE</text>
    </svg>`;
  }

  // Stage 4: Boy Stepping Out onto Unknown Planet & Title (10.5s to 14.0s)
  const p4 = (t - 10.5) / 3.5;
  const explorerY = 480;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
    <!-- Twilight Alien Sky -->
    <rect width="${WIDTH}" height="${HEIGHT}" fill="#050a14" />

    <!-- Twin Moons & Planetary Rings -->
    <ellipse cx="880" cy="180" rx="70" ry="70" fill="#22d3ee" opacity="0.3" />
    <ellipse cx="880" cy="180" rx="140" ry="16" fill="none" stroke="#38bdf8" stroke-width="2" opacity="0.5" transform="rotate(-20 880 180)" />
    <circle cx="720" cy="120" r="24" fill="#fbbf24" opacity="0.35" />

    <!-- Distant mountains -->
    <polygon points="0,550 200,320 400,550" fill="#091424" />
    <polygon points="350,550 550,300 750,550" fill="#0d1b2e" />
    <polygon points="700,550 900,340 1080,550" fill="#091424" />

    <!-- Crashed starship in distance -->
    <g transform="translate(850, 480) rotate(-18) scale(0.7)">
      <polygon points="120,0 20,-35 -80,-25 -70,0 -80,25 20,35" fill="#334155" stroke="#0284c7" stroke-width="2" />
      <circle cx="-50" cy="-50" r="30" fill="#1e293b" opacity="0.5" />
    </g>

    <!-- Rocky Ridge Foreground -->
    <path d="M0,530 Q300,500 600,540 T${WIDTH},520 L${WIDTH},720 L0,720 Z" fill="#060c18" />

    <!-- Boy Explorer (Bannu) standing in spacesuit viewed from behind -->
    <g transform="translate(380, ${explorerY}) scale(1.1)">
      <!-- Boots & Legs -->
      <rect x="-18" y="70" width="12" height="40" rx="3" fill="#e2e8f0" stroke="#0f172a" stroke-width="2" />
      <rect x="6" y="70" width="12" height="40" rx="3" fill="#e2e8f0" stroke="#0f172a" stroke-width="2" />
      <!-- Torso with copper straps -->
      <rect x="-24" y="15" width="48" height="58" rx="8" fill="#f8fafc" stroke="#334155" stroke-width="2" />
      <rect x="-16" y="20" width="32" height="38" rx="4" fill="#1e293b" />
      <!-- Oxygen core cyan pulse -->
      <circle cx="0" cy="38" r="6" fill="#22d3ee" />
      <!-- Backpack -->
      <rect x="-20" y="18" width="40" height="42" rx="5" fill="#0f172a" stroke="#f59e0b" stroke-width="1.5" />
      <!-- Arms -->
      <rect x="-30" y="22" width="9" height="42" rx="4" fill="#cbd5e1" stroke="#334155" stroke-width="1.5" />
      <rect x="21" y="22" width="9" height="42" rx="4" fill="#cbd5e1" stroke="#334155" stroke-width="1.5" />
      <!-- Explorer Helmet -->
      <circle cx="0" cy="0" r="18" fill="#f1f5f9" stroke="#334155" stroke-width="2" />
      <ellipse cx="0" cy="-1" rx="12" ry="14" fill="#0f172a" stroke="#f59e0b" stroke-width="1.2" />
      <!-- Visor reflection -->
      <path d="M-6,-6 Q0,-10 6,-6" stroke="#38bdf8" stroke-width="2" fill="none" />
    </g>

    <!-- Climax Title: WELCOME TO THE UNKNOWN -->
    <rect x="190" y="180" width="700" height="110" rx="16" fill="#020617" fill-opacity="0.85" stroke="#38bdf8" stroke-width="2" />
    <text x="540" y="235" fill="#f8fafc" font-family="sans-serif" font-size="34" font-weight="900" text-anchor="middle" letter-spacing="4">
      WELCOME TO THE UNKNOWN
    </text>
    <text x="540" y="270" fill="#38bdf8" font-family="monospace" font-size="16" font-weight="bold" text-anchor="middle" letter-spacing="2">
      CAPTAIN BANNU // EXPLORATION COMMENCES
    </text>
  </svg>`;
}

async function main() {
  const tmpDir = '/tmp/intro_frames';
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

  console.log('Writing frame SVGs...');
  for (let i = 0; i < TOTAL_FRAMES; i++) {
    const svg = getSvgForFrame(i);
    const fname = path.join(tmpDir, `frame_${String(i).padStart(4, '0')}.svg`);
    fs.writeFileSync(fname, svg, 'utf-8');
  }

  console.log('Encoding with ffmpeg + synthesized audio...');

  // Audio filter generates sci-fi soundscape: deep space drone -> alarms -> crash roar -> alien wind & melodic resolve
  const audioFilter = `
    aevalsrc=
      '0.15*sin(2*PI*55*t) + 0.08*sin(2*PI*110*t) +
       if(between(t,3.5,7.0), 0.2*sin(2*PI*880*t)*sin(2*PI*8*t), 0) +
       if(between(t,7.0,10.0), 0.18*(2*random(0)-1)*exp(-(t-7.0)), 0) +
       if(gte(t,10.5), 0.12*sin(2*PI*523.25*t) + 0.1*sin(2*PI*659.25*t) + 0.08*sin(2*PI*783.99*t), 0)'
      :s=44100:d=${DURATION}
  `.replace(/\s+/g, '');

  const ffmpegArgs = [
    '-y',
    '-framerate', String(FPS),
    '-i', `${tmpDir}/frame_%04d.svg`,
    '-f', 'lavfi',
    '-i', `aevalsrc=0.1*sin(2*PI*65*t)+if(between(t\\,3.5\\,7.0)\\,0.15*sin(2*PI*880*t)*sin(2*PI*6*t)\\,0)+if(gte(t\\,10.5)\\,0.12*sin(2*PI*523.25*t)+0.08*sin(2*PI*783.99*t)\\,0):s=44100:d=${DURATION}`,
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-preset', 'fast',
    '-c:a', 'aac',
    '-b:a', '128k',
    '-shortest',
    OUTPUT_VIDEO
  ];

  const proc = spawn('ffmpeg', ffmpegArgs);

  proc.stderr.on('data', (d) => {
    // console.log(d.toString());
  });

  proc.on('close', (code) => {
    if (code === 0) {
      console.log(`Video generated successfully: ${OUTPUT_VIDEO}`);
      // Also make a copy to public/bannu_intro.mp4
      fs.copyFileSync(OUTPUT_VIDEO, '/public/bannu_intro.mp4');
      console.log('Copied to /public/bannu_intro.mp4');
    } else {
      console.error(`ffmpeg failed with code ${code}`);
    }
  });
}

main().catch(console.error);
