// State management
let ratios = [];
let ratioIdCounter = 0;
let draggedRatioId = null;
const STORAGE_KEY = "ratioCalculatorState";

// DOM elements
const inputA = document.getElementById("inputA");
const inputB = document.getElementById("inputB");
const ratioContainer = document.getElementById("ratioContainer");
const resultsContainer = document.getElementById("resultsContainer");
const addRatioBtn = document.getElementById("addRatioBtn");

// Single source of truth for numeric field cleaning
function sanitizeNumeric(value) {
  let cleaned = String(value ?? "").replace(/[^0-9.]/g, "");

  const parts = cleaned.split(".");
  if (parts.length > 2) {
    cleaned = parts[0] + "." + parts.slice(1).join("");
  }

  if (cleaned.length > 1 && cleaned[0] === "0" && cleaned[1] !== ".") {
    cleaned = cleaned.replace(/^0+/, "");
  }

  return cleaned;
}

// Escape values interpolated into innerHTML attribute positions
function escapeAttr(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Load saved state, falling back to defaults when missing/corrupt
function init() {
  const saved = loadState();

  if (saved) {
    const loaded = saved.ratios
      .filter((r) => r && typeof r === "object")
      .map((r) => ({
        ratioA: sanitizeNumeric(r.ratioA),
        ratioB: sanitizeNumeric(r.ratioB),
      }));

    ratios = (loaded.length ? loaded : defaultRatios()).map((r, id) => ({
      id,
      ratioA: r.ratioA,
      ratioB: r.ratioB,
    }));

    if (typeof saved.inputA === "string") inputA.value = saved.inputA;
    if (typeof saved.inputB === "string") inputB.value = saved.inputB;
    validateNumberInput(inputA);
    validateNumberInput(inputB);
  } else {
    ratios = defaultRatios().map((r, id) => ({
      id,
      ratioA: r.ratioA,
      ratioB: r.ratioB,
    }));
  }

  ratioIdCounter = ratios.length;
  renderRatioRows();
  attachEventListeners();
  renderResults();
  saveState();
}

function defaultRatios() {
  return [
    { ratioA: 16, ratioB: 9 },
    { ratioA: 9, ratioB: 16 },
    { ratioA: 4, ratioB: 3 },
    { ratioA: 3, ratioB: 4 },
  ];
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const state = JSON.parse(raw);
    if (!state || !Array.isArray(state.ratios)) return null;
    return state;
  } catch (err) {
    return null;
  }
}

// Persist ratio values, their array order, and the main inputs
function saveState() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ratios: ratios.map(({ ratioA, ratioB }) => ({ ratioA, ratioB })),
        inputA: inputA.value,
        inputB: inputB.value,
      })
    );
  } catch (err) {
    // Storage unavailable or full - keep app working in memory
  }
}

// Add event listeners
function attachEventListeners() {
  inputA.addEventListener("input", handleInputChange);
  inputB.addEventListener("input", handleInputChange);
  addRatioBtn.addEventListener("click", () => addRatioRow());

  // Reset any row left draggable after a handle press without a drag
  document.addEventListener("mouseup", resetRowDraggables);
  document.addEventListener("dragend", resetRowDraggables);
}

function resetRowDraggables() {
  ratioContainer.querySelectorAll(".ratio-row").forEach((row) => {
    row.draggable = false;
    row.classList.remove("dragging", "drag-over");
  });
  draggedRatioId = null;
}

// Handle input change
function handleInputChange() {
  // Validate input (positive integers only)
  validateNumberInput(inputA);
  validateNumberInput(inputB);
  renderResults();
  saveState();
}

// Validate number input (positive numbers, decimals allowed)
function validateNumberInput(input) {
  const value = sanitizeNumeric(input.value);
  if (input.value !== value) {
    input.value = value;
  }
}

// Add a new ratio row
function addRatioRow(defaultA = "", defaultB = "") {
  const id = ratioIdCounter++;
  ratios.push({ id, ratioA: defaultA, ratioB: defaultB });
  renderRatioRows();
  renderResults();
  saveState();
}

// Remove a ratio row
function removeRatioRow(id) {
  ratios = ratios.filter((ratio) => ratio.id !== id);
  renderRatioRows();
  renderResults();
  saveState();
}

// Update ratio value
function updateRatioValue(id, field, value) {
  const ratio = ratios.find((r) => r.id === id);
  if (ratio) {
    ratio[field] = sanitizeNumeric(value);
    renderResults();
    saveState();
  }
}

function commitReorder() {
  renderRatioRows();
  renderResults();
  saveState();
}

// Move dragged ratio to target's position, then re-render rows + results
function reorderRatio(draggedId, targetId) {
  if (draggedId === targetId) return;

  const from = ratios.findIndex((r) => r.id === draggedId);
  const to = ratios.findIndex((r) => r.id === targetId);
  if (from === -1 || to === -1) return;

  const [moved] = ratios.splice(from, 1);
  ratios.splice(to, 0, moved);
  commitReorder();
}

