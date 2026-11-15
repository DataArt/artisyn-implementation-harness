# Accessibility

Accessibility is a core priority for the **Artisyn Implementation Harness**. We want everyone, including people with disabilities and people using assistive technology, to be able to read, navigate, and contribute to this project: the landing site, the documentation site, and the harness itself.

This document explains our accessibility commitment, how contributors can help us uphold it, and how to report accessibility issues.

## Priorities

- **Accessibility target:** We work toward [WCAG 2.2 Level AA](https://www.w3.org/TR/WCAG22). This target guides our work but is not a claim of verified conformance.
- **Keyboard support.** Every interactive element must be reachable and operable with a keyboard alone, with a visible focus indicator and a logical tab order.
- **Screen reader support.** Content uses semantic HTML and a logical heading hierarchy so it can be navigated with VoiceOver, NVDA, JAWS, and similar tools.
- **Readable content.** We use plain language when possible, descriptive link text, sufficient color contrast, semantic lists, and meaningful alternative text.
- **Motion and reflow.** Non-essential animation respects `prefers-reduced-motion`, auto-playing animation can be paused, and pages reflow at high zoom and narrow widths.
- **Plain language in the harness.** Skill output, prompts, and generated documents are written in short sentences so they work with screen readers, translation, and plain terminals.

The architecture-level requirements behind these priorities live in `docs/Target Architecture (HLD)/v1/Non-Functional Concerns/Accessibility.md`. That document is what the next round of website work is built against.

## Contributor expectations

If you are contributing content or code, please follow these guardrails so we don't regress accessibility:

- **Testing**
  - For UI changes, test with an automated accessibility tool (such as [axe DevTools](https://www.deque.com/axe/devtools/) or the [GitHub Accessibility Scanner](https://github.com/github/accessibility-scanner)).
  - Do at least one keyboard-only pass on any change involving interactive UI elements.
    - Tab order is logical (no jumps, no traps, reaches all interactive controls).
    - A visible focus indicator is always present and has sufficient contrast.
    - All actions work by keyboard (Tab/Shift+Tab, Enter, Space, arrow keys where expected).
    - No keyboard trap (you can move into and out of modals, menus, popovers, and embedded widgets).
  - Turn on reduced motion at the OS level and confirm the page still makes sense.
  - Check at 200% browser zoom and at a 320px-wide viewport.
  - Spot-check screen reader behavior for new components or significant content changes.
    - You can navigate by headings and landmarks.
    - Controls have clear, accessible labels (a programmatic name that matches the action or field purpose).
    - Custom controls expose proper semantics and state (role, name, value; toggles, expanded, and selected are announced).
    - Lists and list items are announced appropriately.
    - Dynamic updates are announced appropriately (status, errors, transcript output, via ARIA live regions as needed).
    - Reading order is logical.
- **Documentation and content**
  - Use a logical heading hierarchy (do not skip levels).
  - Use real list elements (not text formatted to look like a list; the same goes for headings).
  - Use unique, descriptive link text (avoid "click here" or "read more").
  - Provide meaningful alternative text for images; refer to the [W3C alt Decision Tree](https://www.w3.org/WAI/tutorials/images/decision-tree/).
  - For complex images and diagrams, including Mermaid and interactive diagrams, include a text alternative nearby.
  - For tables, provide column and row headers.
  - Don't use color as the only way to convey meaning.
  - Content reflows without loss of information or functionality (test at 200% and with narrow widths).
- **CI/CD**
  - The pull request template asks you to confirm the keyboard, reduced-motion, and narrow-width passes for any change to the website.
  - PRs may be blocked if they introduce accessibility violations detected by our linting or scanning workflows.
  - Resolve flagged issues, or document why a violation cannot be addressed in the PR description.

## Reporting accessibility issues

If you run into an accessibility barrier, please let us know. We treat accessibility reports as expertise, not complaints.

1. **Open an issue** using the [accessibility barrier template](https://github.com/DataArt/artisyn-implementation-harness/issues/new?template=accessibility_barrier.yml).
2. Include, when possible:
   - What you were trying to do and what went wrong.
   - The page URL, or the document path if it is in the repository.
   - Steps to reproduce.
   - Your operating system, browser, and assistive technology (with versions).
   - A screen recording or screenshot, if you're comfortable sharing one.
   - Severity, using the [defined taxonomy](#severity).

If you would rather not file a public issue, start a [discussion](https://github.com/DataArt/artisyn-implementation-harness/discussions) or contact the maintainer listed in `.github/CODEOWNERS`.

### Severity

- **Critical:** Prevents you from completing a core task (for example, you cannot read a documentation page at all, or cannot operate the site by keyboard).
- **Serious:** Significant difficulty, but a workaround exists.
- **Moderate:** Annoyance or inconsistent experience.
- **Minor:** Minor issue with minimal impact on usability.

### How we respond

- We will acknowledge the reporter's experience promptly, respectfully, and constructively, treating accessibility reports as valuable project expertise rather than complaints.
- We will not require reporters to disclose a diagnosis or other personal information.
- We will explain next steps, known limitations, and relevant dependencies.
- Where possible, we will provide a workaround while a fix is in progress.
- We will provide updates when the status or expected timeline changes (for example, "We're working on this, tracking in #123").
- We may ask the reporter to confirm that a fix resolves the barrier before closing the issue.
- We will thank the reporter for helping improve the project.

## Ownership and maintenance

Accessibility is owned by the **repository maintainer** listed in `.github/CODEOWNERS`.

## Supported environments

The website is published as static HTML and is intended to work across:

- **Web (desktop):** latest two versions of Chrome, Edge, Firefox, and Safari.
- **Web (mobile):** latest two versions of Mobile Safari and Chrome on Android.
- **Assistive technology:** VoiceOver (macOS / iOS), NVDA (Windows), JAWS (Windows), TalkBack (Android).

Partial-support notes:

- The harness itself runs inside an AI coding assistant such as Claude Code. Its output is plain text and Markdown, so it inherits the accessibility of the terminal or IDE it runs in; we do not control those.
- Embedded third-party widgets (the giscus comments widget, interactive diagram canvases) are supported on a best-effort basis.

## Known limitations

- The animated terminal at the top of the landing page plays on its own and cannot yet be paused, except by turning on reduced motion.
- Interactive diagrams on the Inside the loop and Docs flow pages, and Mermaid diagrams in the documentation, do not yet have a text alternative beyond the surrounding prose.
- There is no skip-to-content link yet, so keyboard users move through the header on every page.
- The dark theme has not had a systematic color-contrast review.

Each of these is tracked against the HLD accessibility requirements. Please open an accessibility issue if you find another barrier, or if one of these affects you more than the list suggests.

## Feedback

Accessibility is an ongoing practice, not a one-time fix. If you have suggestions for improving this statement or our practices, please open an issue or a pull request. Thank you for helping make the Artisyn Implementation Harness usable by everyone.

---

This statement is adapted from the [Open Source Accessibility toolkit](https://github.com/open-source-accessibility/accessibility-toolkit) template, used under the MIT License.
