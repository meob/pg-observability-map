# TODO

Open roadmap and known issues for the pg-observability-map project.

## CHANGELOG

- Unreleased (1.0.1) - Desktop viewport auto-fit, metadata cleanup, pgPedia links, data-driven version handling, "Further reading" links, README link update
- 1.0.0 - 2026-10-31 🎃 Initial release


## Planned

### UI/UX (nice to have)
- [ ] Improve accessibility (keyboard navigation)
- [ ] Collapsible sidebars on mobile
- [ ] Consider grouping sidebar by category
- [ ] Remove CDN (Tailwind CSS)

### Docs/Deploy
- [ ] Publish 1.0.1 after validation and planned feature additions


## Not planned (for now)
- [ ] Additional deep-dive links (candidates excluded from 1.0.1):
  - explain.depesz.com — https://explain.depesz.com/
  - pganalyze connection tracing / wait events — https://pganalyze.com/blog/postgres-connection-tracing-wait-event-analysis-and-vacuum-monitoring
  - CYBERTEC autovacuum monitoring — https://www.cybertec-postgresql.com/en/monitor-autovacuum-my-queries/
  - CYBERTEC checkpoint internals — https://www.cybertec-postgresql.com/en/postgresql-what-is-a-checkpoint/
  - pg_qualstats — https://github.com/powa-team/pg_qualstats/
  - pg_activity — https://github.com/dalibo/pg_activity
- [ ] Refine Mermaid export generation (improve layout, grouping and readability)
- [ ] Lightweight diff between two versions (not needed)
- [ ] Filter "new in selected version" (not needed)
- [ ] Subtle SVG connectors between diagram and sidebar (not needed)
- [ ] Light mode (but dark mode is cool)
- [ ] Add more items (but *Lightness* is important)
- [ ] Remove some items (but *Completeness* is important too)
- [ ] Add links to my pages (cool but written in Italian, sorry: it is not a good idea)


## DONE

### Small fixes
- [x] Add legend explaining badges, dimmed/locked states
- [x] Show "REMOVED in X" badge for items with removedVersion (prepared)
- [x] Add "Copy link" button for deep linking
- [x] Make "Introduced in PG X" badge version-specific (use target version for docs link)
- [x] Remove duplicate "View docs" button
- [x] Remove Mermaid export (button/modal/code)
- [x] Tooltip for locked/unsupported items
- [x] Link section names to docs
- [x] Update footer text to "Source code: GitHub"
- [X] Empty state message for search/filter
- [x] Manage Extensions
- [x] Persist display mode in URL (?mode=dim|hide)
- [x] Fix charset placement, add meta description, correct JSON-LD language/page URL
- [x] Remove duplicate code and unused Mermaid references
- [x] Data-driven supported/default versions and dynamic version badge colors

### Data
- [x] Optional `extraLink` "Further reading" resources for items and sections
- [x] Verify pre-10 entries against official docs (manually verified all the items)
- [x] Review `pg_statio_*` details
- [x] Extensions data
- [x] Add pgPedia links in the detail panel (direct URLs; missing pages omitted)

### UI/UX (nice to have)
- [X] Resize item lists
- [X] Remove the legend box
- [X] Remove CDN (Font Awesome, Google Fonts)
- [x] Auto-fit desktop layout to the viewport at 100% (no browser zoom required)
- [x] Treat `?lists=` as a maximum height to avoid clipping on short screens

### Docs/Deploy
- [x] Add screenshot to README
- [x] Verify GitHub Pages path matches repo name
- [x] Enable GitHub Pages from `main` / `docs`
- [x] Update README live link to avoid a fixed list height
