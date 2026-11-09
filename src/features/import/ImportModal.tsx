import React, { useRef, useState } from 'react';
import { Upload, FileJson, CheckCircle2, AlertTriangle, Boxes } from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { useAppStore } from '../../store/useAppStore';
import { parseSpec, slugify } from '../../engine/registry';
import { fmtCount } from '../../engine/graph/shape';
import type { GraphSpec } from '../../engine/spec/schema';

interface Loaded {
  spec: GraphSpec;
  summary: string;
  warnings: string[];
}

/** Load your own model: an ONNX file (PyTorch/TF/Keras export) or a NeuralDecode JSON spec. */
export const ImportModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const addCustom = useAppStore((s) => s.addCustom);
  const setArch = useAppStore((s) => s.setArch);
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handle = async (file: File) => {
    setBusy(true);
    setError(null);
    setLoaded(null);
    try {
      if (/\.json$/i.test(file.name)) {
        const { spec, errors } = parseSpec(JSON.parse(await file.text()));
        if (!spec) throw new Error(errors.join('\n'));
        setLoaded({ spec, summary: `${spec.nodes.length} operations · ${spec.edges.length} connections`, warnings: [] });
      } else {
        if (file.size > 600 * 2 ** 20) throw new Error('That file is over 600 MB. Export the model without weights, or a smaller variant — only the graph structure is needed.');
        // the ONNX parser is only downloaded when someone actually imports a file
        const { onnxToSpec } = await import('./onnx');
        const bytes = new Uint8Array(await file.arrayBuffer());
        const r = onnxToSpec(bytes, file.name);
        setLoaded({
          spec: r.spec,
          summary: `${r.stats.onnxNodes} ONNX nodes → ${r.stats.keptNodes} shown · ${fmtCount(r.stats.params)} parameters · opset ${r.stats.opset}${r.stats.producer ? ` · from ${r.stats.producer}` : ''}`,
          warnings: r.warnings,
        });
      }
    } catch (e) {
      setError((e as Error).message || 'Could not read that file.');
    } finally {
      setBusy(false);
    }
  };

  const open = () => {
    if (!loaded) return;
    const id = slugify(loaded.spec.meta?.name ?? 'imported');
    addCustom(id, loaded.spec);
    setArch(id);
    onClose();
  };

  return (
    <Modal
      title="Import your own model"
      kicker="ONNX · JSON spec"
      icon={<Upload className="w-4 h-4" />}
      onClose={onClose}
      size="md"
      footer={
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm text-[#534a43] hover:bg-stone-100">
            Cancel
          </button>
          <button onClick={open} disabled={!loaded} className="px-4 py-2 rounded-xl bg-[#eb7c6b] text-white text-sm font-semibold disabled:opacity-40">
            Open in 3D
          </button>
        </div>
      }
    >
      <div className="p-4 sm:p-5 space-y-4">
        <button
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => (e.preventDefault(), setDragOver(true))}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const f = e.dataTransfer.files[0];
            if (f) handle(f);
          }}
          className={`w-full flex flex-col items-center gap-2 p-8 rounded-2xl border-2 border-dashed transition-colors ${
            dragOver ? 'border-[#eb7c6b] bg-[#eb7c6b]/5' : 'border-[rgba(117,91,70,0.25)] bg-white/60 hover:border-[#eb7c6b]'
          }`}
        >
          {busy ? <div className="w-8 h-8 rounded-full border-4 border-[#eb7c6b]/20 border-t-[#eb7c6b] animate-spin" /> : <Boxes className="w-8 h-8 text-[#eb7c6b]" />}
          <span className="font-semibold text-sm text-[#2f2a27]">{busy ? 'Reading model…' : 'Drop a .onnx or .json file here, or click to choose'}</span>
          <span className="text-xs text-[#8d847c]">Everything stays in your browser — nothing is uploaded.</span>
        </button>
        <input ref={fileRef} type="file" accept=".onnx,.json" className="hidden" onChange={(e) => e.target.files?.[0] && handle(e.target.files[0])} />

        {error && (
          <div className="flex gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs whitespace-pre-wrap">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}
        {loaded && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-1">
            <div className="flex items-center gap-2 font-semibold">
              <CheckCircle2 className="w-4 h-4" /> {loaded.spec.meta?.name ?? 'Model'} is ready
            </div>
            <div>{loaded.summary}</div>
            {loaded.warnings.map((w) => (
              <div key={w} className="text-amber-700">
                • {w}
              </div>
            ))}
          </div>
        )}

        <div className="text-xs text-[#534a43] space-y-1.5 leading-relaxed">
          <p className="font-semibold text-[#2f2a27] flex items-center gap-1.5">
            <FileJson className="w-3.5 h-3.5 text-[#8d6bcc]" /> How to get an ONNX file
          </p>
          <pre className="p-3 rounded-xl bg-[#2f2a27] text-[#f5d9a8] text-[11px] overflow-x-auto">{`import torch, torchvision
model = torchvision.models.resnet18()
torch.onnx.export(model, torch.randn(1, 3, 224, 224), "resnet18.onnx")`}</pre>
          <p>Shapes, parameter counts and module structure are read from the file. You get the same lessons, tour and quiz as the built-in models.</p>
        </div>
      </div>
    </Modal>
  );
};
