// Dashboard state
let dashboardOpen = false;
let dashboardUrl = '';
let isFullscreen = false;

function setConnectionStatus(message, online) {
  const dot = document.querySelector('.status-dot');
  const text = document.querySelector('.status-text');
  if (dot) {
    dot.classList.toggle('online', online === true);
    dot.classList.toggle('offline', online !== true);
  }
  if (text) {
    text.textContent = message;
    text.classList.toggle('online', online === true);
    text.classList.toggle('offline', online !== true);
  }
}

// Dashboard toggle functions
function toggleDashboard() {
  const overlay = document.getElementById('dashboardOverlay');
  const frame = document.getElementById('dashboardFrame');
  const btn = document.getElementById('dashboardToggle');
  const loading = document.getElementById('dashboardLoading');
  
  if (dashboardOpen) {
    closeDashboard();
  } else {
    // Use API_BASE as the dashboard URL if configured
    if (API_BASE && API_BASE !== '') {
      // Remove any query parameters and get the base URL
      dashboardUrl = API_BASE.split('?')[0];
      console.log('📊 Dashboard URL from API_BASE:', dashboardUrl);
    } else {
      // Fallback - user must configure API_BASE
      setConnectionStatus('Dashboard requires API_BASE in config.js', false);
      showNotification('Please configure API_BASE in config.js to use the dashboard.', 'error');
      console.error('❌ API_BASE is not configured in config.js');
      return;
    }
    
    // Add a cache-busting parameter to prevent iframe caching issues
    const separator = dashboardUrl.includes('?') ? '&' : '?';
    const fullUrl = dashboardUrl + separator + 't=' + Date.now();
    console.log('📊 Full dashboard URL:', fullUrl);
    
    // Show loading state
    if (loading) {
      loading.style.display = 'flex';
      loading.innerHTML = `
        <div class="loading-spinner"></div>
        <span>Loading Dashboard...</span>
      `;
    }
    frame.style.display = 'none';
    
    // Set iframe source and show overlay
    frame.src = fullUrl;
    console.log('📊 Iframe src set to:', frame.src);
    
    overlay.classList.remove('hidden');
    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Update button
    btn.classList.add('active');
    btn.innerHTML = '<span class="btn-icon">✕</span><span class="btn-text">Close</span>';
    dashboardOpen = true;
    
    // Hide loading when iframe loads
    frame.onload = function() {
      console.log('✅ Dashboard iframe loaded successfully');
      if (loading) {
        loading.style.display = 'none';
      }
      frame.style.display = 'block';
    };
    
    // Handle iframe load errors
    frame.onerror = function() {
      console.error('❌ Failed to load dashboard iframe');
      if (loading) {
        loading.innerHTML = `
          <div style="text-align:center;color:#f87171;">
            <div style="font-size:48px;margin-bottom:16px;">⚠️</div>
            <div style="font-weight:600;margin-bottom:8px;">Failed to load Dashboard</div>
            <div style="font-size:13px;color:#94a3b8;">Check if API_BASE is correct in config.js</div>
            <div style="font-size:12px;color:#64748b;margin-top:8px;word-break:break-all;max-width:400px;">${dashboardUrl}</div>
          </div>
        `;
      }
    };
  }
}

function closeDashboard() {
  const overlay = document.getElementById('dashboardOverlay');
  const frame = document.getElementById('dashboardFrame');
  const btn = document.getElementById('dashboardToggle');
  const loading = document.getElementById('dashboardLoading');
  
  // Exit fullscreen if active
  if (isFullscreen) {
    exitFullscreenMode();
  }
  
  overlay.classList.add('hidden');
  overlay.style.display = 'none';
  frame.src = 'about:blank';
  frame.style.display = 'none';
  if (loading) {
    loading.style.display = 'flex';
    loading.innerHTML = `
      <div class="loading-spinner"></div>
      <span>Loading Dashboard...</span>
    `;
  }
  document.body.style.overflow = '';
  btn.classList.remove('active');
  btn.innerHTML = '<span class="btn-icon">📊</span><span class="btn-text">Dashboard</span>';
  dashboardOpen = false;
  console.log('📊 Dashboard closed');
}

