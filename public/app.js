/* OmniWord - Main Application JS */
const editor = document.getElementById('editor');
const page = document.getElementById('page');
const gboardContainer = document.getElementById('gboardContainer');
let savedRange = null;
let isShifted = false;
let backspaceInterval = null;

// ============================================================
// EMOJI DATA (MUST BE DEFINED BEFORE USE)
// ============================================================
const emojiCategories = {
  smileys: ['😀', '😁', '😂', '🤣', '😃', '😄', '😅', '😆', '😉', '😊', '😇', '🙂', '🙃', '😌', '😍', '🥰', '😘', '😗', '😚', '😙'],
  nature: ['🌿', '🌱', '🍀', '🌲', '🌳', '🌴', '🌵', '🌾', '🌷', '🌹', '🥀', '🌺', '🌻', '🌼', '🌞', '🌝', '🌛', '🌜', '⭐', '🌟'],
  food: ['🍕', '🍔', '🍟', '🌭', '🍿', '🥓', '🍗', '🍖', '🌮', '🌯', '🥙', '🧆', '🍱', '🍜', '🍝', '🍛', '🍣', '🍱', '🥘', '🍲'],
  activity: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎳', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🥅', '⛳', '⛸', '🎣'],
  travel: ['✈️', '🚁', '🚂', '🚃', '🚄', '🚅', '🚆', '🚇', '🚈', '🚉', '🚊', '🚝', '🚞', '🚋', '🚌', '🚍', '🚎', '🚐', '🚑', '🚒'],
  objects: ['💡', '🔦', '🏮', '🪔', '📷', '📸', '📹', '🎥', '📽', '🎞', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙', '🎚', '🎛', '⏱'],
  symbols: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '👋', '🤚']
};

// ============================================================
// MOBILE DETECTION
// ============================================================
const IS_MOBILE = (function () {
  if (/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)) return true;
  if (navigator.maxTouchPoints > 1 && window.innerWidth < 1024) return true;
  try {
    document.createEvent("TouchEvent");
    if (window.innerWidth < 1024) return true;
  } catch (_) {}
  return false;
})();

if (IS_MOBILE) {
  document.body.classList.add('is-mobile');
  editor.setAttribute('inputmode', 'none');
  gboardContainer.removeAttribute('hidden');
  initializeKeyboard();
  initializeEmojis();
} else {
  editor.removeAttribute('inputmode');
}

// ============================================================
// SAVE/RESTORE SELECTION
// ============================================================
function saveSelection() {
  const sel = window.getSelection();
  if (sel && sel.rangeCount > 0) {
    const r = sel.getRangeAt(0);
    if (editor.contains(r.commonAncestorContainer)) {
      savedRange = r.cloneRange();
    }
  }
}

function restoreSelection() {
  const sel = window.getSelection();
  if (savedRange) {
    try {
      sel.removeAllRanges();
      sel.addRange(savedRange);
    } catch (e) {
      editor.focus();
    }
  } else {
    editor.focus();
  }
}

document.addEventListener('selectionchange', saveSelection);

// ============================================================
// KEYBOARD INPUT HANDLING
// ============================================================
function insertText(char) {
  restoreSelection();
  document.execCommand('insertText', false, char);
  if (isShifted) {
    isShifted = false;
    updateShiftState();
  }
}

function insertNewline() {
  restoreSelection();
  document.execCommand('insertHTML', false, '<br><br>');
}

function startBackspace() {
  restoreSelection();
  doBackspace();
  backspaceInterval = setInterval(doBackspace, 70);
}

function stopBackspace() {
  if (backspaceInterval) {
    clearInterval(backspaceInterval);
    backspaceInterval = null;
  }
}

function doBackspace() {
  const sel = window.getSelection();
  if (!sel.rangeCount) return;
  
  const range = sel.getRangeAt(0);
  if (range.collapsed) {
    range.setStart(range.startContainer, Math.max(0, range.startOffset - 1));
  }
  range.deleteContents();
}

