# Nexla Data Flow Architect - Project Plan & Proposal

## Executive Summary

This document outlines a comprehensive plan for developing a conversational data integration platform where users can describe data pipelines in natural language and visualize them as interactive flow diagrams. The project emphasizes modern frontend development practices with React, TypeScript, and Tailwind CSS.

---

## 1. Requirements Analysis

### 1.1 Functional Requirements

#### Core Features:

1. **Landing Page**
   - Hero section with compelling value proposition
   - Large input field for natural language data flow descriptions
   - Pre-defined example prompt buttons for common scenarios
   - Dark/light theme toggle
   - Mobile-responsive design

2. **Chat Interface**
   - Clean message bubble UI with distinct user/AI styling
   - Real-time input field with send button
   - Loading states during AI response generation
   - Auto-scroll functionality for new messages
   - AI clarifying questions capability

3. **Visual Canvas**
   - Split-pane layout (chat + canvas)
   - Interactive flow diagram with three node types:
     - **Source nodes** (databases, APIs) - Blue theme
     - **Transform nodes** (data processing) - Purple theme
     - **Destination nodes** (warehouses, APIs) - Green theme
   - Dynamic node status indicators:
     - Pending (orange) → Partial (blue) → Complete (green) → Error (red)
   - Properties panel for configuration details

4. **Navigation & State Management**
   - Seamless routing between landing page and chat interface
   - Persistent conversation and canvas state
   - Theme preference persistence

#### User Flow:

1. User enters natural language description (e.g., "Connect Shopify orders to Snowflake")
2. System navigates to chat interface
3. AI asks clarifying questions ("What's your Shopify store URL?", "Which data fields?")
4. Canvas dynamically displays: [Shopify] → [Transform] → [Snowflake]
5. Node statuses update as user provides details

### 1.2 Technical Stack Requirements

- **Frontend Framework**: React 18+ with hooks and functional components
- **Language**: TypeScript (strict typing, avoid `any` types)
- **Styling**: Tailwind CSS for utility-first styling
- **Routing**: React Router for navigation
- **State Management**: Context API or Zustand
- **Icons**: Lucide React icon library

---

## 2. Visual Architecture & User Interface Design

Note: This section now references production-ready SVG diagrams suitable for development handoff. ASCII wireframes have been removed for clarity.

- Visual Architecture: images/visual-architecture.svg
- Landing Page Wireframe: images/landing-page-wireframe.svg
- Chat Interface: images/chat-interface.svg
- Visual Canvas: images/visual-canvas.svg
- Interaction Flows: images/interaction-flows.svg
- Atomic Architecture: images/atomic-architecture.svg
- Tailwind Components Cheatsheet: images/tailwind-components-cheatsheet.svg

### 2.1 Tailwind reusable component references

- Button (base): inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2
- Button (primary): bg-blue-600 text-white hover:bg-blue-500 focus:ring-blue-600
- Input: block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500
- Card: rounded-xl border border-slate-200 bg-white p-4 shadow-sm
- Chat shell: grid h-dvh grid-rows-[auto_1fr_auto]
- Canvas shell: grid gap-4 lg:grid-cols-[200px_minmax(0,1fr)_260px]
- Landing grid: grid gap-6 sm:grid-cols-2 lg:grid-cols-3
- Container: mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-2xl

---

### 2.2 Visual Architecture (SVG)

![Visual Architecture](images/visual-architecture.svg)

### 2.3 Landing Page

Reference (inspiration only): `Nexla Take-Home Assignment_ Data Flow Architect.md` → Landing Page example

Design goals incorporated into our SVG wireframe:

- Prominent hero with brand, tagline, and gradient header
- Central “prompt input” with Start action
- Four example prompt buttons matching assignment examples
  ![Landing Page — Reference](Pasted%20image%2020250912103355.png)

### 2.4 Chat Interface

Reference (inspiration only): `Nexla Take-Home Assignment_ Data Flow Architect.md` → Chat Interface example

Design goals incorporated into our SVG wireframe:

- Clean user/AI bubble styling with timestamps
- Input bar with send, attachment, voice (mobile-friendly)
- Space reserved for clarifying questions and quick actions

![Chat Interface — Reference](Pasted%20image%2020250912103431.png)

### 2.5 Visual Canvas & Flow Builder (SVG)

![Visual Canvas](images/visual-canvas.svg)

### 2.6 Mobile Interface Design

- Covered across SVGs with mobile-first layouts; see Tailwind component references

### 2.7 Interaction Flows (SVG)

<img src="./images/interaction-flows.svg" alt="Interaction Flows" width="1200" />

### 2.8 Atomic Architecture (SVG)

![Atomic Architecture](images/atomic-architecture.svg)

### 2.9 Tailwind Components Cheatsheet (SVG)

![Tailwind Components Cheatsheet](images/tailwind-components-cheatsheet.svg)

### 2.10 Interaction Specs (refined)

- Chat: auto-scroll on new AI messages, typing indicator, quick actions, retry on failure
- Canvas: drag nodes, snap to grid, port-to-port connect with validation, minimap, zoom/pan
- Keyboard: tab/focus rings, ESC to close panels, Enter to send, Space to pan (canvas)
- A11y: ARIA roles for chat log, live regions for new messages, descriptive labels

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        ATOMIC DESIGN HIERARCHY                              │
└─────────────────────────────────────────────────────────────────────────────┘

ATOMS (Foundation Components)
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│ Button  │ │ Input   │ │ Icon    │ │ Badge   │ │ Avatar  │
│ ┌─────┐ │ │ ┌─────┐ │ │ ┌─────┐ │ │ ┌─────┐ │ │ ┌─────┐ │
│ │ sm  │ │ │ │text │ │ │ │ ⚡  │ │ │ │ NEW │ │ │ │ 👤  │ │
│ │ md  │ │ │ │email│ │ │ │ 🔗  │ │ │ │ ⚠️  │ │ │ │ AI  │ │
│ │ lg  │ │ │ │pass │ │ │ │ ⚙️  │ │ │ │ ✅  │ │ │ │ USR │ │
│ └─────┘ │ │ └─────┘ │ │ └─────┘ │ │ └─────┘ │ │ └─────┘ │
└─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘

MOLECULES (Component Groups)
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ Message Bubble  │ │ Form Group      │ │ Node Card       │
│ ┌─────────────┐ │ │ ┌─────────────┐ │ │ ┌─────────────┐ │
│ │ Avatar      │ │ │ │ Label       │ │ │ │ Icon + Type │ │
│ │ + Content   │ │ │ │ + Input     │ │ │ │ + Title     │ │
│ │ + Timestamp │ │ │ │ + Help Text │ │ │ │ + Status    │ │
│ └─────────────┘ │ │ └─────────────┘ │ │ └─────────────┘ │
└─────────────────┘ └─────────────────┘ └─────────────────┘

