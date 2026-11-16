import { Component } from 'react';

// Evita la pantalla en blanco si una calculadora lanza un error al renderizar
// o si falla la carga de su chunk (p. ej. tras publicar una versión nueva con
// la app abierta). Muestra un aviso con botón para recargar. `resetKey`
// (el id de la calculadora) limpia el error al navegar a otra página.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null, key: props.resetKey };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  static getDerivedStateFromProps(props, state) {
    if (props.resetKey !== state.key) return { error: null, key: props.resetKey };
    return null;
  }

  componentDidCatch(error) {
    console.error(error);
  }

  render() {
    if (!this.state.error) return this.props.children;
    const { title, body, reloadLabel } = this.props;
    return (
      <div role="alert" className="py-12 text-center space-y-3">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">{body}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
        >
          {reloadLabel}
        </button>
      </div>
    );
  }
}
