/* effects.js — 主页交互效果集
 *
 *   1. 粒子网络背景（仅桌面，canvas 2D）
 *   2. Scroll-reveal: 元素进入视口时淡入上滑
 *   3. 鼠标光晕跟随（仅桌面）
 *   4. 3D 卡片倾斜（仅桌面，hover 时跟随鼠标）
 *   5. 数字统计滚动（counter）— 元素进入视口时从 0 滚到目标值
 *
 * 移动端 / prefers-reduced-motion / 慢设备会自动降级或跳过
 */

(function () {
  'use strict';

  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============================================================
   * 1. 粒子网络背景（桌面专属）
   * ============================================================ */
  function initParticleNetwork() {
    if (isMobile || reducedMotion) return;

    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let W = 0, H = 0;
    const particles = [];
    const PARTICLE_COUNT = 60;
    const CONNECT_DIST = 160;
    const mouse = { x: -1000, y: -1000 };

    function resize() {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.scale(dpr, dpr);
    }

    function spawn() {
      particles.length = 0;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          r: Math.random() * 1.5 + 0.5,
        });
      }
    }

    function tick() {
      ctx.clearRect(0, 0, W, H);

      // update + draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        // 碰边反弹
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;

        // 受鼠标轻微吸引
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const d = Math.hypot(dx, dy);
        if (d < 200 && d > 0) {
          p.x += (dx / d) * 0.15;
          p.y += (dy / d) * 0.15;
        }

        // 画粒子
        ctx.fillStyle = 'rgba(192, 132, 252, 0.55)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // 连线
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.hypot(dx, dy);
          if (d < CONNECT_DIST) {
            const alpha = (1 - d / CONNECT_DIST) * 0.18;
            ctx.strokeStyle = `rgba(168, 85, 247, ${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
        // 鼠标连线（更亮）
        const dxm = particles[i].x - mouse.x;
        const dym = particles[i].y - mouse.y;
        const dm = Math.hypot(dxm, dym);
        if (dm < CONNECT_DIST) {
          const alpha = (1 - dm / CONNECT_DIST) * 0.4;
          ctx.strokeStyle = `rgba(103, 232, 249, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }

      requestAnimationFrame(tick);
    }

    window.addEventListener('mousemove', e => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });
    window.addEventListener('mouseleave', () => {
      mouse.x = -1000;
      mouse.y = -1000;
    });
    window.addEventListener('resize', () => {
      resize();
      spawn();
    });

    resize();
    spawn();
    tick();
  }

  /* ============================================================
   * 2. Scroll Reveal — 元素进入视口时淡入上滑
   * ============================================================ */
  function initScrollReveal() {
    if (reducedMotion) {
      // 直接全部显示
      document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -50px 0px' }
    );

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    // 卡片群组：自动加 .reveal + 错峰延迟
    document.querySelectorAll('.cards .card, .blog-list .blog-item').forEach((el, i) => {
      if (!el.classList.contains('reveal')) {
        el.classList.add('reveal');
        el.style.transitionDelay = (i * 60) + 'ms';
        observer.observe(el);
      }
    });
  }

  /* ============================================================
   * 3. 鼠标光晕跟随（桌面专属）
   * ============================================================ */
  function initCursorGlow() {
    if (isMobile || reducedMotion) return;
    if ('ontouchstart' in window) return;

    const glow = document.createElement('div');
    glow.className = 'cursor-glow';
    document.body.appendChild(glow);

    let mx = 0, my = 0, gx = 0, gy = 0;
    let active = false;

    window.addEventListener('mousemove', e => {
      mx = e.clientX;
      my = e.clientY;
      if (!active) {
        glow.style.opacity = '1';
        active = true;
      }
    });
    window.addEventListener('mouseleave', () => {
      glow.style.opacity = '0';
      active = false;
    });

    function follow() {
      gx += (mx - gx) * 0.14;
      gy += (my - gy) * 0.14;
      glow.style.transform = `translate3d(${gx - 150}px, ${gy - 150}px, 0)`;
      requestAnimationFrame(follow);
    }
    follow();

    // hover 在 button/link 上时光晕变大
    const interactiveSelectors = 'a, button, .btn, .card, .blog-item, .lang-switcher button';
    document.addEventListener('mouseover', e => {
      if (e.target.closest(interactiveSelectors)) {
        glow.classList.add('cursor-glow--hover');
      }
    });
    document.addEventListener('mouseout', e => {
      if (e.target.closest(interactiveSelectors)) {
        glow.classList.remove('cursor-glow--hover');
      }
    });
  }

  /* ============================================================
   * 4. 3D 卡片倾斜（桌面专属）
   * ============================================================ */
  function initCardTilt() {
    if (isMobile || reducedMotion) return;

    const cards = document.querySelectorAll('.card, .blog-item');
    cards.forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const rx = ((y / rect.height) - 0.5) * -6;  // 最大 ±3度
        const ry = ((x / rect.width) - 0.5) * 6;
        card.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  /* ============================================================
   * 5. 数字滚动 counter
   *   <span data-counter="42" data-counter-suffix="+"></span>
   * ============================================================ */
  function initCounters() {
    const els = document.querySelectorAll('[data-counter]');
    if (!els.length) return;

    const animate = el => {
      const target = parseFloat(el.getAttribute('data-counter')) || 0;
      const suffix = el.getAttribute('data-counter-suffix') || '';
      const duration = 1400;
      const start = performance.now();
      const startVal = 0;

      function step(now) {
        const t = Math.min((now - start) / duration, 1);
        // ease-out cubic
        const eased = 1 - Math.pow(1 - t, 3);
        const cur = startVal + (target - startVal) * eased;
        el.textContent = (target % 1 === 0 ? Math.round(cur) : cur.toFixed(1)) + suffix;
        if (t < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    };

    if (reducedMotion) {
      els.forEach(el => {
        const t = el.getAttribute('data-counter');
        const suffix = el.getAttribute('data-counter-suffix') || '';
        el.textContent = t + suffix;
      });
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animate(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    els.forEach(el => observer.observe(el));
  }

  /* ============================================================
   * 入口
   * ============================================================ */
  function init() {
    initParticleNetwork();
    initScrollReveal();
    initCursorGlow();
    initCardTilt();
    initCounters();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
