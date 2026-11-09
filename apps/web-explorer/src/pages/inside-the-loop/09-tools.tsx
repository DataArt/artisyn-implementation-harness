import { Slide, Section, Callout, Cols, Panel, Tiles, BigQuote } from '../../components/primitives';
import { Glyph } from '../../components/glyphs';

export function Tools() {
  return (
    <Slide
      title="Tools: the project started generating its own tooling"
      lead="When the cost of writing a tool drops by a wide margin, you start building tools that simply never used to pay off."
    >
      <Section collapsible defaultOpen>
        <BigQuote
          attr="at a morning stand-up, unprompted"
          note={
            <p>
              Nothing below was in the project plan. What changed isn't enthusiasm — it's that an
              evening is now enough to find out whether the idea was any good, so the tools that
              would never have survived a business case get built anyway.
            </p>
          }
        >
          "Built us a tool last night — have a look, maybe it's useful."
        </BigQuote>
      </Section>

      <Section title="What grew inside the project" collapsible defaultOpen>
        <Cols n={2}>
          <Panel title="Data Explorer" icon={<Glyph name="catalog" />}>
            <p>
              A small internal app for browsing the project's own data model: schema, a query
              runner, a few sanity checks. Nobody asked for it; it just made the data easier to
              reason about.
            </p>
          </Panel>
          <Panel title="Sync Tool" icon={<Glyph name="migration" />}>
            <p>
              Keeps two data stores in agreement — schema, data, consistency checks. Built once a
              manual sync step became a recurring source of drift.
            </p>
          </Panel>
          <Panel title="Docs Portal" icon={<Glyph name="docs" />}>
            <p>
              A browsable site for all project documentation. Docs became something people actually
              open, not a pile of markdown files nobody reads.
            </p>
          </Panel>
          <Panel title="Usage Dashboard" icon={<Glyph name="usage" />}>
            <p>
              A report on actual agent usage: sessions, messages, tokens, cache hit share, hourly
              activity. Adoption became something you could measure, not just eyeball.
            </p>
          </Panel>
          <Panel title="Load Test" icon={<Glyph name="loadtest" />}>
            <p>
              A small harness for load-testing a query path — the thing that settled a "read
              directly or precompute" debate with numbers, not opinions.
            </p>
          </Panel>
        </Cols>
      </Section>

      <Callout tone="good">
        None of these tools were in the original project plan. Each one appeared because something
        was getting in someone's way, and writing a tool became cheaper than putting up with it.{' '}
        <b>That's the main secondary effect of adoption</b> — the bar for "easier to just live with
        it" keeps dropping.
      </Callout>

      <Section title="Tools by the numbers" collapsible defaultOpen>
        <Tiles
          items={[
            { value: '5', label: 'Internal tools', note: 'in apps/tools/' },
            { value: '15.7', unit: 'k', label: 'Lines of tooling', note: '8% of the codebase' },
            { value: '0', label: 'Were in the original plan', note: 'all grew out of pain' },
          ]}
        />
      </Section>
    </Slide>
  );
}