// Keyboard reorder: swap a ratio with its neighbour
function moveRatioBy(id, delta) {
  const from = ratios.findIndex((r) => r.id === id);
  const to = from + delta;
  if (from === -1 || to < 0 || to >= ratios.length) return false;

  const [moved] = ratios.splice(from, 1);
  ratios.splice(to, 0, moved);
  commitReorder();
  return true;
}

function clearDragOverClasses() {
  ratioContainer.querySelectorAll(".drag-over").forEach((row) => {
    row.classList.remove("drag-over");
  });
}

// Enable drag-to-reorder from the handle only, so inputs stay editable
function attachDragListeners(row, handle, ratio) {
  // --- Mouse / HTML5 drag ---
  handle.addEventListener("mousedown", () => {
    row.draggable = true;
  });

  row.addEventListener("dragstart", (e) => {
    draggedRatioId = ratio.id;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(ratio.id));
    // Defer class add so the drag image isn't captured with drag styling
    requestAnimationFrame(() => row.classList.add("dragging"));
  });

  row.addEventListener("dragover", (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (draggedRatioId !== null && draggedRatioId !== ratio.id) {
      row.classList.add("drag-over");
    }
  });

  row.addEventListener("dragleave", () => {
    row.classList.remove("drag-over");
  });

  row.addEventListener("drop", (e) => {
    e.preventDefault();
    e.stopPropagation();
    row.classList.remove("drag-over");
    if (draggedRatioId !== null) {
      reorderRatio(draggedRatioId, ratio.id);
    }
    resetRowDraggables();
  });

  // --- Keyboard reorder ---
  handle.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
    e.preventDefault();
    const delta = e.key === "ArrowUp" ? -1 : 1;
    if (moveRatioBy(ratio.id, delta)) {
      const movedRow = ratioContainer.querySelector(
        `.ratio-row[data-id="${ratio.id}"]`
      );
      movedRow?.querySelector(".drag-handle")?.focus();
    }
  });

  // --- Touch reorder (HTML5 DnD is mouse-only) ---
  let touchTarget = null;

  handle.addEventListener("touchstart", () => {
    row.draggable = false;
    row.classList.add("dragging");
  });

  handle.addEventListener(
    "touchmove",
    (e) => {
      const touch = e.touches[0];
      if (!touch) return;
      e.preventDefault();

      const under = document
        .elementFromPoint(touch.clientX, touch.clientY)
        ?.closest(".ratio-row");
      clearDragOverClasses();
      touchTarget = under && under !== row ? under : null;
      touchTarget?.classList.add("drag-over");
    },
    { passive: false }
  );

  handle.addEventListener("touchend", (e) => {
    e.preventDefault();
    if (touchTarget) {
      const targetId = Number(touchTarget.dataset.id);
      reorderRatio(ratio.id, targetId);
    }
    touchTarget = null;
    row.classList.remove("dragging");
    clearDragOverClasses();
  });

  handle.addEventListener("touchcancel", () => {
    touchTarget = null;
    row.classList.remove("dragging");
    clearDragOverClasses();
  });
}

// Render ratio rows
function renderRatioRows() {
  ratioContainer.innerHTML = "";

  ratios.forEach((ratio) => {
    const row = document.createElement("div");
    row.className = "ratio-row";
    row.draggable = false;
    row.dataset.id = String(ratio.id);
    const safeId = escapeAttr(ratio.id);
    const safeA = escapeAttr(ratio.ratioA);
    const safeB = escapeAttr(ratio.ratioB);

    row.innerHTML = `
            <button class="drag-handle" type="button" aria-label="Reorder ratio with arrow keys or drag" title="Drag or use arrow keys to reorder">⠿</button>
            <input
                type="number"
                class="ratio-input-a"
                data-id="${safeId}"
                value="${safeA}"
                placeholder="16"
                min="1"
                aria-label="Ratio numerator"
            >
            <span class="ratio-separator">:</span>
            <input
                type="number"
                class="ratio-input-b"
                data-id="${safeId}"
                value="${safeB}"
                placeholder="9"
                min="1"
                aria-label="Ratio denominator"
            >
            <button class="btn btn-remove" data-id="${safeId}" type="button" aria-label="Remove ratio">−</button>
        `;

    ratioContainer.appendChild(row);

    // Add event listeners
    const inputRatioA = row.querySelector(".ratio-input-a");
    const inputRatioB = row.querySelector(".ratio-input-b");
    const removeBtn = row.querySelector(".btn-remove");
    const dragHandle = row.querySelector(".drag-handle");

    attachDragListeners(row, dragHandle, ratio);

    inputRatioA.addEventListener("input", (e) => {
      updateRatioValue(ratio.id, "ratioA", e.target.value);
    });

    inputRatioB.addEventListener("input", (e) => {
      updateRatioValue(ratio.id, "ratioB", e.target.value);
    });

    removeBtn.addEventListener("click", () => {
      // Prevent removing the last ratio
      if (ratios.length > 1) {
        removeRatioRow(ratio.id);
      }
    });
  });
}

function gcd(a, b) {
  a = Math.abs(Math.trunc(a));
  b = Math.abs(Math.trunc(b));
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
}

