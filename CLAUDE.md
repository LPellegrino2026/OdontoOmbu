# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All frontend commands run from `odontologia-ombu-react/`:

```
npm run dev       # Vite dev server
npm run build     # production build
npm run lint      # oxlint
npm run preview   # preview production build
```

There is no test suite configured.

Supabase (requires the Supabase CLI, linked to project ref `wqzwvfdazdchuurrzxee`):

```
supabase migration new <name>   # create a new migration in supabase/migrations
supabase db push                # apply local migrations to the linked (cloud) project
supabase functions serve mcp --env-file ./supabase/.env.local   # run the mcp edge function locally
```

`supabase start`/`supabase status` require Docker, which is not available in this environment — the local Docker dev stack cannot be used here. Treat the cloud project as the only reachable environment (see below).

## Architecture

This repo has two parts: a Vite/React frontend (`odontologia-ombu-react/`) and a Supabase backend (`supabase/`, schema + one edge function). `Sitio Odontologia ombu/` is the original static HTML site the React app replaced; it's kept only as a content/asset reference, not part of the build.

**Frontend talks to Supabase directly**, no app server. `src/lib/supabaseClient.js` creates the client from `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` (`.env`, pointed at the cloud project). `src/lib/api.js` is the only data-access layer: plain selects for `tratamientos`/`odontologos`/`disponibilidad`, and two RPCs — `crear_turno` (atomic patient+appointment creation from the public booking form) and `obtener_agenda_staff` (staff login + full agenda in one call). `App.jsx` does hash-based routing (`#doctores` → staff agenda page in `components/doctores/DoctoresPage.jsx`, anything else → the public site); there is no react-router.

**Database/RLS model** (`supabase/migrations/`): reference tables (`tratamientos`, `odontologos`, `odontologo_tratamiento`, `obras_sociales`, `disponibilidad`) are public-read. `pacientes` and `turnos` are insert-only for `anon`/`authenticated` — there's no public SELECT on them. Public availability is exposed instead through the `turnos_ocupados` view (only `odontologo_id, fecha, hora_inicio, hora_fin`, no patient data), and staff/agenda access goes through the `obtener_agenda_staff` RPC (checks `staff_credenciales`) rather than direct table reads.

**Local migration files are incomplete.** `supabase/migrations/` only has 3 files (`create_tabla`, `rls_policies`, `secure_turnos_view`), but the linked cloud project has 8 applied migrations (also `seed_datos_ejemplo`, `crear_turno_rpc`, `fix_crear_turno_ambiguous_column`, `staff_login_agenda`, `fix_agenda_staff_types`). The RPCs referenced by `src/lib/api.js` (`crear_turno`, `obtener_agenda_staff`) only exist in the cloud project's history, not locally. Before assuming the schema from local files, check the actual state with the `supabase` MCP tool (`list_migrations`/`execute_sql` against project `wqzwvfdazdchuurrzxee`) or run `supabase db pull`.

**Two look-alike Supabase targets — don't confuse them:**
- The **cloud project** `wqzwvfdazdchuurrzxee` is the real one: it's what the deployed frontend's `.env` points to, and it holds all real data (patients, turnos, etc.).
- The **local Docker dev stack** (`supabase start`, ports documented in `notas.txt`) is a separate, normally-empty database. The `mcp` edge function (`supabase/functions/mcp/index.ts`) is registered as an MCP server pointing at this local stack (`http://127.0.0.1:54321/functions/v1/mcp`) and reads via the service-role key — but it is *not* deployed to the cloud project, and the local stack requires Docker (unavailable here). Its tools (`listar_turnos`, etc.) will look empty/broken for reasons unrelated to the real data; query the cloud project directly instead (via the `supabase` MCP server, or `psql`/Studio against `wqzwvfdazdchuurrzxee`).
