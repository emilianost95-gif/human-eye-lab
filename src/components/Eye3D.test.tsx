import { describe, expect, it, vi } from 'vitest';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { Eye3D } from './Eye3D';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe('Eye3D sin WebGL', () => {
  it('muestra el esquema 2D identificado como tal', async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: () => {}, removeEventListener: () => {} });
    const host = document.createElement('div');
    document.body.appendChild(host);
    const root = createRoot(host);
    await act(async () => root.render(<Eye3D />));
    expect(host.querySelector('canvas')).toBeNull();
    expect(host.textContent).toContain('Esquema 2D');
    expect(host.querySelector('svg[role="img"]')).not.toBeNull();
    act(() => root.unmount());
  });
});
