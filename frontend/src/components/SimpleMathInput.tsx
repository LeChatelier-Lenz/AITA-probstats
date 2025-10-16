import React, { useEffect, useRef } from 'react';
import 'mathlive';

type Props = {
  value?: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  className?: string;
};

// 极简数学输入：单一 <math-field>，右侧内嵌清空按钮；Ctrl+Enter 触发提交
const SimpleMathInput: React.FC<Props> = ({ value = '', onChange, onSubmit, placeholder, className }) => {
  const mfRef = useRef<any>(null);

  // 同步外部受控值到 math-field
  useEffect(() => {
    const el = mfRef.current as any;
    if (!el) return;
    try {
      // math-field 的 value 属性即 LaTeX 字符串
      if (el.value !== value) el.value = value;
    } catch {
      // ignore
    }
  }, [value]);

  const handleInput = (e: any) => {
    const latex = e?.target?.value ?? '';
    // 上层统一用 Markdown 传输：包一层 $...$
    const md = latex ? `$${latex}$` : '';
    onChange(md);
  };

  const clear = () => {
    const el = mfRef.current as any;
    try { if (el) el.value = ''; } catch {}
    onChange('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      onSubmit?.();
    }
  };

  return (
    <div className={`position-relative ${className || ''}`}>
      {/* 使用 Bootstrap 外观 */}
      {/* @ts-ignore - 自定义元素 */}
      <math-field
        ref={mfRef}
        class="form-control"
        style={{ paddingRight: '2.25rem', minHeight: '2.5rem' }}
        onInput={handleInput as any}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || '输入数学公式，支持键入如 x^2, sqrt, \frac 等；输入文字可用 \\text{} 包裹'}
      />

      {/* 内嵌清空按钮 */}
      <button
        type="button"
        onClick={clear}
        className="btn btn-sm btn-outline-secondary position-absolute top-50 end-0 translate-middle-y me-1"
        title="清空"
        aria-label="清空"
        style={{ lineHeight: 1, padding: '0.125rem 0.4rem' }}
      >
        <i className="bi bi-x-lg" />
      </button>
      {/* 说明文字已移除以保持界面简洁 */}
    </div>
  );
};

export default SimpleMathInput;
