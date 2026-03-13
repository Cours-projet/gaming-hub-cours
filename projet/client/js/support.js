/**
 * Support PlayHub
 * @author Tomy - Lead Developer
 * @team Tom (Dev), Lancelot (Manager)
 * @school Lycée Albert Einstein
 */

// Discord Webhook URL
const DISCORD_WEBHOOK = 'https://discord.com/api/webhooks/1442441853621244016/0pI64VXdG_EFGqyc8XzwwJVDPxj0UudZrI7X8GsXa0yieedBNp8jSxMd47ACdvFxFf48';

// Support Form
document.getElementById('support-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('support-email').value;
    const subject = document.getElementById('support-subject').value;
    const message = document.getElementById('support-message').value;
    const statusDiv = document.getElementById('support-status');
    
    // Afficher un message de chargement
    statusDiv.innerHTML = '<div style="color: #8b5cf6;">📤 Envoi en cours...</div>';
    
    try {
        // Créer l'embed Discord
        const embed = {
            title: '📧 Nouveau Message de Support',
            color: 0x8b5cf6, // Violet
            fields: [
                {
                    name: '👤 Email',
                    value: email,
                    inline: false
                },
                {
                    name: '📋 Sujet',
                    value: subject,
                    inline: false
                },
                {
                    name: '💬 Message',
                    value: message,
                    inline: false
                }
            ],
            footer: {
                text: 'PlayHub Support - Lycée Albert Einstein'
            },
            timestamp: new Date().toISOString()
        };

        // Envoyer au webhook Discord
        const response = await fetch(DISCORD_WEBHOOK, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: 'PlayHub Support',
                avatar_url: 'https://cdn.discordapp.com/embed/avatars/0.png',
                embeds: [embed]
            })
        });

        if (response.ok) {
            statusDiv.innerHTML = '<div style="color: #0f0; font-weight: 600;">✅ Message envoyé avec succès! Nous vous répondrons bientôt.</div>';
            document.getElementById('support-form').reset();
            
            setTimeout(() => {
                statusDiv.innerHTML = '';
            }, 5000);
        } else {
            throw new Error('Erreur lors de l\'envoi');
        }
    } catch (error) {
        console.error('Erreur:', error);
        statusDiv.innerHTML = '<div style="color: #f00; font-weight: 600;">❌ Erreur lors de l\'envoi. Veuillez réessayer ou nous contacter sur Discord.</div>';
    }
});
