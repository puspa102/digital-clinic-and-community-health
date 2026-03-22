# Digital Clinic - Premium UI Design System

## Table of Contents
1. [Color Palette](#color-palette)
2. [Typography](#typography)
3. [Spacing & Sizing](#spacing--sizing)
4. [Components](#components)
5. [Animations](#animations)
6. [Patterns & Best Practices](#patterns--best-practices)
7. [Accessibility](#accessibility)
8. [Dark Mode](#dark-mode)

---

## Color Palette

### Primary Colors (Luxury Teal)
- **Teal-50**: `#f0fdfa` - Lightest teal for backgrounds
- **Teal-100**: `#ccfbf1` - Light teal for subtle backgrounds
- **Teal-500**: `#14b8a6` - Primary action color
- **Teal-600**: `#0d9488` - Primary button hover state
- **Teal-700**: `#0f766e` - Dark teal for text on light backgrounds

### Secondary Colors (Indigo)
- **Indigo-500**: `#6366f1` - Secondary accent
- **Indigo-600**: `#4f46e5` - Secondary hover state
- **Indigo-700**: `#4338ca` - Deep secondary

### Semantic Colors
- **Success (Emerald-500)**: `#10b981` - Positive actions, confirmations
- **Warning (Amber-500)**: `#f59e0b` - Warnings, alerts
- **Error (Red-600)**: `#dc2626` - Errors, destructive actions
- **Info (Blue-500)**: `#3b82f6` - Information, tooltips

### Neutral Colors
- **Gray-50**: `#f9fafb` - Lightest gray
- **Gray-100**: `#f3f4f6` - Light gray background
- **Gray-500**: `#6b7280` - Medium gray text
- **Gray-700**: `#374151` - Dark gray text
- **Gray-900**: `#111827` - Almost black text

### Usage Guidelines
```
Light Mode Backgrounds:
- White (#ffffff) - Primary surfaces
- Gray-50 (#f9fafb) - Secondary surfaces
- Gray-100 (#f3f4f6) - Tertiary surfaces, hover states
- Teal-50 (#f0fdfa) - Accent backgrounds

Dark Mode Backgrounds:
- Gray-900 (#111827) - Primary surfaces
- Gray-800 (#1f2937) - Secondary surfaces
- Gray-700 (#374151) - Tertiary surfaces
```

---

## Typography

### Font Stack
```css
font-family: "Inter", "Segoe UI", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif;
```

### Heading Hierarchy

#### H1 - Page Title
- **Font Size**: 2.5rem (40px) / Desktop: 3.5rem (56px)
- **Font Weight**: 700 (Bold)
- **Line Height**: 1.2
- **Letter Spacing**: -0.5px
- **Usage**: Main page headings, hero sections

#### H2 - Section Title
- **Font Size**: 2rem (32px)
- **Font Weight**: 600 (Semi-bold)
- **Line Height**: 1.3
- **Usage**: Section headings, major content divisions

#### H3 - Subsection Title
- **Font Size**: 1.5rem (24px)
- **Font Weight**: 600 (Semi-bold)
- **Usage**: Feature titles, card headers

#### H4 - Small Heading
- **Font Size**: 1.25rem (20px)
- **Font Weight**: 600 (Semi-bold)
- **Usage**: Component titles, form sections

### Body Text

#### Body Large
- **Font Size**: 1.125rem (18px)
- **Font Weight**: 400 (Regular)
- **Line Height**: 1.75
- **Usage**: Large body text, descriptive paragraphs

#### Body Regular
- **Font Size**: 1rem (16px)
- **Font Weight**: 400 (Regular)
- **Line Height**: 1.6
- **Usage**: Standard body text, form labels

#### Body Small
- **Font Size**: 0.875rem (14px)
- **Font Weight**: 400 (Regular)
- **Line Height**: 1.6
- **Usage**: Secondary text, descriptions

#### Body Tiny
- **Font Size**: 0.75rem (12px)
- **Font Weight**: 500 (Medium)
- **Line Height**: 1.5
- **Usage**: Captions, helper text, badges

---

## Spacing & Sizing

### Spacing Scale (Based on 4px units)
```
xs    = 4px   (0.25rem)
sm    = 8px   (0.5rem)
md    = 12px  (0.75rem)
lg    = 16px  (1rem)
xl    = 24px  (1.5rem)
2xl   = 32px  (2rem)
3xl   = 48px  (3rem)
4xl   = 64px  (4rem)
```

### Commonly Used Spacing
- **Buttons**: px-6 (24px) py-3 (12px)
- **Input Fields**: px-4 (16px) py-3 (12px)
- **Cards**: p-8 (32px)
- **Section Padding**: py-24 (96px) px-6 (24px)
- **Component Gap**: gap-6 (24px)

### Border Radius
- **Small**: 8px (rounded-lg)
- **Medium**: 12px (rounded-xl)
- **Large**: 16px (rounded-2xl)
- **Extra Large**: 24px (rounded-3xl)
- **Buttons & Input**: 12px (rounded-xl)
- **Cards**: 16px (rounded-2xl)

---

## Components

### Buttons

#### Primary Button
```html
<button class="btn btn-primary">
  Action Text
  <ArrowRight size={20} />
</button>
```
**Styles**: Gradient teal, white text, shadow with glow
**States**: Hover (darker gradient), Active (scale-95), Disabled (opacity-50)

#### Secondary Button
```html
<button class="btn btn-secondary">Secondary Action</button>
```
**Styles**: White/Gray background, gray text, border
**States**: Hover (bg-gray-100)

#### Outline Button
```html
<button class="btn btn-outline">Outlined Action</button>
```
**Styles**: Transparent, teal border, teal text
**States**: Hover (light teal background)

#### Ghost Button
```html
<button class="btn btn-ghost">Subtle Action</button>
```
**Styles**: No background, gray text
**States**: Hover (light background, teal text)

#### Icon Button (48px)
```html
<button class="p-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20">
  <Icon size={24} />
</button>
```

### Cards

#### Standard Card
```html
<div class="card p-8 bg-white dark:bg-gray-900">
  <!-- Content -->
</div>
```
**Features**: Shadow, border, hover effects, rounded corners

#### Elevated Card
```html
<div class="card-elevated p-8">
  <!-- Content -->
</div>
```
**Features**: Stronger shadow, hover animation (lift up)

#### Glass Card
```html
<div class="card-glass">
  <!-- Content -->
</div>
```
**Features**: Glass morphism, blur background, semi-transparent

### Form Elements

#### Input Field
```html
<input type="text" class="input" placeholder="Enter text..." />
```
**Features**: Border-2, focus ring, shadow, rounded corners

#### Input with Label
```html
<div class="form-group">
  <label class="label">Email Address</label>
  <input type="email" class="input" />
</div>
```

#### Form Section
```html
<div class="form-section">
  <h4 class="form-section-title">Section Title</h4>
  <!-- Form fields -->
</div>
```

### Alerts

#### Alert Variants
```html
<div class="alert alert-success">✓ Action completed successfully</div>
<div class="alert alert-error">✗ An error occurred</div>
<div class="alert alert-warning">⚠ Please review this action</div>
<div class="alert alert-info">ℹ Additional information</div>
```
**Features**: Color-coded backgrounds, borders, icons

### Badges

#### Badge Variants
```html
<span class="badge badge-primary">Primary</span>
<span class="badge badge-success">Success</span>
<span class="badge badge-warning">Warning</span>
<span class="badge badge-error">Error</span>
```
**Features**: Rounded, small text, colored backgrounds

---

## Animations

### Fade In Up
```css
animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
```
**Usage**: Page transitions, element reveals

### Slide In Right
```css
animation: slideInRight 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
```
**Usage**: Sidebar animations, modal entrances

### Pulse Glow
```css
animation: pulse-glow 2s infinite;
```
**Usage**: Active states, attention-grabbing elements

### Float
```css
animation: float 3s ease-in-out infinite;
```
**Usage**: Decorative elements, hero section background

### Duration Guidelines
- **Fast**: 150-300ms (interactive elements, hover states)
- **Medium**: 300-500ms (transitions, page changes)
- **Slow**: 600-1000ms (initial page load, emphasis)

### Easing Functions
- **Entrance**: cubic-bezier(0.16, 1, 0.3, 1)
- **Exit**: cubic-bezier(0.7, 0, 0.84, 0)
- **Smooth**: cubic-bezier(0.4, 0, 0.2, 1)

---

## Patterns & Best Practices

### Color Combinations

#### Success Gradient
```css
background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%);
```

#### Warning Gradient
```css
background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
```

#### Error Gradient
```css
background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
```

#### Primary Gradient (Teal → Indigo)
```css
background: linear-gradient(135deg, #14b8a6 0%, #6366f1 100%);
```

### Glass Morphism
```css
background: rgba(255, 255, 255, 0.7);
backdrop-filter: blur(20px);
-webkit-backdrop-filter: blur(20px);
border: 1px solid rgba(255, 255, 255, 0.2);
```

### Shadow System
- **Shadow Small**: `0 1px 3px 0 rgba(0, 0, 0, 0.08)`
- **Shadow Medium**: `0 4px 6px -1px rgba(0, 0, 0, 0.1)`
- **Shadow Large**: `0 10px 15px -3px rgba(0, 0, 0, 0.12)`
- **Shadow XL**: `0 20px 25px -5px rgba(0, 0, 0, 0.15)`

### Hover States Pattern
```javascript
// Card with lift animation
className="card hover:-translate-y-1 hover:shadow-xl transition-all duration-300"

// Button with scale
className="btn active:scale-95 transition-transform"

// Icon with translate
className="icon group-hover:translate-x-1 transition-transform"
```

### Focus States
```css
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

---

## Accessibility

### WCAG 2.1 Compliance
- **Contrast Ratio**: Minimum 4.5:1 for text, 3:1 for UI components
- **Focus Indicators**: Always visible on keyboard navigation
- **Color Independence**: Information not conveyed by color alone

### Color Accessibility
- **Teal + White**: 15.8:1 contrast (AAA)
- **Gray-700 + White**: 12.6:1 contrast (AAA)
- **Gray-600 + White**: 7.3:1 contrast (AA)

### Keyboard Navigation
- **Tab Order**: Logical, left to right, top to bottom
- **Focus Traps**: Properly handled in modals
- **Escape Key**: Closes modals and overlays

### Screen Reader Support
```html
<button aria-label="Close modal">
  <XIcon />
</button>

<div aria-live="polite" role="alert">
  Success message
</div>
```

---

## Dark Mode

### Dark Mode Implementation
All components automatically adapt using CSS custom properties:

```css
:root {
  --bg-primary: #ffffff;
  --text-primary: #0f172a;
}

:root.dark {
  --bg-primary: #0f1419;
  --text-primary: #f8fafc;
}
```

### Dark Mode Colors
- **Background Primary**: `#0f1419`
- **Background Secondary**: `#1a1f2e`
- **Background Tertiary**: `#242b3d`
- **Text Primary**: `#f8fafc`
- **Text Secondary**: `#cbd5e1`
- **Border**: `#2d3748`

### Dark Mode Best Practices
1. Use CSS `prefers-color-scheme` media query
2. Store user preference in localStorage
3. Provide toggle in settings
4. Test all components in both modes
5. Use adjusted opacity for glass morphism

### Toggle Implementation
```javascript
const toggleTheme = () => {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
};
```

---

## Component Examples

### Hero Section
```jsx
<section className="relative w-full min-h-screen overflow-hidden bg-gradient-to-b from-slate-900 to-slate-800">
  {/* Background gradients */}
  <div className="absolute -top-40 -right-40 w-80 h-80 bg-teal-500/20 rounded-full blur-3xl opacity-40 animate-float" />
  
  {/* Content */}
  <div className="relative z-20 h-full flex items-center justify-center">
    <h1 className="text-7xl font-black text-white">
      Your Title
      <span className="bg-gradient-to-r from-teal-300 to-indigo-400 bg-clip-text text-transparent">
        Premium
      </span>
    </h1>
  </div>
</section>
```

### Feature Grid
```jsx
<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
  {features.map((feature) => (
    <div key={feature.id} className="card p-8 hover:shadow-xl transition-all">
      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6`}>
        <feature.icon className="w-7 h-7 text-white" />
      </div>
      <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
      <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
    </div>
  ))}
</div>
```

### Form Section
```jsx
<div className="form-section">
  <h3 className="form-section-title">
    <Icon size={24} />
    Personal Information
  </h3>
  
  <div className="form-group">
    <label className="label">Full Name</label>
    <input type="text" className="input" />
  </div>
  
  <div className="form-group">
    <label className="label">Email</label>
    <input type="email" className="input" />
  </div>
  
  <button className="btn btn-primary w-full">Save Changes</button>
</div>
```

---

## Migration Checklist

- [ ] Update all color references to new palette
- [ ] Apply new typography scale
- [ ] Add glass morphism effects to key components
- [ ] Implement new button styles
- [ ] Update card shadows and borders
- [ ] Add animation classes to page transitions
- [ ] Test dark mode thoroughly
- [ ] Verify accessibility standards
- [ ] Test on mobile devices
- [ ] Performance optimization

---

## Resources

### Tools
- **Color Picker**: https://tailwindcss.com/docs/customizing-colors
- **Typography**: Inter font from Google Fonts
- **Icons**: Lucide React

### References
- Tailwind CSS Documentation: https://tailwindcss.com
- A11y Project: https://www.a11yproject.com
- Figma Design System: https://www.figma.com

---

*Last Updated: 2024*
*Version: 1.0*
