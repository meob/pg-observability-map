# TODO

Open roadmap and known issues for the pg-observability-map project.

## CHANGELOG

- 1.0.1 - 2026-11-12 Desktop viewport auto-fit, pgPedia links, "Further reading" links, data-driven version handling, light/dark theme, optional item links, docs URL fixes
- 1.0.0 - 2026-10-31 🎃 Initial release


## Planned

### UI/UX (nice to have)
- [ ] Improve accessibility (keyboard navigation)
- [ ] Collapsible sidebars on mobile
- [ ] Consider grouping sidebar by category
- [ ] Remove CDN (Tailwind CSS)


## Not planned (for now)
- [ ] Additional deep-dive links beyond the curated set (see notes below)
- [ ] Refine Mermaid export generation (improve layout, grouping and readability)
- [ ] Lightweight diff between two versions (not needed)
- [ ] Filter "new in selected version" (not needed)
- [ ] Subtle SVG connectors between diagram and sidebar (not needed)
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
- [x] Empty state message for search/filter
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
- [x] Curate further reading links

### UI/UX (nice to have)
- [x] Light/dark theme toggle with `?theme=` deep link (dark by default)
- [x] Optional item links toggle with `?links=` deep link
- [x] Resize item lists
- [x] Remove the legend box
- [x] Remove CDN (Font Awesome, Google Fonts)
- [x] Auto-fit desktop layout to the viewport at 100% (no browser zoom required)
- [x] Treat `?lists=` as a maximum height to avoid clipping on short screens

### Docs/Deploy
- [x] Publish 1.0.1 after validation and planned feature additions
- [x] Add screenshot to README
- [x] Verify GitHub Pages path matches repo name
- [x] Enable GitHub Pages from `main` / `docs`
- [x] Update README live link to avoid a fixed list height


### Further reading notes

Added as `extraLink` in the JSON file

Sections:
- Explaining the unexplainable (`query_planning`)   	https://www.depesz.com/2013/04/16/explaining-the-unexplainable/
- Query Processing (`query_execution`)   		https://www.interdb.jp/pg/pgsql03/01.html
- Process Architecture (`postmaster`)   		https://www.interdb.jp/pg/pgsql02/01.html
- Parallel Query (`bg_workers`)   			https://www.interdb.jp/pg/pgsql03/07.html
- Tuning autovacuum (`autovacuum_workers`)  		https://www.cybertec-postgresql.com/en/tuning-autovacuum-postgresql/
- Use The Index, Luke! (`indexes_usage`)		https://use-the-index-luke.com/
- EXPLAIN and buffers (`buffers_io`)			https://www.depesz.com/2021/06/20/explaining-the-unexplainable-part-6-buffers/
- Write-Ahead Logging (`wal`)				https://www.interdb.jp/pg/pgsql09/01.html
- Monitoring PostgreSQL replication (`replication`)	https://www.cybertec-postgresql.com/en/monitoring-postgresql-replication/
- PostgreSQL: What is a checkpoint? (`checkpointer`)	https://www.cybertec-postgresql.com/en/postgresql-what-is-a-checkpoint/
- Database Recovery (`recovery_process`)		https://www.interdb.jp/pg/pgsql09/08.html
- The physical structure of a database (`data_files`)	https://www.interdb.jp/pg/pgsql01/02.html
- Limiting Postgres Connections (`network`)		https://www.enterprisedb.com/blog/limiting-postgres-connections

Items:
- PEV2 plan visualizer (`EXPLAIN / EXPLAIN ANALYZE`)	https://explain.dalibo.com/
- Lock monitoring queries (`pg_locks`)			https://wiki.postgresql.org/wiki/Lock_Monitoring
- Reading a PG assessment report (`pg_stat_all_tables`)	https://www.meo.bogliolo.name/pub/how-to-read-pg2html.htm#reading-a-report-during-a-performance-investigation
- pg_stat_io for DBAs (`pg_stat_io`)			https://pganalyze.com/blog/5mins-postgres-16-pg-stat-io-dba
- Waiting for pg_stat_statements (`pg_stat_statements`)	https://www.depesz.com/2009/01/13/waiting-for-84-pg_stat_statements/
- REPACK CONCURRENTLY (`pg_stat_progress_repack`) 	https://www.cybertec-postgresql.com/en/cybertecs-contributions-to-postgresql-19/#the-big-change-repack-concurrently-by-antonin-houska

Candidates:
- Buffer management mechanisms (`shared_buffers`)   	https://www.interdb.jp/pg/pgsql08/04.html
- HOT updates in PostgreSQL (`tables_usage`)		https://www.cybertec-postgresql.com/en/hot-updates-in-postgresql-for-better-performance/
- Commit Log (CLOG) (`slru_caches`) 			https://www.interdb.jp/pg/pgsql05/04.html
- Streaming Replication (`replication`)			https://www.interdb.jp/pg/pgsql11/01.html
- https://www.cybertec-postgresql.com/en/monitor-autovacuum-my-queries
- https://www.cybertec-postgresql.com/en/row-locks-in-postgresql/
- https://www.enterprisedb.com/blog/when-autovacuum-does-not-vacuum
- https://www.enterprisedb.com/postgres-tutorials/introduction-postgresql-performance-tuning-and-optimization
- https://pganalyze.com/blog/postgres-in-production-pg-stat-statements-deep-dive-part-4
- https://www.crunchydata.com/blog/postgres-data-flow
- https://www.crunchydata.com/blog/the-rest-is-history-investigations-of-wal-history-files
- https://www.enterprisedb.com/blog/postgresql-vacuum-and-analyze-best-practice-tips
- https://www.crunchydata.com/blog/exposing-postgres-performance-secrets
- https://www.enterprisedb.com/blog/postgresql-wal-write-ahead-logging-management-strategy-tradeoffs
