/**
 * Procedural Spatial Audio Engine with ForestAmbienceController for Multiverse Hub
 * 
 * Features:
 * - 100% Procedural Web Audio API (Zero external file dependencies)
 * - ForestAmbienceController:
 *   1. Procedural multi-layer gentle forest breeze with natural gust breathing
 *   2. Procedural randomized forest bird songs (Robin warbles, Warbler trills, distant Doves, Crystal chimes)
 *   3. Subtle twilight night forest insect/cricket ambience
 * - Dynamic Distance-Based Mix Ratio System:
 *   - Dynamically crossfades between Serene Forest Ambience and Portal Vortex Hum based on
 *     player position (Center Sanctuary vs. Outer Portals)
 * - Smooth exponential gain transitions and zero harsh frequencies
 */

// Procedural noise buffer helper
function createNoiseBuffer(ctx: AudioContext, seconds: number = 2): AudioBuffer {
  const bufferSize = ctx.sampleRate * seconds;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let lastOut = 0.0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    // 1-pole pink/brown filter for warm, natural air texture
    lastOut = (lastOut + 0.025 * white) / 1.025;
    data[i] = lastOut * 2.2;
  }
  return buffer;
}

/**
 * Forest Ambience Controller (森林環境音效控制器)
 * Manages organic forest breeze, random natural bird calls, and twilight glade insect layers
 */
export class ForestAmbienceController {
  private ctx: AudioContext;
  private outputNode: GainNode;

  // Breeze nodes
  private windGain: GainNode;
  private windFilter: BiquadFilterNode;
  private windLfo: OscillatorNode;
  private windSource: AudioBufferSourceNode | null = null;

  // Twilight cricket/insect nodes
  private insectGain: GainNode;
  private insectFilter: BiquadFilterNode;
  private insectLfo: OscillatorNode;
  private insectSource: AudioBufferSourceNode | null = null;

  // Random bird song scheduling
  private birdTimerId: number | null = null;
  private isMuted: boolean = false;
  private activityLevel: number = 1.0; // 0 (far from forest center) to 1.0 (in sanctuary)

