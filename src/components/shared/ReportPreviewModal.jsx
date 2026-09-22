import Modal from './Modal.jsx';
import CopyButton from './CopyButton.jsx';

// Previsualización del texto del informe antes de copiarlo — pensado sobre todo
// para uso en celular, donde copiar al portapapeles no permite "ver" el
// resultado en el momento (hay que pegarlo en otra app). Reutiliza el
// componente Modal genérico (Escape/clic afuera/botón cerrar) para no duplicar
// esa lógica, y muestra el mismo texto que generaría el botón de copiar
// (única fuente de verdad).
export default function ReportPreviewModal({ isOpen, onClose, closeLabel, title, reportText, onCopy, copyLabel }) {
  if (!isOpen) return null;
  return (
    <Modal title={title} onClose={onClose} closeLabel={closeLabel}>
      <pre className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap font-sans leading-relaxed mb-4">
        {reportText}
      </pre>
      <CopyButton onClick={onCopy}>{copyLabel}</CopyButton>
    </Modal>
  );
}
