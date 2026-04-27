## Context

El módulo actual de Checklist en la aplicación permite crear listas de verificación con ítems simples, categorías opcionales, fechas de inicio/fin y prioridad por ítem. Los checklists se almacenan como entidades activas sin distinción entre plantillas reutilizables e instancias en ejecución. No existe historial inmutable, ni métricas de productividad, ni capacidad de dependencias entre ítems ni jerarquía profunda más allá de un nivel (actualmente los ítems son planos). La funcionalidad está distribuida en API routes (`/src/app/api/checklists`) y componentes de UI (`/src/app/checklists/page.tsx` y subcomponentes).

## Goals / Non-Goals

**Goals:**
- Introducir el concepto de plantilla (`isTemplate`) para reutilizar estructuras de checklist.
- Añadir versionado a plantillas para permitir evolución sin perder compatibilidad.
- Implementar ciclo de vida de instancias: `Active` → `Completed` → `Archived`.
- Crear un historial inmutable de checklists completados que preserve métricas.
- Soportar jerarquía ilimitada de ítems (sub-ítems anidados).
- Añadir dependencias entre ítems (un ítem puede bloquearse hasta que otro se complete).
- Permitir crear una instancia a partir de una plantilla, heredando estructura pero iniciando con estado limpio.
- Calcular dinámicamente la próxima fecha de vencimiento para plantillas con patrones estacionales.
- Calcular esfuerzo total estimado de un checklist basado en prioridad y tiempo estimado por ítem.
- Mostrar métricas de progreso en el historial (tiempo dedicado, velocidad de completado).
- Permitir convertir un ítem completado en una tarea del ToDo principal.
- Mostrar un mini-Dashboard en la vista de checklist activo (fecha límite, prioridad general, barra de progreso).

**Non-Goals:**
- Cambiar el mecanismo de autenticación existente.
- Modificar la forma en que se almacenan los datos del usuario (seguir usando `userId`).
- Eliminar o rediseñar completamente la UI actual; se extenderá progresivamente.
- Soportar colaboración en tiempo real o comentarios en ítems (fuera de alcance).
- Integrar con calendarios externos más allá del cálculo de recordatorios.

## Decisions

1. **Extender la tabla `checklist`**  
   Añadir columnas:  
   - `isTemplate` BOOLEAN DEFAULT false  
   - `version` INTEGER DEFAULT 1  
   - `lifecycleState` VARCHAR(20) DEFAULT 'Active' (valores: Active, Completed, Archived)  
   - `templateId` INTEGER NULLABLE (FK a checklist.id, para versionado y variantes)  
   - `recurrencePattern` VARCHAR(100) NULL (ej: "FIRST_FRIDAY_OF_MONTH")  
   - `completedAt` TIMESTAMP NULLABLE (cuando se marca como Completed)  
   Esta estrategia mantiene una única tabla para ambos conceptos, simplificando consultas y migraciones.

2. **Extender la tabla `checklist_item`**  
   Añadir columnas:  
   - `parentId` INTEGER NULLABLE (FK a checklist_item.id, para jerarquía)  
   - `blockedByItemId` INTEGER NULLABLE (FK a checklist_item.id, para dependencias)  
   - `effortEstimate` INTEGER NULLABLE (minutos estimados)  
   - `priority` se mantiene pero se usará para cálculo de esfuerzo y prioridad general.  
   La jerarquía se implementará con `parentId` nulo para ítems raíz.

3. **Separación de preocupaciones en API**  
   - Mantener endpoints existentes para retrocompatibilidad, pero añadir nuevos endpoints específicos:  
     - `POST /api/checklists/templates` para crear una plantilla.  
     - `POST /api/checklists/templates/:id/instantiate` para crear una instancia.  
     - `GET /api/checklists/history` para obtener el historial.  
     - `POST /api/checklists/:id/archive` para archivar una instancia completada.  
     - `POST /api/checklist-items/:id/convert-to-todo` para convertir ítem en tarea ToDo.  
   - Los endpoints existentes (`GET`, `POST`, `PUT`, `DELETE` en `/api/checklists`) seguirán funcionando pero se adaptarán para respetar los nuevos campos (por ejemplo, no permitirá marcar como completada una plantilla directamente).

