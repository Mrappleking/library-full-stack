<template>
  <div class="animated-bg">
    <div class="arch-left" />
    <div class="arch-right" />
    <div class="arch-center" />
    <div class="light-beam beam-1" />
    <div class="light-beam beam-2" />
    <div class="light-beam beam-3" />
    <div class="bookshelf shelf-1" />
    <div class="bookshelf shelf-2" />
    <div class="overlay" />
  </div>
</template>

<style>
.animated-bg {
  position: fixed; inset: 0; z-index: 0; overflow: hidden;
  background: linear-gradient(180deg, #0a0b12 0%, #0f111a 30%, #121420 60%, #0d0f16 100%);
}
/* Arched library windows */
.arch-left, .arch-right, .arch-center {
  position: absolute; bottom: 0;
  border: 1px solid rgba(200,180,140,0.08);
  border-bottom: none;
  background: linear-gradient(180deg, rgba(20,22,35,0.6) 0%, rgba(10,11,18,0.9) 100%);
}
.arch-left {
  left: 5%; width: 28%; height: 85%;
  border-radius: 50% 50% 0 0 / 8% 8% 0 0;
  animation: archPulse 12s ease-in-out infinite;
}
.arch-right {
  right: 5%; width: 28%; height: 85%;
  border-radius: 50% 50% 0 0 / 8% 8% 0 0;
  animation: archPulse 12s ease-in-out infinite 3s;
}
.arch-center {
  left: 50%; transform: translateX(-50%);
  width: 32%; height: 70%;
  border-radius: 50% 50% 0 0 / 12% 12% 0 0;
  animation: archPulse 12s ease-in-out infinite 6s;
}
@keyframes archPulse {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 0.9; }
}
/* Light beams through arches */
.light-beam {
  position: absolute; top: -10%;
  width: 60px;
  background: linear-gradient(180deg,
    rgba(200,160,80,0.06) 0%,
    rgba(200,160,80,0.12) 40%,
    rgba(200,160,80,0.04) 100%);
  filter: blur(30px);
  animation: beamSway 20s ease-in-out infinite;
}
.beam-1 { left: 18%; height: 120%; animation-delay: 0s; transform: rotate(-15deg); }
.beam-2 { left: 45%; height: 100%; animation-delay: -7s; transform: rotate(3deg); width: 80px; }
.beam-3 { left: 65%; height: 130%; animation-delay: -14s; transform: rotate(12deg); }
@keyframes beamSway {
  0%, 100% { opacity: 0.3; transform: rotate(-15deg) translateX(0); }
  50% { opacity: 0.6; transform: rotate(-12deg) translateX(20px); }
}
/* Bookshelf silhouettes */
.bookshelf {
  position: absolute; bottom: 0;
  background:
    repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(200,180,140,0.06) 2px, rgba(200,180,140,0.06) 3px),
    linear-gradient(0deg, rgba(10,11,18,0.8) 0%, transparent 50%);
}
.shelf-1 { left: 32%; width: 8%; height: 40%; animation: shelfGlow 15s ease-in-out infinite; }
.shelf-2 { right: 30%; width: 6%; height: 35%; animation: shelfGlow 15s ease-in-out infinite 5s; }
@keyframes shelfGlow {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.7; }
}
/* Dark overlay for text readability */
.overlay {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse at center, transparent 40%, rgba(8,9,11,0.5) 100%);
}
</style>