// Reduce A:B to lowest integer terms. Decimals are scaled first, e.g. 2.5:5 -> 1:2.
function simplifyRatio(a, b) {
  const numA = parseFloat(a);
  const numB = parseFloat(b);
  if (!(numA > 0) || !(numB > 0) || !Number.isFinite(numA * numB)) return null;

  const decimalsOf = (v) => {
    const parts = String(v).split(".");
    return parts.length > 1 ? parts[1].length : 0;
  };
  const scale = 10 ** Math.max(decimalsOf(a), decimalsOf(b));
  const intA = Math.round(numA * scale);
  const intB = Math.round(numB * scale);
  if (!Number.isSafeInteger(intA) || !Number.isSafeInteger(intB)) return null;

  const divisor = gcd(intA, intB);
  if (divisor <= 0) return null;
  return `${intA / divisor}:${intB / divisor}`;
}

// Smart round: 2 decimal places if input has decimals, otherwise whole number
function smartRound(value, hasDecimals) {
  return hasDecimals
    ? Math.round(value * 100) / 100
    : Math.round(value);
}

// Calculate for a single ratio
function calculateForRatio(A, B, ratioA, ratioB) {
  const a = parseFloat(A) || 0;
  const b = parseFloat(B) || 0;
  const rA = parseFloat(ratioA) || 0;
  const rB = parseFloat(ratioB) || 0;

  // Check if any input has decimal values
  const hasDecimals = [A, B, ratioA, ratioB].some(
    (v) => String(v).includes(".")
  );

  // Validation - need at least one dimension and valid ratio
  if ((a <= 0 && b <= 0) || rA <= 0 || rB <= 0) {
    return null;
  }

  // Case 1: Only A (width) is given - calculate height
  if (a > 0 && b === 0) {
    const correctHeight = smartRound((a / rA) * rB, hasDecimals);
    return {
      width: a,
      height: correctHeight,
      ratioA: rA,
      ratioB: rB,
      isCorrect: true,
      userHeight: null,
    };
  }

  // Case 2: Only B (height) is given - calculate width
  if (b > 0 && a === 0) {
    const correctWidth = smartRound((b / rB) * rA, hasDecimals);
    return {
      width: correctWidth,
      height: b,
      ratioA: rA,
      ratioB: rB,
      isCorrect: true,
      userHeight: null,
    };
  }

  // Case 3: Both A and B are given - validate
  const correctHeight = smartRound((a / rA) * rB, hasDecimals);
  // Relative epsilon stays tight on small resolutions and scales on large ones
  const tolerance = Math.max(0.01, Math.abs(correctHeight) * 0.0001);
  const isCorrect = Math.abs(b - correctHeight) <= tolerance;

  return {
    width: a,
    height: correctHeight,
    ratioA: rA,
    ratioB: rB,
    isCorrect: isCorrect,
    userHeight: b,
  };
}

// Render results
function renderResults() {
  const A = inputA.value;
  const B = inputB.value;

  // Clear results if no dimensions at all
  if ((!A || parseFloat(A) <= 0) && (!B || parseFloat(B) <= 0)) {
    resultsContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📐</div>
                <p>Enter dimensions and ratios to see results</p>
            </div>
        `;
    return;
  }

  // Simplify the entered width:height using their greatest common divisor
  const simplified = simplifyRatio(A, B);
  const simplifiedHtml = simplified
    ? `
        <div class="result-item simplified">
            <div class="result-text">
                <span class="badge-info result-badge">Simplified</span>
                <span>${A}:${B}</span><span> = </span><span class="highlight-correct">${simplified}</span>
            </div>
        </div>
    `
    : "";

  const results = [];

  ratios.forEach((ratio) => {
    const calc = calculateForRatio(A, B, ratio.ratioA, ratio.ratioB);
    if (calc) {
      results.push(calc);
    }
  });

  // Render results
  if (results.length === 0) {
    resultsContainer.innerHTML =
      simplifiedHtml +
      `
            <div class="empty-state">
                <div class="empty-state-icon">⚠️</div>
                <p>Add valid aspect ratios to see results</p>
            </div>
        `;
    return;
  }

  resultsContainer.innerHTML = simplifiedHtml + results
    .map((result) => {
      const ratioText = `${result.ratioA}:${result.ratioB}`;

      if (result.userHeight === null || result.isCorrect) {
        // Single dimension given, or both dimensions match the ratio
        return `
                <div class="result-item correct">
                    <div class="result-text">
                        <span class="badge-success result-badge">✓</span>
                        <span>${result.width}</span><span> × </span><span>${result.height}</span><span> [${ratioText}]</span>
                    </div>
                </div>
            `;
      } else {
        // Both dimensions given but they don't match the ratio
        return `
                <div class="result-item incorrect">
                    <div class="result-text">
                        <span class="badge-error result-badge">✗ False</span>
                        <span>${result.width}</span><span> × </span><span class="highlight-error">${result.userHeight}</span><span> </span><span class="highlight-correct">${result.height}</span><span> [${ratioText}]</span>
                    </div>
                </div>
            `;
      }
    })
    .join("");
}

// Initialize the app
init();
