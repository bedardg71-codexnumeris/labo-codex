/* ===============================
   MODULE: PLANIFICATION — MÉMOS DU CANEVAS (28 nov. 2026)

   Demande de Grégoire : le canevas de la carte d'alignement n'offrait que des
   blocs qui s'assemblent et se relient ; aucun espace pour noter une idée ou
   coller son devis pendant qu'on construit. Les mémos ACCOMPAGNENT la carte
   SANS EN FAIRE PARTIE.

   ▣ LE MÉMO N'EST PAS UN BLOC. C'est une TROISIÈME collection de la carte, à
   côté de `noeuds` et de `liens` : `etat.memos` dans le canevas, `memos` dans
   le contenu enregistré. Presque toutes les règles du canevas se décident sur
   le type du bloc, et les blocs sont lus hors du canevas (export du plan,
   parcours, bibliothèque) : un type « mémo » aurait dû être exclu à la main
   partout. Une collection à part n'est vue par aucun de ces lecteurs — ils
   lisent tous `.noeuds`.

   ▣ CE QUI VOYAGE. Les mémos suivent la carte partout où l'enseignant garde
   SA carte (enregistrement, annulation, duplication, reprise d'un trimestre,
   sa bibliothèque, la sauvegarde du codex). Ils ne sortent dans aucun fichier
   fait pour être lu ou partagé : `sansMemos()` est le point de passage de ces
   sorties, et de l'entrée d'un fichier reçu.

   ▣ UNE CARTE SANS MÉMO NE PORTE PAS LA CLÉ `memos`. `poserMemos()` ne l'écrit
   que s'il y en a : une carte d'avant ce lot se rouvre et se réenregistre à
   l'identique, sans migration.

   ▣ TEXTE BRUT PAR CONSTRUCTION. Le texte vit dans un `<textarea>` : coller y
   dépose le `text/plain` du presse-papiers, retours à la ligne conservés,
   jamais de balisage. Le texte est posé par `.value` — aucun `innerHTML` ne
   reçoit ce que l'enseignant écrit ou colle.

   Export: window.planificationMemos
   =============================== */

