# SUMAKWARMI — revisión y especificaciones para la siguiente implementación

Fecha: 15 de octubre de 2026.

Fuente: `C:/Users/mcleo/Downloads/SUMAKWARMI_SPECT_INTEGRACION_ADMIN_VENDEDOR_MVP.md`, versión 1.0, apartados 0–23.

Estado: revisión documental y de código terminada; implementación de esta ampliación pendiente.

Esta revisión contrasta requisitos con código, no certifica comportamientos en navegador. No se ejecutaron los E2E del documento durante esta revisión. Las instrucciones dirigidas al implementador dentro del documento se registran como requisitos para la fase siguiente; la solicitud vigente del usuario autoriza primero analizar y preparar las especificaciones.

## 1. Alcance y continuidad

- Conservar React, TypeScript, Vite, Tailwind, componentes compartidos y organización por entidades, funcionalidades, páginas y widgets.
- Mantener ecommerce como entrada pública y navegación sin autenticación hasta continuar la compra.
- Conservar acceso interno mediante 10 clics en el logo, login del equipo y sesiones separadas del cliente.
- Mantener paneles separados: administración y ventas con su sidebar y sin header, footer, carrito ni navegación del ecommerce.
- Ampliar los flujos existentes de forma incremental. No reconstruir Home, login, checkout o sidebar para implementar módulos administrativos.
- Mantener pagos, logística, notificaciones y documentos comerciales como simulaciones locales. Sin backend productivo, claves externas, cobros, correos ni guías oficiales.
- El documento original sigue siendo la referencia detallada de campos y validaciones; esta revisión lo complementa con brechas, prioridades y decisiones de integración.

## 2. Estado actual y tratamiento del código

### Conservar

- `src/widgets/header/ui/Header.tsx`: entrada pública y acceso oculto por logo.
- `src/widgets/staff-layout/ui/StaffLayout.tsx`: shell interno, menú móvil, sesión y cierre de sesión. Ampliar sus grupos y destinos.
- `src/pages/auth/ui/StaffLoginPage.tsx` y `src/entities/session/model/staffSessionStore.ts`: acceso interno local y comprobación de cuenta activa.
- `src/pages/auth/ui/AuthPage.tsx` y sesión de cliente: mantener experiencia actual; añadir validaciones de dominio donde corresponda.
- Tienda, ficha, carrito, checkout progresivo, cuenta e historial: conservar componentes y conectar reglas nuevas.
- `src/shared/ui`, tokens de `src/index.css`, formateadores es-EC/USD/America/Guayaquil y datos de catálogo existentes.
- Fuente compartida de pedidos, pagos y envíos en `orderStore`: conservar continuidad de IDs e históricos.

### Ampliar

- `src/App.tsx`: hoy reconoce `/admin` y `/panel`, pero no las rutas de módulos propuestas; además redirige subrutas internas a la raíz del rol.
- `src/pages/admin/ui/AdminDashboardPage.tsx`: tiene métricas, consulta de pedidos, precios, stock, vendedores y auditoría inicial. Faltan operaciones de pedidos para admin y módulos completos.
- `src/pages/seller/ui/SellerPanelPage.tsx`: tiene bandejas y acciones básicas; requiere permisos, alcance por pedido, preparación y métricas propias.
- `src/entities/catalog/model/catalogStore.ts`: tiene edición de precio, ajuste de stock y alta de producto a nivel de acción. No hay CRUD completo de productos/categorías en interfaz.
- `src/entities/order/model/orderCreationActions.ts`: crea pedido y pago con snapshots básicos. Debe revalidar catálogo, calcular importes seguros y reservar stock.
- `src/entities/order/model/orderPaymentActions.ts`: tiene subir nombre de comprobante, aprobar/corregir/rechazar y resultado PayPhone. Requiere evidencias, intentos, guardas, permisos y operaciones idempotentes.
- `src/entities/order/model/orderShipmentActions.ts`: tiene asignación, registro de despacho y actualización logística. Requiere transiciones válidas, preparación, reservas y auditoría.
- `src/entities/session/model/sessionStore.ts`: tiene creación y activación de vendedores. Faltan edición, capacidades y desactivación con resolución de pedidos abiertos.
- `src/shared/lib/createStore.ts`: tiene persistencia local; requiere esquema versionado, migraciones, manejo visible de fallos y coordinación de escrituras.