// Fullscreen functions
function toggleFullscreen() {
  const container = document.getElementById('dashboardContainer');
  const btn = document.getElementById('dashboardFullscreenBtn');
  
  if (!isFullscreen) {
    // Enter fullscreen
    if (container.requestFullscreen) {
      container.requestFullscreen();
    } else if (container.webkitRequestFullscreen) {
      container.webkitRequestFullscreen();
    } else if (container.msRequestFullscreen) {
      container.msRequestFullscreen();
    }
    isFullscreen = true;
    btn.classList.add('active');
    btn.innerHTML = '<span class="fullscreen-icon">⛶</span><span>Exit</span>';
  } else {
    exitFullscreenMode();
  }
}

function exitFullscreenMode() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen();
  }
  isFullscreen = false;
  const btn = document.getElementById('dashboardFullscreenBtn');
  if (btn) {
    btn.classList.remove('active');
    btn.innerHTML = '<span class="fullscreen-icon">⛶</span><span>Fullscreen</span>';
  }
}

// Listen for fullscreen change events
document.addEventListener('fullscreenchange', function() {
  if (!document.fullscreenElement) {
    isFullscreen = false;
    const btn = document.getElementById('dashboardFullscreenBtn');
    if (btn) {
      btn.classList.remove('active');
      btn.innerHTML = '<span class="fullscreen-icon">⛶</span><span>Fullscreen</span>';
    }
  }
});

document.addEventListener('webkitfullscreenchange', function() {
  if (!document.webkitFullscreenElement) {
    isFullscreen = false;
    const btn = document.getElementById('dashboardFullscreenBtn');
    if (btn) {
      btn.classList.remove('active');
      btn.innerHTML = '<span class="fullscreen-icon">⛶</span><span>Fullscreen</span>';
    }
  }
});

// Show notification function
function showNotification(message, type = 'info') {
  const existing = document.querySelector('.notification-toast');
  if (existing) existing.remove();
  
  const toast = document.createElement('div');
  toast.className = `notification-toast ${type}`;
  toast.innerHTML = `
    <span class="notification-icon">${type === 'error' ? '⚠️' : 'ℹ️'}</span>
    <span class="notification-message">${message}</span>
    <button class="notification-close">✕</button>
  `;
  document.body.appendChild(toast);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (toast.parentNode) toast.remove();
  }, 5000);
  
  // Close button
  toast.querySelector('.notification-close').addEventListener('click', function() {
    toast.remove();
  });
}

// Initialize dashboard event listeners
function initDashboardEvents() {
  // Toggle button
  const toggleBtn = document.getElementById('dashboardToggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', toggleDashboard);
  }
  
  // Close button
  const closeBtn = document.getElementById('dashboardCloseBtn');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeDashboard);
  }
  
  // Fullscreen button
  const fullscreenBtn = document.getElementById('dashboardFullscreenBtn');
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', toggleFullscreen);
  }
  
  // Close on Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && dashboardOpen) {
      if (isFullscreen) {
        exitFullscreenMode();
      } else {
        closeDashboard();
      }
    }
  });
  
  // Close when clicking on the overlay background
  const overlay = document.getElementById('dashboardOverlay');
  if (overlay) {
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay && dashboardOpen && !isFullscreen) {
        closeDashboard();
      }
    });
  }
  
  console.log('✅ Dashboard events initialized');
  console.log('📊 API_BASE:', API_BASE || 'NOT SET');
}

