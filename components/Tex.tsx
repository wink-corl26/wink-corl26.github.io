import katex from 'katex';

export function Tex({ children, block = false, tail }: { children: string; block?: boolean; tail?: string }) {
  const html = katex.renderToString(children, { displayMode: block, throwOnError: false, output: 'html' });
  if (block) return <div className="my-4 overflow-x-auto overflow-y-hidden" dangerouslySetInnerHTML={{ __html: html }} />;
  return (
    <span className="whitespace-nowrap">
      <span dangerouslySetInnerHTML={{ __html: html }} />
      {tail}
    </span>
  );
}
