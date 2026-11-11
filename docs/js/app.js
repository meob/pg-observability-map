/**
 * PostgreSQL Observability Map - Application Script
 */

let PG_SUPPORTED_VERSIONS = [];
let DEFAULT_PG_VERSION = null;
let MIN_PG_VERSION = null;
let MAX_PG_VERSION = null;
let FUNCS_DATA = [];
let sectionDescriptions = {};

let currentTargetVersion = DEFAULT_PG_VERSION;
let displayMode = 'hide'; // 'dim' | 'hide'
let searchQuery = '';
let selectedItem = null;
let listsMaxHeight = null;
let currentTheme = 'dark'; // 'dark' | 'light'
let itemLinksEnabled = true;

const THEME_STORAGE_KEY = 'pgobs-theme';
const LINKS_STORAGE_KEY = 'pgobs-item-links';

// DOM elements
const versionSelectEl = document.getElementById('versionSelect');
const activeVerHeaderBadgeEl = document.getElementById('activeVerHeaderBadge');
const modeDimBtn = document.getElementById('modeDimBtn');
const modeHideBtn = document.getElementById('modeHideBtn');
const leftListEl = document.getElementById('leftList');
const rightListEl = document.getElementById('rightList');
const leftCountEl = document.getElementById('leftCount');
const rightCountEl = document.getElementById('rightCount');
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearch');
const resetBtn = document.getElementById('resetBtn');
const infoTitleEl = document.getElementById('infoTitle');
const infoDescEl = document.getElementById('infoDesc');
const copyLinkBtn = document.getElementById('copyLinkBtn');
const themeToggleBtn = document.getElementById('themeToggleBtn');
const themeToggleLabel = document.getElementById('themeToggleLabel');
const itemLinksBtn = document.getElementById('itemLinksBtn');
const itemLinksIcon = document.getElementById('itemLinksIcon');
const itemLinksLabel = document.getElementById('itemLinksLabel');

function isSupportedInVersion(item, ver) {
    if (item.sinceVersion > ver) return false;
    if (item.removedVersion && item.removedVersion <= ver) return false;
    return true;
}