ORGANISMS (Complex Components)
┌─────────────────────────────────────────────────────────────────────────────┐
│                          CHAT INTERFACE ORGANISM                            │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │                         Message History                                 │ │
│ │ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐           │ │
│ │ │ User Message    │ │ AI Response     │ │ User Message    │           │ │
│ │ │ Bubble          │ │ Bubble          │ │ Bubble          │           │ │
│ │ └─────────────────┘ └─────────────────┘ └─────────────────┘           │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │                         Input Interface                                 │ │
│ │ ┌─────────────────────────────────────┐ ┌─────────┐ ┌─────────┐       │ │
│ │ │           Message Input             │ │ Send    │ │ Voice   │       │ │
│ │ │         (Auto-expanding)            │ │ Button  │ │ Button  │       │ │
│ │ └─────────────────────────────────────┘ └─────────┘ └─────────┘       │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘

TEMPLATES & PAGES (Application Layouts)
┌─────────────────────────────────────────────────────────────────────────────┐
│                              PAGE TEMPLATES                                 │
│                                                                             │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐               │
│ │ Landing Page    │ │ Chat Page       │ │ Canvas Page     │               │
│ │ Template        │ │ Template        │ │ Template        │               │
│ │                 │ │                 │ │                 │               │
│ │ • Header        │ │ • Chat Header   │ │ • Canvas Header │               │
│ │ • Hero Section  │ │ • Message Area  │ │ • Node Library  │               │
│ │ • Features      │ │ • Input Area    │ │ • Canvas Area   │               │
│ │ • Footer        │ │ • Sidebar       │ │ • Property Panel│               │
│ └─────────────────┘ └─────────────────┘ └─────────────────┘               │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Non-Functional Requirements (NFRs)

### 3.1 Performance Requirements

- **Page Load Time**: < 3 seconds for initial load
- **Response Time**: < 500ms for UI interactions
- **Canvas Rendering**: Smooth 60fps animations
- **Memory Usage**: Efficient state management to prevent memory leaks

### 2.2 Usability Requirements

- **Accessibility**: WCAG 2.1 AA compliance
- **Responsive Design**: Support for mobile, tablet, and desktop
- **Browser Support**: Modern browsers (Chrome 90+, Firefox 88+, Safari 14+)
- **Keyboard Navigation**: Full keyboard accessibility

### 2.3 Reliability Requirements

- **Error Handling**: Graceful error states and recovery
- **Data Persistence**: Local storage for session data
- **Offline Capability**: Basic offline mode for cached data

### 2.4 Security Requirements

- **Input Validation**: Sanitization of user inputs
- **XSS Protection**: Content Security Policy implementation
- **Data Privacy**: No sensitive data storage in local storage

### 2.5 Scalability Requirements

- **Component Architecture**: Modular, reusable components
- **Code Splitting**: Lazy loading for optimal bundle size
- **Performance Optimization**: React.memo, useMemo, useCallback usage

---

## 3. Architecture & Design Considerations

### 3.1 System Architecture

#### 3.1.1 Single Page Application (SPA) Architecture

The application will be built as a **Single Page Application (SPA)** using React Router for client-side routing, providing:

- **Fast Navigation**: No full page reloads between routes
- **Seamless User Experience**: Smooth transitions and state preservation
- **Efficient Resource Usage**: Initial bundle loading with lazy-loaded route components
- **Real-time Interactions**: Persistent WebSocket connections for chat functionality
- **Offline Capabilities**: Service worker integration for caching strategies

```
┌─────────────────────────────────────────────────────────────┐
│                 Single Page Application                     │
│                    (React 18 + SPA)                        │
├─────────────────────────────────────────────────────────────┤
│  Presentation Layer (Atomic Design Components)             │
│  ├── Pages (Landing, Chat) - Organisms Level               │
│  ├── Templates (Layout structures)                         │
│  ├── Organisms (ChatInterface, FlowCanvas, Navigation)     │
│  ├── Molecules (MessageBubble, NodeCard, SearchBox)        │
│  └── Atoms (Button, Input, Icon, Typography)               │
├─────────────────────────────────────────────────────────────┤
│  State Management Layer (Zustand + Context)                │
│  ├── Global App State (Theme, Auth, Settings)              │
│  ├── Feature States (Chat, Canvas, Flow)                   │
│  ├── UI States (Modals, Notifications, Loading)            │
│  └── Cache Layer (React Query for server state)           │
├─────────────────────────────────────────────────────────────┤
│  Service Layer (Business Logic)                            │
│  ├── Chat Service (WebSocket/HTTP for AI interactions)     │
│  ├── Canvas Service (Flow diagram rendering & updates)     │
│  ├── Storage Service (LocalStorage + IndexedDB)            │
│  ├── Theme Service (Dark/Light mode persistence)           │
│  └── Analytics Service (User interaction tracking)         │
├─────────────────────────────────────────────────────────────┤
│  Infrastructure Layer                                      │
│  ├── Router (React Router v6 with lazy loading)            │
│  ├── Error Boundaries (Component-level error handling)     │
│  ├── Service Worker (Caching + Offline support)            │
│  └── Performance Monitoring (Web Vitals tracking)          │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Component Architecture

#### 3.2.1 Atomic Design Pattern Implementation

Following **Brad Frost's Atomic Design methodology** for scalable component architecture:

##### **Atoms (Foundational Elements)**

```typescript
// Basic building blocks - single responsibility components
├── Button/
│   ├── Button.tsx
│   ├── Button.types.ts
│   ├── Button.stories.tsx
│   └── Button.test.tsx
├── Input/
├── Icon/
├── Typography/
├── Badge/
├── Avatar/
└── Spinner/
```

**Characteristics:**

- Single responsibility principle
- No business logic
- Highly reusable
- Design system tokens integration
- Comprehensive prop interfaces

##### **Molecules (Simple Combinations)**

```typescript
// Combinations of atoms with specific purpose
├── MessageBubble/
│   ├── MessageBubble.tsx    // Uses Avatar + Typography + Badge
│   └── MessageBubble.types.ts
├── SearchBox/               // Uses Input + Button + Icon
├── ExamplePrompt/          // Uses Button + Typography + Icon
├── NodeCard/               // Uses Badge + Typography + Icon
├── ThemeToggle/            // Uses Button + Icon
└── StatusIndicator/        // Uses Badge + Icon + Typography
```

**Characteristics:**

- Combine 2-3 atoms
- Single UI purpose
- Reusable across organisms
- Accept data props

##### **Organisms (Complex Components)**

```typescript
// Complex components with business logic
├── ChatInterface/
│   ├── ChatInterface.tsx
│   ├── components/
│   │   ├── MessageList/    // Uses MessageBubble molecules
│   │   ├── InputArea/      // Uses SearchBox + Button molecules
│   │   └── TypingIndicator/
│   └── hooks/
│       └── useChat.ts
├── FlowCanvas/
│   ├── FlowCanvas.tsx
│   ├── components/
│   │   ├── Node/          // Uses NodeCard molecules
│   │   ├── Connection/
│   │   └── Controls/
│   └── hooks/
│       └── useCanvas.ts
└── Navigation/
    ├── Navigation.tsx
    └── components/
        ├── NavItem/
        └── UserMenu/
