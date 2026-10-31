# TODO

Open roadmap and known issues for the pg-observability-map project.

## CHANGELOG

- 1.0.0 - 2026-10-31 🎃 Initial release


## Planned

### Data
- [ ] Add pgPedia links

### UI/UX (nice to have)
- [ ] Improve accessibility (keyboard navigation)
- [ ] Collapsible sidebars on mobile
- [ ] Consider grouping sidebar by category
- [ ] Remove CDN (Tailwind CSS)

### Docs/Deploy
- [ ] Verify GitHub Pages path matches repo name


## Not planned (for now)
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

### Data
- [x] Verify pre-10 entries against official docs (manually verified all the items)
- [x] Review `pg_statio_*` details
- [x] Extensions data

### UI/UX (nice to have)
- [X] Resize item lists
- [X] Remove the legend box
- [X] Remove CDN (Font Awesome, Google Fonts)

### Docs/Deploy
- [x] Add screenshot to README