### Reemplazar comportamientos concretos

- Carga de comprobante basada solo en nombre de archivo por carga local con evidencia consultable y versiones conservadas.
- Registro de guía que despacha inmediatamente por etapas independientes: preparación, guía registrada, salida y tránsito.
- Guía fija `SER-8492018` del detalle del cliente por el envío realmente asociado al pedido.
- Permisos solo en componentes por autorización central aplicada antes de cada operación.
- Sobrescritura del resultado de pago por intentos independientes e historial inalterable.
- Ajuste de stock con saturación silenciosa a cero por validación, motivo y movimiento auditable.
- Rechazo de transferencia que cancela siempre el pedido por política explícita de rechazo, corrección, reintento y cancelación.

### Crear

- Políticas de autorización, máquinas de estados y servicios de negocio sobre los stores/repositorios existentes.
- Categorías y productos completos, detalle operativo compartido de pedido, bandeja especializada de pagos y preparación.
- Movimientos y reservas de inventario, notificaciones mock, configuración, clientes, reportes y perfil/rendimiento del vendedor.
- Auditoría operativa completa, incidencias, cancelaciones/devoluciones/reembolsos simulados y escenarios controlados.
- Pruebas unitarias de reglas y E2E F1–F12. Actualmente no se encontró una suite propia ni scripts de pruebas en package.json.

## 3. Brechas críticas observadas

1. **Stock no conectado al ciclo de venta.** Hay tipos de reserva/movimiento y campos de stock reservado, pero crear pedido, aprobar pago y despachar no ejecutan reservas, compromisos ni salidas de inventario.
2. **Checkout usa precio del carrito.** No reconsulta precio/publicación/disponibilidad al confirmar. Un cambio administrativo previo al pedido puede no reflejarse en el total.
3. **Operaciones sin autorización central.** Las acciones aceptan IDs y nombres de actor sin validar sesión, capacidades, asignación o estado activo del ejecutor.
4. **Alcance del vendedor demasiado amplio.** Bandejas de pagos y despacho se derivan de todos los pedidos; no hay capacidades por vendedor ni restricciones suficientes sobre pedidos ajenos.
5. **Admin sin operación integral.** Su tabla de pedidos es de consulta; no tiene acceso operativo a aprobación, asignación, preparación ni despacho desde su propio panel.
6. **Sin protección contra repetición/conflicto.** No hay operationId, comparación de versión ni registro de resultado previo para aprobación, asignación o despacho.
7. **Historial financiero incompleto.** Un comprobante sustituye al anterior; los resultados PayPhone actualizan el mismo pago, sin intentos independientes.
8. **Logística mezcla etapas.** Registrar una guía marca envío despachado y pedido listo para envío simultáneamente. Falta checklist y consumo de reserva.
9. **Seguimiento muestra una guía constante.** La cuenta del cliente puede presentar un número distinto al registrado por el equipo.
10. **Auditoría global casi sin conexión.** Existe evento inicial, pero las acciones inspeccionadas no añaden eventos al registro global.
11. **Persistencia puede aparentar éxito.** Los errores al guardar se capturan sin avisar y el estado en memoria continúa actualizado. No hay migración explícita de esquema.
12. **Importes con decimales flotantes.** El modelo y checkout trabajan en dólares como number, sin centavos enteros ni cálculo decimal controlado.
13. **Desactivación incompleta.** Impide mantener acceso al panel, pero no resuelve ni registra reasignación/liberación de trabajos abiertos.
14. **Textos de simulación inconsistentes.** Hay etiquetas como “guía oficial” y mensajes de aprobación/rechazo bancario que deben aclarar el carácter ficticio de la operación.
15. **Vistas pueden conservar objetos anteriores.** Confirmación de checkout y algunos modales guardan el pedido en estado local; deben seleccionar el pedido actualizado por ID tras cada acción.

