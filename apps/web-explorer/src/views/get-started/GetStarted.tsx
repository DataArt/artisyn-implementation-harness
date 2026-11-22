'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowUpRight,
  Asterisk,
  Bot,
  Check,
  Copy,
  Code2,
  Download,
  FileCode2,
  Hexagon,
  Layers,
  Link2,
  RefreshCw,
  Rocket,
  SquareTerminal,
  Tag,
} from 'lucide-react';
import {
  channels,
  installBlocks,
  launchBlocks,
  providers,
  updateBlocks,
  RELEASES_URL,
  VERSION,
  type ChannelId,
  type CommandBlock,
  type ProviderId,
} from './commands';
import { siteUrl } from '../../site';
import './getStarted.css';

/**
 * Configurator-style install guide: two toggle groups (channel × provider)
 * drive the three numbered sections below. All command content lives in
 * commands.ts; this file is only selection state + presentation. Selection is
 * mirrored into the query (?channel=…&provider=…) so a configuration can be
 * shared as a link. The exported page shows the default selection
 * (GetStartedView, the Suspense fallback); GetStarted applies the query after
 * hydration.
 */

const providerIcon = (id: ProviderId, size = 15) =>
  id === 'claude' ? (
    <Asterisk size={size} />
  ) : id === 'codex' ? (
    <Hexagon size={size} />
  ) : (
    <Code2 size={size} />
  );

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className={`gs-copy${copied ? ' is-copied' : ''}`}
      onClick={() => {
        navigator.clipboard?.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        });
      }}
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

/** Tint the leading word of each shell line so commands scan like the terminal. */
function CodeLine({ line, kind }: { line: string; kind: CommandBlock['kind'] }) {
  if (kind === 'file') return <div className="gs-code-line">{line}</div>;
  const space = line.indexOf(' ');
  const head = space === -1 ? line : line.slice(0, space);
  const rest = space === -1 ? '' : line.slice(space);
  return (
    <div className="gs-code-line">
      <span className="gs-code-head">{head}</span>
      {rest}
    </div>
  );
}

function CommandCard({ block }: { block: CommandBlock }) {
  return (
    <div className="gs-card">
      <div className="gs-card-top">
        {block.kind === 'terminal' ? (
          <SquareTerminal size={14} />
        ) : block.kind === 'agent' ? (
          <Asterisk size={14} />
        ) : (
          <FileCode2 size={14} />
        )}
        <span>{block.label}</span>
      </div>
      <div className="gs-card-body">
        <pre className="gs-code mono">
          {block.code.split('\n').map((line, i) => (
            <CodeLine key={i} line={line} kind={block.kind} />
          ))}
        </pre>
        <CopyButton text={block.code} />
      </div>
      {block.note && <p className="gs-card-note">{block.note}</p>}
    </div>
  );
}

interface StepProps {
  num: string;
  icon: React.ReactNode;
  title: string;
  blocks: CommandBlock[];
}

function Step({ num, icon, title, blocks }: StepProps) {
  return (
    <div className="gs-step">
      <div className="gs-step-rail">
        <span className="gs-step-num">{num}</span>
        <span className="gs-step-line" aria-hidden="true" />
      </div>
      <div className="gs-step-info">
        <span className="gs-step-icon">{icon}</span>
        <h3>{title}</h3>
      </div>
      <div className="gs-step-cards">
        {blocks.map((block) => (
          <CommandCard key={block.label + block.code} block={block} />
        ))}
      </div>
    </div>
  );
}

const findChannel = (id: string | null) => channels.find((c) => c.id === id) ?? channels[0];
const findProvider = (id: string | null) => providers.find((p) => p.id === id) ?? providers[0];

/** Configurator for one selection. Without `onSelect` (the pre-rendered fallback) the toggles are inert. */
export function GetStartedView({
  channelId,
  providerId,
  onSelect,
}: {
  channelId: ChannelId;
  providerId: ProviderId;
  onSelect?: (channel: ChannelId, provider: ProviderId) => void;
}) {
  const channel = findChannel(channelId);
  const provider = findProvider(providerId);
  const [shared, setShared] = useState(false);

  const select = (key: 'channel' | 'provider', value: string) =>
    onSelect?.(
      (key === 'channel' ? value : channel.id) as ChannelId,
      (key === 'provider' ? value : provider.id) as ProviderId
    );

  return (
    <main className="container gs-page">
      <section className="gs-config" aria-label="Configuration">
        <div className="gs-config-group">
          <div className="gs-config-head">
            <Layers size={17} />
            <strong>Installation channel</strong>
          </div>
          <div className="gs-toggles" role="group" aria-label="Installation channel">
            {channels.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`gs-toggle${c.id === channel.id ? ' is-active' : ''}`}
                aria-pressed={c.id === channel.id}
                title={c.pickWhen}
                onClick={() => select('channel', c.id)}
              >
                {c.label}
                {c.soon && <em>soon</em>}
              </button>
            ))}
          </div>
        </div>
        <div className="gs-config-group">
          <div className="gs-config-head">
            <Bot size={17} />
            <strong>AI provider</strong>
          </div>
          <div className="gs-toggles" role="group" aria-label="AI provider">
            {providers.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`gs-toggle${p.id === provider.id ? ' is-active' : ''}`}
                aria-pressed={p.id === provider.id}
                onClick={() => select('provider', p.id)}
              >
                {providerIcon(p.id)}
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <div className="gs-corner">
          <a
            className="gs-chip gs-version"
            href={RELEASES_URL}
            target="_blank"
            rel="noopener noreferrer"
            title="All releases"
          >
            <Tag size={12} />v{VERSION}
            <ArrowUpRight size={11} />
          </a>
          <button
            type="button"
            className={`gs-chip gs-share${shared ? ' is-copied' : ''}`}
            title={`Copy a link to ${channel.label} + ${provider.label}`}
            onClick={() => {
              onSelect?.(channel.id, provider.id);
              const url = `${siteUrl}/get-started/?channel=${channel.id}&provider=${provider.id}`;
              navigator.clipboard?.writeText(url).then(() => {
                setShared(true);
                setTimeout(() => setShared(false), 1600);
              });
            }}
          >
            {shared ? <Check size={12} /> : <Link2 size={12} />}
            {shared ? 'Copied' : 'Share'}
          </button>
        </div>
      </section>

      <div className="gs-steps">
        <Step
          num="01"
          icon={<Download size={21} />}
          title="Install"
          blocks={installBlocks(channel, provider)}
        />
        <Step
          num="02"
          icon={<Rocket size={21} />}
          title="Launch"
          blocks={launchBlocks(channel, provider)}
        />
        <Step
          num="03"
          icon={<RefreshCw size={21} />}
          title="Update"
          blocks={updateBlocks(channel, provider)}
        />
      </div>

      <p className="gs-version-note">
        Commands pin the latest version, <code className="mono">{VERSION}</code>. Older versions are
        on the{' '}
        <a href={RELEASES_URL} target="_blank" rel="noopener noreferrer">
          releases page
        </a>
        .
      </p>
    </main>
  );
}

export default function GetStarted() {
  const params = useSearchParams();
  const router = useRouter();
  const channel = findChannel(params.get('channel'));
  const provider = findProvider(params.get('provider'));
  return (
    <GetStartedView
      channelId={channel.id}
      providerId={provider.id}
      onSelect={(c, p) =>
        router.replace(`/get-started/?channel=${c}&provider=${p}`, { scroll: false })
      }
    />
  );
}
