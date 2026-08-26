import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// =======================================================================
// SENTINELLE #540 LOT B — LES SEMAINES SE COMPTENT, ELLES NE SE SUPPOSENT PAS
// =======================================================================
//
// ▣ CE QUI EXISTAIT. `proposerHeuresEnseignementDepuisPonderation` faisait
//   `(pond.theorie + pond.labo) * 15`. Quinze, écrit dans le code.
//
// ▣ POURQUOI C'EST LA MÊME FAMILLE QUE #538. `calculerStatistiquesCalendrier`
//   (`trimestre-v2.js`, #366) compte déjà les semaines réelles, et son en-tête dit
//   pourquoi elle existe : elle « remplace les constantes de repli 15/75 qui
//   affichaient un chiffre inventé ». Le balayage de #366 avait nettoyé la sidebar
//   et la carte Légende ; cette multiplication-là lui avait échappé.
//
// ▣ CE QUE ÇA CHANGE POUR DE VRAI. Un trimestre ne fait pas toujours quinze
//   semaines : session d'été, calendrier écourté, cours intensif. Et quinze semaines
//   au calendrier ne font pas quinze semaines de cours si des congés tombent dedans.
//   La proposition d'heures d'enseignement — celle qui sert à VÉRIFIER LA CONFORMITÉ
//   RREC — était donc fausse hors du cas régulier, silencieusement.
//
// ⮕ CE QUI EST VERROUILLÉ ICI :
//   A. `_semainesDuTrimestreActif` LIT le calendrier, banc vivant ;
//   B. calendrier muet → 0, et 0 est un REFUS DE RÉPONDRE : on ne propose rien ;
//   C. aucun nombre de semaines en dur ne revient dans le code de la proposition ;
//   D. le repère DIT la base du calcul — ou dit pourquoi il n'y en a pas ;
//   E. l'aide contextuelle ne promet plus « les 15 semaines du trimestre régulier ».

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const lire = (...p) => readFileSync(path.join(racine, ...p), 'utf8');

const HTML = lire('index.html');
const SRC_BRUT = lire('js', 'trimestre-v2-cours.js');

/** Voir la sentinelle #540 lot A : un verrou de source lit le CODE, pas les commentaires. */
function sansCommentaires(src) {
    let sortie = '', etat = 'code', delim = null;
    for (let i = 0; i < src.length; i++) {
        const c = src[i], suivant = src[i + 1];
        if (etat === 'code') {
            if (c === '/' && suivant === '/') { etat = 'ligne'; sortie += '  '; i++; continue; }
            if (c === '/' && suivant === '*') { etat = 'bloc'; sortie += '  '; i++; continue; }
            if (c === '"' || c === "'" || c === '`') { etat = 'chaine'; delim = c; }
            sortie += c;
        } else if (etat === 'ligne') {
            if (c === '\n') { etat = 'code'; sortie += c; } else { sortie += ' '; }
        } else if (etat === 'bloc') {
            if (c === '*' && suivant === '/') { etat = 'code'; sortie += '  '; i++; }
            else { sortie += (c === '\n' ? c : ' '); }
        } else {
            if (c === '\\') { sortie += c + (suivant || ''); i++; continue; }
            if (c === delim) { etat = 'code'; delim = null; }
            sortie += c;
        }
    }
    return sortie;
}
const SRC = sansCommentaires(SRC_BRUT);

/**
 * Charge le module avec un calendrier DONNÉ — banc vivant.
 * `calculerStatistiquesCalendrier` est la vraie, extraite de trimestre-v2.js.
 */
function chargerAvecCalendrier(calendrier, dom = null) {
    const vraiTrimestreV2 = chargerScript('js/trimestre-v2.js', {
        db: { getSync: () => null, setSync: () => {} },
        cle: (k) => k
    });
    const globaux = {
        db: { getSync: (k) => (k === 'calendrierComplet' ? calendrier : null), setSync: () => {} },
        cle: (k) => k,
        calculerStatistiquesCalendrier: vraiTrimestreV2.calculerStatistiquesCalendrier,
        notifications: { erreur: () => {}, succes: () => {} }
    };
    // ⚠ `document` doit être injecté AU CHARGEMENT. `chargerScript` le passe en
    // paramètre de la Function : le réassigner sur le window rendu après coup ne
    // touche pas la référence que l'IIFE a déjà capturée. (Quatre cas de ce banc
    // ont d'abord rougi pour cette raison — le test était faux, pas le code.)
    if (dom) globaux.document = { getElementById: (id) => dom[id] || null };
    return chargerScript('js/trimestre-v2-cours.js', globaux);
}

/** Fabrique un calendrier de N semaines de cours (5 jours chacune). */
function calendrierDe(nbSemaines) {
    const cal = {};
    let jour = 1;
    for (let s = 1; s <= nbSemaines; s++) {
        for (let j = 0; j < 5; j++) {
            cal['2026-01-' + String(jour++).padStart(2, '0')] =
                { statut: 'cours', numeroSemaine: s };
        }
    }
    return cal;
}

// ─────────────────────────────────────────────────────────────────────
describe('#540-B/A — le nombre de semaines se LIT au calendrier', () => {
    it('un trimestre régulier de 15 semaines rend 15', () => {
        const win = chargerAvecCalendrier(calendrierDe(15));
        expect(win._semainesDuTrimestreActif()).toBe(15);
    });

    it('un trimestre ÉCOURTÉ rend son vrai compte, pas 15', () => {
        const win = chargerAvecCalendrier(calendrierDe(11));
        expect(win._semainesDuTrimestreActif()).toBe(11);
    });

    it('une session d\'été intensive rend son vrai compte', () => {
        const win = chargerAvecCalendrier(calendrierDe(7));
        expect(win._semainesDuTrimestreActif()).toBe(7);
    });
});

