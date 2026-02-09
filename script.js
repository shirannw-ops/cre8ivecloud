document.addEventListener('DOMContentLoaded', () => {
    // --- Mobile Menu ---
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    let isMenuOpen = false;

    menuBtn.addEventListener('click', () => {
        isMenuOpen = !isMenuOpen;
        if (isMenuOpen) {
            mobileMenu.classList.remove('hidden');
            setTimeout(() => {
                mobileMenu.classList.remove('-translate-y-[150%]');
            }, 10);
        } else {
            mobileMenu.classList.add('-translate-y-[150%]');
            setTimeout(() => {
                mobileMenu.classList.add('hidden');
            }, 300);
        }
    });

    // --- Scroll Animations ---
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in-up');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.glass-card').forEach(el => {
        el.style.opacity = '0'; // Initial state
        observer.observe(el);
    });

    // --- Generative Ambient Music Engine ---
    const musicBtn = document.getElementById('music-btn');
    const waveVisual = document.getElementById('music-wave');
    let isPlaying = false;
    let audioContext = null;
    let oscillators = [];
    let gainNode = null;

    const CHORD_FREQUENCIES = [
        261.63, // C4
        329.63, // E4
        392.00, // G4
        493.88, // B4 (Major 7th)
        523.25  // C5
    ];

    async function initAudio() {
        if (!audioContext) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioContext = new AudioContext();
            gainNode = audioContext.createGain();
            gainNode.connect(audioContext.destination);
            gainNode.gain.value = 0.1; // Low volume for ambient feel
        }

        if (audioContext.state === 'suspended') {
            await audioContext.resume();
        }
    }

    function startMusic() {
        oscillators = CHORD_FREQUENCIES.map(freq => {
            const osc = audioContext.createOscillator();
            osc.className = 'oscillator';
            osc.type = 'sine';
            osc.frequency.value = freq;

            // Subtle detuning for richness
            osc.detune.value = (Math.random() * 10) - 5;

            const oscGain = audioContext.createGain();
            oscGain.gain.setValueAtTime(0, audioContext.currentTime);
            oscGain.gain.linearRampToValueAtTime(0.05, audioContext.currentTime + 2); // Slow attack

            osc.connect(oscGain);
            oscGain.connect(gainNode);
            osc.start();

            return { osc, oscGain };
        });

        isPlaying = true;
        updateUI();
    }

    function stopMusic() {
        if (oscillators.length > 0) {
            oscillators.forEach(({ osc, oscGain }) => {
                // Slow release
                oscGain.gain.linearRampToValueAtTime(0, audioContext.currentTime + 2);
                setTimeout(() => {
                    osc.stop();
                    osc.disconnect();
                }, 2000);
            });
            oscillators = [];
        }
        isPlaying = false;
        updateUI();
    }

    function updateUI() {
        if (isPlaying) {
            musicBtn.classList.add('bg-brand-accent', 'text-white', 'border-transparent');
            musicBtn.querySelector('i').classList.remove('fa-music');
            musicBtn.querySelector('i').classList.add('fa-pause');
            if (waveVisual) {
                waveVisual.classList.remove('scale-0');
                waveVisual.classList.add('scale-100', 'animate-ping');
            }
        } else {
            musicBtn.classList.remove('bg-brand-accent', 'text-white', 'border-transparent');
            musicBtn.querySelector('i').classList.add('fa-music');
            musicBtn.querySelector('i').classList.remove('fa-pause');
            if (waveVisual) {
                waveVisual.classList.remove('scale-100', 'animate-ping');
                waveVisual.classList.add('scale-0');
            }
        }
    }

    musicBtn.addEventListener('click', async () => {
        await initAudio();
        if (isPlaying) {
            stopMusic();
        } else {
            startMusic();
        }
    });

    // Handle page visibility change to automatic mute
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && isPlaying) {
            stopMusic();
        }
    });
});
