// Componente genérico para renderizar un árbol de decisión (algoritmo
// diagnóstico) como esquema visual dentro de una calculadora. Puramente
// presentacional: recibe un árbol de nodos ya resuelto en el idioma activo
// (los textos vienen de `t.calc.<id>` / los mapas de título de diagnóstico
// de cada calculadora, nunca hardcodeados acá) y lo dibuja recursivamente
// con indentación por nivel. Sin dependencias externas, 100% offline.
//
// Forma de un nodo:
//   { q: 'pregunta', branches: [
//       { label: 'respuesta', node: <nodo hijo> } |
//       { label: 'respuesta', leaf: 'diagnóstico' | ['dx1', 'dx2', ...] }
//   ]}

function Leaf({ items }) {
  const list = Array.isArray(items) ? items : [items];
  return (
    <div className="space-y-1.5">
      {list.map((text, i) => (
        <div
          key={i}
          className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-lg px-3 py-1.5"
        >
          {text}
        </div>
      ))}
    </div>
  );
}

function Branch({ branch, depth }) {
  return (
    <div className="pl-4 border-l-2 border-slate-200 dark:border-slate-700 space-y-2">
      <div className="text-xs font-medium text-slate-500 dark:text-slate-400">{branch.label}</div>
      {branch.node ? <TreeNode node={branch.node} depth={depth + 1} /> : <Leaf items={branch.leaf} />}
    </div>
  );
}

function TreeNode({ node, depth }) {
  return (
    <div className="space-y-2">
      <div
        className={`text-sm font-semibold rounded-lg px-3 py-1.5 inline-block ${
          depth === 0
            ? 'bg-blue-600 text-white'
            : 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/20'
        }`}
      >
        {node.q}
      </div>
      <div className="space-y-3 pt-1">
        {node.branches.map((b, i) => (
          <Branch key={i} branch={b} depth={depth} />
        ))}
      </div>
    </div>
  );
}

export default function AlgorithmSchema({ tree }) {
  if (!tree) return null;
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[280px]">
        <TreeNode node={tree} depth={0} />
      </div>
    </div>
  );
}