  constructor(ctx: AudioContext, destination: AudioNode) {
    this.ctx = ctx;
    this.outputNode = ctx.createGain();
    this.outputNode.gain.setValueAtTime(0.5, ctx.currentTime);
    this.outputNode.connect(destination);

    // ==========================================
    // 1. GENTLE FOREST BREEZE GENERATOR
    // ==========================================
    this.windGain = ctx.createGain();
    this.windGain.gain.setValueAtTime(0.06, ctx.currentTime);

    this.windFilter = ctx.createBiquadFilter();
    this.windFilter.type = 'bandpass';
    this.windFilter.frequency.setValueAtTime(420, ctx.currentTime);
    this.windFilter.Q.setValueAtTime(0.9, ctx.currentTime);

    // Slow wind breath LFO (~0.09Hz)
    this.windLfo = ctx.createOscillator();
    this.windLfo.type = 'sine';
    this.windLfo.frequency.setValueAtTime(0.09, ctx.currentTime);

    const windLfoGain = ctx.createGain();
    windLfoGain.gain.setValueAtTime(140, ctx.currentTime);
    this.windLfo.connect(windLfoGain);
    windLfoGain.connect(this.windFilter.frequency);

    const windBuffer = createNoiseBuffer(ctx, 3);
    this.windSource = ctx.createBufferSource();
    this.windSource.buffer = windBuffer;
    this.windSource.loop = true;

    this.windSource.connect(this.windFilter);
    this.windFilter.connect(this.windGain);
    this.windGain.connect(this.outputNode);

    this.windSource.start();
    this.windLfo.start();

    // ==========================================
    // 2. TWILIGHT FOREST INSECTS / CRICKETS (Subtle)
    // ==========================================
    this.insectGain = ctx.createGain();
    this.insectGain.gain.setValueAtTime(0.012, ctx.currentTime);

    this.insectFilter = ctx.createBiquadFilter();
    this.insectFilter.type = 'bandpass';
    this.insectFilter.frequency.setValueAtTime(4500, ctx.currentTime);
    this.insectFilter.Q.setValueAtTime(4.0, ctx.currentTime);

    // Fast subtle cricket tremolo (6Hz)
    this.insectLfo = ctx.createOscillator();
    this.insectLfo.type = 'sine';
    this.insectLfo.frequency.setValueAtTime(6.5, ctx.currentTime);

    const insectLfoGain = ctx.createGain();
    insectLfoGain.gain.setValueAtTime(0.008, ctx.currentTime);
    this.insectLfo.connect(insectLfoGain);
    insectLfoGain.connect(this.insectGain.gain);

    const insectBuffer = createNoiseBuffer(ctx, 1.5);
    this.insectSource = ctx.createBufferSource();
    this.insectSource.buffer = insectBuffer;
    this.insectSource.loop = true;

    this.insectSource.connect(this.insectFilter);
    this.insectFilter.connect(this.insectGain);
    this.insectGain.connect(this.outputNode);

    this.insectSource.start();
    this.insectLfo.start();

    // Start scheduling procedural bird songs
    this.scheduleNextBirdCall();
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public setVolume(volume: number, rampTime: number = 0.15) {
    if (!this.ctx) return;
    const target = this.isMuted ? 0 : Math.max(0, Math.min(1, volume));
    this.outputNode.gain.setTargetAtTime(target, this.ctx.currentTime, rampTime);
  }

  public setActivityLevel(level: number) {
    this.activityLevel = Math.max(0.1, Math.min(1.0, level));
  }

  /**
   * Schedule random natural bird songs with varying intervals based on sanctuary proximity
   */
  private scheduleNextBirdCall() {
    // Near center sanctuary: frequent chirping (every 3.5 - 6s)
    // Far from center: occasional distant calls (every 7 - 12s)
    const baseDelay = 3500 + (1.0 - this.activityLevel) * 4500;
    const randomVariation = Math.random() * 3000;
    const totalDelay = baseDelay + randomVariation;

    this.birdTimerId = window.setTimeout(() => {
      if (!this.isMuted && this.activityLevel > 0.15) {
        this.playRandomBirdCall();
      }
      this.scheduleNextBirdCall();
    }, totalDelay);
  }

  /**
   * Generates varied organic procedural forest bird species calls
   */
  public playRandomBirdCall() {
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    const panner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
    if (panner) {
      // Random stereo positioning in the trees around the player (-0.7 to +0.7)
      panner.pan.setValueAtTime((Math.random() - 0.5) * 1.4, now);
      panner.connect(this.outputNode);
    }

    const dest = panner || this.outputNode;
    const patternType = Math.floor(Math.random() * 4);

    if (patternType === 0) {
      // Type A: Forest Songbird / Robin 3-note melodic phrase
      const notes = [
        1350 + Math.random() * 150,
        1680 + Math.random() * 150,
        2100 + Math.random() * 180,
      ];
      notes.forEach((freq, idx) => {
        const noteStart = now + idx * 0.14;
        this.synthBirdNote(freq, noteStart, 0.11, 0.035 * this.activityLevel, dest);
      });
    } else if (patternType === 1) {
      // Type B: Forest Warbler gentle rapid trill
      const baseFreq = 1850 + Math.random() * 200;
      for (let t = 0; t < 4; t++) {
        const noteStart = now + t * 0.08;
        const noteFreq = baseFreq + (t % 2 === 0 ? 0 : 250);
        this.synthBirdNote(noteFreq, noteStart, 0.065, 0.028 * this.activityLevel, dest);
      }
    } else if (patternType === 2) {
      // Type C: Distant Twilight Wood-Dove / Soft Coo (Gentle low two-tone)
      const dove1 = 587.33; // D5
      const dove2 = 493.88; // B4
      this.synthDoveCoo(dove1, now, 0.28, 0.03 * this.activityLevel, dest);
      this.synthDoveCoo(dove2, now + 0.32, 0.35, 0.024 * this.activityLevel, dest);
    } else {
      // Type D: Celestial Forest Sprite Chime / Bell-bird single resonant tweet
      const highNote = 2200 + Math.random() * 300;
      this.synthBirdNote(highNote, now, 0.22, 0.038 * this.activityLevel, dest, true);
    }
  }

  private synthBirdNote(
    freq: number,
    startTime: number,
    duration: number,
    peakGain: number,
    destination: AudioNode,
    withVibrato: boolean = false
  ) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);
    // Slight upward flick at attack
    osc.frequency.exponentialRampToValueAtTime(freq * 1.15, startTime + duration * 0.3);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.95, startTime + duration);

    if (withVibrato) {
      const vib = this.ctx.createOscillator();
      const vibGain = this.ctx.createGain();
      vib.type = 'sine';
      vib.frequency.setValueAtTime(8, startTime);
      vibGain.gain.setValueAtTime(25, startTime);
      vib.connect(vibGain);
      vibGain.connect(osc.frequency);
      vib.start(startTime);
      vib.stop(startTime + duration + 0.05);
    }

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3200, startTime);

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(peakGain, startTime + duration * 0.2);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(destination);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.02);
  }

  private synthDoveCoo(
    freq: number,
    startTime: number,
    duration: number,
    peakGain: number,
    destination: AudioNode
  ) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.96, startTime + duration);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, startTime); // Very warm & muffled

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(peakGain, startTime + duration * 0.35);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(destination);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.02);
  }

  public dispose() {
    if (this.birdTimerId !== null) {
      clearTimeout(this.birdTimerId);
      this.birdTimerId = null;
    }
  }
}

