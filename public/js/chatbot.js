function initChatbot() {
  const container = document.getElementById('chatbot-container');

  container.innerHTML = `
    <button id="chatbot-fab" class="chatbot-fab">💬</button>

    <div id="chatbot-box" class="chatbot-box chatbot-hidden">
      <div class="bg-black text-white px-4 py-3">
        <h4 class="font-bold">Ayuda rápida</h4>
        <p class="text-sm text-gray-300">¿Necesitas apoyo para comprar?</p>
      </div>

      <div class="p-4 space-y-3 text-sm">
        <button class="chatbot-option w-full text-left border border-gray-200 rounded-xl p-3 hover:bg-gray-50" data-message="Hola, quiero más información sobre sus productos.">
          Quiero más información
        </button>

        <button class="chatbot-option w-full text-left border border-gray-200 rounded-xl p-3 hover:bg-gray-50" data-message="Hola, ¿qué productos me recomiendan?">
          ¿Qué me recomiendan?
        </button>

        <button class="chatbot-option w-full text-left border border-gray-200 rounded-xl p-3 hover:bg-gray-50" data-message="Hola, necesito ayuda con mi pedido.">
          Ayuda con mi pedido
        </button>
      </div>
    </div>
  `;

  const fab = document.getElementById('chatbot-fab');
  const box = document.getElementById('chatbot-box');

  fab.addEventListener('click', () => {
    box.classList.toggle('chatbot-hidden');
  });

  document.querySelectorAll('.chatbot-option').forEach(button => {
    button.addEventListener('click', () => {
      if (!window.storeData?.whatsapp) {
        alert('No se encontró el WhatsApp de la tienda.');
        return;
      }

      const phone = String(window.storeData.whatsapp).replace(/\D/g, '');
      const text = encodeURIComponent(button.dataset.message);
      window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
    });
  });
}
