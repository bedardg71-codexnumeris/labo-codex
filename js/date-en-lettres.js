/* ===============================
   MODULE : LA DATE EN TOUTES LETTRES
   Date : 23 novembre 2026 (publication des parcours, point 3 de la consigne du 22 nov. ;
   décision technique de Cowork, dite à Grégoire)

   Vocation
     La seule façon dont l'application écrit une date en toutes lettres (« 17 septembre 2025 »,
     « mercredi 17 septembre 2025 », « 17 septembre »). Le premier du mois s'y écrit « 1er » :
     « 1er octobre 2025 », comme le veut l'usage français. `toLocaleDateString('fr-CA', …)`
     écrit « 1 octobre » : mesuré le 22 nov. dans neuf modules, et la même chose ailleurs sous
     d'autres formes (tableaux de mois, `getDate()` collé au mois).
     ⚠ Tout appel qui écrit le mois en lettres passe ici ; aucun autre code n'écrit « 1er ».
     Gardé par tests/unit/sentinelle-date-en-lettres-1er-2026-11-23.test.js.

   Dépendances : aucune (Intl, présent partout où l'application tourne).

   API :
     window.dateEnLettres(valeur, options) → la date écrite par `Intl.DateTimeFormat('fr-CA',
       options)`, morceau par morceau, le jour « 1 » devenu « 1er » quand le mois est en lettres
       (`month: 'long'` ou `'short'`). `valeur` : une `Date`, ou ce que `new Date` comprend.
       `options` : celles de `toLocaleDateString` ; par défaut jour, mois en lettres, année.
       '' quand la date est invalide (l'appelant garde son repli).
     window.dateEnLettres.jourEnLettres(jour) → « 1er » pour 1, le nombre sinon : pour les
       quelques appelants qui composent la date eux-mêmes à partir d'une chaîne AAAA-MM-JJ.
   =============================== */

(function () {
    'use strict';

    var OPTIONS_PAR_DEFAUT = { day: 'numeric', month: 'long', year: 'numeric' };

    function jourEnLettres(jour) {
        var n = parseInt(jour, 10);
        return n === 1 ? '1er' : String(isNaN(n) ? jour : n);
    }

    function dateEnLettres(valeur, options) {
        var d = valeur instanceof Date ? valeur : new Date(valeur);
        if (isNaN(d.getTime())) return '';
        var opts = options || OPTIONS_PAR_DEFAUT;
        var moisEnLettres = opts.month === 'long' || opts.month === 'short';
        return new Intl.DateTimeFormat('fr-CA', opts).formatToParts(d).map(function (morceau) {
            return morceau.type === 'day' && moisEnLettres ? jourEnLettres(morceau.value) : morceau.value;
        }).join('');
    }

    dateEnLettres.jourEnLettres = jourEnLettres;
    window.dateEnLettres = dateEnLettres;
})();
