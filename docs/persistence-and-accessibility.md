# Technical Architecture: Persistence & Accessibility

## Persistence Strategy

### Local-First Approach (Default)

FocusFlow adopts a **privacy-first, local-first** data strategy:

- **Primary storage**: Browser `localStorage` via centralized `src/lib/storage.ts` wrapper
- **Namespace**: All keys prefixed with `focus-flow:v1:` to avoid conflicts
- **Version management**: Storage version tracked for future schema migrations
- **No external dependencies**: App works fully offline without authentication

### Data Flow

```
User Action → React State → useLocalStorage Hook → storage.ts → localStorage
                                                              ↓
                                              CustomEvent('local-storage')
                                                              ↓
                                          All tabs react via useSyncExternalStore
```

### Benefits

1. **Privacy**: User data never leaves their device by default
2. **Speed**: No network latency; instant reads/writes
3. **Offline-capable**: Full functionality without internet
4. **Zero cost**: No backend infrastructure needed
5. **GDPR compliant**: No data collection or processing

### Future: Optional Cloud Sync (Opt-in)

To support multi-device usage, we can add:

- **Opt-in sync**: User must explicitly enable cloud backup
- **End-to-end encryption**: Data encrypted client-side before upload
- **Conflict resolution**: Last-write-wins or manual merge strategies
- **Selective sync**: User chooses what to sync (e.g., only goals, not finances)

Implementation considerations:

- Use Auth0 for identity
- Store encrypted blobs in S3/Firestore/Supabase
- Keep localStorage as source of truth; cloud is backup
- Allow export/import of data as JSON for portability

---

## Accessibility Guidelines

### Current Implementation

FocusFlow uses **Radix UI primitives** via shadcn/ui, which provide:

- ✅ **Keyboard navigation**: All interactive elements accessible via Tab/Enter/Escape
- ✅ **Focus management**: Visible focus rings (`focus-visible:ring-2`)
- ✅ **ARIA attributes**: Proper roles, labels, and live regions
- ✅ **Screen reader support**: Semantic HTML and descriptive labels

### Motion Preferences

Added `prefers-reduced-motion` support in `globals.css`:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

This respects users with vestibular disorders or motion sensitivity.

### Component Checklist

When creating new components, ensure:

- [ ] Use semantic HTML (`<button>`, `<nav>`, `<main>`, etc.)
- [ ] Provide `aria-label` for icon-only buttons
- [ ] Use `<label>` with `htmlFor` for form inputs
- [ ] Test keyboard-only navigation (Tab, Enter, Escape, Arrow keys)
- [ ] Verify focus order is logical
- [ ] Check color contrast (WCAG AA minimum: 4.5:1 for text)
- [ ] Add loading states with `aria-live="polite"`
- [ ] Use `role="status"` for toast notifications

### Testing Tools

Recommended for validation:

- **axe DevTools**: Browser extension for automated a11y audits
- **Lighthouse**: Built into Chrome DevTools
- **NVDA/VoiceOver**: Manual screen reader testing
- **Keyboard-only test**: Unplug mouse and navigate entire app

---

## Performance Considerations

### LocalStorage Limits

- **Quota**: ~5-10MB per origin (varies by browser)
- **Monitoring**: Use `getStorageInfo()` from `storage.ts` to check usage
- **Mitigation**:
  - Archive old data (e.g., logs older than 6 months)
  - Offer export/download of historical data
  - Warn user when approaching 80% quota

### React Performance

- **useMemo/useCallback**: Used to prevent unnecessary re-renders
- **Lazy loading**: Code-split routes with `next/dynamic`
- **Virtualization**: For large lists (>100 items), consider `react-window`

---

## Security Notes

Since data is client-side:

- **No sensitive PII**: Avoid storing SSN, full credit card numbers, etc.
- **Session tokens**: If using Auth0, tokens stored in httpOnly cookies (handled by SDK)
- **XSS protection**: Next.js sanitizes JSX; avoid `dangerouslySetInnerHTML`
- **Content Security Policy**: Consider adding CSP headers in production

---

## Developer Workflows

### Adding a New Feature

1. Define types in `src/lib/types.ts`
2. Use `useLocalStorage` hook for persistence
3. Add UI components in `src/app/(features)/`
4. Test keyboard navigation and screen reader
5. Verify `prefers-reduced-motion` behavior
6. Update this doc if introducing new storage patterns

### Debugging Storage Issues

```typescript
import { listAppKeys, getStorageInfo } from "@/lib/storage";

// List all stored keys
console.log("Stored keys:", listAppKeys());

// Check quota usage
getStorageInfo().then((info) => console.log("Storage:", info));
```

---

**Last Updated**: November 6, 2025  
**Maintained by**: FocusFlow Development Team
