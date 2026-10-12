/**
 * #687 · LE MATÉRIEL FOURNI NE SE RÉCLAME D'AUCUNE DISCIPLINE
 *
 * Décision de Grégoire, 2 septembre 2026. Le matériel nommé par discipline
 * (Chimie, Géographie, Philosophie, Comptabilité, Biologie…) est FICTIF : il a
 * été engendré par une IA, aucun enseignant de ces matières ne l'a validé, et
 * sa justesse est inconnue. C'est le raisonnement qui a fait retirer les huit
 * échelles disciplinaires, appliqué un cran plus haut.
 *
 * ⚠ CE LOT NE TOUCHE AUCUNE DONNÉE UTILISATEUR, et ce banc le vérifie :
 * `MODELES_PRATIQUES_PREDEFINIS` est fusionné À LA LECTURE (`unshift` sur la
 * liste lue), jamais versé en base. Retirer une entrée la fait disparaître de
 * la bibliothèque sans migration et sans laisser de stock. Une copie ADOPTÉE
 * par quelqu'un lui appartient : elle est reconnue par son `id`, et c'est
 * pourquoi les `id` conservés ne bougent pas.
 *
 * Ce que ce banc verrouille :
 *   A — les cinq entrées disciplinaires ne reviennent pas, et l'`id` de celle
 *       qu'on garde n'a pas bougé (sinon une copie adoptée se dédoublerait) ;
 *   B — CHAQUE FAMILLE garde au moins un modèle. C'est la raison pour laquelle
 *       le sommatif est conservé : sans lui, la famille la plus courante
 *       n'offrirait rien ;
 *   C — (retiré le 12 oct. 2026 avec le sélecteur qu'il jugeait, #469) ;
 *   D — les forfaits de reprise portent un nom de MÉCANIQUE, et leurs `value`
 *       persistées n'ont PAS changé ;
 *   E — le résidu statique : plus de discipline dans le matériel offert.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');

let biblio, attributs;
beforeAll(() => {
    attributs = chargerScript('js/pratiques/construction-attributs.js').ConstructionAttributs;
    biblio = chargerScript('js/pratiques-bibliotheque.js', {
        db: { getSync: (_k, d) => (d !== undefined ? d : null), get: async () => null, set: async () => {} },
        cle: (k) => k,
        echapperHtml: (t) => (t == null ? '' : String(t)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')),
        notifications: { info: () => {}, succes: () => {}, erreur: () => {} }
    });
    // (Le registre de familles de l'assistant n'est plus chargé ici : seul le cas C, retiré, le lisait.)
});

/* ================================================ A — LE MATÉRIEL FICTIF EST PARTI */

describe('#687 · A — les cinq entrées disciplinaires ne reviennent pas', () => {
    const RETIREES = [
        'SPE-chimie-contrats', 'SOM-comptabilite', 'SOM-geographie',
        'SOM-philo-portfolio', 'SOM-philo-remplacement'
    ];

    it('A.a aucune des cinq n\'est encore offerte', () => {
        const ids = Object.values(biblio.MODELES_PRATIQUES_PREDEFINIS).map(m => m.id);
        RETIREES.forEach(id => {
            expect(ids, `« ${id} » est revenue dans la bibliothèque`).not.toContain(id);
        });
    });

    it('A.b TÉMOIN — les entrées conservées, elles, sont bien là', () => {
        // Un « aucune des cinq » sur une liste vide passerait sans rien prouver.
        const ids = Object.values(biblio.MODELES_PRATIQUES_PREDEFINIS).map(m => m.id);
        ['DEN-base', 'SPE-simple', 'STD-n-meilleurs', 'STD-n-recents', 'SOM-litterature']
            .forEach(id => expect(ids).toContain(id));
    });

    it('A.c l\'`id` du modèle conservé N\'A PAS CHANGÉ — une copie adoptée en dépend', () => {
        // La fusion à la lecture reconnaît une copie déjà prise par son `id`
        // (`idsExistants`). Renommer l'`id` ferait réapparaître le gabarit à
        // côté de la copie de l'utilisateur : deux entrées pour une pratique.
        const som = Object.values(biblio.MODELES_PRATIQUES_PREDEFINIS).find(m => m.id === 'SOM-litterature');
        expect(som).toBeDefined();
        expect(som.nom).toBe('Modèle sommatif');
    });

    it('A.d ni le nom NI LA DESCRIPTION ne renvoient à une matière — #691', () => {
        // ⚠ RÉORIENTÉE le 2 septembre. #687 avait déplacé l'origine dans la
        // description (« inspiré d'une pratique réelle en littérature ») en
        // croyant qu'informer suffisait. Décision de Grégoire : le modèle ne
        // doit être associé à AUCUNE discipline, pas même à la sienne. La
        // description est maintenant celle d'un gabarit de démarrage.
        const som = Object.values(biblio.MODELES_PRATIQUES_PREDEFINIS).find(m => m.id === 'SOM-litterature');
        expect(som.nom.toLowerCase()).not.toMatch(/littérature/);
        expect(som.description.toLowerCase()).not.toMatch(/littérature/);
        expect(som.description).toBe('Pour débuter avec une pratique sommative');
        expect(som.discipline).toBe('Général');
    });

    it('A.e aucun modèle offert ne NOMME de discipline, ni d\'établissement réel', () => {
        // ⚠ Le champ `discipline` reste — c'est sa VALEUR qui compte. Les cinq
        // modèles portent « Général », le neutre. Interdire le champ lui-même
        // ferait rougir pour une bonne raison.
        Object.values(biblio.MODELES_PRATIQUES_PREDEFINIS).forEach(m => {
            expect(m.discipline, `« ${m.id} » se réclame encore d'une discipline`).toBe('Général');
            // « Cégep de Valleyfield » désignait un établissement réel pour un
            // gabarit que personne là-bas n'a validé.
            expect(m.etablissement, `« ${m.id} » nomme un établissement`).toBeUndefined();
        });
    });
});

