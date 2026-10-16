# SUMAKWARMI — implementación administrativa y operativa

Implementación sobre el prototipo existente, basada en `REVISION_SPECT_ADMIN_VENDEDOR_MVP.md` y el SPECT v1.0 del 15 de octubre de 2026.

## Acceso y navegación

- La entrada sigue siendo el ecommerce. Diez clics en el logo abren `/equipo/login`.
- Administración: `admin@sumakwarmi.ec`.
- Ventas con revisión y aprobación: `andrea.vendedora@sumakwarmi.ec`.
- Ventas sin revisión ni aprobación: `lucia.ventas@sumakwarmi.ec`.
- Contraseña interna de demostración: `Sumak2026!`.
- Cliente para los escenarios nuevos: `cliente.demo@example.com`, por el acceso público de clientes.
- Administración usa `/admin/...`; ventas usa `/vendedor/...`. `/panel` conserva compatibilidad mediante redirección al panel del vendedor.
- Las rutas internas no incluyen carrito, footer ni navegación de tienda. Los permisos restringen módulos y operaciones. Las sesiones de cliente y equipo son independientes.

## Funcionalidad conectada

- Repositorio de negocio único con productos, categorías, usuarios, pedidos, intentos de pago, envíos, reservas, movimientos, auditoría, notificaciones y configuración.
- Migración desde los stores locales anteriores conservando IDs e históricos. Pedidos importados con falta de inventario quedan señalados para revisión.
- Capacidades de vendedor configurables por administración; control central de cuenta activa, permiso, alcance de pedido, estado y versión.
- Productos: alta y edición, publicación/despublicación/archivo, SKU, presentaciones, atributos, precios, stock inicial, imagen, galería por URL, texto alternativo, uso, precauciones, logística, SEO y vista previa.
- Categorías: alta/edición, jerarquía sin ciclos, orden, imagen, activación y visibilidad, con actualización de la navegación pública.
- Listados con búsqueda, filtros y paginación; vista rápida lateral de pedidos y detalle operativo completo. Acciones de publicación seleccionadas con confirmación y auditoría por producto.
- Checkout conserva su recorrido, revalida precio/publicación/disponibilidad, calcula reglas monetarias en centavos y crea reserva junto al pedido. Un cambio de precio exige actualizar y revisar el carrito.
- Reserva temporal, reserva firme tras pago, liberación por cancelación/expiración y consumo físico único al despachar.
- Ajustes manuales de inventario con motivo, umbral, validación contra reservas e historial de movimientos.
- Ventas/pedidos como vistas de la misma entidad y detalle compartido entre roles.
- Transferencias: archivo ficticio consultable, inicio de revisión, aprobación, corrección y rechazo con historial de intentos/evidencias conservado.
- PayPhone: proveedor mock con inicio, procesamiento, consulta de resultado y reintentos independientes. La interfaz no captura datos de tarjeta.
- Asignación y reasignación con motivo y versión; reclamación por vendedor solo para confirmados sin responsable.
- Desactivación de vendedor con listado de trabajos abiertos y liberación o reasignación; conservación de atribución histórica.
- Preparación por línea y empaque; guía manual DEMO separada de salida, tránsito, entrega, fallo y devolución física.
- Cancelación antes de salida y reembolso monetario simulado autorizado. Una devolución física no repone stock automáticamente: requiere revisión y movimiento administrativo con motivo.
- Seguimiento del cliente con guía del envío correspondiente, estados actualizados, pago independiente, evidencias, reintento, notificaciones internas y cancelación sin pago.
- Dashboard, reportes temporales, tendencias, productos/categorías, atribución por vendedor, tiempos de aprobación y métricas operativas derivados del repositorio.
- Clientes administrativos con histórico; auditoría consultable con actor, motivo, cambios e identificador de operación.
- Configuración de instrucciones bancarias ficticias, métodos, reservas, congelación de revisión, umbrales, tarifas por provincia, localización, cancelación previa al pago, reintentos y plantillas de notificación interna.
- Respaldo JSON local, carga no destructiva de escenarios y restablecimiento confirmado.
- Manejo visible de errores de persistencia; el estado no se publica como guardado si falla la escritura.

## Escenarios de demostración

Los datos iniciales incluyen transferencias sin evidencia, pendientes de revisión y con corrección; pagos aprobados; PayPhone fallido; pedidos listos, en tránsito, entregados y con entrega fallida. Hay productos ficticios de práctica, borrador y archivo, además del catálogo existente.

Si se migraron datos de una versión anterior, abrir **Configuración → Escenarios demo** para añadir esos casos sin borrar pedidos existentes. **Restablecer datos demo** vuelve al conjunto inicial completo y elimina los cambios del negocio, carrito y sesión de cliente.

## Validación

Ejecutar:

```sh
npm test
npm run lint
npm run build
```

Las pruebas automatizadas cubren F1–F12 a nivel de servicios/repositorio, permisos, precios históricos, reservas, idempotencia, reembolso, proveedor de pago, auditoría inmutable, persistencia fallida y aislamiento/renderizado de vistas.

La prueba de serialización comprueba la recuperación del estado JSON; no sustituye un refresco real del navegador. Las pruebas de renderizado estático comprueban estructura y contenidos; no certifican distribución visual, navegación por teclado ni interacción de clics.

No hubo navegador conectado para completar los E2E visuales ni la revisión responsive/WCAG de extremo a extremo. Estos controles permanecen pendientes de ejecución y no se consideran aprobados por tener TypeScript o build correctos.

## Límites y decisiones explícitas del MVP

- Autenticación y permisos locales son demostrativos. La concurrencia se comprueba con versiones en el proceso local; no ofrece transacciones multiusuario reales ni sincronización entre dispositivos.
- Pagos, revisión bancaria, guía Servientrega, entrega, reembolso y notificaciones no ejecutan operaciones externas. No se emiten facturas fiscales ni correos reales.
- Se mantiene dinero en centavos para cálculos y totales del dominio, junto a campos en dólares para compatibilidad con componentes existentes.
- Los archivos pequeños se guardan localmente como datos con límites de tamaño; si se alcanza la cuota, se informa el error. El almacenamiento de blobs en IndexedDB queda como ampliación para demos con mayor volumen.
- Atribución comercial: primer vendedor elegible al confirmar o primera asignación posterior; las reasignaciones operativas no reescriben la atribución histórica.
- Reportes: bruto por fecha de aprobación; reembolsos por fecha del evento. Unidades de productos vendidos son brutas y se etiquetan como tales; un reembolso monetario no implica devolución de unidades.
- Tarifas, banco, plazo de reserva y umbrales son valores de prueba configurables. No constituyen políticas comerciales aprobadas.
- Las reglas excepcionales se ofrecen como flujos controlados de demo. Un editor arbitrario de máquinas de estados, plantillas avanzadas de notificación, conciliación bancaria real, reintegro externo y políticas tributarias quedan fuera de esta entrega local.
- Exportación CSV, video y programación de promociones son extensiones opcionales de la fuente; no se presentan como implementadas.

Para backend futuro: autenticación y RBAC de servidor, repositorios persistentes, transacciones/locks, almacenamiento de archivos, proveedores de pago/logística reales, notificaciones externas y validaciones comerciales aprobadas.
