(function () {
  const root = document.body;
  const month = Number(root.dataset.examMonth || 2);
  const day = Number(root.dataset.examDay || 17);
  const showCentisecondsByDefault = root.dataset.showCs !== 'false';
  const displayMode = root.dataset.displayMode || 'grid';
  const examHour = Number(root.dataset.examHour || 0);
  const examMinute = Number(root.dataset.examMinute || 0);
  const colorIntervalMs = 150;
  const updateIntervalMs = 50;
  const colors = [
    'color1', 'color2', 'color3', 'color4', 'color5',
    'color6', 'color7', 'color8', 'color9', 'color10',
    'color11', 'color12', 'color13', 'color14', 'color15',
    'color16', 'color17', 'color18', 'color19', 'color20'
  ];

  const rgbCheckbox = document.getElementById('switch');
  const msCheckbox = document.getElementById('ms-switch');
  const countdownDiv = document.getElementById('countdown');
  const rgbDiv = document.getElementById('rgb-on');
  const pageTitle = document.getElementById('page-title');
  const yearTargets = document.querySelectorAll('[data-exam-year]');
  const fullTitleTargets = document.querySelectorAll('[data-exam-title]');
  const modeCheckbox = document.getElementById('exam-time-switch');
  const modeTitle = document.querySelector('.switch-title.exam-time');
  const rgbTitle = document.querySelector('.switch-title.rgb');
  const msTitle = document.querySelector('.switch-title.ms');

  const units = ['days', 'hours', 'minutes', 'seconds'];
  const storageKeys = {
    rgb: 'kanagawaCountdown.rgb',
    ms: 'kanagawaCountdown.ms',
    examTime: 'kanagawaCountdown.examTime'
  };
  let showCentiseconds = showCentisecondsByDefault;
  let countdownTimer = null;
  let colorTimer = null;
  let colorIndex = 0;
  let useExamTime = false;

  function getTargetDate(now) {
    const currentYear = now.getFullYear();
    const targetHour = useExamTime ? 9 : examHour;
    const targetMinute = useExamTime ? 20 : examMinute;
    const thisYearExam = new Date(currentYear, month - 1, day, targetHour, targetMinute, 0, 0);
    const examYear = now < thisYearExam ? currentYear : currentYear + 1;
    const target = new Date(examYear, month - 1, day, targetHour, targetMinute, 0, 0);

    return { year: examYear, target };
  }

  function updateTitle(now) {
    const { year, target } = getTargetDate(now);
    const title = `${year}年度 神奈川県公立高校入試まで`;

    document.title = title;
    if (pageTitle && yearTargets.length === 0 && fullTitleTargets.length === 0) {
      pageTitle.textContent = title;
    }

    yearTargets.forEach((node) => {
      node.textContent = `${year}年度`;
    });

    fullTitleTargets.forEach((node) => {
      node.textContent = title;
    });

    return target;
  }

  function getValueElem(container, unit) {
    return container ? container.querySelector(`[data-unit="${unit}"] .value`) : null;
  }

  function renderValues(container, values) {
    units.forEach((unit) => {
      const target = getValueElem(container, unit);
      if (target) {
        target.textContent = values[unit];
      }
    });
  }

  function tick() {
    const now = new Date();
    const target = updateTitle(now);
    const diff = Math.max(0, target.getTime() - now.getTime());

    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    const centiseconds = Math.floor((diff % 1000) / 10);

    const values = {
      days: String(days),
      hours: String(hours),
      minutes: String(minutes),
      seconds: showCentiseconds
        ? `${seconds}.${String(centiseconds).padStart(2, '0')}`
        : String(seconds)
    };

    renderValues(countdownDiv, values);
    renderValues(rgbDiv, values);
  }

  function cycleColors() {
    if (!rgbDiv) {
      return;
    }

    const valueElems = rgbDiv.querySelectorAll('.value');
    valueElems.forEach((elem, offset) => {
      colors.forEach((color) => elem.classList.remove(color));
      elem.classList.add(colors[(colorIndex + offset) % colors.length]);
    });
    colorIndex = (colorIndex + 1) % colors.length;
  }

  function applyRgbState(isOn) {
    if (rgbCheckbox) {
      rgbCheckbox.checked = isOn;
      rgbCheckbox.setAttribute('aria-checked', isOn ? 'true' : 'false');
    }
    if (countdownDiv) {
      countdownDiv.style.display = isOn ? 'none' : displayMode;
    }
    if (rgbDiv) {
      rgbDiv.style.display = isOn ? displayMode : 'none';
      rgbDiv.setAttribute('aria-hidden', isOn ? 'false' : 'true');
    }

    if (rgbTitle) {
      rgbTitle.textContent = isOn ? 'ON' : 'OFF';
    }
  }

  function applyMsState(isOn) {
    showCentiseconds = isOn;
    if (msCheckbox) {
      msCheckbox.checked = isOn;
      msCheckbox.setAttribute('aria-checked', isOn ? 'true' : 'false');
    }

    if (msTitle) {
      msTitle.textContent = isOn ? 'ON' : 'OFF';
    }

    tick();
  }

  function applyExamTimeState(isOn) {
    useExamTime = isOn;
    if (modeCheckbox) {
      modeCheckbox.checked = isOn;
      modeCheckbox.setAttribute('aria-checked', isOn ? 'true' : 'false');
    }
    if (modeTitle) {
      modeTitle.textContent = isOn ? '9:20' : '0:00';
    }
    tick();
  }

  function readStoredBool(key, fallback) {
    try {
      const value = window.localStorage.getItem(key);
      if (value === null) {
        return fallback;
      }
      return value === '1';
    } catch (error) {
      return fallback;
    }
  }

  function writeStoredBool(key, value) {
    try {
      window.localStorage.setItem(key, value ? '1' : '0');
    } catch (error) {
      return;
    }
  }

  function startTimers() {
    if (!countdownTimer) {
      tick();
      countdownTimer = window.setInterval(tick, updateIntervalMs);
    }
    if (!colorTimer) {
      cycleColors();
      colorTimer = window.setInterval(cycleColors, colorIntervalMs);
    }
  }

  function stopTimers() {
    if (countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
    if (colorTimer) {
      clearInterval(colorTimer);
      colorTimer = null;
    }
  }

  if (rgbCheckbox) {
    rgbCheckbox.addEventListener('change', () => {
      applyRgbState(rgbCheckbox.checked);
      writeStoredBool(storageKeys.rgb, rgbCheckbox.checked);
    });
  }

  if (msCheckbox) {
    msCheckbox.addEventListener('change', () => {
      applyMsState(msCheckbox.checked);
      writeStoredBool(storageKeys.ms, msCheckbox.checked);
    });
  }

  if (modeCheckbox) {
    modeCheckbox.addEventListener('change', () => {
      applyExamTimeState(modeCheckbox.checked);
      writeStoredBool(storageKeys.examTime, modeCheckbox.checked);
    });
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopTimers();
    } else {
      startTimers();
    }
  });

  applyRgbState(readStoredBool(storageKeys.rgb, false));
  applyMsState(readStoredBool(storageKeys.ms, showCentisecondsByDefault));
  applyExamTimeState(readStoredBool(storageKeys.examTime, false));
  startTimers();

  window.addEventListener('beforeunload', stopTimers);
})();
