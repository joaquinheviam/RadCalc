// Shared helper for calculators whose logic already exists as a data-driven wizard
// graph in the i18n strings files (the { start, nodes, results? } shape used by the
// interactive step-by-step calculators). Converts that graph into the
// { q, branches: [{ label, node|leaf }] } shape AlgorithmSchema expects.
//
// Never hardcodes clinical text: every q/label/leaf value is read live from the
// calculator's own `c` (i18n) object, so ES/EN parity and future wording edits to
// the wizard stay automatically in sync with the rendered "view full algorithm" tree.
//
// A node is terminal when it has a `cat` property (matching how every wizard here
// marks its leaves). `leafText(node)` lets each calculator decide how much detail
// belongs in the chip (a bare category code, category + a short risk phrase, etc.).
// A node can also be a `numeric` threshold node ({ numeric: true, branches: [{lt,
// next}, ..., {next}] }, as used by lungRads) instead of the usual { options }
// shape; pass `numericLabel(branch, index, branches)` to render its range labels.
export function buildWizardTree(c, id, opts = {}) {
  const { leafText = (node) => node.cat, numericLabel } = opts;
  const node = id === 'start' ? c.start : ((c.nodes && c.nodes[id]) || (c.results && c.results[id]));

  if (node.cat) return { leaf: leafText(node) };

  if (node.numeric) {
    return {
      q: node.q,
      branches: node.branches.map((br, i) => {
        const label = numericLabel(br, i, node.branches);
        const child = buildWizardTree(c, br.next, opts);
        return 'leaf' in child ? { label, leaf: child.leaf } : { label, node: child };
      }),
    };
  }

  return {
    q: node.q,
    branches: node.options.map((opt) => {
      const child = buildWizardTree(c, opt.next, opts);
      return 'leaf' in child ? { label: opt.label, leaf: child.leaf } : { label: opt.label, node: child };
    }),
  };
}