function toggleShift() {
  isShifted = !isShifted;
  updateShiftState();
}

function updateShiftState() {
  const shiftBtn = document.getElementById('shiftBtn');
  if (isShifted) {
    shiftBtn.classList.add('active-mod');
  } else {
    shiftBtn.classList.remove('active-mod');
  }
}

function switchLayer(layerName) {
  // Hide all layers
  document.querySelectorAll('.gboard-layer').forEach(l => l.setAttribute('hidden', ''));
  
  // Show requested layer
  if (layerName === 'abc') {
    document.getElementById('layerABC').removeAttribute('hidden');
  } else if (layerName === '123') {
    document.getElementById('layer123').removeAttribute('hidden');
  } else if (layerName === 'sym') {
    document.getElementById('layerSym').removeAttribute('hidden');
  }
}

function initializeKeyboard() {
  const container = document.getElementById('gboardContainer');
  
  // All keyboard keys with data-char attribute
  container.querySelectorAll('[data-char]').forEach(btn => {
    btn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      insertText(btn.dataset.char);
    });
  });

  // Layer switchers
  container.querySelectorAll('[data-layer]').forEach(btn => {
    btn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      switchLayer(btn.dataset.layer);
    });
  });

  // Enter key
  container.querySelectorAll('.gkey-enter').forEach(btn => {
    btn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      insertNewline();
    });
  });

  // Backspace keys
  container.querySelectorAll('.gkey-delete').forEach(btn => {
    btn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      startBackspace();
    });
    btn.addEventListener('pointerup', stopBackspace);
    btn.addEventListener('pointercancel', stopBackspace);
    btn.addEventListener('pointerleave', stopBackspace);
  });

  // Shift key
  const shiftBtn = document.getElementById('shiftBtn');
  if (shiftBtn) {
    shiftBtn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      toggleShift();
    });
  }

  // Emoji button
  const emojiBtn = container.querySelector('.emoji-btn-kbd');
  if (emojiBtn) {
    emojiBtn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      toggleEmojiPanel();
    });
  }
}

// ============================================================
// EMOJI HANDLING (PERSISTENT)
// ============================================================

function initializeEmojis() {
  const emojiTabs = document.querySelectorAll('.emoji-tab');
  const emojiGrid = document.getElementById('emojiGrid');
  
  // Set default category
  renderEmojiGrid('smileys', emojiGrid);
  
  // Tab switching
  emojiTabs.forEach(tab => {
    tab.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      
      // Remove active from all
      emojiTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Render new category
      const category = tab.dataset.cat;
      renderEmojiGrid(category, emojiGrid);
    });
  });
}

function renderEmojiGrid(category, grid) {
  grid.innerHTML = '';
  const emojis = emojiCategories[category] || [];
  
  emojis.forEach(emoji => {
    const btn = document.createElement('button');
    btn.className = 'emoji-btn';
    btn.textContent = emoji;
    btn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      insertText(emoji);
      // Keep panel open - don't close it
    });
    grid.appendChild(btn);
  });
}

function toggleEmojiPanel() {
  const panel = document.getElementById('emojiPanel');
  if (!panel) return;
  
  if (panel.style.display === 'none' || !panel.style.display) {
    panel.style.display = 'flex';
  } else {
    panel.style.display = 'none';
  }
}

// ============================================================
// RIBBON FUNCTIONS (DESKTOP + MOBILE)
// ============================================================
function applyFont(fontFamily) {
  restoreSelection();
  document.execCommand('fontName', false, fontFamily);
}

function applyFontSize(size) {
  restoreSelection();
  document.execCommand('fontSize', false, size);
}

function execCmd(cmd, value = null) {
  restoreSelection();
  document.execCommand(cmd, false, value);
}

function clearFormatting() {
  restoreSelection();
  document.execCommand('removeFormat');
}

function selectAll() {
  document.execCommand('selectAll');
}

function undo() {
  document.execCommand('undo');
}

function redo() {
  document.execCommand('redo');
}

