# Monochromatic Color Palette Generator

## 🎯 Purpose

Create a responsive web page (HTML + JavaScript + pure CSS) that:

- Lets the user select a **primary color**
- Generates a complete **design color system** based on that input

---

## 🛠️ Functional Requirements

### 1. **Primary Color Selection**

- User selects a primary color using a color picker.
- Automatically generates tints, shades, and grayscale from it.

### 2. **Notification Colors**

- Predefined or derived:

  - ✅ Success
  - ✅ Warning
  - ✅ Error

- Should work even if one of them is close to the primary color.

### 3. **Tints and Shades**

- For: Primary, Success, Warning, Error
- Tints: 4 lighter variants (HSL +lightness)
- Shades: 4 darker variants (HSB +black)

### 4. **Grayscale**

- Based on primary color:

  - Start: Saturation 20%, Lightness 10%
  - Add +10% lightness in 4 steps to get to white

---

## 🎨 Output and Presentation

### Visual Layout

- Grouped sections:

  - Primary color
  - Notification colors
  - Tints
  - Shades
  - Grayscale

### Copyable Info

- Each color:

  - Hex code
  - RGB code (displayed and copyable)

---

## 🖼️ Combined Palette Image

- Generated canvas-based image of full palette
- Each color group is on its own row:

  - Row 1: Primary
  - Row 2: Notifications
  - Row 3: Tints (all types)
  - Row 4: Shades (all types)
  - Row 5: Grayscale

- RGB codes displayed below each swatch

---

## 📱 Responsive Design

- Pure CSS utility classes (mimicking Tailwind)
- Mobile-first layout:
  - Grid wraps naturally
  - Font, padding scale down on small screens
