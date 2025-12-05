document.getElementById('discordForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const btn = this.querySelector('button');
    const originalText = btn.textContent;
    btn.textContent = "ENVOI...";
    btn.classList.add('disabled');

    const pseudo = document.getElementById('username').value;
    const reason = document.getElementById('reason').value;
    const message = document.getElementById('message').value;

    const webhookURL = "https://discordapp.com/api/webhooks/1442441853621244016/0pI64VXdG_EFGqyc8XzwwJVDPxj0UudZrI7X8GsXa0yieedBNp8jSxMd47ACdvFxFf48";

    const payload = {
        embeds: [{
            title: "📢 Nouveau Ticket Support",
            color: 6516145, 
            fields: [
                { name: "👤 Pseudo", value: pseudo, inline: true },
                { name: "📝 Type", value: reason, inline: true },
                { name: "📄 Message", value: message }
            ],
            footer: { text: "Envoyé depuis le Hub Gaming" },
            timestamp: new Date()
        }]
    };

    fetch(webhookURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    })
    .then(response => {
        if (response.ok) {
            alert("Message envoyé à l'équipe !");
            document.getElementById('discordForm').reset();
        } else {
            alert("Erreur lors de l'envoi.");
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert("Erreur technique.");
    })
    .finally(() => {
        btn.textContent = "ENVOYÉ";
        setTimeout(() => {
            btn.textContent = originalText;
            btn.classList.remove('disabled');
        }, 2000);
    });
});