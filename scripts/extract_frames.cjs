const ffmpeg = require('@ffmpeg-installer/ffmpeg');
const { spawnSync } = require('child_process');
const path = require('path');

const projectRoot = path.join(__dirname, '..');

// Extract frame from 5.mp4
spawnSync(ffmpeg.path, [
  '-y',
  '-ss', '00:00:02',
  '-i', path.join(projectRoot, 'public', 'videos', '5.mp4'),
  '-vframes', '1',
  path.join(projectRoot, 'public', 'images', 'frame_5.jpg')
]);

// Extract frame from 6.mp4
spawnSync(ffmpeg.path, [
  '-y',
  '-ss', '00:00:02',
  '-i', path.join(projectRoot, 'public', 'videos', '6.mp4'),
  '-vframes', '1',
  path.join(projectRoot, 'public', 'images', 'frame_6.jpg')
]);

console.log('Frames extracted successfully');