## 4. Especificaciones funcionales consolidadas

### R01 — Roles y capacidades (apartado 2)

- Visitante, cliente, vendedor y administrador con separación de experiencia y datos.
- Capacidades: catalog.write, inventory.adjust, orders.assign, orders.claim, orders.prepare, payments.review, payments.approve, shipping.dispatch, analytics.global, analytics.own, users.manage y settings.manage.
- Validar sesión activa, capacidad y alcance del pedido antes de mutar datos o devolver información restringida.
- El vendedor no administra sus propios permisos; solo opera cola/pedidos habilitados. Overrides administrativos requieren motivo y auditoría.

### R02 — Rutas y navegación (apartados 3–4)

- Admin: dashboard, ventas/listado y detalle, pagos, productos/listado/alta/edición, categorías, inventario/movimientos, logística/listado/detalle, clientes, vendedores/listado/detalle, reportes, auditoría y configuración.
- Vendedor: dashboard, ventas/listado/detalle, pagos autorizados, preparación, despachos, estadísticas y perfil.
- Usar `/vendedor` como destino canónico propuesto y conservar `/panel` como alias compatible. Mantener hash routing si cubre la navegación sin una dependencia nueva.
- Navegación agrupada por operación, comercio, gestión y sistema; badges derivados del estado y visibilidad según capacidades.
- Detalle de pedido y operaciones compartidos entre roles, con autorización diferente.

### R03 — Categorías (apartado 5)

- Alta, edición, imagen, slug, orden, jerarquía, visibilidad, activación y fechas; listado con búsqueda, filtros y paginación.
- Validar unicidad contextual, slug, archivos, orden y ausencia de ciclos.
- No borrar categorías con dependencias. Advertir impacto al desactivar. Ocultar navegación no despublica automáticamente sus productos.
- Sincronizar categorías visibles con la tienda sin modificar pedidos históricos.

### R04 — Productos (apartado 6)

- Listado completo con filtros comerciales, de variantes, precio y stock; publicación, despublicación y archivo con confirmaciones.
- Formulario por bloques: información, comercial, variantes, multimedia, logística y SEO/vista previa, con campos definidos en el original.
- Productos simples y con variantes; SKU único, combinaciones únicas, cantidades enteras y precios no negativos.
- Publicación independiente del stock. Publicar exige datos mínimos válidos y categoría activa; oferta no supera precio regular.
- Carga local de imágenes con límites, fallback y texto alternativo; galería ordenable. IndexedDB para archivos si procede.
- Cambios reflejados en tienda y carrito; confirmar nuevo total si cambió precio antes de crear pedido. Conservar snapshots históricos.

### R05 — Inventario (apartado 7)

- Existencia física, reserva y disponible por SKU; disponible = max(0, físico − reservado).
- Crear reserva HELD junto al pedido; pago aprobado la convierte en COMMITTED; despacho consume reserva y reduce físico en la misma operación.
- Cancelación/expiración válida libera una sola vez. Revisiones vigentes pueden congelar expiración; una reserva comprometida no expira como temporal.
- Ajustes manuales con motivo, actor, preview y movimientos. Prohibir reducciones por debajo de compromisos firmes sin resolución de incidencia.
- Cola de operaciones, operationId y versión para conflicto/repetición en la simulación local, sin prometer concurrencia productiva entre dispositivos.

### R06 — Centro único de ventas/pedidos (apartado 8)

