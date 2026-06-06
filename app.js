// Initialize Lucide Icons
function initIcons() {
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

// -------------------------------------------------------------
// 1. SCROLL VELOCITY ENGINE (Momentum & Scroll-Linked Offset)
// -------------------------------------------------------------
let lastScrollY = window.scrollY;
let lastScrollTime = Date.now();
let targetVelocity = 0;
let currentVelocity = 0;

// Track elements state
const velocityTracks = [];

function initScrollVelocityEngine() {
  const rows = document.querySelectorAll('.velocity-row');
  
  rows.forEach((row, index) => {
    const track = row.querySelector('.velocity-track');
    if (!track) return;
    
    const speed = parseFloat(row.dataset.speed) || 1.0;
    const direction = parseInt(row.dataset.direction) || 1;
    
    // Get single width of loop content (which is half of total width since we duplicate items)
    const totalWidth = track.scrollWidth;
    const loopWidth = totalWidth / 2;
    
    velocityTracks.push({
      element: track,
      speed: speed,
      direction: direction,
      offset: direction > 0 ? -loopWidth : 0, // Initial offset
      loopWidth: loopWidth
    });
  });

  // Track window scroll event
  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    const currentTime = Date.now();
    const timeDiff = Math.max(1, currentTime - lastScrollTime);
    const scrollDiff = currentScrollY - lastScrollY;
    
    // Calculate scroll velocity: pixels per millisecond
    const velocity = scrollDiff / timeDiff;
    
    // Amplify velocity for visual effect
    targetVelocity = velocity * 15;
    
    lastScrollY = currentScrollY;
    lastScrollTime = currentTime;
  });
}

// Animation loop (60 FPS)
function animateTracks() {
  // Lerp current velocity towards target velocity (inertia/damping)
  currentVelocity += (targetVelocity - currentVelocity) * 0.08;
  
  // Decelerate target velocity (friction)
  targetVelocity *= 0.92;
  
  // Shifting grammar visual elements based on velocity in Bento grid
  updateGrammarVisual(currentVelocity);

  // Update position of each track
  velocityTracks.forEach(track => {
    // Displacement formula: base movement + velocity influence
    const baseMovement = track.direction * track.speed;
    const velocityInfluence = currentVelocity * 1.8;
    
    track.offset += baseMovement + velocityInfluence;
    
    // Infinite loop bounding box
    if (track.direction > 0) {
      // Moving right, wrap around
      if (track.offset > 0) {
        track.offset = -track.offset - track.loopWidth;
      }
    } else {
      // Moving left, wrap around
      if (track.offset < -track.loopWidth) {
        track.offset = 0;
      }
    }
    
    // Apply transform using hardware accelerated translate3d
    track.element.style.transform = `translate3d(${track.offset}px, 0, 0)`;
  });
  
  requestAnimationFrame(animateTracks);
}

// Interactive Bento visual: Grammar words shift distance based on scroll velocity
function updateGrammarVisual(velocity) {
  const gSubj = document.getElementById('g-subj');
  const gVerb = document.getElementById('g-verb');
  const gObj = document.getElementById('g-obj');
  
  if (!gSubj || !gVerb || !gObj) return;
  
  // Calculate spread distance based on speed
  const spread = Math.min(60, Math.abs(velocity) * 12);
  
  gSubj.style.transform = `translateY(${-spread}px)`;
  gObj.style.transform = `translateY(${spread}px)`;
}

// -------------------------------------------------------------
// 2. BENTO GRID - INTERACTIVE DEMOS
// -------------------------------------------------------------

