const API_BASE = 'http://localhost:5000/api';

// Auth Login
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        const msgEl = document.getElementById('auth-msg');
        
        const btn = loginForm.querySelector('button[type="submit"]');
        const originalBtnHtml = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Authenticating...';
        btn.disabled = true;

        try {
            const res = await fetch(`${API_BASE}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();
            
            if (res.ok) {
                btn.innerHTML = '<i class="fas fa-check-circle"></i> Success';
                btn.classList.add('bg-green-500');
                localStorage.setItem('user', JSON.stringify({ id: data.user_id, username: data.username }));
                
                // Trigger Zoom-out Animation
                setTimeout(() => {
                    const authPanel = document.querySelector('.glass-panel');
                    if (authPanel) {
                        authPanel.classList.add('scale-out-zoom');
                    }
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 400); // Wait for zoom out
                }, 500); // 500ms success state before starting zoom out
            } else {
                msgEl.innerText = data.error;
                msgEl.classList.remove('hidden');
                btn.innerHTML = originalBtnHtml;
                btn.disabled = false;
            }
        } catch (err) {
            msgEl.innerText = "Connection error. Ensure backend is running.";
        }
    });
}

// Auth Register
const registerForm = document.getElementById('register-form');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('reg-username').value;
        const password = document.getElementById('reg-password').value;
        const msgEl = document.getElementById('auth-msg');
        
        const btn = registerForm.querySelector('button[type="submit"]');
        const originalBtnHtml = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
        btn.disabled = true;

        try {
            const res = await fetch(`${API_BASE}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();
            
            if (res.ok) {
                btn.innerHTML = '<i class="fas fa-check-circle"></i> Success';
                btn.classList.add('bg-green-500');
                localStorage.setItem('user', JSON.stringify({ id: data.user_id, username: username }));
                
                setTimeout(() => {
                    const authPanel = document.querySelector('.glass-panel');
                    if (authPanel) {
                        authPanel.classList.add('scale-out-zoom');
                    }
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 400); 
                }, 500);
            } else {
                msgEl.innerText = data.error;
                msgEl.classList.remove('hidden');
                btn.innerHTML = originalBtnHtml;
                btn.disabled = false;
            }
        } catch (err) {
            msgEl.innerText = "Connection error. Ensure backend is running.";
            msgEl.classList.remove('hidden');
            btn.innerHTML = originalBtnHtml;
            btn.disabled = false;
        }
    });
}

// Prediction Request
const predictionForm = document.getElementById('prediction-form');
if (predictionForm) {
    predictionForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const btn = document.getElementById('predict-btn');
        const originalText = btn.innerHTML;
        
        // Premium Analyzing State
        btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Analyzing Metrics... <div class="absolute bottom-0 left-0 h-1 bg-white animate-pulse" style="width:100%"></div>';
        btn.disabled = true;

        const title = document.getElementById('title').value;
        const categorySelect = document.getElementById('category');
        const categoryId = categorySelect.value;
        const categoryName = categorySelect.options[categorySelect.selectedIndex].text;
        const yt_url = document.getElementById('yt-url').value;
        
        const payload = {
            title: title,
            category: categoryId,
            category_name: categoryName,
            yt_url: yt_url
        };

        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            payload.user_id = user.id;
        }

        try {
            const res = await fetch(`${API_BASE}/predict`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            
            if (res.ok) {
                // Attach title to result data to show in UI
                data.title = title;
                localStorage.setItem('predictionResult', JSON.stringify(data));
                window.location.href = 'result.html';
            } else {
                alert(data.error);
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        } catch (err) {
            alert("Failed to connect to AI engine.");
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    });
}
