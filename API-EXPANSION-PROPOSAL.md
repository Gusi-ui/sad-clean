# 🔌 EXPANSIÓN DE API - SOPORTE PARA APP MÓVIL

## 📋 **RESUMEN**

### **Objetivo**

Expandir la API REST del panel administrativo para soportar completamente la aplicación móvil,
incluyendo autenticación robusta, sincronización de datos, geolocalización y notificaciones en
tiempo real.

### **Enfoque**

- **Backward Compatible**: Mantener compatibilidad con el panel web
- **Mobile-First**: Optimizar endpoints para uso móvil
- **Real-time**: WebSockets para actualizaciones en tiempo real
- **Offline Support**: Endpoints para sincronización offline

---

## 🏗️ **ARQUITECTURA DE API**

### **1. Estructura de Endpoints**

```
/api/
├── auth/                    # Autenticación
│   ├── login               # POST - Login trabajador
│   ├── logout              # POST - Logout
│   ├── refresh             # POST - Renovar token
│   └── validate            # GET - Validar token
├── workers/                 # Trabajadores
│   ├── :id/                # GET - Perfil trabajador
│   ├── :id/assignments     # GET - Asignaciones del trabajador
│   ├── :id/balances        # GET - Balances del trabajador
│   ├── :id/notes           # GET/POST - Notas del trabajador
│   ├── :id/route           # GET - Ruta del trabajador
│   ├── :id/location        # GET/POST - Ubicación del trabajador
│   ├── :id/notifications   # GET - Notificaciones
│   └── :id/sync            # GET/POST - Sincronización
├── assignments/             # Asignaciones
│   ├── :id/                # GET - Obtener asignación
│   ├── :id/status          # PATCH - Actualizar estado
│   ├── :id/start           # PATCH - Iniciar asignación
│   ├── :id/end             # PATCH - Finalizar asignación
│   └── :id/notes           # POST - Agregar nota
├── users/                   # Usuarios (clientes)
│   ├── :id/                # GET - Datos del usuario
│   └── :id/address         # GET - Dirección del usuario
└── holidays/                # Festivos
    ├── /                   # GET - Listar festivos
    └── validate            # POST - Validar festivos
```

---

## 🔐 **AUTENTICACIÓN ROBUSTA**

### **1. JWT con Refresh Tokens**

```typescript
// src/lib/auth/jwt.ts
interface JWTPayload {
  sub: string; // Worker ID
  email: string;
  role: "worker";
  permissions: string[];
  iat: number; // Issued at
  exp: number; // Expires at
}

interface RefreshToken {
  id: string;
  workerId: string;
  token: string;
  expiresAt: Date;
  deviceInfo: {
    deviceId: string;
    platform: string;
    appVersion: string;
  };
}
```

### **2. Endpoints de Autenticación**

```typescript
// src/app/api/auth/login/route.ts
export async function POST(request: Request) {
  try {
    const { email, password, deviceInfo } = await request.json();

    // 1. Autenticar con Supabase
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (authError) throw new Error(authError.message);

    // 2. Verificar que es un trabajador
    const { data: worker } = await supabase
      .from("auth_users")
      .select("role")
      .eq("id", authData.user.id)
      .single();

    if (worker?.role !== "worker") {
      throw new Error(
        "Acceso denegado: solo trabajadores pueden usar la app móvil",
      );
    }

    // 3. Generar tokens
    const accessToken = generateAccessToken(authData.user);
    const refreshToken = await generateRefreshToken(
      authData.user.id,
      deviceInfo,
    );

    // 4. Registrar sesión
    await logWorkerSession(authData.user.id, deviceInfo);

    return NextResponse.json({
      success: true,
      accessToken,
      refreshToken: refreshToken.token,
      expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutos
      worker: {
        id: authData.user.id,
        email: authData.user.email,
        name: authData.user.user_metadata?.name,
        role: "worker",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Error de autenticación",
      },
      { status: 401 },
    );
  }
}
```

### **3. Middleware de Autenticación**

```typescript
// src/middleware/auth.ts
export async function validateWorkerToken(
  request: Request,
): Promise<WorkerAuth | null> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;

    // Verificar que el token no ha expirado
    if (Date.now() >= decoded.exp * 1000) return null;

    // Verificar que el usuario existe y es trabajador
    const { data: worker } = await supabase
      .from("auth_users")
      .select("role")
      .eq("id", decoded.sub)
      .single();

    if (worker?.role !== "worker") return null;

    return {
      id: decoded.sub,
      email: decoded.email,
      role: "worker",
      permissions: decoded.permissions,
    };
  } catch {
    return null;
  }
}
```

---

## 📱 **ENDPOINTS ESPECÍFICOS PARA MÓVIL**

### **1. Asignaciones del Trabajador**