/* ======================== A bis — LA CONFIGURATION, PAS SEULEMENT LE LIBELLÉ */

describe('#691 · A bis — aucune matière ne survit DANS LA CONFIGURATION', () => {
    /**
     * ⚠ C'EST LE TROU DU LOT PRÉCÉDENT, ET IL ÉTAIT ENTIER. Le banc de #687
     * regardait `nom`, `description` et `discipline` — les LIBELLÉS. Or ce que
     * voit l'enseignant qui adopte un modèle, c'est sa CONFIGURATION : le
     * sommatif portait encore « Analyse partielle », « Portfolio », « Travail
     * équipe », « Cohérence textuelle », « Respect de la structure », un
     * `doubleVerrou` et « 5-7 travaux ». Le nom était neutre depuis #687 ; la
     * pratique de son auteur, non.
     *
     * ⮕ Ce point sérialise la configuration ENTIÈRE et y cherche le vocabulaire
     * d'une matière. Il ne peut pas être satisfait en renommant une étiquette.
     */
    const MOTS_DE_MATIERE = [
        'littérature', 'littéraire', 'rédaction', 'dissertation', 'analyse partielle',
        'cohérence textuelle', 'qualité de la langue', 'chimie', 'biologie',
        'philosophie', 'géographie', 'comptabilité', 'informatique', 'mathémat'
    ];

    it('A bis.a la configuration d\'aucun modèle offert ne parle une matière', () => {
        Object.values(biblio.MODELES_PRATIQUES_PREDEFINIS).forEach(m => {
            const texte = JSON.stringify(m.configuration || {}).toLowerCase();
            MOTS_DE_MATIERE.forEach(mot => {
                expect(texte, `« ${m.id} » porte « ${mot} » dans sa configuration`)
                    .not.toContain(mot);
            });
        });
    });

    it('A bis.b TÉMOIN — la mesure sait trouver ces mots quand ils sont là', () => {
        // Sans ce témoin, une `configuration` absente ou un `JSON.stringify`
        // qui rendrait '{}' passerait A bis.a sans rien prouver.
        const avant = JSON.stringify({
            evaluations: [{ nom: 'Analyse partielle' }],
            criteres: { liste: ['Cohérence textuelle'] }
        }).toLowerCase();
        expect(MOTS_DE_MATIERE.some(mot => avant.includes(mot))).toBe(true);
        // Et chaque modèle offert a bien une configuration NON VIDE à inspecter.
        Object.values(biblio.MODELES_PRATIQUES_PREDEFINIS).forEach(m => {
            expect(JSON.stringify(m.configuration || {}).length,
                `« ${m.id} » n'a rien à inspecter`).toBeGreaterThan(2);
        });
    });

    it('A bis.c les réglages PERSONNELS sont partis, pas déplacés', () => {
        const som = Object.values(biblio.MODELES_PRATIQUES_PREDEFINIS).find(m => m.id === 'SOM-litterature');
        // `doubleVerrou` et « 5-7 travaux » étaient les réglages d'une personne.
        expect(som.configuration.particularites).toBeUndefined();
        expect(JSON.stringify(som.configuration)).not.toMatch(/doubleVerrou/);
    });

    it('A bis.d le sommatif reprend les QUATRE critères de la grille de départ', () => {
        // Cohérence gratuite : qui prend la grille de départ ET ce modèle voit
        // le même vocabulaire des deux côtés.
        const som = Object.values(biblio.MODELES_PRATIQUES_PREDEFINIS).find(m => m.id === 'SOM-litterature');
        expect(som.configuration.criteres.liste)
            .toEqual(['Compréhension', 'Application', 'Analyse', 'Synthèse']);
        // TÉMOIN : ce sont bien ceux de `GRILLE_GENERIQUE`, lus dans grilles.js.
        const grilles = readFileSync(path.join(racine, 'js/grilles.js'), 'utf8');
        ['Compréhension', 'Application', 'Analyse', 'Synthèse'].forEach(c => {
            expect(grilles).toMatch(new RegExp(`nom: '${c}'`));
        });
    });

    it('A bis.e les pondérations font 100, en nombres ronds', () => {
        const som = Object.values(biblio.MODELES_PRATIQUES_PREDEFINIS).find(m => m.id === 'SOM-litterature');
        const total = som.configuration.evaluations.reduce((n, e) => n + e.ponderation, 0);
        expect(total).toBe(100);
        som.configuration.evaluations.forEach(e => {
            expect(e.ponderation % 5, `« ${e.nom} » n'est pas une pondération ronde`).toBe(0);
        });
    });

    it('A bis.f ⚠ AUCUNE ÉVALUATION D\'UN MODÈLE FOURNI NE PÈSE PLUS QU\'UNE AUTRE', () => {
        // ⚠ RÉORIENTÉ le 2 septembre : A bis.e ci-dessus passait déjà avec
        // `20/20/30/30` ET avec `25/25/25/25` — il gardait la somme et
        // l'arrondi, pas la RÉPARTITION. Or c'est elle qui portait une position
        // pédagogique : 60 % du poids sur les examens, servi comme point de
        // départ à des programmes où les examens sont minoritaires ou absents.
        // ⮕ L'invariant est l'ÉGALITÉ, et il vaut pour tout modèle fourni :
        // un gabarit propose une structure, il ne tranche pas ce qui compte le plus.
        Object.values(biblio.MODELES_PRATIQUES_PREDEFINIS).forEach(m => {
            const evals = (m.configuration && m.configuration.evaluations) || [];
            if (!evals.length) return;   // tous les modèles n'ont pas d'évaluations
            const parts = evals.map(e => e.ponderation);
            expect(new Set(parts).size,
                `« ${m.id} » pondère inégalement : ${parts.join(' / ')}`).toBe(1);
        });
    });

    it('A bis.g TÉMOIN — il y a bien des évaluations à peser', () => {
        // Sans lui, un modèle sans `evaluations` ferait passer A bis.f par le
        // `return` ci-dessus, et l'invariant ne garderait plus rien.
        const som = Object.values(biblio.MODELES_PRATIQUES_PREDEFINIS).find(m => m.id === 'SOM-litterature');
        expect(som.configuration.evaluations.length).toBe(4);
        // Et la mesure sait voir une inégalité quand il y en a une.
        expect(new Set([20, 20, 30, 30]).size).toBe(2);
    });
});

