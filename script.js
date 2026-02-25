// State management
let ratios = [];
let ratioIdCounter = 0;

// DOM elements
const inputA = document.getElementById("inputA");
const inputB = document.getElementById("inputB");
const ratioContainer = document.getElementById("ratioContainer");
const resultsContainer = document.getElementById("resultsContainer");
const addRatioBtn = document.getElementById("addRatioBtn");

// Initialize with default ratios
function init() {
  addRatioRow(16, 9);
  addRatioRow(9, 16);
  addRatioRow(4, 3);
  addRatioRow(3, 4);
  attachEventListeners();
}

// Add event listeners
function attachEventListeners() {
  inputA.addEventListener("input", handleInputChange);
  inputB.addEventListener("input", handleInputChange);
  addRatioBtn.addEventListener("click", () => addRatioRow());
}

// Handle input change
function handleInputChange() {
  // Validate input (positive integers only)
  validateNumberInput(inputA);
  validateNumberInput(inputB);
  renderResults();
}

// Validate number input (positive integers only)
function validateNumberInput(input) {
  let value = input.value;

  // Remove non-numeric characters
  value = value.replace(/[^0-9]/g, "");

  // Prevent leading zeros (except for empty or single zero)
  if (value.length > 1 && value[0] === "0") {
    value = value.replace(/^0+/, "");
  }

  // Update input value
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
}

// Remove a ratio row
function removeRatioRow(id) {
  ratios = ratios.filter((ratio) => ratio.id !== id);
  renderRatioRows();
  renderResults();
}

// Update ratio value
function updateRatioValue(id, field, value) {
  const ratio = ratios.find((r) => r.id === id);
  if (ratio) {
    // Validate - remove non-numeric characters
    value = value.replace(/[^0-9]/g, "");

    // Prevent leading zeros
    if (value.length > 1 && value[0] === "0") {
      value = value.replace(/^0+/, "");
    }

    ratio[field] = value;
    renderResults();
  }
}

// Render ratio rows
function renderRatioRows() {
  ratioContainer.innerHTML = "";

  ratios.forEach((ratio) => {
    const row = document.createElement("div");
    row.className = "ratio-row";

    row.innerHTML = `
            <input
                type="number"
                class="ratio-input-a"
                data-id="${ratio.id}"
                value="${ratio.ratioA}"
                placeholder="16"
                min="1"
                aria-label="Ratio numerator"
            >
            <span class="ratio-separator">:</span>
            <input
                type="number"
                class="ratio-input-b"
                data-id="${ratio.id}"
                value="${ratio.ratioB}"
                placeholder="9"
                min="1"
                aria-label="Ratio denominator"
            >
            <button class="btn btn-remove" data-id="${ratio.id}" type="button" aria-label="Remove ratio">−</button>
        `;

    ratioContainer.appendChild(row);

    // Add event listeners
    const inputRatioA = row.querySelector(".ratio-input-a");
    const inputRatioB = row.querySelector(".ratio-input-b");
    const removeBtn = row.querySelector(".btn-remove");

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

// Calculate for a single ratio
function calculateForRatio(A, B, ratioA, ratioB) {
  const a = parseFloat(A) || 0;
  const b = parseFloat(B) || 0;
  const rA = parseFloat(ratioA) || 0;
  const rB = parseFloat(ratioB) || 0;

  // Validation - need at least one dimension and valid ratio
  if ((a <= 0 && b <= 0) || rA <= 0 || rB <= 0) {
    return null;
  }

  // Case 1: Only A (width) is given - calculate height
  if (a > 0 && b === 0) {
    const correctHeight = Math.round((a / rA) * rB);
    return {
      width: a,
      height: correctHeight,
      ratioA: rA,
      ratioB: rB,
      isCorrect: true,
      userHeight: null,
      userWidth: null,
    };
  }

  // Case 2: Only B (height) is given - calculate width
  if (b > 0 && a === 0) {
    const correctWidth = Math.round((b / rB) * rA);
    return {
      width: correctWidth,
      height: b,
      ratioA: rA,
      ratioB: rB,
      isCorrect: true,
      userHeight: null,
      userWidth: null,
    };
  }

  // Case 3: Both A and B are given - validate
  const correctHeight = Math.round((a / rA) * rB);
  const isCorrect = Math.abs(b - correctHeight) < 0.5; // Allow for rounding

  return {
    width: a,
    height: correctHeight,
    ratioA: rA,
    ratioB: rB,
    isCorrect: isCorrect,
    userHeight: b,
    userWidth: null,
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

  const results = [];

  ratios.forEach((ratio) => {
    const calc = calculateForRatio(A, B, ratio.ratioA, ratio.ratioB);
    if (calc) {
      results.push(calc);
    }
  });

  // Render results
  if (results.length === 0) {
    resultsContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">⚠️</div>
                <p>Add valid aspect ratios to see results</p>
            </div>
        `;
    return;
  }

  resultsContainer.innerHTML = results
    .map((result) => {
      const ratioText = `${result.ratioA}:${result.ratioB}`;

      if (result.userHeight === null) {
        // Case 1: Only A is given
        return `
                <div class="result-item correct">
                    <div class="result-text">
                        <span class="badge-success result-badge">✓</span>
                        <span>${result.width}</span><span> × </span><span>${result.height}</span><span> [${ratioText}]</span>
                    </div>
                </div>
            `;
      } else if (result.isCorrect) {
        // Case 2: A and B are correct
        return `
                <div class="result-item correct">
                    <div class="result-text">
                        <span class="badge-success result-badge">✓</span>
                        <span>${result.width}</span><span> × </span><span>${result.height}</span><span> [${ratioText}]</span>
                    </div>
                </div>
            `;
      } else {
        // Case 2: A and B don't match the ratio
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
