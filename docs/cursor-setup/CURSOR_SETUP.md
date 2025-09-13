# 🎯 **CURSOR IDE SETUP GUIDE**

## **📁 CORRECT FILE STRUCTURE**

The Cursor IDE code review rules are properly configured in:

```
.cursor/
└── rules.md    ✅ Main Cursor rules file
```

**❌ INCORRECT**: `.cursorrules` in project root
**✅ CORRECT**: `.cursor/rules.md` in `.cursor` folder

---

## **🔧 HOW TO USE WITH CURSOR IDE**

### **1. Automatic Integration**

- Cursor IDE automatically detects `.cursor/rules.md`
- Rules are applied during code review and suggestions
- No additional configuration needed

### **2. Manual Review Process**

- Use `CODE_REVIEW_CHECKLIST.md` for comprehensive manual reviews
- Use `QUICK_REVIEW_GUIDE.md` for rapid quality checks
- Follow automated workflow in `.github/workflows/code-review.yml`

### **3. Quality Standards**

- **Minimum Score**: 7/10 to merge
- **Target Score**: 9/10 for excellence
- **Critical Issues**: Must be fixed (ESLint, Security, Accessibility)

---

## **📋 RELATED FILES**

| File                                | Purpose                | Usage                    |
| ----------------------------------- | ---------------------- | ------------------------ |
| `.cursor/rules.md`                  | Cursor IDE integration | Automatic code review    |
| `CODE_REVIEW_CHECKLIST.md`          | Manual review process  | Developer/reviewer guide |
| `QUICK_REVIEW_GUIDE.md`             | Rapid quality checks   | 5-minute review          |
| `.github/workflows/code-review.yml` | CI/CD automation       | Automated quality gates  |

---

## **🚀 GETTING STARTED**

1. **Open project in Cursor IDE**
2. **Rules automatically loaded** from `.cursor/rules.md`
3. **Start coding** - Cursor will provide suggestions based on rules
4. **Run manual checks** using the checklist files
5. **Automated CI/CD** validates quality on PR creation

---

**✅ Setup Complete!** Your Cursor IDE is now configured with comprehensive code quality rules.
