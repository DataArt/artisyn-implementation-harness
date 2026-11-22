import type React from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import Footer from '../../../components/Footer';
import { docsUrl } from '../../../env';
import { CHECKLIST, CONTEXT_LAYERS } from './data';
import TopologyExplorer from './TopologyExplorer';
import './context-topology.css';

const LANDSCAPE = 'Harness/00%20The%20Story/02%20Context%20Landscape.html';

export default function ContextTopology() {
  const landscape = `${docsUrl.replace(/\/?$/, '/')}${LANDSCAPE}`;
  return (
    <>
      <main className="container section ct-page">
        <div className="section-heading">
          <span className="ct-eyebrow">COOKBOOK · BEFORE YOU LAUNCH</span>
          <h1>Design the context topology first.</h1>
          <p>
            The harness builds and keeps your project context, but it can only keep what you give it
            a shape for. Decide which repositories form one context, and where product decisions
            live, before you run the launch. That preparation is most of the work of a good start.
          </p>
        </div>

        <section className="ct-block" aria-labelledby="ct-layers">
          <h2 id="ct-layers">Every layer is owned, except one</h2>
          <p className="ct-lead">
            Business goals already have an owner. Technical standards and integration contracts are
            governed centrally, or by a product-level harness setup that keeps them across projects.
            The project context, what was decided and built this sprint, has no owner by default:
            the project harness keeps it, so its boundary is the decision that matters most.
          </p>
          <div className="ct-zoom-wrap">
            <div className="ct-zoom-axis" aria-hidden="true">
              <span>Zoomed out: strategic</span>
              <span>Zoomed in: operational</span>
            </div>
            <ol className="ct-zoom">
              {CONTEXT_LAYERS.map((layer, i) => (
                <li
                  key={layer.name}
                  className={layer.gap ? 'ct-band is-gap' : 'ct-band'}
                  style={{ '--band': i } as React.CSSProperties}
                >
                  <span className="ct-band-zoom">{layer.zoom}</span>
                  <span className="ct-band-body">
                    <strong>{layer.name}</strong>
                    <span className="ct-band-question">{layer.question}</span>
                  </span>
                  <span className="ct-band-owner">
                    {layer.keptBy && (
                      <span className={`ct-keep ct-keep-${layer.keptBy}`}>
                        {layer.keptBy === 'product'
                          ? 'Product harness can govern'
                          : 'Project harness keeps it'}
                      </span>
                    )}
                    <span>{layer.owner}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
          <a href={landscape} className="icon-link ct-more">
            Read the Context Landscape <ArrowUpRight size={14} />
          </a>
        </section>

        <section className="ct-block" aria-labelledby="ct-topologies">
          <h2 id="ct-topologies">Pick the topology that matches your repositories</h2>
          <p className="ct-lead">
            Project mode keeps one project’s context; product mode keeps the decisions that span
            projects. How you combine them depends on how the code is laid out today.
          </p>
          <TopologyExplorer />
        </section>

        <section className="ct-block" aria-labelledby="ct-checklist">
          <h2 id="ct-checklist">Answer these before you launch</h2>
          <ol className="ct-checklist">
            {CHECKLIST.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
          <div className="hero-actions">
            <Link href="/get-started/" className="button button-primary">
              Get started <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
