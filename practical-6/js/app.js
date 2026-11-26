(function () {
  'use strict';

  /* ---------- Дані ---------- */
  var INITIAL_TASKS = [
    { id: 1, title: 'Підготувати звіт до практичної №6', tag: 'Звіт' },
    { id: 2, title: 'Повторити CSS Custom Properties', tag: 'Навчання' },
    { id: 3, title: 'Реалізувати перемикач темної теми', tag: 'Код' },
    { id: 4, title: 'Розгорнути демо на GitHub Pages', tag: 'Звіт' },
    { id: 5, title: 'Перевірити консоль DevTools на помилки', tag: 'Код' }
  ];

  var STATES = ['loading', 'content', 'empty', 'error'];
  var STATUS_TEXT = {
    loading: 'Завантаження завдань',
    content: 'Список завдань відображено',
    empty: 'Список порожній',
    error: 'Помилка завантаження'
  };
  var LOAD_DELAY_MS = 1800;

  var tasks = INITIAL_TASKS.map(function (t) { return { id: t.id, title: t.title, tag: t.tag }; });
  var query = '';
  var timerId = null;

  /* ---------- Елементи ---------- */
  var panels = document.querySelectorAll('[data-state]');
  var switchButtons = document.querySelectorAll('[data-set-state]');
  var stateArea = document.getElementById('state-area');
  var statusEl = document.getElementById('state-status');
  var listEl = document.getElementById('task-list');
  var countEl = document.getElementById('task-count');
  var filterInput = document.getElementById('filter-input');
  var refreshBtn = document.getElementById('refresh-btn');
  var retryBtn = document.getElementById('retry-btn');
  var emptyCta = document.getElementById('empty-cta');
  var emptyTitle = document.getElementById('empty-title');
  var emptyText = document.getElementById('empty-text');

  /* ---------- Перемикання станів ---------- */
  function renderState(stateName) {
    if (STATES.indexOf(stateName) === -1) {
      return;
    }
    panels.forEach(function (panel) {
      panel.classList.toggle('is-hidden', panel.getAttribute('data-state') !== stateName);
    });
    switchButtons.forEach(function (btn) {
      var isActive = btn.getAttribute('data-set-state') === stateName;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-pressed', String(isActive));
    });
    stateArea.setAttribute('aria-busy', String(stateName === 'loading'));
    refreshBtn.disabled = stateName === 'loading';
    statusEl.textContent = STATUS_TEXT[stateName];
  }

  /* ---------- Список ---------- */
  function visibleTasks() {
    var q = query.trim().toLowerCase();
    return tasks.filter(function (t) {
      return t.title.toLowerCase().indexOf(q) !== -1;
    });
  }

  function createTaskItem(task) {
    var li = document.createElement('li');
    li.className = 'card task';

    var body = document.createElement('div');
    body.className = 'task__body';

    var title = document.createElement('h3');
    title.className = 'card__title';
    title.textContent = task.title;

    var tag = document.createElement('span');
    tag.className = 'tag';
    tag.textContent = task.tag;

    body.appendChild(title);
    body.appendChild(tag);

    var del = document.createElement('button');
    del.type = 'button';
    del.className = 'btn btn--danger btn--small';
    del.textContent = 'Видалити';
    del.setAttribute('data-delete-id', String(task.id));
    del.setAttribute('aria-label', 'Видалити завдання: ' + task.title);

    li.appendChild(body);
    li.appendChild(del);
    return li;
  }

  function renderList() {
    var visible = visibleTasks();
    listEl.textContent = '';
    visible.forEach(function (task) {
      listEl.appendChild(createTaskItem(task));
    });
    countEl.textContent = 'Показано ' + visible.length + ' з ' + tasks.length;
  }

  function setEmptyCopy(reason) {
    if (reason === 'filter') {
      emptyTitle.textContent = 'Нічого не знайдено';
      emptyText.textContent = 'За запитом «' + query.trim() + '» завдань немає. Спробуйте інше слово або скиньте пошук.';
      emptyCta.textContent = 'Скинути пошук';
    } else {
      emptyTitle.textContent = 'Тут поки нічого немає';
      emptyText.textContent = 'Усі завдання виконано або видалено. Відновіть початковий список, щоб продовжити.';
      emptyCta.textContent = 'Відновити список';
    }
  }

  /* Визначає, який стан показати: дані чи порожній */
  function showData() {
    renderList();
    if (visibleTasks().length === 0) {
      setEmptyCopy(query.trim() ? 'filter' : 'list');
      renderState('empty');
    } else {
      renderState('content');
    }
  }

  /* Імітація асинхронного запиту */
  function simulateLoad() {
    window.clearTimeout(timerId);
    renderState('loading');
    timerId = window.setTimeout(showData, LOAD_DELAY_MS);
  }

  function restoreList() {
    tasks = INITIAL_TASKS.map(function (t) { return { id: t.id, title: t.title, tag: t.tag }; });
    query = '';
    filterInput.value = '';
    showData();
  }

  /* ---------- Обробники: додаток ---------- */
  switchButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var target = btn.getAttribute('data-set-state');
      window.clearTimeout(timerId);
      if (target === 'content') {
        showData();
      } else if (target === 'empty') {
        setEmptyCopy('list');
        renderState('empty');
      } else {
        renderState(target);
      }
    });
  });

  refreshBtn.addEventListener('click', simulateLoad);
  retryBtn.addEventListener('click', simulateLoad);
  emptyCta.addEventListener('click', restoreList);

  filterInput.addEventListener('input', function () {
    query = filterInput.value;
    window.clearTimeout(timerId);
    showData();
  });

  listEl.addEventListener('click', function (event) {
    var btn = event.target.closest('[data-delete-id]');
    if (!btn) {
      return;
    }
    var id = Number(btn.getAttribute('data-delete-id'));
    tasks = tasks.filter(function (t) { return t.id !== id; });
    showData();
  });

  /* ---------- Розділи: Додаток / UI-Kit ---------- */
  var viewButtons = document.querySelectorAll('[data-view-btn]');
  var views = document.querySelectorAll('[data-view]');

  viewButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var target = btn.getAttribute('data-view-btn');
      views.forEach(function (view) {
        view.classList.toggle('is-hidden', view.getAttribute('data-view') !== target);
      });
      viewButtons.forEach(function (b) {
        var isActive = b === btn;
        b.classList.toggle('is-active', isActive);
        b.setAttribute('aria-pressed', String(isActive));
      });
    });
  });

  /* ---------- Тема ---------- */
  var themeToggle = document.getElementById('theme-toggle');
  var root = document.documentElement;

  function applyTheme(theme) {
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
    }
    themeToggle.setAttribute('aria-pressed', String(theme === 'dark'));
    themeToggle.textContent = theme === 'dark' ? 'Світла тема' : 'Темна тема';
  }

  function loadSavedTheme() {
    try {
      return window.localStorage.getItem('theme');
    } catch (error) {
      return null;
    }
  }

  function saveTheme(theme) {
    try {
      window.localStorage.setItem('theme', theme);
    } catch (error) {
      /* сховище недоступне — тема просто не збережеться */
    }
  }

  var savedTheme = loadSavedTheme();
  var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(savedTheme || (prefersDark ? 'dark' : 'light'));

  themeToggle.addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    saveTheme(next);
  });

  /* ---------- UI-Kit: жива валідація e-mail ---------- */
  var emailField = document.getElementById('kit-email-field');
  var emailInput = document.getElementById('kit-email');
  var emailError = document.getElementById('kit-email-error');

  emailInput.addEventListener('input', function () {
    var isValid = /^\S+@\S+\.\S+$/.test(emailInput.value.trim());
    emailField.classList.toggle('has-error', !isValid);
    emailError.classList.toggle('is-hidden', isValid);
    emailInput.setAttribute('aria-invalid', String(!isValid));
  });

  /* ---------- Старт ---------- */
  showData();
})();
