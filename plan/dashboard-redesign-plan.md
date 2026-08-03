# Dashboard Redesign Plan

This document outlines the architectural and design plan to overhaul the Project Dashboard (`ProjectGrid.jsx` and its sub-components) into a cleaner, smarter, and more modern UI.

## Goal Description

The user wants a "beautiful, modern color, clean UI design" for the Project Dashboard (`http://localhost:5173/#/project/:id`). The objective is to make the interface look smart and modern by removing unnecessary colors, optimizing the workflow, and applying a highly polished, minimalist aesthetic (similar to Linear or Apple's pro tools).

## Proposed Changes

We will systematically update the components to use a refined, minimalist styling system.

---

### UI & Styling Layer

#### [MODIFY] `index.css` & `tailwind.config.js`
- **Action**: Refine the `--cyber-*` color palette. We will soften borders (from `white/10` to `white/5`), reduce the opacity of secondary text, and introduce a very subtle glow or glass effect for active elements rather than relying on heavy background colors.
- **Action**: Define a strict "monochrome + one accent" rule to avoid the dashboard looking like a rainbow.

---

### Dashboard Components

#### [MODIFY] `src/components/ProjectGrid.jsx`
- **Action**: Clean up the "4-Metrics HUD". Remove the heavy card backgrounds and replace them with minimalist, borderless metric components separated by subtle dividers, or ultra-thin cards with a soft inner shadow.
- **Action**: Simplify the Segmented Navigation Bar to look like a modern native macOS segmented control.
- **Action**: Improve the spacing (padding/margins) to let the data "breathe".

#### [MODIFY] `src/components/ProjectCard.jsx`
- **Action**: This is the header of the project. We will redesign it to feel more like an "Executive Workspace Header" with clean typography, focusing on the project name, status, and primary actions.

#### [MODIFY] `src/components/GitVisualizer.jsx`
- **Action**: Redesign the git commit nodes to be sleek, using minimalist dots and thin connecting lines instead of bulky icons.

#### [MODIFY] `src/components/ActivityLog.jsx`
- **Action**: Streamline the activity list. Remove unnecessary background boxes from each log item; use a clean timeline approach with subtle timestamps and faded text for non-critical events.
