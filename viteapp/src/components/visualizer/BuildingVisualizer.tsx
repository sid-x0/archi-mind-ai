import { useState, useRef, useCallback, useEffect } from 'react';
import { RotateCcw, ZoomIn, ZoomOut, Plus, Eye, EyeOff, Layers } from 'lucide-react';
import { useBuilding } from '../../context/BuildingContext';
import { sendMessage } from '../../services/api';
import type { Floor } from '../../context/BuildingContext';

/* ── Palette ── */
const PALETTE = [
  { top: '#3d7a8a', front: '#205060', side: '#163a47', label: '#7ecfdf' },
  { top: '#3d5a4c', front: '#243d30', side: '#162819', label: '#6db88e' },
  { top: '#7a3a50', front: '#521e30', side: '#3a1220', label: '#d4849a' },
  { top: '#6a5a2a', front: '#463a14', side: '#2e250a', label: '#d4b86a' },
  { top: '#3a3a8a', front: '#222260', side: '#141440', label: '#8a8ad4' },
  { top: '#6a2a8a', front: '#461460', side: '#2c0a40', label: '#b88ad4' },
  { top: '#2a7a5a', front: '#145a38', side: '#0a3a22', label: '#5ad4a8' },
  { top: '#7a4a2a', front: '#543010', side: '#361e08', label: '#d49a5a' },
  { top: '#2a5a7a', front: '#143a5a', label: '#5aaad4', side: '#0a2438' },
  { top: '#7a2a4a', front: '#52142c', side: '#360a1a', label: '#d45a8a' },
];
const pc = (i: number) => PALETTE[i % PALETTE.length];

/* ── Building geometry ── */
const BASE_W = 220;
const BASE_D = 160;
const FLOOR_H = 60;

interface FloorBlockProps {
  floor: Floor;
  index: number;
  totalFloors: number;
  shape: string;
  showLabels: boolean;
}