```typescript
// src/app/api/workers/[id]/assignments/route.ts
export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const worker = await validateWorkerToken(request);
    if (!worker || worker.id !== params.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date =
      searchParams.get("date") || new Date().toISOString().split("T")[0];
    const status = searchParams.get("status");

    let query = supabase
      .from("assignments")
      .select(
        `
        *,
        users (
          id,
          name,
          address,
          phone,
          notes
        )
      `,
      )
      .eq("worker_id", params.id)
      .eq("date", date)
      .order("start_time", { ascending: true });

    if (status) {
      query = query.eq("status", status);
    }

    const { data: assignments, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      assignments,
      date,
      total: assignments?.length || 0,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Error al obtener asignaciones",
      },
      { status: 500 },
    );
  }
}
```

### **2. Actualización de Estado de Asignación**

```typescript
// src/app/api/assignments/[id]/status/route.ts
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const worker = await validateWorkerToken(request);
    if (!worker) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { status, notes, location } = await request.json();

    // Verificar que la asignación pertenece al trabajador
    const { data: assignment } = await supabase
      .from("assignments")
      .select("worker_id, status")
      .eq("id", params.id)
      .single();

    if (!assignment || assignment.worker_id !== worker.id) {
      return NextResponse.json(
        { error: "Asignación no encontrada" },
        { status: 404 },
      );
    }

    // Validar transición de estado
    const validTransitions = {
      pending: ["in_progress", "cancelled"],
      in_progress: ["completed", "cancelled"],
      completed: [],
      cancelled: [],
    };

    if (
      !validTransitions[
        assignment.status as keyof typeof validTransitions
      ]?.includes(status)
    ) {
      return NextResponse.json(
        { error: "Transición de estado inválida" },
        { status: 400 },
      );
    }

    // Actualizar asignación
    const updateData: any = { status };

    if (status === "in_progress") {
      updateData.start_time = new Date().toISOString();
    } else if (status === "completed") {
      updateData.end_time = new Date().toISOString();
    }

    if (location) {
      updateData.location = location;
    }

    const { data, error } = await supabase
      .from("assignments")
      .update(updateData)
      .eq("id", params.id)
      .select()
      .single();

    if (error) throw error;

    // Agregar nota si se proporciona
    if (notes) {
      await supabase.from("worker_notes").insert({
        worker_id: worker.id,
        assignment_id: params.id,
        content: notes,
        created_at: new Date().toISOString(),
      });
    }

    // Notificar al admin en tiempo real
    await notifyAdmin("assignment_status_changed", {
      assignmentId: params.id,
      workerId: worker.id,
      status,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      assignment: data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Error al actualizar asignación",
      },
      { status: 500 },
    );
  }
}
```

### **3. Geolocalización**

```typescript
// src/app/api/workers/[id]/location/route.ts
export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const worker = await validateWorkerToken(request);
    if (!worker || worker.id !== params.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { latitude, longitude, accuracy, timestamp } = await request.json();

    // Validar coordenadas
    if (
      !latitude ||
      !longitude ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return NextResponse.json(
        { error: "Coordenadas inválidas" },
        { status: 400 },
      );
    }

    // Guardar ubicación
    const { error } = await supabase.from("worker_locations").insert({
      worker_id: params.id,
      latitude,
      longitude,
      accuracy,
      timestamp: timestamp || new Date().toISOString(),
    });

    if (error) throw error;

    // Notificar al admin en tiempo real
    await notifyAdmin("worker_location_updated", {
      workerId: params.id,
      location: { latitude, longitude, accuracy },
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Error al actualizar ubicación",
      },
      { status: 500 },
    );
  }
}
```

### **4. Sincronización Offline**

```typescript
// src/app/api/workers/[id]/sync/route.ts
export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const worker = await validateWorkerToken(request);
    if (!worker || worker.id !== params.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { operations, lastSync } = await request.json();

    const results = [];

    // Procesar operaciones offline
    for (const operation of operations) {
      try {
        switch (operation.type) {
          case "update_assignment_status":
            await processAssignmentStatusUpdate(operation.data);
            break;
          case "add_note":
            await processNoteCreation(operation.data);
            break;
          case "update_location":
            await processLocationUpdate(operation.data);
            break;
          default:
            throw new Error(`Operación no soportada: ${operation.type}`);
        }

        results.push({
          id: operation.id,
          success: true,
        });
      } catch (error) {
        results.push({
          id: operation.id,
          success: false,
          error: error instanceof Error ? error.message : "Error desconocido",
        });
      }
    }

    // Obtener datos actualizados
    const { data: assignments } = await supabase
      .from("assignments")
      .select("*")
      .eq("worker_id", params.id)
      .gte("updated_at", lastSync);

    const { data: notifications } = await supabase
      .from("worker_notifications")
      .select("*")
      .eq("worker_id", params.id)
      .gte("created_at", lastSync);

    return NextResponse.json({
      success: true,
      results,
      data: {
        assignments: assignments || [],
        notifications: notifications || [],
      },
      serverTime: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Error en sincronización",
      },
      { status: 500 },
    );
  }
}
```

---

## 🔄 **WEBSOCKETS PARA TIEMPO REAL**

### **1. Configuración de Supabase Realtime**

