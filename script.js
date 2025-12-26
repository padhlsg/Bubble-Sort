(function(){
  'use strict';

  // Elements
  const input = document.getElementById('arrayInput');
  const generateBtn = document.getElementById('generateBtn');
  const sortBtn = document.getElementById('sortBtn');
  const shuffleBtn = document.getElementById('shuffleBtn');
  const barsEl = document.getElementById('bars');
  const delayInput = document.getElementById('delay');
  const algoSelect = document.getElementById('algoSelect');
  const algoInfo = document.getElementById('algoInfo');

  // Helpers
  function parseArray(text){
    if (!text) return [];
    return text.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !Number.isNaN(n));
  }

  function renderArray(arr){
    barsEl.innerHTML = '';
    const max = Math.max(...arr, 1);
    arr.forEach(v => {
      const bar = document.createElement('div');
      bar.className = 'bar';
      bar.style.height = `${(v / max) * 100}%`;
      bar.textContent = v;
      barsEl.appendChild(bar);
    });
  }

  function sleep(ms){ return new Promise(r => setTimeout(r, ms)); }

  function setControlsDisabled(disabled){
    sortBtn.disabled = generateBtn.disabled = shuffleBtn.disabled = disabled;
    if (algoSelect) algoSelect.disabled = disabled;
  }

  async function swapBars(i, j){
    const nodes = Array.from(barsEl.children);
    const a = nodes[i], b = nodes[j];
    if (!a || !b) return;
    a.classList.add('swapped'); b.classList.add('swapped');
    await sleep(Number(delayInput.value));
    const ha = a.style.height;
    a.style.height = b.style.height;
    b.style.height = ha;
    const ta = a.textContent;
    a.textContent = b.textContent;
    b.textContent = ta;
    await sleep(Number(delayInput.value));
    a.classList.remove('swapped'); b.classList.remove('swapped');
  }

  // Algorithms (visualizers)
  async function bubbleSortVisual(){
    const bars = () => Array.from(barsEl.children);
    const n = bars().length;
    for (let i = 0; i < n; i++){
      let swapped = false;
      for (let j = 0; j < n - i - 1; j++){
        const a = bars()[j], b = bars()[j+1];
        a.classList.add('comparing'); b.classList.add('comparing');
        await sleep(Number(delayInput.value));
        const va = Number(a.textContent), vb = Number(b.textContent);
        if (va > vb){
          await swapBars(j, j+1);
          swapped = true;
        }
        a.classList.remove('comparing'); b.classList.remove('comparing');
      }
      if (!swapped) break;
    }
    Array.from(barsEl.children).forEach(el => el.classList.add('sorted'));
  }

  async function heapSortVisual(){
    const bars = () => Array.from(barsEl.children);
    const n = bars().length;

    async function heapify(size, root){
      const b = bars();
      const left = 2*root + 1;
      const right = 2*root + 2;
      const idxs = [root];
      if (left < size) idxs.push(left);
      if (right < size) idxs.push(right);

      idxs.forEach(i => b[i].classList.add('comparing'));
      await sleep(Number(delayInput.value));

      let largest = root;
      if (left < size && Number(b[left].textContent) > Number(b[largest].textContent)) largest = left;
      if (right < size && Number(b[right].textContent) > Number(b[largest].textContent)) largest = right;

      idxs.forEach(i => b[i].classList.remove('comparing'));

      if (largest !== root){
        await swapBars(root, largest);
        await heapify(size, largest);
      }
    }

    for (let i = Math.floor(n/2) - 1; i >= 0; i--) await heapify(n, i);
    for (let end = n-1; end > 0; end--){
      await swapBars(0, end);
      bars()[end].classList.add('sorted');
      await heapify(end, 0);
    }
    if (n>0) bars()[0].classList.add('sorted');
  }

  async function shellSortVisual(){
    const bars = () => Array.from(barsEl.children);
    const n = bars().length;
    for (let gap = Math.floor(n/2); gap > 0; gap = Math.floor(gap/2)){
      for (let i = gap; i < n; i++){
        let j = i;
        while (j >= gap){
          const a = bars()[j-gap], b = bars()[j];
          a.classList.add('comparing'); b.classList.add('comparing');
          await sleep(Number(delayInput.value));
          const va = Number(a.textContent), vb = Number(b.textContent);
          if (va > vb){
            await swapBars(j-gap, j);
            a.classList.remove('comparing'); b.classList.remove('comparing');
            j -= gap;
          } else {
            a.classList.remove('comparing'); b.classList.remove('comparing');
            break;
          }
        }
      }
    }
    Array.from(barsEl.children).forEach(el => el.classList.add('sorted'));
  }

  // Explanations
  const algoExplanations = {
    bubble: '<strong>Bubble Sort</strong><br>Bandingkan pasangan elemen berurutan dan tukar jika salah urut. Sifat: in-place dan stabil. Kompleksitas: O(n^2). Cocok untuk ilustrasi.',
    heap: '<strong>Heap Sort</strong><br>Bangun max-heap, tukar root (maks) dengan elemen terakhir dan lakukan heapify. Sifat: in-place, tidak stabil. Kompleksitas: O(n log n).',
    shell: '<strong>Shell Sort</strong><br>Generalization dari insertion sort menggunakan gap yang mengecil; mempercepat pengurutan dibanding insertion untuk banyak kasus. Sifat: in-place, tidak stabil.'
  };

  function updateAlgoInfo(){
    if (!algoInfo) return;
    const key = algoSelect ? algoSelect.value : 'bubble';
    algoInfo.innerHTML = algoExplanations[key] || 'Penjelasan tidak tersedia.';
  }

  // Events
  generateBtn.addEventListener('click', () => renderArray(parseArray(input.value)));

  shuffleBtn.addEventListener('click', () => {
    const arr = parseArray(input.value);
    for (let i = arr.length -1; i>0; i--){
      const j = Math.floor(Math.random()*(i+1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    input.value = arr.join(',');
    renderArray(arr);
  });

  sortBtn.addEventListener('click', async () => {
    setControlsDisabled(true);
    const method = algoSelect ? algoSelect.value : 'bubble';
    if (method === 'heap') await heapSortVisual();
    else if (method === 'shell') await shellSortVisual();
    else await bubbleSortVisual();
    setControlsDisabled(false);
  });

  if (algoSelect) algoSelect.addEventListener('change', updateAlgoInfo);

  // initial
  renderArray(parseArray(input.value));
  updateAlgoInfo();

})();
