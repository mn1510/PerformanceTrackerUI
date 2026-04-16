# ClimbData Documentation Sync Agent Memory

## Project Context
- **Project**: ClimbData - Python 3.13 climbing route data ingestion service
- **Package manager**: uv
- **Database**: PostgreSQL with SQLAlchemy ORM + Alembic migrations
- **API**: FastAPI with Cognito JWT authentication
- **Docs location**: `/Users/mohsinnaveed/Documents/Training/ClimbApp/ClimbData/docs`

## CLAUDE.md Structure
**Key sections:**
1. Project Overview
2. Commands (CLI and API)
3. Architecture (Package Structure, Key Patterns, **Documentation**, External Dependencies)
4. The **Documentation** section is where new doc references are added

## CLAUDE.md Documentation Format
**Template:**
```
- **[Human-Readable Title](docs/filename.md)** — concise description (1-2 sentences max)
```

**Style observations:**
- Descriptions focus on what information is provided, not title restatement
- Use em-dash (—) separator
- Keep descriptions brief but actionable
- If doc covers multiple topics, highlight the primary use case first
- Alphabetical ordering is preferred when multiple docs in same category

## Current Documentation Files
1. **8a-api-endpoints.md** — Complete 8a.nu routes API reference (4 endpoints: countries, crags, sectors, routes/zlaggables), request parameters, response structures, pagination strategies, complete workflow example, known issues, rate limiting, implementation references)
2. **8a-authentication.md** — Headless browser login (existing, not added this session)
3. **8a-nu-ascents-api.md** — User ascents API (existing, not added this session)
4. **adding-custom-fields.md** — Model extension guide (typed columns vs JSONB decision tree, Alembic migrations, schema updates, patterns and troubleshooting)
5. **data-model.md** — Core data architecture (user-scoped isolation via cognito_sub, model hierarchies, source field pattern, JSONB columns, constraints, query patterns)
6. **manual-route-creation.md** — User-defined routes (geographic hierarchy setup, FastAPI endpoints, validations, ascent linking, merge patterns)

## Documentation Conventions Observed
- **Naming**: kebab-case (e.g., `data-model.md`, `adding-custom-fields.md`)
- **Structure**: Clear sections with headers, code examples, and "Related Documentation" links
- **Cross-referencing**: New docs link to related existing docs at the end (example: data-model.md links to adding-custom-fields.md)
- **Depth**: Comprehensive guides (600-850 lines) with decision trees, step-by-step instructions, and real-world examples
- **Code examples**: Include both Python classes and API curl commands where relevant
- **Best practices**: Each doc ends with a "Best Practices" section and troubleshooting

## Key Project Patterns to Remember
1. **User-scoped data**: All tables include `cognito_sub` column (AWS Cognito user identifier) for multi-tenant isolation
2. **Source field**: Both `OutdoorRoute` and `UserAscent` have `source` column ('8a' or 'manual') to track data origin
3. **8a.nu IDs**: Models have both internal `id` and `eight_a_id`/`eight_a_name` for API cross-referencing
4. **Cascade deletes**: Route hierarchy (Country → Area → Crag → Sector → OutdoorRoute) uses cascade deletes
5. **JSONB flexibility**: `raw_data` (immutable API response) and `custom_data` (user-defined metadata)
6. **Migration strategy**: Uses Alembic for schema changes; models must be updated before migrations generated

## Documentation Update Checklist
- [ ] Read new doc file(s) to understand content
- [ ] Read current CLAUDE.md to find insertion point
- [ ] Verify doc files exist at specified paths
- [ ] Write concise description (max 2 sentences, action-oriented)
- [ ] Use em-dash separator (—)
- [ ] Maintain consistent style with existing entries
- [ ] Check if docs cross-reference each other appropriately
- [ ] Update memory file with new patterns/conventions learned
