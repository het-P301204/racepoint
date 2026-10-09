import { useState } from 'react'
import { FileText, Plus, Trash2, Save } from 'lucide-react'
import { Card, CardHeader } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { DEMO_NOTES } from '../data'
import type { ResearchNote } from '@racepoint/shared'

// Local session-only notes (not persisted)
const PLACEHOLDER_NOTE: ResearchNote = {
  id: 'note-placeholder',
  linkedType: 'scenario',
  linkedId: 'RACE-001',
  content: `# Observations: RACE-001 HTTP Rate Limit\n\nThe race window is consistently 0-15ms wide under 10 concurrent requests.\n\nWith barrier sync enabled, violation rate is ~80%. Without barrier sync, it drops to ~30%.\n\n## Key Findings\n- The check-then-act pattern in the middleware is the root cause\n- Database constraint alone doesn't help here — needs in-process lock\n- Atomic compare-and-swap eliminates the window entirely`,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

export default function ResearchNotes() {
  const [notes, setNotes] = useState<ResearchNote[]>(
    DEMO_NOTES.length > 0 ? DEMO_NOTES : [PLACEHOLDER_NOTE]
  )
  const [selected, setSelected] = useState<ResearchNote | null>(notes[0] ?? null)
  const [content, setContent] = useState(selected?.content ?? '')
  const [dirty, setDirty] = useState(false)

  function handleNew() {
    const note: ResearchNote = {
      id: `note-${Date.now()}`,
      linkedType: 'scenario',
      linkedId: '',
      content: '# New Note\n\nStart writing...',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setNotes((prev) => [note, ...prev])
    setSelected(note)
    setContent(note.content)
    setDirty(false)
  }

  function handleSave() {
    if (selected === null) return
    const updated = { ...selected, content, updatedAt: new Date().toISOString() }
    setNotes((prev) => prev.map((n) => n.id === selected.id ? updated : n))
    setSelected(updated)
    setDirty(false)
  }

  function handleDelete(id: string) {
    const next = notes.filter((n) => n.id !== id)
    setNotes(next)
    if (selected?.id === id) {
      setSelected(next[0] ?? null)
      setContent(next[0]?.content ?? '')
    }
  }

  function selectNote(note: ResearchNote) {
    setSelected(note)
    setContent(note.content)
    setDirty(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
            Research Notes
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
            Observations, hypotheses, and findings linked to runs and scenarios
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={handleNew}>
          <Plus size={13} /> New Note
        </Button>
      </div>

      {notes.length === 0 ? (
        <EmptyState
          title="No notes yet"
          description="Create a note to track observations and findings"
          icon={<FileText size={32} />}
          action={<Button variant="primary" onClick={handleNew}>Create First Note</Button>}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 20, minHeight: 520 }}>
          {/* Note list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {notes.map((n) => (
              <div
                key={n.id}
                onClick={() => { selectNote(n) }}
                style={{
                  padding: '10px 12px',
                  borderRadius: 10,
                  cursor: 'pointer',
                  background: selected?.id === n.id ? 'var(--color-plum-dim)' : 'var(--bg-secondary)',
                  border: `1px solid ${selected?.id === n.id ? 'rgba(89,68,81,0.5)' : 'var(--border-subtle)'}`,
                  transition: 'all var(--transition-fast)',
                  position: 'relative',
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 600, color: selected?.id === n.id ? '#c4a8be' : 'var(--text-primary)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {n.content.split('\n')[0]?.replace(/^#+ /, '') ?? 'Untitled'}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                    {new Date(n.updatedAt).toLocaleDateString()}
                  </span>
                  <Badge variant="plum">{n.linkedType}</Badge>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(n.id) }}
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    opacity: 0,
                    padding: 2,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '1' }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '0' }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>

          {/* Editor */}
          {selected !== null ? (
            <Card style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  Last updated: {new Date(selected.updatedAt).toLocaleString()}
                </div>
                {dirty && (
                  <Button variant="primary" size="sm" onClick={handleSave}>
                    <Save size={12} /> Save
                  </Button>
                )}
              </div>
              <textarea
                value={content}
                onChange={(e) => {
                  setContent(e.target.value)
                  setDirty(true)
                }}
                style={{
                  flex: 1,
                  minHeight: 420,
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-sm)',
                  padding: 16,
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 13,
                  lineHeight: 1.7,
                  resize: 'vertical',
                  outline: 'none',
                }}
              />
            </Card>
          ) : (
            <EmptyState title="Select a note" description="Choose a note from the list to edit" />
          )}
        </div>
      )}
    </div>
  )
}
