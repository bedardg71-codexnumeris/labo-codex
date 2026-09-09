/**
 * RECHARGEMENT SÛR — #795 (9 septembre 2026)
 *
 * Rapport testeur du 9 sept. : un codex ouvert sur app.codexnumeris.org, le
 * rechargement accepté, et l'app remplacée par le « Page not found » de
 * Netlify. Les données étaient pourtant écrites (`db.flush()` précède le
 * rechargement depuis le 10 juin) — l'écran, lui, ne disait plus rien de tel.
 *
 * Le rechargement est le seul geste de l'app qui la remet à la merci du
 * réseau, et il tombe juste après une écriture : c'est le pire moment pour
 * disparaître. Cette sonde ne répare pas l'hébergement ; elle empêche l'app de
 * se saborder quand celui-ci ne répond pas, et elle DIT que les données sont
 * en sûreté.
 *
 * La sonde vise `version.json` : même origine (aucun élargissement de la CSP —
 * `init-inline.js` la lit déjà pour le bandeau de mise à jour), quelques
 * centaines d'octets plutôt que le mégaoctet de `index.html`, et servie
 * `no-store`. Si l'hôte ne se résout plus, elle échoue comme la page.
 */
(function() {
    'use strict';

    /**
     * Recharge la page — mais seulement si le serveur la sert encore.
     *
     * @returns {Promise<boolean>} true si le rechargement est lancé, false si
     *   la page a été gardée en place (l'appelant n'a rien d'autre à faire :
     *   l'utilisateur est déjà averti).
     */
    async function rechargerSiLeServeurRepond() {
        // En `file://`, aucune sonde n'est possible et aucun serveur ne peut
        // manquer : le rechargement est sûr par construction.
        if (window.location.protocol === 'file:') {
            window.location.reload();
            return true;
        }

        let motif = null;
        try {
            const reponse = await window.fetch('version.json', { cache: 'no-store' });
            if (!reponse.ok) {
                motif = 'le serveur a répondu « ' + reponse.status + ' »';
            }
        } catch (e) {
            motif = 'le serveur n\'a pas répondu';
        }

        if (motif === null) {
            window.location.reload();
            return true;
        }

        await avertir(motif);
        return false;
    }

    /**
     * Modale plutôt que toast : l'utilisateur vient d'accepter un
     * rechargement, il attend un changement d'écran. Un avertissement qui
     * s'efface après quatre secondes ne dirait pas assez fort que ses données,
     * elles, sont écrites.
     */
    async function avertir(motif) {
        const titre = 'La page n\'a pas été rechargée';
        const message = 'Tes données sont enregistrées — rien n\'est perdu.\n\n' +
            'Mais ' + motif + ' : recharger t\'aurait laissé devant une page vide, ' +
            'sans l\'application. Attends un moment, puis recharge la page toi-même.';
        if (window.uiDialogues && typeof window.uiDialogues.informer === 'function') {
            await window.uiDialogues.informer({ titre: titre, message: message, preformate: true });
        } else {
            window.alert(titre + '\n\n' + message);
        }
    }

    window.rechargerSiLeServeurRepond = rechargerSiLeServeurRepond;
})();
