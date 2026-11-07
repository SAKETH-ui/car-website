/**
 * NOCTIS — MAIN APPLICATION CONTROLLER
 * Vanilla JavaScript · Zero Dependencies · Scrollytelling on Canvas
 */

(function () {
  'use strict';

  // --- Environmental flags ---
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let isMobile = window.innerWidth < 768;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  // --- Element references ---
  const preloader = document.getElementById('preloader');
  const preloaderBar = document.getElementById('preloaderBar');
  const preloaderCount = document.getElementById('preloaderCount');
  const siteHeader = document.getElementById('siteHeader');
  const grainOverlay = document.getElementById('grainOverlay');

  // Hero elements
  const heroWrapper = document.getElementById('hero');
  const heroCanvas = document.getElementById('heroCanvas');
  const heroCtx = heroCanvas.getContext('2d');
  const heroBlackout = document.getElementById('heroBlackout');
  const heroProgressBar = document.getElementById('heroProgressBar');
  const hudChapterVal = document.getElementById('hudChapterVal');
  const hudSpeedVal = document.getElementById('hudSpeedVal');
  const hudDistVal = document.getElementById('hudDistVal');
  const heroChapters = [
    document.getElementById('heroCh1'),
    document.getElementById('heroCh2'),
    document.getElementById('heroCh3'),
    document.getElementById('heroCh4')
  ];

  // Statement elements
  const statementSection = document.getElementById('statement');
  const statementQuote = document.getElementById('statementQuote');

  // Dismantle elements
  const dismantleWrapper = document.getElementById('technology');
  const dismantleCanvas = document.getElementById('dismantleCanvas');
  const dismantleCtx = dismantleCanvas.getContext('2d');
  const dismantleProgressBar = document.getElementById('dismantleProgressBar');
  const dismantleSvg = document.getElementById('dismantleSvg');

  // Lineup elements
  const lineupAccordion = document.getElementById('lineupAccordion');

  // Cursor elements
  const cursorHeadlight = document.getElementById('cursorHeadlight');
  const cursorLabel = document.getElementById('cursorLabel');

  // --- State storage ---
  const heroFrames = [];
  const dismantleFrames = [];
  let heroLoadedCount = 0;
  let dismantleLoadedCount = 0;

  // Smoothing state for canvases
  let heroTargetProgress = 0;
  let heroCurrentFrame = 0;
  let heroDrawnFrame = -1;

  let dismantleTargetProgress = 0;
  let dismantleCurrentFrame = 0;
  let dismantleDrawnFrame = -1;

  // Nav scroll tracking
  let lastScrollY = window.scrollY;

  // Cursor state
  const mouse = { x: -100, y: -100 };
  const cursor = { x: -100, y: -100 };
  let isCursorHover = false;
  let currentCursorLabel = '';

  // Clamp utility
  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  // --------------------------------------------------------------------------
  // 1. FILM GRAIN GENERATOR (Shifted ~8 times/sec, 3-4% opacity, no vignette)
  // --------------------------------------------------------------------------
  function initFilmGrain() {
    if (!grainOverlay) return;
    const gCanvas = document.createElement('canvas');
    gCanvas.width = 256;
    gCanvas.height = 256;
    const gCtx = gCanvas.getContext('2d');
    const imgData = gCtx.createImageData(256, 256);
    const buf = imgData.data;

    for (let i = 0; i < buf.length; i += 4) {
      const v = Math.floor(Math.random() * 255);
      buf[i] = v;
      buf[i + 1] = v;
      buf[i + 2] = v;
      buf[i + 3] = 255;
    }
    gCtx.putImageData(imgData, 0, 0);

    grainOverlay.style.backgroundImage = `url(${gCanvas.toDataURL()})`;

    // Jitter background position at ~8Hz (every 125ms)
    setInterval(() => {
      const rx = Math.floor(Math.random() * 256);
      const ry = Math.floor(Math.random() * 256);
      grainOverlay.style.backgroundPosition = `${rx}px ${ry}px`;
    }, 125);
  }

  // --------------------------------------------------------------------------
  // 2. FRAME PRELOADING PIPELINE
  // Priority: Hero 1..40 first -> Reveal site -> Hero 41..187 -> Dismantle 1..41
  // --------------------------------------------------------------------------
  function createFrameLoader(url) {
    const img = new Image();
    img.src = url;
    return img;
  }

  async function loadFrameWithDecode(img) {
    try {
      if (img.decode) {
        await img.decode();
      }
    } catch (e) {
      // Decode failed or unsupported, continue gracefully
    }
    return img;
  }

  function getLoadedFrame(frameArray, targetIdx) {
    if (frameArray[targetIdx] && frameArray[targetIdx].complete && frameArray[targetIdx].naturalWidth > 0) {
      return frameArray[targetIdx];
    }
    // Search outward for the nearest loaded frame
    let offset = 1;
    while (targetIdx - offset >= 0 || targetIdx + offset < frameArray.length) {
      const left = targetIdx - offset;
      if (left >= 0 && frameArray[left] && frameArray[left].complete && frameArray[left].naturalWidth > 0) {
        return frameArray[left];
      }
      const right = targetIdx + offset;
      if (right < frameArray.length && frameArray[right] && frameArray[right].complete && frameArray[right].naturalWidth > 0) {
        return frameArray[right];
      }
      offset++;
    }
    return null;
  }

  async function startPreloader() {
    const heroCount = CONFIG.hero.frameCount;
    const initialTarget = CONFIG.hero.initialPreloadCount; // 40
    const getHeroPath = isMobile ? CONFIG.hero.mobilePath : CONFIG.hero.desktopPath;

    // Initialize arrays
    for (let i = 0; i < heroCount; i++) {
      heroFrames[i] = createFrameLoader(getHeroPath(i + 1));
    }

    // Load first 40 frames to unlock view
    let loadedPriority = 0;
    const priorityPromises = [];

    for (let i = 0; i < initialTarget; i++) {
      const p = loadFrameWithDecode(heroFrames[i]).then(() => {
        loadedPriority++;
        heroLoadedCount++;
        const pct = Math.floor((loadedPriority / initialTarget) * 100);
        if (preloaderBar) {
          preloaderBar.style.transform = `translateX(-50%) scaleX(${pct / 100})`;
        }
        if (preloaderCount) {
          preloaderCount.textContent = String(pct).padStart(3, '0');
        }
      });
      priorityPromises.push(p);
    }

    await Promise.all(priorityPromises);

    // Initial frames ready: flash line white then fade preloader
    if (preloaderBar) {
      preloaderBar.classList.add('preloader-bar--flash');
    }

    setTimeout(() => {
      if (preloader) {
        preloader.classList.add('preloader--hidden');
      }
      document.body.classList.remove('is-loading');

      // Draw initial frames on canvas
      resizeCanvases();
      drawHeroCanvas(0);
      drawDismantleCanvas(0);

      // Continue background loading for the remaining frames
      loadRemainingFrames();
    }, 200);
  }

  async function loadRemainingFrames() {
    const heroCount = CONFIG.hero.frameCount;
    const dismantleCount = CONFIG.dismantle.frameCount;
    const initialTarget = CONFIG.hero.initialPreloadCount;
    const getDismantlePath = isMobile ? CONFIG.dismantle.mobilePath : CONFIG.dismantle.desktopPath;

    // 1. Remaining hero frames (41..187)
    for (let i = initialTarget; i < heroCount; i++) {
      await loadFrameWithDecode(heroFrames[i]);
      heroLoadedCount++;
    }

    // 2. Dismantle frames (1..41)
    for (let i = 0; i < dismantleCount; i++) {
      dismantleFrames[i] = createFrameLoader(getDismantlePath(i + 1));
      await loadFrameWithDecode(dismantleFrames[i]);
      dismantleLoadedCount++;
    }
  }

  // --------------------------------------------------------------------------
  // 3. CANVAS SIZING & DRAWING (Cover-fit on landscape, contain-fit on portrait)
  // --------------------------------------------------------------------------
  function resizeCanvases() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    if (heroCanvas) {
      heroCanvas.width = Math.round(w * dpr);
      heroCanvas.height = Math.round(h * dpr);
      heroDrawnFrame = -1; // Force redraw
    }

    if (dismantleCanvas) {
      dismantleCanvas.width = Math.round(w * dpr);
      dismantleCanvas.height = Math.round(h * dpr);
      dismantleDrawnFrame = -1;
    }
  }

  function drawFrameOnCanvas(ctx, canvas, img) {
    if (!ctx || !canvas || !img) return;

    const cw = canvas.width / dpr;
    const ch = canvas.height / dpr;
    const iw = img.naturalWidth || 1600;
    const ih = img.naturalHeight || 900;

    ctx.save();
    ctx.scale(dpr, dpr);

    // Strict: Background is solid #07080A
    ctx.fillStyle = '#07080A';
    ctx.fillRect(0, 0, cw, ch);

    // Rule: Cover-fit on landscape; on portrait draw contain-fit, vertically centered
    let scale;
    if (cw >= ch) {
      // Landscape: cover-fit
      scale = Math.max(cw / iw, ch / ih);
    } else {
      // Portrait: contain-fit
      scale = Math.min(cw / iw, ch / ih);
    }

    const dw = iw * scale;
    const dh = ih * scale;
    const dx = (cw - dw) / 2;
    const dy = (ch - dh) / 2;

    ctx.drawImage(img, dx, dy, dw, dh);
    ctx.restore();
  }

  function drawHeroCanvas(frameIdx) {
    const img = getLoadedFrame(heroFrames, frameIdx);
    if (img) {
      drawFrameOnCanvas(heroCtx, heroCanvas, img);
      heroDrawnFrame = frameIdx;
    }
  }

  function drawDismantleCanvas(frameIdx) {
    const img = getLoadedFrame(dismantleFrames, frameIdx);
    if (img) {
      drawFrameOnCanvas(dismantleCtx, dismantleCanvas, img);
      dismantleDrawnFrame = frameIdx;
    }
  }

  // --------------------------------------------------------------------------
  // 4. SCROLL CALCULATIONS & RENDER LOOP
  // --------------------------------------------------------------------------
  function updateScrollProgress() {
    const scrollY = window.scrollY;
    const winH = window.innerHeight;

    // Header hide on scroll down, show on scroll up
    if (siteHeader) {
      if (scrollY > lastScrollY && scrollY > 100) {
        siteHeader.classList.add('nav--hidden');
      } else {
        siteHeader.classList.remove('nav--hidden');
      }
    }
    lastScrollY = scrollY;

    // --- Hero Section Progress ---
    if (heroWrapper) {
      const rect = heroWrapper.getBoundingClientRect();
      const scrollableDist = heroWrapper.offsetHeight - winH;
      heroTargetProgress = scrollableDist > 0 ? clamp(-rect.top / scrollableDist, 0, 1) : 0;
    }

    // --- Dismantle Section Progress ---
    if (dismantleWrapper) {
      const rect = dismantleWrapper.getBoundingClientRect();
      const scrollableDist = dismantleWrapper.offsetHeight - winH;
      dismantleTargetProgress = scrollableDist > 0 ? clamp(-rect.top / scrollableDist, 0, 1) : 0;
    }

    // --- Statement Section Word Illumination ---
    updateStatementScroll();
  }

  function updateStatementScroll() {
    if (!statementSection) return;
    const rect = statementSection.getBoundingClientRect();
    const winH = window.innerHeight;

    // Progress from entering viewport to center
    const enter = winH;
    const center = winH * 0.45;
    const p = clamp((enter - rect.top) / (enter - center), 0, 1);

    const words = statementSection.querySelectorAll('.statement-word');
    const wordCount = words.length;
    const activeWords = Math.floor(p * wordCount);

    words.forEach((w, idx) => {
      if (idx <= activeWords) {
        w.classList.add('lit');
      } else {
        w.classList.remove('lit');
      }
    });
  }

  // Animation Loop (requestAnimationFrame)
  function renderLoop() {
    if (!isReducedMotion) {
      // 1. Lerp Hero frames: current += (target - current) * 0.15
      const heroTargetFrame = Math.round(heroTargetProgress * (CONFIG.hero.frameCount - 1));
      heroCurrentFrame += (heroTargetFrame - heroCurrentFrame) * 0.15;
      const heroRounded = Math.round(heroCurrentFrame);

      if (heroRounded !== heroDrawnFrame) {
        drawHeroCanvas(heroRounded);
      }

      // Update Hero progress bar
      if (heroProgressBar) {
        heroProgressBar.style.transform = `scaleX(${heroTargetProgress})`;
      }

      // Hero Canvas Fade to Black over last 5% (progress >= 0.95)
      if (heroBlackout) {
        const blackoutAlpha = heroTargetProgress >= 0.95 ? (heroTargetProgress - 0.95) / 0.05 : 0;
        heroBlackout.style.opacity = blackoutAlpha;
      }

      // Update Hero HUD
      updateHeroHud(heroTargetProgress);

      // Update Hero Chapters visibility & line reveals
      updateHeroChapters(heroTargetProgress);

      // 2. Lerp Dismantle frames
      const dismantleTargetFrame = Math.round(dismantleTargetProgress * (CONFIG.dismantle.frameCount - 1));
      dismantleCurrentFrame += (dismantleTargetFrame - dismantleCurrentFrame) * 0.15;
      const dismantleRounded = Math.round(dismantleCurrentFrame);

      if (dismantleRounded !== dismantleDrawnFrame) {
        drawDismantleCanvas(dismantleRounded);
      }

      // Update Dismantle progress bar
      if (dismantleProgressBar) {
        dismantleProgressBar.style.transform = `scaleX(${dismantleTargetProgress})`;
      }

      // Update Dismantle Callouts (after 70% progress)
      updateDismantleCallouts(dismantleTargetProgress);

      // 3. Lerp Custom Cursor
      updateCursorPhysics();
    }

    requestAnimationFrame(renderLoop);
  }

  // --------------------------------------------------------------------------
  // 5. HERO CHAPTERS & HUD UPDATES
  // --------------------------------------------------------------------------
  function updateHeroHud(p) {
    if (!hudChapterVal || !hudSpeedVal || !hudDistVal) return;

    // Chapter Indicator: 01/04 -> 04/04
    let ch = '01/04';
    if (p >= 0.80) ch = '04/04';
    else if (p >= 0.50) ch = '03/04';
    else if (p >= 0.22) ch = '02/04';
    hudChapterVal.textContent = ch;

    // Velocity: 000 -> 118 KM/H
    const speed = Math.round(p * CONFIG.hero.speed.max);
    hudSpeedVal.textContent = `${String(speed).padStart(3, '0')} ${CONFIG.hero.speed.unit}`;

    // Distance: 0.0 -> 4.2 KM
    const dist = (p * CONFIG.hero.distance.max).toFixed(1);
    hudDistVal.textContent = `${dist} ${CONFIG.hero.distance.unit}`;
  }

  function updateHeroChapters(p) {
    const chapters = CONFIG.hero.chapters;

    chapters.forEach((chConfig, idx) => {
      const el = heroChapters[idx];
      if (!el) return;

      const isActive = p >= chConfig.start && p <= chConfig.end;
      if (isActive) {
        if (!el.classList.contains('is-active')) {
          el.classList.add('is-active');
        }
      } else {
        if (el.classList.contains('is-active')) {
          el.classList.remove('is-active');
        }
      }
    });
  }

  // --------------------------------------------------------------------------
  // 6. STATEMENT SECTION WORD BUILDER
  // --------------------------------------------------------------------------
  function initStatementWords() {
    if (!statementQuote) return;
    const text = CONFIG.statement.text;
    const words = text.split(' ');
    statementQuote.innerHTML = '';

    words.forEach((word) => {
      const span = document.createElement('span');
      span.className = 'statement-word';
      span.textContent = word;
      statementQuote.appendChild(span);
    });
  }

  // --------------------------------------------------------------------------
  // 7. DISMANTLE CALLOUTS & CONNECTING HAIRLINES
  // --------------------------------------------------------------------------
  function updateDismantleCallouts(progress) {
    const callouts = CONFIG.dismantle.callouts;
    if (!callouts) return;

    callouts.forEach((co) => {
      const itemEl = document.getElementById(`callout-${co.id}`);
      const dotEl = document.getElementById(`calloutDot-${co.id}`);
      const lineEl = document.getElementById(`svgLine-${co.id}`);

      // Callouts appear sequentially after 70% progress
      const isVisible = progress >= co.progress;

      if (itemEl) {
        itemEl.classList.toggle('is-visible', isVisible);
      }
      if (dotEl) {
        dotEl.classList.toggle('is-visible', isVisible);
      }
      if (lineEl) {
        lineEl.classList.toggle('is-visible', isVisible);
      }
    });
  }

  // --------------------------------------------------------------------------
  // 8. LINEUP ACCORDION (Interactive Hover / Click / Keyboard Accordion)
  // --------------------------------------------------------------------------
  let activeLineupIndex = CONFIG.lineup.defaultActive || 0;
  let lineupDebounceTimer = null;

  function buildLineup() {
    if (!lineupAccordion) return;
    const cars = CONFIG.lineup.cars;
    lineupAccordion.innerHTML = '';

    // Shared floor line at 72% height across accordion
    const floorLine = document.createElement('div');
    floorLine.className = 'lineup-floor-line';
    lineupAccordion.appendChild(floorLine);

    cars.forEach((car, index) => {
      const isOpen = index === activeLineupIndex;
      const slide = document.createElement('div');
      slide.className = `lineup-slide ${isOpen ? 'is-open' : ''}`;
      slide.setAttribute('role', 'tab');
      slide.setAttribute('tabindex', '0');
      slide.setAttribute('aria-selected', isOpen ? 'true' : 'false');
      slide.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      slide.dataset.index = index;

      // Swatches markup
      const swatchesHtml = car.swatches
        .map(
          (color, sIdx) =>
            `<button type="button" class="swatch-btn ${sIdx === 0 ? 'is-active' : ''}" style="background-color: ${color};" aria-label="Color option ${sIdx + 1}" data-color="${color}"></button>`
        )
        .join('');

      // Specs markup
      const specsHtml = car.specs
        .map(
          (spec) => `
        <div class="spec-cell">
          <span class="spec-lbl">${spec.label}</span>
          <span class="spec-num">${spec.value}</span>
        </div>`
        )
        .join('');

      slide.innerHTML = `
        <!-- Closed Slide Vertical Strip -->
        <div class="slide-closed-strip">
          <span class="slide-mono-num">${car.number}</span>
          <span class="slide-vertical-name">${car.name}</span>
        </div>
        <img class="slide-bg-crop" src="${car.image}" alt="" aria-hidden="true" loading="lazy" />

        <!-- Open Slide View -->
        <div class="slide-open-view">
          <div class="slide-open-header">
            <span class="slide-open-num">${car.number}</span>
            <h3 class="slide-open-name">${car.name}</h3>
          </div>

          <div class="slide-hero-img-wrap">
            <img class="slide-hero-car" src="${car.image}" alt="${car.alt}" loading="lazy" />
          </div>

          <div class="slide-open-footer">
            <p class="slide-tagline">${car.tagline}</p>
            <div class="slide-specs-grid">${specsHtml}</div>
            <div class="slide-controls-row">
              <div class="swatch-group" role="group" aria-label="Available Finishes">
                ${swatchesHtml}
              </div>
              <a href="#reserve" class="slide-config-link" data-cursor="CONFIGURE">Configure →</a>
            </div>
          </div>
        </div>
      `;

      // Hover / Focus interactions (Debounced by 80ms to prevent sweeping flicker)
      slide.addEventListener('mouseenter', () => {
        if (!isMobile) {
          clearTimeout(lineupDebounceTimer);
          lineupDebounceTimer = setTimeout(() => {
            setActiveSlide(index);
          }, 80);
        }
      });

      slide.addEventListener('click', (e) => {
        if (!e.target.closest('.swatch-btn') && !e.target.closest('.slide-config-link')) {
          setActiveSlide(index);
        }
      });

      // Keyboard arrow navigation
      slide.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          const next = (activeLineupIndex + 1) % cars.length;
          setActiveSlide(next);
          focusSlide(next);
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          const prev = (activeLineupIndex - 1 + cars.length) % cars.length;
          setActiveSlide(prev);
          focusSlide(prev);
        }
      });

      // Swatch click
      const swatchBtns = slide.querySelectorAll('.swatch-btn');
      swatchBtns.forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          swatchBtns.forEach((b) => b.classList.remove('is-active'));
          btn.classList.add('is-active');
        });
      });

      lineupAccordion.appendChild(slide);
    });

    // IntersectionObserver for entrance stagger
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            lineupAccordion.classList.add('is-entered');
            observer.disconnect();
          }
        });
      },
      { threshold: 0.15 }
    );
    observer.observe(lineupAccordion);
  }

  function setActiveSlide(targetIdx) {
    if (activeLineupIndex === targetIdx) return;
    activeLineupIndex = targetIdx;

    const slides = lineupAccordion.querySelectorAll('.lineup-slide');
    slides.forEach((s, idx) => {
      const isOpen = idx === targetIdx;
      s.classList.toggle('is-open', isOpen);
      s.setAttribute('aria-selected', isOpen ? 'true' : 'false');
      s.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // Update cursor label if mouse is over lineup
    updateLineupCursorState();
  }

  function focusSlide(idx) {
    const slides = lineupAccordion.querySelectorAll('.lineup-slide');
    if (slides[idx]) {
      slides[idx].focus();
    }
  }

  function updateLineupCursorState() {
    const hoveredSlide = document.querySelector('.lineup-slide:hover');
    if (hoveredSlide) {
      const isOpen = hoveredSlide.classList.contains('is-open');
      setCursorHover(true, isOpen ? 'CONFIGURE' : 'OPEN');
    }
  }

  // --------------------------------------------------------------------------
  // 9. CUSTOM CURSOR ("THE HEADLIGHT", Desktop Only)
  // 6px dot inside 28px ring, follows with lerp 0.18
  // Morphs into 44x2px horizontal light bar over interactive items
  // --------------------------------------------------------------------------
  function initCursor() {
    if (isReducedMotion || !cursorHeadlight) return;

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    // Mousedown flash for 120ms
    window.addEventListener('mousedown', () => {
      cursorHeadlight.classList.add('cursor--active');
      setTimeout(() => {
        cursorHeadlight.classList.remove('cursor--active');
      }, 120);
    });

    // Interactive target detection
    document.addEventListener('mouseover', (e) => {
      const target = e.target;
      const link = target.closest('a, button, [role="tab"], .lineup-slide, [data-cursor]');

      if (link) {
        if (link.classList.contains('lineup-slide')) {
          const isOpen = link.classList.contains('is-open');
          setCursorHover(true, isOpen ? 'CONFIGURE' : 'OPEN');
        } else {
          const custom = link.getAttribute('data-cursor') || 'VIEW';
          setCursorHover(true, custom);
        }
      } else {
        setCursorHover(false);
      }
    });
  }

  function setCursorHover(isHover, label = '') {
    if (!cursorHeadlight) return;
    isCursorHover = isHover;
    currentCursorLabel = label;

    if (isHover) {
      cursorHeadlight.classList.add('cursor--hover');
      if (cursorLabel) {
        cursorLabel.textContent = label;
      }
    } else {
      cursorHeadlight.classList.remove('cursor--hover');
      if (cursorLabel) {
        cursorLabel.textContent = '';
      }
    }
  }

  function updateCursorPhysics() {
    if (!cursorHeadlight) return;

    // Follow mouse with lerp 0.18
    cursor.x += (mouse.x - cursor.x) * 0.18;
    cursor.y += (mouse.y - cursor.y) * 0.18;

    cursorHeadlight.style.transform = `translate3d(${cursor.x - 14}px, ${cursor.y - 14}px, 0)`;
  }

  // --------------------------------------------------------------------------
  // 10. RESERVE BUTTON INTERACTION
  // --------------------------------------------------------------------------
  function initReserveButton() {
    const btn = document.getElementById('btnReserve');
    if (!btn) return;

    btn.addEventListener('click', () => {
      // Subtle confirmation
      const originalText = btn.querySelector('.btn-reserve-text').textContent;
      btn.querySelector('.btn-reserve-text').textContent = 'ALLOCATION CONFIRMED';
      setTimeout(() => {
        btn.querySelector('.btn-reserve-text').textContent = originalText;
      }, 3000);
    });
  }

  // --------------------------------------------------------------------------
  // 11. REDUCED MOTION STATIC FALLBACKS
  // --------------------------------------------------------------------------
  function handleReducedMotion() {
    if (!isReducedMotion) return;
    document.body.classList.add('reduce-motion');

    // Draw static hero keyframe (e.g. 50%)
    setTimeout(() => {
      if (heroFrames[90] && heroFrames[90].complete) {
        drawFrameOnCanvas(heroCtx, heroCanvas, heroFrames[90]);
      }
      if (dismantleFrames[0] && dismantleFrames[0].complete) {
        drawFrameOnCanvas(dismantleCtx, dismantleCanvas, dismantleFrames[0]);
      }
    }, 1000);
  }

  // --------------------------------------------------------------------------
  // 12. INITIALIZATION & EVENT LISTENERS
  // --------------------------------------------------------------------------
  function init() {
    initFilmGrain();
    initStatementWords();
    buildLineup();
    initCursor();
    initReserveButton();
    handleReducedMotion();

    // Smooth anchor navigation
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#' || href === '') return;
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    window.addEventListener('resize', () => {
      const currentMobile = window.innerWidth < 768;
      if (currentMobile !== isMobile) {
        isMobile = currentMobile;
      }
      resizeCanvases();
      updateScrollProgress();
    });

    // Start preloading and render loop
    startPreloader();
    requestAnimationFrame(renderLoop);
  }

  // Run on DOM content loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

