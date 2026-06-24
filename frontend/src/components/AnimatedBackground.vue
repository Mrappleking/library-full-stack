<template>
  <div class="animated-bg">
    <div class="gradient-layer" />
    <div class="particles">
      <span v-for="i in 20" :key="i" class="particle" :style="particleStyle(i)" />
    </div>
  </div>
</template>

<script setup lang="ts">
function particleStyle(i: number) {
  const size = 2 + Math.random() * 4
  const left = Math.random() * 100
  const delay = Math.random() * 12
  const duration = 8 + Math.random() * 16
  const opacity = 0.08 + Math.random() * 0.12
  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${left}%`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`,
    opacity,
  }
}
</script>

<style scoped>
.animated-bg {
  position: fixed; inset: 0; z-index: 0;
  background: #08090b;
}
.gradient-layer {
  position: absolute; inset: 0;
  background:
    radial-gradient(ellipse 80% 60% at 20% 30%, rgba(94,106,210,0.12) 0%, transparent 60%),
    radial-gradient(ellipse 60% 80% at 80% 70%, rgba(113,112,255,0.10) 0%, transparent 60%),
    radial-gradient(ellipse 50% 50% at 50% 50%, rgba(200,160,80,0.06) 0%, transparent 50%),
    radial-gradient(ellipse 40% 40% at 10% 80%, rgba(94,106,210,0.08) 0%, transparent 50%),
    radial-gradient(ellipse 30% 40% at 90% 20%, rgba(255,255,255,0.03) 0%, transparent 50%);
  animation: gradientShift 20s ease-in-out infinite alternate;
}
@keyframes gradientShift {
  0% { opacity: 0.8; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.05); }
  100% { opacity: 0.85; transform: scale(1.02); }
}

.particle {
  position: absolute; bottom: -10px;
  background: var(--accent, #5e6ad2);
  border-radius: 50%;
  animation: floatUp linear infinite;
  pointer-events: none;
}
.particle:nth-child(odd) { background: rgba(113,112,255,0.4); }
.particle:nth-child(3n) { background: rgba(200,160,80,0.3); }

@keyframes floatUp {
  0% { transform: translateY(0) translateX(0) scale(1); opacity: var(--opacity, 0.1); }
  50% { transform: translateY(-60vh) translateX(20px) scale(1.5); opacity: 0; }
  100% { transform: translateY(-100vh) translateX(-10px) scale(0.5); opacity: 0; }
}
</style>
