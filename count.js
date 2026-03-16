(function () {
  const countdownDiv = document.getElementById('countdown');
  const rgbDiv = document.getElementById('rgb-on');
  const rgbCheckbox = document.getElementById('switch');
  const msCheckbox = document.getElementById('ms-switch');
  const examTimeCheckbox = document.getElementById('exam-time-switch');
  const pageTitle = document.getElementById('page-title');
  const yearTargets = document.querySelectorAll('[data-exam-year]');
  const fullTitleTargets = document.querySelectorAll('[data-exam-title]');
  const rgbTitle = document.querySelector('.switch-title.rgb');
  const msTitle = document.querySelector('.switch-title.ms');
  const examTimeTitle = document.querySelector('.switch-title.exam-time');

  const units = ['days', 'hours', 'minutes', 'seconds'];
  const colors = [
    'color1', 'color2', 'color3', 'color4', 'color5',
    'color6', 'color7', 'color8', 'color9', 'color10',
    'color11', 'color12', 'color13', 'color14', 'color15',
    'color16', 'color17', 'color18', 'color19', 'color20'
  ];
  const storageKeys = {
    rgb: 'kanagawaCountdown.rgb',
    ms: 'kanagawaCountdown.ms',
    examTime: 'kanagawaCountdown.examTime'
  };

  let showCentiseconds = true;
  let countdownTimer = null;
  let colorTimer = null;
  let colorIndex = 0;
  let finishedRedirected = false;
  let useExamTime = false;

  function buildTargetDate(year, monthIndex, day) {
    const hour = useExamTime ? 9 : 0;
    const minute = useExamTime ? 20 : 0;
    return new Date(year, monthIndex, day, hour, minute, 0, 0);
  }

  function getExamDate(year) {
    if (year === 2026) {
      return buildTargetDate(2026, 1, 17);
    }

    for (let day = 14; day <= 17; day += 1) {
      const date = new Date(year, 1, day, 0, 0, 0, 0);
      const weekday = date.getDay();
      if (weekday !== 0 && weekday !== 6) {
        return buildTargetDate(year, 1, day);
      }
    }

    return buildTargetDate(year, 1, 17);
  }

  function getTargetDate(now) {
    const currentYear = now.getFullYear();
    const thisYearExam = getExamDate(currentYear);

    if (now < thisYearExam) {
      return { year: currentYear, target: thisYearExam };
    }

    return { year: currentYear + 1, target: getExamDate(currentYear + 1) };
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
    const targetDate = updateTitle(now);
    const diff = targetDate.getTime() - now.getTime();

    if (diff <= 0 && !finishedRedirected) {
      finishedRedirected = true;
      window.location.href = './countdown-finished.html';
      return;
    }

    const safeDiff = Math.max(0, diff);
    const days = Math.floor(safeDiff / 86400000);
    const hours = Math.floor((safeDiff % 86400000) / 3600000);
    const minutes = Math.floor((safeDiff % 3600000) / 60000);
    const seconds = Math.floor((safeDiff % 60000) / 1000);
    const centiseconds = Math.floor((safeDiff % 1000) / 10);

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
      countdownDiv.style.display = isOn ? 'none' : 'grid';
    }

    if (rgbDiv) {
      rgbDiv.style.display = isOn ? 'grid' : 'none';
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

    if (examTimeCheckbox) {
      examTimeCheckbox.checked = isOn;
      examTimeCheckbox.setAttribute('aria-checked', isOn ? 'true' : 'false');
    }

    if (examTimeTitle) {
      examTimeTitle.textContent = isOn ? '9:20' : '0:00';
    }

    finishedRedirected = false;
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
      countdownTimer = window.setInterval(tick, 50);
    }

    if (!colorTimer) {
      cycleColors();
      colorTimer = window.setInterval(cycleColors, 150);
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

  if (examTimeCheckbox) {
    examTimeCheckbox.addEventListener('change', () => {
      applyExamTimeState(examTimeCheckbox.checked);
      writeStoredBool(storageKeys.examTime, examTimeCheckbox.checked);
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
  applyMsState(readStoredBool(storageKeys.ms, true));
  applyExamTimeState(readStoredBool(storageKeys.examTime, false));
  startTimers();

  window.addEventListener('beforeunload', stopTimers);
})();
