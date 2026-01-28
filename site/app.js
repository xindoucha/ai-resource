(function () {
  const FLAGS = { china: '🇨🇳', usa: '🇺🇸', europe: '🇪🇺' };

  function renderCompanies(root, data, regionFilter) {
    if (!data || !data.companies) return;
    const regions = regionFilter === 'all'
      ? data.companies
      : data.companies.filter(function (r) { return r.id === regionFilter; });
    const frag = document.createDocumentFragment();
    regions.forEach(function (region) {
      const regionEl = document.createElement('div');
      regionEl.className = 'region-block';
      regionEl.innerHTML =
        '<h3 class="region-title"><span class="flag">' +
        (FLAGS[region.id] || '') +
        '</span>' +
        escapeHtml(region.name) +
        '</h3>';
      const grid = document.createElement('div');
      grid.className = 'companies-grid';
      region.items.forEach(function (item) {
        const a = document.createElement('a');
        a.className = 'company-card';
        if (item.detailId) {
          a.href = '#/' + item.detailId;
          a.setAttribute('data-detail-id', item.detailId);
          a.setAttribute('data-github-href', item.href);
        } else {
          a.href = item.href;
          a.target = '_blank';
          a.rel = 'noopener';
        }
        const logoHtml = item.logo
          ? '<img class="company-logo" src="' + escapeAttr(item.logo) + '" alt="" loading="lazy" />'
          : '<div class="company-logo placeholder">—</div>';
        a.innerHTML =
          logoHtml +
          '<div class="company-body">' +
          '<p class="company-name">' +
          escapeHtml(item.name) +
          '</p>' +
          '<p class="company-meta">' +
          escapeHtml(item.location) +
          '</p>' +
          (item.products ? '<p class="company-products">' + escapeHtml(item.products) + '</p>' : '') +
          '</div>' +
          '<span class="company-arrow" aria-hidden="true">→</span>';
        grid.appendChild(a);
      });
      regionEl.appendChild(grid);
      frag.appendChild(regionEl);
    });
    root.appendChild(frag);
  }

  function renderPeople(root, data, regionFilter) {
    if (!data || !data.people) return;
    const regions = regionFilter === 'all'
      ? data.people
      : data.people.filter(function (r) { return r.id === regionFilter; });
    const frag = document.createDocumentFragment();
    regions.forEach(function (region) {
      const regionEl = document.createElement('div');
      regionEl.className = 'region-block';
      regionEl.innerHTML =
        '<h3 class="region-title"><span class="flag">' +
        (FLAGS[region.id] || '') +
        '</span>' +
        escapeHtml(region.name) +
        '</h3>';
      region.categories.forEach(function (cat) {
        const catEl = document.createElement('div');
        catEl.className = 'category-block';
        catEl.innerHTML = '<h4 class="category-title">' + escapeHtml(cat.name) + '</h4>';
        const grid = document.createElement('div');
        grid.className = 'people-grid';
        cat.people.forEach(function (p) {
          const a = document.createElement('a');
          a.className = 'person-card';
          if (p.detailId) {
            a.href = '#/' + p.detailId;
            a.setAttribute('data-detail-id', p.detailId);
            a.setAttribute('data-github-href', p.href);
          } else {
            a.href = p.href;
            a.target = '_blank';
            a.rel = 'noopener';
          }
          a.innerHTML =
            '<p class="person-name' + (p.deceased ? ' deceased' : '') + '">' +
            escapeHtml(p.name) +
            '</p>' +
            '<p class="person-org">' +
            escapeHtml(p.org) +
            '</p>' +
            (p.work ? '<p class="person-work">' + escapeHtml(p.work) + '</p>' : '');
          grid.appendChild(a);
        });
        catEl.appendChild(grid);
        regionEl.appendChild(catEl);
      });
      frag.appendChild(regionEl);
    });
    root.appendChild(frag);
  }

  function escapeHtml(s) {
    const div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  function escapeAttr(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  var currentType = 'companies';
  var currentRegion = 'all';
  var appData = null;
  var detailsData = null;

  function getDetailIdToHref() {
    var map = {};
    if (!appData) return map;
    (appData.companies || []).forEach(function (r) {
      (r.items || []).forEach(function (i) {
        if (i.detailId) map[i.detailId] = i.href;
      });
    });
    (appData.people || []).forEach(function (r) {
      (r.categories || []).forEach(function (c) {
        (c.people || []).forEach(function (p) {
          if (p.detailId) map[p.detailId] = p.href;
        });
      });
    });
    return map;
  }

  function showDetail(detailId) {
    if (!detailsData || !detailsData[detailId]) return;
    var listView = document.getElementById('list-view');
    var detailView = document.getElementById('detail-view');
    var titleEl = document.getElementById('detail-title');
    var bodyEl = document.getElementById('detail-body');
    var githubLink = document.getElementById('detail-github');
    if (!listView || !detailView || !titleEl || !bodyEl) return;
    var entry = detailsData[detailId];
    titleEl.textContent = entry.title;
    bodyEl.innerHTML = entry.body;
    var hrefMap = getDetailIdToHref();
    if (hrefMap[detailId] && githubLink) {
      githubLink.href = hrefMap[detailId];
      githubLink.style.display = '';
    } else if (githubLink) {
      githubLink.style.display = 'none';
    }
    listView.classList.add('hidden');
    detailView.classList.remove('hidden');
    if (location.hash !== '#/' + detailId) location.hash = '#/' + detailId;
  }

  function hideDetail() {
    if (location.hash !== '#') location.hash = '#';
  }

  function applyRoute() {
    var hash = (location.hash || '#').replace(/^#\/?/, '').trim();
    if (hash && detailsData && detailsData[hash]) {
      showDetail(hash);
    } else {
      var listView = document.getElementById('list-view');
      var detailView = document.getElementById('detail-view');
      if (listView) listView.classList.remove('hidden');
      if (detailView) detailView.classList.add('hidden');
    }
  }

  function switchTypeTab(tabName) {
    currentType = tabName;
    var typeButtons = document.querySelectorAll('.tabs-type .tab-button');
    var contents = document.querySelectorAll('.tab-content');
    typeButtons.forEach(function (btn) {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    contents.forEach(function (content) {
      content.classList.toggle('active', content.id === tabName);
    });
    refreshContent();
  }

  function switchRegionTab(regionId) {
    currentRegion = regionId;
    document.querySelectorAll('.tabs-region .tab-button').forEach(function (btn) {
      btn.classList.toggle('active', btn.dataset.region === regionId);
    });
    refreshContent();
  }

  function refreshContent() {
    if (!appData) return;
    var companiesRoot = document.getElementById('companies-root');
    var peopleRoot = document.getElementById('people-root');
    companiesRoot.innerHTML = '';
    peopleRoot.innerHTML = '';
    renderCompanies(companiesRoot, appData, currentRegion);
    renderPeople(peopleRoot, appData, currentRegion);
  }

  function run() {
    const companiesRoot = document.getElementById('companies-root');
    const peopleRoot = document.getElementById('people-root');
    const repoLink = document.getElementById('repo-link');
    const detailBack = document.getElementById('detail-back');

    document.querySelectorAll('.tabs-type .tab-button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        switchTypeTab(btn.dataset.tab);
      });
    });
    document.querySelectorAll('.tabs-region .tab-button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        switchRegionTab(btn.dataset.region);
      });
    });

    if (detailBack) {
      detailBack.addEventListener('click', function (e) {
        e.preventDefault();
        hideDetail();
      });
    }

    window.addEventListener('hashchange', applyRoute);

    function onListData(data) {
      appData = data;
      renderCompanies(companiesRoot, data, currentRegion);
      renderPeople(peopleRoot, data, currentRegion);
      if (data.repoUrl && repoLink) repoLink.href = data.repoUrl;
      applyRoute();
    }

    Promise.all([
      fetch('data.json').then(function (r) {
        if (!r.ok) throw new Error('data.json not found');
        return r.json();
      }),
      fetch('details.json').then(function (r) {
        if (!r.ok) return {};
        return r.json();
      })
    ]).then(function (arr) {
      var data = arr[0];
      detailsData = arr[1];
      onListData(data);
    }).catch(function () {
      companiesRoot.innerHTML =
        '<p style="color:var(--text-muted)">未能加载 data.json，请先运行构建：<code>python3 scripts/build.py</code></p>';
      if (repoLink) repoLink.href = '#';
      applyRoute();
    });

    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[data-detail-id]');
      if (a && a.getAttribute('data-detail-id')) {
        e.preventDefault();
        showDetail(a.getAttribute('data-detail-id'));
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
