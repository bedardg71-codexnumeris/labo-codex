import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE — #476 volet 1 · UN DEUXIÈME « AJOUTER À MA SÉLECTION » REFUSE,
// ET LE DIT.
//
// Verdict de Grégoire, 23 août 2026 : « bloquer ». Mais pas n'importe quoi —
// dupliquer est une action VOULUE :
//
//   · « Ajouter à ma sélection », import → il veut UNE copie      → BLOQUER
//   · « Dupliquer » (bouton explicite)   → il veut une DE PLUS    → jamais
//   · sauvegarde d'un nom déjà pris      → ambigu                 → avertir
//
// ⚠ ON BLOQUE SUR L'IDENTITÉ, JAMAIS SUR LE NOM. Grégoire possède en a2025
// deux échelles « IDME et niv 0 » réellement utilisées toutes les deux (#450) ;
// bloquer sur le nom casserait ses données. Le cas-témoin est verrouillé ici.
//
// ▣ LE PIÈGE DU 22 AOÛT, À NE PAS REJOUER. `db.set` / `db.setSync` font un
// `return;` NU quand une garde refuse l'écriture (js/db.js:449 et :1458) :
// l'appelant ne peut PAS distinguer un succès d'un refus. L'application
// annonçait « ajoutée » alors que rien n'était écrit. La parade est une
// RELECTURE-VÉRIFICATION après écriture — c'est la seule preuve qui vaille, et
// les cinq familles doivent la faire.
//
// BREAK-TESTS (faits le 23 août 2026) :
//  (a) faire rendre `{ajoute: true}` inconditionnellement à
//      `ajouterAvecGardeIdentite` → « le second ajout est refusé » ROUGIT ;
//  (b) retirer la relecture de js/grilles.js → « les cinq familles relisent
//      après écriture » ROUGIT en nommant grilles.js.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dossierJs = path.resolve(__dirname, '..', '..', 'js');
const lire = (f) => readFileSync(path.join(dossierJs, f), 'utf8');

let win;
beforeEach(() => { win = chargerScript('js/identite-item.js'); });

/* ------------------------------------------------------------------ */
/* Le helper                                                           */
/* ------------------------------------------------------------------ */

describe('#476 · ajouterAvecGardeIdentite', () => {
    it('un premier ajout passe', () => {
        const r = win.ajouterAvecGardeIdentite([], { id: 'G1', nom: 'Grille' });
        expect(r.ajoute).toBe(true);
        expect(r.conflit).toBeNull();
        expect(r.liste).toHaveLength(1);
    });

    it('le second ajout est refusé, et NOMME l\'exemplaire en place', () => {
        // Porte terrain 5 : « un deuxième clic refuse et le dit ».
        const enPlace = { id: 'G1', nom: 'Artefact 7' };
        const copie = { id: 'G2', idOriginal: 'G1', nom: 'Artefact 7' };

        const r = win.ajouterAvecGardeIdentite([enPlace], copie);
        expect(r.ajoute).toBe(false);
        expect(r.conflit).toBe(enPlace);          // de quoi écrire le message
        expect(r.conflit.nom).toBe('Artefact 7');
        expect(r.liste).toHaveLength(1);          // un seul exemplaire, pas deux
    });

    it('refuse aussi quand l\'ascendance passe par `inspireDe` — le trou d\'origine', () => {
        // Les recherches en place dans les cinq familles ne testent que `id` et
        // `idOriginal`. Un exemplaire venu d'un paquet collègue (D7) porte son
        // ascendance dans `inspireDe.idOriginal` ; une pratique importée d'un
        // autre trimestre dans `inspireDe.sourceId`. Les deux passaient au
        // travers et s'empilaient.
        const viaPaquet = { id: 'X', nom: 'G', inspireDe: { idOriginal: 'SOURCE' } };
        expect(win.ajouterAvecGardeIdentite([viaPaquet], { id: 'Y', idOriginal: 'SOURCE' }).ajoute).toBe(false);

        const viaDerivation = { id: 'X', nom: 'P', inspireDe: { sourceId: 'SOURCE' } };
        expect(win.ajouterAvecGardeIdentite([viaDerivation], { id: 'Y', idOriginal: 'SOURCE' }).ajoute).toBe(false);
    });

    it('CAS-TÉMOIN #450 : deux homonymes distincts s\'ajoutent tous les deux', () => {
        // Les deux échelles « IDME et niv 0 » de Grégoire. Si ce test rougit,
        // c'est qu'on s'est mis à bloquer sur le nom — et ses données cassent.
        const premiere = { id: 'ECH_A', nom: 'IDME et niv 0' };
        const seconde = { id: 'ECH_B', nom: 'IDME et niv 0' };

        const r = win.ajouterAvecGardeIdentite([premiere], seconde);
        expect(r.ajoute).toBe(true);
        expect(r.liste).toHaveLength(2);
    });

    it('reste PURE : la liste d\'entrée n\'est jamais poussée', () => {
        const liste = [{ id: 'G1', nom: 'G' }];
        const r = win.ajouterAvecGardeIdentite(liste, { id: 'G2', nom: 'Autre' });
        expect(liste).toHaveLength(1);            // intacte
        expect(r.liste).toHaveLength(2);          // la nouvelle porte l'ajout
        expect(r.liste).not.toBe(liste);
    });

    it('entrées hostiles : item nul, liste absente', () => {
        expect(win.ajouterAvecGardeIdentite([], null).ajoute).toBe(false);
        expect(win.ajouterAvecGardeIdentite([], 'texte').ajoute).toBe(false);
        expect(win.ajouterAvecGardeIdentite(null, { id: 'A' }).ajoute).toBe(true);
    });

    it('un item sans aucun identifiant n\'est jamais confondu avec un autre', () => {
        // `memeIdentite` est faux dès qu'un côté n'a aucun jeton : deux items
        // anonymes ne sont pas « le même » parce qu'ils sont tous deux anonymes.
        const r = win.ajouterAvecGardeIdentite([{ nom: 'G' }], { nom: 'G' });
        expect(r.ajoute).toBe(true);
    });
});

