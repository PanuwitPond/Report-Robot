# CSS Theme System Documentation

## Overview

This document describes the comprehensive CSS theme system implemented for the Report-Robot application. The system is built on CSS custom properties (variables) to ensure consistency, maintainability, and easy theming across the entire application.

## Design Tokens

### 1. Color System

The color system is organized in layers:

#### Base Colors
- **Primary**: Used for main actions and highlights (`--color-primary-*`)
- **Secondary**: Used for success states (`--color-secondary-*`)
- **Danger**: Used for destructive actions (`--color-danger-*`)
- **Warning**: Used for alerts and warnings (`--color-warning-*`)
- **Success**: Used for successful completions (`--color-success-*`)
- **Info**: Used for informational elements (`--color-info-*`)
- **Neutral**: Grays for text and backgrounds (`--color-neutral-*`)

Each color has 10 variants (50-900) from lightest to darkest.

#### Semantic Colors
These are context-aware colors that change based on light/dark mode:
- `--color-bg-primary`: Main background color
- `--color-bg-secondary`: Secondary background (cards)
- `--color-bg-tertiary`: Tertiary background
- `--color-bg-hover`: Hover state background
- `--color-bg-disabled`: Disabled state background
- `--color-text-primary`: Main text color
- `--color-text-secondary`: Secondary text
- `--color-text-tertiary`: Tertiary text
- `--color-text-disabled`: Disabled text
- `--color-text-inverse`: Inverse text (on colored backgrounds)
- `--color-border-light`: Light borders
- `--color-border-medium`: Medium borders
- `--color-border-dark`: Dark borders

### 2. Typography

#### Font Families
```css
--font-family-base: System fonts (Segoe UI, Roboto, etc.)
--font-family-mono: Monospace fonts (Courier New, Menlo, etc.)
```

#### Font Sizes
```
--font-size-xs:  0.75rem  (12px)
--font-size-sm:  0.875rem (14px)
--font-size-base: 1rem    (16px)
--font-size-lg:  1.125rem (18px)
--font-size-xl:  1.25rem  (20px)
--font-size-2xl: 1.5rem   (24px)
--font-size-3xl: 1.875rem (30px)
--font-size-4xl: 2.25rem  (36px)
--font-size-5xl: 3rem     (48px)
```

#### Font Weights
```
--font-weight-light: 300
--font-weight-normal: 400
--font-weight-medium: 500
--font-weight-semibold: 600
--font-weight-bold: 700
--font-weight-extrabold: 800
```

#### Line Heights
```
--line-height-tight: 1.2
--line-height-normal: 1.5
--line-height-relaxed: 1.75
--line-height-loose: 2
```

### 3. Spacing Scale

```css
--spacing-1: 0.25rem  (4px)
--spacing-2: 0.5rem   (8px)
--spacing-3: 0.75rem  (12px)
--spacing-4: 1rem     (16px)
--spacing-5: 1.25rem  (20px)
--spacing-6: 1.5rem   (24px)
--spacing-8: 2rem     (32px)
--spacing-10: 2.5rem  (40px)
--spacing-12: 3rem    (48px)
--spacing-16: 4rem    (64px)
--spacing-20: 5rem    (80px)
--spacing-24: 6rem    (96px)
```

### 4. Border Radius

```css
--radius-none: 0
--radius-sm: 0.25rem   (4px)
--radius-base: 0.375rem (6px)
--radius-md: 0.5rem    (8px)
--radius-lg: 0.75rem   (12px)
--radius-xl: 1rem      (16px)
--radius-2xl: 1.5rem   (24px)
--radius-full: 9999px  (fully rounded)
```

### 5. Shadows

```css
--shadow-xs: 0 1px 2px 0 rgba(0,0,0,0.05)
--shadow-sm: 0 1px 2px 0 rgba(0,0,0,0.1)
--shadow-md: 0 4px 6px -1px rgba(0,0,0,0.1)
--shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.1)
--shadow-xl: 0 20px 25px -5px rgba(0,0,0,0.1)
--shadow-2xl: 0 25px 50px -12px rgba(0,0,0,0.15)
```

### 6. Transitions

```css
--transition-fast: 150ms ease-in-out
--transition-normal: 250ms ease-in-out
--transition-slow: 350ms ease-in-out
```

### 7. Z-Index Scale

```css
--z-hide: -1
--z-base: 0
--z-dropdown: 1000
--z-sticky: 1020
--z-modal-backdrop: 1040
--z-modal: 1050
--z-popover: 1060
--z-tooltip: 1070
```

## Component Tokens

Component-specific tokens are predefined for common patterns:

### Buttons
```css
--btn-padding-xs: 0.5rem 0.75rem
--btn-padding-sm: 0.5rem 1rem
--btn-padding-md: 0.5rem 1rem
--btn-padding-lg: 0.75rem 1.5rem
--btn-height-sm: 2rem
--btn-height-md: 2.5rem
--btn-height-lg: 3rem
--btn-border-radius: 0.5rem
--btn-font-weight: 600
--btn-transition: all 150ms ease-in-out
```

### Inputs
```css
--input-padding: 0.5rem 0.75rem
--input-height: 2.5rem
--input-border-radius: 0.5rem
--input-border-width: 1px
--input-border-color: #e5e7eb
--input-bg: #ffffff
--input-text-color: #1a1a1a
--input-placeholder-color: #999999
--input-focus-border-color: #667eea
--input-focus-shadow: 0 0 0 3px rgba(102,126,234,0.1)
--input-transition: all 150ms ease-in-out
```