/**
 * Main SoundEngine with Spatial Crossfader System
 */
class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;

  // Spatial audio buses
  private globalAmbientGain: GainNode | null = null;
  private forestBusGain: GainNode | null = null;
  private portalBusGain: GainNode | null = null;

  // Sub-controllers
  public forestController: ForestAmbienceController | null = null;

  // Portal oscillators & filter
  private portalHumOsc1: OscillatorNode | null = null;
  private portalHumOsc2: OscillatorNode | null = null;
  private portalShimmerOsc: OscillatorNode | null = null;
  private portalFilter: BiquadFilterNode | null = null;

  // Current spatial mix metrics (can be inspected or logged)
  public currentMix = {
    forestVolume: 1.0,
    portalVolume: 0.0,
    distToCenter: 4.0,
    distToNearestPortal: 20.0,
  };

  private isStarted: boolean = false;

  constructor() {}

  private initContext() {
    if (this.ctx) return;
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();

      // Master output
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.4, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // 1. Global Deep Forest Night Background Bus (Very soft sub + air)
      this.globalAmbientGain = this.ctx.createGain();
      this.globalAmbientGain.gain.setValueAtTime(0.28, this.ctx.currentTime);
      this.globalAmbientGain.connect(this.masterGain);

      // 2. Forest Ambience Bus (Controlled by ForestAmbienceController)
      this.forestBusGain = this.ctx.createGain();
      this.forestBusGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
      this.forestBusGain.connect(this.masterGain);

      // 3. Portal Resonance Bus (Warm hum + harmonic shimmer)
      this.portalBusGain = this.ctx.createGain();
      this.portalBusGain.gain.setValueAtTime(0.0, this.ctx.currentTime);
      this.portalBusGain.connect(this.masterGain);

      // Initialize sub-systems
      this.startGlobalAmbience();
      this.forestController = new ForestAmbienceController(this.ctx, this.forestBusGain);
      this.startPortalHumGenerator();

      this.isStarted = true;
    } catch {
      // AudioContext unavailable in restricted headless environments
    }
  }

  public resume() {
    if (!this.ctx) {
      this.initContext();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 0.4, this.ctx.currentTime, 0.05);
    }
    if (this.forestController) {
      this.forestController.setMuted(muted);
    }
  }

  public toggleMute(): boolean {
    this.resume();
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // =========================================================================
  // 1. GLOBAL NIGHT FOREST AMBIENCE (Deep Sub & Ethereal Night Bed)
  // =========================================================================
  private startGlobalAmbience() {
    if (!this.ctx || !this.globalAmbientGain) return;

    // A. Soft Brown Noise (Gentle forest air)
    const noiseBuffer = createNoiseBuffer(this.ctx, 2.5);
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(120, this.ctx.currentTime);
    noiseFilter.Q.setValueAtTime(0.5, this.ctx.currentTime);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.035, this.ctx.currentTime);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.globalAmbientGain);
    noiseSource.start();

    // B. Warm Deep Sub Drone (55Hz / A1 with 0.3Hz binaural beating)
    const subOsc1 = this.ctx.createOscillator();
    subOsc1.type = 'sine';
    subOsc1.frequency.setValueAtTime(55.0, this.ctx.currentTime);

    const subOsc2 = this.ctx.createOscillator();
    subOsc2.type = 'sine';
    subOsc2.frequency.setValueAtTime(55.3, this.ctx.currentTime);

    const subFilter = this.ctx.createBiquadFilter();
    subFilter.type = 'lowpass';
    subFilter.frequency.setValueAtTime(90, this.ctx.currentTime);
    subFilter.Q.setValueAtTime(0.5, this.ctx.currentTime);

    const subGain = this.ctx.createGain();
    subGain.gain.setValueAtTime(0.04, this.ctx.currentTime);

    subOsc1.connect(subFilter);
    subOsc2.connect(subFilter);
    subFilter.connect(subGain);
    subGain.connect(this.globalAmbientGain);

    subOsc1.start();
    subOsc2.start();

    // C. Very gentle celestial night chord (D major pentatonic: 146.8Hz, 220Hz, 293.6Hz)
    const padFreqs = [146.83, 220.0, 293.66];
    padFreqs.forEach((freq) => {
      if (!this.ctx || !this.globalAmbientGain) return;
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(240, this.ctx.currentTime);
      filter.Q.setValueAtTime(0.5, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, this.ctx.currentTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.globalAmbientGain);
      osc.start();
    });
  }

  // =========================================================================
  // 2. PORTAL VORTEX RESONATOR (Warm low hum + gentle harmonic shimmer)
  // =========================================================================
  private startPortalHumGenerator() {
    if (!this.ctx || !this.portalBusGain) return;

    // Fundamental warm hum (65.41Hz C2)
    this.portalHumOsc1 = this.ctx.createOscillator();
    this.portalHumOsc1.type = 'sine';
    this.portalHumOsc1.frequency.setValueAtTime(65.41, this.ctx.currentTime);

    // Octave overtone (130.81Hz C3)
    this.portalHumOsc2 = this.ctx.createOscillator();
    this.portalHumOsc2.type = 'sine';
    this.portalHumOsc2.frequency.setValueAtTime(130.81, this.ctx.currentTime);

    // Gentle crystal core shimmer (tuned to harmonic 261.63Hz C4)
    this.portalShimmerOsc = this.ctx.createOscillator();
    this.portalShimmerOsc.type = 'sine';
    this.portalShimmerOsc.frequency.setValueAtTime(261.63, this.ctx.currentTime);

    // Warm steep lowpass filter (220Hz cutoff)
    this.portalFilter = this.ctx.createBiquadFilter();
    this.portalFilter.type = 'lowpass';
    this.portalFilter.frequency.setValueAtTime(210, this.ctx.currentTime);
    this.portalFilter.Q.setValueAtTime(0.7, this.ctx.currentTime);

    const humMixGain = this.ctx.createGain();
    humMixGain.gain.setValueAtTime(0.75, this.ctx.currentTime);

    const shimmerMixGain = this.ctx.createGain();
    shimmerMixGain.gain.setValueAtTime(0.2, this.ctx.currentTime);

    this.portalHumOsc1.connect(humMixGain);
    this.portalHumOsc2.connect(humMixGain);
    this.portalShimmerOsc.connect(shimmerMixGain);

    humMixGain.connect(this.portalFilter);
    shimmerMixGain.connect(this.portalFilter);
    this.portalFilter.connect(this.portalBusGain);

    this.portalHumOsc1.start();
    this.portalHumOsc2.start();
    this.portalShimmerOsc.start();
  }

  // =========================================================================
  // 3. DYNAMIC DISTANCE-BASED CROSSFADE & MIX RATIO SYSTEM
  // =========================================================================
  /**
   * Dynamically adjusts the mix ratio between Forest Ambience (birds, breeze) and
   * Portal Vortex Hum based on distance to center sanctuary and nearest portal.
   *
   * @param distToCenter Distance in 3D units to the central sanctuary clearing (0,0)
   * @param distToNearestPortal Distance in 3D units to the closest active portal
   * @param portalThemeColor Hex color string of the nearest portal for harmonic tuning
   */
  public updateSpatialSoundscape(
    distToCenter: number,
    distToNearestPortal: number,
    portalThemeColor?: string
  ) {
    if (!this.ctx || this.isMuted) return;

    this.currentMix.distToCenter = distToCenter;
    this.currentMix.distToNearestPortal = distToNearestPortal;

    const now = this.ctx.currentTime;

    // 1. Calculate Forest Ambience Strength (Center Sanctuary Dominance)
    // - Full presence within center sanctuary (distToCenter < 5.5)
    // - Smoothly tapers off as player walks down the paths toward outer portals
    // - Retains a gentle 18% floor so distant forest rustling never abruptly disappears
    const centerNorm = Math.max(0, Math.min(1, 1 - (distToCenter - 4.5) / 10.0));
    // Smooth cubic easing for acoustic realism
    const forestGain = 0.18 + Math.pow(centerNorm, 1.5) * 0.42;
    this.currentMix.forestVolume = forestGain;

    if (this.forestBusGain) {
      this.forestBusGain.gain.setTargetAtTime(forestGain, now, 0.15);
    }
    if (this.forestController) {
      this.forestController.setActivityLevel(Math.max(0.2, centerNorm));
    }

    // 2. Calculate Portal Hum Strength (Portal Proximity Dominance)
    // - Zero presence near the center sanctuary (dist > 10.0)
    // - Smoothly rises as player approaches portal (< 9.0), reaching peak within 3.5m
    const portalNorm = Math.max(0, Math.min(1, 1 - (distToNearestPortal - 2.8) / 6.5));
    const portalGain = Math.pow(portalNorm, 1.6) * 0.42;
    this.currentMix.portalVolume = portalGain;

    if (this.portalBusGain) {
      this.portalBusGain.gain.setTargetAtTime(portalGain, now, 0.12);
    }

    // 3. Harmonic Theme Color Modulation on Portal Shimmer
    if (this.portalShimmerOsc && portalThemeColor && portalNorm > 0.05) {
      const hex = parseInt(portalThemeColor.replace('#', ''), 16) || 0;
      // Soothing pentatonic root notes (G3, A3, C4, D4, E4)
      const baseRoots = [196.0, 220.0, 261.63, 293.66, 329.63];
      const targetPitch = baseRoots[hex % baseRoots.length];
      this.portalShimmerOsc.frequency.setTargetAtTime(targetPitch, now, 0.2);
    }
  }

  public updatePortalProximity(distance: number, themeColor?: string) {
    this.updateSpatialSoundscape(this.currentMix.distToCenter, distance, themeColor);
  }

  // =========================================================================
  // ACTIONS: FOOTSTEPS, WARP & UI FEEDBACK
  // =========================================================================
  /**
   * Soft, muffled footstep sound (lowpass filtered, non-intrusive)
   */
  public playFootstep() {
    if (this.isMuted) return;
    this.resume();
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sine';
    const pitch = 75 + Math.random() * 15;
    osc.frequency.setValueAtTime(pitch, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(25, this.ctx.currentTime + 0.05);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(180, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.03, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.055);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.06);
  }

  /**
   * Ethereal warp leap: soothing pentatonic ascending harp sweep + soft whoosh
   */
  public playWarpEffect() {
    this.resume();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;

    const arpeggio = [261.63, 329.63, 392.0, 493.88, 587.33, 783.99];
    arpeggio.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const noteTime = now + idx * 0.12;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, noteTime);

      gain.gain.setValueAtTime(0.001, noteTime);
      gain.gain.linearRampToValueAtTime(0.06, noteTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.9);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(noteTime);
      osc.stop(noteTime + 0.95);
    });

    const bufferSize = this.ctx.sampleRate;
    const whooshBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const wData = whooshBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      wData[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const whoosh = this.ctx.createBufferSource();
    whoosh.buffer = whooshBuffer;

    const wFilter = this.ctx.createBiquadFilter();
    wFilter.type = 'bandpass';
    wFilter.frequency.setValueAtTime(250, now);
    wFilter.frequency.exponentialRampToValueAtTime(750, now + 0.8);
    wFilter.Q.setValueAtTime(1.2, now);

    const wGain = this.ctx.createGain();
    wGain.gain.setValueAtTime(0.01, now);
    wGain.gain.linearRampToValueAtTime(0.08, now + 0.6);
    wGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

    whoosh.connect(wFilter);
    wFilter.connect(wGain);
    wGain.connect(this.masterGain);

    whoosh.start(now);
    whoosh.stop(now + 1.25);
  }

  public playUiChime(highPitch: boolean = false) {
    if (this.isMuted) return;
    this.resume();
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    const now = this.ctx.currentTime;

    osc.type = 'sine';
    const pitch = highPitch ? 659.25 : 440;
    osc.frequency.setValueAtTime(pitch, now);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, now);

    gain.gain.setValueAtTime(0.035, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.11);
  }

  public dispose() {
    if (this.forestController) {
      this.forestController.dispose();
      this.forestController = null;
    }
  }
}

export const soundEngine = new SoundEngine();
