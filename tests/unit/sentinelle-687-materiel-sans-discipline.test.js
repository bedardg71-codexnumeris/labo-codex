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
 *   C — l'écran DIT ce qui manque au lieu de ne rien afficher. C'est le défaut
 *       corrigé ailleurs (une grille sans échelle ne produisait rien du tout),
 *       et retirer cinq gabarits en rend l'occurrence plus probable ;
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

    it('A.d le nom ne se réclame plus d\'une discipline, mais l\'origine reste DITE', () => {
        const som = Object.values(biblio.MODELES_PRATIQUES_PREDEFINIS).find(m => m.id === 'SOM-litterature');
        expect(som.nom.toLowerCase()).not.toMatch(/littérature/);
        // L'origine informe dans la description au lieu de se présenter comme
        // une offre : il est conservé parce qu'il vient d'une pratique RÉELLE.
        expect(som.description).toMatch(/pratique réelle en littérature/);
        // Et le champ `discipline` porte le neutre, comme les quatre autres :
        // c'est sa VALEUR qui en faisait une offre disciplinaire.
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

/* ==================================== C — L'ÉCRAN NE SE VIDE PLUS EN SILENCE */

describe('#687 · C — quand il n\'y a rien à offrir, l\'écran le DIT', () => {
    it('C.a un type sans aucun modèle produit un message, pas un sélecteur nu', async () => {
        const html = await biblio.genererSelecteurModelesPratiques('type-qui-nexiste-pas');
        expect(html).toMatch(/Aucune configuration pour ce type/);
    });

    it('C.b le message est INERTE — il ne peut pas être choisi par mégarde', () => {
        // Une option sans `disabled` serait sélectionnable et `appliquerModele`
        // partirait sur une chaîne vide.
        return biblio.genererSelecteurModelesPratiques('type-qui-nexiste-pas').then(html => {
            expect(html).toMatch(/<option value="" disabled>/);
        });
    });

    it('C.c TÉMOIN — un type qui EXISTE rend bien ses modèles, pas le message', async () => {
        // Sans ce témoin, un message affiché en toutes circonstances passerait C.a.
        const html = await biblio.genererSelecteurModelesPratiques('sommative');
        expect(html).toMatch(/Modèle sommatif/);
        expect(html).not.toMatch(/Aucune configuration/);
    });
});

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

    it('E.a les quatre modes de calcul ont perdu leur parenthèse disciplinaire', () => {
        const src = readFileSync(path.join(racine, 'js/pratique-notation-v2.js'), 'utf8');
        ['Comptage', 'Moyenne pondérée', 'Seuils critiques', 'Holistique'].forEach(mode => {
            expect(src, `« ${mode} » porte encore une matière`)
                .not.toMatch(new RegExp(`nom: '${mode} \\(`));
        });
    });

    it('E.b TÉMOIN — les quatre modes existent toujours : on a débaptisé, pas supprimé', () => {
        const src = readFileSync(path.join(racine, 'js/pratique-notation-v2.js'), 'utf8');
        ['Comptage', 'Moyenne pondérée', 'Seuils critiques', 'Holistique'].forEach(mode => {
            expect(src).toMatch(new RegExp(`nom: '${mode}'`));
        });
    });

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