```

**Characteristics:**

- Business logic integration
- State management
- API interactions
- Complex user interactions

##### **Templates (Layout Structures)**

```typescript
// Page layouts without specific content
├── LandingPageTemplate/
│   ├── LandingPageTemplate.tsx
│   └── LandingPageTemplate.types.ts
├── ChatPageTemplate/       // Split-pane layout
├── FullScreenTemplate/
└── ModalTemplate/
```

**Characteristics:**

- Define page structure
- Responsive layout logic
- Slot-based content areas
- No specific content

##### **Pages (Complete Implementations)**

```typescript
// Complete page implementations with real content
├── LandingPage/
│   ├── LandingPage.tsx     // Uses LandingPageTemplate
│   └── components/
│       ├── HeroSection/    // Organism
│       └── ExamplePrompts/ // Organism
└── ChatPage/
    ├── ChatPage.tsx        // Uses ChatPageTemplate
    └── components/
        ├── ChatInterface/  // Organism
        ├── FlowCanvas/     // Organism
        └── PropertiesPanel/ // Organism
```

**Benefits of Atomic Design:**

- **Scalability**: Easy to add new features by combining existing components
- **Consistency**: Design system enforcement at atom level
- **Testability**: Each level can be tested independently
- **Reusability**: High component reuse across the application
- **Maintainability**: Clear separation of concerns and responsibilities

#### 3.2.2 Key Components Structure

```typescript
src/
├── components/
│   ├── atoms/
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Icon/
│   │   └── Badge/
│   ├── molecules/
│   │   ├── MessageBubble/
│   │   ├── ExamplePrompt/
│   │   ├── NodeCard/
│   │   └── ThemeToggle/
│   ├── organisms/
│   │   ├── ChatInterface/
│   │   ├── FlowCanvas/
│   │   ├── PropertiesPanel/
│   │   └── Navigation/
│   ├── templates/
│   │   ├── LandingPageTemplate/
│   │   └── ChatPageTemplate/
│   └── pages/
│       ├── LandingPage/
│       └── ChatPage/
├── hooks/
├── services/
├── store/
├── types/
├── utils/
└── constants/
```

### 3.3 Data Flow Architecture

#### 3.3.1 State Management Strategy

- **Global State**: Application-wide state using Context API or Zustand
- **Local State**: Component-specific state using useState/useReducer
- **Server State**: API data management with proper caching

#### 3.3.2 Data Models

```typescript
interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

interface FlowNode {
  id: string;
  type: 'source' | 'transform' | 'destination';
  title: string;
  status: 'pending' | 'partial' | 'complete' | 'error';
  position: { x: number; y: number };
  configuration: Record<string, any>;
}

interface FlowConnection {
  id: string;
  sourceId: string;
  targetId: string;
}

interface Conversation {
  id: string;
  messages: Message[];
  flowNodes: FlowNode[];
  flowConnections: FlowConnection[];
  createdAt: Date;
  updatedAt: Date;
}
```

### 3.4 Mobile-First Responsive Design Strategy

#### 3.4.1 Mobile-First Philosophy

The application will be built using a **Mobile-First approach**, starting with mobile constraints and progressively enhancing for larger screens:

##### **Breakpoint Strategy**

```css
/* Mobile First - Base styles (320px+) */
.container {
  padding: 1rem;
  font-size: 14px;
}

/* Small Mobile (375px+) */
@media (min-width: 375px) {
  .container {
    padding: 1.25rem;
  }
}

/* Large Mobile (414px+) */
@media (min-width: 414px) {
  .container {
    padding: 1.5rem;
  }
}

