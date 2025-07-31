# 🔗 MCP de Supabase en Cursor

## 📋 **¿Qué es MCP?**

MCP (Model Context Protocol) es un protocolo que permite a los modelos de IA acceder a herramientas
y datos externos de forma segura y estructurada. En nuestro caso, nos permite conectar Cursor
directamente con Supabase.

## 🎯 **Beneficios de MCP de Supabase**

### **Para el Desarrollo**

- ✅ **Acceso directo a la BD**: Cursor puede consultar tu esquema de Supabase
- ✅ **Generación de queries**: Crea SQL automáticamente basado en tu esquema
- ✅ **Tipos TypeScript**: Genera tipos basados en tus tablas
- ✅ **Validación de esquema**: Verifica que el código coincida con la BD
- ✅ **Sugerencias inteligentes**: Mejora la estructura de datos

### **Para el Proyecto SAD LAS**

- ✅ **Gestión de workers**: Cursor entiende la estructura de usuarios
- ✅ **Asignaciones**: Puede generar queries para tareas y horarios
- ✅ **Reportes**: Crea consultas para balances y estadísticas
- ✅ **Autenticación**: Integra con el sistema de auth de Supabase

## 🚀 **Instalación y Configuración**

### **1. Ejecutar el script de configuración**

```bash
./setup-mcp.sh
```

### **2. Verificar variables de entorno**

Asegúrate de que tu `.env.local` tenga:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
```

### **3. Reiniciar Cursor**

Cierra y vuelve a abrir Cursor para cargar la configuración MCP.

## 🔧 **Configuración Manual (Alternativa)**

Si prefieres configurar manualmente:

### **1. Instalar el servidor MCP**

```bash
npm install --save-dev @modelcontextprotocol/server-supabase
```

### **2. Crear configuración de Cursor**

Crear `.cursor/settings.json`:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-supabase"],
      "env": {
        "SUPABASE_URL": "${env:NEXT_PUBLIC_SUPABASE_URL}",
        "SUPABASE_ANON_KEY": "${env:NEXT_PUBLIC_SUPABASE_ANON_KEY}",
        "SUPABASE_SERVICE_ROLE_KEY": "${env:SUPABASE_SERVICE_ROLE_KEY}"
      }
    }
  }
}
```

## 📊 **Casos de Uso para SAD LAS**

### **1. Gestión de Workers**

```typescript
// Cursor puede generar automáticamente:
interface Worker {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  created_at: string;
}

// Y queries como:
const getActiveWorkers = async () => {
  const { data, error } = await supabase.from('workers').select('*').eq('status', 'active');
  return data;
};
```

### **2. Asignaciones de Tareas**

```typescript
// Cursor puede crear tipos para asignaciones:
interface Assignment {
  id: string;
  worker_id: string;
  task_id: string;
  scheduled_date: string;
  status: 'pending' | 'in_progress' | 'completed';
  hours_worked?: number;
}
```

### **3. Reportes y Estadísticas**

```sql
-- Cursor puede generar queries complejas:
SELECT
  w.name,
  COUNT(a.id) as total_assignments,
  SUM(a.hours_worked) as total_hours
FROM workers w
LEFT JOIN assignments a ON w.id = a.worker_id
WHERE a.created_at >= NOW() - INTERVAL '30 days'
GROUP BY w.id, w.name;
```

## 🎯 **Comandos Útiles**

### **Verificar instalación**

```bash
npx @modelcontextprotocol/server-supabase --help
```

### **Test de conexión**

```bash
npx @modelcontextprotocol/server-supabase --test-connection
```

### **Generar tipos de Supabase**

```bash
npx supabase gen types typescript --project-id tu-project-id > src/types/supabase.ts
```

## 🔍 **Verificación de Funcionamiento**

### **1. En Cursor, puedes preguntar:**

- "Muéstrame la estructura de la tabla workers"
- "Genera un query para obtener workers activos"
- "Crea tipos TypeScript para la tabla assignments"
- "Sugiere mejoras en el esquema de la BD"

### **2. Cursor podrá:**

- ✅ Acceder a tu esquema de Supabase
- ✅ Generar queries SQL válidas
- ✅ Crear tipos TypeScript automáticamente
- ✅ Sugerir optimizaciones de BD
- ✅ Validar que el código coincida con el esquema

## 🚨 **Solución de Problemas**

### **Error: "Cannot connect to Supabase"**

```bash
# Verificar variables de entorno
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
echo $SUPABASE_SERVICE_ROLE_KEY
```

### **Error: "MCP server not found"**

```bash
# Reinstalar el servidor MCP
npm uninstall @modelcontextprotocol/server-supabase
npm install --save-dev @modelcontextprotocol/server-supabase
```

### **Error: "Permission denied"**

```bash
# Verificar permisos del script
chmod +x setup-mcp.sh
```

## 📚 **Recursos Adicionales**

- [Documentación oficial de MCP](https://modelcontextprotocol.io/)
- [Supabase MCP Server](https://github.com/modelcontextprotocol/server-supabase)
- [Cursor MCP Integration](https://cursor.sh/docs/mcp)

## 🎯 **Próximos Pasos**

1. **Ejecutar el script de configuración**
2. **Verificar la conexión con Supabase**
3. **Probar consultas básicas en Cursor**
4. **Generar tipos automáticamente**
5. **Optimizar el esquema de la BD**

---

**¡Con MCP de Supabase, Cursor será tu compañero perfecto para desarrollar SAD LAS! 🚀**
