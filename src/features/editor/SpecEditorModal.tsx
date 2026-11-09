import React, { useEffect, useMemo, useState } from 'react';
import { Wrench, CheckCircle2, AlertTriangle, Link2, Download, Play, Search } from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { useAppStore } from '../../store/useAppStore';
import { parseSpec, resolveArchitecture, slugify, specToHash } from '../../engine/registry';
import { inferGraph } from '../../engine/graph/infer';
import { OPS } from '../../engine/ops';
import { fmtCount } from '../../engine/graph/shape';
import { GRAPHS } from '../../specs';
import { ARCHITECTURES_BY_ID } from '../../data/architectures';
import type { GraphSpec } from '../../engine/spec/schema';

const BLANK: GraphSpec = {
  meta: { name: 'My first network', category: 'custom', description: 'A tiny classifier I built myself.' },
  config: { B: 1, features: 20, hidden: 64, classes: 3 },
  controls: [{ key: 'hidden', label: 'Hidden size', min: 8, max: 512, step: 8 }],
  nodes: [
    { id: 'x', op: 'input', label: 'Features', params: { shape: ['B', 'features'] } },
    { id: 'fc1', op: 'linear', label: 'Hidden layer', params: { out: 'hidden', bias: true }, lesson: { description: 'Mixes all input features into 64 learned combinations.' } },
    { id: 'act', op: 'activation', label: 'ReLU' },
    { id: 'fc2', op: 'linear', label: 'Output layer', params: { out: 'classes', bias: true } },
    { id: 'probs', op: 'softmax', label: 'Probabilities', lesson: { description: 'Turns the 3 scores into probabilities.' } },
  ],
  edges: [
    { from: 'x', to: 'fc1' },
    { from: 'fc1', to: 'act' },
    { from: 'act', to: 'fc2' },
    { from: 'fc2', to: 'probs' },
  ],
};

const pretty = (s: GraphSpec) => JSON.stringify(s, null, 2);