- Una entidad de pedido y vistas derivadas: todos, verificar pago, pagados, sin responsable, propios, preparación, despacho, tránsito, entregados e incidencias/cancelados.
- Buscar por pedido/cliente/email; filtrar por fecha, método, estados, asignación, incidencia e importe; ordenar y paginar, conservando filtros recuperables.
- Detalle con cabecera, líneas históricas, importes, cliente/dirección mínima necesaria, pagos/intentos, preparación/logística e historial único.
- Acciones disponibles únicamente si cumplen estado, capacidad, alcance y versión.

### R07 — Máquinas de estados (apartado 9)

- Separar pedido, pago, envío y reserva. Ampliar estados actuales con mapeo/migración documentados, evitando cambios cosméticos de nombres sin necesidad.
- Pago: pendiente de evidencia, presentado, revisión, corrección, aprobado, rechazado, procesamiento/fallo/cancelación e incidencias de reembolso.
- Pedido: recibido/pendiente, confirmado, preparando, listo, despachado y completado; cancelación, pausa y devolución por flujos auditados.
- Envío: no creado, preparación, guía registrada, entregado al transportista, tránsito y entrega; fallos, incidencias y retorno separados.
- Reserva: HELD, COMMITTED, CONSUMED, RELEASED y EXPIRED.
- Cada transición valida precondiciones y produce efectos coordinados. No regresar entregados a pendientes ni aprobar dos veces el mismo cobro.
- Cliente ve etiquetas comprensibles y estado de pago independiente, conservando seguimiento actual.

### R08 — Pagos y comprobantes (apartado 10)

- Bandejas de pendientes, revisión, corrección, aprobados, rechazados y todos, con filtros.
- Evidencia ampliable junto a importe esperado/declarado, referencia, fecha, destino bancario snapshot e historial.
- Iniciar revisión con responsable; aprobar con confirmación manual simulada; corregir/rechazar con motivo y evidencia anterior conservada.
- PayPhone mock con intentos independientes, éxito/fallo/cancelación y reintento; nunca solicitar tarjeta, CVV ni OTP reales.
- Pago PayPhone aprobado no entra en revisión de transferencias. Segundo pago aprobado genera incidencia, no segunda venta.
- Actualizar cliente, notificaciones, reserva, pedido y métricas al resolver pago.

### R09 — Asignación y vendedores (apartado 11 y 14.1)

- Cola reclamable para pedidos confirmados sin responsable, salvo política explícita de revisión previa al pago.
- Un responsable principal; registrar quién asignó, cuándo, motivo y reasignación.
- Desactivar vendedor muestra trabajos abiertos y permite liberar/reasignar con auditoría; conservar operaciones y atribución histórica.
- Vendedores: alta, edición, búsqueda, activación, capacidades y estadísticas.
- Distinguir carga actual de trabajo de atribución comercial histórica mediante salesAttributionSellerId y actores por evento.

### R10 — Preparación y logística (apartado 12)

- Pago confirmado, responsable válido, dirección verificada y reserva resuelta antes de preparar.
- Checklist por línea, cantidades, empaque y observaciones; completar preparación antes de habilitar despacho.
- Registrar guía manual ficticia etiquetada DEMO sin marcar salida automáticamente.
- Confirmar salida física una vez; registrar tránsito y entrega con observación mock, o entrega fallida/incidencia/reprogramación.
- Seguimiento interno del cliente usa los eventos y guía reales del store mock. Sin rastreo externo ficticio ni cambios unilaterales al total pagado.

### R11 — Dashboards y reportes (apartado 13)

- Admin: resumen temporal, tareas urgentes, ventas confirmadas/netas, pedidos pagados, ticket promedio, pendientes, tendencia, productos/categorías y rendimiento.
- Vendedor: tareas autorizadas y propias, pagos a revisar si aplica, preparación, despacho, incidencias y rendimiento personal.
- Calcular indicadores sobre pedidos únicos, pagos aprobados, fechas pertinentes y ajustes; no confundir intentos con ventas ni responsable actual con atribución histórica.
- Reportes diario/semanal/mensual/anual/rango propio. Exportación CSV es opcional en el documento.
- Sin gráficos ni contadores ficticios desconectados del repositorio.

