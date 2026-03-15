document.addEventListener('DOMContentLoaded', () => {
    
    // Theme toggling
    const themeBtn = document.getElementById('theme-btn');
    if (themeBtn) {
        // Load preference
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);

        themeBtn.addEventListener('click', () => {
            let current = document.documentElement.getAttribute('data-theme');
            let next = current === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('theme', next);
            updateThemeIcon(next);
            
            // Dispatch event for charts to redraw if needed
            window.dispatchEvent(new Event('themeChanged'));
        });
        
        // Also bind the mobile theme toggle if it exists
        const mobileThemeBtn = document.getElementById('mobile-theme-btn');
        if (mobileThemeBtn) {
            mobileThemeBtn.addEventListener('click', () => {
                const current = document.documentElement.getAttribute('data-theme');
                const next = current === 'dark' ? 'light' : 'dark';
                
                document.documentElement.setAttribute('data-theme', next);
                localStorage.setItem('theme', next);
                updateThemeIcon(next);
                window.dispatchEvent(new Event('themeChanged'));
            });
        }
    }

    function updateThemeIcon(theme) {
        const desktopIcon = theme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        if (themeBtn) themeBtn.innerHTML = desktopIcon;
        const mobileThemeBtn = document.getElementById('mobile-theme-btn');
        if (mobileThemeBtn) mobileThemeBtn.innerHTML = desktopIcon;
    }

    // UI Auth State Update
    const userStr = localStorage.getItem('user');
    const navLoginBtn = document.getElementById('nav-login');
    if (navLoginBtn) {
        if (userStr) {
            const user = JSON.parse(userStr);
            // Default "Giri" to the full name requested
            const displayName = (user.username && user.username.toLowerCase() === 'giri') ? 'Giridharan' : (user.username || 'Giridharan');
            const initial = displayName.charAt(0).toUpperCase();

            const profileHTML = `
                <div class="relative animate__animated animate__fadeIn z-50">
                    <!-- Profile Badge -->
                    <button id="profile-badge-btn" class="flex items-center gap-3 p-1.5 pr-4 rounded-full glass-panel border border-[var(--glass-border)] hover:bg-[var(--glass-card-hover)] transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 outline-none">
                        <!-- Avatar with glowing gradient border -->
                        <div class="w-10 h-10 flex-shrink-0 rounded-full p-[2px] bg-[var(--gradient-full)] shadow-[0_0_12px_rgba(139,92,246,0.6)] animate-pulse">
                            <div class="w-full h-full rounded-full bg-[var(--bg-color)] flex items-center justify-center font-bold text-lg text-[var(--text-primary)]">
                                ${initial}
                            </div>
                        </div>
                        <!-- Name & Subtitle -->
                        <div class="text-left hidden lg:block">
                            <h4 class="text-sm font-bold text-[var(--text-primary)] leading-none mb-1">${displayName}</h4>
                            <p class="text-[10px] text-[var(--text-secondary)] font-medium leading-none">AI Creator &bull; ViewProphet Developer</p>
                        </div>
                        <i class="fas fa-chevron-down text-xs text-[var(--text-secondary)] ml-1 transition-transform duration-300" id="profile-chevron"></i>
                    </button>
                    
                    <!-- Dropdown Menu -->
                    <div id="profile-dropdown" class="absolute right-0 mt-3 w-60 rounded-2xl glass-panel border border-[var(--glass-border)] shadow-2xl opacity-0 invisible transition-all duration-300 transform origin-top translate-y-3 overflow-hidden">
                        <div class="p-4 border-b border-[var(--glass-border)] bg-[var(--input-bg)]">
                            <p class="text-xs text-[var(--text-secondary)] mb-1">Signed in as</p>
                            <p class="text-sm font-bold text-gradient truncate">${displayName}</p>
                        </div>
                        <div class="p-2 space-y-1 bg-[var(--bg-color)]/50">
                            <a href="#" class="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-card-hover)] rounded-xl transition-colors">
                                <i class="fas fa-user-circle w-5 text-center text-[var(--gradient-1)]"></i> Profile
                            </a>
                            <a href="dashboard.html" class="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-card-hover)] rounded-xl transition-colors">
                                <i class="fas fa-chart-pie w-5 text-center text-[var(--gradient-2)]"></i> Dashboard
                            </a>
                        </div>
                        <div class="p-2 border-t border-[var(--glass-border)] bg-[var(--bg-color)]/50">
                            <a href="#" id="logout-btn" class="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 rounded-xl transition-colors">
                                <i class="fas fa-sign-out-alt w-5 text-center"></i> Logout
                            </a>
                        </div>
                    </div>
                </div>
            `;
            
            navLoginBtn.outerHTML = profileHTML;

            // Toggle Dropdown On Click
            const profileBadge = document.getElementById('profile-badge-btn');
            const profileDropdown = document.getElementById('profile-dropdown');
            const chevron = document.getElementById('profile-chevron');
            
            profileBadge.addEventListener('click', (e) => {
                e.stopPropagation(); // prevent window click
                profileDropdown.classList.toggle('opacity-0');
                profileDropdown.classList.toggle('invisible');
                profileDropdown.classList.toggle('translate-y-3');
                chevron.classList.toggle('rotate-180');
            });

            // Close when clicking outside
            window.addEventListener('click', () => {
                if(!profileDropdown.classList.contains('invisible')) {
                    profileDropdown.classList.add('opacity-0', 'invisible', 'translate-y-3');
                    chevron.classList.remove('rotate-180');
                }
            });

            // Re-attach logout listener
            document.getElementById('logout-btn').addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('user');
                window.location.href = 'index.html';
            });
        }
    }

    // --- Premium Animations & Page Transitions ---
    
    // 1. Initial Page Entrance
    document.body.classList.add('page-transition-enter');

    // 2. Intercept Links for Exit Animation
    const links = document.querySelectorAll('a');
    links.forEach(link => {
        // Only target internal navigation links, skip hashes or open-in-new-tab
        if (link.hostname === window.location.hostname && 
            !link.href.includes('#') && 
            link.target !== '_blank' &&
            !link.hasAttribute('onclick')) // Don't override logical clicks
        {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetUrl = link.href;
                
                // Trigger exit animation
                document.body.classList.remove('page-transition-enter');
                document.body.classList.add('page-transition-exit');
                
                // Wait for animation to finish then navigate
                setTimeout(() => {
                    window.location.href = targetUrl;
                }, 350); // Matches CSS animation duration
            });
        }
    });

    // --- Mobile Menu Logic ---
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            if (mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.remove('hidden');
                // Allow CSS transition to kick in if using animate.css
                mobileMenu.classList.add('animate__fadeInDown');
            } else {
                mobileMenu.classList.add('hidden');
                mobileMenu.classList.remove('animate__fadeInDown');
            }
        });
    }

    const mobileToolsBtn = document.getElementById('mobile-tools-btn');
    const mobileToolsMenu = document.getElementById('mobile-tools-menu');
    const mobileToolsChevron = document.getElementById('mobile-tools-chevron');
    
    if (mobileToolsBtn && mobileToolsMenu && mobileToolsChevron) {
        mobileToolsBtn.addEventListener('click', () => {
            if (mobileToolsMenu.classList.contains('hidden')) {
                mobileToolsMenu.classList.remove('hidden');
                mobileToolsMenu.classList.add('flex');
                mobileToolsChevron.classList.add('rotate-180');
            } else {
                mobileToolsMenu.classList.add('hidden');
                mobileToolsMenu.classList.remove('flex');
                mobileToolsChevron.classList.remove('rotate-180');
            }
        });
    }
});
