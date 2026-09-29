// ============================================================================
// temoin-enregistrement.js — le témoin commun « Enregistré » / « Non enregistré »
// ----------------------------------------------------------------------------
// Lot B de l'enregistrement (D0, point 2 — Grégoire, 26 sept. 2026) : « Un seul
// témoin, le même partout, dit « Enregistré » après chaque écriture. Si
// l'écriture échoue, il dit « Non enregistré », avec la raison. »
//
// Qui le fait parler : `sauvegarderDonneesSelonMode`, `modifierEtAnnoncer` et
// `ecrireEtAnnoncer` (`modes.js`). Un écrivain n'appelle pas `enregistre` lui-même :
// il passe par ces fonctions, qui disent le succès comme l'échec.
//
// Lot F (D4) : `enregistre` émet aussi l'événement `donnees-enregistrees` ({ cle }),
// écouté par le codex pour savoir que le fichier n'a plus les derniers changements.
// `window.signalerEcritureUsager(cle)` émet le même événement, sans rien afficher, pour
// les gestes qui écrivent hors du témoin commun.
//
// API : window.temoinEnregistrement.{ enregistre, nonEnregistre, fermer }
//   enregistre(cle)                   → « Enregistré », discret, s'efface seul ;
//                                       retire le « Non enregistré » affiché
//                                       SEULEMENT s'il porte la même clé.
//   nonEnregistre(raison, geste, cle) → « Non enregistré : ‹raison› », ou
//                                       « Non enregistré – ‹geste› : ‹raison› ».
//                                       RESTE affiché jusqu'à une écriture réussie
//                                       de LA MÊME clé, ou jusqu'à « Fermer ». Un
//                                       échec qu'on n'a pas vu est le mal que ce lot
//                                       répare : aucun délai ne l'efface, ni le
//                                       succès d'une autre clé (relecture de Cowork,
//                                       R1 : une grosse écriture qui échoue, une
//                                       petite qui réussit juste après — l'échec
//                                       partait avant d'avoir été lu).
//   fermer()                          → retire le « Non enregistré » (bouton Fermer).
//
// UN SEUL NŒUD : `#temoin-enregistrement`, posé au premier appel et retrouvé par
// son id ensuite. Deux régions vivantes dedans, parce qu'un même nœud ne peut
// pas être à la fois `status` (poli) et `alert` : changer `role` en cours de
// route n'est pas annoncé de façon fiable par VoiceOver.
//
// Le texte « Enregistré » ne change pas d'un succès à l'autre : la région polie
// ne le réannonce donc pas à chaque auto-enregistrement (toutes les 1,5 s pendant
// qu'on évalue). Seul le visuel réapparaît.
//
// Placement : en bas à gauche, loin du témoin du Codex (menu du haut, D4 / lot F)
// et des toasts (en haut à droite). `pointer-events: none` hors du bouton Fermer :
// le témoin ne capte ni le Pencil ni un clic destiné à ce qu'il survole.
//
// Sécurité : texte par textContent, jamais innerHTML.
// ============================================================================

