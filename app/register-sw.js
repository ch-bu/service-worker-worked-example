if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').then(function() {
    console.log('Service Worker registered');
  }, function(err) {
    console.log('Service Worker registration failed: ', err);
  })
}
