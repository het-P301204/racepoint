import { FolderOpen } from 'lucide-react'
import { Card, CardHeader } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'

const CODE_VULNERABLE = `# VULNERABLE: TOCTOU between check and creation
import os

def create_config(path):
    # CHECK: does file exist?
    if not os.path.exists(path):          # ← Race window starts
        # ... another process creates path here ...
        with open(path, 'w') as f:        # ← Overwrites attacker file!
            f.write(DEFAULT_CONFIG)
    return load_config(path)`

const CODE_HARDENED = `# HARDENED: Atomic O_EXCL flag (POSIX)
import os

def create_config(path):
    try:
        # O_EXCL: fail atomically if file exists
        fd = os.open(path, os.O_CREAT | os.O_EXCL | os.O_WRONLY, 0o600)
        with os.fdopen(fd, 'w') as f:
            f.write(DEFAULT_CONFIG)
    except FileExistsError:
        pass  # Already exists, safe to proceed
    return load_config(path)`

const CODE_TEMP = `# HARDENED: Write to temp, then atomic rename
import os
import tempfile

def write_config(path, data):
    dir_ = os.path.dirname(path)
    # Write to temp file in same directory (same filesystem!)
    fd, tmp_path = tempfile.mkstemp(dir=dir_, prefix='.tmp')
    try:
        with os.fdopen(fd, 'w') as f:
            f.write(data)
        os.chmod(tmp_path, 0o600)
        os.replace(tmp_path, path)  # Atomic on POSIX
    except Exception:
        os.unlink(tmp_path)
        raise`

function CodeBlock({ code, label }: { code: string; label: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
        {label}
      </div>
      <pre
        style={{
          margin: 0,
          padding: '14px 16px',
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-subtle)',
          fontSize: 12,
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-mono)',
          overflowX: 'auto',
          lineHeight: 1.7,
        }}
      >
        <code>{code}</code>
      </pre>
    </div>
  )
}

export default function Filesystem() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
          Filesystem TOCTOU
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
          Time-of-check-time-of-use vulnerabilities in filesystem operations
        </p>
      </div>

      <Card style={{ borderLeft: '3px solid var(--color-marigold)' }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <FolderOpen size={20} style={{ color: 'var(--color-marigold)', flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
              What is Filesystem TOCTOU?
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 8 }}>
              Filesystem TOCTOU occurs when a program checks a file's state (existence, permissions, type)
              and then acts on it (reads, writes, executes), but another process modifies the filesystem
              between those two operations.
            </p>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7 }}>
              Classic attacks include symlink races (replacing a regular file with a symlink between
              check and use) and creation races (creating a file that another process overwrites).
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Vulnerable Pattern"
          action={<Badge variant="coral">Vulnerable</Badge>}
        />
        <CodeBlock code={CODE_VULNERABLE} label="os.path.exists() + open() race" />
        <div style={{ marginTop: 12, padding: 12, background: 'var(--color-coral-dim)', borderRadius: 8, border: '1px solid rgba(228,93,75,0.2)' }}>
          <p style={{ fontSize: 13, color: 'var(--color-coral)', margin: 0 }}>
            Between <code style={{ fontFamily: 'var(--font-mono)' }}>os.path.exists()</code> and{' '}
            <code style={{ fontFamily: 'var(--font-mono)' }}>open()</code>, an attacker can create a
            symlink pointing to /etc/passwd — causing the write to overwrite a privileged file.
          </p>
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card>
          <CardHeader
            title="O_EXCL Flag"
            action={<Badge variant="sage">Hardened</Badge>}
          />
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.6 }}>
            Use the <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-mono)' }}>O_CREAT | O_EXCL</code> flags
            to atomically create and exclusively open a file. The kernel guarantees that no race window exists.
          </p>
          <CodeBlock code={CODE_HARDENED} label="Atomic O_EXCL creation" />
        </Card>

        <Card>
          <CardHeader
            title="Temp + Rename"
            action={<Badge variant="sage">Hardened</Badge>}
          />
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.6 }}>
            Write to a uniquely-named temp file, then atomically rename it into place.
            On POSIX systems, <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-mono)' }}>rename()</code> is atomic.
          </p>
          <CodeBlock code={CODE_TEMP} label="Atomic write + rename" />
        </Card>
      </div>

      <Card>
        <CardHeader title="Common Scenarios" subtitle="Filesystem TOCTOU attack patterns" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {[
            { name: 'Symlink Race', risk: 'Critical', desc: 'Attacker replaces file with symlink between stat() and open(), redirecting writes to privileged locations.' },
            { name: 'Creation Race', risk: 'High', desc: 'Concurrent processes both check file absence and attempt creation, leading to one overwriting the other.' },
            { name: 'Permission Race', risk: 'High', desc: 'File permissions change between access() check and the privileged operation.' },
            { name: 'Directory Traversal', risk: 'Medium', desc: 'Path component changes between path normalization and file access, escaping intended directory.' },
          ].map((s) => (
            <div
              key={s.name}
              style={{
                padding: 14,
                background: 'var(--bg-surface)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{s.name}</span>
                <Badge variant={s.risk === 'Critical' ? 'coral' : s.risk === 'High' ? 'marigold' : 'stone'}>
                  {s.risk}
                </Badge>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
