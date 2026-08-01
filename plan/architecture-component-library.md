# Component Library & Design System Architecture

## Overview
The ai-checkpoint dashboard has transitioned to a highly modular **Cyber Theme Design System**. This architecture promotes code reusability, dynamic theming, and consistent visual language across all components.

## Core Principles
1. **Dynamic Theming**: All colors are controlled via CSS variables in `index.css` and mapped in `tailwind.config.js`. Avoid hardcoding hex values or specific Tailwind color scales (like `slate-500` or `emerald-400`) in component files.
2. **Atomic Design**: The component library is structured around atomic UI elements (Buttons, Inputs, Badges) that are combined to form complex views (Ledgers, Modals).
3. **Glassmorphism**: The aesthetic relies heavily on translucent backgrounds (`backdrop-blur`), subtle borders (`border-cyber-card-border`), and layered elements.
4. **Monochromatic with Accents**: The base theme is dark monochromatic (`cyber-dark`, `cyber-card`) with a vibrant accent color (`cyber-accent`) for primary actions and highlights.

## Directory Structure
```
dashboard/src/
├── components/
│   ├── library/          # The Component Library showcase view and complex compound components
│   │   ├── ComponentLibrary.jsx
│   │   ├── LedgerTaskCard.jsx
│   │   └── TerminalExecutionFrame.jsx
│   ├── ui/               # Reusable Atomic UI Components
│   │   ├── GlassButton.jsx
│   │   ├── InputField.jsx
│   │   └── StatusBadge.jsx
│   └── ...               # Standard Application Components
```

## Global CSS Variables (`index.css`)
- `--cyber-dark`: Main background color (deepest dark).
- `--cyber-card`: Background for cards and panels.
- `--cyber-card-border`: Border color for panels and inputs.
- `--cyber-accent`: Primary accent color (used for glowing effects, primary buttons, and highlights).
- `--cyber-text-primary`: Main text color (white or near-white).
- `--cyber-text-secondary`: Secondary text color for subtitles and labels.
- `--cyber-text-muted`: Diminished text color for tertiary information.

## Accessing the Component Library
The Component Library dashboard can be accessed via a global keyboard shortcut:
- **Cmd/Ctrl + Shift + L**: Toggles the Component Library view.
This allows developers to instantly preview all available UI components and their states.

## Best Practices for New Components
1. **Use `GlassButton` instead of raw `<button>`**: It provides built-in hover effects, disabled states, and standard sizing.
2. **Apply `glass-card` class**: For any panel or container, use the `.glass-card` utility class defined in `index.css` to ensure consistent background styling and borders.
3. **Animations**: Rely on Framer Motion (`<motion.div>`) for layout transitions and micro-interactions. The design system favors spring physics (`type: 'spring'`) for natural-feeling motion.