(function() {
    'use strict';

    const ID = 'temoin-enregistrement';
    const DUREE_ENREGISTRE_MS = 2000;
    let minuterieEnregistre = null;
    let cleEchec = null;   // la clé du « Non enregistré » affiché

    function _noeud() {
        let temoin = document.getElementById(ID);
        if (temoin) return temoin;
        temoin = document.createElement('div');
        temoin.id = ID;
        temoin.className = 'temoin-enregistrement';

        const succes = document.createElement('div');
        succes.className = 'temoin-enregistrement-succes';
        succes.setAttribute('role', 'status');
        succes.setAttribute('aria-live', 'polite');
        succes.setAttribute('aria-atomic', 'true');
        temoin.appendChild(succes);

        const echec = document.createElement('div');
        echec.className = 'temoin-enregistrement-echec';
        echec.setAttribute('role', 'alert');
        echec.setAttribute('aria-atomic', 'true');
        const texte = document.createElement('span');
        texte.className = 'temoin-enregistrement-echec-texte';
        echec.appendChild(texte);
        const fermer = document.createElement('button');
        fermer.type = 'button';
        fermer.className = 'temoin-enregistrement-fermer';
        fermer.setAttribute('aria-label', 'Fermer');
        fermer.textContent = '×';
        fermer.addEventListener('click', fermerEchec);
        echec.appendChild(fermer);
        temoin.appendChild(echec);

        document.body.appendChild(temoin);
        return temoin;
    }

    /**
     * Lot F (D4) : une écriture réussie de l'usager rend le codex « pas à jour ». Le
     * témoin l'annonce par un événement ; `codex.js` l'écoute (un seul point d'accroche,
     * et ce module ne connaît pas le codex). Appelé par `enregistre`, et directement par
     * les gestes qui écrivent HORS du témoin commun (`signalerEcritureUsager`).
     */
    function annoncerEcriture(cle) {
        window.dispatchEvent(new CustomEvent('donnees-enregistrees', { detail: { cle: cle } }));
    }

    function enregistre(cle) {
        annoncerEcriture(cle);
        if (!document.body) return;
        const temoin = _noeud();
        if (cleEchec !== null && cle === cleEchec) fermerEchec();
        const succes = temoin.querySelector('.temoin-enregistrement-succes');
        if (succes.textContent !== 'Enregistré') succes.textContent = 'Enregistré';
        succes.classList.add('visible');
        clearTimeout(minuterieEnregistre);
        minuterieEnregistre = setTimeout(() => succes.classList.remove('visible'), DUREE_ENREGISTRE_MS);
    }

    function nonEnregistre(raison, geste, cle) {
        if (!document.body) return;
        const temoin = _noeud();
        cleEchec = cle === undefined ? '' : cle;
        clearTimeout(minuterieEnregistre);
        temoin.querySelector('.temoin-enregistrement-succes').classList.remove('visible');
        const echec = temoin.querySelector('.temoin-enregistrement-echec');
        echec.querySelector('.temoin-enregistrement-echec-texte').textContent = geste
            ? 'Non enregistré – ' + String(geste) + ' : ' + String(raison)
            : 'Non enregistré : ' + String(raison);
        echec.classList.add('visible');
    }

    function fermerEchec() {
        cleEchec = null;
        const temoin = document.getElementById(ID);
        if (!temoin) return;
        const echec = temoin.querySelector('.temoin-enregistrement-echec');
        echec.classList.remove('visible');
        echec.querySelector('.temoin-enregistrement-echec-texte').textContent = '';
    }

    window.temoinEnregistrement = { enregistre, nonEnregistre, fermer: fermerEchec };

    /**
     * Lot F (relecture de Cowork, 29 sept.) : un geste de l'usager qui écrit en `db` DIRECT,
     * hors de `sauvegarderDonneesSelonMode` / `modifierEtAnnoncer` / `ecrireEtAnnoncer`,
     * le dit ici, après son écriture réussie. Le codex apprend qu'une donnée a changé ;
     * l'écran ne change pas (aucun « Enregistré » affiché : ce serait étendre D0, une
     * décision de Grégoire). Les écritures de la machine (démarrage, migration, recalcul)
     * ne l'appellent pas.
     */
    window.signalerEcritureUsager = function (cle) { annoncerEcriture(cle); };

    /**
     * Lot E1 (D3) — une raison écrite comme une phrase (« Le nom du critère est
     * obligatoire ») devient la fin de « Non enregistré : ‹raison› » : minuscule
     * initiale, point final.
     */
    window.raisonPourTemoin = function (raison) {
        const texte = String(raison || '').trim();
        if (!texte) return texte;
        const debut = texte.charAt(0).toLowerCase() + texte.slice(1);
        return /[.!?]$/.test(debut) ? debut : debut + '.';
    };
})();
