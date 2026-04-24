## Why

El módulo actual de Checklist carece de una separación clara entre plantillas reutilizables y instancias en ejecución, lo que dificulta la estandarización de procesos recurrentes. Además, falta funcionalidad crítica para la productividad como dependencias entre ítems, tracking de esfuerzo, conversión a tareas principales y vistas analíticas del historial, limitando su uso en flujos de trabajo complejos y la obtención de insights para mejora continua.

## What Changes

- **Nuevo**: Sistema de plantillas con versionado y campo isTemplate
- **Nuevo**: Ciclo de vida de instancias (Active, Completed, Archived) con transición automática
- **Nuevo**: Historial inmutable de checklists completados con métricas de productividad
- **Nuevo**: Jerarquía de ítems (sub-ítems anidados) y dependencias entre ítems
- **Nuevo**: Flujo de trabajo para crear instancias desde plantillas (heredando estructura pero con estado limpio)
- **Nuevo**: Ajuste dinámico de recordatorios para fechas estacionales
- **Nuevo**: Cálculo de esfuerzo total basado en prioridad y estimación de ítems
- **Nuevo**: Métricas de progreso en el historial (tiempo dedicado, porcentaje de cumplimiento rápido)
- **Nuevo**: Conversión de ítems completados en tareas ejecutables del ToDo principal
- **Nuevo**: Mini-Dashboard en vista de checklist activo (fecha límite, prioridad general, progress bar)
- **Modificación**: Entidad Checklist para incluir campos de plantilla, versión y estado
- **Modificación**: Entidad ChecklistItem para incluir jerarquía, dependencias y estimación de esfuerzo

## Capabilities

### New Capabilities

- `template-versioning`: Plantillas con versionado y bandera isTemplate
- `checklist-lifecycle`: Estados de instancia (Active, Completed, Archived) y transiciones
- `checklist-history`: Registro inmutable de checklists completados con métricas
- `nested-checklist-items`: Ítems con sub-ítems anidados recursivamente
- `item-dependencias`: Capacidad de marcar ítems como bloqueados por otros
- `template-variants`: Plantillas base y versiones adaptadas derivadas
- `instantiate-template`: Workflow para crear instancia activa desde plantilla
- `dynamic-reminder-adjustment`: Cálculo automático de próximas fechas para plantillas estacionales
- `effort-total-calculation`: Suma de esfuerzo estimado basado en prioridad y tiempo por ítem
- `progress-metrics`: Métricas de progreso en historial (tiempo dedicado, velocidad de completado)
- `item-to-todo-conversion`: Convertir ítem completado en tarea del ToDo principal
- `checklist-dashboard`: Mini-Dashboard con fecha límite, prioridad general y progress bar

### Modified Capabilities

- `checklist`: Añadir isTemplate, version, lifecycleState, y campos para tracking de fechas estacionales
- `checklist-item`: Añadir parentId (jerarquía), blockedByItemId (dependencias), effortEstimate (tiempo estimado)

## Impact

- Base de datos: Nuevas columnas en tablas checklists y checklist_items
- API: Nuevos endpoints para plantillas, historial, dependencias y conversión a tareas
- UI: Nuevas vistas para plantillas, historial y mini-dashboard; expansión de formularios y listas