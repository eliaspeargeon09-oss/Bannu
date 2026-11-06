const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const downloadsDir = path.join('C:', 'Users', 'User', 'Downloads');
const bannuDir = path.join('C:', 'Users', 'User', 'OneDrive', 'Desktop', 'bdays', 'bannu');

// 1. YouTube Image
const ytSrc = path.join(downloadsDir, 'WhatsApp Image 2026-10-28 at 4.56.18 PM.jpeg');
const ytDest = path.join(projectRoot, 'public', 'images', 'youtube_channel.jpg');
if (fs.existsSync(ytSrc)) {
  fs.copyFileSync(ytSrc, ytDest);
  console.log('Copied YouTube image to public/images/youtube_channel.jpg');
} else {
  console.log('ytSrc does not exist:', ytSrc);
}

// 2. Music Piano AI Image
const musicSrc = path.join(bannuDir, 'ChatGPT Image Oct 28, 2026, 08_59_19 PM.png');
const musicDest = path.join(projectRoot, 'public', 'images', 'music_piano_lyrics.png');
if (fs.existsSync(musicSrc)) {
  fs.copyFileSync(musicSrc, musicDest);
  console.log('Copied Music image to public/images/music_piano_lyrics.png');
} else {
  console.log('musicSrc does not exist:', musicSrc);
}
