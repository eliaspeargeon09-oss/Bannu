const ffmpeg = require('@ffmpeg-installer/ffmpeg');
const { execSync } = require('child_process');
const path = require('path');

const files = ['5.mp4', '6.mp4', 'WhatsApp Audio 2026-10-28 at 4.32.18 PM.mp4'];

files.forEach(file => {
  console.log('====================================');
  console.log('FILE:', file);
  try {
    const filePath = path.join(__dirname, '..', 'public', 'videos', file);
    const cmd = `"${ffmpeg.path}" -i "${filePath}"`;
    execSync(cmd, { stdio: 'pipe' });
  } catch (err) {
    console.log(err.stderr ? err.stderr.toString() : err.message);
  }
});