function zoomIn() {
  const currentZoom = parseInt(document.getElementById('zoomLevel').textContent);
  const newZoom = Math.min(currentZoom + 10, 200);
  setZoom(newZoom);
}

function zoomOut() {
  const currentZoom = parseInt(document.getElementById('zoomLevel').textContent);
  const newZoom = Math.max(currentZoom - 10, 50);
  setZoom(newZoom);
}

function setZoom(percent) {
  const scale = percent / 100;
  page.style.transform = `scale(${scale})`;
  page.style.transformOrigin = 'top center';
  document.getElementById('zoomLevel').textContent = percent + '%';
}

// ============================================================
// UPDATE WORD COUNT
// ============================================================
function updateStats() {
  const text = editor.innerText || '';
  const words = text.trim().split(/\s+/).filter(w => w).length;
  const chars = text.length;
  const pages = Math.ceil(text.length / 3000) || 1;
  
  document.getElementById('wordCount').textContent = words + ' words';
  document.getElementById('charCount').textContent = chars + ' characters';
  document.getElementById('pageInfo').textContent = 'Page 1 of ' + pages;
}

editor.addEventListener('input', updateStats);
editor.addEventListener('keyup', updateStats);
updateStats();

// ============================================================
// RIBBON TAB SWITCHING
// ============================================================
document.querySelectorAll('.ribbon-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    // Remove active from all tabs
    document.querySelectorAll('.ribbon-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
  });
});

// ============================================================
// DARK MODE
// ============================================================
const darkModeToggle = document.getElementById('darkModeToggle');
if (darkModeToggle) {
  darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
  });
}

// ============================================================
// CONTEXT MENU (LONG-PRESS)
// ============================================================
let longPressTimer = null;
let contextMenuShown = false;

editor.addEventListener('touchstart', (e) => {
  longPressTimer = setTimeout(() => {
    showContextMenu(e.touches[0].clientX, e.touches[0].clientY);
  }, 500);
});

editor.addEventListener('touchend', () => {
  if (longPressTimer) clearTimeout(longPressTimer);
});

editor.addEventListener('touchmove', () => {
  if (longPressTimer) clearTimeout(longPressTimer);
});

function showContextMenu(x, y) {
  // Select word at tap position
  const sel = window.getSelection();
  const range = document.caretRangeFromPoint(x, y);
  if (range && editor.contains(range.commonAncestorContainer)) {
    sel.removeAllRanges();
    sel.addRange(range);
    sel.modify('extend', 'forward', 'word');
  }
  
  // Show menu
  const menu = document.getElementById('ctxMenu');
  const overlay = document.getElementById('ctxOverlay');
  menu.style.left = Math.min(x, window.innerWidth - 180) + 'px';
  menu.style.top = Math.min(y, window.innerHeight - 200) + 'px';
  menu.classList.add('show');
  overlay.classList.add('show');
  contextMenuShown = true;
}

function closeContextMenu() {
  const menu = document.getElementById('ctxMenu');
  const overlay = document.getElementById('ctxOverlay');
  menu.classList.remove('show');
  overlay.classList.remove('show');
  contextMenuShown = false;
}

// Prevent default context menu
editor.addEventListener('contextmenu', (e) => {
  if (IS_MOBILE) e.preventDefault();
});

// ============================================================
// DOCUMENT SAVE
// ============================================================
function saveDocument() {
  const content = editor.innerHTML;
  const fileName = document.getElementById('docName').value || 'Document';
  const blob = new Blob([content], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName + '.html';
  a.click();
  URL.revokeObjectURL(url);
}

// ============================================================
// KEYBOARD SHORTCUTS (DESKTOP)
// ============================================================
document.addEventListener('keydown', (e) => {
  if (!IS_MOBILE) {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 's') {
        e.preventDefault();
        saveDocument();
      } else if (e.key === 'p') {
        e.preventDefault();
        window.print();
      }
    }
  }
});

// ============================================================
// INITIALIZATION
// ============================================================
console.log('OmniWord initialized. Mobile:', IS_MOBILE);
