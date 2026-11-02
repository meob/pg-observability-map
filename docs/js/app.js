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

function isSupportedInVersion(item, ver) {
    if (item.sinceVersion > ver) return false;
    if (item.removedVersion && item.removedVersion <= ver) return false;
    return true;
}

function renderExtraLink(link) {
    if (!link || !link.url) return '';
    const label = link.label || 'Read more';
    return ` <a href="${link.url}" target="_blank" rel="noopener noreferrer" title="${label}" class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 hover:underline">Further reading <i class="fa-solid fa-external-link text-[8px] ml-1"></i></a>`;
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
        
        let baseClasses = `stat-item p-2 rounded-lg border border-slate-800 bg-slate-950/60 hover:bg-slate-800/80 cursor-pointer flex items-center justify-between font-mono text-[11px] text-slate-300`;
        
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
        versionBadgeHtml += ` <span class="text-[9px] px-1 py-0.2 rounded font-sans font-semibold ml-1 bg-rose-500/20 text-rose-400 border border-rose-500/40">REMOVED in ${item.removedVersion}</span>`;
    }

        const kind = item.kind || 'view';
        const nameColor = supported ? (kind === 'function' ? 'text-emerald-300' : 'text-sky-300') : 'text-slate-500';
        const nameHtml = item.docsUrl 
            ? `<a href="${item.docsUrl}" target="_blank" rel="noopener noreferrer" class="${supported ? nameColor + ' hover:underline' : 'line-through text-slate-500'}" onclick="event.stopPropagation()" title="${supported ? 'Open docs' : 'Not available in selected version'}">${item.name}</a>`
            : `<span class="${supported ? nameColor + ' hover:underline' : 'line-through text-slate-500'}" title="${supported ? '' : 'Not available in selected version'}">${item.name}</span>`;

        itemEl.innerHTML = `
            <div class="truncate mr-1 flex items-center gap-1">
                ${nameHtml}
                ${versionBadgeHtml}
            </div>
            <i class="fa-solid ${supported ? 'fa-chevron-right text-slate-600' : 'fa-lock text-slate-600'} text-[9px]" title="${supported ? '' : 'Requires PG ' + item.sinceVersion + (item.removedVersion ? ', removed in PG ' + item.removedVersion : '')}"></i>
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

    let docsUrlForBadge = item.docsUrl;
    try {
        if (docsUrlForBadge) {
            docsUrlForBadge = docsUrlForBadge.replace(/\/docs\/current\//, `/docs/${currentTargetVersion}/`);
        }
    } catch (e) {}

    const titleExtra = docsUrlForBadge 
        ? `<a href="${docsUrlForBadge}" target="_blank" rel="noopener noreferrer" class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-sky-400 hover:underline">Introduced in PG ${item.sinceVersion} <i class="fa-solid fa-external-link text-[8px] ml-1"></i></a>`
        : `<span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-sky-400">Introduced in PG ${item.sinceVersion}</span>`;

    const pgpediaBadgeHtml = item.pgpediaUrl
        ? ` <a href="${item.pgpediaUrl}" target="_blank" rel="noopener noreferrer" title="Open pgPedia entry" class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-violet-500/15 text-violet-300 border border-violet-500/30 hover:underline">pgPedia <i class="fa-solid fa-book-open text-[8px] ml-1"></i></a>`
        : '';

    let extensionBadgeHtml = '';
    if (item.extension) {
        const extUrl = `https://www.postgresql.org/docs/${currentTargetVersion}/${item.extension}.html`;
        extensionBadgeHtml = ` <a href="${extUrl}" target="_blank" rel="noopener noreferrer" class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:underline">Requires extension ${item.extension} <i class="fa-solid fa-external-link text-[8px] ml-1"></i></a>`;
    }
    
    const extraLinkHtml = renderExtraLink(item.extraLink);
    infoTitleEl.innerHTML = `${item.name} ${titleExtra}${pgpediaBadgeHtml}${extraLinkHtml}${extensionBadgeHtml}${item.removedVersion ? ` <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/40">REMOVED in ${item.removedVersion}</span>` : ''}`;
    
    let statusText = supported ? 
        `<span class="text-emerald-400 font-medium"><i class="fa-solid fa-circle-check"></i> Available in PG ${currentTargetVersion}</span>` : 
        `<span class="text-amber-400 font-medium"><i class="fa-solid fa-triangle-exclamation"></i> Not available in PG ${currentTargetVersion} (Requires PG ${item.sinceVersion}+${item.removedVersion ? `, removed in PG ${item.removedVersion}` : ''})</span>`;

    const sectionsText = (item.sections || []).map(s => sectionDescriptions[s]?.title || s).join(', ');
    infoDescEl.innerHTML = `${item.desc || ''}<br/>${statusText} &bull; <span class="text-sky-400 font-medium">Sections: ${sectionsText}</span>`;
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
            ? `<a href="${docsUrlForBadge}" target="_blank" rel="noopener noreferrer" class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-sky-400 hover:underline">View docs <i class="fa-solid fa-external-link text-[8px] ml-1"></i></a>`
            : '';
        const extraLinkHtml = renderExtraLink(secInfo.extraLink);
        infoTitleEl.innerHTML = `${secInfo.title} ${titleExtra}${extraLinkHtml}`;
        infoDescEl.innerHTML = `${secInfo.desc || ''}<br/><span class="text-sky-400 font-medium">Related Metrics (${availNames.length}): ${availNames.join(', ')}</span>`;
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
    modeDimBtn.classList.add('bg-slate-700', 'text-sky-300');
    modeDimBtn.classList.remove('text-slate-400');
    modeHideBtn.classList.remove('bg-slate-700', 'text-sky-300');
    modeHideBtn.classList.add('text-slate-400');
    renderLists();
    updateDeepLink();
});

modeHideBtn.addEventListener('click', () => {
    displayMode = 'hide';
    modeHideBtn.classList.add('bg-slate-700', 'text-sky-300');
    modeHideBtn.classList.remove('text-slate-400');
    modeDimBtn.classList.remove('bg-slate-700', 'text-sky-300');
    modeDimBtn.classList.add('text-slate-400');
    renderLists();
    updateDeepLink();
});

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
    await loadData();
    const selFromLink = parseDeepLink();
    // Ensure default mode UI
    if (displayMode === 'hide') {
        modeHideBtn.classList.add('bg-slate-700', 'text-sky-300');
        modeHideBtn.classList.remove('text-slate-400');
        modeDimBtn.classList.remove('bg-slate-700', 'text-sky-300');
        modeDimBtn.classList.add('text-slate-400');
    } else {
        modeDimBtn.classList.add('bg-slate-700', 'text-sky-300');
        modeDimBtn.classList.remove('text-slate-400');
        modeHideBtn.classList.remove('bg-slate-700', 'text-sky-300');
        modeHideBtn.classList.add('text-slate-400');
    }
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
