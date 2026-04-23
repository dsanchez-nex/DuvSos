## Context

El sistema actual de Todos es una lista plana de tareas con título, descripción y estado básicos. Las categorías son simples strings, sin metadatos ni jerarquía. No existen filtros avanzados ni vistas agregadas.

## Goals / Non-Goals

**Goals:**
- Implementar jerarquía de tareas (Task -> SubTask recursivo)
- Crear modelo de categorías con metadatos (color, icono, descripción, parent)
- Implementar vistas de grouping (categoría, prioridad, estado)
- Añadir estimación de esfuerzo
- Crear dashboard con métricas y vista Today/Week
- Implementar filtros combinados y búsqueda

**Non-Goals:**
- Autenticación o multiusuario
- Notificaciones push/email
- Integración con calendarios externos
- Tema oscuro/claro

## Decisions

1. **Modelo recursivo de tareas**: Usar `parent_id` nullable en lugar de tabla separada de subtareas. Una tarea puede tener `parent_id` apuntando a otra tarea.

2. **Categorías como entidad**: Nueva tabla `categories` con `id, name, color, icon, description, parent_id, created_at`. Relación one-to-many con tareas.

3. **Estimación de esfuerzo**: Campo `effort_minutes` (integer) en tabla tareas. UI muestra en formato legible (e.g., "2h 30m").

4. **Filtros combinados**: Query builder en backend que acepta array de condiciones AND. Implementar en la API como `?filters=[{"field":"category_id","op":"eq","value":"..."},{"field":"priority","op":"eq","value":"high"}]`.

5. **Vistas dinámicas**: Sistema de tabs en frontend que agrupa tareas según criterio seleccionado (sin consulta adicional, solo ordenamiento/grouping en UI o query param).

6. **Dashboard**: Endpoints separados para métricas (`GET /todos/metrics`) y tareas próximas (`GET /todos/upcoming?days=7`).

## Risks / Trade-offs

- [Performance con muchas sub-tareas] → Indexed `parent_id` y `tree_path` para queries recursivas si escala
- [Migración de datos existentes] → Script para crear categoría "General" por defecto y asignar a tareas sin categoría
- [Complejidad UI] → Implementar vistas progressive, start con tabs simples