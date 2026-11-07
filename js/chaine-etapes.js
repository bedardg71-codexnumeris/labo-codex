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

   DEUX ÉTATS DE PLUS, POUR LE CRITÈRE ALGORITHMIQUE (#1150, lot 4, 24 oct.)
     `ouverte` : l'étape dont la section est ouverte (`.bc-ouvert`). `crayons` (option) : chaque étape
     porte un crayon, montré par `marquer(conteneur, ids)` sur celles où le bloc survolé peut se poser
     (`.bc-montre`). Les chaînes qui n'en usent pas ne changent pas : sans `ouverte` ni `crayons`, le
     dessin est celui des lots 3a-3b.

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
            liaison.className = 'bc-liaison';   // le chevron de la frise compacte (lot 3, 7 nov. 2026)
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
        if (options.crayons) {
            const crayon = document.createElement('span');
            crayon.className = 'bc-crayon';
            crayon.setAttribute('aria-hidden', 'true');
            crayon.textContent = '✎';
            bouton.appendChild(crayon);
        }
        conteneur.appendChild(bouton);
    });
}

/**
 * Frise compacte (lot 3, 7 nov. 2026) : « nom, nombre ». Quand l'info redit le nom de l'étape avec son
 * nombre (« Leçons », « 2 leçons » ; « Étudiant·es », « 10 étud. »), seul le nombre paraît à l'écran ; le
 * mot reste dans l'info pour les lecteurs d'écran (« 2 leçons »), dans une partie visuellement masquée.
 * Toute autre info (une date, une phrase, « 1 GC ») paraît telle quelle. Texte posé par textContent.
 */
function poserInfo(element, etape) {
    const info = etape.info == null ? '' : String(etape.info).trim();
    element.textContent = '';
    const m = /^(\d+)\s+(.+)$/.exec(info);
    // Le mot de l'info, abrégé ou non (« étud. », « hor. »), commence comme le nom de l'étape.
    const sans = (t) => String(t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[.·]/g, '');
    const redit = !!m && sans(m[2]).length >= 3
        && (sans(etape.libelle).startsWith(sans(m[2])) || sans(m[2]).startsWith(sans(etape.libelle).slice(0, 5)));
    if (!redit) { element.textContent = info; return; }
    element.appendChild(document.createTextNode(m[1]));
    const mot = document.createElement('span');
    mot.className = 'u-lecteur-ecran';
    mot.textContent = ' ' + m[2];
    element.appendChild(mot);
}

function poserEtats(conteneur, etapes) {
    const boutons = conteneur.querySelectorAll('.bc-etape');
    etapes.forEach(function (etape, i) {
        const bouton = boutons[i];
        if (!bouton) return;
        const reglee = !!etape.reglee;
        bouton.classList.toggle('bc-complet', reglee);
        bouton.classList.toggle('bc-attention', !reglee && etape.ton === 'attention');
        bouton.classList.toggle('bc-critique', !reglee && etape.ton === 'critique');
        bouton.classList.toggle('bc-ouvert', !!etape.ouverte);
        bouton.querySelector('.bc-label').textContent = etape.libelle == null ? '' : String(etape.libelle);
        poserInfo(bouton.querySelector('.bc-info'), etape);
        // Frise compacte (lot 3, 7 nov. 2026) : la coche si l'étape est réglée, l'alerte sinon.
        bouton.querySelector('.bc-check').textContent = reglee ? '✓' : '!';
        // `:scope >` : l'état, pas le mot masqué de l'info (frise compacte, lot 3).
        bouton.querySelector(':scope > .u-lecteur-ecran').textContent = (reglee ? ', réglée' : ', à régler') + (etape.ouverte ? ', ouverte' : '');
    });
}

/**
 * Dessine (ou met à jour) la chaîne dans son conteneur.
 * @param {HTMLElement} conteneur
 * @param {Array<{id:string, libelle:string, info?:string, reglee?:boolean, ton?:string, arrivee?:boolean, motNature?:string, ouverte?:boolean}>} etapes
 * @param {{libelle?:string, surClic?:function(string, HTMLElement), prefixeIdInfo?:string, crayons?:boolean}} [options]
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

/** Le crayon sur les étapes `ids` (celles où le bloc survolé peut se poser), retiré des autres. */
function marquer(conteneur, ids) {
    if (!conteneur) return;
    const vises = (ids || []).map(String);
    conteneur.querySelectorAll('.bc-etape').forEach(function (b) {
        b.classList.toggle('bc-montre', vises.indexOf(b.dataset.etape) !== -1);
    });
}

/** L'option « Afficher les chaînes d'étapes » : toutes les chaînes, celle du Trimestre comprise. */
function afficherToutes(afficher) {
    if (!document.body) return;
    document.body.classList.toggle(CLASSE_MASQUEE, afficher === false);
}

window.ChaineEtapes = { dessiner: dessiner, marquer: marquer, afficherToutes: afficherToutes, CLASSE_MASQUEE: CLASSE_MASQUEE };

})();
