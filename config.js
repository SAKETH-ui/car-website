/**
 * NOCTIS Configuration
 * All section heights, chapter ranges, frame counts, paths, and callouts
 */
const CONFIG = {
  hero: {
    wrapperHeight: '600vh',
    frameCount: 187,
    desktopFolder: 'assets/frames/hero',
    mobileFolder: 'assets/frames/hero-mobile',
    desktopPath: (num) => `assets/frames/hero/frame_${String(num).padStart(4, '0')}.webp`,
    mobilePath: (num) => `assets/frames/hero-mobile/frame_${String(num).padStart(4, '0')}.webp`,
    initialPreloadCount: 40,
    speed: { min: 0, max: 118, unit: 'KM/H' },
    distance: { min: 0.0, max: 4.2, unit: 'KM' },
    fadeToBlackStart: 0.95,
    chapters: [
      {
        id: 'hero-ch-1',
        start: 0.00,
        end: 0.12,
        title: 'NOCTIS',
        subtitle: 'The city is asleep.',
        hint: 'SCROLL TO WAKE IT',
        indicator: '01/04'
      },
      {
        id: 'hero-ch-2',
        start: 0.22,
        end: 0.40,
        headline: "It doesn't need the city's light.",
        indicator: '02/04'
      },
      {
        id: 'hero-ch-3',
        start: 0.50,
        end: 0.68,
        headline: 'It brings its own.',
        indicator: '03/04'
      },
      {
        id: 'hero-ch-4',
        start: 0.80,
        end: 1.00,
        model: 'GT-E',
        specs: '0–100 KM/H 3.1S · 640 KM RANGE · DUAL MOTOR',
        linkText: 'Discover the GT-E',
        linkHref: '#lineup',
        indicator: '04/04'
      }
    ]
  },

  statement: {
    tag: '02 — ENGINEERING',
    text: 'Every part was designed to disappear into one line of light.'
  },

  dismantle: {
    wrapperHeight: '350vh',
    frameCount: 41,
    desktopFolder: 'assets/frames/dismantle',
    mobileFolder: 'assets/frames/dismantle-mobile',
    desktopPath: (num) => `assets/frames/dismantle/frame_${String(num).padStart(4, '0')}.webp`,
    mobilePath: (num) => `assets/frames/dismantle-mobile/frame_${String(num).padStart(4, '0')}.webp`,
    calloutStartProgress: 0.70,
    callouts: [
      {
        id: 'body',
        progress: 0.72,
        label: 'BODY',
        desc: 'Carbon composite monocoque',
        dot: { x: 52, y: 34 },
        line: { x: 26, y: 24 }
      },
      {
        id: 'battery',
        progress: 0.79,
        label: 'BATTERY',
        desc: '110 kWh structural pack',
        dot: { x: 44, y: 65 },
        line: { x: 24, y: 76 }
      },
      {
        id: 'drive',
        progress: 0.86,
        label: 'DRIVE',
        desc: 'Dual axial-flux motors, 680 kW',
        dot: { x: 67, y: 58 },
        line: { x: 80, y: 44 }
      },
      {
        id: 'light',
        progress: 0.93,
        label: 'LIGHT',
        desc: 'Single-line LED signature',
        dot: { x: 82, y: 46 },
        line: { x: 82, y: 72 }
      }
    ]
  },

  lineup: {
    tag: '03 — THE LINEUP',
    headline: 'Five ways to drive the night.',
    defaultActive: 0,
    cars: [
      {
        id: 'gt-e',
        number: '01',
        name: 'GT-E',
        tagline: 'The grand tourer.',
        specs: [
          { label: 'RANGE', value: '640 KM' },
          { label: '0–100 KM/H', value: '3.1 S' },
          { label: 'POWER', value: '680 KW' }
        ],
        image: 'assets/cars/gt-e.webp',
        alt: 'NOCTIS GT-E matte graphite grand tourer coupe side profile',
        swatches: ['#1A1C20', '#EDEAE4', '#0D1B2A', '#8B0000']
      },
      {
        id: 's',
        number: '02',
        name: 'S',
        tagline: 'Four doors, no compromise.',
        specs: [
          { label: 'RANGE', value: '600 KM' },
          { label: '0–100 KM/H', value: '3.6 S' },
          { label: 'POWER', value: '520 KW' }
        ],
        image: 'assets/cars/s.webp',
        alt: 'NOCTIS S satin bone white electric sport sedan side profile',
        swatches: ['#EDEAE4', '#1A1C20', '#1F2937', '#2E4057']
      },
      {
        id: 'x',
        number: '03',
        name: 'X',
        tagline: 'Higher, never heavier.',
        specs: [
          { label: 'RANGE', value: '560 KM' },
          { label: '0–100 KM/H', value: '4.2 S' },
          { label: 'POWER', value: '480 KW' }
        ],
        image: 'assets/cars/x.webp',
        alt: 'NOCTIS X midnight blue electric luxury crossover SUV side profile',
        swatches: ['#0A192F', '#1A1C20', '#EDEAE4', '#3E4E50']
      },
      {
        id: 'r',
        number: '04',
        name: 'R',
        tagline: 'Built for the track.',
        specs: [
          { label: 'RANGE', value: '420 KM' },
          { label: '0–100 KM/H', value: '2.4 S' },
          { label: 'POWER', value: '900 KW' }
        ],
        image: 'assets/cars/r.webp',
        alt: 'NOCTIS R satin black electric track coupe with rear wing side profile',
        swatches: ['#0D0D0E', '#E1251B', '#1E242B', '#E5E7EB']
      },
      {
        id: 'one',
        number: '05',
        name: 'ONE',
        tagline: 'The future, early.',
        specs: [
          { label: 'RANGE', value: 'CONCEPT' },
          { label: '0–100 KM/H', value: 'CONCEPT' },
          { label: 'POWER', value: 'CONCEPT' }
        ],
        image: 'assets/cars/one.webp',
        alt: 'NOCTIS ONE liquid silver concept electric hypercar side profile',
        swatches: ['#D1D5DB', '#111827', '#CFE3FF', '#4B5563']
      }
    ]
  },

  reserve: {
    headline: 'Drive the night.',
    desc: 'Production strictly limited to 500 numbered chassis worldwide. Initial deliveries commence Autumn 2026.',
    btnLabel: 'RESERVE YOUR NOCTIS'
  }
};