function resolveDocsUrl(url) {
    if (!url) return url;
    return url.replace(/\/docs\/current\//, `/docs/${currentTargetVersion}/`);
}

function renderExtraLink(link) {
    if (!link || !link.url) return '';
    const label = link.label || 'Read more';
    return ` <a href="${link.url}" target="_blank" rel="noopener noreferrer" title="${label}" class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-100 text-cyan-700 border border-cyan-300 hover:underline dark:bg-cyan-500/15 dark:text-cyan-300 dark:border-cyan-500/30">Further reading <i class="fa-solid fa-external-link text-[8px] ml-1"></i></a>`;
}

function resolveInitialTheme() {
    try {
        const requested = new URLSearchParams(window.location.search).get('theme');
        if (requested === 'light' || requested === 'dark') return requested;
    } catch (e) {}
    try {
        const stored = localStorage.getItem(THEME_STORAGE_KEY);
        if (stored === 'light' || stored === 'dark') return stored;
    } catch (e) {}
    return 'dark';
}

function updateThemeButton() {
    if (!themeToggleBtn) return;
    const isDark = currentTheme === 'dark';
    const title = isDark ? 'Switch to light mode' : 'Switch to dark mode';
    themeToggleBtn.title = title;
    themeToggleBtn.setAttribute('aria-label', title);
    themeToggleBtn.setAttribute('aria-pressed', String(isDark));
    const icon = themeToggleBtn.querySelector('i');
    if (icon) icon.className = `fa-solid ${isDark ? 'fa-sun' : 'fa-moon'}`;
    if (themeToggleLabel) themeToggleLabel.textContent = isDark ? 'Light' : 'Dark';
}

function applyTheme(theme, persist = true) {
    currentTheme = theme === 'light' ? 'light' : 'dark';
    document.documentElement.classList.toggle('dark', currentTheme === 'dark');
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', currentTheme === 'dark' ? '#090d16' : '#f1f5f9');
    updateThemeButton();
    if (persist) {
        try { localStorage.setItem(THEME_STORAGE_KEY, currentTheme); } catch (e) {}
    }
}

function resolveItemLinks() {
    try {
        const requested = new URLSearchParams(window.location.search).get('links');
        if (requested === 'on') return true;
        if (requested === 'off') return false;
    } catch (e) {}
    try {
        const stored = localStorage.getItem(LINKS_STORAGE_KEY);
        if (stored === 'on') return true;
        if (stored === 'off') return false;
    } catch (e) {}
    return true;
}

function updateItemLinksButton() {
    if (!itemLinksBtn) return;
    const on = itemLinksEnabled;
    const title = on
        ? 'Disable item links (items select instead of open docs)'
        : 'Enable item links (item names open official docs)';
    itemLinksBtn.title = title;
    itemLinksBtn.setAttribute('aria-label', title);
    itemLinksBtn.setAttribute('aria-pressed', String(on));
    if (itemLinksIcon) itemLinksIcon.className = `fa-solid ${on ? 'fa-link' : 'fa-link-slash'}`;
    if (itemLinksLabel) itemLinksLabel.textContent = on ? 'Links' : 'No links';
}

function parseDeepLink() {
    try {
        const params = new URLSearchParams(window.location.search);
        const ver = parseInt(params.get('ver'), 10);
        if (PG_SUPPORTED_VERSIONS.includes(ver)) {
            currentTargetVersion = ver;
        }
        const mode = params.get('mode');
        if (mode === 'dim' || mode === 'hide') {
            displayMode = mode;
        }
        const sel = params.get('sel');
        const lists = params.get('lists');
        if (lists) {
            const listsLower = lists.trim().toLowerCase();
            if (listsLower === 'full') {
                listsMaxHeight = 'full';
            } else if (/^[0-9]+$/.test(lists.trim())) {
                listsMaxHeight = lists.trim() + 'px';
            } else if (/^[0-9]+(px|vh|vw|em|rem|%)$/.test(lists.trim())) {
                listsMaxHeight = lists.trim();
            }
        }
        if (sel) {
            // Will be applied after data load
            return sel;
        }
    } catch (e) {}
    return null;
}

function updateDeepLink() {
    try {
        const url = new URL(window.location.href);
        url.searchParams.set('ver', currentTargetVersion);
        url.searchParams.set('mode', displayMode);
        url.searchParams.set('theme', currentTheme);
        url.searchParams.set('links', itemLinksEnabled ? 'on' : 'off');
        if (listsMaxHeight && listsMaxHeight !== 'full') {
            // keep numeric/units as stored (strip px if just number stored differently)
            if (listsMaxHeight.endsWith('px') && /^[0-9]+px$/.test(listsMaxHeight)) {
                url.searchParams.set('lists', listsMaxHeight.replace('px', ''));
            } else {
                url.searchParams.set('lists', listsMaxHeight);
            }
        } else if (listsMaxHeight === 'full') {
            url.searchParams.set('lists', 'full');
        } else {
            url.searchParams.delete('lists');
        }
        if (typeof selectedItem === 'object' && selectedItem && selectedItem.name) {
            url.searchParams.set('sel', selectedItem.name);
        } else if (typeof selectedItem === 'string') {
            url.searchParams.set('sel', selectedItem);
        } else {
            url.searchParams.delete('sel');
        }
        history.replaceState({}, '', url);
    } catch (e) {}
}

async function loadData() {
    const res = await fetch('data/pg_observability.json');
    const data = await res.json();
    PG_SUPPORTED_VERSIONS = Array.isArray(data.supportedVersions)
        ? data.supportedVersions.map(Number).filter(Number.isFinite).sort((a, b) => a - b)
        : [];
    MIN_PG_VERSION = PG_SUPPORTED_VERSIONS.length ? PG_SUPPORTED_VERSIONS[0] : null;
    MAX_PG_VERSION = PG_SUPPORTED_VERSIONS.length ? PG_SUPPORTED_VERSIONS[PG_SUPPORTED_VERSIONS.length - 1] : null;
    const requestedDefault = Number(data.defaultVersion);
    DEFAULT_PG_VERSION = PG_SUPPORTED_VERSIONS.includes(requestedDefault)
        ? requestedDefault
        : MAX_PG_VERSION;
    currentTargetVersion = DEFAULT_PG_VERSION;
    sectionDescriptions = data.sections || {};
    FUNCS_DATA = (data.items || []).map((it, idx) => ({ ...it, _idx: idx }));
    return data;
}

function initVersionSelector() {
    versionSelectEl.innerHTML = '';
    PG_SUPPORTED_VERSIONS.forEach(ver => {
        const opt = document.createElement('option');
        opt.value = ver;
        opt.textContent = `PG ${ver}`;
        if (ver === currentTargetVersion) opt.selected = true;
        versionSelectEl.appendChild(opt);
    });
    if (versionSelectEl.value != currentTargetVersion) {
        versionSelectEl.value = currentTargetVersion;
    }
}

function applyListsHeight() {
    try {
        if (!leftListEl || !rightListEl) return;
        const maxHeight = listsMaxHeight && listsMaxHeight !== 'full' ? listsMaxHeight : '';
        [leftListEl, rightListEl].forEach(el => {
            el.style.maxHeight = maxHeight;
            el.classList.remove('flex-none');
            el.classList.add('flex-1');
        });
    } catch (e) {}
}

function renderLists() {
    leftListEl.innerHTML = '';
    rightListEl.innerHTML = '';

    let leftCount = 0;
    let rightCount = 0;

    FUNCS_DATA.forEach((item) => {
        const supported = isSupportedInVersion(item, currentTargetVersion);

        if (displayMode === 'hide' && !supported) {
            return;
        }

        const q = searchQuery.toLowerCase();
        const matchesSearch = !q ||
            item.name.toLowerCase().includes(q) ||
            (item.desc && item.desc.toLowerCase().includes(q)) ||
            (item.sections && item.sections.some(s => s.toLowerCase().includes(q)));

        if (!matchesSearch) return;

        const itemEl = document.createElement('div');
        
        let baseClasses = `stat-item p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950/60 dark:hover:bg-slate-800/80 cursor-pointer flex items-center justify-between font-mono text-[11px] text-slate-700 dark:text-slate-300`;
        
        if (!supported) {
            baseClasses += ` disabled-version`;
        }

        itemEl.className = baseClasses;
        itemEl.dataset.index = item._idx;

    let versionBadgeHtml = '';
    const sinceNum = parseFloat(item.sinceVersion);
    if (!isNaN(sinceNum) && MIN_PG_VERSION !== null && sinceNum >= MIN_PG_VERSION) {
        const major = Math.floor(sinceNum);
        versionBadgeHtml = `<span class="text-[9px] px-1 py-0.2 rounded font-sans font-semibold ml-1 badge-ver-mod-${major % 6}">NEW in ${item.sinceVersion}</span>`;
    }
    if (item.removedVersion) {
        versionBadgeHtml += ` <span class="text-[9px] px-1 py-0.2 rounded font-sans font-semibold ml-1 bg-rose-100 text-rose-700 border border-rose-300 dark:bg-rose-500/20 dark:text-rose-400 dark:border-rose-500/40">REMOVED in ${item.removedVersion}</span>`;
    }

        const kind = item.kind || 'view';
        const nameColor = supported
            ? (kind === 'function' ? 'text-emerald-700 dark:text-emerald-300' : 'text-sky-700 dark:text-sky-300')
            : 'text-slate-400 dark:text-slate-500';
        const unavailableClasses = 'line-through text-slate-400 dark:text-slate-500';
        const itemDocsUrl = resolveDocsUrl(item.docsUrl);
        let nameHtml;
        if (itemDocsUrl && itemLinksEnabled) {
            nameHtml = `<a href="${itemDocsUrl}" target="_blank" rel="noopener noreferrer" class="${supported ? nameColor + ' hover:underline' : unavailableClasses}" onclick="event.stopPropagation()" title="${supported ? 'Open docs' : 'Not available in selected version'}">${item.name}</a>`;
        } else {
            nameHtml = `<span class="${supported ? nameColor : unavailableClasses}" title="${supported ? '' : 'Not available in selected version'}">${item.name}</span>`;
        }

        itemEl.innerHTML = `
            <div class="truncate mr-1 flex items-center gap-1">
                ${nameHtml}
                ${versionBadgeHtml}
            </div>
            <i class="fa-solid ${supported ? 'fa-chevron-right text-slate-400 dark:text-slate-600' : 'fa-lock text-slate-400 dark:text-slate-600'} text-[9px]" title="${supported ? '' : 'Requires PG ' + item.sinceVersion + (item.removedVersion ? ', removed in PG ' + item.removedVersion : '')}"></i>
        `;

        itemEl.addEventListener('mouseenter', () => highlightItem(item));
        itemEl.addEventListener('mouseleave', () => clearHighlightIfNoSelection());
        itemEl.addEventListener('click', () => toggleSelectItem(item));

        if (item.side === 'left') {
            leftListEl.appendChild(itemEl);
            leftCount++;
        } else {
            rightListEl.appendChild(itemEl);
            rightCount++;
        }
    });

    if (searchQuery && leftCount === 0 && rightCount === 0) {
        const emptyEl = document.createElement('div');
        emptyEl.className = 'text-center text-slate-500 text-[11px] py-4';
        emptyEl.textContent = 'No items match current search/filter';
        leftListEl.appendChild(emptyEl);
    }

    leftCountEl.textContent = `${leftCount} items`;
    rightCountEl.textContent = `${rightCount} items`;

    activeVerHeaderBadgeEl.textContent = `v${MIN_PG_VERSION} - v${currentTargetVersion}`;
    applyListsHeight();
}

function highlightItem(item) {
    if (!item) return;

    const supported = isSupportedInVersion(item, currentTargetVersion);

    document.querySelectorAll('.arch-card').forEach(card => {
        const section = card.dataset.section;
        if (item.sections && item.sections.includes(section)) {
            card.classList.add('highlighted');
            card.classList.remove('dimmed');
        } else {
            card.classList.add('dimmed');
            card.classList.remove('highlighted');
        }
    });

    document.querySelectorAll('.stat-item').forEach(el => {
        const idx = parseInt(el.dataset.index, 10);
        const currentData = FUNCS_DATA.find(f => f._idx === idx);
        if (!currentData) return;

        if (currentData.name === item.name) {
            el.classList.add('highlighted');
            el.classList.remove('dimmed');
        } else {
            el.classList.add('dimmed');
            el.classList.remove('highlighted');
        }
    });

    const docsUrlForBadge = resolveDocsUrl(item.docsUrl);

    const titleExtra = docsUrlForBadge 
        ? `<a href="${docsUrlForBadge}" target="_blank" rel="noopener noreferrer" class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-sky-700 hover:underline dark:bg-slate-800 dark:text-sky-400">Introduced in PG ${item.sinceVersion} <i class="fa-solid fa-external-link text-[8px] ml-1"></i></a>`
        : `<span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-sky-700 dark:bg-slate-800 dark:text-sky-400">Introduced in PG ${item.sinceVersion}</span>`;

    const pgpediaBadgeHtml = item.pgpediaUrl
        ? ` <a href="${item.pgpediaUrl}" target="_blank" rel="noopener noreferrer" title="Open pgPedia entry" class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-violet-100 text-violet-700 border border-violet-300 hover:underline dark:bg-violet-500/15 dark:text-violet-300 dark:border-violet-500/30">pgPedia <i class="fa-solid fa-book-open text-[8px] ml-1"></i></a>`
        : '';

    let extensionBadgeHtml = '';
    if (item.extension) {
        const extUrl = `https://www.postgresql.org/docs/${currentTargetVersion}/${item.extension}.html`;
        extensionBadgeHtml = ` <a href="${extUrl}" target="_blank" rel="noopener noreferrer" class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-300 hover:underline dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/40">Requires extension ${item.extension} <i class="fa-solid fa-external-link text-[8px] ml-1"></i></a>`;
    }
    
    const extraLinkHtml = renderExtraLink(item.extraLink);
    infoTitleEl.innerHTML = `${item.name} ${titleExtra}${pgpediaBadgeHtml}${extraLinkHtml}${extensionBadgeHtml}${item.removedVersion ? ` <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 border border-rose-300 dark:bg-rose-500/20 dark:text-rose-400 dark:border-rose-500/40">REMOVED in ${item.removedVersion}</span>` : ''}`;

    let statusText = supported ?
        `<span class="text-emerald-600 font-medium dark:text-emerald-400"><i class="fa-solid fa-circle-check"></i> Available in PG ${currentTargetVersion}</span>` :
        `<span class="text-amber-600 font-medium dark:text-amber-400"><i class="fa-solid fa-triangle-exclamation"></i> Not available in PG ${currentTargetVersion} (Requires PG ${item.sinceVersion}+${item.removedVersion ? `, removed in PG ${item.removedVersion}` : ''})</span>`;

    const sectionsText = (item.sections || []).map(s => sectionDescriptions[s]?.title || s).join(', ');
    infoDescEl.innerHTML = `${item.desc || ''}<br/>${statusText} &bull; <span class="text-sky-700 font-medium dark:text-sky-400">Sections: ${sectionsText}</span>`;
}

function highlightSection(sectionKey) {
    const connectedItems = FUNCS_DATA.filter(item => 
        item.sections && item.sections.includes(sectionKey) && (displayMode === 'dim' || isSupportedInVersion(item, currentTargetVersion))
    );

    document.querySelectorAll('.arch-card').forEach(card => {
        if (card.dataset.section === sectionKey) {
            card.classList.add('highlighted');
            card.classList.remove('dimmed');
        } else {
            card.classList.add('dimmed');
            card.classList.remove('highlighted');
        }
    });

    document.querySelectorAll('.stat-item').forEach(el => {
        const idx = parseInt(el.dataset.index, 10);
        const item = FUNCS_DATA.find(f => f._idx === idx);
        if (!item) return;

        if (item.sections && item.sections.includes(sectionKey)) {
            el.classList.add('highlighted');
            el.classList.remove('dimmed');
        } else {
            el.classList.add('dimmed');
            el.classList.remove('highlighted');
        }
    });

    const secInfo = sectionDescriptions[sectionKey];
    if (secInfo) {
        const availNames = connectedItems.filter(i => isSupportedInVersion(i, currentTargetVersion)).map(i => i.name);
        let docsUrlForBadge = secInfo.docsUrl;
        try {
            if (docsUrlForBadge) {
                docsUrlForBadge = docsUrlForBadge.replace(/\/docs\/current\//, `/docs/${currentTargetVersion}/`);
            }
        } catch (e) {}
        const titleExtra = docsUrlForBadge 
            ? `<a href="${docsUrlForBadge}" target="_blank" rel="noopener noreferrer" class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-sky-700 hover:underline dark:bg-slate-800 dark:text-sky-400">View docs <i class="fa-solid fa-external-link text-[8px] ml-1"></i></a>`
            : '';
        const extraLinkHtml = renderExtraLink(secInfo.extraLink);
        infoTitleEl.innerHTML = `${secInfo.title} ${titleExtra}${extraLinkHtml}`;
        infoDescEl.innerHTML = `${secInfo.desc || ''}<br/><span class="text-sky-700 font-medium dark:text-sky-400">Related Metrics (${availNames.length}): ${availNames.join(', ')}</span>`;
    }
}

function resetAllHighlights() {
    selectedItem = null;
    document.querySelectorAll('.arch-card').forEach(card => {
        card.classList.remove('highlighted', 'dimmed');
    });
    document.querySelectorAll('.stat-item').forEach(el => {
        el.classList.remove('highlighted', 'dimmed');
    });
    infoTitleEl.textContent = "Select a view, function, or architectural component";
    infoDescEl.textContent = "Hover or click any element to inspect bidirectionally linked PostgreSQL statistics, process roles, and version support.";
    updateDeepLink();
}

function clearHighlightIfNoSelection() {
    if (selectedItem) {
        if (typeof selectedItem === 'string') {
            highlightSection(selectedItem);
        } else {
            highlightItem(selectedItem);
        }
    } else {
        resetAllHighlights();
    }
}

function toggleSelectItem(itemOrSection) {
    if (selectedItem === itemOrSection) {
        selectedItem = null;
        resetAllHighlights();
        updateDeepLink();
        return;
    } else {
        selectedItem = itemOrSection;
        if (typeof itemOrSection === 'string') {
            highlightSection(itemOrSection);
        } else {
            highlightItem(itemOrSection);
        }
        updateDeepLink();
    }
}

function updateModeButtons() {
    [[modeDimBtn, 'dim'], [modeHideBtn, 'hide']].forEach(([btn, mode]) => {
        if (!btn) return;
        const isActive = displayMode === mode;
        btn.classList.toggle('bg-sky-100', isActive);
        btn.classList.toggle('text-sky-700', isActive);
        btn.classList.toggle('dark:bg-slate-700', isActive);
        btn.classList.toggle('dark:text-sky-300', isActive);
        btn.classList.toggle('text-slate-500', !isActive);
        btn.classList.toggle('dark:text-slate-400', !isActive);
        btn.setAttribute('aria-pressed', String(isActive));
    });
}

document.querySelectorAll('.arch-card').forEach(card => {
    const section = card.dataset.section;
    card.addEventListener('mouseenter', () => highlightSection(section));
    card.addEventListener('mouseleave', () => clearHighlightIfNoSelection());
    card.addEventListener('click', () => toggleSelectItem(section));
});

versionSelectEl.addEventListener('change', (e) => {
    currentTargetVersion = parseInt(e.target.value, 10);
    renderLists();
    applyListsHeight();
    if (selectedItem) clearHighlightIfNoSelection();
    updateDeepLink();
});

modeDimBtn.addEventListener('click', () => {
    displayMode = 'dim';
    updateModeButtons();
    renderLists();
    updateDeepLink();
});

modeHideBtn.addEventListener('click', () => {
    displayMode = 'hide';
    updateModeButtons();
    renderLists();
    updateDeepLink();
});

if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
        updateDeepLink();
    });
}

