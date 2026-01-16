document.addEventListener('DOMContentLoaded', () => {
    
    // Recherche avec animations fluides
    const searchBar = document.getElementById('searchBar');
    const cards = document.querySelectorAll('.card');

    if (searchBar) {
        searchBar.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            cards.forEach((card, index) => {
                const title = card.querySelector('h2').textContent.toLowerCase();
                const desc = card.querySelector('.desc').textContent.toLowerCase();
                
                if (title.includes(term) || desc.includes(term)) {
                    card.style.display = 'flex';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0) scale(1)';
                    }, index * 100);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(-20px) scale(0.9)';
                    setTimeout(() => card.style.display = 'none', 300);
                }
            });
        });
    }

    // Gestion des boutons de connexion rapide
    const quickLoginBtn = document.getElementById('quickLoginBtn');
    const quickRegisterBtn = document.getElementById('quickRegisterBtn');

    if (quickLoginBtn) {
        quickLoginBtn.addEventListener('click', () => {
            // Attendre que le système d'auth soit initialisé
            if (window.GameHubAuth) {
                window.GameHubAuth.showModal();
                window.GameHubAuth.switchTab('login');
            } else {
                // Fallback si l'auth n'est pas encore chargé
                setTimeout(() => {
                    if (window.GameHubAuth) {
                        window.GameHubAuth.showModal();
                        window.GameHubAuth.switchTab('login');
                    }
                }, 100);
            }
        });
    }

    if (quickRegisterBtn) {
        quickRegisterBtn.addEventListener('click', () => {
            // Attendre que le système d'auth soit initialisé
            if (window.GameHubAuth) {
                window.GameHubAuth.showModal();
                window.GameHubAuth.switchTab('register');
            } else {
                // Fallback si l'auth n'est pas encore chargé
                setTimeout(() => {
                    if (window.GameHubAuth) {
                        window.GameHubAuth.showModal();
                        window.GameHubAuth.switchTab('register');
                    }
                }, 100);
            }
        });
    }

    // Écouter les événements d'authentification pour mettre à jour l'interface
    document.addEventListener('userLoggedIn', () => {
        updateNavbarAuth();
    });

    document.addEventListener('userLoggedOut', () => {
        updateNavbarAuth();
    });

    // Fonction pour mettre à jour l'interface d'authentification dans la navbar
    function updateNavbarAuth() {
        const navAuth = document.querySelector('.nav-auth');
        const quickLoginBtn = document.getElementById('quickLoginBtn');
        const quickRegisterBtn = document.getElementById('quickRegisterBtn');
        
        if (window.GameHubAuth && window.GameHubAuth.isLoggedIn()) {
            // Utilisateur connecté - afficher les infos utilisateur
            const user = window.GameHubAuth.getUser();
            navAuth.innerHTML = `
                <div class="user-nav-info">
                    <img src="${user.avatar || '/assets/default-avatar.png'}" alt="Avatar" class="user-nav-avatar">
                    <span class="user-nav-name">${user.username}</span>
                    <button id="navLogoutBtn" class="btn-quick btn-logout">
                        <span class="btn-icon">🚪</span>
                        Déconnexion
                    </button>
                </div>
            `;
            
            // Ajouter l'événement de déconnexion
            document.getElementById('navLogoutBtn').addEventListener('click', () => {
                window.GameHubAuth.logout();
            });
        } else {
            // Utilisateur non connecté - afficher les boutons de connexion
            navAuth.innerHTML = `
                <button id="quickRegisterBtn" class="btn-quick btn-register">
                    <span class="btn-icon">👤</span>
                    S'inscrire
                </button>
                <button id="quickLoginBtn" class="btn-quick btn-login">
                    <span class="btn-icon">🔑</span>
                    Connexion
                </button>
            `;
            
            // Réattacher les événements
            document.getElementById('quickLoginBtn').addEventListener('click', () => {
                window.GameHubAuth.showModal();
                window.GameHubAuth.switchTab('login');
            });
            
            document.getElementById('quickRegisterBtn').addEventListener('click', () => {
                window.GameHubAuth.showModal();
                window.GameHubAuth.switchTab('register');
            });
        }
    }

    // Gestion de la navigation active
    const currentLocation = location.href;
    const menuItems = document.querySelectorAll('.nav-item');
    
    menuItems.forEach((item) => {
        if (item.href === currentLocation) {
            menuItems.forEach(navItem => navItem.classList.remove('active')); 
            item.classList.add("active");
        }
    });

    // Effet de scroll sur la navbar
    let lastScrollY = window.scrollY;
    const navbar = document.querySelector('.navbar');

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY > 100) {
            navbar.style.background = 'rgba(17, 24, 39, 0.95)';
            navbar.style.backdropFilter = 'blur(25px)';
        } else {
            navbar.style.background = 'rgba(17, 24, 39, 0.9)';
            navbar.style.backdropFilter = 'blur(20px)';
        }
        
        lastScrollY = currentScrollY;
    });

    // Animation des compteurs (si présents)
    const animateCounters = () => {
        const counters = document.querySelectorAll('[data-count]');
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-count'));
            const duration = 2000;
            const increment = target / (duration / 16);
            let current = 0;
            
            const updateCounter = () => {
                current += increment;
                if (current < target) {
                    counter.textContent = Math.floor(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target;
                }
            };
            
            updateCounter();
        });
    };

    // Observer pour déclencher les animations au scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                
                // Déclencher l'animation des compteurs si c'est la section équipe
                if (entry.target.classList.contains('team-section')) {
                    animateCounters();
                }
            }
        });
    }, observerOptions);

    // Observer les sections pour les animations
    const sections = document.querySelectorAll('.team-section, .doc-section');
    sections.forEach(section => {
        observer.observe(section);
    });

    // Effet de parallaxe subtil
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.card, .member');
        
        parallaxElements.forEach((element, index) => {
            const speed = 0.1 + (index * 0.02);
            const yPos = -(scrolled * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
    });

    // Amélioration des interactions tactiles sur mobile
    if ('ontouchstart' in window) {
        document.body.classList.add('touch-device');
        
        // Améliorer les effets de survol sur mobile
        cards.forEach(card => {
            card.addEventListener('touchstart', () => {
                card.style.transform = 'translateY(-4px) scale(1.02)';
            });
            
            card.addEventListener('touchend', () => {
                setTimeout(() => {
                    card.style.transform = 'translateY(0) scale(1)';
                }, 150);
            });
        });
    }

    // Préchargement des images pour une meilleure performance
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));

    console.log('🎮 Game Hub initialized with Valcoria style!');
});
// Amélioration de la navbar avec effets de vent
document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.querySelector('.navbar');
    let lastScrollY = window.scrollY;

    // Effet de scroll sur la navbar avec mouvement de vent
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Animation de la navbar selon le scroll avec effet de vent
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
            // Scroll vers le bas - mouvement de vent subtil
            navbar.style.transform = 'translateX(-50%) translateY(-8px) rotate(0.2deg)';
            navbar.style.opacity = '0.9';
        } else {
            // Scroll vers le haut - retour avec oscillation
            navbar.style.transform = 'translateX(-50%) translateY(0) rotate(0deg)';
            navbar.style.opacity = '1';
        }
        
        lastScrollY = currentScrollY;
    });

    // Effet de clic sur les liens de navigation avec mouvement de vent
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            // Animation de clic avec effet de vent
            item.style.transform = 'translateY(-1px) scale(0.95) rotate(0.5deg)';
            setTimeout(() => {
                item.style.transform = 'translateY(-1px) scale(1) rotate(-0.2deg)';
                setTimeout(() => {
                    item.style.transform = 'translateY(-1px) scale(1) rotate(0deg)';
                }, 100);
            }, 150);
        });

        // Effet de mouvement aléatoire subtil au survol
        item.addEventListener('mouseenter', () => {
            const randomX = (Math.random() - 0.5) * 2;
            const randomRotate = (Math.random() - 0.5) * 1;
            item.style.transform = `translateY(-1px) translateX(${randomX}px) rotate(${randomRotate}deg)`;
        });

        item.addEventListener('mouseleave', () => {
            item.style.transform = 'translateY(0) translateX(0) rotate(0deg)';
        });
    });

    // Animation d'apparition progressive avec effet de vent
    navItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(10px) rotate(2deg)';
        
        setTimeout(() => {
            item.style.transition = 'all 0.5s ease';
            item.style.opacity = '1';
            item.style.transform = 'translateY(0) rotate(0deg)';
        }, 200 + (index * 100));
    });

    // Effet de vent aléatoire sur le logo
    const logo = document.querySelector('.nav-logo');
    if (logo) {
        setInterval(() => {
            const randomX = (Math.random() - 0.5) * 1;
            const randomY = (Math.random() - 0.5) * 1;
            const randomRotate = (Math.random() - 0.5) * 0.5;
            
            logo.style.transform = `translateX(${randomX}px) translateY(${randomY}px) rotate(${randomRotate}deg)`;
            
            setTimeout(() => {
                logo.style.transform = 'translateX(0) translateY(0) rotate(0deg)';
            }, 1000);
        }, 3000);
    }

    // Effet de vent sur la navbar entière
    setInterval(() => {
        if (!navbar.matches(':hover')) {
            const randomY = (Math.random() - 0.5) * 1;
            const randomRotate = (Math.random() - 0.5) * 0.3;
            
            navbar.style.transform = `translateX(-50%) translateY(${randomY}px) rotate(${randomRotate}deg)`;
            
            setTimeout(() => {
                navbar.style.transform = 'translateX(-50%) translateY(0) rotate(0deg)';
            }, 1500);
        }
    }, 4000);
});