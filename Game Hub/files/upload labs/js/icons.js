// SVG Icons for Uploadslabs Sim
const GameIcons = {
    power: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="powerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#FFD700;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#FFA500;stop-opacity:1" />
            </linearGradient>
        </defs>
        <circle cx="32" cy="32" r="28" fill="url(#powerGrad)" opacity="0.2"/>
        <path d="M32 8 L28 28 L36 28 L32 56 L40 32 L28 32 Z" fill="url(#powerGrad)" stroke="#FFD700" stroke-width="2"/>
        <circle cx="32" cy="32" r="30" fill="none" stroke="url(#powerGrad)" stroke-width="2" opacity="0.5"/>
    </svg>`,
    
    server: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="serverGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#5a9fd4;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#2a5298;stop-opacity:1" />
            </linearGradient>
        </defs>
        <rect x="8" y="12" width="48" height="12" rx="2" fill="url(#serverGrad)" stroke="#5a9fd4" stroke-width="2"/>
        <rect x="8" y="26" width="48" height="12" rx="2" fill="url(#serverGrad)" stroke="#5a9fd4" stroke-width="2"/>
        <rect x="8" y="40" width="48" height="12" rx="2" fill="url(#serverGrad)" stroke="#5a9fd4" stroke-width="2"/>
        <circle cx="14" cy="18" r="2" fill="#4CAF50"/>
        <circle cx="20" cy="18" r="2" fill="#4CAF50"/>
        <circle cx="14" cy="32" r="2" fill="#4CAF50"/>
        <circle cx="20" cy="32" r="2" fill="#4CAF50"/>
        <circle cx="14" cy="46" r="2" fill="#4CAF50"/>
        <circle cx="20" cy="46" r="2" fill="#4CAF50"/>
    </svg>`,
    
    storage: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="storageGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#9C27B0;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#6A1B9A;stop-opacity:1" />
            </linearGradient>
        </defs>
        <rect x="12" y="8" width="40" height="48" rx="4" fill="url(#storageGrad)" stroke="#9C27B0" stroke-width="2"/>
        <rect x="16" y="14" width="32" height="6" rx="1" fill="#E1BEE7" opacity="0.6"/>
        <rect x="16" y="24" width="32" height="6" rx="1" fill="#E1BEE7" opacity="0.6"/>
        <rect x="16" y="34" width="32" height="6" rx="1" fill="#E1BEE7" opacity="0.6"/>
        <rect x="16" y="44" width="32" height="6" rx="1" fill="#E1BEE7" opacity="0.6"/>
        <circle cx="32" cy="17" r="1.5" fill="#4CAF50"/>
        <circle cx="32" cy="27" r="1.5" fill="#4CAF50"/>
        <circle cx="32" cy="37" r="1.5" fill="#4CAF50"/>
        <circle cx="32" cy="47" r="1.5" fill="#4CAF50"/>
    </svg>`,
    
    processor: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="procGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#FF9800;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#F57C00;stop-opacity:1" />
            </linearGradient>
        </defs>
        <rect x="16" y="16" width="32" height="32" rx="2" fill="url(#procGrad)" stroke="#FF9800" stroke-width="2"/>
        <rect x="20" y="20" width="24" height="24" rx="1" fill="#FFF3E0" opacity="0.3"/>
        <line x1="8" y1="20" x2="16" y2="20" stroke="#FF9800" stroke-width="2"/>
        <line x1="8" y1="28" x2="16" y2="28" stroke="#FF9800" stroke-width="2"/>
        <line x1="8" y1="36" x2="16" y2="36" stroke="#FF9800" stroke-width="2"/>
        <line x1="8" y1="44" x2="16" y2="44" stroke="#FF9800" stroke-width="2"/>
        <line x1="48" y1="20" x2="56" y2="20" stroke="#FF9800" stroke-width="2"/>
        <line x1="48" y1="28" x2="56" y2="28" stroke="#FF9800" stroke-width="2"/>
        <line x1="48" y1="36" x2="56" y2="36" stroke="#FF9800" stroke-width="2"/>
        <line x1="48" y1="44" x2="56" y2="44" stroke="#FF9800" stroke-width="2"/>
        <circle cx="32" cy="32" r="6" fill="#FFD700" opacity="0.8"/>
    </svg>`,
    
    cooling: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="coolGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#00BCD4;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#0097A7;stop-opacity:1" />
            </linearGradient>
        </defs>
        <circle cx="32" cy="32" r="24" fill="url(#coolGrad)" opacity="0.2"/>
        <path d="M32 8 L32 24" stroke="#00BCD4" stroke-width="3" stroke-linecap="round"/>
        <path d="M32 40 L32 56" stroke="#00BCD4" stroke-width="3" stroke-linecap="round"/>
        <path d="M8 32 L24 32" stroke="#00BCD4" stroke-width="3" stroke-linecap="round"/>
        <path d="M40 32 L56 32" stroke="#00BCD4" stroke-width="3" stroke-linecap="round"/>
        <path d="M15 15 L25 25" stroke="#00BCD4" stroke-width="3" stroke-linecap="round"/>
        <path d="M39 39 L49 49" stroke="#00BCD4" stroke-width="3" stroke-linecap="round"/>
        <path d="M49 15 L39 25" stroke="#00BCD4" stroke-width="3" stroke-linecap="round"/>
        <path d="M25 39 L15 49" stroke="#00BCD4" stroke-width="3" stroke-linecap="round"/>
        <circle cx="32" cy="32" r="8" fill="#00BCD4" opacity="0.6"/>
        <circle cx="32" cy="32" r="4" fill="#B2EBF2"/>
    </svg>`,
    
    ai: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="aiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#E91E63;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#9C27B0;stop-opacity:1" />
            </linearGradient>
        </defs>
        <circle cx="32" cy="24" r="12" fill="url(#aiGrad)" stroke="#E91E63" stroke-width="2"/>
        <circle cx="20" cy="44" r="8" fill="url(#aiGrad)" stroke="#E91E63" stroke-width="2"/>
        <circle cx="44" cy="44" r="8" fill="url(#aiGrad)" stroke="#E91E63" stroke-width="2"/>
        <line x1="26" y1="32" x2="22" y2="38" stroke="#E91E63" stroke-width="2"/>
        <line x1="38" y1="32" x2="42" y2="38" stroke="#E91E63" stroke-width="2"/>
        <circle cx="28" cy="22" r="2" fill="#FFF"/>
        <circle cx="36" cy="22" r="2" fill="#FFF"/>
        <path d="M28 28 Q32 30 36 28" stroke="#FFF" stroke-width="2" fill="none"/>
    </svg>`,
    
    generator: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="genGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#4CAF50;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#2E7D32;stop-opacity:1" />
            </linearGradient>
        </defs>
        <rect x="12" y="20" width="40" height="28" rx="4" fill="url(#genGrad)" stroke="#4CAF50" stroke-width="2"/>
        <circle cx="32" cy="34" r="10" fill="none" stroke="#81C784" stroke-width="2"/>
        <path d="M32 24 L32 44 M22 34 L42 34" stroke="#81C784" stroke-width="2"/>
        <rect x="16" y="12" width="8" height="8" rx="1" fill="#FFD700"/>
        <rect x="40" y="12" width="8" height="8" rx="1" fill="#FFD700"/>
        <line x1="20" y1="20" x2="20" y2="12" stroke="#FFD700" stroke-width="2"/>
        <line x1="44" y1="20" x2="44" y2="12" stroke="#FFD700" stroke-width="2"/>
        <circle cx="20" cy="42" r="2" fill="#4CAF50"/>
        <circle cx="32" cy="42" r="2" fill="#4CAF50"/>
        <circle cx="44" cy="42" r="2" fill="#4CAF50"/>
    </svg>`,
    
    miner: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="minerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#FFD700;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#FFA000;stop-opacity:1" />
            </linearGradient>
        </defs>
        <path d="M32 8 L48 24 L40 32 L48 40 L32 56 L16 40 L24 32 L16 24 Z" fill="url(#minerGrad)" stroke="#FFD700" stroke-width="2"/>
        <circle cx="32" cy="32" r="8" fill="#FFF3E0" opacity="0.6"/>
        <path d="M28 28 L32 24 L36 28 L32 32 Z" fill="#FFD700"/>
        <path d="M28 36 L32 40 L36 36 L32 32 Z" fill="#FFD700"/>
        <circle cx="32" cy="32" r="3" fill="#FFA000"/>
    </svg>`,
    
    turbine: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="turbineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#00BCD4;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#0097A7;stop-opacity:1" />
            </linearGradient>
        </defs>
        <circle cx="32" cy="32" r="8" fill="url(#turbineGrad)"/>
        <path d="M32 12 Q40 20 32 24 Q24 20 32 12" fill="url(#turbineGrad)" opacity="0.8"/>
        <path d="M52 32 Q44 40 40 32 Q44 24 52 32" fill="url(#turbineGrad)" opacity="0.8"/>
        <path d="M32 52 Q24 44 32 40 Q40 44 32 52" fill="url(#turbineGrad)" opacity="0.8"/>
        <path d="M12 32 Q20 24 24 32 Q20 40 12 32" fill="url(#turbineGrad)" opacity="0.8"/>
        <circle cx="32" cy="32" r="6" fill="#B2EBF2"/>
    </svg>`,
    
    quantum: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="quantumGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#9C27B0;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#E91E63;stop-opacity:1" />
            </linearGradient>
        </defs>
        <circle cx="32" cy="32" r="24" fill="none" stroke="url(#quantumGrad)" stroke-width="2" opacity="0.3"/>
        <circle cx="32" cy="32" r="16" fill="none" stroke="url(#quantumGrad)" stroke-width="2" opacity="0.5"/>
        <circle cx="32" cy="32" r="8" fill="url(#quantumGrad)"/>
        <circle cx="20" cy="20" r="4" fill="#E91E63"/>
        <circle cx="44" cy="20" r="4" fill="#E91E63"/>
        <circle cx="20" cy="44" r="4" fill="#E91E63"/>
        <circle cx="44" cy="44" r="4" fill="#E91E63"/>
        <line x1="20" y1="20" x2="32" y2="32" stroke="#E91E63" stroke-width="2"/>
        <line x1="44" y1="20" x2="32" y2="32" stroke="#E91E63" stroke-width="2"/>
        <line x1="20" y1="44" x2="32" y2="32" stroke="#E91E63" stroke-width="2"/>
        <line x1="44" y1="44" x2="32" y2="32" stroke="#E91E63" stroke-width="2"/>
    </svg>`,
    
    fusion: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="fusionGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#FF5722;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#FFC107;stop-opacity:1" />
            </linearGradient>
            <radialGradient id="fusionGlow">
                <stop offset="0%" style="stop-color:#FFF;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#FF5722;stop-opacity:0" />
            </radialGradient>
        </defs>
        <circle cx="32" cy="32" r="28" fill="url(#fusionGlow)" opacity="0.3"/>
        <circle cx="32" cy="32" r="20" fill="url(#fusionGrad)" opacity="0.4"/>
        <circle cx="32" cy="32" r="12" fill="url(#fusionGrad)"/>
        <path d="M32 20 L36 28 L32 24 L28 28 Z" fill="#FFF" opacity="0.8"/>
        <path d="M44 32 L36 36 L40 32 L36 28 Z" fill="#FFF" opacity="0.8"/>
        <path d="M32 44 L28 36 L32 40 L36 36 Z" fill="#FFF" opacity="0.8"/>
        <path d="M20 32 L28 28 L24 32 L28 36 Z" fill="#FFF" opacity="0.8"/>
    </svg>`,
    
    antimatter: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="antimatterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#E91E63;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#9C27B0;stop-opacity:1" />
            </linearGradient>
        </defs>
        <circle cx="32" cy="32" r="26" fill="url(#antimatterGrad)" opacity="0.2"/>
        <path d="M32 8 L40 24 L56 24 L44 36 L48 52 L32 40 L16 52 L20 36 L8 24 L24 24 Z" fill="url(#antimatterGrad)" stroke="#E91E63" stroke-width="2"/>
        <circle cx="32" cy="32" r="8" fill="#FFF" opacity="0.8"/>
        <circle cx="32" cy="32" r="4" fill="#E91E63"/>
    </svg>`,
    
    gpu: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="gpuGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#9C27B0;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#6A1B9A;stop-opacity:1" />
            </linearGradient>
        </defs>
        <rect x="10" y="16" width="44" height="32" rx="4" fill="url(#gpuGrad)" stroke="#9C27B0" stroke-width="2"/>
        <rect x="14" y="22" width="10" height="20" rx="1" fill="#E1BEE7" opacity="0.6"/>
        <rect x="27" y="22" width="10" height="20" rx="1" fill="#E1BEE7" opacity="0.6"/>
        <rect x="40" y="22" width="10" height="20" rx="1" fill="#E1BEE7" opacity="0.6"/>
        <rect x="10" y="12" width="4" height="4" rx="1" fill="#4CAF50"/>
        <rect x="18" y="12" width="4" height="4" rx="1" fill="#4CAF50"/>
        <rect x="26" y="12" width="4" height="4" rx="1" fill="#4CAF50"/>
    </svg>`,
    
    gpuRig: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="rigGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#9C27B0;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#6A1B9A;stop-opacity:1" />
            </linearGradient>
        </defs>
        <rect x="8" y="12" width="20" height="16" rx="2" fill="url(#rigGrad)" stroke="#9C27B0" stroke-width="1.5"/>
        <rect x="36" y="12" width="20" height="16" rx="2" fill="url(#rigGrad)" stroke="#9C27B0" stroke-width="1.5"/>
        <rect x="8" y="36" width="20" height="16" rx="2" fill="url(#rigGrad)" stroke="#9C27B0" stroke-width="1.5"/>
        <rect x="36" y="36" width="20" height="16" rx="2" fill="url(#rigGrad)" stroke="#9C27B0" stroke-width="1.5"/>
        <line x1="28" y1="20" x2="36" y2="20" stroke="#4CAF50" stroke-width="2"/>
        <line x1="28" y1="44" x2="36" y2="44" stroke="#4CAF50" stroke-width="2"/>
        <circle cx="14" cy="16" r="1.5" fill="#4CAF50"/>
        <circle cx="42" cy="16" r="1.5" fill="#4CAF50"/>
    </svg>`,
    
    superGPU: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="superGpuGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#E91E63;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#9C27B0;stop-opacity:1" />
            </linearGradient>
        </defs>
        <rect x="8" y="14" width="48" height="36" rx="4" fill="url(#superGpuGrad)" stroke="#E91E63" stroke-width="2"/>
        <rect x="12" y="20" width="12" height="24" rx="2" fill="#F8BBD0" opacity="0.7"/>
        <rect x="26" y="20" width="12" height="24" rx="2" fill="#F8BBD0" opacity="0.7"/>
        <rect x="40" y="20" width="12" height="24" rx="2" fill="#F8BBD0" opacity="0.7"/>
        <circle cx="18" cy="32" r="2" fill="#4CAF50"/>
        <circle cx="32" cy="32" r="2" fill="#4CAF50"/>
        <circle cx="46" cy="32" r="2" fill="#4CAF50"/>
        <path d="M28 8 L32 4 L36 8" fill="#FFD700"/>
    </svg>`,
    
    bitcoinMiner: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="btcGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#FFA000;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#FF6F00;stop-opacity:1" />
            </linearGradient>
        </defs>
        <circle cx="32" cy="32" r="24" fill="url(#btcGrad)" stroke="#FFA000" stroke-width="2"/>
        <path d="M28 18 L28 46 M36 18 L36 46" stroke="#FFF" stroke-width="2"/>
        <path d="M24 22 L38 22 Q42 22 42 28 Q42 32 38 32 L24 32 M24 32 L40 32 Q44 32 44 38 Q44 42 40 42 L24 42" stroke="#FFF" stroke-width="3" fill="none" stroke-linecap="round"/>
    </svg>`,
    
    cryptoFarm: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="farmGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#FFD700;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#FFA000;stop-opacity:1" />
            </linearGradient>
        </defs>
        <rect x="8" y="20" width="48" height="28" rx="4" fill="url(#farmGrad)" stroke="#FFD700" stroke-width="2"/>
        <rect x="12" y="26" width="8" height="16" rx="1" fill="#FFF3E0" opacity="0.6"/>
        <rect x="22" y="26" width="8" height="16" rx="1" fill="#FFF3E0" opacity="0.6"/>
        <rect x="32" y="26" width="8" height="16" rx="1" fill="#FFF3E0" opacity="0.6"/>
        <rect x="42" y="26" width="8" height="16" rx="1" fill="#FFF3E0" opacity="0.6"/>
        <circle cx="16" cy="34" r="1.5" fill="#4CAF50"/>
        <circle cx="26" cy="34" r="1.5" fill="#4CAF50"/>
        <circle cx="36" cy="34" r="1.5" fill="#4CAF50"/>
        <circle cx="46" cy="34" r="1.5" fill="#4CAF50"/>
        <path d="M20 12 L32 8 L44 12" stroke="#FFD700" stroke-width="2" fill="none"/>
    </svg>`,
    
    asicMiner: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="asicGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#FF6F00;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#E65100;stop-opacity:1" />
            </linearGradient>
        </defs>
        <rect x="12" y="12" width="40" height="40" rx="4" fill="url(#asicGrad)" stroke="#FF6F00" stroke-width="2"/>
        <rect x="18" y="18" width="28" height="28" rx="2" fill="#FFE0B2" opacity="0.3"/>
        <circle cx="32" cy="32" r="10" fill="#FF6F00"/>
        <circle cx="32" cy="32" r="6" fill="#FFD700"/>
        <line x1="8" y1="20" x2="12" y2="20" stroke="#FF6F00" stroke-width="2"/>
        <line x1="8" y1="32" x2="12" y2="32" stroke="#FF6F00" stroke-width="2"/>
        <line x1="8" y1="44" x2="12" y2="44" stroke="#FF6F00" stroke-width="2"/>
        <line x1="52" y1="20" x2="56" y2="20" stroke="#FF6F00" stroke-width="2"/>
        <line x1="52" y1="32" x2="56" y2="32" stroke="#FF6F00" stroke-width="2"/>
        <line x1="52" y1="44" x2="56" y2="44" stroke="#FF6F00" stroke-width="2"/>
    </svg>`,
    
    quantumMiner: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="qmGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#00BCD4;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#9C27B0;stop-opacity:1" />
            </linearGradient>
            <radialGradient id="qmGlow">
                <stop offset="0%" style="stop-color:#FFF;stop-opacity:0.8" />
                <stop offset="100%" style="stop-color:#00BCD4;stop-opacity:0" />
            </radialGradient>
        </defs>
        <circle cx="32" cy="32" r="28" fill="url(#qmGlow)" opacity="0.4"/>
        <circle cx="32" cy="32" r="20" fill="none" stroke="url(#qmGrad)" stroke-width="3"/>
        <circle cx="32" cy="32" r="12" fill="url(#qmGrad)"/>
        <circle cx="32" cy="16" r="4" fill="#00BCD4"/>
        <circle cx="48" cy="32" r="4" fill="#00BCD4"/>
        <circle cx="32" cy="48" r="4" fill="#00BCD4"/>
        <circle cx="16" cy="32" r="4" fill="#00BCD4"/>
        <path d="M32 16 L32 20" stroke="#FFF" stroke-width="2"/>
        <path d="M48 32 L44 32" stroke="#FFF" stroke-width="2"/>
        <path d="M32 48 L32 44" stroke="#FFF" stroke-width="2"/>
        <path d="M16 32 L20 32" stroke="#FFF" stroke-width="2"/>
    </svg>`
};

// Function to create icon element
function createIcon(type, size = 48) {
    const container = document.createElement('div');
    container.className = 'game-icon';
    container.style.width = size + 'px';
    container.style.height = size + 'px';
    container.innerHTML = GameIcons[type] || GameIcons.server;
    return container;
}

// Export for use in game
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GameIcons, createIcon };
}
