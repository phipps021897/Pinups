// Pinups fixtures calendar — mobile-first month view + agenda list.
(function () {
  const MONTH_NAMES = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const WEEKDAY_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const events = PINUPS_EVENTS.slice().sort((a, b) => a.date.localeCompare(b.date));

  const seasonStart = { y: 2026, m: 8 }; // September 2026 (0-indexed month)
  const seasonEnd = { y: 2027, m: 4 };   // May 2027

  function eventsByMonth(y, m) {
    const prefix = `${y}-${String(m + 1).padStart(2, "0")}`;
    return events.filter((e) => e.date.startsWith(prefix));
  }

  function eventsOnDate(iso) {
    return events.filter((e) => e.date === iso);
  }

  function clamp(y, m) {
    if (y < seasonStart.y || (y === seasonStart.y && m < seasonStart.m)) return { y: seasonStart.y, m: seasonStart.m };
    if (y > seasonEnd.y || (y === seasonEnd.y && m > seasonEnd.m)) return { y: seasonEnd.y, m: seasonEnd.m };
    return { y, m };
  }

  function todayIso() {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  }

  function defaultMonth() {
    const d = new Date();
    return clamp(d.getFullYear(), d.getMonth());
  }

  let current = defaultMonth();

  const monthLabel = document.getElementById("cal-month-label");
  const grid = document.getElementById("cal-grid");
  const agenda = document.getElementById("cal-agenda");
  const prevBtn = document.getElementById("cal-prev");
  const nextBtn = document.getElementById("cal-next");
  const todayBtn = document.getElementById("cal-today");

  function dotClassesFor(e) {
    if (e.type === "league") return e.homeAway === "Home" ? "home" : "away";
    return e.type; // cup, pairs, bye
  }

  function badgeLabel(e) {
    if (e.type === "league") return e.homeAway;
    if (e.type === "cup") return "Cup";
    if (e.type === "pairs") return "Pairs";
    if (e.type === "bye") return "Bye";
    return "";
  }

  function eventTitle(e) {
    if (e.type === "league") return `vs ${e.opponent}`;
    if (e.type === "cup") return e.label + " (TBC)";
    if (e.type === "pairs") return e.label + " (TBC)";
    if (e.type === "bye") return "Bye Week — no fixture";
    return "";
  }

  function render() {
    const { y, m } = current;
    monthLabel.textContent = `${MONTH_NAMES[m]} ${y}`;
    prevBtn.disabled = y === seasonStart.y && m === seasonStart.m;
    nextBtn.disabled = y === seasonEnd.y && m === seasonEnd.m;
    prevBtn.style.opacity = prevBtn.disabled ? 0.35 : 1;
    nextBtn.style.opacity = nextBtn.disabled ? 0.35 : 1;

    grid.innerHTML = "";
    WEEKDAY_SHORT.forEach((wd) => {
      const el = document.createElement("div");
      el.className = "cal-weekday";
      el.textContent = wd;
      grid.appendChild(el);
    });

    const firstOfMonth = new Date(y, m, 1);
    const startOffset = (firstOfMonth.getDay() + 6) % 7; // Monday=0
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const today = todayIso();

    for (let i = 0; i < startOffset; i++) {
      const el = document.createElement("div");
      el.className = "cal-day empty";
      grid.appendChild(el);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const iso = `${y}-${String(m + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const dayEvents = eventsOnDate(iso);
      const el = document.createElement("div");
      el.className = "cal-day" + (iso === today ? " today" : "");
      const num = document.createElement("span");
      num.textContent = day;
      el.appendChild(num);
      if (dayEvents.length) {
        const dots = document.createElement("div");
        dots.className = "dots";
        dayEvents.forEach((e) => {
          const dot = document.createElement("span");
          dot.className = "dot " + dotClassesFor(e);
          dots.appendChild(dot);
        });
        el.appendChild(dots);
      }
      grid.appendChild(el);
    }

    const monthEvents = eventsByMonth(y, m);
    agenda.innerHTML = "";
    if (!monthEvents.length) {
      const empty = document.createElement("div");
      empty.className = "empty-month";
      empty.textContent = "No fixtures this month.";
      agenda.appendChild(empty);
      return;
    }

    monthEvents.forEach((e) => {
      const d = new Date(e.date + "T00:00:00");
      const item = document.createElement("div");
      item.className = "agenda-item";
      item.innerHTML = `
        <div class="agenda-date">
          <div class="d">${d.getDate()}</div>
          <div class="m">${MONTH_SHORT[d.getMonth()]}</div>
        </div>
        <div class="agenda-body">
          <p class="agenda-title">${eventTitle(e)}<span class="badge ${dotClassesFor(e)}">${badgeLabel(e)}</span></p>
          <div class="agenda-meta">${e.venue ? e.venue + " · " : ""}${e.night}</div>
        </div>
      `;
      agenda.appendChild(item);
    });
  }

  prevBtn.addEventListener("click", () => {
    let { y, m } = current;
    m -= 1;
    if (m < 0) { m = 11; y -= 1; }
    current = clamp(y, m);
    render();
  });

  nextBtn.addEventListener("click", () => {
    let { y, m } = current;
    m += 1;
    if (m > 11) { m = 0; y += 1; }
    current = clamp(y, m);
    render();
  });

  todayBtn.addEventListener("click", () => {
    current = defaultMonth();
    render();
  });

  render();
})();