// Interactive Vocab Cards Tilt Effect
function initVocabGridTilt() {
  const grid = document.getElementById('interactive-grid');
  if (!grid) return;
  
  grid.addEventListener('mousemove', (e) => {
    const cards = grid.querySelectorAll('.grid-item');
    const rect = grid.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    cards.forEach(card => {
      const cardRect = card.getBoundingClientRect();
      const cardX = cardRect.left + cardRect.width / 2 - rect.left;
      const cardY = cardRect.top + cardRect.height / 2 - rect.top;
      
      const dx = x - cardX;
      const dy = y - cardY;
      
      // Calculate rotation based on cursor distance
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 200) {
        const tiltX = -(dy / 12).toFixed(2);
        const tiltY = (dx / 12).toFixed(2);
        card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.03)`;
      } else {
        card.style.transform = '';
      }
    });
  });
  
  grid.addEventListener('mouseleave', () => {
    const cards = grid.querySelectorAll('.grid-item');
    cards.forEach(card => {
      card.style.transform = '';
    });
  });
}

// -------------------------------------------------------------
// 3. VOICE AND TELAFFUZ SANDBOX LABORATORY (TTS + RECORD SIM)
// -------------------------------------------------------------
let activeLang = 'en-US';
let activePhrase = 'Immersive learning builds native fluency.';

const sandboxTabs = document.querySelectorAll('.sandbox-tab');
const phraseDisplay = document.getElementById('sandbox-phrase');
const translationDisplay = document.getElementById('sandbox-translation');
const btnListen = document.getElementById('sandbox-listen-btn');
const btnRecord = document.getElementById('sandbox-record-btn');
const visualizer = document.getElementById('sandbox-waves');
const analyzerStatus = document.getElementById('analyzer-status');
const scoreCard = document.getElementById('score-card');

// Mini Bento voice demo
const btnMiniVoice = document.getElementById('mini-voice-btn');
const miniWaves = document.getElementById('mini-waves');

function initVoiceSandbox() {
  // Tab switching
  sandboxTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      sandboxTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      activeLang = tab.getAttribute('data-lang');
      activePhrase = tab.getAttribute('data-phrase');
      const translation = tab.getAttribute('data-translation');
      
      phraseDisplay.textContent = activePhrase;
      translationDisplay.textContent = translation;
      
      // Reset visual state
      scoreCard.classList.add('hidden');
      visualizer.classList.remove('active');
      analyzerStatus.textContent = 'Bekliyor...';
    });
  });

  // TTS Listen trigger (Text-to-Speech)
  btnListen.addEventListener('click', () => {
    speakText(activePhrase, activeLang, btnListen, visualizer);
  });

  // Mini Bento voice play trigger
  if (btnMiniVoice) {
    btnMiniVoice.addEventListener('click', () => {
      speakText('Hola, ¿cómo estás hoy?', 'es-ES', btnMiniVoice, miniWaves);
    });
  }

  // Record Sim Trigger (Speech Recognition simulation with animation)
  btnRecord.addEventListener('click', () => {
    if (btnRecord.classList.contains('recording')) return;
    
    btnRecord.classList.add('recording');
    visualizer.classList.add('active');
    analyzerStatus.textContent = 'Dinleniyor...';
    scoreCard.classList.add('hidden');
    
    // Simulate recording for 2.5 seconds
    setTimeout(() => {
      analyzerStatus.textContent = 'Analiz Ediliyor...';
      
      // Simulate analysis for 1 second
      setTimeout(() => {
        btnRecord.classList.remove('recording');
        visualizer.classList.remove('active');
        analyzerStatus.textContent = 'Analiz Tamamlandı';
        
        // Generate random realistic high scores
        const rhythm = Math.floor(Math.random() * 10) + 89;
        const tone = Math.floor(Math.random() * 10) + 88;
        const emphasis = Math.floor(Math.random() * 10) + 90;
        const total = Math.round((rhythm + tone + emphasis) / 3);
        
        // Show scorecard
        scoreCard.querySelector('.score-value').textContent = `${total}%`;
        
        const detailsSpans = scoreCard.querySelectorAll('.score-details span');
        detailsSpans[0].textContent = `Ritim: %${rhythm}`;
        detailsSpans[1].textContent = `Ton: %${tone}`;
        detailsSpans[2].textContent = `Vurgu: %${emphasis}`;
        
        scoreCard.classList.remove('hidden');
      }, 1000);
    }, 2500);
  });
}

// Synthesize and speak the text using Browser Web Speech API
function speakText(text, lang, triggerBtn, wavesEl) {
  if ('speechSynthesis' in window) {
    // Cancel currently playing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    
    // Choose appropriate voice profile
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.lang.startsWith(lang));
    if (voice) utterance.voice = voice;
    
    utterance.onstart = () => {
      triggerBtn.classList.add('btn-primary-glow');
      if (wavesEl) wavesEl.classList.add('active', 'animating');
    };
    
    utterance.onend = () => {
      triggerBtn.classList.remove('btn-primary-glow');
      if (wavesEl) wavesEl.classList.remove('active', 'animating');
    };
    
    utterance.onerror = () => {
      triggerBtn.classList.remove('btn-primary-glow');
      if (wavesEl) wavesEl.classList.remove('active', 'animating');
    };
    
    window.speechSynthesis.speak(utterance);
  } else {
    alert('Web Speech API bu tarayıcıda desteklenmiyor.');
  }
}

// -------------------------------------------------------------
// 4. ON LOAD INITIALIZATION
// -------------------------------------------------------------
window.addEventListener('DOMContentLoaded', () => {
  initIcons();
  initScrollVelocityEngine();
  initVocabGridTilt();
  initVoiceSandbox();
  
  // Start the velocity animation loop
  requestAnimationFrame(animateTracks);
});
