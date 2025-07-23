// Global variable to store current palette data
let currentPalette = {};

function hexToRgb(hex) {
  const bigint = parseInt(hex.slice(1), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return { r, g, b };
}

function hslToHex(h, s, l) {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function hexToHSL(H) {
  let r = 0,
    g = 0,
    b = 0;
  if (H.length === 4) {
    r = '0x' + H[1] + H[1];
    g = '0x' + H[2] + H[2];
    b = '0x' + H[3] + H[3];
  } else if (H.length === 7) {
    r = '0x' + H[1] + H[2];
    g = '0x' + H[3] + H[4];
    b = '0x' + H[5] + H[6];
  }
  r /= 255;
  g /= 255;
  b /= 255;
  const cmin = Math.min(r, g, b),
    cmax = Math.max(r, g, b),
    delta = cmax - cmin;
  let h = 0,
    s = 0,
    l = 0;
  if (delta === 0) h = 0;
  else if (cmax === r) h = ((g - b) / delta) % 6;
  else if (cmax === g) h = (b - r) / delta + 2;
  else h = (r - g) / delta + 4;
  h = Math.round(h * 60);
  if (h < 0) h += 360;
  l = (cmax + cmin) / 2;
  s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  s = +(s * 100).toFixed(1);
  l = +(l * 100).toFixed(1);
  return { h, s, l };
}

function parseColorInput(input) {
  // Remove whitespace
  input = input.trim();

  // If it's already a hex color
  if (input.match(/^#?[0-9A-Fa-f]{6}$/)) {
    return input.startsWith('#') ? input : '#' + input;
  }

  // If it's RGB format (with or without spaces)
  const rgbMatch = input.match(/(\d+),?\s*(\d+),?\s*(\d+)/);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1]);
    const g = parseInt(rgbMatch[2]);
    const b = parseInt(rgbMatch[3]);

    if (r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255) {
      return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }
  }

  return null;
}

function updateColorFromInput() {
  const rgbInput = document.getElementById('rgbInput');
  const colorPicker = document.getElementById('primaryColor');

  if (rgbInput.value) {
    const parsed = parseColorInput(rgbInput.value);
    if (parsed) {
      colorPicker.value = parsed;
      rgbInput.style.borderColor = '#10b981';
    } else {
      rgbInput.style.borderColor = '#ef4444';
    }
  }
}

function updateRGBFromPicker() {
  const colorPicker = document.getElementById('primaryColor');
  const rgbInput = document.getElementById('rgbInput');
  const { r, g, b } = hexToRgb(colorPicker.value);
  rgbInput.value = `${r}, ${g}, ${b}`;
  rgbInput.style.borderColor = '#e5e7eb';
}