// In script.js - modify the API function
async function api(path, params){
  // Try BRIDGE_BASE first, fallback to API_BASE
  const base = BRIDGE_BASE || API_BASE;
  if (!base) {
    setConnectionStatus('Not configured', false);
    document.getElementById('servers').innerHTML = '<div class="error-state">⚠️ API_BASE or BRIDGE_BASE not configured in config.js</div>';
    document.getElementById('commands').innerHTML = '<div class="error-state">⚠️ API_BASE or BRIDGE_BASE not configured in config.js</div>';
    throw new Error('API_BASE or BRIDGE_BASE not configured');
  }

  let url;
  if (BRIDGE_BASE) {
    // Use the bridge to proxy the request
    const cleanBase = BRIDGE_BASE.replace(/\/+$|\/(?:api)?$/g, '');
    url = new URL(cleanBase + '/api/' + encodeURIComponent(path));
  } else {
    // Direct call to Apps Script (will have CORS issues)
    url = new URL(API_BASE);
    url.searchParams.set('api', path);
  }

  if (params) {
    for (const k in params) {
      if (params.hasOwnProperty(k)) {
        url.searchParams.set(k, params[k]);
      }
    }
  }

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error('API request failed: ' + res.status + ' ' + res.statusText);
  }
  return res.json();
}

async function load(){
  setConnectionStatus('Connecting...', false);
  try {
    const s = await api('listServers');
    const el = document.getElementById('servers');
    el.innerHTML = '';
    if (s && s.length > 0) {
      s.forEach(function(x){ 
        const d = document.createElement('div'); 
        d.textContent = x.server_name + ' (' + x.server_id + ')'; 
        el.appendChild(d); 
      });
      document.getElementById('servers-count').textContent = s.length;
    } else {
      el.innerHTML = '<div class="empty-state">No servers found</div>';
      document.getElementById('servers-count').textContent = '0';
    }

    const c = await api('listCommands');
    const ec = document.getElementById('commands');
    ec.innerHTML = '';
    if (c && c.length > 0) {
      c.forEach(function(x){ 
        const d = document.createElement('div'); 
        const idSpan = document.createElement('span');
        idSpan.className = 'command-id';
        idSpan.textContent = x.identifier;
        d.textContent = x.name + ' ';
        d.appendChild(idSpan);
        ec.appendChild(d); 
      });
      document.getElementById('commands-count').textContent = c.length;
    } else {
      ec.innerHTML = '<div class="empty-state">No commands found</div>';
      document.getElementById('commands-count').textContent = '0';
    }
    setConnectionStatus('Connected', true);
  } catch (e) {
    console.error(e);
    setConnectionStatus('Disconnected', false);
    document.getElementById('servers').innerHTML = '<div class="error-state">❌ Error loading: ' + e.message + '</div>';
    document.getElementById('commands').innerHTML = '<div class="error-state">❌ Error loading: ' + e.message + '</div>';
  }
}

// Search functionality
const searchBtn = document.getElementById('bs');
if (searchBtn) {
  searchBtn.addEventListener('click', async function(){ 
    const q = document.getElementById('q').value;
    if (!q.trim()) {
      document.getElementById('kres').innerHTML = '<div class="empty-state">Please enter a search term</div>';
      return;
    }
    
    const el = document.getElementById('kres');
    el.innerHTML = '<div class="loading-state">Searching...</div>';
    
    try {
      const r = await api('searchKnowledge',{q:q});
      el.innerHTML = '';
      if (r && r.length > 0) {
        r.forEach(function(i){ 
          const d = document.createElement('div'); 
          d.className = 'card'; 
          d.innerHTML = '<strong>' + i.title + '</strong><div>' + (i.summary || '') + '</div>'; 
          el.appendChild(d); 
        });
      } else {
        el.innerHTML = '<div class="empty-state">No results found for "' + q + '"</div>';
      }
    } catch (e) {
      el.innerHTML = '<div class="error-state">❌ Search failed: ' + e.message + '</div>';
    }
  });
}

// Allow Enter key to trigger search
const searchInput = document.getElementById('q');
if (searchInput) {
  searchInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      const btn = document.getElementById('bs');
      if (btn) btn.click();
    }
  });
}

// Initialize dashboard events when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDashboardEvents);
} else {
  initDashboardEvents();
}

// Load initial data
load().catch(e => {
  console.error(e);
  const serversEl = document.getElementById('servers');
  const commandsEl = document.getElementById('commands');
  if (serversEl) serversEl.innerHTML = '<div class="error-state">❌ Error loading: ' + e.message + '</div>';
  if (commandsEl) commandsEl.innerHTML = '<div class="error-state">❌ Error loading: ' + e.message + '</div>';
});
