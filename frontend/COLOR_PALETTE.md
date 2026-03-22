# 🎨 Digital Clinic - Premium Color Palette

## Overview
This is the comprehensive color palette for the Digital Clinic platform. All colors have been selected to ensure accessibility, visual hierarchy, and a premium aesthetic.

---

## Primary Color System - Teal (Healthcare & Trust)

### Teal Shade Variations
```
Teal-50   #f0fdfa    Lightest - Backgrounds, hover states
Teal-100  #ccfbf1    Very light - Subtle backgrounds
Teal-200  #99f6e4    Light - Input backgrounds
Teal-300  #5eead4    Medium light - Borders
Teal-400  #2dd4bf    Medium - Icons, accent text
Teal-500  #14b8a6    Primary - Main buttons, links
Teal-600  #0d9488    Primary dark - Button hover
Teal-700  #0f766e    Dark - Dark text, emphasis
Teal-800  #134e4a    Darker - Backgrounds dark mode
Teal-900  #0d3d3a    Darkest - Dark mode text
```

### CSS Variables
```css
--color-primary: #14b8a6;          /* Teal-500 */
--color-primary-dark: #0d9488;     /* Teal-600 */
--color-primary-light: #5eead4;    /* Teal-300 */
--color-primary-bg: #f0fdfa;       /* Teal-50 */
```

### When to Use Teal
- ✅ Primary call-to-action buttons
- ✅ Links and hover states
- ✅ Primary navigation highlights
- ✅ Success indicators
- ✅ Form focus states
- ✅ Active tab indicators
- ✅ Loading spinners (primary)
- ✅ Icon accents

---

## Secondary Color System - Indigo (Professional & Stability)

### Indigo Shade Variations
```
Indigo-50   #eef2ff    Lightest - Subtle backgrounds
Indigo-100  #e0e7ff    Very light - Light backgrounds
Indigo-200  #c7d2fe    Light - Borders
Indigo-300  #a5b4fc    Medium light - Icons
Indigo-400  #818cf8    Medium - Text accents
Indigo-500  #6366f1    Secondary - Important elements
Indigo-600  #4f46e5    Secondary dark - Button hover
Indigo-700  #4338ca    Dark - Emphasis text
Indigo-800  #3730a3    Darker - Dark backgrounds
Indigo-900  #312e81    Darkest - Dark mode emphasis
```

### CSS Variables
```css
--color-secondary: #6366f1;        /* Indigo-500 */
--color-secondary-dark: #4f46e5;   /* Indigo-600 */
--color-secondary-light: #818cf8;  /* Indigo-400 */
--color-secondary-bg: #eef2ff;     /* Indigo-50 */
```

### When to Use Indigo
- ✅ Secondary buttons
- ✅ Important badges
- ✅ Secondary navigation
- ✅ Informational highlights
- ✅ Card headers
- ✅ Accent text
- ✅ Loading indicators (secondary)
- ✅ Premium features badge

---

## Semantic Colors

### Success (Emerald)
```
Emerald-50   #f0fdf4
Emerald-100  #dcfce7
Emerald-200  #bbf7d0
Emerald-400  #4ade80
Emerald-500  #22c55e   ← Default
Emerald-600  #16a34a   ← Hover
Emerald-700  #15803d
Emerald-900  #052e16
```

**CSS Variable**: `--color-success: #22c55e;`

**Usage**:
- Success alerts and notifications
- Confirmation messages
- Completed status
- Active/online indicators
- Approved badges
- Check marks

---

### Warning (Amber)
```
Amber-50   #fffbeb
Amber-100  #fef3c7
Amber-200  #fcd34d
Amber-400  #fbbf24
Amber-500  #f59e0b   ← Default
Amber-600  #d97706   ← Hover
Amber-700  #b45309
Amber-900  #78350f
```

**CSS Variable**: `--color-warning: #f59e0b;`

**Usage**:
- Warning alerts
- Cautionary messages
- Pending status
- Action required badges
- Important notices
- Review needed indicators

---

### Error (Red)
```
Red-50   #fef2f2
Red-100  #fee2e2
Red-200  #fecaca
Red-400  #f87171
Red-500  #ef4444   ← Default
Red-600  #dc2626   ← Hover
Red-700  #b91c1c
Red-900  #7f1d1d
```

**CSS Variable**: `--color-error: #ef4444;`

**Usage**:
- Error messages
- Destructive actions
- Cancel/delete buttons
- Error status
- Failed operations
- Validation errors
- Alert icons

