<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/b6518b65-37ed-4366-906d-5dc83a3334cf

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Acceso al prototipo

La entrada principal es el ecommerce. Para abrir el acceso del equipo, haz clic 10 veces en el logo del header.

- Administración: `admin@sumakwarmi.ec`
- Ventas: `andrea.vendedora@sumakwarmi.ec`
- Contraseña de ambas cuentas internas: `Sumak2026!`
- Cliente existente: `martinacamilaleon@gmail.com` (acceso por correo).

Las sesiones de clientes y equipo son independientes. Cada cuenta interna abre únicamente su panel. Las cuentas desactivadas no pueden ingresar. Los vendedores creados desde administración utilizan la misma contraseña del prototipo.

La autenticación y los datos son locales para demostración. El acceso oculto y las validaciones del frontend no sustituyen autenticación ni autorización de servidor para producción.

## Panel administrativo y de ventas

La ampliación incorpora catálogo y categorías, inventario con reservas y movimientos, ventas/pagos, preparación, logística, equipo con capacidades, clientes, reportes, auditoría y configuración.

Para comparar permisos, también puedes ingresar como `lucia.ventas@sumakwarmi.ec` con la contraseña interna del prototipo. Esta cuenta no tiene revisión ni aprobación de pagos. Los escenarios ficticios usan el cliente `cliente.demo@example.com`.

Consultar [implementación y límites del MVP](docs/IMPLEMENTACION_ADMIN_VENDEDOR_MVP.md) y [revisión de especificaciones](docs/REVISION_SPECT_ADMIN_VENDEDOR_MVP.md).

Validación local: `npm test`, `npm run lint` y `npm run build`.
