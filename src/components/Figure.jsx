import { UI } from '../utils/colors';

// Wraps any chart in a paper-style figure: chart, then "Figure N." caption and source.
export default function Figure({ number, caption, source, children }) {
  return (
    <figure className="my-12 -mx-4 lg:-mx-16">
      <div>{children}</div>
      <figcaption
        className="mt-3 px-4 lg:px-0 text-sm leading-relaxed"
        style={{ color: UI.textMuted }}
      >
        <strong className="text-white font-semibold">Figure {number}.</strong> {caption}
        {source && <span className="block mt-1 italic">Source: {source}</span>}
      </figcaption>
    </figure>
  );
}