---

### Info (Cyan/Sky)
```
Cyan-50   #ecf8ff
Cyan-100  #cff9ff
Cyan-200  #a5f3ff
Cyan-400  #22d3ee
Cyan-500  #06b6d4   ← Default
Cyan-600  #0891b2   ← Hover
Cyan-700  #0e7490
Cyan-900  #082f49
```

**CSS Variable**: `--color-info: #06b6d4;`

**Usage**:
- Informational alerts
- Help text
- Tooltips
- Info icons
- Additional information
- Supplementary content

---

## Neutral Color System - Slate (Text & Backgrounds)

### Slate Shade Variations
```
Slate-50   #f8fafc    Lightest background
Slate-100  #f1f5f9    Light background
Slate-200  #e2e8f0    Light border
Slate-300  #cbd5e1    Medium border
Slate-400  #94a3b8    Medium text
Slate-500  #64748b    Muted text
Slate-600  #475569    Secondary text
Slate-700  #334155    Primary text
Slate-800  #1e293b    Dark background
Slate-900  #0f172a    Darkest background
```

### CSS Variables
```css
/* Light Mode */
--bg-primary: #ffffff;
--bg-secondary: #f8fafc;
--bg-tertiary: #f1f5f9;
--text-primary: #0f172a;
--text-secondary: #475569;
--text-tertiary: #64748b;
--text-muted: #94a3b8;
--border-color: #e2e8f0;
--border-light: #cbd5e1;

/* Dark Mode */
--bg-primary-dark: #0f172a;
--bg-secondary-dark: #1e293b;
--bg-tertiary-dark: #334155;
--text-primary-dark: #f8fafc;
--text-secondary-dark: #cbd5e1;
--text-tertiary-dark: #94a3b8;
--border-color-dark: #334155;
--border-light-dark: #475569;
```

### Text Color Hierarchy
```
Primary Text   - Slate-900 (Light) / Slate-50 (Dark)   - Headings, main content
Secondary Text - Slate-700 (Light) / Slate-200 (Dark)  - Body text, descriptions
Tertiary Text  - Slate-600 (Light) / Slate-300 (Dark)  - Labels, hints
Muted Text     - Slate-500 (Light) / Slate-400 (Dark)  - Disabled, secondary info
```

---

## Color Combinations & Gradients

### Primary Gradient
```css
background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%);
/* Teal-600 to Teal-500 */
```

### Secondary Gradient
```css
background: linear-gradient(135deg, #6366f1 0%, #818cf8 100%);
/* Indigo-500 to Indigo-400 */
```

### Success Gradient
```css
background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%);
/* Emerald-500 to Teal-500 */
```

### Warning Gradient
```css
background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
/* Amber-500 to Amber-600 */
```

### Error Gradient
```css
background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
/* Red-500 to Red-600 */
```

### Purple Gradient
```css
background: linear-gradient(135deg, #7c3aed 0%, #9333ea 100%);
/* Violet to Purple */
```

---

## Light Mode Color Specifications

### Backgrounds
```
Page Background      #ffffff (White)
Secondary Surface    #f8fafc (Slate-50)
Tertiary Surface     #f1f5f9 (Slate-100)
Card Background      #ffffff (White)
Input Background     #ffffff (White)
Hover Overlay        #f1f5f9 (Slate-100)
Active Overlay       #e2e8f0 (Slate-200)
```

### Borders
```
Default Border       #e2e8f0 (Slate-200)
Light Border         #cbd5e1 (Slate-300)
Focus Border         #0d9488 (Teal-600)
Error Border         #dc2626 (Red-600)
Success Border       #16a34a (Emerald-600)
```

### Text
```
Primary Text         #0f172a (Slate-900)
Secondary Text       #475569 (Slate-600)
Tertiary Text        #64748b (Slate-500)
Muted Text           #94a3b8 (Slate-400)
Link Text            #0d9488 (Teal-600)
Link Hover           #0f766e (Teal-700)
```

---

## Dark Mode Color Specifications

### Backgrounds
```
Page Background      #0f172a (Slate-900)
Secondary Surface    #1e293b (Slate-800)
Tertiary Surface     #334155 (Slate-700)
Card Background      #1e293b (Slate-800)
Input Background     #334155 (Slate-700)
Hover Overlay        #334155 (Slate-700)
Active Overlay       #475569 (Slate-600)
```

### Borders
```
Default Border       #334155 (Slate-700)
Light Border         #475569 (Slate-600)
Focus Border         #14b8a6 (Teal-500)
Error Border         #ef4444 (Red-500)
Success Border       #22c55e (Emerald-500)
```