function getContrastColor(hex) {
  const { r, g, b } = hexToRgb(hex);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

function createColorBox(color, showRgb = true) {
  const { r, g, b } = hexToRgb(color);
  const rgb = `rgb(${r}, ${g}, ${b})`;
  const div = document.createElement('div');
  div.className = 'color-box';
  div.style.backgroundColor = color;
  div.style.color = getContrastColor(color);

  div.innerHTML = `
          <div>${color.toUpperCase()}</div>
          ${showRgb ? `<div class="color-code">${rgb}</div>` : ''}
        `;

  div.onclick = () => {
    navigator.clipboard.writeText(color);
    const originalContent = div.innerHTML;
    div.innerHTML = '<div>Copied!</div>';
    setTimeout(() => {
      div.innerHTML = originalContent;
    }, 1000);
  };
  return div;
}

function generateTints(hex, count = 4) {
  const { h, s, l } = hexToHSL(hex);
  const colors = [];
  for (let i = 1; i <= count; i++) {
    const newL = Math.min(100, l + (i * (100 - l)) / (count + 1));
    colors.push(hslToHex(h, s, newL));
  }
  return colors;
}

function generateShades(hex, count = 4) {
  const { h, s, l } = hexToHSL(hex);
  const colors = [];
  for (let i = 1; i <= count; i++) {
    const newL = Math.max(0, l - (i * l) / (count + 1));
    colors.push(hslToHex(h, s, newL));
  }
  return colors;
}

function generateGrayscale(primaryHex) {
  const { h } = hexToHSL(primaryHex);
  const colors = [];
  for (let i = 0; i < 10; i++) {
    const lightness = 10 + i * 10;
    colors.push(hslToHex(h, 20, lightness));
  }
  return colors;
}

function drawFinalPalette(paletteData) {
  const container = document.getElementById('finalPaletteContainer');
  container.innerHTML = '';

  const swatchWidth = 100;
  const swatchHeight = 80;
  const textHeight = 50;
  const rowHeight = swatchHeight + textHeight;

  // Split grayscale into two rows of 5 colors each
  const grayscaleRow1 = paletteData.grayscale.slice(0, 5);
  const grayscaleRow2 = paletteData.grayscale.slice(5, 10);

  // Organize rows as requested (10 rows total now)
  const rows = [
    {
      colors: [paletteData.primary[0], ...paletteData.primaryTints],
      label: 'Primary + Tints',
    },
    {
      colors: [paletteData.success, ...paletteData.successTints],
      label: 'Success + Tints',
    },
    {
      colors: [paletteData.warning, ...paletteData.warningTints],
      label: 'Warning + Tints',
    },
    {
      colors: [paletteData.error, ...paletteData.errorTints],
      label: 'Error + Tints',
    },
    {
      colors: [paletteData.primary[0], ...paletteData.primaryShades],
      label: 'Primary + Shades',
    },
    {
      colors: [paletteData.success, ...paletteData.successShades],
      label: 'Success + Shades',
    },
    {
      colors: [paletteData.warning, ...paletteData.warningShades],
      label: 'Warning + Shades',
    },
    {
      colors: [paletteData.error, ...paletteData.errorShades],
      label: 'Error + Shades',
    },
    { colors: grayscaleRow1, label: 'Grayscale 1' },
    { colors: grayscaleRow2, label: 'Grayscale 2' },
  ];

  const maxCols = Math.max(...rows.map((row) => row.colors.length));
  const svgWidth = maxCols * swatchWidth;
  const svgHeight = rows.length * rowHeight;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', svgWidth);
  svg.setAttribute('height', svgHeight);
  svg.setAttribute('viewBox', `0 0 ${svgWidth} ${svgHeight}`);
  svg.style.maxWidth = '100%';
  svg.style.height = 'auto';
  svg.style.border = '1px solid #e5e7eb';
  svg.style.borderRadius = '0.5rem';
  svg.id = 'finalPaletteSVG';

  // Add white background
  const background = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'rect'
  );
  background.setAttribute('width', svgWidth);
  background.setAttribute('height', svgHeight);
  background.setAttribute('fill', '#ffffff');
  svg.appendChild(background);

  rows.forEach((row, rowIndex) => {
    const y = rowIndex * rowHeight;

    row.colors.forEach((color, colIndex) => {
      const x = colIndex * swatchWidth;

      // Draw color swatch
      const rect = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'rect'
      );
      rect.setAttribute('x', x);
      rect.setAttribute('y', y);
      rect.setAttribute('width', swatchWidth);
      rect.setAttribute('height', swatchHeight);
      rect.setAttribute('fill', color);
      rect.setAttribute('stroke', '#e5e7eb');
      rect.setAttribute('stroke-width', '1');
      svg.appendChild(rect);

      // Draw hex code
      const hexText = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'text'
      );
      hexText.setAttribute('x', x + swatchWidth / 2);
      hexText.setAttribute('y', y + swatchHeight + 18);
      hexText.setAttribute('text-anchor', 'middle');
      hexText.setAttribute('font-family', 'monospace');
      hexText.setAttribute('font-size', '14');
      hexText.setAttribute('font-weight', 'bold');
      hexText.setAttribute('fill', '#1f2937');
      hexText.textContent = color.toUpperCase();
      svg.appendChild(hexText);

      // Draw RGB code
      const { r, g, b } = hexToRgb(color);
      const rgbText = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'text'
      );
      rgbText.setAttribute('x', x + swatchWidth / 2);
      rgbText.setAttribute('y', y + swatchHeight + 38);
      rgbText.setAttribute('text-anchor', 'middle');
      rgbText.setAttribute('font-family', 'monospace');
      rgbText.setAttribute('font-size', '12');
      rgbText.setAttribute('fill', '#6b7280');
      rgbText.textContent = `rgb(${r}, ${g}, ${b})`;
      svg.appendChild(rgbText);
    });
  });

  container.appendChild(svg);
}