/** Write or edit an architecture as JSON, validate it live, and open it in 3D. */
export const SpecEditorModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const archId = useAppStore((s) => s.archId);
  const custom = useAppStore((s) => s.custom);
  const addCustom = useAppStore((s) => s.addCustom);
  const setArch = useAppStore((s) => s.setArch);

  const [text, setText] = useState(() => {
    const { architecture, spec } = resolveArchitecture(archId, custom);
    // hand-written lesson files are not part of the spec; give the copy a name so it is recognisable
    return pretty({ ...spec, meta: { ...(spec.meta ?? { name: architecture.name }), name: `${spec.meta?.name ?? architecture.name} (my copy)`, category: 'custom' } });
  });
  const [debounced, setDebounced] = useState(text);
  const [copied, setCopied] = useState(false);
  const [opQuery, setOpQuery] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebounced(text), 300);
    return () => clearTimeout(t);
  }, [text]);

  const result = useMemo(() => {
    let json: unknown;
    try {
      json = JSON.parse(debounced);
    } catch (e) {
      return { errors: [`JSON syntax: ${(e as Error).message}`] as string[] };
    }
    const { spec, errors } = parseSpec(json);
    if (!spec) return { errors };
    const unknownOps = [...new Set(spec.nodes.filter((n) => !OPS[n.op]).map((n) => n.op))];
    try {
      const inf = inferGraph(spec);
      return { spec, errors: inf.errors, warnings: unknownOps.length ? [`Unknown op(s) ${unknownOps.join(', ')} will be drawn as generic blocks.`] : [], params: inf.totalParams };
    } catch (e) {
      return { spec, errors: [(e as Error).message] };
    }
  }, [debounced]);

  const ok = !!result.spec && result.errors.length === 0;

  const openIn3D = () => {
    if (!result.spec) return;
    const id = slugify(result.spec.meta?.name ?? 'my-model');
    addCustom(id, result.spec);
    setArch(id);
    onClose();
  };

  const copyLink = async () => {
    if (!result.spec) return;
    const url = `${window.location.origin}${window.location.pathname}#${specToHash(result.spec)}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copy this link:', url);
    }
  };

  const download = () => {
    const blob = new Blob([text], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${slugify(result.spec?.meta?.name ?? 'model')}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const ops = Object.entries(OPS).filter(([k, o]) => !opQuery || `${k} ${o.label} ${o.describe}`.toLowerCase().includes(opQuery.toLowerCase()));

  return (
    <Modal
      title="Build your own architecture"
      kicker="Spec editor"
      icon={<Wrench className="w-4 h-4" />}
      onClose={onClose}
      size="xl"
      footer={
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs">
            {ok ? (
              <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                <CheckCircle2 className="w-4 h-4" /> Valid · {result.spec!.nodes.length} ops · {fmtCount(result.params ?? 0)} parameters
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-rose-700 font-semibold">
                <AlertTriangle className="w-4 h-4" /> {result.errors.length} problem{result.errors.length === 1 ? '' : 's'}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={download} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[rgba(117,91,70,0.2)] text-xs font-semibold text-[#2f2a27]">
              <Download className="w-3.5 h-3.5" /> JSON
            </button>
            <button onClick={copyLink} disabled={!ok} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[rgba(117,91,70,0.2)] text-xs font-semibold text-[#2f2a27] disabled:opacity-40">
              <Link2 className="w-3.5 h-3.5" /> {copied ? 'Link copied!' : 'Share link'}
            </button>
            <button onClick={openIn3D} disabled={!ok} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#eb7c6b] text-white text-xs font-semibold disabled:opacity-40">
              <Play className="w-3.5 h-3.5 fill-current" /> Open in 3D
            </button>
          </div>
        </div>
      }
    >
      <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] min-h-full">
        <div className="flex flex-col p-3 sm:p-4 gap-2 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-[#8d847c] mr-1">Start from:</span>
            <button onClick={() => setText(pretty(BLANK))} className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-[#2f2a27] text-white">
              Blank example
            </button>
            <select
              onChange={(e) => {
                const id = e.target.value;
                if (!id) return;
                const spec = GRAPHS[id];
                const name = spec.meta?.name ?? ARCHITECTURES_BY_ID[id]?.name ?? id;
                setText(pretty({ ...spec, meta: { ...(spec.meta ?? { name }), name: `${name} (my copy)`, category: 'custom' } }));
                e.target.value = '';
              }}
              defaultValue=""
              className="px-2 py-1 rounded-lg text-[11px] bg-white border border-[rgba(117,91,70,0.2)] text-[#2f2a27]"
              aria-label="Start from a built-in architecture"
            >
              <option value="">a built-in architecture…</option>
              {Object.keys(GRAPHS).map((id) => (
                <option key={id} value={id}>
                  {ARCHITECTURES_BY_ID[id]?.name ?? id}
                </option>
              ))}
            </select>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            spellCheck={false}
            aria-label="Architecture spec (JSON)"
            className="flex-1 min-h-[45dvh] lg:min-h-[58dvh] w-full p-3 rounded-xl bg-[#2f2a27] text-[#f3e9dc] font-mono text-[12px] leading-relaxed outline-none focus:ring-2 focus:ring-[#eb7c6b]/40 resize-none"
          />
          {(result.errors.length > 0 || (result.warnings?.length ?? 0) > 0) && (
            <div className="space-y-1 text-[11px] font-mono">
              {result.errors.map((e) => (
                <div key={e} className="px-2 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200">
                  {e}
                </div>
              ))}
              {result.warnings?.map((w) => (
                <div key={w} className="px-2 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
                  {w}
                </div>
              ))}
            </div>
          )}
        </div>

        <aside className="border-t lg:border-t-0 lg:border-l border-[rgba(117,91,70,0.14)] p-3 sm:p-4 space-y-3 bg-white/40">
          <div className="text-xs text-[#534a43] space-y-1.5 leading-relaxed">
            <p className="font-semibold text-[#2f2a27]">How a spec works</p>
            <p>
              <b>config</b> holds sizes (numbers or formulas like <code>"d_model / n_heads"</code>). <b>nodes</b> are operations; <b>edges</b> connect them (<code>kind</code>: residual, skip, control, condition). Shapes and parameter counts are worked out for you.
            </p>
            <p>
              Put nodes in a <b>group</b> with <code>repeat</code> to stack layers. Add a <b>lesson</b> to a node to make it a numbered tour stop.
            </p>
          </div>
          <div>
            <label className="relative block">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8d847c]" />
              <input value={opQuery} onChange={(e) => setOpQuery(e.target.value)} placeholder={`Search ${Object.keys(OPS).length} ops…`} className="w-full pl-8 pr-2 py-1.5 rounded-lg bg-white border border-[rgba(117,91,70,0.18)] text-xs outline-none focus:border-[#eb7c6b]" />
            </label>
            <div className="mt-2 space-y-1 max-h-[42dvh] overflow-y-auto custom-scrollbar pr-1">
              {ops.map(([key, op]) => (
                <div key={key} className="p-2 rounded-lg bg-white border border-[rgba(117,91,70,0.12)]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ background: op.color }} />
                    <code className="text-[11px] font-bold text-[#2f2a27]">{key}</code>
                    <span className="text-[10px] text-[#8d847c]">{op.label}</span>
                  </div>
                  <p className="text-[10px] text-[#534a43] mt-0.5 leading-snug">{op.describe}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </Modal>
  );
};
