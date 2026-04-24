## Why

El sistema actual de Todos carece de funcionalidades esenciales para una gestión efectiva del trabajo: no soporta jerarquía de tareas (sub-tareas), las categorías son simples etiquetas sin metadatos, no existe un sistema de filtros avanzados, y no hay vistas agregadas como "Hoy" o "Semana". Estas limitaciones dificultan la organización, seguimiento y priorización del trabajo diario.

## What Changes

- **Nuevo**: Sistema de jerarquía de tareas con sub-tareas recursivas
- **Nuevo**: Modelo de categorías con metadatos (color, icono, descripción) y anidamiento
- **Nuevo**: Sistema de vistas dinámicas (agrupar por categoría, prioridad, estado)
- **Nuevo**: Campo de estimación de esfuerzo (tiempo)
- **Nuevo**: Dashboard con métricas y vista "Hoy/Semana"
- **Nuevo**: Sistema de filtros avanzados y búsqueda inteligente
- **Modificación**: Fecha de vencimiento ahora obligatoria conhora

## Capabilities

### New Capabilities

- `task-hierarchy`: Sistema de sub-tareas con seguimiento de progreso parcial
- `category-management`: Entidades de categoría con metadatos y anidamiento
- `dynamic-grouping`: Vistas grouping por categoría, prioridad o estado
- `effort-estimation`: Campo de estimación de tiempo por tarea
- `dashboard-view`: Vista agregada con métricas y tareas próximas
- `advanced-filtering`: Filtros combinados y búsqueda inteligente

### Modified Capabilities

- `temporal-management`: Fecha de vencimiento ahora incluye hora obligatoria

## Impact

- Base de datos: Nueva tabla para categorías con metadatos
- API: Nuevos endpoints para categorías y filtros
- UI: Nuevas vistas y componentes de dashboard