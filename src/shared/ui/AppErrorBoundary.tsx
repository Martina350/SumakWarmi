import React from 'react';
export class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed)
      return (
        <main className="max-w-lg mx-auto p-8 my-16 space-y-4">
          <h1 className="text-xl font-bold">
            No se pudo mostrar esta pantalla
          </h1>
          <p className="text-sm text-[#665D65]">
            Tus datos locales no se han restablecido. Recarga la aplicación para
            volver a intentar.
          </p>
          <button
            className="px-4 py-3 rounded-xl bg-[#A91E50] text-white"
            onClick={() => window.location.reload()}
          >
            Recargar aplicación
          </button>
        </main>
      );
    return this.props.children;
  }
}