```typescript
// src/lib/realtime.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const realtimeClient = createClient(supabaseUrl, supabaseKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Suscripciones para trabajadores
export function subscribeToWorkerUpdates(
  workerId: string,
  callback: (payload: any) => void,
) {
  return realtimeClient
    .channel(`worker:${workerId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "assignments",
        filter: `worker_id=eq.${workerId}`,
      },
      callback,
    )
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "worker_notifications",
        filter: `worker_id=eq.${workerId}`,
      },
      callback,
    )
    .subscribe();
}

// Notificaciones para administradores
export function subscribeToAdminUpdates(
  adminId: string,
  callback: (payload: any) => void,
) {
  return realtimeClient
    .channel(`admin:${adminId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "assignments",
      },
      callback,
    )
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "worker_locations",
      },
      callback,
    )
    .subscribe();
}
```

### **2. Endpoint para WebSocket Connection**

```typescript
// src/app/api/realtime/connect/route.ts
export async function POST(request: Request) {
  try {
    const worker = await validateWorkerToken(request);
    if (!worker) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { deviceId } = await request.json();

    // Generar token de conexión para WebSocket
    const connectionToken = generateConnectionToken(worker.id, deviceId);

    // Registrar conexión
    await supabase.from("worker_connections").upsert({
      worker_id: worker.id,
      device_id: deviceId,
      connected_at: new Date().toISOString(),
      last_activity: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      connectionToken,
      channels: [
        `worker:${worker.id}`,
        `notifications:${worker.id}`,
        `assignments:${worker.id}`,
      ],
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Error al conectar",
      },
      { status: 500 },
    );
  }
}
```

---

## 📊 **OPTIMIZACIONES PARA MÓVIL**

### **1. Paginación y Filtros**

```typescript
// Parámetros de consulta optimizados
interface QueryParams {
  page?: number; // Página actual
  limit?: number; // Elementos por página (máx 50)
  date?: string; // Fecha específica
  status?: string[]; // Estados filtrados
  search?: string; // Búsqueda por texto
  sortBy?: string; // Campo de ordenación
  sortOrder?: "asc" | "desc"; // Orden
}
```

### **2. Respuestas Optimizadas**

```typescript
// Respuesta paginada
interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  meta: {
    timestamp: string;
    version: string;
  };
}
```

### **3. Cache y Headers**

```typescript
// Headers optimizados para móvil
const mobileHeaders = {
  "Cache-Control": "public, max-age=300", // 5 minutos
  ETag: generateETag(data),
  "Last-Modified": new Date().toUTCString(),
  "Content-Type": "application/json",
  "X-API-Version": "1.0",
  "X-Response-Time": `${responseTime}ms`,
};
```

---

## 🔒 **SEGURIDAD ADICIONAL**

### **1. Rate Limiting**

```typescript
// src/lib/rate-limit.ts
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

export async function checkRateLimit(
  identifier: string,
  limit: number,
  window: number,
): Promise<boolean> {
  const key = `rate_limit:${identifier}`;
  const current = await redis.incr(key);

  if (current === 1) {
    await redis.expire(key, window);
  }

  return current <= limit;
}
```

### **2. Validación de Dispositivos**

```typescript
// Verificar dispositivo autorizado
export async function validateDevice(
  workerId: string,
  deviceId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from("worker_devices")
    .select("authorized")
    .eq("worker_id", workerId)
    .eq("device_id", deviceId)
    .single();

  return data?.authorized || false;
}
```

---

## 🚀 **IMPLEMENTACIÓN GRADUAL**

### **Fase 1: Endpoints Básicos (Semana 1-2)**

- [ ] Autenticación JWT
- [ ] Endpoints de asignaciones
- [ ] Middleware de autenticación
- [ ] Validaciones básicas

### **Fase 2: Funcionalidades Avanzadas (Semana 3-4)**

- [ ] Geolocalización
- [ ] Sincronización offline
- [ ] WebSockets básicos
- [ ] Notificaciones

### **Fase 3: Optimización (Semana 5-6)**

- [ ] Rate limiting
- [ ] Cache optimizado
- [ ] Paginación
- [ ] Testing completo

### **Fase 4: Monitoreo (Semana 7)**

- [ ] Logs de auditoría
- [ ] Métricas de rendimiento
- [ ] Alertas automáticas
- [ ] Documentación API

---

## 📋 **CHECKLIST DE IMPLEMENTACIÓN**

### **Backend (Panel Web)**

- [ ] Expandir API endpoints
- [ ] Implementar JWT con refresh tokens
- [ ] Configurar WebSockets
- [ ] Agregar validaciones de seguridad
- [ ] Optimizar consultas para móvil
- [ ] Implementar rate limiting
- [ ] Configurar CORS para móvil
- [ ] Crear documentación API

### **Base de Datos**

- [ ] Tabla `worker_locations`
- [ ] Tabla `worker_notifications`
- [ ] Tabla `worker_devices`
- [ ] Tabla `worker_connections`
- [ ] Tabla `refresh_tokens`
- [ ] Índices optimizados
- [ ] Políticas RLS

### **Seguridad**

- [ ] Validación de tokens
- [ ] Rate limiting
- [ ] Sanitización de datos
- [ ] Logs de auditoría
- [ ] Headers de seguridad
- [ ] Validación de dispositivos

**¿Quieres que empecemos implementando alguna fase específica?** 🚀