/* Tablet (768px+) */
@media (min-width: 768px) {
  .container {
    padding: 2rem;
    font-size: 16px;
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
  .container {
    padding: 3rem;
    max-width: 1200px;
    margin: 0 auto;
  }
}

/* Large Desktop (1440px+) */
@media (min-width: 1440px) {
  .container {
    padding: 4rem;
    max-width: 1400px;
  }
}
```

##### **Tailwind CSS Default Breakpoint Strategy**

We'll use Tailwind's standard 5-breakpoint system for optimal compatibility and maintainability:

```javascript
// tailwind.config.js - Standard Tailwind Configuration
module.exports = {
  theme: {
    screens: {
      // Tailwind's default breakpoints (no customization needed)
      sm: '640px', // Small screens and up
      md: '768px', // Medium screens and up
      lg: '1024px', // Large screens and up
      xl: '1280px', // Extra large screens and up
      '2xl': '1536px', // 2X large screens and up
    },
  },
};
```

**Comprehensive Device Coverage with 5 Breakpoints:**

| Tailwind Class       | Breakpoint | Device Coverage                 | Primary Use Cases                                    |
| -------------------- | ---------- | ------------------------------- | ---------------------------------------------------- |
| **Base (no prefix)** | `0px+`     | **Mobile Devices**              | 320px-639px (All phones: iPhone SE to large Android) |
| **`sm:`**            | `640px+`   | **Large Mobile + Small Tablet** | 640px+ (Large phones, small tablets)                 |
| **`md:`**            | `768px+`   | **Tablet Portrait**             | 768px+ (iPad portrait, Android tablets)              |
| **`lg:`**            | `1024px+`  | **Tablet Landscape + Desktop**  | 1024px+ (iPad landscape, laptops, desktops)          |
| **`xl:`**            | `1280px+`  | **Large Desktop**               | 1280px+ (Standard desktop monitors)                  |
| **`2xl:`**           | `1536px+`  | **Ultra-wide Desktop**          | 1536px+ (Wide monitors, 4K displays)                 |

##### **Mobile-First Design Strategy with 5 Breakpoints**

| Device Range                  | Tailwind Classes | Screen Sizes  | Design Approach                                |
| ----------------------------- | ---------------- | ------------- | ---------------------------------------------- |
| **Mobile**                    | Base (no prefix) | 320px-639px   | Single column, touch-first, minimal padding    |
| **Large Mobile/Small Tablet** | `sm:`            | 640px-767px   | Enhanced spacing, larger touch targets         |
| **Tablet Portrait**           | `md:`            | 768px-1023px  | Two-column layouts, side navigation            |
| **Tablet Landscape/Desktop**  | `lg:`            | 1024px-1279px | Multi-column, full features, hover states      |
| **Large Desktop**             | `xl:`            | 1280px-1535px | Optimized desktop layout, max-width containers |
| **Ultra-wide Desktop**        | `2xl:`           | 1536px+       | Premium desktop experience, content scaling    |

##### **Responsive Design Implementation Examples**

```css
/* Mobile-First CSS with Tailwind's 5 Breakpoints */
.chat-container {
  /* Base: Mobile (0-639px) */
  padding: 1rem;
  font-size: 14px;

  /* Small screens (640px+) - Large Mobile/Small Tablet */
  @media (min-width: 640px) {
    padding: 1.5rem;
    font-size: 15px;
  }

  /* Medium screens (768px+) - Tablet Portrait */
  @media (min-width: 768px) {
    padding: 2rem;
    font-size: 16px;
    display: grid;
    grid-template-columns: 1fr 300px;
    gap: 1.5rem;
  }

  /* Large screens (1024px+) - Tablet Landscape/Desktop */
  @media (min-width: 1024px) {
    padding: 2.5rem;
    grid-template-columns: 1fr 350px;
    gap: 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  /* Extra large screens (1280px+) - Large Desktop */
  @media (min-width: 1280px) {
    padding: 3rem;
    grid-template-columns: 1fr 400px;
    max-width: 1400px;
  }

  /* 2X large screens (1536px+) - Ultra-wide Desktop */
  @media (min-width: 1536px) {
    padding: 3.5rem;
    max-width: 1600px;
  }
}
```

#### 3.4.2 Component Responsive Behavior

##### **Landing Page with Tailwind's 5 Breakpoints**

```typescript
// Responsive design using Tailwind's default breakpoint system
const LandingPage = () => (
  <div className="
    /* Mobile (0-639px) - Single column, minimal spacing */
    flex flex-col gap-4 p-4

    /* Large Mobile/Small Tablet (640px+) - Enhanced spacing */
    sm:gap-6 sm:p-6

    /* Tablet Portrait (768px+) - Two-column grid layout */
    md:grid md:grid-cols-2 md:gap-8 md:p-8

    /* Desktop (1024px+) - Centered layout with max width */
    lg:max-w-6xl lg:mx-auto lg:p-10

    /* Large Desktop (1280px+) - Enhanced desktop spacing */
    xl:p-12 xl:max-w-7xl

    /* Ultra-wide (1536px+) - Maximum content width */
    2xl:max-w-[1600px]
  ">
    <HeroSection className="
      /* Mobile: Center-aligned, full width */
      text-center w-full

      /* Tablet Portrait: Left-aligned, first column */
      md:text-left md:col-span-1

      /* Desktop: Enhanced spacing */
      xl:pr-8
    " />

    <ExamplePrompts className="
      /* Mobile: Full width, stacked below hero */
      w-full mt-6

      /* Tablet Portrait: Second column, no top margin */
      md:col-span-1 md:mt-0

      /* Desktop: Enhanced spacing */
      xl:pl-8
    " />
  </div>
);
```

##### **Chat Interface with 5 Breakpoints**

```typescript
// Responsive chat interface using Tailwind's default breakpoints
const ChatPage = () => {
  const [isMobile] = useMediaQuery('(max-width: 767px)');
  const [showCanvas, setShowCanvas] = useState(false);

  return (
    <div className="
      h-screen
      /* Mobile (0-639px): Column layout */
      flex flex-col

      /* Large Mobile/Small Tablet (640px+): Enhanced column */
      sm:flex-col

      /* Tablet Portrait (768px+): Column with divider */
      md:flex-col md:gap-1

      /* Desktop (1024px+): Row layout with split view */
      lg:flex-row lg:gap-0
    ">
      {/* Chat Interface */}
      <div className={`
        /* Mobile: Full screen when visible, hidden when canvas shown */
        ${isMobile && showCanvas ? 'hidden' : 'flex flex-col'}

        /* Large Mobile: Enhanced mobile layout */
        sm:${isMobile && showCanvas ? 'hidden' : 'flex'}

        /* Tablet Portrait: 60% height, stacked above canvas */
        md:h-3/5 md:flex md:border-b

        /* Desktop: 50% width, side-by-side with canvas */
        lg:w-1/2 lg:h-full lg:border-r lg:border-b-0

        /* Large Desktop: Optimized desktop chat */
        xl:w-1/2
      `}>
        <ChatInterface />

        {/* Mobile Canvas Toggle Button */}
        {isMobile && (
          <button
            onClick={() => setShowCanvas(true)}
            className="
              fixed bottom-4 right-4 z-40
              w-14 h-14 bg-blue-500 rounded-full
              flex items-center justify-center
              shadow-lg active:scale-95 transition-transform
              md:hidden
            "
          >
            <Icon name="diagram" size={24} className="text-white" />
          </button>
        )}
      </div>

      {/* Canvas */}
      <div className={`
        /* Mobile: Full screen overlay when shown */
        ${isMobile ? 'fixed inset-0 z-50 bg-white' : 'flex-1'}
        ${isMobile && !showCanvas ? 'hidden' : 'flex flex-col'}

        /* Large Mobile: Same as mobile */
        sm:${isMobile && !showCanvas ? 'hidden' : 'flex'}

        /* Tablet Portrait: 40% height, stacked below chat */
        md:h-2/5 md:flex

        /* Desktop: 50% width, side-by-side with chat */
        lg:w-1/2 lg:h-full lg:flex

        /* Large Desktop: Enhanced desktop canvas */
        xl:w-1/2
      `}>
        <FlowCanvas />

        {/* Mobile Close Button */}
        {isMobile && showCanvas && (
          <button
            onClick={() => setShowCanvas(false)}
            className="
              absolute top-4 right-4 z-10
              w-10 h-10 bg-gray-100 rounded-full
              flex items-center justify-center
              active:scale-95 transition-transform
            "
          >
            <Icon name="x" size={20} />
          </button>
        )}
      </div>
    </div>
  );
};
```

#### 3.4.3 Touch-First Interaction Design

##### **Touch Target Optimization**

- **Minimum touch target**: 44px × 44px (iOS HIG compliance)
- **Comfortable touch target**: 48px × 48px
- **Spacing between targets**: Minimum 8px
- **Interactive feedback**: Immediate visual/haptic feedback

##### **Mobile-Specific Components**

```typescript
// Mobile-optimized message input
const MobileMessageInput = () => (
  <div className="
    fixed bottom-0 left-0 right-0
    bg-white border-t border-gray-200
    p-4 pb-safe-bottom
    lg:relative lg:p-0 lg:border-0
  ">
    <div className="flex gap-3 items-end">
      <textarea
        className="
          flex-1 min-h-[44px] max-h-32
          p-3 rounded-xl border
          text-base // Prevents zoom on iOS
          resize-none
        "
        placeholder="Describe your data flow..."
      />
      <button className="
        w-12 h-12 // 48px touch target
        bg-blue-500 rounded-xl
        flex items-center justify-center
        active:scale-95 transition-transform
      ">
        <Icon name="send" size={20} />
      </button>
    </div>
  </div>
);
```

#### 3.4.4 Progressive Enhancement Strategy

##### **Feature Detection & Graceful Degradation**

```typescript
// Progressive enhancement for advanced features
const useProgressiveEnhancement = () => {
  const [capabilities, setCapabilities] = useState({
    touch: false,
    hover: false,
    reducedMotion: false,
    highContrast: false,
  });

  useEffect(() => {
    setCapabilities({
      touch: 'ontouchstart' in window,
      hover: window.matchMedia('(hover: hover)').matches,
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      highContrast: window.matchMedia('(prefers-contrast: high)').matches,
    });
  }, []);

  return capabilities;
};

// Usage in components
const FlowCanvas = () => {
  const { touch, hover } = useProgressiveEnhancement();

  return (
    <canvas
      onTouchStart={touch ? handleTouchStart : undefined}
      onMouseEnter={hover ? handleMouseEnter : undefined}
      className={`
        cursor-grab active:cursor-grabbing
        ${touch ? 'touch-pan-x touch-pan-y' : ''}
      `}
    />
  );
};
```

#### 3.4.5 Performance Optimization for Mobile

##### **Mobile-Specific Optimizations**

- **Image optimization**: WebP with fallbacks, responsive images
- **Bundle splitting**: Critical CSS inlined, non-critical lazy loaded
- **Touch delay elimination**: `touch-action: manipulation`
- **Viewport optimization**: Proper meta viewport configuration
- **Font loading**: Font-display swap for faster text rendering

```html
<!-- Optimized viewport configuration -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />

<!-- Preload critical resources -->
<link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossorigin />
<link rel="preload" href="/critical.css" as="style" />
```

#### 3.4.6 Comprehensive Breakpoint Testing Strategy

##### **Device Testing Matrix with 5 Breakpoints**

| Tailwind Breakpoint         | Test Devices                               | Screen Sizes          | Key Testing Points                                      |
| --------------------------- | ------------------------------------------ | --------------------- | ------------------------------------------------------- |
| **Base (Mobile)**           | iPhone SE, iPhone 12, Galaxy S21           | 320×568 to 639×800    | Touch targets, text readability, single-column layout   |
| **`sm:` (Large Mobile)**    | iPhone 14 Plus, Galaxy S22+, small tablets | 640×896 to 767×1024   | Enhanced mobile features, larger content areas          |
| **`md:` (Tablet Portrait)** | iPad, Galaxy Tab, Surface                  | 768×1024 to 1023×1366 | Two-column layouts, touch interactions, content density |
| **`lg:` (Desktop)**         | Laptops, desktops, iPad landscape          | 1024×768 to 1279×1024 | Multi-column layouts, hover states, desktop features    |
| **`xl:` (Large Desktop)**   | Standard monitors                          | 1280×720 to 1535×1080 | Full desktop features, optimized layouts                |
| **`2xl:` (Ultra-wide)**     | Wide monitors, 4K displays                 | 1536×864+             | Premium desktop experience, maximum content width       |

##### **Responsive Testing Implementation**

```typescript
// Custom hook for Tailwind's 5 breakpoints
const useResponsiveBreakpoints = () => {
  const [breakpoints, setBreakpoints] = useState({
    isMobile: false,        // 0-639px
    isSmall: false,         // 640px+ (sm:)
    isMedium: false,        // 768px+ (md:)
    isLarge: false,         // 1024px+ (lg:)
    isExtraLarge: false,    // 1280px+ (xl:)
    is2ExtraLarge: false,   // 1536px+ (2xl:)
  });

  useEffect(() => {
    const updateBreakpoints = () => {
      const width = window.innerWidth;

      setBreakpoints({
        isMobile: width < 640,
        isSmall: width >= 640,
        isMedium: width >= 768,
        isLarge: width >= 1024,
        isExtraLarge: width >= 1280,
        is2ExtraLarge: width >= 1536,
      });
    };

    updateBreakpoints();
    window.addEventListener('resize', updateBreakpoints);
    return () => window.removeEventListener('resize', updateBreakpoints);
  }, []);

  return breakpoints;
};

// Usage in components for device-specific logic
const ResponsiveComponent = () => {
  const {
    isMobile,
    isMedium,
    isLarge
  } = useResponsiveBreakpoints();

  return (
    <div>
      {isMobile && <MobileOptimizedUI />}
      {isMedium && <TabletEnhancedUI />}
      {isLarge && <DesktopFullFeaturedUI />}
    </div>
  );
};
```

##### **Automated Responsive Testing**

```javascript
// Playwright test configuration for Tailwind's 5 breakpoints
const tailwindBreakpoints = [
  { name: 'Mobile', width: 375, height: 812, breakpoint: 'base' },
  { name: 'Large Mobile', width: 640, height: 896, breakpoint: 'sm' },
  { name: 'Tablet Portrait', width: 768, height: 1024, breakpoint: 'md' },
  { name: 'Desktop', width: 1024, height: 768, breakpoint: 'lg' },
  { name: 'Large Desktop', width: 1280, height: 720, breakpoint: 'xl' },
  { name: 'Ultra-wide', width: 1536, height: 864, breakpoint: '2xl' },
];

tailwindBreakpoints.forEach((device) => {
  test(`Responsive layout at ${device.breakpoint} breakpoint (${device.name})`, async ({
    page,
  }) => {
    await page.setViewportSize({
      width: device.width,
      height: device.height,
    });

    await page.goto('/');

    // Test layout integrity
    await expect(page.locator('[data-testid="main-layout"]')).toBeVisible();

    // Test touch targets for mobile and tablet
    if (device.width < 1024) {
      const buttons = page.locator('button');
      const count = await buttons.count();

      for (let i = 0; i < count; i++) {
        const button = buttons.nth(i);
        const box = await button.boundingBox();
        expect(box.width).toBeGreaterThanOrEqual(44); // iOS HIG compliance
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }

    // Breakpoint-specific tests
    if (device.breakpoint === 'md' || device.width >= 768) {
      // Tablet features should be visible
      await expect(page.locator('[data-testid="tablet-layout"]')).toBeVisible();
    }

    if (device.breakpoint === 'lg' || device.width >= 1024) {
      // Desktop features should be visible
      await expect(page.locator('[data-testid="desktop-layout"]')).toBeVisible();
      await expect(page.locator('[data-testid="split-view"]')).toBeVisible();
    }

    if (device.breakpoint === 'xl' || device.width >= 1280) {
      // Large desktop optimizations
      await expect(page.locator('[data-testid="max-width-container"]')).toBeVisible();
    }
  });
});
```

### 3.5 Comprehensive Design System Architecture

Following industry best practices from Figma design system methodology, we'll implement a systematic approach based on the **five pillars of design system success**: **Consistency**, **Scalability**, **Efficiency**, **Clarity**, and **Governance**.

#### 3.5.1 Design System Foundation Strategy

##### **Strategic Foundation Phase**

Before component creation, establish strategic alignment:

- **Objective Clarification**: Define business problems the design system will solve
- **Scope Definition**: Identify platforms (web, mobile, desktop) and future expansion plans
- **Success Metrics**: Establish KPIs for adoption, quality, and developer experience
- **Governance Model**: Define roles, responsibilities, and decision-making processes

##### **Figma File Organization Strategy**

```
📁 Nexla Design System/
├── 🎨 Foundation
│   ├── Design Tokens (Colors, Typography, Spacing, Effects)
│   ├── Grid & Layout Systems
│   └── Brand Guidelines & Principles
├── 🧩 Components
│   ├── Atoms (Buttons, Inputs, Icons, Typography)
│   ├── Molecules (Form Groups, Cards, Navigation Items)
│   ├── Organisms (Headers, Chat Interface, Flow Canvas)
│   └── Templates (Landing Page, Chat Page Layouts)
├── 📐 Patterns
│   ├── Navigation Patterns
│   ├── Data Flow Patterns
│   └── Interaction Patterns
└── 📚 Documentation
    ├── Usage Guidelines & Do's/Don'ts
    ├── Accessibility Standards
    └── Developer Handoff Specifications
```

#### 3.5.2 Design Tokens Architecture

Following token-based design principles for consistency and scalability:

##### **Color Token Hierarchy**

```typescript
// Primitive Tokens (Base Colors)
const primitiveColors = {
  blue: {
    50: '#eff6ff',
    500: '#3b82f6',
    600: '#2563eb',
    900: '#1e3a8a',
  },
  purple: {
    50: '#f3f4f6',
    500: '#8b5cf6',
    600: '#7c3aed',
  },
  green: {
    50: '#f0fdf4',
    500: '#10b981',
    600: '#059669',
  },
};

// Semantic Tokens (Meaning-Based)
const semanticTokens = {
  primary: primitiveColors.blue[600],
  secondary: primitiveColors.purple[500],
  success: primitiveColors.green[500],
  warning: '#f59e0b',
  error: '#ef4444',
};

// Component Tokens (Usage-Specific)
const componentTokens = {
  node: {
    source: semanticTokens.primary, // Blue for data sources
    transform: semanticTokens.secondary, // Purple for transformations
    destination: semanticTokens.success, // Green for destinations
  },
  status: {
    pending: '#f59e0b', // Orange
    partial: '#3b82f6', // Blue
    complete: '#10b981', // Green
    error: '#ef4444', // Red
  },
};
```

##### **Typography Token System**

```typescript
const typographyTokens = {
  fontFamily: {
    primary: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    code: 'JetBrains Mono, Consolas, monospace',
  },
  fontSize: {
    xs: '0.75rem', // 12px
    sm: '0.875rem', // 14px
    base: '1rem', // 16px
    lg: '1.125rem', // 18px
    xl: '1.25rem', // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '2rem', // 32px
    '4xl': '3rem', // 48px
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  },
};
```

##### **Spacing Token System**

```typescript
const spacingTokens = {
  0: '0px',
  1: '0.25rem', // 4px
  2: '0.5rem', // 8px
  3: '0.75rem', // 12px
  4: '1rem', // 16px
  6: '1.5rem', // 24px
  8: '2rem', // 32px
  12: '3rem', // 48px
  16: '4rem', // 64px
};
```

#### 3.5.3 Advanced Figma Features Implementation

##### **Variables and Modes Strategy**

```javascript
// Figma Variables Configuration for Multi-Mode Support
const figmaVariables = {
  collections: {
    colors: {
      modes: ['light', 'dark', 'high-contrast'],
      variables: {
        'color/primary': {
          light: '#2563eb',
          dark: '#3b82f6',
          'high-contrast': '#0000ff',
        },
        'color/surface': {
          light: '#ffffff',
          dark: '#1f2937',
          'high-contrast': '#000000',
        },
      },
    },
    spacing: {
      modes: ['default'],
      variables: {
        'space/1': '4px',
        'space/4': '16px',
        'space/8': '32px',
      },
    },
  },
};
```

##### **Component Properties Strategy**

```typescript
// Button Component with Complete Prop System
interface ButtonComponent {
  // Variant Properties
  size: 'sm' | 'md' | 'lg';
  variant: 'primary' | 'secondary' | 'ghost' | 'destructive';
  state: 'default' | 'hover' | 'active' | 'disabled' | 'loading';

  // Boolean Properties
  hasIcon: boolean;
  isFullWidth: boolean;

  // Instance Swap Properties
  icon?: IconComponent;

  // Text Properties
  label: string;
}
```

#### 3.5.4 Quality Assurance Through Systematic Checklists

##### **Design Token Validation Checklist**

- [ ] **Accessibility Compliance**: All color contrasts meet WCAG 2.2 AAA standards
- [ ] **Platform Consistency**: Tokens work across web, mobile platforms
- [ ] **Naming Convention**: Follows semantic naming patterns (primitive/semantic/component)
- [ ] **Documentation**: Updated usage guidelines and examples
- [ ] **Backward Compatibility**: Existing implementations remain functional
- [ ] **Cross-Theme Testing**: Validated across light, dark, high-contrast modes

##### **Component Definition Checklist**

- [ ] **Use Case Clarity**: Clear problem definition and solution approach
- [ ] **API Completeness**: All necessary props and variants included
- [ ] **State Coverage**: All interactive states defined (default, hover, focus, active, disabled)
- [ ] **Auto Layout Implementation**: Proper constraints and responsive behavior
- [ ] **Error Handling**: Graceful degradation for edge cases
- [ ] **Integration Testing**: Works correctly with related components

##### **Accessibility Validation Checklist**

- [ ] **Color Contrast**: Minimum 4.5:1 for normal text, 3:1 for large text
- [ ] **Focus Indicators**: Clear visual focus states for keyboard navigation
- [ ] **Touch Targets**: Minimum 44×44px for mobile interfaces
- [ ] **Screen Reader Support**: Proper ARIA labels and semantic markup
- [ ] **Keyboard Navigation**: Full functionality without mouse
- [ ] **Motion Sensitivity**: Respects prefers-reduced-motion preferences

#### 3.5.5 Figma-to-Development Workflow

##### **Design Token Export Pipeline**

```javascript
// Figma Variables → Style Dictionary → Platform Tokens
const styleDictionaryConfig = {
  source: ['figma-tokens/**/*.json'],
  platforms: {
    css: {
      transformGroup: 'css',
      buildPath: 'src/tokens/',
      files: [{
        destination: 'variables.css',
        format: 'css/variables'
      }]
    },
    js: {
      transformGroup: 'js',
      buildPath: 'src/tokens/',
      files: [{
        destination: 'tokens.js',
        format: 'javascript/es6'
      }]
    }
  }
};

// Generated CSS Custom Properties
:root {
  --color-primary-500: #3b82f6;
  --color-node-source: var(--color-primary-500);
  --space-4: 1rem;
  --font-size-base: 1rem;
}
```

##### **Component Specification Standards**

Each Figma component includes development specifications:

```typescript
// Component Documentation Template
interface ComponentSpec {
  // Design Properties
  figmaComponent: string; // Component name in Figma
  variants: ComponentVariant[]; // All available variants
  states: ComponentState[]; // Interactive states

  // Development Implementation
  htmlStructure: string; // Semantic markup
  cssClasses: string[]; // Tailwind utility classes
  ariaLabels: AriaSpec[]; // Accessibility requirements
  keyboardBehavior: KeyboardSpec; // Keyboard interaction

  // Integration Notes
  dependencies: string[]; // Related components
  dataProps: DataProp[]; // Expected data structure
  eventHandlers: EventHandler[]; // JavaScript behavior
}
```

##### **Plugin Integration Strategy**

- **Figma Tokens**: Advanced token management and export
- **Design Lint**: Automated design system compliance
- **Figma to Code**: Generate React components from designs
- **Stark**: Accessibility validation and contrast checking

##### **Storybook Integration**

```typescript
// Component Story Template
export default {
  title: 'Components/Button',
  component: Button,
  parameters: {
    design: {
      type: 'figma',
      url: 'https://figma.com/file/button-component'
    }
  }
} as ComponentMeta<typeof Button>;

export const Primary: ComponentStory<typeof Button> = (args) => (
  <Button {...args} />
);
Primary.args = {
  variant: 'primary',
  size: 'md',
  label: 'Click me'
};
```

##### **Quality Gates for Design-Development Sync**

- [ ] **Token Alignment**: Figma variables match CSS custom properties
- [ ] **Component Parity**: 1:1 mapping between Figma and React components
- [ ] **State Coverage**: All Figma states implemented in code
- [ ] **Responsive Behavior**: Auto Layout matches CSS responsive design
- [ ] **Documentation Sync**: Storybook stories reflect Figma specifications

---

## 4. Implementation Strategy

### 4.1 Development Phases

#### Phase 1: Design System Foundation & SPA Setup (Week 1)

##### **Figma Design System Setup**

- **Strategic Foundation**
  - Define design system objectives and success metrics
  - Establish governance model and team roles
  - Create Figma file organization structure
  - Set up design token collections with variables and modes

- **Design Token Implementation**
  - Create primitive color tokens (blue, purple, green scales)
  - Define semantic tokens (primary, secondary, success, error)
  - Establish component-specific tokens (node colors, status indicators)
  - Implement typography and spacing token systems
  - Set up light/dark/high-contrast mode support

- **Component Architecture Foundation**
  - Build atomic components with proper Figma properties
  - Implement Auto Layout for responsive behavior
  - Create component variants with complete state coverage
  - Establish naming conventions and documentation standards
  - Apply systematic validation checklists

##### **Development Environment Setup**

- **SPA + Design System Integration**
  - Create React TypeScript project with Vite bundler
  - Configure Tailwind CSS with design token integration
  - Set up Figma-to-code pipeline with token export
  - Implement Storybook with design system documentation

- **Quality Assurance Framework**
  - Implement design token validation checklist
  - Set up accessibility testing with axe-core
  - Configure responsive design testing tools
  - Create component definition validation process

#### Phase 2: Mobile-First Landing Page (Week 1)

##### **Atomic Component Development**

- **Atoms Implementation**
  - Button component with touch-friendly sizing (48px minimum)
  - Input component with mobile keyboard optimization
  - Typography system with responsive scaling
  - Icon system with proper touch targets

- **Molecules Assembly**
  - ExamplePrompt components (Button + Typography + Icon)
  - SearchBox component (Input + Button + Icon)
  - ThemeToggle component (Button + Icon with animation)

- **Organisms Construction**
  - HeroSection organism with mobile-first responsive design
  - ExamplePrompts organism with touch-optimized grid layout
  - Navigation organism with mobile hamburger menu

##### **Mobile-First Responsive Implementation**

- **Progressive Enhancement**
  - Base mobile styles (320px+)
  - Tablet enhancements (768px+)
  - Desktop optimizations (1024px+)
  - Touch vs hover interaction detection

- **Performance Optimization**
  - Critical CSS inlining for above-the-fold content
  - Lazy loading for non-critical components
  - Image optimization with responsive sizes
  - Font loading optimization

#### Phase 3: Mobile-First Chat Interface (Week 2)

##### **Chat Atomic Components**

- **Specialized Atoms**
  - Avatar component with status indicators
  - Badge component for message status
  - Spinner component for loading states
  - Timestamp component with relative time

- **Chat Molecules**
  - MessageBubble (Avatar + Typography + Badge + Timestamp)
  - TypingIndicator (Avatar + Spinner + Typography)
  - MessageInput (Input + Button + Icon with mobile optimization)
  - StatusIndicator (Badge + Icon + Typography)

- **Chat Organisms**
  - MessageList with virtual scrolling for performance
  - InputArea with mobile keyboard handling
  - ChatInterface with mobile-first layout

##### **Mobile-Specific Chat Features**

- **Touch Interactions**
  - Swipe gestures for message actions
  - Pull-to-refresh for message history
  - Touch-friendly scroll behavior
  - Haptic feedback for interactions

- **Mobile UX Optimizations**
  - Fixed input area with safe-area-inset support
  - Auto-resize textarea with max-height
  - Keyboard appearance handling (iOS/Android)
  - Message list optimization for small screens

#### Phase 4: Responsive Visual Canvas (Week 2-3)

##### **Canvas Atomic Architecture**

- **Canvas Atoms**
  - Node component with touch-friendly sizing
  - Connection component with SVG optimization
  - Handle component for drag interactions
  - Zoom controls with touch gesture support

- **Canvas Molecules**
  - NodeCard (Node + Badge + Typography + Icon)
  - ConnectionLine (Connection + Label + Status)
  - CanvasControls (Button + Icon for zoom/pan)
  - NodeProperties (Input + Typography + Badge)

- **Canvas Organisms**
  - FlowCanvas with mobile-first responsive behavior
  - PropertiesPanel with collapsible mobile design
  - CanvasToolbar with responsive button grouping

##### **Mobile Canvas Adaptations**

- **Touch-First Interactions**
  - Pinch-to-zoom gesture support
  - Two-finger pan gestures
  - Long-press for context menus
  - Touch-friendly node sizing (minimum 44px)

- **Responsive Canvas Behavior**
  - Mobile: Full-screen modal with overlay controls
  - Tablet: Side-by-side with collapsible panels
  - Desktop: Split-pane with resizable dividers
  - Auto-fit and center content on screen size changes

#### Phase 5: Integration & Polish (Week 3-4)

- **System Integration**
  - Chat-to-canvas synchronization
  - State persistence across routes
  - Error boundary implementation
  - Performance optimization

- **Quality Assurance**
  - Accessibility testing and fixes
  - Cross-browser testing
  - Mobile responsiveness testing
  - Performance profiling and optimization

### 4.2 Technology Implementation Details

#### 4.2.1 State Management with Zustand

```typescript
interface AppStore {
  // Theme state
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  // Chat state
  conversations: Conversation[];
  activeConversationId: string | null;
  addMessage: (message: Message) => void;

  // Canvas state
  selectedNodeId: string | null;
  setSelectedNode: (nodeId: string | null) => void;
  updateNode: (nodeId: string, updates: Partial<FlowNode>) => void;
}
```

#### 4.2.2 Custom Hooks Strategy

- `useChat`: Chat functionality and message management
- `useCanvas`: Canvas state and node management
- `useTheme`: Theme switching and persistence
- `useLocalStorage`: Persistent data management
- `useDebounce`: Input debouncing for performance

#### 4.2.3 Performance Optimization

- **Code Splitting**: Route-based and component-based splitting
- **Memoization**: React.memo for expensive components
- **Virtual Scrolling**: For large message lists
- **Lazy Loading**: Images and non-critical components

### 4.3 Testing Strategy

#### 4.3.1 Testing Pyramid

- **Unit Tests**: Component logic and utilities (70%)
- **Integration Tests**: Component interactions (20%)
- **E2E Tests**: Critical user flows (10%)

#### 4.3.2 Testing Tools

- **Unit Testing**: Vitest + React Testing Library
- **E2E Testing**: Playwright
- **Visual Testing**: Chromatic (Storybook)
- **Accessibility Testing**: axe-core

---

## 5. Evaluation Criteria Alignment

### 5.1 Visual Design Excellence

- **Modern UI**: Clean, contemporary design with subtle animations
- **Attention to Detail**: Consistent spacing, typography, and color usage
- **Micro-interactions**: Hover effects, loading states, and smooth transitions
- **Visual Hierarchy**: Clear information architecture and user flow

### 5.2 Code Quality Standards

- **Clean TypeScript**: Strict typing with comprehensive interfaces
- **Component Architecture**: Modular, reusable, and maintainable components
- **Performance**: Optimized rendering and efficient state management
- **Best Practices**: ESLint rules, code formatting, and documentation

### 5.3 User Experience Focus

- **Intuitive Interactions**: Natural user flows and clear feedback
- **Responsive Design**: Seamless experience across all devices
- **Accessibility**: Full keyboard navigation and screen reader support
- **Error Handling**: Graceful error states with recovery options

### 5.4 Technical Implementation

- **State Management**: Efficient and scalable state architecture
- **Routing**: Smooth navigation with proper URL handling
- **Performance**: Fast loading times and responsive interactions
- **Modern Patterns**: Hooks, functional components, and TypeScript

---

## 6. Bonus Features Implementation

### 6.1 Animations & Micro-interactions

- **Page Transitions**: Smooth route animations
- **Node Animations**: Entrance/exit animations for canvas nodes
- **Loading States**: Skeleton screens and progress indicators
- **Hover Effects**: Interactive feedback for all clickable elements

### 6.2 Accessibility Features

- **ARIA Labels**: Comprehensive screen reader support
- **Keyboard Navigation**: Full keyboard accessibility
- **Focus Management**: Proper focus handling and visual indicators
- **Color Contrast**: WCAG AA compliance for all text

### 6.3 Error Handling & Loading States

- **Error Boundaries**: Graceful error recovery
- **Network Errors**: Retry mechanisms and offline indicators
- **Validation Errors**: Clear error messages and correction guidance
- **Loading States**: Progressive loading and skeleton screens

### 6.4 Performance Optimizations

- **Bundle Optimization**: Tree shaking and code splitting
- **Image Optimization**: WebP format and lazy loading
- **Caching Strategy**: Service worker for static assets
- **Memory Management**: Proper cleanup and garbage collection

---

## 7. Deployment & Delivery Strategy

### 7.1 Development Environment

- **Local Development**: Vite dev server with hot reload
- **Version Control**: Git with conventional commits
- **Code Quality**: Pre-commit hooks with lint-staged
- **Documentation**: Storybook for component documentation

### 7.2 Production Deployment

- **Build Process**: Optimized production build with Vite
- **Hosting**: Vercel or Netlify for static hosting
- **CDN**: Global content delivery network
- **Monitoring**: Performance monitoring and error tracking

### 7.3 Deliverables

1. **GitHub Repository**: Clean commit history with proper documentation
2. **Live Demo**: Deployed application with test data
3. **README Documentation**: Setup instructions and project overview
4. **Design Decisions**: Detailed explanation of architectural choices

---

## 8. Risk Assessment & Mitigation

### 8.1 Technical Risks

- **Performance Issues**: Mitigated by proper optimization and testing
- **Browser Compatibility**: Addressed through comprehensive testing
- **State Management Complexity**: Simplified with clear separation of concerns

### 8.2 Timeline Risks

- **Feature Creep**: Controlled through strict scope management
- **Integration Challenges**: Minimized with incremental development
- **Testing Bottlenecks**: Addressed with parallel testing implementation

### 8.3 Quality Risks

- **Accessibility Gaps**: Prevented through continuous accessibility testing
- **Code Quality Issues**: Mitigated with strict linting and code review
- **User Experience Problems**: Addressed through iterative design validation

---

## 9. Success Metrics

### 9.1 Technical Metrics

- **Performance Score**: Lighthouse score > 90
- **Bundle Size**: < 500KB gzipped
- **Test Coverage**: > 80% code coverage
- **Accessibility Score**: 100% axe-core compliance

### 9.2 User Experience Metrics

- **Task Completion**: Users can complete full flow in < 2 minutes
- **Error Rate**: < 5% user-reported errors
- **Mobile Usage**: Seamless experience on mobile devices
- **Loading Time**: < 3 seconds initial page load

### 9.3 Code Quality Metrics

- **TypeScript Coverage**: 100% typed code (no any types)
- **ESLint Violations**: Zero linting errors
- **Component Reusability**: > 70% component reuse rate
- **Documentation Coverage**: All components documented

---

## 10. Key Architecture Principles Summary

### 10.1 Single Page Application (SPA) Benefits

- **Performance**: Faster navigation with no full page reloads
- **User Experience**: Seamless transitions and persistent state
- **Real-time Features**: WebSocket connections for live chat updates
- **Offline Capability**: Service worker integration for robust performance
- **SEO Optimization**: Client-side routing with proper meta tag management

### 10.2 Atomic Design Implementation

- **Scalability**: Component reusability across the entire application
- **Consistency**: Design system enforcement at the foundational level
- **Maintainability**: Clear separation of concerns and responsibilities
- **Testing**: Independent testing at each atomic level
- **Documentation**: Comprehensive Storybook integration for all components

### 10.3 Mobile-First Approach Benefits

- **Performance**: Optimized for constrained mobile environments first
- **Accessibility**: Touch-friendly interfaces with proper target sizing
- **Progressive Enhancement**: Feature detection and graceful degradation
- **User Experience**: Native-like mobile interactions and gestures
- **Market Reach**: Optimal experience across all device categories

## 11. Conclusion

This comprehensive plan outlines the development of a modern, scalable, and user-friendly conversational data integration platform built on **four foundational principles**:

### **Core Architecture Pillars:**

1. **Single Page Application Architecture** for optimal performance and seamless user experience
2. **Atomic Design Methodology** for scalable and maintainable component architecture
3. **Mobile-First Responsive Design** for universal accessibility across all devices
4. **Systematic Design System Implementation** following Figma best practices and the five pillars of design system success

### **Design System Excellence:**

The plan incorporates industry-leading design system practices based on the **five pillars of success**:

- **Consistency**: Unified visual and behavioral patterns through design tokens
- **Scalability**: System growth that maintains performance across teams and products
- **Efficiency**: Streamlined workflows accelerating design and development
- **Clarity**: Clear documentation and adoption guidelines for all stakeholders
- **Governance**: Structured oversight ensuring system integrity and evolution

### **Systematic Quality Assurance:**

The implementation follows **checklist-driven validation** across all aspects:

- **Design Token Validation**: Accessibility, platform consistency, naming conventions
- **Component Definition**: Complete API coverage, state management, error handling
- **Accessibility Compliance**: WCAG 2.2 AAA standards, keyboard navigation, inclusive design
- **Figma-to-Development Sync**: Token alignment, component parity, documentation consistency

### **Technical Innovation:**

The architecture demonstrates advanced understanding of:

- **Modern React Patterns**: Hooks, functional components, performance optimization
- **Design System Integration**: Figma variables, token pipelines, Storybook documentation
- **Responsive Design Mastery**: Tailwind's 5-breakpoint system with mobile-first approach
- **Accessibility-First Development**: Built-in inclusive design principles

### **Strategic Impact:**

This approach ensures:

- **Rapid Development**: Reusable components and systematic design tokens
- **Consistent Quality**: Automated validation and quality gates
- **Team Scalability**: Clear governance and contribution processes
- **Future-Proofing**: Extensible architecture supporting product growth
- **Technical Excellence**: Industry best practices and cutting-edge methodologies

The systematic integration of Figma design system best practices with modern development workflows positions this project as a showcase of contemporary frontend architecture, demonstrating not just technical competence but strategic thinking about scalable design and development processes.

---

**Project Timeline**: 3-4 weeks  
**Team Size**: 1 Frontend Developer  
**Technology Stack**: React 18+ • TypeScript • Tailwind CSS • React Router • Zustand  
**Deployment**: Vercel/Netlify with CI/CD pipeline