/* ============================================= B — AUCUNE FAMILLE NE SE VIDE */

describe('#687 · B — chaque famille garde au moins un modèle', () => {
    it('B.a les quatre familles sont couvertes', () => {
        const parFamille = {};
        Object.values(biblio.MODELES_PRATIQUES_PREDEFINIS).forEach(m => {
            (m.pratiques || []).forEach(f => { parFamille[f] = (parFamille[f] || 0) + 1; });
        });
        ['DEN', 'SPE', 'STD', 'SOM'].forEach(f => {
            expect(parFamille[f] || 0, `la famille ${f} n'offre plus aucun modèle`).toBeGreaterThan(0);
        });
    });

    it('B.b c\'est la raison d\'être du sommatif conservé — la famille la plus courante', () => {
        const som = Object.values(biblio.MODELES_PRATIQUES_PREDEFINIS)
            .filter(m => (m.pratiques || []).includes('SOM'));
        expect(som).toHaveLength(1);
        expect(som[0].id).toBe('SOM-litterature');
    });
});

/* ======================================= C — RETIRÉ AVEC SON ÉCRAN (#469) */
// Le sélecteur de modèles (`genererSelecteurModelesPratiques`) et son message « Aucun modèle
// … fourni » sont partis le 12 oct. 2026 : leur cible `v2-spec-dropdown-modeles` n'existait
// plus, aucun écran ne les montrait. Les cas C sont partis avec eux.

