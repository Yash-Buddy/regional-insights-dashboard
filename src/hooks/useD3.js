import { useRef, useEffect } from 'react';
import * as d3 from 'd3';

export function useD3(renderFn, dependencies) {
  const ref = useRef();

  useEffect(() => {
    renderFn(d3.select(ref.current));
    return () => {};
  }, dependencies);

  return ref;
}