4. **Lógica de transición de estado**  
   - Cuando se marca el último ítem de una instancia como completado, el backend actualizará automáticamente `lifecycleState` a 'Completed' y establecerá `completedAt`.  
   - El archivado será una acción explícita del usuario (botón "Archivar") que cambiará el estado a 'Archived'.

5. **Cálculo de esfuerzo total y prioridad general**  
   - Esfuerzo total: suma de `effortEstimate` de todos los ítems (si está definido) ponderado por un factor basado en `priority` (p.ej., low=0.5, normal=1.0, high=2.0) o simplemente suma si se prefiere simplicidad.  
   - Prioridad general de un checklist: el valor de prioridad más alto entre sus ítems (si alguno está definido).

6. **Historial inmutable**  
   - En lugar de crear una tabla separada, se reutilizará la misma tabla `checklist` con `lifecycleState = 'Archived'` y se impedirá cualquier modificación (endpoints de PUT/DELETE devolverán error).  
   - Para métricas, se calcularán en tiempo real o se almacenarán como columnas adicionales opcionales (como `totalTimeSpentMinutes`, `completionSnapshot` JSON) si se decide rastrear tiempo dedicado.

7. **Migración de datos existentes**  
   - Todos los checklists existentes se considerarán instancias no plantilla: `isTemplate = false`, `version = 1`, `lifecycleState = 'Active'`, `templateId = NULL`.  
   - Se creará una migración de Prisma que añada las nuevas columnas con valores por defecto seguros.

8. **UI y experiencia de usuario**  
   - Se añadirán nuevas pestañas o filtros en la página principal: "Plantillas", "Activos", "Historial".  
   - Al crear un nuevo checklist, se mostrará un modal para seleccionar plantilla (opcional).  
   - La vista de checklist activo mostrará un mini-Dashboard con: fecha de vencimiento (calculada), prioridad general (badge de color), y barra de progreso (% de ítems completados).  
   - En el historial, se mostrarán métricas como tiempo total estimado vs. real (si se rastrea) y gráficos simples de progreso.

## Risks / Trade-offs

- [Riesgo de complejidad en consultas recursivas] → Las jerarquías de ítems y dependencias pueden requerir consultas recursivas o múltiples búsquedas. Se mitigará con índices adecuados (`parentId`, `blockedByItemId`) y limitando la profundidad en la UI si es necesario.  
- [Riesgo de inconsistencia en el estado] → La transición automática a 'Completed' depende de detectar el último ítem marcado. Se mitigará usando transacciones y verificando en el backend después de cada actualización de ítem.  
- [Riesgo de crecimiento de datos] → El historial podría crecer indefinidamente. Se considerará una política de retención opcional (archivado después de X años) o permitir eliminación manual desde el historial (aunque se marca como inmutable, se puede permitir borrado con advertencia).  
- [Trade-off entre simplicidad y funcionalidad] → Añadir muchos campos aumenta la superficie de ataque y la complejidad del schema. Se justifica por el valor productivo para usuarios que gestionan procesos recurrentes.  
- [Riesgo de migración fallida] → Se hará backup previo y se probará en entorno de staging.  

## Preguntas Abiertas

- ¿Se desea rastrear el tiempo real dedicado a cada ítem o checklist (para métricas de esfuerzo real vs estimado)? Esto requeriría un nuevo modelo de tracking de sesiones.  
- ¿Cómo deben manejarse las plantillas con recurrencia compleja (ej: "Cada último día hábil del mes")? Se podría empezar con patrones simples y extender con una biblioteca como crono o date-fns-recur.  
- ¿Debería el historial ser completamente inmutable (sin posibilidad de borrado) o permitir archivado y luego eliminación explícita? Se propone permitir eliminación desde el historial con confirmación, pero marcar como solo lectura en la UI por defecto.  