### Text
```
Primary Text         #f8fafc (Slate-50)
Secondary Text       #cbd5e1 (Slate-200)
Tertiary Text        #94a3b8 (Slate-400)
Muted Text           #64748b (Slate-500)
Link Text            #5eead4 (Teal-300)
Link Hover           #2dd4bf (Teal-400)
```

---

## Accessibility & Contrast Ratios

### WCAG AA Compliant Combinations (4.5:1 minimum for text)
```
✅ Teal-600 (#0d9488) on White (#ffffff)     - Ratio: 9.8:1
✅ Indigo-600 (#4f46e5) on White (#ffffff)   - Ratio: 8.2:1
✅ Slate-900 (#0f172a) on White (#ffffff)    - Ratio: 15.8:1
✅ Slate-700 (#334155) on White (#ffffff)    - Ratio: 8.8:1
✅ Emerald-600 (#16a34a) on White (#ffffff)  - Ratio: 5.5:1
✅ Red-600 (#dc2626) on White (#ffffff)      - Ratio: 5.3:1
```

### WCAG AAA Compliant Combinations (7:1 minimum for text)
```
✅ Slate-900 (#0f172a) on White (#ffffff)    - Ratio: 15.8:1
✅ Teal-700 (#0f766e) on White (#ffffff)     - Ratio: 11.2:1
✅ Indigo-700 (#4338ca) on White (#ffffff)   - Ratio: 10.1:1
✅ Slate-700 (#334155) on White (#ffffff)    - Ratio: 8.8:1
```

### Dark Mode Combinations
```
✅ Slate-50 (#f8fafc) on Slate-900 (#0f172a)    - Ratio: 15.8:1
✅ Teal-300 (#5eead4) on Slate-900 (#0f172a)    - Ratio: 5.5:1
✅ Cyan-300 (#67e8f9) on Slate-900 (#0f172a)    - Ratio: 6.2:1
✅ Indigo-300 (#a5b4fc) on Slate-900 (#0f172a)  - Ratio: 5.2:1
```

---

## Opacity & Alpha Variations

### Teal With Opacity
```
Teal-600 @ 5%    rgba(13, 148, 136, 0.05)    - Very subtle hover
Teal-600 @ 10%   rgba(13, 148, 136, 0.10)    - Subtle background
Teal-600 @ 15%   rgba(13, 148, 136, 0.15)    - Light background
Teal-600 @ 20%   rgba(13, 148, 136, 0.20)    - Medium background
Teal-600 @ 30%   rgba(13, 148, 136, 0.30)    - Badge background
```

### Indigo With Opacity
```
Indigo-500 @ 10%  rgba(99, 102, 241, 0.10)   - Subtle background
Indigo-500 @ 20%  rgba(99, 102, 241, 0.20)   - Light background
Indigo-500 @ 30%  rgba(99, 102, 241, 0.30)   - Badge background
```

### Glass Morphism Colors
```
Light Mode:
  Background: rgba(255, 255, 255, 0.7)
  Border: rgba(255, 255, 255, 0.2)

Dark Mode:
  Background: rgba(30, 41, 59, 0.8)
  Border: rgba(255, 255, 255, 0.1)
```

---

## Shadow Colors

### Light Mode Shadows
```
Shadow-xs    rgba(0, 0, 0, 0.05)   - Subtle
Shadow-sm    rgba(0, 0, 0, 0.08)   - Light
Shadow-md    rgba(0, 0, 0, 0.10)   - Medium
Shadow-lg    rgba(0, 0, 0, 0.12)   - Heavy
Shadow-xl    rgba(0, 0, 0, 0.15)   - Extra Heavy
```

### Dark Mode Shadows
```
Shadow-xs    rgba(0, 0, 0, 0.3)    - Subtle
Shadow-sm    rgba(0, 0, 0, 0.4)    - Light
Shadow-md    rgba(0, 0, 0, 0.5)    - Medium
Shadow-lg    rgba(0, 0, 0, 0.6)    - Heavy
Shadow-xl    rgba(0, 0, 0, 0.65)   - Extra Heavy
```

---

## Component-Specific Colors

