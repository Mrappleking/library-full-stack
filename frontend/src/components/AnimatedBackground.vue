<template>
  <div class="animated-bg">
    <div class="orb orb-1" />
    <div class="orb orb-2" />
    <div class="orb orb-3" />
  </div>
</template>

<style>
.animated-bg {
  position: fixed; inset: 0; z-index: 0;
  background: #08090b; overflow: hidden;
}
.orb {
  position: absolute; border-radius: 50%; filter: blur(80px);
  animation: float linear infinite;
}
.orb-1 {
  width: 500px; height: 500px; top: -10%; left: -5%;
  background: rgba(94,106,210,0.15);
  animation-duration: 18s; animation-delay: 0s;
}
.orb-2 {
  width: 400px; height: 400px; bottom: -10%; right: -5%;
  background: rgba(113,112,255,0.12);
  animation-duration: 22s; animation-delay: -7s;
}
.orb-3 {
  width: 350px; height: 350px; top: 50%; left: 50%;
  background: rgba(200,160,80,0.08);
  animation-duration: 25s; animation-delay: -14s;
}

@keyframes float {
  0%   { transform: translate(0, 0) scale(1); }
  33%  { transform: translate(40px, -30px) scale(1.1); }
  66%  { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0, 0) scale(1); }
}
</style>
