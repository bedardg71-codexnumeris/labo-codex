/* ===============================
   MODULE CHAINE-ETAPES — La chaîne des étapes qui rendent un outil prêt à servir
   Date : 24 octobre 2026 (#1149, lot 3a ; consigne `plans de travail/CONSIGNE-LOT-2026-10-24-chaines-etapes-3a.md`,
   plan `PLAN-2026-10-24-bibliotheques-chaines-critere-algo.md`, lot 3)

   Vocation
     Le dessin de la barre du Trimestre (`.barre-convergence`, `.bc-*` de styles.css), pour tout outil :
     des nœuds reliés, cochés quand leur étape est réglée, jusqu'au point d'arrivée (le nœud plus grand).
     La barre du Trimestre passe par lui ; la chaîne des grilles aussi. Un seul composant.

   CE QUE L'ÉCRAN LUI DONNE
     Un conteneur, la liste des étapes et l'action du clic :
       { id, libelle, info, reglee, ton, arrivee, motNature }
     `ton` : 'attention' (l'info en orange) ou 'critique' (en rouge) ; le nœud reste non réglé.
     `motNature` : la clé de js/mots-nature.js que `appliquerMotsNatureCadre` relit (le Trimestre).
     Les étapes ne sont reconstruites que si leurs identifiants changent : une mise à jour (à chaque
     saisie, pour les grilles) ne rejoue pas l'animation d'entrée.

   L'OPTION « Afficher les chaînes d'étapes » (Préférences › Expérience visuelle)
     Une classe sur <body> masque toutes les `.barre-convergence` : `afficherToutes(false)`.

   Sécurité : libellés et infos passent par `textContent` (règle 1) ; un écouteur par conteneur,
   aucun gestionnaire en ligne (règle 2).
   =============================== */

(function () {
'use strict';

const CLASSE_MASQUEE = 'chaines-etapes-masquees';

/** L'action du clic, par conteneur : le dernier dessin la remplace. */
const actions = new WeakMap();

function surClicConteneur(e) {
    const bouton = e.target && e.target.closest ? e.target.closest('.bc-etape') : null;
    if (!bouton || !this.contains(bouton)) return;
    const action = actions.get(this);
    if (action) action(bouton.dataset.etape, bouton);
}

function construire(conteneur, etapes, options) {
    conteneur.textContent = '';
    etapes.forEach(function (etape, i) {
        if (i > 0) {
            const liaison = document.createElement('span');
            liaison.className = 'bc-liaison' + (etape.arrivee ? ' bc-liaison-finale' : '');
            liaison.setAttribute('aria-hidden', 'true');
            conteneur.appendChild(liaison);
        }
        const bouton = document.createElement('button');
        bouton.type = 'button';
        bouton.className = 'bc-etape' + (etape.arrivee ? ' bc-destination' : '');
        bouton.dataset.etape = String(etape.id);

        const noeud = document.createElement('span');
        noeud.className = 'bc-noeud';
        noeud.setAttribute('aria-hidden', 'true');
        const coche = document.createElement('span');
        coche.className = 'bc-check';
        coche.textContent = '✓';
        noeud.appendChild(coche);

        const libelle = document.createElement('span');
        libelle.className = 'bc-label';
        if (etape.motNature) libelle.setAttribute('data-mot-nature', etape.motNature);

        const info = document.createElement('span');
        info.className = 'bc-info';
        if (options.prefixeIdInfo) info.id = options.prefixeIdInfo + etape.id;

        // Ce que le lecteur d'écran entend après le libellé et l'info : « réglée » ou « à régler ».
        const etat = document.createElement('span');
        etat.className = 'u-lecteur-ecran';

        bouton.append(noeud, libelle, info, etat);
        conteneur.appendChild(bouton);
    });
}

function poserEtats(conteneur, etapes) {
    const boutons = conteneur.querySelectorAll('.bc-etape');
    let precedenteReglee = true;
    etapes.forEach(function (etape, i) {
        const bouton = boutons[i];
        if (!bouton) return;
        const reglee = !!etape.reglee;
        bouton.classList.toggle('bc-complet', reglee);
        bouton.classList.toggle('bc-attention', !reglee && etape.ton === 'attention');
        bouton.classList.toggle('bc-critique', !reglee && etape.ton === 'critique');
        bouton.querySelector('.bc-label').textContent = etape.libelle == null ? '' : String(etape.libelle);
        bouton.querySelector('.bc-info').textContent = etape.info == null ? '' : String(etape.info);
        bouton.querySelector('.u-lecteur-ecran').textContent = reglee ? ', réglée' : ', à régler';
        // La liaison qui mène à cette étape : verte quand elle et la précédente sont réglées.
        const liaison = bouton.previousElementSibling;
        if (liaison && liaison.classList.contains('bc-liaison')) {
            liaison.classList.toggle('bc-liaison-ok', precedenteReglee && reglee);
        }
        precedenteReglee = reglee;
    });
}

/**
 * Dessine (ou met à jour) la chaîne dans son conteneur.
 * @param {HTMLElement} conteneur
 * @param {Array<{id:string, libelle:string, info?:string, reglee?:boolean, ton?:string, arrivee?:boolean, motNature?:string}>} etapes
 * @param {{libelle?:string, surClic?:function(string, HTMLElement), prefixeIdInfo?:string}} [options]
 */
function dessiner(conteneur, etapes, options) {
    if (!conteneur) return;
    const opts = options || {};
    const liste = Array.isArray(etapes) ? etapes : [];
    conteneur.classList.add('barre-convergence');
    if (opts.libelle) conteneur.setAttribute('aria-label', opts.libelle);
    actions.set(conteneur, typeof opts.surClic === 'function' ? opts.surClic : null);
    if (!conteneur.dataset.chaineEcoute) {
        conteneur.addEventListener('click', surClicConteneur);
        conteneur.dataset.chaineEcoute = '1';
    }
    const ids = liste.map(function (e) { return String(e.id) + (e.arrivee ? '*' : ''); }).join('|');
    if (conteneur.dataset.chaineIds !== ids) {
        construire(conteneur, liste, opts);
        conteneur.dataset.chaineIds = ids;
    }
    poserEtats(conteneur, liste);
}

/** L'option « Afficher les chaînes d'étapes » : toutes les chaînes, celle du Trimestre comprise. */
function afficherToutes(afficher) {
    if (!document.body) return;
    document.body.classList.toggle(CLASSE_MASQUEE, afficher === false);
}

window.ChaineEtapes = { dessiner: dessiner, afficherToutes: afficherToutes, CLASSE_MASQUEE: CLASSE_MASQUEE };

})();
