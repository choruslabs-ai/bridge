// Dashboard state
let dashboardOpen = false;
let dashboardUrl = '';

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
  
  if (dashboardOpen) {
    closeDashboard();
  } else {
    // Use API_BASE as the dashboard URL if configured, otherwise use a default
    if (API_BASE) {
      // Remove any query parameters and get the base URL
      dashboardUrl = API_BASE.split('?')[0];
    } else {
      // Fallback - user must configure API_BASE
      setConnectionStatus('Dashboard requires API_BASE in config.js', false);
      return;
    }
    
    // Add a cache-busting parameter to prevent iframe caching issues
    const separator = dashboardUrl.includes('?') ? '&' : '?';
    const fullUrl = dashboardUrl + separator + 't=' + Date.now();
    
    frame.src = fullUrl;
    overlay.classList.remove('hidden');
    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    btn.classList.add('active');
    btn.innerHTML = '<span class="btn-icon">✕</span><span class="btn-text">Close</span>';
    dashboardOpen = true;
  }
}

function closeDashboard() {
  const overlay = document.getElementById('dashboardOverlay');
  const frame = document.getElementById('dashboardFrame');
  const btn = document.getElementById('dashboardToggle');
  
  overlay.classList.add('hidden');
  overlay.style.display = 'none';
  frame.src = '';
  document.body.style.overflow = '';
  btn.classList.remove('active');
  btn.innerHTML = '<span class="btn-icon">📊</span><span class="btn-text">Dashboard</span>';
  dashboardOpen = false;
}

// Close dashboard on Escape key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape' && dashboardOpen) {
    closeDashboard();
  }
});

// Close dashboard when clicking on the overlay background
document.addEventListener('click', function(e) {
  const overlay = document.getElementById('dashboardOverlay');
  if (e.target === overlay && dashboardOpen) {
    closeDashboard();
  }
});

async function api(path, params){
  const base = BRIDGE_BASE || API_BASE;
  if (!base) {
    setConnectionStatus('Not configured', false);
    document.getElementById('servers').innerHTML = '<div class="error-state">⚠️ API_BASE or BRIDGE_BASE not configured in config.js</div>';
    document.getElementById('commands').innerHTML = '<div class="error-state">⚠️ API_BASE or BRIDGE_BASE not configured in config.js</div>';
    throw new Error('API_BASE or BRIDGE_BASE not configured');
  }

  let url;
  if (BRIDGE_BASE) {
    const cleanBase = BRIDGE_BASE.replace(/\/+$|\/(?:api)?$/g, '');
    url = new URL(cleanBase + '/api/' + encodeURIComponent(path));
  } else {
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

document.getElementById('bs').addEventListener('click', async function(){ 
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

// Allow Enter key to trigger search
document.getElementById('q').addEventListener('keypress', function(e) {
  if (e.key === 'Enter') {
    document.getElementById('bs').click();
  }
});

// Load initial data
load().catch(e => {
  console.error(e);
  document.getElementById('servers').innerHTML = '<div class="error-state">❌ Error loading: ' + e.message + '</div>';
  document.getElementById('commands').innerHTML = '<div class="error-state">❌ Error loading: ' + e.message + '</div>';
});