/* ================================== D — LES FORFAITS DISENT LEUR MÉCANIQUE */

describe('#687 · D — les forfaits de reprise nomment un mécanisme, pas une matière', () => {
    it('D.a aucun libellé ne nomme une discipline', () => {
        attributs.MODELES_FORFAITS.forEach(m => {
            expect(m.label, `« ${m.value} »`).not.toMatch(/Sciences|Littérature|Chimie|Biologie/i);
            expect(m.description, `« ${m.value} »`).not.toMatch(/disciplines? (scientifiques?|littéraires?)/i);
        });
    });

    it('D.b ⚠ LES `value` N\'ONT PAS CHANGÉ — elles sont PERSISTÉES chez l\'utilisateur', () => {
        // `wizard-pratique-v2.js:2782` écrit `configuration.modeleBundle`. Les
        // renommer réécrirait la configuration de pratiques déjà créées.
        expect(attributs.MODELES_FORFAITS.map(m => m.value))
            .toEqual(['sciences', 'simple', 'litterature', 'personnalise']);
    });

    it('D.c le résumé d\'attributs affiche le LIBELLÉ, plus la valeur brute', () => {
        // Défaut mesuré : une pratique créée avant ce lot affichait
        // « Modèle litterature » — sans accent, avec le nom d'une discipline.
        expect(attributs.libelleModeleForfaits('litterature')).toBe('Forfaits flexibles');
        expect(attributs.libelleModeleForfaits('sciences')).toBe('Forfaits progressifs');
    });

    it('D.d une valeur inconnue est rendue telle quelle — mieux qu\'un trou', () => {
        expect(attributs.libelleModeleForfaits('venu-dune-version-future')).toBe('venu-dune-version-future');
        expect(attributs.libelleModeleForfaits(null)).toBe('');
    });
});

/* ================================================== E — LE RÉSIDU STATIQUE */

describe('#687 · E — plus de discipline dans le matériel OFFERT', () => {
    /**
     * ⚠ CE POINT NE TRAQUE PAS LE MOT, IL TRAQUE L'OFFRE. Le mot « chimie »
     * reste légitime à trois endroits, et les confondre ferait rougir le banc
     * pour de bonnes raisons : les CODES DE PROGRAMME du ministère (« 202
     * Chimie », que l'utilisateur choisit pour SA matière), les COMMENTAIRES
     * qui documentent un retrait déjà fait, et les ATTRIBUTIONS académiques.
     * Ce sont les LIBELLÉS de matériel proposé qui sont interdits.
     */
    const DISCIPLINES = /(Chimie|Biologie|Philosophie|Géographie|Comptabilité|Mathémat|Informatique)/i;

    // E.a et E.b portaient sur les quatre modes de calcul de `pratique-notation-v2.js`,
    // retiré en entier le 11 oct. 2026 (#469, code mort). Rien à débaptiser : ils sont partis.

    it('E.c aucun `nom:` de modèle offert ne nomme une discipline', () => {
        Object.values(biblio.MODELES_PRATIQUES_PREDEFINIS).forEach(m => {
            expect(m.nom, `« ${m.id} »`).not.toMatch(DISCIPLINES);
        });
    });

    it('E.d le fichier au prénom d\'un collègue n\'est plus servi', () => {
        // Il était CHARGÉ par index.html et n'avait AUCUN lecteur : un prénom
        // dans une URL servie aux utilisateurs, pour du code mort.
        expect(existsSync(path.join(racine, 'js/pratiques/config-francois-chimie.js'))).toBe(false);
        const html = readFileSync(path.join(racine, 'index.html'), 'utf8');
        expect(html).not.toMatch(/config-francois-chimie/);
        // TÉMOIN : le module de pratiques, lui, est toujours chargé.
        expect(html).toMatch(/pratiques\/pratique-pan-specifications\.js/);
    });
});