if (itemLinksBtn) {
    itemLinksBtn.addEventListener('click', () => {
        itemLinksEnabled = !itemLinksEnabled;
        try { localStorage.setItem(LINKS_STORAGE_KEY, itemLinksEnabled ? 'on' : 'off'); } catch (e) {}
        updateItemLinksButton();
        renderLists();
        applyListsHeight();
        if (selectedItem) clearHighlightIfNoSelection();
        updateDeepLink();
    });
}

searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    if (searchQuery.length > 0) {
        clearSearchBtn.classList.remove('hidden');
    } else {
        clearSearchBtn.classList.add('hidden');
    }
    renderLists();
    applyListsHeight();
});

clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    clearSearchBtn.classList.add('hidden');
    renderLists();
    applyListsHeight();
});

resetBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    clearSearchBtn.classList.add('hidden');
    currentTargetVersion = DEFAULT_PG_VERSION;
    if (versionSelectEl) versionSelectEl.value = DEFAULT_PG_VERSION;
    resetAllHighlights();
    renderLists();
    updateDeepLink();
});



if (copyLinkBtn) {
    copyLinkBtn.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            const origText = copyLinkBtn.innerHTML;
            copyLinkBtn.innerHTML = `<i class="fa-solid fa-check"></i> Copied`;
            setTimeout(() => {
                copyLinkBtn.innerHTML = origText;
            }, 1500);
        } catch (e) {
            const textarea = document.createElement('textarea');
            textarea.value = window.location.href;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
        }
    });
}

window.addEventListener('DOMContentLoaded', async () => {
    applyTheme(resolveInitialTheme(), false);
    itemLinksEnabled = resolveItemLinks();
    updateItemLinksButton();
    await loadData();
    const selFromLink = parseDeepLink();
    updateModeButtons();
    initVersionSelector();
    renderLists();
    applyListsHeight();
    if (selFromLink) {
        const item = FUNCS_DATA.find(f => f.name === selFromLink);
        if (item) {
            toggleSelectItem(item);
        } else if (sectionDescriptions[selFromLink]) {
            toggleSelectItem(selFromLink);
        }
    }
    updateDeepLink();
});