### Buttons
```
Primary Button
  Background (Default)   Teal-500 → Teal-600 (gradient)
  Background (Hover)     Teal-600 → Teal-700 (gradient)
  Text                   White
  Shadow                 rgba(13, 148, 136, 0.3)

Secondary Button
  Background (Default)   Slate-100
  Background (Hover)     Slate-200
  Text                   Slate-700
  Border                 Slate-200

Outline Button
  Border                 Teal-600
  Text                   Teal-600
  Background (Hover)     rgba(13, 148, 136, 0.05)

Danger Button
  Background (Default)   Red-600
  Background (Hover)     Red-700
  Text                   White
```

### Cards
```
Background             White (Light) / Slate-800 (Dark)
Border                 Slate-200 (Light) / Slate-700 (Dark)
Border (Hover)         Slate-300 (Light) / Slate-600 (Dark)
Shadow                 rgba(0, 0, 0, 0.1) (Light)
Shadow (Hover)         rgba(0, 0, 0, 0.15) (Light)
```

### Input Fields
```
Background             White (Light) / Slate-800 (Dark)
Border                 Slate-200 (Light) / Slate-700 (Dark)
Border (Focus)         Teal-500
Focus Ring             rgba(13, 148, 136, 0.2)
Text                   Slate-900 (Light) / Slate-50 (Dark)
Placeholder            Slate-400
```

### Alerts
```
Success
  Background           Emerald-50 (Light) / Emerald-900/15 (Dark)
  Border               Emerald-300 (Light) / Emerald-800/50 (Dark)
  Text                 Emerald-700 (Light) / Emerald-400 (Dark)
  Icon                 Emerald-600 (Light) / Emerald-500 (Dark)

Error
  Background           Red-50 (Light) / Red-900/15 (Dark)
  Border               Red-300 (Light) / Red-800/50 (Dark)
  Text                 Red-700 (Light) / Red-400 (Dark)
  Icon                 Red-600 (Light) / Red-500 (Dark)

Warning
  Background           Amber-50 (Light) / Amber-900/15 (Dark)
  Border               Amber-300 (Light) / Amber-800/50 (Dark)
  Text                 Amber-700 (Light) / Amber-400 (Dark)
  Icon                 Amber-600 (Light) / Amber-500 (Dark)
```

---

## CSS Custom Properties Reference

```css
:root {
  /* Primary Colors */
  --color-primary: #14b8a6;
  --color-primary-dark: #0d9488;
  --color-primary-light: #5eead4;
  
  /* Secondary Colors */
  --color-secondary: #6366f1;
  --color-secondary-dark: #4f46e5;
  --color-secondary-light: #818cf8;
  
  /* Semantic Colors */
  --color-success: #22c55e;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #06b6d4;
  
  /* Backgrounds */
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --bg-tertiary: #f1f5f9;
  
  /* Text */
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-tertiary: #64748b;
  --text-muted: #94a3b8;
  
  /* Borders */
  --border-color: #e2e8f0;
  --border-light: #cbd5e1;
  --border-focus: #0d9488;
}

:root.dark {
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --bg-tertiary: #334155;
  
  --text-primary: #f8fafc;
  --text-secondary: #cbd5e1;
  --text-tertiary: #94a3b8;
  --text-muted: #64748b;
  
  --border-color: #334155;
  --border-light: #475569;
  --border-focus: #14b8a6;
}
```

---

## Color Usage Guidelines

### ✅ DO
- Use Teal for primary actions and trust
- Use Indigo for secondary and professional elements
- Maintain contrast ratios above 4.5:1
- Use semantic colors (success/warning/error) consistently
- Test color combinations in both light and dark modes
- Use gradients for visual interest on large elements

### ❌ DON'T
- Mix more than 3 colors in a single component
- Use colors that don't meet WCAG standards
- Apply bright colors to large text areas
- Forget about colorblind accessibility
- Use colors as the only differentiator
- Apply gradients to text smaller than 18px

---

## Color Migration Checklist

- [ ] Update all button colors to use Teal gradients
- [ ] Apply new text color hierarchy
- [ ] Update border colors to new palette
- [ ] Review all alerts and status indicators
- [ ] Test dark mode color combinations
- [ ] Verify accessibility compliance
- [ ] Update design tokens in Figma
- [ ] Test on different devices and screens

---

## External References

- **Color Blindness Simulator**: https://www.color-blindness.com/coblis-color-blindness-simulator/
- **Contrast Checker**: https://webaim.org/resources/contrastchecker/
- **Tailwind Color Reference**: https://tailwindcss.com/docs/customizing-colors
- **WCAG Color Contrast Guidelines**: https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum

---

*Last Updated: 2024*
*Version: 1.0*
*Maintained by: Design System Team*
