document.addEventListener('DOMContentLoaded', () => {
    
    
    const searchBar = document.getElementById('searchBar');
    const cards = document.querySelectorAll('.card');

    if (searchBar) {
        searchBar.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            cards.forEach(card => {
                const title = card.querySelector('h2').textContent.toLowerCase();
                const desc = card.querySelector('.desc').textContent.toLowerCase();
                
                if (title.includes(term) || desc.includes(term)) {
                    card.style.display = 'flex';
                    setTimeout(() => card.style.opacity = '1', 50);
                } else {
                    card.style.opacity = '0';
                    setTimeout(() => card.style.display = 'none', 300);
                }
            });
        });
    }

   
    if (cards.length > 0) {
        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                
                const rotateX = ((y - centerY) / centerY) * -10; 
                const rotateY = ((x - centerX) / centerX) * 10;

                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
            });

            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
            });
        });
    }

    
    const currentLocation = location.href;
    const menuItem = document.querySelectorAll('.nav-item');
    const menuLength = menuItem.length;
    for (let i = 0; i < menuLength; i++) {
        if (menuItem[i].href === currentLocation) {
            
            menuItem.forEach(item => item.classList.remove('active')); 
            menuItem[i].classList.add("active");
        }
    }
});