describe('#540-B/B — un calendrier muet est un refus de répondre, pas un 15', () => {
    it('calendrier absent → 0', () => {
        expect(chargerAvecCalendrier(null)._semainesDuTrimestreActif()).toBe(0);
    });

    it('calendrier vide → 0', () => {
        expect(chargerAvecCalendrier({})._semainesDuTrimestreActif()).toBe(0);
    });

    it('calendrier sans aucun jour de cours → 0', () => {
        const cal = { '2026-01-01': { statut: 'conge' }, '2026-01-02': { statut: 'conge' } };
        expect(chargerAvecCalendrier(cal)._semainesDuTrimestreActif()).toBe(0);
    });

    it('ne lève jamais, même sur une donnée corrompue', () => {
        for (const corrompu of ['pas un objet', 42, [], { '2026-01-01': null }]) {
            expect(() => chargerAvecCalendrier(corrompu)._semainesDuTrimestreActif()).not.toThrow();
        }
    });
});

describe('#540-B/C — aucun nombre de semaines en dur ne revient', () => {
    /** Corps réel d'une fonction nommée, code seul. */
    const corpsDe = (nom) => {
        const i = SRC.indexOf(`function ${nom}(`);
        expect(i, `${nom} renommée ou retirée sans mettre à jour cette sentinelle`).toBeGreaterThan(-1);
        return SRC.slice(i, SRC.indexOf('\n}', i));
    };

    it('la proposition ne multiplie plus par une constante', () => {
        const corps = corpsDe('proposerHeuresEnseignementDepuisPonderation');
        expect(corps).not.toMatch(/\*\s*\d+/);
        expect(corps).toContain('_semainesDuTrimestreActif');
    });

    it('le repère non plus', () => {
        const corps = corpsDe('majRepereHeuresCours');
        expect(corps).not.toMatch(/\*\s*\d+/);
        expect(corps).toContain('_semainesDuTrimestreActif');
    });

    it('la source de semaines passe par le compteur partagé de #366', () => {
        expect(corpsDe('_semainesDuTrimestreActif')).toContain('calculerStatistiquesCalendrier');
    });

    it('la proposition ne remplit RIEN quand les semaines valent 0', () => {
        // La garde doit être dans la condition, pas seulement dans le helper :
        // sans elle, `(t + l) * 0` écrirait un « 0 h » inventé dans le champ.
        expect(corpsDe('proposerHeuresEnseignementDepuisPonderation')).toContain('semaines > 0');
    });
});

describe('#540-B/D — le repère dit la base du calcul', () => {
    it('le champ du repère existe dans le formulaire', () => {
        expect(HTML).toContain('id="v2-repereHeures"');
    });

    it('avec calendrier : la formule est lisible', () => {
        const dom = {
            'v2-ponderation': { value: '2-2-3' },
            'v2-repereHeures': { textContent: '' }
        };
        chargerAvecCalendrier(calendrierDe(15), dom).majRepereHeuresCours();
        expect(dom['v2-repereHeures'].textContent).toBe('(2 + 2) × 15 semaines = 60 h');
    });

    it('trimestre écourté : la formule suit, elle ne ment pas', () => {
        const dom = {
            'v2-ponderation': { value: '3-2-3' },
            'v2-repereHeures': { textContent: '' }
        };
        chargerAvecCalendrier(calendrierDe(11), dom).majRepereHeuresCours();
        expect(dom['v2-repereHeures'].textContent).toBe('(3 + 2) × 11 semaines = 55 h');
    });

    it('sans calendrier : l\'absence est NOMMÉE, aucun total n\'est avancé', () => {
        const dom = {
            'v2-ponderation': { value: '2-2-3' },
            'v2-repereHeures': { textContent: '' }
        };
        chargerAvecCalendrier(null, dom).majRepereHeuresCours();
        const texte = dom['v2-repereHeures'].textContent;
        expect(texte).toContain('4 h par semaine');
        expect(texte).toContain('calendrier');
        // Surtout pas un total : ce serait le « 60 » inventé qu'on vient de retirer.
        expect(texte).not.toContain('60');
    });

    it('sans pondération lisible : le repère se tait', () => {
        const dom = {
            'v2-ponderation': { value: 'n\'importe quoi' },
            'v2-repereHeures': { textContent: 'reste d\'un affichage précédent' }
        };
        chargerAvecCalendrier(calendrierDe(15), dom).majRepereHeuresCours();
        expect(dom['v2-repereHeures'].textContent).toBe('');
    });
});

describe('#540-B/E — l\'aide contextuelle ne promet plus quinze semaines', () => {
    const AIDE = lire('js', 'accompagnement-contenu-popup.js');

    it('la formule n\'est plus présentée comme une règle fixe', () => {
        expect(AIDE).not.toContain('les 15 semaines du trimestre régulier');
    });

    it('elle dit que les semaines sont comptées au calendrier', () => {
        const i = AIDE.indexOf("Les heures d'enseignement sont le temps");
        expect(i).toBeGreaterThan(-1);
        const passage = AIDE.slice(i, i + 700);
        expect(passage).toContain('nombre de semaines du trimestre');
        expect(passage).toContain('calendrier');
    });
});
