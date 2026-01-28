# NUWRRRLD Landing Page - Figma Creation Prompt

## MASTER PROMPT FOR FIGMA DESIGN

Copy and paste this entire section into your browser chat with Claude, ChatGPT, or any design AI tool:

---

## INSTRUCTION: CREATE COMPLETE FIGMA DESIGN FOR NUWRRRLD LANDING PAGE

### PROJECT OVERVIEW

I need you to create a comprehensive Figma design file for a cyberpunk-themed 3D web landing page called "NUWRRRLD". The actual site is built with Next.js + Three.js, and I need a 2D design representation showing the layout, components, and visual system.

### DESIGN SCOPE

**File Name:** NUWRRRLD Landing Page Design
**Page Count:** 4-5 pages
**Device Focus:** Responsive (Mobile, Tablet, Desktop)
**Design Style:** Cyberpunk industrial with neon accents

---

## PAGE STRUCTURE

Create the following Figma pages in order:

### PAGE 1: DESIGN SYSTEM

#### Color Palette (Create a color styles library)
```
Primary Cyan: #00ffff (RGB: 0, 255, 255)
Primary Magenta: #ff00ff (RGB: 255, 0, 255)
Neon Green: #00ff88 (RGB: 0, 255, 136)
Amber: #ffaa00 (RGB: 255, 170, 0)
Dark Navy: #050508 (RGB: 5, 5, 8)
Dark Navy Alt: #0a0a15 (RGB: 10, 10, 21)
Deep Purple: #1a0033 (RGB: 26, 0, 51)
Dark Gray: #1a1a2e (RGB: 26, 26, 46)
White: #ffffff (RGB: 255, 255, 255)
Text Secondary: #00ffff with 60% opacity
```

