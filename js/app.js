/****************************
 * KONFIGURASI
 ****************************/
const ENDPOINT =
  'https://script.google.com/macros/s/AKfycbxpeeFW2JV2G9uYLGP8YDtzMIJ35I4sz6H7gMsjdNxPaCVU0hXbca-aGYTDFns4pSTb/exec';

/****************************
 * ELEMENT (SAFE)
 ****************************/
document.addEventListener('DOMContentLoaded', () => {
  window.statusEl = document.getElementById('status');
});

/****************************
 * HELPER STATUS UI
 ****************************/
function setStatus(text, type = '') {
  if (!window.statusEl) return;
  statusEl.textContent = text;
  statusEl.className = 'status ' + type;
}

/****************************
 * AMBIL TOKEN DARI URL
 ****************************/
function getToken() {
  const token = new URLSearchParams(window.location.search).get('token');
  return token ? token.trim() : '';
}

/****************************
 * DISABLE / ENABLE BUTTON
 ****************************/
function lockButtons(lock) {
  document.querySelectorAll('button').forEach(btn => {
    btn.disabled = lock;
  });
}

/****************************
 * ABSENSI
 ****************************/
function absen(tipe) {
  const nik = document.getElementById('nik')?.value.trim();
  const nama = document.getElementById('nama')?.value.trim();
  const departemen = document.getElementById('departemen')?.value;
  const line = document.getElementById('line')?.value.trim();
  const token = getToken();

  // VALIDASI FORM
  if (!nik || !nama || !departemen || !line) {
    setStatus('❌ Data belum lengkap', 'error');
    return;
  }

  // VALIDASI TOKEN
  if (!token) {
    setStatus('❌ QR Code tidak valid / token tidak ditemukan', 'error');
    return;
  }

  // VALIDASI GPS
  if (!navigator.geolocation) {
    setStatus('❌ Browser tidak mendukung GPS', 'error');
    return;
  }

  lockButtons(true);
  setStatus('📍 Mengambil lokasi...');

  navigator.geolocation.getCurrentPosition(
    pos => {
      setStatus('⏳ Mengirim data absensi...');

      const payload = {
        action: 'absen',
        tipe: tipe,
        token: token,
        nik: nik,
        nama: nama,
        departemen: departemen,
        line: line,
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      };

      fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(res => res.json())
        .then(res => {
          if (res.status === 'ok') {
            setStatus('✅ ' + (res.data || 'Absensi berhasil'), 'ok');
          } else {
            setStatus(
              '❌ ' + (res.message || 'Absensi gagal'),
              'error'
            );
          }
        })
        .catch(err => {
          console.error(err);
          setStatus('❌ Gagal koneksi ke server', 'error');
        })
        .finally(() => {
          lockButtons(false);
        });
    },
    () => {
      lockButtons(false);
      setStatus('❌ GPS ditolak / tidak aktif', 'error');
    },
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    }
  );
}
