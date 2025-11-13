const btn = document.getElementById('start-ar');
btn.addEventListener('click', () => {
  if (!navigator.xr) {
    alert("❌ Browserul nu suportă WebXR!");
    return;
  }

  navigator.xr.isSessionSupported('immersive-ar').then(supported => {
    if (!supported) {
      alert("❌ Dispozitivul nu suportă AR WebXR!");
      return;
    }

    // Tot codul tău de start AR trebuie pus aici
    navigator.xr.requestSession('immersive-ar', { requiredFeatures: ['hit-test'] })
      .then(session => {
        alert("✅ AR session pornit!");
        console.log(session);
        // Aici pui renderer.xr.setSession(session) etc
      })
      .catch(err => {
        console.error("❌ Nu s-a putut porni AR:", err);
        alert("Nu s-a putut porni AR. Vezi consola.");
      });
  });
});
