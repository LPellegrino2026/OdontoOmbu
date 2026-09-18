// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

import { createMcpHandler, McpServer } from "npm:@modelcontextprotocol/server@^2.0.0";
import { z } from "npm:zod@^4.3.6";
import { createClient } from "npm:@supabase/supabase-js@^2";

// Secreto compartido para no dejar el endpoint MCP abierto al público,
// ya que las tools de abajo leen datos de pacientes con la service role key
// (bypass de RLS). Configuralo con:
//   supabase secrets set MCP_SECRET=algo-largo-y-random
const MCP_SECRET = Deno.env.get("MCP_SECRET");

const handler = createMcpHandler(() => {
  const server = new McpServer({ name: "odontologia-ombu-mcp", version: "0.1.0" });

  server.registerTool(
    "listar_turnos",
    {
      title: "Listar turnos",
      description:
        "Lista turnos agendados, opcionalmente filtrados por fecha (YYYY-MM-DD) y/o estado.",
      inputSchema: z.object({
        fecha: z.string().optional().describe("Fecha exacta en formato YYYY-MM-DD"),
        estado: z
          .enum(["confirmado", "cancelado", "reprogramado", "completado"])
          .optional(),
      }),
    },
    async ({ fecha, estado }) => {
      const supabaseAdmin = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      );

      let query = supabaseAdmin
        .from("turnos")
        .select(
          "id, fecha, hora_inicio, hora_fin, estado, comentario, pacientes(nombre, apellido), odontologos(nombre, apellido), tratamientos(nombre)",
        )
        .order("fecha", { ascending: true });

      if (fecha) query = query.eq("fecha", fecha);
      if (estado) query = query.eq("estado", estado);

      const { data, error } = await query;

      if (error) {
        return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
      }

      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.registerTool(
    "listar_tratamientos",
    {
      title: "Listar tratamientos",
      description:
        "Lista los tratamientos ofrecidos por la clínica, opcionalmente filtrados por estado activo.",
      inputSchema: z.object({
        soloActivos: z
          .boolean()
          .optional()
          .describe("Si es true, devuelve solo los tratamientos activos (default: true)"),
      }),
    },
    async ({ soloActivos }) => {
      const supabaseAdmin = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      );

      let query = supabaseAdmin
        .from("tratamientos")
        .select("id, nombre, descripcion, duracion_min, activo")
        .order("id", { ascending: true });

      if (soloActivos ?? true) query = query.eq("activo", true);

      const { data, error } = await query;

      if (error) {
        return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
      }

      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.registerTool(
    "cancelar_turno",
    {
      title: "Cancelar turno",
      description: "Cancela un turno por su id, marcándolo como 'cancelado'.",
      inputSchema: z.object({
        id: z.number().int().describe("Id del turno a cancelar"),
      }),
    },
    async ({ id }) => {
      const supabaseAdmin = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      );

      const { data, error } = await supabaseAdmin
        .from("turnos")
        .update({ estado: "cancelado" })
        .eq("id", id)
        .select(
          "id, fecha, hora_inicio, hora_fin, estado, pacientes(nombre, apellido), odontologos(nombre, apellido), tratamientos(nombre)",
        )
        .single();

      if (error) {
        return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
      }

      return {
        content: [{ type: "text", text: `Turno cancelado:\n${JSON.stringify(data, null, 2)}` }],
      };
    },
  );

  return server;
});

Deno.serve((req) => {
  if (MCP_SECRET) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${MCP_SECRET}`) {
      return new Response("Unauthorized", { status: 401 });
    }
  }
  return handler.fetch(req);
});

/* Para probarlo local:

  1. `supabase start`
  2. `supabase functions serve mcp --env-file ./supabase/.env.local` (con MCP_SECRET, SUPABASE_SERVICE_ROLE_KEY, etc.)
  3. Registrarlo en Claude Code:
       claude mcp add --transport http odontologia-mcp http://127.0.0.1:54321/functions/v1/mcp \
         --header "Authorization: Bearer <tu MCP_SECRET>"

*/
