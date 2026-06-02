/**
 * RH199 Student Guide - SPA Application
 * Red Hat Certified System Administrator - Rapid Track
 */

(function () {
  'use strict';

  // ===== STATE =====
  let structure = null;
  let contentCache = {};
  let activeChapter = null;
  let activeSection = null;
  let activeTab = 'all';
  let readSections = JSON.parse(localStorage.getItem('rh199_read') || '{}');

  // ===== DOM REFS =====
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const chapterList = $('#chapterList');
  const mainContent = $('#mainContent');
  const welcomeScreen = $('#welcomeScreen');
  const contentView = $('#contentView');
  const searchInput = $('#searchInput');
  const searchOverlay = $('#searchOverlay');
  const searchResults = $('#searchResults');
  const themeToggle = $('#themeToggle');
  const backToTop = $('#backToTop');
  const sidebarToggle = $('#sidebarToggle');
  const sidebar = $('#sidebar');

  // ===== ICONS =====
  const icons = {
    theory: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/></svg>',
    guided_exercise: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085"/></svg>',
    lab: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"/></svg>',
    quiz: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"/></svg>',
    summary: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"/></svg>'
  };

  const typeLabels = {
    theory: 'Teoría',
    guided_exercise: 'Ejercicio',
    lab: 'Lab',
    quiz: 'Quiz',
    summary: 'Resumen'
  };

  // ===== INIT =====
  async function init() {
    try {
      const res = await fetch('content/structure.json');
      structure = await res.json();
      renderWelcomeStats();
      renderSidebar();
      setupEvents();
      loadTheme();
    } catch (e) {
      console.error('Error loading structure:', e);
      mainContent.innerHTML = '<div class="loading-spinner">Error al cargar la estructura del curso</div>';
    }
  }

  // ===== WELCOME STATS =====
  function renderWelcomeStats() {
    const statsContainer = $('#welcomeStats');
    if (!statsContainer || !structure) return;

    const totalChapters = structure.chapters.length;
    let totalTheory = 0, totalExercises = 0, totalLabs = 0;
    for (const ch of structure.chapters) {
      for (const s of ch.sections) {
        if (s.type === 'theory') totalTheory++;
        else if (s.type === 'guided_exercise') totalExercises++;
        else if (s.type === 'lab') totalLabs++;
      }
    }

    statsContainer.innerHTML = `
      <div class="stat-card">
        <div class="stat-number">${totalChapters}</div>
        <div class="stat-label">Capítulos</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${totalTheory}</div>
        <div class="stat-label">Teoría</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${totalExercises}</div>
        <div class="stat-label">Ejercicios</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${totalLabs}</div>
        <div class="stat-label">Labs</div>
      </div>
    `;
  }

  // ===== SIDEBAR =====
  function renderSidebar() {
    chapterList.innerHTML = structure.chapters.map(ch => {
      const readCount = ch.sections.filter(s => readSections[s.file]).length;
      const progress = Math.round((readCount / ch.sections.length) * 100);

      return `
        <div class="chapter-item" data-chapter="${ch.number}">
          <div class="chapter-header ${activeChapter === ch.number ? 'active' : ''}" onclick="window.app.selectChapter(${ch.number})">
            <div class="chapter-number">${ch.number}</div>
            <div class="chapter-title">${ch.title.replace(/^Capítulo \d+\.\s*/, '')}</div>
            <div class="chapter-toggle ${activeChapter === ch.number ? 'open' : ''}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 5l7 7-7 7"/></svg>
            </div>
          </div>
          <div class="chapter-sections ${activeChapter === ch.number ? 'open' : ''}">
            ${ch.sections.map((s, i) => `
              <div class="section-item ${activeSection === s.file ? 'active' : ''}" 
                   onclick="window.app.selectSection(${ch.number}, ${i})"
                   data-file="${s.file}">
                <span class="section-badge badge-${s.type}">${typeLabels[s.type]}</span>
                <span>${s.title.replace(/^(Ejercicio Guiado|Trabajo de laboratorio|Cuestionario):\s*/, '')}</span>
              </div>
            `).join('')}
            <div class="progress-bar-container" style="padding: 8px 20px 12px 52px;">
              <div class="progress-bar">
                <div class="progress-bar-fill" style="width: ${progress}%"></div>
              </div>
              <div class="progress-text">${readCount}/${ch.sections.length} completado</div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // ===== SELECT CHAPTER =====
  function selectChapter(num) {
    if (activeChapter === num) {
      const item = chapterList.querySelector(`[data-chapter="${num}"]`);
      const sections = item.querySelector('.chapter-sections');
      const toggle = item.querySelector('.chapter-toggle');
      sections.classList.toggle('open');
      toggle.classList.toggle('open');
      return;
    }

    activeChapter = num;
    activeTab = 'all';
    const ch = structure.chapters.find(c => c.number === num);

    if (ch.sections.length > 0) {
      loadChapterView(ch);
    }

    renderSidebar();
    closeMobileSidebar();
  }

  // ===== LOAD CHAPTER VIEW =====
  async function loadChapterView(ch) {
    welcomeScreen.style.display = 'none';
    contentView.style.display = 'block';

    const sectionsByType = {
      all: ch.sections,
      theory: ch.sections.filter(s => s.type === 'theory'),
      guided_exercise: ch.sections.filter(s => s.type === 'guided_exercise'),
      lab: ch.sections.filter(s => s.type === 'lab'),
      quiz: ch.sections.filter(s => s.type === 'quiz'),
      summary: ch.sections.filter(s => s.type === 'summary')
    };

    const readCount = ch.sections.filter(s => readSections[s.file]).length;
    const progress = Math.round((readCount / ch.sections.length) * 100);

    contentView.innerHTML = `
      <div class="content-header">
        <div class="content-breadcrumb">
          RH199 <span>›</span> Capítulo ${ch.number}
        </div>
        <h1>${ch.title}</h1>
        <div class="content-meta">
          <div class="content-meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/></svg>
            ${ch.sections.length} secciones
          </div>
          <div class="content-meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            Páginas ${ch.start_page} - ${ch.end_page}
          </div>
          <div class="content-meta-item">
            ${progress}% completado
          </div>
        </div>
        <div class="progress-bar-container" style="margin-top: 12px;">
          <div class="progress-bar"><div class="progress-bar-fill" style="width:${progress}%"></div></div>
        </div>
      </div>

      <div class="content-tabs">
        ${buildTabButton('all', 'Todo', ch.sections.length)}
        ${sectionsByType.theory.length ? buildTabButton('theory', '📖 Teoría', sectionsByType.theory.length) : ''}
        ${sectionsByType.guided_exercise.length ? buildTabButton('guided_exercise', '🔧 Ejercicios', sectionsByType.guided_exercise.length) : ''}
        ${sectionsByType.lab.length ? buildTabButton('lab', '🧪 Labs', sectionsByType.lab.length) : ''}
        ${sectionsByType.quiz.length ? buildTabButton('quiz', '❓ Quiz', sectionsByType.quiz.length) : ''}
        ${sectionsByType.summary.length ? buildTabButton('summary', '📝 Resumen', sectionsByType.summary.length) : ''}
      </div>

      <div id="sectionsContainer">
        <div class="loading-spinner"><div class="spinner"></div>Cargando contenido...</div>
      </div>
    `;

    const filtered = activeTab === 'all' ? ch.sections : sectionsByType[activeTab] || [];
    await loadSections(filtered);
  }

  function buildTabButton(type, label, count) {
    return `<button class="tab-btn ${activeTab === type ? 'active' : ''}" 
                    onclick="window.app.switchTab('${type}')">
              ${label} <span class="tab-count">${count}</span>
            </button>`;
  }

  // ===== SWITCH TAB =====
  function switchTab(tab) {
    activeTab = tab;
    const ch = structure.chapters.find(c => c.number === activeChapter);
    if (ch) loadChapterView(ch);
  }

  // ===== LOAD SECTIONS =====
  async function loadSections(sections) {
    const container = document.getElementById('sectionsContainer');
    if (!container) return;

    const htmlParts = [];
    for (const section of sections) {
      let text = contentCache[section.file];
      if (!text) {
        try {
          const res = await fetch(`content/${section.file}`);
          text = await res.text();
          contentCache[section.file] = text;
        } catch (e) {
          text = 'Error al cargar el contenido.';
        }
      }
      readSections[section.file] = true;
      htmlParts.push(buildSectionCard(section, text));
    }

    localStorage.setItem('rh199_read', JSON.stringify(readSections));
    container.innerHTML = htmlParts.join('');
    renderSidebar();
  }

  // ===== BUILD SECTION CARD =====
  function buildSectionCard(section, rawText) {
    const formatted = formatContent(rawText);

    return `
      <div class="section-content">
        <div class="section-content-header">
          <div class="section-content-title">
            <div class="section-type-icon ${section.type}">
              ${icons[section.type] || ''}
            </div>
            <span>${section.title}</span>
          </div>
          <span class="section-badge badge-${section.type}">${typeLabels[section.type]}</span>
        </div>
        <div class="section-body">${formatted}</div>
      </div>
    `;
  }

  // ===== FORMAT CONTENT =====
  function formatContent(text) {
    let lines = text.split('\n');
    let startIdx = 0;
    for (let i = 0; i < Math.min(4, lines.length); i++) {
      if (lines[i].startsWith('#')) startIdx = i + 1;
    }
    lines = lines.slice(startIdx);
    text = lines.join('\n').trim();

    // Escape HTML
    text = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    let inCode = false;
    let codeLines = [];
    let result = [];

    const codePatterns = [
      /^\s{2,}\S/,           // indented
      /^\[.+@.+\]\$\s/,     // shell prompt
      /^\$\s/,              // $ prompt
      /^---$/,              // yaml start
      /^- name:/,           // ansible task
      /^\s+\w+:/,           // yaml key
    ];

    lines = text.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const isCodeLine = codePatterns.some(p => p.test(line));
      const isEmpty = line.trim() === '';

      if (isCodeLine && !inCode) {
        inCode = true;
        codeLines = [line];
      } else if (inCode && (isCodeLine || isEmpty)) {
        codeLines.push(line);
      } else if (inCode) {
        result.push('<pre><code>' + codeLines.join('\n') + '</code></pre>');
        codeLines = [];
        inCode = false;
        result.push(processLine(line));
      } else {
        result.push(processLine(line));
      }
    }

    if (inCode && codeLines.length > 0) {
      result.push('<pre><code>' + codeLines.join('\n') + '</code></pre>');
    }

    return result.join('\n');
  }

  function processLine(line) {
    if (!line.trim()) return '';

    // Headers based on content patterns (uppercase lines)
    if (/^[A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑ\s]{5,}$/.test(line.trim())) {
      return `<h2>${line.trim()}</h2>`;
    }

    // Bold markers
    line = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // Inline code
    line = line.replace(/`(.+?)`/g, '<code>$1</code>');

    // Bullet points
    if (/^[\s]*[•●▪►▸◦‣]\s/.test(line)) {
      return `<li>${line.replace(/^[\s]*[•●▪►▸◦‣]\s*/, '')}</li>`;
    }

    // Numbered items
    if (/^\s*\d+\.\s/.test(line)) {
      return `<li>${line.replace(/^\s*\d+\.\s*/, '')}</li>`;
    }

    // Note/Warning/Important blocks (both Spanish and English)
    if (/^(Nota|Importante|Advertencia|Sugerencia|NOTA|IMPORTANTE|Note|Important|Warning|Tip)[:.]/.test(line.trim())) {
      return `<blockquote>${line.trim()}</blockquote>`;
    }

    return `<p>${line}</p>`;
  }

  // ===== SELECT SECTION =====
  function selectSection(chNum, sectionIdx) {
    activeChapter = chNum;
    const ch = structure.chapters.find(c => c.number === chNum);
    if (!ch || !ch.sections[sectionIdx]) return;

    activeTab = ch.sections[sectionIdx].type;
    loadChapterView(ch);
    renderSidebar();
    closeMobileSidebar();
  }

  // ===== SEARCH =====
  let searchTimeout = null;
  function handleSearch(query) {
    clearTimeout(searchTimeout);
    if (!query || query.length < 3) {
      searchOverlay.classList.remove('active');
      searchResults.classList.remove('active');
      return;
    }

    searchTimeout = setTimeout(async () => {
      const results = [];
      const q = query.toLowerCase();

      for (const ch of structure.chapters) {
        for (const section of ch.sections) {
          if (section.title.toLowerCase().includes(q)) {
            results.push({
              chapter: ch.title,
              chapterNum: ch.number,
              section: section,
              sectionIdx: ch.sections.indexOf(section),
              matchType: 'title',
              snippet: section.title
            });
            continue;
          }

          let text = contentCache[section.file];
          if (!text) {
            try {
              const res = await fetch(`content/${section.file}`);
              text = await res.text();
              contentCache[section.file] = text;
            } catch (e) { continue; }
          }

          const lowerText = text.toLowerCase();
          const idx = lowerText.indexOf(q);
          if (idx !== -1) {
            const start = Math.max(0, idx - 40);
            const end = Math.min(text.length, idx + query.length + 60);
            let snippet = text.substring(start, end).replace(/\n/g, ' ');
            if (start > 0) snippet = '...' + snippet;
            if (end < text.length) snippet += '...';

            results.push({
              chapter: ch.title,
              chapterNum: ch.number,
              section: section,
              sectionIdx: ch.sections.indexOf(section),
              matchType: 'content',
              snippet: snippet
            });
          }
        }
        if (results.length >= 20) break;
      }

      renderSearchResults(results, query);
    }, 300);
  }

  function renderSearchResults(results, query) {
    if (results.length === 0) {
      searchResults.innerHTML = `<div class="search-empty">No se encontraron resultados para "${escapeHtml(query)}"</div>`;
    } else {
      searchResults.innerHTML = results.map(r => {
        const highlighted = highlightMatch(escapeHtml(r.snippet), query);
        return `
          <div class="search-result-item" onclick="window.app.goToResult(${r.chapterNum}, ${r.sectionIdx})">
            <div class="search-result-chapter">${escapeHtml(r.chapter)}</div>
            <div class="search-result-title">
              <span class="section-badge badge-${r.section.type}" style="margin-right:6px">${typeLabels[r.section.type]}</span>
              ${escapeHtml(r.section.title)}
            </div>
            <div class="search-result-snippet">${highlighted}</div>
          </div>
        `;
      }).join('');
    }

    searchOverlay.classList.add('active');
    searchResults.classList.add('active');
  }

  function highlightMatch(text, query) {
    const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  function goToResult(chNum, sIdx) {
    searchOverlay.classList.remove('active');
    searchResults.classList.remove('active');
    searchInput.value = '';
    selectSection(chNum, sIdx);
  }

  // ===== THEME =====
  function toggleTheme() {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('rh199_theme', next);
    updateThemeIcon(next);
  }

  function loadTheme() {
    const saved = localStorage.getItem('rh199_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
    updateThemeIcon(saved);
  }

  function updateThemeIcon(theme) {
    const icon = $('#themeIcon');
    if (theme === 'dark') {
      icon.innerHTML = '<path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z"/>';
    } else {
      icon.innerHTML = '<circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>';
    }
  }

  // ===== MOBILE =====
  function closeMobileSidebar() {
    if (window.innerWidth <= 900) {
      sidebar.classList.remove('mobile-open');
    }
  }

  // ===== EVENTS =====
  function setupEvents() {
    searchInput.addEventListener('input', (e) => handleSearch(e.target.value));
    searchOverlay.addEventListener('click', () => {
      searchOverlay.classList.remove('active');
      searchResults.classList.remove('active');
    });

    themeToggle.addEventListener('click', toggleTheme);

    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('mobile-open');
    });

    // Ctrl+K shortcut
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInput.focus();
      }
      if (e.key === 'Escape') {
        searchOverlay.classList.remove('active');
        searchResults.classList.remove('active');
        searchInput.blur();
      }
    });

    // Back to top
    mainContent.addEventListener('scroll', () => {
      if (mainContent.scrollTop > 300) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    });

    backToTop.addEventListener('click', () => {
      mainContent.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ===== HELPERS =====
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // ===== PUBLIC API =====
  window.app = {
    selectChapter,
    selectSection,
    switchTab,
    goToResult
  };

  // ===== START =====
  document.addEventListener('DOMContentLoaded', init);
})();
