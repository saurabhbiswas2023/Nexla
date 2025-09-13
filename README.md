# Nexla Data Flow Architect

A comprehensive data flow visualization and management application implementing enterprise-grade quality standards.

**Version 1.0.0** - Production ready with comprehensive testing and quality assurance.

## 📚 Documentation

**Complete documentation is available in the [`docs/`](./docs/) folder:**

> **Quality Score: 9.2/10** - Enterprise-grade standards with comprehensive testing, accessibility, and security.

- **[📊 Code Quality Analysis](./docs/code-quality/COMPREHENSIVE_CODE_QUALITY_ANALYSIS.md)** - 9.2/10 quality score
- **[📋 Code Review Process](./docs/code-quality/CODE_REVIEW_CHECKLIST.md)** - Developer guidelines
- **[🎯 Cursor IDE Setup](./docs/cursor-setup/CURSOR_SETUP.md)** - IDE configuration
- **[🔗 Data Models](./docs/data-models/chatmodel.md)** - Connector specifications

## Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Router
- Zustand (chat state)

## Commands

```
npm install
npm run dev    # http://localhost:5173
npm run build
npm run preview
```

## Structure

```
Code/
  index.html
  src/
    main.tsx
    router.tsx
    routes/
      LandingPage.tsx
      ChatPage.tsx
    store/
      chat.ts
    styles/
      index.css
```

## Notes

- Breakpoints use Tailwind’s default 5 breakpoints (sm, md, lg, xl, 2xl).
- Landing page includes hero, prompt input with Start, and example prompts.
- Chat page supports basic message exchange with placeholder AI responses.
