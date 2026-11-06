const ffmpeg = require('@ffmpeg-installer/ffmpeg');
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const audioDir = path.join(projectRoot, 'public', 'audio');

if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}

const inputVideo = path.join(projectRoot, 'public', 'videos', 'WhatsApp Audio 2026-10-28 at 4.32.18 PM.mp4');
const outputAudio = path.join(audioDir, 'bannu_song.mp3');

console.log('Converting from:', inputVideo);
console.log('Converting to:', outputAudio);

const result = spawnSync(ffmpeg.path, [
  '-y',
  '-i', inputVideo,
  '-vn',
  '-acodec', 'libmp3lame',
  '-ab', '192k',
  '-ar', '44100',
  outputAudio
]);

if (result.error) {
  console.error('Conversion error:', result.error);
} else {
  console.log('ffmpeg exit code:', result.status);
  console.log('Output size:', fs.statSync(outputAudio).size, 'bytes');
}
