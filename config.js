// Configure the Apps Script webapp base URL (deployed web app URL)
// Example: const API_BASE = 'https://script.google.com/macros/s/AKfycbx.../exec';
const API_BASE = 'https://script.google.com/macros/s/AKfycbxO7Wv0i6g2kTtb2GOe7KtGMplZInquH9qDexD0boUtnELR5mA0p6SRODymjgLOfhZG/exec';

// Optional: Configure a deployed bridge server URL if you want the GH Pages UI
// to proxy through a hosted bridge instead of calling Apps Script directly.
// Example: const BRIDGE_BASE = 'https://chorus-bridge.example.com';
// The bridge server is expected to expose endpoints at /api/:fn, e.g.
// https://chorus-bridge.example.com/api/listCommands
const BRIDGE_BASE = '';