function FloorBlock({ floor, index, totalFloors, shape, showLabels }: FloorBlockProps) {
  const colors = pc(index);

  let scale = 1;
  if (shape === 'pyramid') {
    // Floor 0 = bottom (biggest), top floor = smallest
    const levelFromBottom = index;
    scale = Math.pow(0.82, levelFromBottom);
  }

  const W = BASE_W * scale;
  const D = BASE_D * scale;
  const H = FLOOR_H;

  // Center the floor horizontally as it scales for pyramid
  const offsetX = (BASE_W - W) / 2;
  const offsetZ = (BASE_D - D) / 2;

  const brightness = 1 - index * 0.02; // slight dimming for higher floors

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: `${BASE_W}px`,
        height: `${H}px`,
        transformStyle: 'preserve-3d',
        transform: `translateY(${-index * FLOOR_H}px)`,
        transition: 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1)',
      }}
    >
      {/* ── Wrapper to centre pyramid scaling ── */}
      <div style={{
        position: 'absolute',
        width: `${W}px`,
        height: `${H}px`,
        left: `${offsetX}px`,
        transformStyle: 'preserve-3d',
        transform: `translateZ(${-offsetZ}px)`,
      }}>
        {/* TOP FACE */}
        <div style={{
          position: 'absolute',
          width: `${W}px`,
          height: `${D}px`,
          background: `linear-gradient(135deg, ${colors.top} 0%, ${colors.front}cc 100%)`,
          transformOrigin: 'center top',
          transform: `rotateX(-90deg) translateZ(0px)`,
          top: 0,
          left: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `inset 0 0 30px rgba(255,255,255,0.06)`,
          border: `1px solid ${colors.label}25`,
          filter: `brightness(${brightness + 0.15})`,
        }}>
          {/* Room grid on top */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '4px',
            padding: '8px',
            alignContent: 'flex-start',
            width: '100%',
            height: '100%',
          }}>
            {floor.rooms.map((_, ri) => (
              <div key={ri} style={{
                width: '16px',
                height: '12px',
                background: `${colors.label}45`,
                border: `1px solid ${colors.label}60`,
                borderRadius: '2px',
              }} />
            ))}
          </div>
        </div>

        {/* FRONT FACE */}
        <div style={{
          position: 'absolute',
          width: `${W}px`,
          height: `${H}px`,
          background: `linear-gradient(180deg, ${colors.front} 0%, ${colors.side} 100%)`,
          transformOrigin: 'bottom center',
          transform: `rotateX(0deg) translateZ(${D}px)`,
          top: 0,
          left: 0,
          border: `1px solid ${colors.label}20`,
          boxShadow: `inset 0 0 20px rgba(0,0,0,0.3)`,
          filter: `brightness(${brightness})`,
          display: 'flex',
          alignItems: 'flex-end',
          padding: '6px 10px',
        }}>
          {showLabels && (
            <span style={{
              fontSize: '0.55rem',
              fontWeight: 800,
              letterSpacing: '0.12em',
              color: colors.label,
              opacity: 0.95,
              textShadow: `0 0 8px ${colors.label}80`,
            }}>
              FLOOR {String(floor.number).padStart(2, '0')}
            </span>
          )}
          {/* Windows */}
          <div style={{
            position: 'absolute',
            inset: '8px',
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
            paddingBottom: '20px',
          }}>
            {Array.from({ length: Math.min(floor.rooms.length + 1, 5) }).map((_, wi) => (
              <div key={wi} style={{
                width: '20px',
                height: '26px',
                background: `linear-gradient(135deg, ${colors.label}30, ${colors.label}10)`,
                border: `1px solid ${colors.label}40`,
                borderRadius: '2px 2px 0 0',
                boxShadow: `0 0 6px ${colors.label}20`,
              }} />
            ))}
          </div>
        </div>

        {/* RIGHT SIDE FACE */}
        <div style={{
          position: 'absolute',
          width: `${D}px`,
          height: `${H}px`,
          background: `linear-gradient(180deg, ${colors.side}dd 0%, ${colors.side} 100%)`,
          transformOrigin: 'left center',
          transform: `rotateY(90deg) translateZ(0px)`,
          top: 0,
          left: `${W}px`,
          border: `1px solid ${colors.label}15`,
          filter: `brightness(${brightness * 0.75})`,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'flex-end',
          padding: '5px 7px',
        }}>
          {/* Side windows */}
          <div style={{
            position: 'absolute',
            inset: '8px',
            display: 'flex',
            gap: '6px',
            alignItems: 'center',
            paddingBottom: '20px',
          }}>
            {Array.from({ length: Math.min(2, Math.ceil(D / 50)) }).map((_, wi) => (
              <div key={wi} style={{
                width: '14px',
                height: '22px',
                background: `${colors.label}20`,
                border: `1px solid ${colors.label}30`,
                borderRadius: '2px 2px 0 0',
              }} />
            ))}
          </div>
          {/* Room badge */}
          <span style={{
            fontSize: '0.5rem',
            fontWeight: 700,
            color: colors.label,
            opacity: 0.8,
            letterSpacing: '0.08em',
            background: `${colors.label}15`,
            padding: '2px 6px',
            borderRadius: '8px',
            border: `1px solid ${colors.label}30`,
            whiteSpace: 'nowrap',
          }}>
            {floor.rooms.length} room{floor.rooms.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Main component ── */
export function BuildingVisualizer() {
  const { state, dispatch } = useBuilding();
  const [zoom, setZoom] = useState(0.9);
  const [showLabels, setShowLabels] = useState(true);
  const [adding, setAdding] = useState(false);
  const [fps] = useState(144);
  const [rotY, setRotY] = useState(-35);
  const [rotX] = useState(-22);

  const isDragging = useRef(false);
  const lastX = useRef(0);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true;
    lastX.current = e.clientX;
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const delta = e.clientX - lastX.current;
    lastX.current = e.clientX;
    setRotY(r => r + delta * 0.6);
  }, []);

  const stopDrag = useCallback(() => { isDragging.current = false; }, []);

  const floors = state.floors;
  const totalFloors = floors.length;
  const shape = state.constraints?.shape || 'rectangle';

  const handleAddFloor = async () => {
    if (adding) return;
    setAdding(true);
    try {
      const res = await sendMessage('add a floor');
      if (res.updatedState) dispatch({ type: 'SET_STATE', payload: res.updatedState });
    } catch { /* ignore */ }
    finally { setAdding(false); }
  };

  const handleReset = async () => {
    try {
      const res = await sendMessage('reset building');
      if (res.updatedState) dispatch({ type: 'SET_STATE', payload: res.updatedState });
    } catch { /* ignore */ }
  };

  const displayRot = Math.round(((rotY % 360) + 360) % 360);
  const buildingHeight = totalFloors * FLOOR_H;

  return (
    <div
      style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}
      onMouseMove={onMouseMove}
      onMouseUp={stopDrag}
      onMouseLeave={stopDrag}
    >
      {/* ── Metadata bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '1.5rem',
        padding: '0.5rem 1.25rem',
        background: 'rgba(0,0,0,0.4)',
        borderBottom: '1px solid var(--border-subtle)',
        fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.07em',
        color: 'var(--text-tertiary)', flexShrink: 0,
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
          RENDER: VULKAN 3D
        </span>
        <span>COORDS: 40.7128° N, 74.0060° W</span>
        <span style={{ color: '#06b6d4' }}>ZOOM: {zoom.toFixed(1)}X</span>
        <span style={{ color: '#f59e0b' }}>ROT: {displayRot}°</span>
        <span style={{ color: '#a78bfa' }}>SHAPE: {shape.toUpperCase()}</span>
        <span style={{ marginLeft: 'auto' }}>FPS: {fps}</span>
      </div>

      {/* ── Main canvas ── */}
      <div
        style={{
          flex: 1, position: 'relative', overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: isDragging.current ? 'grabbing' : 'grab',
          userSelect: 'none',
          perspective: '1200px',
        }}
        onMouseDown={onMouseDown}
      >
        {/* Grid */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }} />

        {/* Glow */}
        <div style={{
          position: 'absolute', width: '600px', height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(6,182,212,0.05) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* DRAG hint */}
        {totalFloors > 0 && (
          <div style={{
            position: 'absolute', top: '0.75rem', right: '1rem',
            fontSize: '0.6rem', letterSpacing: '0.1em',
            color: 'var(--text-tertiary)', fontWeight: 600, pointerEvents: 'none',
          }}>
            DRAG TO ROTATE
          </div>
        )}

        {totalFloors === 0 ? (
          <EmptyState onAddFloor={handleAddFloor} adding={adding} />
        ) : (
          /* ── 3D scene ── */
          <div style={{
            position: 'relative',
            transformStyle: 'preserve-3d',
            transform: `scale(${zoom}) rotateX(${rotX}deg) rotateY(${rotY}deg)`,
            transition: isDragging.current ? 'transform 0.05s linear' : 'transform 0.35s ease',
            marginTop: `${buildingHeight * 0.3}px`,
          }}>
            {/* Ground shadow */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: '50%',
              transform: 'translateX(-50%) translateY(8px)',
              width: `${BASE_W + 60}px`,
              height: `${BASE_D + 20}px`,
              borderRadius: '50%',
              background: 'radial-gradient(ellipse, rgba(0,0,0,0.6) 0%, transparent 70%)',
              pointerEvents: 'none',
              transformStyle: 'preserve-3d',
            }} />

            {/* Ground plate */}
            <div style={{
              position: 'absolute',
              width: `${BASE_W + 20}px`,
              height: `${BASE_D + 20}px`,
              background: 'linear-gradient(135deg, #0d1a20, #0a1218)',
              border: '1px solid rgba(6,182,212,0.15)',
              bottom: '-4px',
              left: '-10px',
              transformStyle: 'preserve-3d',
              transform: `rotateX(-90deg) translateZ(4px)`,
              boxShadow: 'inset 0 0 40px rgba(6,182,212,0.05)',
            }}>
              {/* Grid lines on ground */}
              <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: `
                  linear-gradient(rgba(6,182,212,0.06) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(6,182,212,0.06) 1px, transparent 1px)
                `,
                backgroundSize: '20px 20px',
              }} />
            </div>

            {/* Building floors — bottom to top */}
            <div style={{
              position: 'relative',
              width: `${BASE_W}px`,
              height: `${buildingHeight}px`,
              transformStyle: 'preserve-3d',
            }}>
              {[...floors].map((floor) => {
                const idx = floor.number - 1; // 0-based from bottom
                return (
                  <FloorBlock
                    key={floor.id}
                    floor={floor}
                    index={idx}
                    totalFloors={totalFloors}
                    shape={shape}
                    showLabels={showLabels}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Labelled toolbar ── */}
      <div style={{
        position: 'absolute',
        bottom: '1.5rem',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '0.25rem',
        background: 'rgba(13,13,20,0.92)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '16px',
        padding: '0.6rem 0.85rem',
        backdropFilter: 'blur(16px)',
        alignItems: 'flex-end',
      }}>
        <ToolBtn icon={<RotateCcw size={15} />} label="Reset" onClick={handleReset} />
        <ToolBtn icon={<ZoomIn size={15} />} label="Zoom In" onClick={() => setZoom(z => Math.min(z + 0.15, 2.5))} />
        <ToolBtn icon={<Plus size={18} />} label="Add Floor" accent loading={adding} onClick={handleAddFloor} />
        <ToolBtn icon={<ZoomOut size={15} />} label="Zoom Out" onClick={() => setZoom(z => Math.max(z - 0.15, 0.3))} />
        <ToolBtn
          icon={showLabels ? <Eye size={15} /> : <EyeOff size={15} />}
          label="Labels"
          onClick={() => setShowLabels(v => !v)}
          active={showLabels}
        />
        <ToolBtn icon={<Layers size={15} />} label="Layers" onClick={() => {}} />
      </div>
    </div>
  );
}

/* ── Labelled toolbar button ── */
function ToolBtn({
  icon, label, onClick, accent, active, loading,
}: {
  icon: React.ReactNode; label: string; onClick: () => void;
  accent?: boolean; active?: boolean; loading?: boolean;
}) {
  return (
    <button
      title={label}
      onClick={onClick}
      disabled={loading}
      style={{
        minWidth: '52px',
        padding: '0.4rem 0.4rem 0.3rem',
        borderRadius: '10px',
        background: accent
          ? 'linear-gradient(135deg, #ec4899, #f97316)'
          : active ? 'rgba(6,182,212,0.15)' : 'rgba(255,255,255,0.04)',
        border: accent ? 'none'
          : active ? '1px solid rgba(6,182,212,0.3)' : '1px solid transparent',
        color: accent ? '#fff' : active ? '#06b6d4' : 'var(--text-secondary)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: '0.2rem', cursor: loading ? 'wait' : 'pointer',
        transition: 'all 0.15s', opacity: loading ? 0.7 : 1,
      }}
    >
      {loading ? <span style={{ fontSize: '0.7rem' }}>...</span> : icon}
      <span style={{
        fontSize: '0.52rem', fontWeight: 700,
        letterSpacing: '0.04em', lineHeight: 1, whiteSpace: 'nowrap',
      }}>
        {label}
      </span>
    </button>
  );
}

/* ── Empty state ── */
function EmptyState({ onAddFloor, adding }: { onAddFloor: () => void; adding: boolean }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', gap: '1rem', color: 'var(--text-tertiary)',
    }}>
      <div style={{
        width: '80px', height: '80px', borderRadius: '16px',
        border: '2px dashed var(--border-subtle)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Layers size={32} color="var(--text-tertiary)" />
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
          No floors yet
        </div>
        <div style={{ fontSize: '0.75rem' }}>Ask the AI to add a floor or click below</div>
      </div>
      <button
        onClick={onAddFloor}
        disabled={adding}
        style={{
          background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
          border: 'none', borderRadius: '8px', padding: '0.6rem 1.25rem',
          color: '#fff', fontSize: '0.82rem', fontWeight: 600,
          cursor: adding ? 'wait' : 'pointer',
          display: 'flex', alignItems: 'center', gap: '0.4rem',
        }}
      >
        <Plus size={14} />
        {adding ? 'Adding...' : 'Add First Floor'}
      </button>
    </div>
  );
}
