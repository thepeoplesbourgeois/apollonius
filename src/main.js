import pixiedust, {render, html, useState} from 'neverland';

const Counter = pixiedust(() => {
  const [count, setCount] = useState(0);
  return html`
  <button onclick=${() => setCount(count + 1)}>
    Count: ${count}
  </button>`;
});

render(document.body, Counter);
