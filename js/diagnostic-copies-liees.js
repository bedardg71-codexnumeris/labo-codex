/* ===============================
   MODULE DIAGNOSTIC-COPIES-LIEES — #1298 : les copies encore liées à leur source (19 nov. 2026)

   LE STOCK. Jusqu'au lot `lot/dupliquer-copie-profonde`, « Dupliquer » (éditeur et bibliothèque :
   grilles, échelles, cartouches, productions) copiait par étalement : la copie recevait LES MÊMES
   sous-objets que sa source, et IndexedDB, qui enregistre par clonage structuré, a gardé ce partage.
   Le correctif tarit la source ; il ne touche pas le stock (CLAUDE.md, « tarir n'est pas réparer ») :
   une paire liée chez quelqu'un le RESTE, et modifier la copie y modifie encore la source.

   CE QUE FAIT CE MODULE : il LIT la base IndexedDB par une transaction `readonly` (`db._getAllIndexedDB`)
   et liste, collection par collection, les paires d'éléments qui partagent un objet (même référence).
   ⛔ IL N'ÉCRIT RIEN : ni IndexedDB, ni localStorage, ni le cache mémoire de `db`. La réparation (une
   copie profonde de chaque élément lié, contenu inchangé) écrirait dans les données de Grégoire : elle
   lui sera PROPOSÉE, elle n'est pas ici.

   OÙ : Réglages › Données › Maintenance › « Copies liées à leur source » (même endroit sur l'iPad et le
   Mac), avec « Copier le résultat » pour le relayer. Le résultat ne nomme que des ressources (grilles,
   échelles, cartouches, productions, pratiques) ; pour toute autre collection, il ne donne que le nom de
   la clé (chiffres masqués) et un nombre, jamais un élément : aucun nom d'étudiant·e ne peut y paraître.

   Les trimestres fermés (a2025, h2026, décision du 1er sept. 2026) ne sont pas lus, comme dans
   `cartouches-decalees.js`.

   ⚠ OUTIL D'UN STOCK : à retirer quand la réparation aura été faite chez Grégoire (zéro-dette).
   =============================== */