#### Typography Styles (Create text styles)
- **Hero Title**: 72px, Bold, Monospace, White, Letter-spacing 0.15em
- **Large Heading**: 48px, Bold, Monospace, White
- **Body Text**: 16px, Regular, Monospace, White
- **Label Text**: 14px, Regular, Monospace, Cyan (#00ffff)
- **Small Text**: 12px, Regular, Monospace, White

#### Effects Library (Create components for reuse)
1. **Glow Box - Cyan**: Drop shadow 0px 0px 20px rgba(0, 255, 255, 0.8)
2. **Glow Box - Magenta**: Drop shadow 0px 0px 20px rgba(255, 0, 255, 0.8)
3. **Scanline Overlay**: Thin horizontal lines at 3px intervals, 8% opacity, blend mode: Overlay
4. **Neon Frame**: 4px stroke with gradient from Cyan to Magenta

---

### PAGE 2: COMPONENT LIBRARY

Create these reusable components:

#### Component: CANVAS FRAME

**Purpose:** Container for the 3D scene
**Dimensions:** 1200px × 700px (base size, responsive)

**Properties:**
- Background: Dark Navy (#050508)
- Border-radius: 12px
- Border: 4px, Gradient (Cyan → Magenta)
- Drop shadow: 0px 0px 40px rgba(0, 255, 255, 0.3), 0px 0px 20px rgba(255, 0, 255, 0.2)
- Inner shadow: Inset 0px 0px 20px rgba(0, 0, 0, 0.8)

**Content Layout:**
- Add rectangle shape 1200×700 with dark navy background
- Add gradient border (cyan to magenta)
- Add text in center: "3D Scene Preview"
  - Style: Center-aligned, 28px, Cyan color
  - This represents where the Three.js canvas will render
- Create group called "Canvas_Content" and apply all to it

**Internal Elements (within canvas):**
1. **Left Side Buildings** (20% width, height 60%)
   - Create vertical rectangles varying heights 60-120px
   - Color: Dark Gray with thin cyan lines for windows
   - Stack multiple rectangles with 8px gaps
   - Position: Left side, starting at 100px from top

2. **Center 3 Media Screens** (60% width, height 100%)
   - **Screen 1 (Top)**
     - Position: Center-top
     - Size: 500×300px
     - Border: 3px Cyan glow frame
     - Content: Rectangle with gradient fill (dark to lighter)
     - Label "SURVEILLANCE NODE" in green (#00ff88), glow effect
     - Position label on left side, rotated 90 degrees

   - **Screen 2 (Middle)**
     - Position: Center
     - Size: 450×270px
     - Border: 3px Magenta glow frame
     - Content: Black rectangle with center play icon
     - Label "LIVE FEED" in cyan (#00ffff), pulsing effect
     - Position label on right side

   - **Screen 3 (Bottom)**
     - Position: Center-bottom
     - Size: 480×290px
     - Border: 3px Magenta glow frame
     - Content: Rectangle with image placeholder
     - Label "PROJECT ALPHA" in magenta (#ff00ff), glow effect
     - Position label on right side

3. **Right Side Buildings** (20% width, height 60%)
   - Mirror of left side buildings
   - Create vertical rectangles with 8px gaps
   - Color: Dark Gray with magenta window highlights
   - Position: Right side

4. **Flying Ships** (scattered throughout)
   - Create 5-8 small geometric shapes representing ships
   - Colors: Various (cyan, magenta, green outlines)
   - Sizes: 40-80px across
   - Position scattered in background at various depths
   - Use angular shapes to suggest sci-fi vessels

5. **Particle Effect Area**
   - Add light blue dots/lines scattered throughout
   - Opacity: 30-40%
   - Suggest falling rain particle effect with diagonal lines

6. **Neon Signs** (4 scattered elements)
   - Create geometric neon shapes:
     * Horizontal line (cyan) - left side
     * Cross/plus shape (magenta) - right side
     * Small boxes (green) - scattered
     * Angular lines (amber) - top area
   - Add glow effects to each

---

#### Component: HEADER OVERLAY

**Dimensions:** 1200px × 100px

**Content:**
- Background: Transparent (overlays)
- Text: "NUWRRRLD"
  - Font: 72px, Bold, Monospace, White
  - Letter-spacing: 0.15em
  - Apply gradient fill: Cyan (#00ffff) → Magenta (#ff00ff) → Cyan
  - Add drop shadow: 0px 0px 30px rgba(0, 255, 255, 0.6)
  - Center align horizontally
  - Position: Top center

**Note:** Add annotation "Animated shimmer effect - 3 second loop"

---

#### Component: FOOTER OVERLAY

**Dimensions:** 1200px × 80px

**Content:**
- Background: Transparent
- Text: "Drag to orbit • Scroll to zoom"
  - Font: 16px, Regular, Monospace, Cyan (#00ffff)
  - Letter-spacing: 0.05em
  - Add drop shadow with glow: 0px 0px 20px rgba(0, 255, 255, 0.8)
  - Center align horizontally
  - Position: Bottom center
  - Add annotation: "Pulsing glow effect - 2 second loop"

---

#### Component: MEDIA SCREEN PANEL

**Dimensions:** 120px × 200px (variable)

**Content:**
- Background: Transparent with colored tint overlay (20% opacity)
- Text label: Monospace, 12px, Bold
- Glow effect matching label color
- Corner radius: 4px

**Variants:**
1. **Green Panel** - For "SURVEILLANCE NODE"
   - Text color: Neon Green (#00ff88)
   - Glow: Green

2. **Cyan Panel** - For "LIVE FEED"
   - Text color: Cyan (#00ffff)
   - Glow: Cyan

3. **Magenta Panel** - For "PROJECT ALPHA"
   - Text color: Magenta (#ff00ff)
   - Glow: Magenta

---

### PAGE 3: LANDING PAGE - DESKTOP (1440px)

**Canvas Size:** 1440×900

**Layout Structure:**

```
┌─────────────────────────────────────────────────────┐
│  HEADER (1440px × 100px)                            │
│  "NUWRRRLD" (Centered, Animated Shimmer)            │
├─────────────────────────────────────────────────────┤
│                                                     │
│  CANVAS FRAME (1280px × 700px)                     │
│  (Centered with 80px margin)                        │
│  - Shows 3D scene representation                    │
│  - Glow border (cyan-magenta gradient)              │
│  - Rounded corners (18px)                           │
│  - Contains all environment elements                │
│                                                     │
├─────────────────────────────────────────────────────┤
│  FOOTER (1440px × 80px)                             │
│  "Drag to orbit • Scroll to zoom" (Centered)        │
└─────────────────────────────────────────────────────┘
```

**Build Instructions:**

1. Create frame 1440×900, name it "Desktop - 1440px"
2. Add background: Dark Navy (#050508)
3. Place Header Overlay at top (0, 0)
4. Place Canvas Frame centered (80px margin, ~170px from top)
5. Place Footer Overlay at bottom (0, 820px)
6. Group all elements into "Landing Page" group
7. Add annotation: "All spacing is responsive - adjust margins for other breakpoints"

---

### PAGE 4: LANDING PAGE - TABLET (768px)

**Canvas Size:** 768×1000

**Layout Structure:** Same as desktop but responsive

**Build Instructions:**

1. Create frame 768×1000, name it "Tablet - 768px"
2. Add background: Dark Navy (#050508)
3. Place Header Overlay at top, adjust width to 100%
4. Place Canvas Frame centered with 20px margin
5. Adjust Canvas Frame to fit: (728px width × 600px height)
6. Place Footer Overlay at bottom
7. Update typography sizes:
   - Hero title: 56px
   - Body text: 14px
   - Label text: 12px

---

### PAGE 5: LANDING PAGE - MOBILE (375px)

**Canvas Size:** 375×812

**Layout Structure:** Stacked vertical

**Build Instructions:**

1. Create frame 375×812, name it "Mobile - 375px"
2. Add background: Dark Navy (#050508)
3. Place Header Overlay, reduce width to 100%, height 80px
4. Place Canvas Frame: 335px width × 480px height (centered, 20px margin)
5. Place Footer Overlay at bottom: 335px width, 70px height
6. Update typography:
   - Hero title: 36px
   - Body text: 12px
   - Label text: 11px
7. Add annotation: "Portrait orientation, all content vertically stacked"

---

## DETAILED SPECIFICATIONS

### Canvas Frame Content - Advanced Details

#### Left Building Column
- 6-8 rectangles varying heights
- Heights: 60px, 75px, 90px, 110px, 95px, 80px, 70px, 85px
- Width: Each 30px
- Gap between: 8px
- Colors:
  - Fill: Dark Gray (#1a1a2e)
  - Outline: 1px Cyan (#00ffff) or Magenta (#ff00ff)
- Add small cyan/magenta dots (3-5 per building) to represent windows
- Position: X = 40px, Y = 80px

#### Center Screen Stack Precise Positioning
- **Top Screen:**
  - X: 350px (center-ish)
  - Y: 50px
  - W: 500px
  - H: 300px
  - Border: 3px, Gradient (Cyan → Cyan)
  - Green label on left: "SURVEILLANCE NODE"

- **Middle Screen:**
  - X: 375px (slightly right)
  - Y: 250px
  - W: 450px
  - H: 270px
  - Border: 3px, Gradient (Magenta → Cyan)
  - Cyan label on right: "LIVE FEED"

- **Bottom Screen:**
  - X: 360px (center)
  - Y: 460px
  - W: 480px
  - H: 290px
  - Border: 3px, Gradient (Magenta → Magenta)
  - Magenta label on right: "PROJECT ALPHA"

#### Right Building Column
- Mirror of left column but positioned on right side
- Position: X = 1130px, Y = 80px

#### Flying Ships (8 total)
- **Ship 1:** 50×30px, Position (200, 150), Color: Cyan outline
- **Ship 2:** 45×25px, Position (900, 120), Color: Magenta outline
- **Ship 3:** 55×35px, Position (600, 200), Color: Green outline
- **Ship 4:** 40×20px, Position (300, 350), Color: Cyan fill, 40% opacity
- **Ship 5:** 60×40px, Position (1000, 250), Color: Magenta fill, 40% opacity
- **Ship 6:** 35×25px, Position (400, 500), Color: Green outline
- **Ship 7:** 50×30px, Position (1050, 450), Color: Amber outline
- **Ship 8:** 45×35px, Position (150, 400), Color: Purple fill, 40% opacity

#### Neon Signs (4 elements)
- **Horizontal Line 1:** 120px × 2px, Position (250, 300), Color: Cyan, Glow: Cyan
- **Cross Shape:** 60px × 60px, Position (950, 350), Color: Magenta outline, Glow: Magenta
- **Small Boxes:** 3 boxes 20×20px each, Positions scattered, Colors: Green, Glow: Green
- **Angular Lines:** 3 lines at 45-degree angles, Colors: Amber, Glow: Amber

#### Particle/Rain Effect
- Create 40-50 thin diagonal lines (1px × 15px)
- Color: Cyan (#00ffff)
- Opacity: 30%
- Scattered throughout canvas at various positions
- Angle: ~30 degrees (suggest falling rain)

---

## ANIMATION ANNOTATIONS

Add text annotations for these animations in the canvas:

1. **Hero Title Animation:**
   ```
   Animation: Shimmer
   Duration: 3 seconds
   Loop: Infinite
   Effect: Gradient color shift
   Colors: White → Cyan → Magenta → Cyan → White
   Easing: Ease-in-out
   ```

2. **Screen Glow Animation:**
   ```
   Animation: Pulse Glow
   Duration: 2 seconds
   Loop: Infinite
   Effect: Box-shadow expansion/contraction
   Start: 0px 0px 20px
   Peak: 0px 0px 40px
   Easing: Sine wave
   ```

3. **Footer Text Animation:**
   ```
   Animation: Pulse
   Duration: 2 seconds
   Loop: Infinite
   Effect: Opacity change
   Range: 60% → 100% → 60%
   Easing: Ease-in-out
   ```

4. **Neon Signs Animation:**
   ```
   Animation: Flicker
   Duration: 0.1-0.3s (varies per sign)
   Loop: Infinite
   Effect: Random brightness changes
   Range: 50-100% opacity
   ```

---

## COLOR USAGE GUIDE

| Element | Color | Usage |
|---------|-------|-------|
| Canvas Background | Dark Navy (#050508) | Base background |
| Canvas Border | Cyan → Magenta | Gradient frame |
| Screen 1 Frame | Cyan (#00ffff) | Top screen glow |
| Screen 1 Label | Neon Green (#00ff88) | Text glow |
| Screen 2 Frame | Magenta/Cyan | Middle screen mix |
| Screen 2 Label | Cyan (#00ffff) | Text glow |
| Screen 3 Frame | Magenta (#ff00ff) | Bottom screen glow |
| Screen 3 Label | Magenta (#ff00ff) | Text glow |
| Building Windows | Cyan/Magenta | Small accent lights |
| Ships | Mixed (see specs) | Various outlines/fills |
| Neon Signs | Cyan/Magenta/Green/Amber | Scattered accents |
| Text - Hero | White with gradient | Hero title |
| Text - Body | Cyan with glow | Primary text |
| Text - Instruction | Cyan with glow | Secondary text |

---

## FINAL CHECKLIST

Before finalizing, ensure:

- [ ] All colors match hex codes exactly
- [ ] Monospace font is used throughout
- [ ] All glows have proper opacity and blur
- [ ] Responsive frames are created for all breakpoints
- [ ] Component library is organized and reusable
- [ ] Animation notes are clear and detailed
- [ ] Color styles are created for consistency
- [ ] Text styles are applied globally
- [ ] Shadows and glows follow cyberpunk aesthetic
- [ ] All elements have proper naming conventions
- [ ] Groups are organized hierarchically
- [ ] Design system page is complete
- [ ] At least 3 layout breakpoints are created

---

## DESIGN SYSTEM RULES

1. **Consistency**: Use color styles and text styles throughout
2. **Hierarchy**: Use glow intensity to show emphasis
3. **Alignment**: Center all major elements with consistent gutters
4. **Spacing**: Use 8px, 16px, 20px, 40px as spacing units
5. **Responsiveness**: Scale elements proportionally for different breakpoints
6. **Cyberpunk Aesthetic**: Emphasize neon glows, dark backgrounds, industrial shapes
7. **Performance**: Group elements logically for easy component reuse

---

## NOTES FOR DESIGNER

- This is a 2D representation of a 3D web experience
- The canvas area shows what a Three.js 3D scene looks like at runtime
- The layout is responsive and adapts to mobile/tablet/desktop
- All animations are decorative and enhance the cyberpunk feel
- Actual colors should match provided hex codes for brand consistency
- The design can be exported for developer handoff with measurements
- Consider creating interactive prototypes showing animation states

---

END OF MASTER PROMPT