(function() {
'use strict';

// === CONSTANTES ===
var PREFIXE_ID = 'planif-memo_';
var L_DEFAUT = 240, H_DEFAUT = 180;
var L_MIN = 160, H_MIN = 110;
var L_MAX = 900, H_MAX = 1200;
// Un devis ministériel entier tient dans quelques milliers de caractères ;
// la borne protège l'enregistrement et les 50 instantanés de l'annulation.
var TEXTE_MAX = 50000;
var SEUIL_GESTE = 4;            // px écran : en deçà, un toucher, pas un déplacement
var DELAI_ENREGISTREMENT = 500; // ms sans frappe avant d'écrire
var PREF_VISIBLES = 'planifMemosVisibles';

// === MOTS LUS PAR L'ENSEIGNANT ===
// Mots de TRAVAIL : ils remontent à Grégoire, d'un bloc, par
// `plans de travail/TEXTES-2026-11-28-memos-canevas.md`.
var TEXTES = {
    vide: 'Écris ou colle ici…',
    etiquetteTexte: 'Texte du mémo',
    barre: 'Glisser pour déplacer le mémo',
    supprimer: 'Supprimer ce mémo',
    poignee: 'Glisser pour agrandir ou réduire le mémo',
    supprime: 'Mémo supprimé — le bouton Annuler le ramène.',
    tronque: 'Ce texte dépasse ce qu\'un mémo peut garder : la fin a été coupée.',
    masquer: 'Masquer les mémos',
    afficher: 'Afficher les mémos'
};

// === FONCTIONS PURES ===

function nombre(v, defaut) {
    var n = Number(v);
    return isFinite(n) ? n : defaut;
}

function borner(v, min, max) {
    return Math.min(max, Math.max(min, v));
}

function numeroDe(id) {
    var m = /^planif-memo_(\d+)$/.exec(String(id || ''));
    return m ? parseInt(m[1], 10) : 0;
}

/**
 * Une liste de mémos PROPRE, quoi qu'on lui donne. Jamais d'exception : une
 * carte dont les mémos seraient abîmés doit s'ouvrir quand même.
 * Les entrées sans forme d'objet tombent ; un id absent, mal formé ou déjà
 * pris est remplacé ; le texte est ramené à une chaîne bornée.
 * Rend toujours des objets NEUFS (aucune référence partagée avec l'entrée).
 * @returns {Array<{id:string, texte:string, x:number, y:number, l:number, h:number}>}
 */
function normaliser(liste) {
    if (!Array.isArray(liste)) return [];
    var pris = {};
    var plusHaut = 0;
    liste.forEach(function(m) { if (m && typeof m === 'object') plusHaut = Math.max(plusHaut, numeroDe(m.id)); });
    var propres = [];
    liste.forEach(function(m) {
        if (!m || typeof m !== 'object' || Array.isArray(m)) return;
        var id = (numeroDe(m.id) > 0 && !pris[m.id]) ? String(m.id) : PREFIXE_ID + (++plusHaut);
        pris[id] = true;
        propres.push({
            id: id,
            texte: (typeof m.texte === 'string' ? m.texte : '').slice(0, TEXTE_MAX),
            x: nombre(m.x, 0),
            y: nombre(m.y, 0),
            l: borner(nombre(m.l, L_DEFAUT), L_MIN, L_MAX),
            h: borner(nombre(m.h, H_DEFAUT), H_MIN, H_MAX)
        });
    });
    return propres;
}

/** Copie profonde de la collection vivante (Map ou liste), pour un instantané ou un enregistrement. */
function cloner(memos) {
    var liste = memos instanceof Map ? Array.from(memos.values()) : (memos || []);
    return normaliser(liste);
}

/**
 * Pose les mémos sur un contenu de carte — SEULEMENT s'il y en a. Une carte
 * sans mémo ne porte pas la clé : elle s'enregistre comme avant ce lot.
 * Mute et rend `contenu`.
 */
function poserMemos(contenu, memos) {
    var liste = cloner(memos);
    if (liste.length) contenu.memos = liste;
    else delete contenu.memos;
    return contenu;
}

/**
 * Le contenu d'une carte SANS ses mémos — pour tout ce qui sort vers un
 * collègue, et tout ce qui entre d'un fichier. Ne mute pas l'entrée.
 */
function sansMemos(contenu) {
    if (!contenu || typeof contenu !== 'object' || !('memos' in contenu)) return contenu;
    var copie = {};
    Object.keys(contenu).forEach(function(k) { if (k !== 'memos') copie[k] = contenu[k]; });
    return copie;
}

/** Charge une liste enregistrée dans la collection vivante (vidée d'abord). */
function chargerDans(map, liste) {
    map.clear();
    normaliser(liste).forEach(function(m) { map.set(m.id, m); });
    return map;
}

function prochainId(map) {
    var plusHaut = 0;
    map.forEach(function(m) { plusHaut = Math.max(plusHaut, numeroDe(m.id)); });
    return PREFIXE_ID + (plusHaut + 1);
}

// === CANEVAS ===
// Le canevas (planification-carte.js) possède l'état, l'annulation et
// l'enregistrement ; il les prête ici par `brancher()`.
var canevas = null;      // { memos, couche, zoom(), avantModification(), enregistrer(), placeNeuve(l, h), surCorbeille(e), annoncer(msg) }
var minuterie = null;
var saisieOuverte = null; // id du mémo dont la saisie en cours a déjà son instantané

function brancher(prises) {
    canevas = prises;
    appliquerVisibilite();
    rendre();
}

function memosVisibles() {
    try {
        if (typeof obtenirPreference !== 'function') return true;
        return obtenirPreference(PREF_VISIBLES) !== false;
    } catch (e) {
        return true;
    }
}

/** L'interrupteur : une préférence d'affichage, pas une donnée de la carte. */
function definirVisibilite(visibles) {
    try {
        if (typeof definirPreference === 'function') definirPreference(PREF_VISIBLES, !!visibles);
    } catch (e) {
        console.warn('[Planification] Affichage des mémos non enregistré :', e);
    }
    appliquerVisibilite(!!visibles);
}

function basculerVisibilite() {
    viderEnregistrement();
    definirVisibilite(!memosVisibles());
}

function appliquerVisibilite(force) {
    var visibles = typeof force === 'boolean' ? force : memosVisibles();
    if (canevas && canevas.couche) canevas.couche.classList.toggle('planif-memos-masques', !visibles);
    var btn = document.getElementById('planif-btn-memos');
    if (!btn) return;
    // Même partage que les palettes : `aria-pressed` dit l'état, le title dit l'effet.
    btn.setAttribute('aria-pressed', visibles ? 'true' : 'false');
    btn.classList.toggle('actif', visibles);
    btn.title = visibles ? TEXTES.masquer : TEXTES.afficher;
    btn.setAttribute('aria-label', btn.title);
}

function elementDe(id) {
    return canevas && canevas.couche ? canevas.couche.querySelector('[data-memo-id="' + id + '"]') : null;
}

/** Reconstruit tous les mémos depuis la collection (chargement, annulation, rétablissement). */
function rendre() {
    if (!canevas || !canevas.couche) return;
    viderEnregistrement(true);
    saisieOuverte = null;
    canevas.couche.textContent = '';
    canevas.memos.forEach(function(m) { canevas.couche.appendChild(construire(m)); });
}

function construire(m) {
    var el = document.createElement('div');
    el.className = 'planif-memo';
    el.dataset.memoId = m.id;
    placer(el, m);

    var barre = document.createElement('div');
    barre.className = 'planif-memo-barre';
    barre.title = TEXTES.barre;
    var grip = document.createElement('span');
    grip.className = 'planif-memo-grip';
    grip.setAttribute('aria-hidden', 'true');
    grip.textContent = '⠿';
    barre.appendChild(grip);

    var fermer = document.createElement('button');
    fermer.type = 'button';
    fermer.className = 'planif-memo-supprimer';
    fermer.title = TEXTES.supprimer;
    fermer.setAttribute('aria-label', TEXTES.supprimer);
    fermer.textContent = '×';
    barre.appendChild(fermer);

    var champ = document.createElement('textarea');
    champ.className = 'planif-memo-texte';
    champ.placeholder = TEXTES.vide;
    champ.setAttribute('aria-label', TEXTES.etiquetteTexte);
    champ.spellcheck = true;
    champ.value = m.texte;          // jamais d'innerHTML : le texte reste du texte

    var poignee = document.createElement('div');
    poignee.className = 'planif-memo-poignee';
    poignee.title = TEXTES.poignee;
    poignee.setAttribute('aria-hidden', 'true');

    el.appendChild(barre);
    el.appendChild(champ);
    el.appendChild(poignee);

    brancherSaisie(champ, m.id);
    brancherGlisser(barre, el, m.id, 'deplacer');
    brancherGlisser(poignee, el, m.id, 'agrandir');
    // Le × ne démarre pas un déplacement ; il supprime au clic (souris, doigt, clavier).
    fermer.addEventListener('pointerdown', function(e) { e.stopPropagation(); });
    fermer.addEventListener('click', function() { supprimer(m.id); });
    return el;
}

function placer(el, m) {
    el.style.left = m.x + 'px';
    el.style.top = m.y + 'px';
    el.style.width = m.l + 'px';
    el.style.height = m.h + 'px';
}

// --- Écrire et coller ---
function brancherSaisie(champ, id) {
    champ.addEventListener('input', function() {
        var m = canevas.memos.get(id);
        if (!m) return;
        // UN instantané par séance de saisie, pris AVANT que la collection ne
        // reçoive le nouveau texte : Annuler ramène le texte d'avant la séance.
        // (⌘Z DANS le champ reste l'annulation native du champ, lettre à lettre.)
        if (saisieOuverte !== id) {
            canevas.avantModification();
            saisieOuverte = id;
        }
        if (champ.value.length > TEXTE_MAX) {
            champ.value = champ.value.slice(0, TEXTE_MAX);
            canevas.annoncer(TEXTES.tronque);
        }
        m.texte = champ.value;
        planifierEnregistrement();
    });
    champ.addEventListener('blur', function() {
        if (saisieOuverte === id) saisieOuverte = null;
        viderEnregistrement();
    });
}

function planifierEnregistrement() {
    if (minuterie) clearTimeout(minuterie);
    minuterie = setTimeout(function() { minuterie = null; canevas.enregistrer(); }, DELAI_ENREGISTREMENT);
}

/** Écrit tout de suite ce qui attendait (ou l'abandonne : `sansEcrire`, quand l'état vient d'être remplacé). */
function viderEnregistrement(sansEcrire) {
    if (!minuterie) return;
    clearTimeout(minuterie);
    minuterie = null;
    if (!sansEcrire && canevas) canevas.enregistrer();
}

// --- Déplacer, agrandir ---
// Pointer Events : souris, doigt et crayon. La barre et la poignée portent
// `touch-action: none` (styles.css) : le geste qui y commence leur appartient ;
// partout ailleurs, le doigt reste au défilement natif (du texte, puis du canevas).
function brancherGlisser(prise, el, id, mode) {
    prise.addEventListener('pointerdown', function(e) {
        if (!e.isPrimary || e.button > 0) return;
        var m = canevas.memos.get(id);
        if (!m) return;
        e.preventDefault();        // pas de sélection de texte ni de focus volé pendant le geste
        e.stopPropagation();       // ni lasso, ni désélection : le canevas n'a pas à réagir
        viderEnregistrement();

        var depart = { cx: e.clientX, cy: e.clientY, x: m.x, y: m.y, l: m.l, h: m.h };
        var bouge = false;

        function appliquer(ev) {
            var z = canevas.zoom() || 1;
            var dx = (ev.clientX - depart.cx) / z, dy = (ev.clientY - depart.cy) / z;
            if (mode === 'deplacer') {
                m.x = Math.round(depart.x + dx);
                m.y = Math.round(depart.y + dy);
            } else {
                m.l = borner(Math.round(depart.l + dx), L_MIN, L_MAX);
                m.h = borner(Math.round(depart.h + dy), H_MIN, H_MAX);
            }
            placer(el, m);
        }

        function surMouvement(ev) {
            if (ev.pointerId !== e.pointerId) return;
            if (!bouge) {
                if (Math.abs(ev.clientX - depart.cx) + Math.abs(ev.clientY - depart.cy) < SEUIL_GESTE) return;
                bouge = true;
                canevas.avantModification();   // l'instantané porte la position d'AVANT le geste
                // `planif-dragging` arme la corbeille du canevas (même classe que les blocs) ;
                // un agrandissement ne l'arme pas.
                el.classList.add(mode === 'deplacer' ? 'planif-dragging' : 'planif-memo-agrandi');
            }
            appliquer(ev);
        }

        function fin(ev) {
            if (ev.pointerId !== e.pointerId) return;
            document.removeEventListener('pointermove', surMouvement);
            document.removeEventListener('pointerup', fin);
            document.removeEventListener('pointercancel', fin);
            el.classList.remove('planif-dragging', 'planif-memo-agrandi');
            if (!bouge) return;
            if (ev.type === 'pointercancel') {
                // Geste repris par le système (l'iPad, un appel) : rien n'a été voulu.
                m.x = depart.x; m.y = depart.y; m.l = depart.l; m.h = depart.h;
                placer(el, m);
                canevas.enregistrer();
                return;
            }
            appliquer(ev);
            if (mode === 'deplacer' && canevas.surCorbeille(ev)) {
                // L'instantané du déplacement est déjà pris : Annuler ramène le mémo à sa place d'avant.
                retirer(id);
                return;
            }
            canevas.enregistrer();
        }

        document.addEventListener('pointermove', surMouvement);
        document.addEventListener('pointerup', fin);
        document.addEventListener('pointercancel', fin);
    });
}

// --- Créer, retirer ---
function creer() {
    if (!canevas) return null;
    viderEnregistrement();
    canevas.avantModification();
    var place = canevas.placeNeuve(L_DEFAUT, H_DEFAUT);
    var m = { id: prochainId(canevas.memos), texte: '', x: Math.round(place.x), y: Math.round(place.y), l: L_DEFAUT, h: H_DEFAUT };
    canevas.memos.set(m.id, m);
    // Un mémo neuf posé dans une couche masquée serait invisible : créer les montre.
    if (!memosVisibles()) definirVisibilite(true);
    if (canevas.couche) {
        var el = construire(m);
        canevas.couche.appendChild(el);
        var champ = el.querySelector('.planif-memo-texte');
        // Le focus TOUT DE SUITE, dans le geste : différé, une frappe immédiate retombait sur le bouton
        // « Mémo » (Espace ou Entrée y posent un autre mémo), et Safari n'ouvre le clavier de l'iPad que
        // pour un focus pris pendant le toucher. `preventScroll` : la place est déjà dans la vue.
        try { champ.focus({ preventScroll: true }); } catch (e) { champ.focus(); }
    }
    canevas.enregistrer();
    return m.id;
}

function retirer(id) {
    var el = elementDe(id);
    if (el) el.remove();
    canevas.memos.delete(id);
    if (saisieOuverte === id) saisieOuverte = null;
    canevas.enregistrer();
    canevas.annoncer(TEXTES.supprime);
}

function supprimer(id) {
    if (!canevas || !canevas.memos.has(id)) return;
    viderEnregistrement();
    canevas.avantModification();
    retirer(id);
}

// Quitter la page moins d'une demi-seconde après une frappe ne doit rien perdre.
if (typeof window !== 'undefined' && window.addEventListener) {
    window.addEventListener('pagehide', function() { viderEnregistrement(); });
    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'hidden') viderEnregistrement();
    });
}

// === EXPORT ===
window.planificationMemos = {
    // pures
    normaliser: normaliser,
    cloner: cloner,
    poserMemos: poserMemos,
    sansMemos: sansMemos,
    chargerDans: chargerDans,
    prochainId: prochainId,
    LIMITES: { L_DEFAUT: L_DEFAUT, H_DEFAUT: H_DEFAUT, L_MIN: L_MIN, H_MIN: H_MIN, L_MAX: L_MAX, H_MAX: H_MAX, TEXTE_MAX: TEXTE_MAX },
    TEXTES: TEXTES,
    // canevas
    brancher: brancher,
    rendre: rendre,
    creer: creer,
    supprimer: supprimer,
    basculerVisibilite: basculerVisibilite,
    memosVisibles: memosVisibles,
    viderEnregistrement: viderEnregistrement
};

})();
