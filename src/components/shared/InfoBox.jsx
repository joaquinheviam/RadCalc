import { IconAlertCircle } from '../icons/index.js';

export default function InfoBox({ tone = 'amber', children }) {
  const tones = {
    amber: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400',
    emerald: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  };
  return (
    <div className={`p-3 rounded-lg flex items-start gap-3 text-sm ${tones[tone]}`}>
      <IconAlertCircle size={20} className="shrink-0 mt-0.5" />
      <p>{children}</p>
    </div>
  );
}
