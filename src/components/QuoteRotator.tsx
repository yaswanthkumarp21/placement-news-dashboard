"use client";
import { useEffect, useRef, useState } from "react";
import { QUOTES } from "@/lib/quotes";

const EVERY_MS = 9000;

/** A random quote that swaps by itself every few seconds (never the same one twice in a row). Hover or touch holds it. */
export function QuoteRotator() {
  const [i, setI] = useState<number | null>(null);
  const [show, setShow] = useState(true);
  const held = useRef(false);

  // start on a random quote after load, so server and browser HTML match
  useEffect(() => {
    setI(Math.floor(Math.random() * QUOTES.length));
  }, []);

  useEffect(() => {
    if (i === null) return;
    const id = setInterval(() => {
      if (held.current) return;
      setShow(false);
      setTimeout(() => {
        setI((cur) => {
          let n = Math.floor(Math.random() * QUOTES.length);
          if (n === cur) n = (n + 1) % QUOTES.length;
          return n;
        });
        setShow(true);
      }, 450);
    }, EVERY_MS);
    return () => clearInterval(id);
  }, [i === null]); // eslint-disable-line react-hooks/exhaustive-deps

  const q = i === null ? null : QUOTES[i];
  const hold = (v: boolean) => () => {
    held.current = v;
  };
  return (
    <figure className="pn-quote" onMouseEnter={hold(true)} onMouseLeave={hold(false)} onTouchStart={hold(true)} onTouchEnd={hold(false)}>
      <div className={`pn-quote-body${show ? " in" : ""}`}>
        {q ? (
          <>
            <blockquote>“{q.text}”</blockquote>
            <figcaption className={q.sacred ? "sacred" : ""}>{q.sacred ? "ॐ " : "— "}{q.by}</figcaption>
          </>
        ) : null}
      </div>
    </figure>
  );
}
