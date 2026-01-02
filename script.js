(function () {
  'use strict';

  // Elemen DOM
  const input = document.getElementById('arrayInput');
  const generateBtn = document.getElementById('generateBtn');
  const sortBtn = document.getElementById('sortBtn');
  const shuffleBtn = document.getElementById('shuffleBtn');
  const barsEl = document.getElementById('bars');
  const delayInput = document.getElementById('delay');
  const algoSelect = document.getElementById('algoSelect');
  const algoInfo = document.getElementById('algoInfo');
  const logList = document.getElementById('logList');

  // Fungsi Pembantu (Helpers)

  // Mencatat langkah ke log
  function logStep(message) {
    const li = document.createElement('li');
    li.textContent = `> ${message}`;
    logList.appendChild(li);
    // Auto scroll ke bawah
    const container = document.getElementById('logContainer');
    if (container) container.scrollTop = container.scrollHeight;
  }

  function clearLog() {
    if (logList) logList.innerHTML = '';
  }

  // Mengubah string input (pisahkan koma) menjadi array angka
  function parseArray(text) {
    if (!text) return [];
    return text.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !Number.isNaN(n));
  }

  // Menampilkan array sebagai balok (bars) visual
  function renderArray(arr) {
    barsEl.innerHTML = '';
    const max = Math.max(...arr, 1);
    arr.forEach(v => {
      const bar = document.createElement('div');
      bar.className = 'bar';
      // Tinggi bar proporsional terhadap nilai maksimum
      bar.style.height = `${(v / max) * 100}%`;
      bar.textContent = v;
      barsEl.appendChild(bar);
    });
  }

  // Fungsi delay untuk animasi
  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  // Mengaktifkan/menonaktifkan tombol kontrol saat sorting berjalan
  function setControlsDisabled(disabled) {
    sortBtn.disabled = generateBtn.disabled = shuffleBtn.disabled = disabled;
    if (algoSelect) algoSelect.disabled = disabled;
  }

  // Mendapatkan nilai delay dari input
  function getDelay() {
    const val = parseInt(delayInput.value, 10);
    return (Number.isNaN(val) || val < 0) ? 200 : val;
  }

  // Menukar posisi dua bar secara visual dan konten
  async function swapBars(i, j) {
    const nodes = Array.from(barsEl.children);
    const a = nodes[i], b = nodes[j];
    if (!a || !b) return;

    // Indikator visual: Sedang ditukar
    a.classList.add('swapped');
    b.classList.add('swapped');

    await sleep(getDelay());

    // Tukar tinggi dan teks elemen
    const ha = a.style.height;
    a.style.height = b.style.height;
    b.style.height = ha;

    const ta = a.textContent;
    a.textContent = b.textContent;
    b.textContent = ta;

    await sleep(getDelay());

    // Bersihkan kelas visual
    a.classList.remove('swapped');
    b.classList.remove('swapped');
  }

  // Algoritma Sorting (Visualizer)

  // Visualisasi Bubble Sort
  async function bubbleSortVisual() {
    logStep('Mulai Bubble Sort...');
    const bars = () => Array.from(barsEl.children);
    const n = bars().length;

    for (let i = 0; i < n; i++) {
      let swapped = false;
      for (let j = 0; j < n - i - 1; j++) {
        const a = bars()[j], b = bars()[j + 1];
        const valA = Number(a.textContent);
        const valB = Number(b.textContent);

        logStep(`Bandingkan indeks ${j} (${valA}) dan ${j + 1} (${valB})`);

        // Highlight sedang dibandingkan
        a.classList.add('comparing');
        b.classList.add('comparing');

        await sleep(getDelay());

        const va = Number(a.textContent), vb = Number(b.textContent);
        if (va > vb) {
          logStep(`  ${va} > ${vb}, Tukar posisi.`);
          await swapBars(j, j + 1);
          swapped = true;
        } else {
          logStep(`  ${va} <= ${vb}, Tidak tukar.`);
        }

        // Hapus highlight
        a.classList.remove('comparing');
        b.classList.remove('comparing');
      }
      // Elemen terakhir pada pass ini sudah terurut
      if (bars()[n - 1 - i]) {
        bars()[n - 1 - i].classList.add('sorted');
        logStep(`Elemen indeks ${n - 1 - i} terurut.`);
      }
      if (!swapped) {
        logStep('Tidak ada pertukaran pada pass ini. Selesai lebih awal.');
        // Jika tidak ada tukar, sisa elemen sudah terurut
        for (let k = 0; k < n - i - 1; k++) {
          if (bars()[k]) bars()[k].classList.add('sorted');
        }
        break;
      }
    }
    // Pastikan semua ditandai sorted di akhir
    Array.from(barsEl.children).forEach(el => el.classList.add('sorted'));
    logStep('Bubble Sort Selesai.');
  }

  // Visualisasi Heap Sort
  async function heapSortVisual() {
    logStep('Mulai Heap Sort...');
    const bars = () => Array.from(barsEl.children);
    const n = bars().length;

    // Fungsi untuk membentuk Max Heap
    async function heapify(size, root) {
      const b = bars();
      const left = 2 * root + 1;
      const right = 2 * root + 2;
      const idxs = [root];
      if (left < size) idxs.push(left);
      if (right < size) idxs.push(right);

      idxs.forEach(i => b[i].classList.add('comparing'));
      await sleep(getDelay());

      let largest = root;
      if (left < size && Number(b[left].textContent) > Number(b[largest].textContent)) largest = left;
      if (right < size && Number(b[right].textContent) > Number(b[largest].textContent)) largest = right;

      if (largest !== root) {
        logStep(`Heapify: Tukar root index ${root} (${b[root].textContent}) dengan index ${largest} (${b[largest].textContent})`);
      }

      idxs.forEach(i => b[i].classList.remove('comparing'));

      if (largest !== root) {
        await swapBars(root, largest);
        await heapify(size, largest);
      }
    }

    // Membangun heap (rearrange array)
    logStep('Membangun Max Heap...');
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) await heapify(n, i);

    // Satu per satu ekstrak elemen dari heap
    for (let end = n - 1; end > 0; end--) {
      // Pindahkan root sekarang ke akhir
      logStep(`Ekstrak Max: Tukar root (0) ke akhir (${end}).`);
      await swapBars(0, end);
      bars()[end].classList.add('sorted');
      // Panggil max heapify pada heap yang berkurang
      await heapify(end, 0);
    }
    if (n > 0) bars()[0].classList.add('sorted');
    logStep('Heap Sort Selesai.');
  }

  // Visualisasi Shell Sort
  async function shellSortVisual() {
    logStep('Mulai Shell Sort...');
    const bars = () => Array.from(barsEl.children);
    const n = bars().length;

    // Mulai dengan gap n/2, lalu bagi 2
    for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
      logStep(`Gap saat ini: ${gap}`);
      for (let i = gap; i < n; i++) {
        let j = i;
        const tempVal = Number(bars()[i].textContent);
        logStep(`  Cek elemen index ${i} (${tempVal}) dengan gap ${gap}`);
        while (j >= gap) {
          const a = bars()[j - gap], b = bars()[j];
          a.classList.add('comparing'); b.classList.add('comparing');
          await sleep(getDelay());
          const va = Number(a.textContent), vb = Number(b.textContent);

          if (va > vb) {
            logStep(`    ${va} > ${vb}, Tukar index ${j - gap} dan ${j}`);
            await swapBars(j - gap, j);
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
    logStep('Shell Sort Selesai.');
  }

  // Penjelasan Algoritma
  const algoExplanations = {
    bubble: '<strong>Bubble Sort</strong><br>Kompleksitas Waktu: <strong>O(n²)</strong>.<br>Bandingkan pasangan elemen berurutan dan tukar jika salah urut. Sifat: in-place dan stabil.',
    heap: '<strong>Heap Sort</strong><br>Kompleksitas Waktu: <strong>O(n log n)</strong>.<br>Bangun max-heap, tukar root (maks) dengan elemen terakhir dan lakukan heapify. Sifat: in-place, tidak stabil.',
    shell: '<strong>Shell Sort</strong><br>Kompleksitas Waktu: <strong>O(n log n) - O(n²)</strong>.<br>Generalisasi dari insertion sort dengan gap mengecil. Efisien dibanding insertion biasa. Sifat: in-place, tidak stabil.'
  };

  function updateAlgoInfo() {
    if (!algoInfo) return;
    const key = algoSelect ? algoSelect.value : 'bubble';
    algoInfo.innerHTML = algoExplanations[key] || 'Penjelasan tidak tersedia.';
  }

  // Event Listeners

  // Tombol Buat: Generate array acak
  generateBtn.addEventListener('click', () => {
    // Generate 8 angka acak antara 1 dan 100
    const count = 8;
    const arr = [];
    for (let i = 0; i < count; i++) {
      arr.push(Math.floor(Math.random() * 100) + 1);
    }
    input.value = arr.join(',');
    renderArray(arr);
    clearLog();
    logStep('Array baru dibuat.');
  });

  // Tombol Acak: Shuffle array yang ada
  shuffleBtn.addEventListener('click', () => {
    const arr = parseArray(input.value);
    // Algoritma Fisher-Yates Shuffle
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    input.value = arr.join(',');
    renderArray(arr);
    clearLog();
    logStep('Array diacak.');
  });

  // Tombol Urutkan: Jalankan algoritma yang dipilih
  sortBtn.addEventListener('click', async () => {
    setControlsDisabled(true); // Matikan kontrol saat sorting
    clearLog();
    const method = algoSelect ? algoSelect.value : 'bubble';
    if (method === 'heap') await heapSortVisual();
    else if (method === 'shell') await shellSortVisual();
    else await bubbleSortVisual();
    setControlsDisabled(false); // Hidupkan kembali
  });

  if (algoSelect) algoSelect.addEventListener('change', updateAlgoInfo);

  // Inisialisasi awal
  renderArray(parseArray(input.value));
  updateAlgoInfo();

})();
