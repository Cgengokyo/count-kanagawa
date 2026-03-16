(function () {
  const messages = [
    {
      text: 'You can do it!',
      style: [
        'color:#7CFF6B',
        'font-size:42px',
        'font-weight:900',
        'font-family:"Segoe UI","Yu Gothic UI",sans-serif',
        'text-shadow:0 2px 0 #000, 0 0 18px rgba(124,255,107,0.55)',
        'letter-spacing:0.04em'
      ].join(';')
    },
    {
      text: 'Believe in yourself!',
      style: [
        'color:#FF6B6B',
        'font-size:36px',
        'font-weight:900',
        'font-family:"Segoe UI","Yu Gothic UI",sans-serif',
        'text-shadow:0 2px 0 #000, 0 0 18px rgba(255,107,107,0.5)',
        'letter-spacing:0.04em'
      ].join(';')
    }
  ];

  let printed = false;

  function printMessages() {
    if (printed) {
      return;
    }

    printed = true;
    messages.forEach((message) => {
      console.log(`%c${message.text}`, message.style);
    });
  }

  printMessages();
  window.addEventListener('load', printMessages, { once: true });
})();
