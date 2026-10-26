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

/** Retire blocs et lignes de commentaire — idiome repris de sentinelle-468. */
function sansCommentaires(source) {
    return source
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/(^|[^:])\/\/.*$/gm, '$1');
}

/**
 * Découpe le corps d'une fonction nommée, de sa déclaration jusqu'à la
 * déclaration suivante. Grossier mais suffisant, et surtout : il évite les
 * cliquets portés sur un FICHIER entier, qui transforment un correctif légitime
 * ailleurs dans le même fichier en faux rouge (constaté le 24 août).
 */
function corpsDeFonction(source, nom) {
    const blocs = source.split(/\n(?=(?:async )?function )/);
    return blocs.find((b) => new RegExp('^(?:async )?function ' + nom + '\\b').test(b)) || null;
}

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
        // ⚠ Le contrôle ne repose PLUS sur la proximité textuelle entre `conflit`
        // et le message (#522 lot 2b, 30 août 2026) : la capture du nom et son
        // affichage se sont éloignés dans `echelles.js`, où le refus sort
        // désormais du mutateur avant d'être dit. La proximité mesurait la mise
        // en page, pas l'invariant. Ce qui compte est le CHAÎNAGE : le nom
        // affiché doit venir du conflit rendu par la garde.
        for (const fichier of Object.keys(FAMILLES)) {
            const src = lire(fichier);

            // ⚠ TOUTES les occurrences, pas la première : `pratiques-gestion.js`
            // porte d'abord un message générique sans nom, et le refus nommé
            // vient après. Chercher la première aurait rendu un faux rouge.
            // #1154 : la fenêtre des grilles, en deux colonnes, dit « ce trimestre » ; les autres, « ta sélection ».
            const positions = [...src.matchAll(/est déjà dans (?:ta sélection|ce trimestre)/g)].map((m) => m.index);
            expect(positions.length, `${fichier} : message de refus absent`).toBeGreaterThan(0);

            const noms = [];
            const nomme = positions.some((pos) => {
                const amont = src.slice(Math.max(0, pos - 120), pos);
                const interpoles = [...amont.matchAll(/\$\{\s*([A-Za-z0-9_$]+)/g)].map((m) => m[1]);
                noms.push(...interpoles);
                // Le nom affiché doit venir du `conflit` rendu par la garde.
                return interpoles.some((nom) =>
                    new RegExp('\\b' + nom + '\\s*=[^;]*\\.conflit\\b').test(src));
            });

            expect(nomme,
                `${fichier} : aucun refus ne nomme l'exemplaire en place à partir de garde.conflit`
                + ` (noms interpolés vus : ${noms.join(', ') || 'aucun'})`
            ).toBe(true);
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
            // #522 (30 août 2026) : les pratiques relisaient en `getSync` — la
            // seule famille sur cinq à le faire. Leur écriture passe désormais
            // par `db.modifier`, et leur relecture s'aligne sur les quatre
            // autres. L'exigence est la même, la forme cesse d'être l'exception.
            'pratiques-gestion.js': /const verifPratiques = await db\.get\(/
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
        // #476 volet 2 — `bibliotheque-ui.js` REJOINT LA LISTE : la séquence de
        // « dupliquer et éditer » y a été fusionnée. Sans lui, la garantie
        // « dupliquer n'est jamais bloqué » cesserait de couvrir le chemin qui
        // porte désormais les cinq familles.
        const fichiers = ['grilles.js', 'echelles.js', 'cartouches.js',
                          'productions-liste.js', 'productions-bibliotheque-ui.js',
                          'pratiques.js', 'pratiques-gestion.js', 'bibliotheque-ui.js'];
        for (const fichier of fichiers) {
            const src = lire(fichier);
            // Découpe grossière mais suffisante : le corps de chaque `dupliquer*`
            // jusqu'à la prochaine déclaration de fonction.
            const blocs = src.split(/\n(?=(?:async )?function |\s*BibliothequeUI\.\w+ = )/)
                .filter((b) => /^(?:async )?function dupliquer|^\s*BibliothequeUI\.dupliquer/.test(b));
            // Une découpe qui ne trouve RIEN passerait verte sans rien vérifier :
            // c'est le piège que la fusion du volet 2 rendait possible.
            expect(blocs.length, `${fichier} : plus aucun bloc dupliquer* à vérifier`).toBeGreaterThan(0);
            for (const bloc of blocs) {
                const nom = (/function (dupliquer[A-Za-z]*)/.exec(bloc)
                    || /BibliothequeUI\.(dupliquer[A-Za-z]*)/.exec(bloc))[1];
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
        // ⚠ LA LISTE S'EST ÉTENDUE LE 24 AOÛT, ET C'EST TOUT LE SUJET DE D3.
        // Elle ne contenait que quatre fichiers ; `productions-liste.js`,
        // `productions-bibliotheque-ui.js` et `pratiques-gestion.js` en étaient
        // absents. Résultat : CO-24 a été déclaré clos alors que trois voies
        // concaténaient encore « (copie) » à la main, et personne ne l'a vu
        // pendant un mois. Une sentinelle qui ne lit pas un fichier ne dit RIEN
        // sur ce fichier — elle ne dit pas qu'il va bien.
        for (const fichier of ['grilles.js', 'echelles.js', 'cartouches.js', 'bibliotheque-ui.js',
                               'productions-liste.js', 'productions-bibliotheque-ui.js',
                               'pratiques-gestion.js']) {
            // On DÉPOUILLE LES COMMENTAIRES avant de chercher — idiome maison
            // (cf. sentinelle-468) : la correction s'explique DANS le code, et
            // ces explications citent forcément la forme qu'elles retirent. Sans
            // ce dépouillement, le commentaire « avant : ${source.titre} (copie) »
            // fait rougir la sentinelle qui vérifie qu'il n'y en a plus.
            const src = sansCommentaires(lire(fichier));
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

        // #476 VOLET 2 — CETTE ASSERTION A DÉMÉNAGÉ AVEC LA LOGIQUE.
        // Elle épinglait cinq call-sites littéraux (`forkerItem(grille,
        // 'GRILLE_', grilles)`…), un par famille. La fusion du volet 2 les a
        // réunis dans `BibliothequeUI.dupliquerEtEditerItem` : les épingler
        // encore serait rouge, et les retirer sans les remplacer laisserait
        // CO-24 sans garde sur ce chemin. On vérifie donc la MÊME garantie à
        // son nouvel emplacement — le moteur transmet la collection de
        // DESTINATION — puis que les cinq familles passent bien par lui.
        expect(src, 'le moteur partagé ne transmet plus la collection à forkerItem')
            .toMatch(/forkerItem\(source, d\.prefixeId, liste\)/);
        expect(src, 'la liste passée à forkerItem doit être celle où la copie atterrit')
            .toMatch(/liste\.push\(copie\)/);
    });

    it('les cinq familles passent par le moteur partagé de « dupliquer depuis la bibliothèque »', () => {
        // #476 volet 2 — second moteur fusionné. La garantie qui a déménagé ici
        // est le retrait des métadonnées de partage : la copie devient un
        // original de l'utilisateur, la licence de la source n'a plus cours.
        // Elle vivait en cinq exemplaires, un par famille ; elle vit ici.
        const src = lire('bibliotheque-ui.js');
        expect(src, 'le moteur ne retire plus les métadonnées de partage')
            .toMatch(/delete copie\.metadata_cc;[\s\S]{0,80}delete copie\.auteurOriginal;/);
        expect(src, 'le moteur ne désarme plus le drapeau démo de la copie')
            .toMatch(/copie\.isDemo = false;/);

        for (const [fichier, motif] of Object.entries({
            'grilles.js': /dupliquerVersBibliotheque\(\{[\s\S]{0,200}prefixeId: 'GRILLE_'/,
            'echelles.js': /dupliquerVersBibliotheque\(\{[\s\S]{0,200}prefixeId: 'ECH_'/,
            'cartouches.js': /dupliquerVersBibliotheque\(\{[\s\S]{0,200}prefixeId: 'CART_'/,
            'productions-bibliotheque-ui.js': /dupliquerVersBibliotheque\(\{[\s\S]{0,200}prefixeId: 'PROD_'/,
            'pratiques-gestion.js': /dupliquerVersBibliotheque\(\{[\s\S]{0,200}prefixeId: 'pratique_'/
        })) {
            expect(lire(fichier), `${fichier} : n'appelle pas le moteur partagé de bibliothèque`)
                .toMatch(motif);
        }

        // Et la voie bibliothèque ne refait plus le retrait chez elle : s'il y
        // revenait, c'est que la séquence a été recopiée — le défaut d'origine.
        //
        // ⚠ L'ASSERTION EST PORTÉE PAR LE CORPS DE LA FONCTION, PAS PAR LE FICHIER.
        // Elle a d'abord été écrite sur le fichier entier, et elle est devenue un
        // FAUX ROUGE dès la convergence du 24 août : `dupliquerGrilleDepuisSidebar`
        // a légitimement reçu son propre `delete copie.metadata_cc` (D4), sur une
        // voie qui ne passe pas par le moteur. Un cliquet trop large ne protège pas
        // mieux — il interdit des correctifs justes.
        for (const [fichier, fonction] of Object.entries({
            'grilles.js': 'dupliquerGrilleBibliotheque',
            'echelles.js': 'dupliquerEchelleBibliotheque',
            'cartouches.js': 'dupliquerCartoucheBibliotheque',
            'productions-bibliotheque-ui.js': 'dupliquerProductionBibliotheque'
        })) {
            const corps = corpsDeFonction(lire(fichier), fonction);
            expect(corps, `${fichier} : ${fonction} introuvable`).toBeTruthy();
            expect(corps, `${fichier} : ${fonction} refait le retrait au lieu de le déléguer`)
                .not.toMatch(/delete \w+\.metadata_cc/);
        }
    });

    it('les cinq familles passent par le moteur partagé de « dupliquer et éditer »', () => {
        // C'est ce qui leur fait hériter de la garantie ci-dessus. Si une
        // famille se remettait à dérouler la séquence chez elle, la garde
        // CO-24 de ce chemin cesserait de valoir pour elle sans que rien
        // d'autre ne rougisse.
        for (const fichier of ['grilles.js', 'echelles.js', 'cartouches.js',
                               'productions-liste.js', 'pratiques-gestion.js']) {
            expect(lire(fichier), `${fichier} : n'appelle pas le moteur partagé`)
                .toMatch(/BibliothequeUI\.dupliquerEtEditerItem\(/);
            expect(lire(fichier), `${fichier} : refait la séquence au lieu de la déléguer`)
                .not.toMatch(/forkerItem\(/);
        }
    });
});