### R12 — Clientes y configuración (apartado 14)

- Cliente administrativo: contactos, pedidos, antigüedad, histórico y direcciones autorizadas; vendedor recibe solo lo necesario para su operación.
- Configurar datos públicos, instrucciones bancarias demo, métodos de pago, reservas, envío por zona, políticas de transición/reintento/cancelación, notificaciones, umbrales y localización.
- Cambios futuros no alteran contratos históricos de pedido; ajustes retrospectivos necesitan proceso explícito auditable.

### R13 — Dominio, persistencia y auditoría (apartados 15–16)

- IDs estables, fechas ISO, importes en centavos enteros y snapshots de producto/SKU/precio/descuentos/impuestos si corresponden/envío/dirección/instrucciones bancarias.
- Un estado de negocio coherente; los stores pueden seguir separados por módulo si sus servicios coordinan cambios sin duplicar entidades ni reglas.
- Separar repositorios/proveedores mock de UI. Orden de operación: permiso, estado, versión, acción, auditoría, persistencia, notificación y actualización de vistas.
- Versionar esquema y migrar datos existentes conservando IDs/históricos donde sea posible. No resetear datos silenciosamente.
- Auditoría con actor/rol/entidad/acción/fecha/motivo/antes/después/operationId. Notificaciones internas mock y restablecimiento integral confirmado.
- Fallos de almacenamiento visibles y recuperación segura, sin éxito falso. Datos personales y evidencias usados en demo deben ser ficticios.

### R14 — UX y calidad transversal (apartados 4, 18–19 y 21)

- Reutilizar tokens de marca y tipografías; reducir hex repetidos en componentes nuevos, mantener dimensiones moderadas y tareas urgentes visibles.
- Filtros, paginación, vista rápida, detalle completo y tablas adaptadas a móvil.
- Loading, vacío, error y éxito en acciones relevantes, confirmaciones informadas, recuperación y error boundaries.
- Verificación de teclado, foco, aria, contraste WCAG 2.2 AA y movimiento reducido. No dar por validada accesibilidad por tener clases responsive.
- Seeds coherentes: admin activo, 2–3 vendedores con capacidades distintas, 3–5 clientes ficticios y productos/pedidos que cubran estados normales y excepcionales.
- Identificar explícitamente simulaciones en transacciones; no volver a añadir selector público de roles.

## 5. Decisiones de integración y ambigüedades

Estas son propuestas para la siguiente fase, no cambios ya implementados ni políticas comerciales aprobadas.

- **Acceso oculto frente a “cambiar rol demo”:** conservar 10 clics y login interno. Los escenarios multirol se recorren iniciando/cerrando sesiones de prueba, sin barra pública.
- **Avisos de demostración:** colocarlos en pagos, revisión, despacho, documentos y escenarios internos; no recuperar la franja global eliminada.
- **Rutas:** `/admin/...` y `/vendedor/...`; `/panel` será alias. El router actual debe dejar de eliminar subrutas.
- **Separación de paneles:** administrador realiza sus operaciones dentro de admin. No necesita entrar al panel visual del vendedor para revisar o despachar.
- **Reserva demo:** 24 h sugeridas, congelación durante revisión válida y umbral 5 como defaults editables. No son reglas definitivas de SUMAKWARMI.
- **Rechazo:** rechazar un intento no cancela automáticamente el pedido; la política demo debe definir reintento o cancelación expresa.
- **Atribución comercial:** proponer congelarla al primer responsable elegible del pago confirmado, o al primero asignado después si estaba sin atribución. Reasignar trabajo no reescribe ventas históricas; override explícito auditado.
- **Reportes:** proponer reconocimiento por fecha de aprobación y ajustes por fecha de reconocimiento del reembolso; usar la misma política en dashboard y reportes.
- **Entrega/pago/envío:** tablas de tarifa y bancos locales editables; no introducir tasas tributarias o políticas legales no proporcionadas.
- **Categoría oculta:** ocultar entrada de navegación sin archivar automáticamente productos; publicación depende de validaciones explícitas.
- **Concurrencia local:** conflicto de versión y operación única demostrables en el alcance del navegador; acceso simultáneo entre dispositivos queda para backend.
- **Operaciones opcionales:** CSV, video, fechas promocionales y comparación con periodo previo conservan el carácter opcional indicado en la fuente.
- **Product Spec maestro:** el documento lo menciona, pero no se proporcionó en esta solicitud. Cualquier contradicción con ese material deberá revisarse si se aporta; no asumir reglas adicionales.