(function () {
'use strict';

var TRIMESTRES_FERMES = ['a2025', 'h2026'];

/** Les collections de ressources, nommées dans le résultat. Le reste n'est que compté. */
var RESSOURCES = [
    { motif: /^bibliothequeGrilles$/, famille: 'Bibliothèque des grilles' },
    { motif: /^bibliothequeEchelles$/, famille: 'Bibliothèque des échelles' },
    { motif: /^bibliothequeCartouches$/, famille: 'Bibliothèque des cartouches' },
    { motif: /^bibliothequeProductions$/, famille: 'Bibliothèque des productions' },
    { motif: /^bibliothequePratiques$/, famille: 'Bibliothèque des pratiques' },
    { motif: /^(?:([ah]\d{4})_)?grillesTemplates$/, famille: 'Grilles' },
    { motif: /^(?:([ah]\d{4})_)?echellesTemplates$/, famille: 'Échelles' },
    { motif: /^(?:([ah]\d{4})_)?cartouches_.+$/, famille: 'Cartouches' },
    { motif: /^(?:([ah]\d{4})_)?productions$/, famille: 'Productions' },
    { motif: /^(?:([ah]\d{4})_)?pratiquesConfigurables$/, famille: 'Pratiques' }
];

/** Le trimestre d'une clé namespacée (`a2026_…`), ou null. */
function trimestreDeCle(nomCle) {
    var m = /^([ah]\d{4})_/.exec(String(nomCle));
    return m ? m[1] : null;
}

/** La famille de ressources d'une clé, ou null si ce n'est pas une collection de ressources. */
function familleDeCle(nomCle) {
    for (var i = 0; i < RESSOURCES.length; i++) {
        if (RESSOURCES[i].motif.test(String(nomCle))) return RESSOURCES[i].famille;
    }
    return null;
}

/**
 * LES PAIRES LIÉES D'UNE COLLECTION. Pure.
 * Un objet atteint depuis deux éléments différents de la liste est un LIEN : le premier élément qui
 * l'atteint en est le propriétaire, le second est lié à lui par ce chemin. Deux objets égaux en
 * contenu ne sont pas un lien : seule l'identité compte (c'est ce que garde IndexedDB).
 * Un objet partagé à l'intérieur d'un MÊME élément n'est pas une paire, il est ignoré.
 *
 * @param {Array} liste
 * @returns {Array<{a: number, b: number, chemins: string[]}>} a < b, indices dans la liste
 */
function analyserListe(liste) {
    if (!Array.isArray(liste)) return [];
    var proprietaire = new Map();   // objet → indice de l'élément qui l'a atteint en premier
    var paires = new Map();         // 'a|b' → { a, b, chemins }
    function noter(a, b, chemin) {
        var clePaire = a + '|' + b;
        if (!paires.has(clePaire)) paires.set(clePaire, { a: a, b: b, chemins: [] });
        var p = paires.get(clePaire);
        if (p.chemins.indexOf(chemin) === -1) p.chemins.push(chemin);
    }
    liste.forEach(function (element, i) {
        var vusIci = new Set();
        (function parcourir(v, chemin) {
            if (!v || typeof v !== 'object' || vusIci.has(v)) return;
            vusIci.add(v);
            if (proprietaire.has(v) && proprietaire.get(v) !== i) {
                // Tout ce qui est sous cet objet est partagé aussi : on ne descend pas.
                noter(proprietaire.get(v), i, chemin || '(l’élément entier)');
                return;
            }
            if (!proprietaire.has(v)) proprietaire.set(v, i);
            Object.keys(v).forEach(function (k) {
                parcourir(v[k], chemin ? chemin + '.' + k : k);
            });
        })(element, '');
    });
    return Array.from(paires.values());
}

/** Le nom lisible d'un élément de ressource : « nom » (id). */
function nommerElement(el) {
    if (!el || typeof el !== 'object') return '(élément sans nom)';
    var nom = el.nom !== undefined && el.nom !== null ? el.nom : el.titre;
    return '« ' + String(nom === undefined || nom === null || nom === '' ? '(sans nom)' : nom) + ' » (' + String(el.id || 'sans id') + ')';
}

/** Les chiffres d'une clé hors ressources, masqués : une clé peut porter un numéro d'étudiant·e. */
function masquerCle(nomCle) {
    return String(nomCle).replace(/\d{5,}/g, '#');
}

/**
 * L'ANALYSE DE LA BASE. Pure : reçoit les enregistrements `{ key, value }` (ceux de `getAll`).
 * @returns {{ lues: number, ignoreesFermees: string[], ressources: Array, autres: Array }}
 */
function analyserEnregistrements(enregistrements) {
    var res = { lues: 0, ignoreesFermees: [], ressources: [], autres: [] };
    (enregistrements || []).forEach(function (rec) {
        if (!rec || typeof rec.key !== 'string' || !Array.isArray(rec.value)) return;
        var trimestre = trimestreDeCle(rec.key);
        if (trimestre && TRIMESTRES_FERMES.indexOf(trimestre) !== -1) {
            if (res.ignoreesFermees.indexOf(trimestre) === -1) res.ignoreesFermees.push(trimestre);
            return;
        }
        res.lues++;
        var paires = analyserListe(rec.value);
        if (paires.length === 0) return;
        var famille = familleDeCle(rec.key);
        if (famille) {
            paires.forEach(function (p) {
                res.ressources.push({
                    cle: rec.key, famille: famille, trimestre: trimestre,
                    source: nommerElement(rec.value[p.a]), copie: nommerElement(rec.value[p.b]),
                    idSource: rec.value[p.a] && rec.value[p.a].id, idCopie: rec.value[p.b] && rec.value[p.b].id,
                    chemins: p.chemins.slice()
                });
            });
        } else {
            res.autres.push({ cle: masquerCle(rec.key), paires: paires.length });
        }
    });
    res.ignoreesFermees.sort();
    return res;
}

/** Le résultat en texte, à copier et relayer. */
function formaterRapport(res, contexte) {
    var c = contexte || {};
    var l = [];
    l.push('Copies liées à leur source — vérification en lecture seule (#1298)');
    if (c.quand) l.push('Le ' + c.quand + (c.appareil ? ', ' + c.appareil : ''));
    if (c.version) l.push('Version : ' + c.version);
    l.push('Collections lues : ' + res.lues
        + (res.ignoreesFermees.length ? ' (trimestres fermés non lus : ' + res.ignoreesFermees.join(', ') + ')' : ''));
    l.push('');
    if (res.ressources.length === 0) {
        l.push('Aucune copie liée parmi les grilles, échelles, cartouches, productions et pratiques.');
    } else {
        l.push(res.ressources.length + (res.ressources.length > 1 ? ' paires liées' : ' paire liée') + ' :');
        res.ressources.forEach(function (r) {
            l.push('· ' + r.famille + ' [' + r.cle + '] : ' + r.source + ' et ' + r.copie
                + ' partagent ' + r.chemins.join(', '));
        });
    }
    l.push('');
    if (res.autres.length === 0) {
        l.push('Autres collections : aucun objet partagé.');
    } else {
        l.push('Autres collections où des éléments partagent un objet (noms non affichés) :');
        res.autres.forEach(function (a) { l.push('· ' + a.cle + ' : ' + a.paires + (a.paires > 1 ? ' paires' : ' paire')); });
    }
    return l.join('\n');
}

/** L'appareil, en mots simples, pour que le résultat relayé dise d'où il vient. */
function decrireAppareil() {
    var ua = (typeof navigator !== 'undefined' && navigator.userAgent) || '';
    var tactile = typeof navigator !== 'undefined' && navigator.maxTouchPoints > 1;
    var appareil = /iPad/.test(ua) || (/Macintosh/.test(ua) && tactile) ? 'iPad' : (/Macintosh/.test(ua) ? 'Mac' : 'autre appareil');
    var navigateur = /CriOS|Chrome\//.test(ua) ? 'Chrome' : (/FxiOS|Firefox\//.test(ua) ? 'Firefox' : (/Safari\//.test(ua) ? 'Safari' : 'navigateur inconnu'));
    return appareil + ', ' + navigateur;
}

/**
 * LA LECTURE. Une transaction `readonly` sur IndexedDB, rien d'autre. `db.flush()` attend les
 * écritures déjà lancées par l'application (il n'en lance aucune) : la base lue est à jour.
 */
async function verifier() {
    if (!window.db || !db.useIndexedDB || !db.db || typeof db._getAllIndexedDB !== 'function') {
        return { erreur: 'IndexedDB n’est pas disponible dans ce navigateur : rien à vérifier.' };
    }
    if (typeof db.flush === 'function') await db.flush();
    var enregistrements = await db._getAllIndexedDB();
    var res = analyserEnregistrements(enregistrements);
    var maintenant = new Date();
    res.texte = formaterRapport(res, {
        quand: window.dateEnLettres(maintenant, { day: 'numeric', month: 'long', year: 'numeric' })
            + ', ' + maintenant.toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' }),
        appareil: decrireAppareil(),
        version: window.VERSION_APP || window.VERSION_MAJEURE || ''
    });
    return res;
}

/** « Vérifier les copies liées » : le résultat dans la zone, et « Copier le résultat » qui paraît. */
async function verifierCopiesLiees() {
    var zone = document.getElementById('resultatCopiesLiees');
    var copier = document.getElementById('btnCopierCopiesLiees');
    if (!zone) return;
    zone.textContent = 'Vérification en cours…';
    zone.classList.remove('u-hide');
    try {
        var res = await verifier();
        zone.textContent = res.erreur || res.texte;
        if (copier && !res.erreur) copier.classList.remove('u-hide');
    } catch (e) {
        console.error('[Copies liées] Lecture impossible :', e);
        zone.textContent = 'La vérification n’a pas pu lire la base : ' + String((e && e.message) || e);
    }
}

/** « Copier le résultat » : le presse-papiers, sinon le texte sélectionné pour une copie à la main. */
async function copierResultatCopiesLiees() {
    var zone = document.getElementById('resultatCopiesLiees');
    if (!zone || !zone.textContent) return;
    try {
        await navigator.clipboard.writeText(zone.textContent);
        if (window.notifications) notifications.succes('Résultat copié.');
    } catch (e) {
        var plage = document.createRange();
        plage.selectNodeContents(zone);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(plage);
        if (window.notifications) notifications.info('Le texte est sélectionné : copie-le avec ⌘ C.');
    }
}

window.DiagnosticCopiesLiees = {
    analyserListe: analyserListe,
    analyserEnregistrements: analyserEnregistrements,
    formaterRapport: formaterRapport,
    familleDeCle: familleDeCle,
    masquerCle: masquerCle,
    verifier: verifier
};
window.verifierCopiesLiees = verifierCopiesLiees;
window.copierResultatCopiesLiees = copierResultatCopiesLiees;

})();
