import React, { useEffect, useMemo, useRef, useState } from 'react';
import 'mathlive';
import MarkdownWithLatex from '@/utils/MarkdownWithLatex';

type FormulaMode = 'inline' | 'block';
type FormulaType = 'frac' | 'sqrt' | 'power' | 'sum' | 'int' | 'custom';

type AnswerSegment =
  | { kind: 'text'; text: string }
  | { kind: 'formula'; mode: FormulaMode; type: FormulaType; latex: string };

export interface RichAnswerInputProps {
  onChange?: (markdown: string) => void;
  // 外部传入的重置令牌：当值变化时清空内容
  resetToken?: number;
  // 简洁模式：隐藏编辑/排序等高级操作，并默认折叠片段列表，提供快捷模板
  simple?: boolean;
}

const RichAnswerInput: React.FC<RichAnswerInputProps> = ({ onChange, resetToken, simple = false }) => {
  const [segments, setSegments] = useState<AnswerSegment[]>([]);
  const [quickText, setQuickText] = useState('');
  const [mode, setMode] = useState<FormulaMode>('inline');
  const mathFieldRef = useRef<any>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [chipsCollapsed, setChipsCollapsed] = useState<boolean>(simple);

  const compiled = useMemo(() => {
    const parts: string[] = [];
    segments.forEach(s => {
      if (s.kind === 'text') parts.push(s.text);
      else parts.push(s.mode === 'inline' ? ` $${s.latex}$ ` : `\n$$\n${s.latex}\n$$\n`);
    });
    return parts.join('').trim();
  }, [segments]);

  useEffect(() => { onChange?.(compiled); }, [compiled, onChange]);

  // 重置信号：清空
  useEffect(() => {
    if (resetToken === undefined) return;
    setSegments([]);
    setQuickText('');
    setEditingIndex(null);
    try {
      const mf = mathFieldRef.current as any;
      if (mf) mf.value = '';
    } catch {}
    setShowEditor(false);
  }, [resetToken]);

  // simple 模式变化时，默认折叠/展开 chips
  useEffect(() => {
    setChipsCollapsed(simple);
  }, [simple]);

  // 为 math-field 加上 Ctrl+Enter 快捷插入
  useEffect(() => {
    const mf = mathFieldRef.current as HTMLElement | null;
    if (!mf) return;
    const handler = (e: any) => {
      if (e && e.ctrlKey && (e.key === 'Enter' || e.code === 'Enter')) {
        e.preventDefault();
        insertFormula();
      }
    };
    mf.addEventListener('keydown', handler as any);
    return () => {
      mf.removeEventListener('keydown', handler as any);
    };
  }, [mode, editingIndex]);

  const addText = () => {
    if (!quickText.trim()) return;
    setSegments(prev => {
      const next = [...prev];
      if (editingIndex !== null) {
        if (next[editingIndex] && next[editingIndex].kind === 'text') {
          (next[editingIndex] as any).text = quickText;
        }
      } else {
        const last = next[next.length - 1];
        if (last?.kind === 'text') last.text += ' ' + quickText;
        else next.push({ kind: 'text', text: quickText });
      }
      return next;
    });
    setQuickText('');
    setEditingIndex(null);
  };

  const insertFormula = () => {
    const mf = mathFieldRef.current as any;
    if (!mf) return;
    const latex = mf.value || '';
    if (!latex.trim()) return;
    setSegments(prev => {
      const next = [...prev];
      if (editingIndex !== null) {
        if (next[editingIndex] && next[editingIndex].kind === 'formula') {
          next[editingIndex] = { kind: 'formula', mode, type: 'custom', latex };
        }
      } else {
        next.push({ kind: 'formula', mode, type: 'custom', latex });
      }
      return next;
    });
    // reset field
    mf.value = '';
    setShowEditor(false);
    setEditingIndex(null);
  };

  // 将模板/符号插入到 math-field 光标处
  const insertIntoMathField = (latex: string) => {
    try {
      const mf = mathFieldRef.current as any;
      if (!mf) return;
      // 对于 mathlive，自带方法可能为 insert 或 executeCommand
      if (typeof mf.insert === 'function') {
        mf.insert(latex);
      } else if (typeof mf.executeCommand === 'function') {
        mf.executeCommand('insert', latex);
      } else {
        // fallback: 直接拼接到末尾
        mf.value = `${mf.value || ''} ${latex}`.trim();
      }
      mf.focus?.();
    } catch {}
  };

  const removeAt = (idx: number) => setSegments(prev => prev.filter((_, i) => i !== idx));
  const moveUp = (idx: number) => setSegments(prev => {
    if (idx <= 0) return prev;
    const next = [...prev];
    const tmp = next[idx - 1];
    next[idx - 1] = next[idx];
    next[idx] = tmp;
    return next;
  });
  const moveDown = (idx: number) => setSegments(prev => {
    if (idx >= prev.length - 1) return prev;
    const next = [...prev];
    const tmp = next[idx + 1];
    next[idx + 1] = next[idx];
    next[idx] = tmp;
    return next;
  });
  const beginEdit = (idx: number) => {
    const seg = segments[idx];
    if (!seg) return;
    setEditingIndex(idx);
    if (seg.kind === 'text') {
      setQuickText(seg.text);
    } else {
      setMode(seg.mode);
      setShowEditor(true);
      try {
        const mf = mathFieldRef.current as any;
        if (mf) mf.value = seg.latex;
      } catch {}
    }
  };
  const cancelEdit = () => {
    setEditingIndex(null);
    setQuickText('');
    try {
      const mf = mathFieldRef.current as any;
      if (mf) mf.value = '';
    } catch {}
    setShowEditor(false);
  };

  return (
    <div>
      {/* 已有片段展示（伪输入框） */}
      {segments.length > 0 && (
        <div className="mb-2">
          <div className="d-flex align-items-center justify-content-between mb-1">
            <small className="text-muted">已添加片段：{segments.length} 个</small>
            <button className="btn btn-sm btn-link" onClick={() => setChipsCollapsed(v => !v)}>
              {chipsCollapsed ? '展开' : '收起'}
            </button>
          </div>
          {!chipsCollapsed && (
            <div className="d-flex flex-wrap gap-2">
              {segments.map((seg, idx) => (
                <div key={idx} className="badge bg-light text-dark border d-flex align-items-center gap-2" style={{ whiteSpace: 'normal' }}>
                  {seg.kind === 'text' ? (
                    <span>{seg.text}</span>
                  ) : (
                    <span>
                      <MarkdownWithLatex markdownContent={seg.mode === 'inline' ? ` $${seg.latex}$ ` : `\n$$\n${seg.latex}\n$$\n`} />
                    </span>
                  )}
                  <div className="d-inline-flex align-items-center gap-1 ms-1">
                    {!simple && (
                      <>
                        <button className="btn btn-sm btn-link p-0" title="上移" onClick={() => moveUp(idx)} disabled={idx===0}><i className="bi bi-arrow-up"></i></button>
                        <button className="btn btn-sm btn-link p-0" title="下移" onClick={() => moveDown(idx)} disabled={idx===segments.length-1}><i className="bi bi-arrow-down"></i></button>
                        <button className="btn btn-sm btn-link p-0" title="编辑" onClick={() => beginEdit(idx)}><i className="bi bi-pencil-square"></i></button>
                      </>
                    )}
                    <button className="btn btn-sm btn-link text-danger p-0" title="移除" onClick={() => removeAt(idx)}><i className="bi bi-x-lg"></i></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 自然语言输入条 */}
      <div className="input-group input-group-sm mb-2" style={{ maxWidth: '640px' }}>
        <span className="input-group-text">文字</span>
        <input
          type="text"
          className="form-control"
          placeholder="输入你的思路或结论，按 Enter 或点击添加"
          value={quickText}
          onChange={e => setQuickText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') addText(); }}
        />
        <button className="btn btn-outline-primary" onClick={addText}>{editingIndex !== null ? '保存文本' : '添加'}</button>
        {editingIndex !== null && (
          <button className="btn btn-outline-secondary" onClick={cancelEdit}>取消</button>
        )}
      </div>

      {/* 公式编辑器（mathlive） */}
      <div className="d-flex align-items-center gap-2 mb-2">
        <div className="btn-group btn-group-sm" role="group">
          <input type="radio" className="btn-check" id={`mode-inline`} checked={mode==='inline'} onChange={() => setMode('inline')} />
          <label className="btn btn-outline-secondary" htmlFor={`mode-inline`}>行内</label>
          <input type="radio" className="btn-check" id={`mode-block`} checked={mode==='block'} onChange={() => setMode('block')} />
          <label className="btn btn-outline-secondary" htmlFor={`mode-block`}>块级</label>
        </div>
        <button className={`btn btn-sm ${showEditor ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setShowEditor(s => !s)}>
          {showEditor ? '隐藏公式编辑器' : (editingIndex !== null ? '编辑公式' : '添加公式')}
        </button>
        {editingIndex !== null && segments[editingIndex]?.kind === 'formula' && (
          <button className="btn btn-sm btn-outline-secondary" onClick={cancelEdit}>取消编辑</button>
        )}
      </div>
      {showEditor && (
        <div className="mb-2">
          {/* 将快捷模板置于编辑器上方，更显眼 */}
          <div className="d-flex align-items-center flex-wrap gap-2 mb-2">
            <small className="text-muted">快捷模板：</small>
            {[
              { label: '分数', latex: '\\frac{a}{b}' },
              { label: '根号', latex: '\\sqrt{x}' },
              { label: '幂', latex: 'x^{2}' },
              { label: '求和', latex: '\\sum_{i=1}^{n} i' },
              { label: '积分', latex: '\\int_{a}^{b} f(x) \\mathrm{d}x' },
            ].map((t, i) => (
              <button key={i} className="btn btn-sm btn-outline-secondary" onClick={() => insertIntoMathField(t.latex)}>{t.label}</button>
            ))}
            <small className="text-muted ms-2">常用符号：</small>
            {['\\pi','\\mu','\\sigma','\\infty','\\pm','\\approx','\\neq','\\leq','\\geq'].map((sym, i) => (
              <button key={i} className="btn btn-sm btn-outline-secondary" onClick={() => insertIntoMathField(sym)}>{sym.replace('\\','\\\\')}</button>
            ))}
          </div>
          <math-field ref={mathFieldRef} style={{ width: '100%', fontSize: '1.05rem', border: '1px solid #dee2e6', borderRadius: 6, padding: 8 }}></math-field>
          <div className="mt-2 d-flex justify-content-end">
            <button className="btn btn-sm btn-primary" onClick={insertFormula}>{editingIndex !== null ? '保存公式' : '插入公式'}</button>
          </div>
        </div>
      )}

      {/* 渲染总览（伪输入框整体效果） */}
      <div className="mt-2 p-2 border rounded bg-light">
        <div className="text-muted small mb-1">预览：</div>
        <MarkdownWithLatex markdownContent={compiled || '（空）'} />
      </div>
    </div>
  );
};

export default RichAnswerInput;