/* ------------------------------------------------------------------ */
/* Le câblage des cinq familles                                        */
/* ------------------------------------------------------------------ */

describe('#476 · les cinq points d\'écriture sont gardés', () => {
    const FAMILLES = {
        'grilles.js': 'grillesTemplates',
        'echelles.js': 'echellesTemplates',
        'cartouches.js': 'cartouches_',
        'productions-bibliotheque-ui.js': 'cleProductions',
        'pratiques-gestion.js': 'pratiquesConfigurables'
    };

    it('chaque famille appelle la garde avant de pousser', () => {
        for (const fichier of Object.keys(FAMILLES)) {
            expect(lire(fichier), `${fichier} : garde absente`)
                .toMatch(/ajouterAvecGardeIdentite\(/);
        }
    });

    it('chaque refus NOMME l\'exemplaire en place, jamais un échec muet', () => {
        for (const fichier of Object.keys(FAMILLES)) {
            const src = lire(fichier);
            expect(src, `${fichier} : le message de refus ne cite pas le conflit`)
                .toMatch(/conflit[\s\S]{0,200}est déjà dans ta sélection/);
        }
    });

    it('les cinq familles RELISENT après écriture (piège du 22 août)', () => {
        // `db.set`/`db.setSync` rendent un `return;` nu sur refus de garde.
        // Sans relecture, l'app annonce un succès qui n'a pas eu lieu.
        const relectures = {
            'grilles.js': /const verifGrille = await db\.get\(/,
            'echelles.js': /const verifEchelle = await db\.get\(/,
            'cartouches.js': /const verifCartouche = await db\.get\(/,
            'productions-bibliotheque-ui.js': /const verification = await db\.get\(/,
            'pratiques-gestion.js': /const verifPratiques = db\.getSync\(/
        };
        for (const [fichier, motif] of Object.entries(relectures)) {
            expect(lire(fichier), `${fichier} : relecture-vérification absente`).toMatch(motif);
        }
    });

    it('l\'échec d\'écriture est ANNONCÉ, pas avalé', () => {
        for (const fichier of Object.keys(FAMILLES)) {
            const src = lire(fichier);
            expect(src, `${fichier} : aucun message sur écriture non confirmée`)
                .toMatch(/n'a PAS pu être ajoutée|Écriture non confirmée/);
        }
    });

    it('« Dupliquer » n\'est PAS bloqué : aucune fonction dupliquer* ne consulte la garde', () => {
        // Dupliquer est une action voulue. Si la garde apparaissait dans une
        // `dupliquer*`, on aurait converti une fonctionnalité en régression.
        const fichiers = ['grilles.js', 'echelles.js', 'cartouches.js',
                          'productions-liste.js', 'productions-bibliotheque-ui.js',
                          'pratiques.js', 'pratiques-gestion.js'];
        for (const fichier of fichiers) {
            const src = lire(fichier);
            // Découpe grossière mais suffisante : le corps de chaque `dupliquer*`
            // jusqu'à la prochaine déclaration de fonction.
            const blocs = src.split(/\n(?=(?:async )?function )/)
                .filter((b) => /^(?:async )?function dupliquer/.test(b));
            for (const bloc of blocs) {
                const nom = /function (dupliquer[A-Za-z]*)/.exec(bloc)[1];
                expect(bloc, `${fichier}:${nom} ne doit PAS bloquer une duplication voulue`)
                    .not.toMatch(/ajouterAvecGardeIdentite/);
            }
        }
    });
});

/* ------------------------------------------------------------------ */
/* CO-24 — les noms de copie cessent de s'empiler                      */
/* ------------------------------------------------------------------ */

// « X (copie) (copie) (copie) » : le vrai reproche de CO-24. Ça ne se règle pas
// par un blocage — dupliquer est voulu — mais par un helper de nommage.
//
// BREAK-TEST (fait le 23 août 2026) — rétablir la concaténation naïve dans
// `nommerCopie` :  return base + ' (copie)';
// → « la chaîne des trois premiers appels » ROUGIT dès le deuxième maillon.

describe('CO-24 · nommerCopie', () => {
    it('la chaîne des trois premiers appels ne s\'empile jamais', () => {
        const un = win.nommerCopie('Artefact 7');
        const deux = win.nommerCopie(un);
        const trois = win.nommerCopie(deux);

        expect(un).toBe('Artefact 7 (copie)');
        expect(deux).toBe('Artefact 7 (copie 2)');
        expect(trois).toBe('Artefact 7 (copie 3)');
        expect(trois).not.toMatch(/\(copie\).*\(copie\)/);
    });

    it('un nom contenant DÉJÀ « (copie) » est normalisé, pas rallongé', () => {
        expect(win.nommerCopie('Grille FR (copie)')).toBe('Grille FR (copie 2)');
        expect(win.nommerCopie('Grille FR (copie 9)')).toBe('Grille FR (copie 10)');
        expect(win.nommerCopie('Grille FR (COPIE)')).toBe('Grille FR (copie 2)');
    });

    it('un nom vide ne produit pas « (copie) » orphelin', () => {
        expect(win.nommerCopie('')).toBe('Sans titre (copie)');
        expect(win.nommerCopie(null)).toBe('Sans titre (copie)');
        expect(win.nommerCopie(undefined)).toBe('Sans titre (copie)');
        expect(win.nommerCopie('   ')).toBe('Sans titre (copie)');
    });

    it('les noms déjà pris font sauter au premier rang libre', () => {
        expect(win.nommerCopie('X', ['X (copie)', 'X (copie 2)'])).toBe('X (copie 3)');
        // Items plutôt que chaînes — c'est ce que passent les appelants réels.
        expect(win.nommerCopie('X', [{ nom: 'X (copie)' }, { titre: 'X (copie 2)' }])).toBe('X (copie 3)');
    });

    it('la comparaison aux noms pris ignore casse et espaces', () => {
        expect(win.nommerCopie('X', ['  x   (COPIE)  '])).toBe('X (copie 2)');
    });

    it('une parenthèse qui RESSEMBLE à un suffixe n\'est pas mangée', () => {
        // « (copie de ma sœur) » fait partie du nom : le rogner perdrait de
        // l'information que l'utilisateur a écrite lui-même.
        expect(win.nommerCopie('Recette (copie de ma sœur)'))
            .toBe('Recette (copie de ma sœur) (copie)');
    });

    it('les cinq familles passent par le helper, plus par concaténation', () => {
        for (const fichier of ['grilles.js', 'echelles.js', 'cartouches.js', 'bibliotheque-ui.js']) {
            const src = lire(fichier);
            expect(src, `${fichier} : concaténation naïve « (copie) » encore présente`)
                .not.toMatch(/\+ ' \(copie\)'|\$\{[^}]*\} \(copie\)/);
            expect(src, `${fichier} : nommerCopie absent`).toMatch(/nommerCopie\(/);
        }
    });

    it('forkerItem — le point partagé des cinq familles — accepte la collection', () => {
        // Sans 3e paramètre, le helper normalise quand même le suffixe ; avec,
        // il évite en plus de heurter un nom déjà pris.
        const src = lire('bibliotheque-ui.js');
        expect(src).toMatch(/forkerItem = function \(source, prefixeId, nomsExistants\)/);
        for (const [fichier, motif] of Object.entries({
            'grilles.js': /forkerItem\(grille, 'GRILLE_', grilles\)/,
            'echelles.js': /forkerItem\(echelle, 'ECH_', echelles\)/,
            'cartouches.js': /forkerItem\(cartouche, 'CART_', cartouches\)/,
            'productions-liste.js': /forkerItem\(production, 'PROD_', productions\)/,
            'pratiques-gestion.js': /forkerItem\(pratique, 'pratique_', pratiquesExistantes\)/
        })) {
            expect(lire(fichier), `${fichier} : collection non transmise à forkerItem`).toMatch(motif);
        }
    });
});
