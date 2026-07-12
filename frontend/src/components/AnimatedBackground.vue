<template>
  <div class="animated-bg">
    <div class="bg-gradient"></div>
    <div class="bg-orb orb-1"></div>
    <div class="bg-orb orb-2"></div>
    <div class="bg-orb orb-3"></div>
    <div class="bg-particles">
      <div v-for="n in 30" :key="n" class="particle" :style="particleStyle(n)"></div>
    </div>
    <div class="bg-grid"></div>
  </div>
</template>

<script setup lang="ts">
function particleStyle(n: number) {
  const size = 2 + Math.random() * 6
  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 12}s`,
    animationDuration: `${8 + Math.random() * 10}s`,
    opacity: 0.1 + Math.random() * 0.3,
  }
}
</script>

<style scoped>
.animated-bg {
  position: fixed; inset: 0; overflow: hidden; z-index: 0;
  pointer-events: none;
}
.bg-gradient {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse at top left, #1e1b4b 0%, transparent 50%), radial-gradient(ellipse at bottom right, #312e81 0%, transparent 50%), linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
}
.bg-orb {
  position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.4;
}
.orb-1 {
  width: 400px; height: 400px; background: #6366f1; top: -100px; left: -100px;
  animation: orbFloat1 20s ease-in-out infinite;
}
.orb-2 {
  width: 350px; height: 350px; background: #8b5cf6; bottom: -80px; right: -50px;
  animation: orbFloat2 25s ease-in-out infinite;
}
.orb-3 {
  width: 300px; height: 300px; background: #ec4899; top: 40%; right: 20%;
  animation: orbFloat3 22s ease-in-out infinite;
}
@keyframes orbFloat1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(50px, 30px) scale(1.1); }
  66% { transform: translate(-30px, 20px) scale(0.95); }
}
@keyframes orbFloat2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(-40px, -30px) scale(1.05); }
  66% { transform: translate(30px, -20px) scale(0.9); }
}
@keyframes orbFloat3 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(20px, -40px) scale(1.08); }
}
.bg-grid {
  position: absolute; inset: 0;
  background-image: linear-gradient(rgba(148, 163, 184, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 163, 184, 0.03) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: gridMove 30s linear infinite;
}
@keyframes gridMove {
  0% { background-position: 0 0; }
  100% { background-position: 50px 50px; }
}
.bg-particles { position: absolute; inset: 0; }
.particle {
  position: absolute; bottom: -10px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(99,102,241,0.6), rgba(139,92,246,0.4));
  animation: floatUp linear infinite;
}
@keyframes floatUp {
  0% { transform: translateY(0) translateX(0) rotate(0deg); opacity: 0; }
  10% { opacity: 0.4; }
  90% { opacity: 0.15; }
  100% { transform: translateY(-120vh) translateX(50px) rotate(360deg); opacity: 0; }
}
</style>