function exportAsPNG() {
  const svg = document.getElementById('finalPaletteSVG');
  const svgData = new XMLSerializer().serializeToString(svg);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const img = new Image();

  canvas.width = parseInt(svg.getAttribute('width'));
  canvas.height = parseInt(svg.getAttribute('height'));

  img.onload = function () {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    canvas.toBlob(function (blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'color-palette.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  };

  img.src =
    'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
}

function exportAsSVG() {
  const svg = document.getElementById('finalPaletteSVG');
  const svgData = new XMLSerializer().serializeToString(svg);
  const blob = new Blob([svgData], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'color-palette.svg';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function generatePalette() {
  const primary = document.getElementById('primaryColor').value;
  const notificationColors = {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
  };

  // Clear existing content
  document.getElementById('primaryPalette').innerHTML = '';
  document.getElementById('notificationsPalette').innerHTML = '';
  document.getElementById('primaryTints').innerHTML = '';
  document.getElementById('successTints').innerHTML = '';
  document.getElementById('warningTints').innerHTML = '';
  document.getElementById('errorTints').innerHTML = '';
  document.getElementById('primaryShades').innerHTML = '';
  document.getElementById('successShades').innerHTML = '';
  document.getElementById('warningShades').innerHTML = '';
  document.getElementById('errorShades').innerHTML = '';
  document.getElementById('grayscalePalette').innerHTML = '';

  // Primary color
  document
    .getElementById('primaryPalette')
    .appendChild(createColorBox(primary));

  // Notification colors
  const notifContainer = document.getElementById('notificationsPalette');
  Object.values(notificationColors).forEach((color) => {
    notifContainer.appendChild(createColorBox(color));
  });

  // Generate tints
  const primaryTints = generateTints(primary);
  const successTints = generateTints(notificationColors.success);
  const warningTints = generateTints(notificationColors.warning);
  const errorTints = generateTints(notificationColors.error);

  primaryTints.forEach((color) => {
    document.getElementById('primaryTints').appendChild(createColorBox(color));
  });
  successTints.forEach((color) => {
    document.getElementById('successTints').appendChild(createColorBox(color));
  });
  warningTints.forEach((color) => {
    document.getElementById('warningTints').appendChild(createColorBox(color));
  });
  errorTints.forEach((color) => {
    document.getElementById('errorTints').appendChild(createColorBox(color));
  });

  // Generate shades
  const primaryShades = generateShades(primary);
  const successShades = generateShades(notificationColors.success);
  const warningShades = generateShades(notificationColors.warning);
  const errorShades = generateShades(notificationColors.error);

  primaryShades.forEach((color) => {
    document.getElementById('primaryShades').appendChild(createColorBox(color));
  });
  successShades.forEach((color) => {
    document.getElementById('successShades').appendChild(createColorBox(color));
  });
  warningShades.forEach((color) => {
    document.getElementById('warningShades').appendChild(createColorBox(color));
  });
  errorShades.forEach((color) => {
    document.getElementById('errorShades').appendChild(createColorBox(color));
  });

  // Generate grayscale
  const grayscaleColors = generateGrayscale(primary);
  const grayscaleContainer = document.getElementById('grayscalePalette');
  grayscaleColors.forEach((color) => {
    grayscaleContainer.appendChild(createColorBox(color));
  });

  // Prepare data for final palette
  currentPalette = {
    primary: [primary],
    success: notificationColors.success,
    warning: notificationColors.warning,
    error: notificationColors.error,
    primaryTints: primaryTints,
    successTints: successTints,
    warningTints: warningTints,
    errorTints: errorTints,
    primaryShades: primaryShades,
    successShades: successShades,
    warningShades: warningShades,
    errorShades: errorShades,
    grayscale: grayscaleColors,
  };

  drawFinalPalette(currentPalette);
}

// Generate initial palette and set up event listeners
document.addEventListener('DOMContentLoaded', function () {
  const colorPicker = document.getElementById('primaryColor');
  const rgbInput = document.getElementById('rgbInput');

  // Update RGB input when color picker changes
  colorPicker.addEventListener('change', updateRGBFromPicker);

  // Update color picker when RGB input changes
  rgbInput.addEventListener('input', function () {
    const parsed = parseColorInput(this.value);
    if (parsed) {
      colorPicker.value = parsed;
      this.style.borderColor = '#10b981';
    } else if (this.value) {
      this.style.borderColor = '#ef4444';
    } else {
      this.style.borderColor = '#e5e7eb';
    }
  });

  // Generate palette when Enter is pressed in RGB input
  rgbInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
      generatePalette();
    }
  });

  // Initialize
  updateRGBFromPicker();
  generatePalette();
});