## 6. Secuencia de implementación propuesta

1. **Base de dominio:** migración/versionado, importes, autorización, estados, eventos, repositorios/servicios y pruebas de invariantes. Integrar reserva básica desde el inicio para que los módulos siguientes no operen sin stock válido.
2. **Catálogo y categorías:** formularios completos, publicación, multimedia y sincronización pública, con protección de históricos y revalidación en checkout.
3. **Ventas y pagos:** rutas, detalle compartido, filtros, evidencias, intentos, resolución, notificaciones y seguimiento cliente.
4. **Equipo e inventario operativo:** capacidades editables, asignación/reasignación, liberación de trabajos, movimientos y preparación/checklist.
5. **Logística y excepciones:** guía demo, salida idempotente, tránsito, entrega, incidencias y cancelaciones/devoluciones mock.
6. **Gestión y cierre:** clientes, configuración, dashboards/reportes, auditoría consultable, escenarios completos, accesibilidad y regresiones.

Cada fase mantiene la aplicación ejecutable. Los servicios, datos y guardas se implementan antes de habilitar sus botones. No se marca un módulo como completo solo por mostrar pantallas.

## 7. Validación obligatoria para considerar terminada la futura implementación

- F1: crear categoría/producto, publicar, comprar y reservar, con aparición del pedido en panel.
- F2: transferencia con evidencia, revisión y aprobación, reserva firme y actualización del cliente/KPIs.
- F3: corrección con motivo, evidencia reemplazada e historial de ambas versiones, sin duplicar pedido/reserva.
- F4: éxito PayPhone con confirmación automática y exclusión de revisión manual de transferencias.
- F5: fallo PayPhone, nuevo intento independiente y liberación de reserva cuando corresponda.
- F6: asignación, checklist, guía demo, salida única, tránsito y entrega reflejados al cliente.
- F7: reclamo concurrente sobre una misma versión; un ganador y conflicto legible para el segundo.
- F8: última unidad reservada una sola vez; cancelación/expiración válida devuelve disponible.
- F9: desactivar vendedor resuelve trabajos abiertos y conserva historia/atribución.
- F10: cambio de producto/precio no altera pedido anterior.
- F11: fallo logístico visible como incidencia, sin marcar entrega, con KPI actualizado.
- F12: refresco, sesiones distintas y restablecimiento confirmado conservan/restauran datos coherentes.
- Casos adicionales del apartado 18: repetición de aprobar/despachar, doble pago, SKU archivado, cambio de precio/dirección, cancelación posdespacho, permisos por URL, guía duplicada, error de almacenamiento y migración antigua.
- Completar criterios funcionales y de experiencia del apartado 21 con evidencia de ejecución. TypeScript y build son controles necesarios, pero no sustituyen estas pruebas.

## 8. Resultado de esta revisión

La base visual y los recorridos actuales se pueden conservar. La ampliación principal está en el dominio: permisos, inventario, transiciones, evidencias, intentos, asignación, auditoría y persistencia coherente. Quedan preparados el inventario de cambios, los requisitos R01–R14, las decisiones propuestas y la secuencia de validación. La implementación comienza cuando el usuario indique avanzar.
