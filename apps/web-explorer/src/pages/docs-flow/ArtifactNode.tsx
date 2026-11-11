import type { Artifact, SceneNode } from './flow';

const CHILD_LABELS: Record<string, string> = {
  'hld-design': 'design (Frame; …)',
  'hld-solution': 'solution (Frame; …)',
  notes: 'impl (intent; …)',
  'hld-container': 'Container',
  component: 'Component(s)',
  requirements: 'Requirements',
};

export function DividerNode({ x, top, bottom }: { x: number; top: number; bottom: number }) {
  return <div className="pillar-divider" style={{ left: x, top, height: bottom - top }} />;
}

export function PillarLabelNode({ label, x, y }: { label: string; x: number; y: number }) {
  return (
    <div className="pillar-label" style={{ left: x, top: y }}>
      {label}
    </div>
  );
}

export function ArtifactBlock({
  node,
  artifact,
  selected,
  focused,
  muted,
  selectedArtifact,
  focusedChips,
  onSelect,
}: {
  node: SceneNode;
  artifact: Artifact;
  selected: boolean;
  focused: boolean;
  muted: boolean;
  selectedArtifact: string;
  focusedChips: Set<string>;
  onSelect: (id: string) => void;
}) {
  const state = artifact.kind === 'state';
  const hasChildren = Boolean(artifact.children?.length);

  return (
    <button
      type="button"
      className={`artifact-node kind-${artifact.kind} ${state ? 'is-group' : ''} ${selected ? 'is-selected' : ''} ${focused ? 'is-focused' : ''} ${muted ? 'is-muted' : ''}`}
      style={{ left: node.x, top: node.y, width: node.w, height: node.h }}
      onClick={() => onSelect(node.id)}
      aria-label={`Inspect ${artifact.title}`}
    >
      {artifact.kind === 'gate' ? (
        <div className="diamond-content">
          <strong>{artifact.title}</strong>
        </div>
      ) : state ? (
        <>
          <div className="group-title">{artifact.title}</div>
          <div className="group-documents">
            {artifact.children?.map((id) => (
              <span
                key={id}
                role="button"
                tabIndex={0}
                className={`doc-chip ${selectedArtifact === id || focusedChips.has(id) ? 'selected-chip' : ''}`}
                onClick={(event) => {
                  event.stopPropagation();
                  onSelect(id);
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.stopPropagation();
                    onSelect(id);
                  }
                }}
                title={`Inspect ${id}`}
              >
                {CHILD_LABELS[id] ?? id}
              </span>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="flow-label">{artifact.title}</div>
          {(artifact.kind === 'system' || artifact.kind === 'command') && (
            <div className="node-subtitle">{artifact.subtitle}</div>
          )}
          {hasChildren && (
            <div className="handoff-references">
              {artifact.children?.map((id) => (
                <span
                  key={id}
                  role="button"
                  tabIndex={0}
                  className={`doc-chip ${selectedArtifact === id || focusedChips.has(id) ? 'selected-chip' : ''}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    onSelect(id);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.stopPropagation();
                      onSelect(id);
                    }
                  }}
                >
                  {CHILD_LABELS[id] ?? id}
                </span>
              ))}
            </div>
          )}
        </>
      )}
    </button>
  );
}
