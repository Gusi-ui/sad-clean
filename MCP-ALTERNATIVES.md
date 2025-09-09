# 🔗 Alternativas para Integrar Supabase con Cursor

## 📋 **Situación Actual**

El paquete `@modelcontextprotocol/server-supabase` no está disponible públicamente en npm. Sin
embargo, hay varias alternativas excelentes para integrar Supabase con Cursor.

## 🎯 **Alternativas Disponibles**

### **1. Supabase CLI + Generación de Tipos**

#### **Instalación**

```bash
npm install --save-dev supabase
```

#### **Configuración**

```bash
# Iniciar sesión en Supabase
npx supabase login

# Vincular proyecto
npx supabase link --project-ref tu-project-id

# Generar tipos TypeScript
npx supabase gen types typescript --project-id tu-project-id > src/types/supabase.ts
```

#### **Uso en Cursor**

- Los tipos generados estarán disponibles automáticamente
- Cursor puede usar estos tipos para autocompletado
- Validación de esquema en tiempo real

### **2. Supabase Studio + Copilot**

#### **Configuración**

1. Abre Supabase Studio
2. Ve a la sección SQL Editor
3. Usa Copilot para generar queries
4. Copia y pega en tu código

#### **Ventajas**

- Interfaz visual para explorar el esquema
- Generación de queries con IA
- Validación automática de sintaxis

### **3. Custom MCP Server**

#### **Crear servidor MCP personalizado**

```typescript
// mcp-supabase-server.ts
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createClient } from "@supabase/supabase-js";

const server = new Server(
  {
    name: "supabase-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

// Implementar métodos para consultar Supabase
server.setRequestHandler("tools/call", async (request) => {
  // Lógica para consultar Supabase
});
```

### **4. Cursor Extensions**

#### **Instalación de Extensiones**

1. Abre Cursor
2. Ve a Extensions
3. Busca "Supabase" o "Database"
4. Instala extensiones relevantes

#### **Extensiones Recomendadas**

- Supabase (oficial)
- SQL Tools
- Database Client

## 🚀 **Configuración Recomendada para SAD LAS**

### **Paso 1: Instalar Supabase CLI**

```bash
npm install --save-dev supabase
```

### **Paso 2: Configurar tipos automáticos**

```bash
# Crear script en package.json
{
  "scripts": {
    "db:types": "supabase gen types typescript --project-id tu-project-id > src/types/supabase.ts",
    "db:types:watch": "nodemon --watch src --exec 'npm run db:types'"
  }
}
```

### **Paso 3: Configurar Cursor**

Crear `.cursor/settings.json`:

```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.suggest.autoImports": true,
  "files.associations": {
    "*.sql": "sql"
  },
  "sqlTools.connections": [
    {
      "name": "Supabase",
      "driver": "PostgreSQL",
      "server": "db.tu-proyecto.supabase.co",
      "port": 5432,
      "database": "postgres",
      "username": "postgres",
      "password": "tu-password"
    }
  ]
}
```

### **Paso 4: Crear utilidades de BD**

```typescript
// src/lib/database.ts
import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/types/supabase";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Funciones helper para SAD LAS
export const getWorkers = async () => {
  const { data, error } = await supabase
    .from("workers")
    .select("*")
    .eq("status", "active");

  if (error) throw error;
  return data;
};

export const getAssignments = async (workerId?: string) => {
  let query = supabase.from("assignments").select("*");

  if (workerId) {
    query = query.eq("worker_id", workerId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};
```

## 📊 **Casos de Uso para SAD LAS**

### **1. Gestión de Workers**

```typescript
// Cursor puede usar los tipos generados automáticamente
import type { Database } from "@/types/supabase";

type Worker = Database["public"]["Tables"]["workers"]["Row"];

const createWorker = async (worker: Omit<Worker, "id" | "created_at">) => {
  const { data, error } = await supabase
    .from("workers")
    .insert(worker)
    .select()
    .single();

  if (error) throw error;
  return data;
};
```

### **2. Asignaciones de Tareas**

```typescript
type Assignment = Database["public"]["Tables"]["assignments"]["Row"];

const getWorkerAssignments = async (workerId: string) => {
  const { data, error } = await supabase
    .from("assignments")
    .select(
      `
      *,
      workers (name, email),
      tasks (title, description)
    `,
    )
    .eq("worker_id", workerId);

  if (error) throw error;
  return data;
};
```

### **3. Reportes y Estadísticas**

```typescript
const getWorkerStats = async (
  workerId: string,
  startDate: string,
  endDate: string,
) => {
  const { data, error } = await supabase
    .from("assignments")
    .select("hours_worked, status")
    .eq("worker_id", workerId)
    .gte("scheduled_date", startDate)
    .lte("scheduled_date", endDate);

  if (error) throw error;

  const totalHours = data.reduce(
    (sum, assignment) => sum + (assignment.hours_worked || 0),
    0,
  );
  const completedTasks = data.filter((a) => a.status === "completed").length;

  return { totalHours, completedTasks, totalTasks: data.length };
};
```

## 🎯 **Comandos Útiles**

### **Generar tipos automáticamente**

```bash
npm run db:types
```

### **Sincronizar esquema**

```bash
npx supabase db pull
```

### **Ejecutar migraciones**

```bash
npx supabase db push
```

### **Verificar conexión**

```bash
npx supabase status
```

## 🔍 **Verificación de Funcionamiento**

### **1. En Cursor, puedes preguntar:**

- "Muéstrame cómo usar los tipos de Supabase"
- "Genera una función para crear workers"
- "Crea un query para obtener asignaciones"
- "Sugiere mejoras en la estructura de datos"

### **2. Cursor podrá:**

- ✅ Usar tipos TypeScript generados automáticamente
- ✅ Generar código basado en el esquema real
- ✅ Validar queries contra la BD
- ✅ Sugerir mejoras en la estructura

## 🚨 **Solución de Problemas**

### **Error: "Cannot find module @supabase/supabase-js"**

```bash
npm install @supabase/supabase-js
```

### **Error: "Types not generated"**

```bash
npm run db:types
```

### **Error: "Connection failed"**

```bash
# Verificar variables de entorno
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
```

## 📚 **Recursos Adicionales**

- [Supabase CLI Documentation](https://supabase.com/docs/reference/cli)
- [Supabase TypeScript](https://supabase.com/docs/guides/api/typescript-support)
- [Cursor Extensions](https://cursor.sh/docs/extensions)

## 🎯 **Próximos Pasos**

1. **Instalar Supabase CLI**: `npm install --save-dev supabase`
2. **Configurar tipos automáticos**: Crear script en package.json
3. **Generar tipos iniciales**: `npm run db:types`
4. **Configurar Cursor**: Crear .cursor/settings.json
5. **Probar integración**: Crear funciones helper

---

**¡Con estas alternativas, tendrás una integración potente entre Cursor y Supabase para SAD LAS!
🚀**