### Cards
```css
--card-padding: 1.5rem
--card-border-radius: 0.75rem
--card-border-color: #e5e7eb
--card-shadow: 0 1px 3px rgba(0,0,0,0.1)
--card-bg: #ffffff
```

### Tables
```css
--table-border-color: #e5e7eb
--table-header-bg: #f9fafb
--table-row-hover-bg: #eff6ff
--table-padding: 0.75rem 1rem
```

## Dark Mode Support

The theme system includes automatic dark mode support using the `@media (prefers-color-scheme: dark)` query.

All semantic colors automatically adjust in dark mode:

```css
@media (prefers-color-scheme: dark) {
    :root {
        --color-bg-primary: #1f2937;
        --color-bg-secondary: #111827;
        --color-text-primary: #f9fafb;
        --color-text-secondary: #d1d5db;
        /* ... and more */
    }
}
```

Users' system preferences are automatically respected without any additional code needed.

## Usage Examples

### Basic Usage

```css
/* Old way (hardcoded colors) */
.button {
    background: #667eea;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    font-weight: 500;
}

/* New way (using theme variables) */
.button {
    background: var(--color-primary-500);
    color: var(--color-text-inverse);
    padding: var(--btn-padding-md);
    border-radius: var(--btn-border-radius);
    font-weight: var(--btn-font-weight);
}
```

### Component-Specific Usage

```css
.card {
    background: var(--card-bg);
    padding: var(--card-padding);
    border-radius: var(--card-border-radius);
    border: 1px solid var(--card-border-color);
    box-shadow: var(--card-shadow);
}

.input {
    padding: var(--input-padding);
    height: var(--input-height);
    border: var(--input-border-width) solid var(--input-border-color);
    border-radius: var(--input-border-radius);
    background: var(--input-bg);
}

.input:focus {
    outline: none;
    border-color: var(--input-focus-border-color);
    box-shadow: var(--input-focus-shadow);
}
```

### Responsive with Theme Variables

```css
.layout {
    padding: var(--spacing-4);  /* 16px */
}

@media (min-width: 768px) {
    .layout {
        padding: var(--spacing-8);  /* 32px */
    }
}
```

## Animations

Predefined animations are available for common transitions:

```css
@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes slideInUp {
    from { transform: translateY(10px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}

@keyframes slideInDown {
    from { transform: translateY(-10px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}

@keyframes slideInLeft {
    from { transform: translateX(-10px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

@keyframes slideInRight {
    from { transform: translateX(10px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}
```

Usage:
```css
.element {
    animation: fadeIn var(--transition-normal);
}

.loading {
    animation: spin 1s linear infinite;
}
```

## Best Practices

### 1. Always Use Variables
Never hardcode color values or spacing. Always use the CSS variables for consistency.

```css
/* ✅ Good */
.button {
    background: var(--color-primary-500);
    padding: var(--spacing-4);
}

/* ❌ Bad */
.button {
    background: #667eea;
    padding: 16px;
}
```

### 2. Use Semantic Colors for Context
Use semantic colors for UI elements that have meaning:

```css
/* ✅ Good - User understands this is a danger zone */
.delete-button {
    background: var(--color-danger-500);
}

/* ❌ Bad - Color intent is unclear */
.delete-button {
    background: var(--color-neutral-600);
}
```

### 3. Use Component Tokens
For common components, use the predefined component tokens:

```css
/* ✅ Good */
.input {
    padding: var(--input-padding);
    height: var(--input-height);
    border: var(--input-border-width) solid var(--input-border-color);
}

/* Less consistent */
.input {
    padding: 0.5rem 0.75rem;
    height: 2.5rem;
    border: 1px solid #e5e7eb;
}
```

### 4. Respect User Preferences
The dark mode support is automatic. Test components in both light and dark modes.

### 5. Use Transitions for Interactivity
Apply transitions to interactive elements:

```css
.button {
    transition: var(--btn-transition);
}

.button:hover {
    background: var(--color-primary-600);
}
```

### 6. Color Accessibility
When choosing colors, ensure sufficient contrast:
- Text on background: minimum 4.5:1 ratio
- Large text: minimum 3:1 ratio
- Interactive elements: minimum 3:1 ratio

## Migration Guide

To migrate existing CSS to use theme variables:

1. Identify all hardcoded color values
2. Map them to the closest theme color
3. Replace with `var(--color-name)`
4. Verify the component looks correct in both light and dark modes
5. Test on actual devices/browsers

Example:
```css
/* Before */
.header {
    background: #1f2937;
    color: #ffffff;
    padding: 16px 24px;
    border-bottom: 1px solid #e5e7eb;
}

/* After */
.header {
    background: var(--color-neutral-800);
    color: var(--color-text-inverse);
    padding: var(--spacing-4) var(--spacing-6);
    border-bottom: 1px solid var(--color-border-light);
}
```

## Future Enhancements

- [ ] TypeScript theme types for better IDE support
- [ ] SCSS/LESS mixins for advanced theming
- [ ] Storybook integration for component showcase
- [ ] Theme customization API for users
- [ ] CSS-in-JS support if needed
