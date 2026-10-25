import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { tranche } from './_helpers/tranche.js';

// SENTINELLE — les textes relus par Grégoire le 15 oct. 2026 (15 h 27), posés sur la consigne de Cowork
// (`plans de travail/CONSIGNE-LOT-2026-10-15-textes-relus.md`, source : `TEXTES-A-RELIRE-2026-10-15.md`).
// Chaque texte se lit là où il vit (bulles, glossaire, fenêtres, écran) ; les mots qui viennent d'une
// autre source (les paliers de présence) sont lus à cette source, jamais recopiés ici.

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const lire = (f) => readFileSync(path.join(racine, f), 'utf8');
const HOVER = lire('js/accompagnement-contenu-hover.js');
const POPUP = lire('js/accompagnement-contenu-popup.js');
const TERME = lire('js/accompagnement-contenu-terme.js');
const WIZARD = lire('js/wizard-pratique-v2.js');
const INDEX = lire('index.html');

/** Le texte d'une bulle, par sa clé (guillemets simples, apostrophes typographiques ou échappées). */
const bulle = (cle) => {
    const m = HOVER.match(new RegExp(`'${cle}':\\s*\\n?\\s*'((?:[^'\\\\]|\\\\.)*)'`));
    expect(m, `la bulle ${cle} manque`).toBeTruthy();
    return m[1].replace(/\\'/g, "'");
};
/** Une entrée d'un catalogue d'objets, de sa clé à la suivante. */
const entree = (src, cle) => tranche(src, `'${cle}': {`, '\n    }', { longueurMin: 60 });
const MOTS = (() => {
    const q = lire('js/contexte-qualification.js');
    const mots = (nom) => [...q.match(new RegExp(`const ${nom} = \\[([^\\]]+)\\]`))[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
    return { presence: mots('MOTS_PRESENCE'), remise: mots('MOTS_REMISE') };
})();

describe('Bloc 1 — l\'aide du Comparateur', () => {
    it('le titre dessiné par le Comparateur porte le bouton d\'aide, et sa fenêtre existe', () => {
        const entete = tranche(lire('js/comparateur-pratiques.js'), 'function entete(titre) {', '\n    }');
        expect(entete).toContain('data-aide="comparateur-pratiques"');
        expect(entete).toContain('aria-label="Aide : le Comparateur de pratiques"');
        const fenetre = entree(POPUP, 'comparateur-pratiques');
        expect(fenetre).toContain('titre: "Comprendre le Comparateur de pratiques"');
        for (const bout of ['deux ou trois pratiques de notation', '« Construction de la note »', '« Résultat – profils-types »',
            'comparer n\'écrit rien', 'une copie d\'essai d\'une de tes pratiques', '« non constructible » n\'est pas un zéro',
            '« Ce que ces réglages changent »']) {
            expect(fenetre, bout).toContain(bout);
        }
    });

    it('les trois termes du glossaire, et ni « souche » ni « pratique aboutie »', () => {
        for (const [cle, terme] of [['comparateur-pratiques', 'Comparateur de pratiques'], ['maquette-pratique', 'Maquette (de pratique)'], ['deriver-maquette', 'Dériver une maquette']]) {
            const e = entree(TERME, cle);
            expect(e).toContain(`terme: '${terme}'`);
            expect(e).toContain("categorie: 'Pratiques de notation'");
            expect(e).toContain("voir: 'Labo > Comparateur de pratiques'");
            expect(e, `${cle} : un mot du code`).not.toMatch(/souche|pratique aboutie/i);
        }
        expect(entree(TERME, 'maquette-pratique')).toContain('« dormant »');
        expect(entree(POPUP, 'comparateur-pratiques')).not.toMatch(/souche|pratique aboutie/i);
    });
});

describe('Bloc 2 — l\'aide de l\'import d\'un trimestre à l\'autre', () => {
    const BIBLIOTHEQUES = [
        ['js/grilles.js', 'importerToutGrillesTrimestreModal', 'grilles'],
        ['js/echelles.js', 'importerToutEchellesTrimestreModal', 'échelles'],
        ['js/cartouches.js', 'importerToutCartouchesTrimestreModal', 'cartouches'],
        ['js/productions-bibliotheque-ui.js', 'importerToutTrimestreModal', 'productions'],
        ['js/pratiques-gestion.js', 'importerToutPratiquesTrimestreModal', 'pratiques'],
    ];

    it('le terme « Trimestres séparés » remplace le namespacing', () => {
        expect(TERME).not.toContain('namespacing-prefixe-trimestre');
        expect(TERME).not.toMatch(/terme: 'Namespacing|sont préfixées par le trimestre actif/);
        const e = entree(TERME, 'trimestres-separes');
        expect(e).toContain("terme: 'Trimestres séparés'");
        expect(e).toContain("categorie: 'Réglages'");
        expect(e).toContain('l’original reste intact');
    });

    it('la fenêtre « Importer depuis un autre trimestre » et son bouton, dans les cinq bibliothèques', () => {
        const fenetre = entree(POPUP, 'import-autre-trimestre');
        expect(fenetre).toContain('Importer crée une copie.');
        expect(fenetre).toContain('« (importée) »');
        for (const [f] of BIBLIOTHEQUES) {
            if (f === 'js/grilles.js') continue;   // #1154 : en données, voir l'essai qui suit
            expect(lire(f), f).toMatch(/Importer depuis un autre trimestre <button class="btn-aide-contextuelle" data-aide="import-autre-trimestre"/);
        }
        // ↻ #1154 (25 oct. 2026) : la bibliothèque des grilles passe en deux colonnes ; « Importer depuis un
        // autre trimestre » y est dessinée par le composant (`_renderImportAutreTrimestre`, bibliotheque-ui.js),
        // à qui grilles.js passe ses mots, son aide et son action. Même titre, même bouton d'aide.
        // BREAK-TEST (25 oct.) : `aide: 'import-autre-trimestre'` retiré de grilles.js → ROUGE.
        expect(lire('js/grilles.js')).toMatch(/importAutreTrimestre: \{\s*titre: 'Importer depuis un autre trimestre',/);
        expect(lire('js/grilles.js')).toContain("aide: 'import-autre-trimestre'");
        expect(lire('js/bibliotheque-ui.js')).toMatch(/class="btn-aide-contextuelle" data-aide="' \+ echapperAttribut\(o\.aide\)/);
    });

    it('chaque « Tout importer » porte sa bulle, avec le nom de sa bibliothèque', () => {
        for (const [f, action, nom] of BIBLIOTHEQUES) {
            // #1154 : les grilles passent l'action et la bulle en données au composant, qui écrit « Tout importer ».
            const m = f === 'js/grilles.js'
                ? lire(f).match(new RegExp(`actionTout: '${action}',\\s*tooltipTout: '([\\w-]+)'`))
                : lire(f).match(new RegExp(`data-action="${action}"[^>]*data-tooltip="([\\w-]+)">Tout importer`));
            expect(m, f).toBeTruthy();
            const texte = bulle(m[1]);
            expect(texte).toContain(`Copie toutes les ${nom} de ce trimestre dans ton trimestre actif`);
            expect(texte).toContain('restent intactes');
        }
        expect(bulle('import-trimestre-tout-grilles')).toContain('avec leurs rétroactions');
        expect(bulle('import-trimestre-tout-pratiques')).toContain('Vérifie ensuite leur échelle et leur grille.');
    });
});

describe('Bloc 3 — les bulles de l\'assistant de pratique', () => {
    const liste = (() => {
        const m = WIZARD.match(/const ETAPES_AVEC_INFOBULLE = \[([^\]]+)\]/);
        expect(m).toBeTruthy();
        return [...m[1].matchAll(/'([\w-]+)'/g)].map((x) => x[1]);
    })();

    it('onze étapes, chacune avec sa bulle au catalogue, et aucune bulle orpheline', () => {
        expect(liste).toHaveLength(11);
        for (const id of liste) {
            expect(WIZARD, `l'étape ${id} n'existe plus`).toContain(`id: '${id}',`);
            bulle('wizard-etape-' + id);
        }
        const auCatalogue = [...HOVER.matchAll(/'wizard-etape-([\w-]+)':/g)].map((m) => m[1]);
        expect(auCatalogue.sort()).toEqual([...liste].sort());
    });

    it('le titre de l\'étape porte la bulle, et la perd sur une étape sans bulle', () => {
        const affichage = tranche(WIZARD, 'function afficherEtapeWizardV2(etapeId) {', 'mettreAJourProgression();');
        expect(affichage).toContain("titreEl.setAttribute('data-tooltip', 'wizard-etape-' + etapeId)");
        expect(affichage).toContain("titreEl.removeAttribute('data-tooltip')");
    });

    it('« Approche d\'évaluation » : la phrase corrigée par Cowork, et l\'étape suivante est bien le portfolio', () => {
        expect(bulle('wizard-etape-approche-evaluation')).toBe('En standards, la note se construit sur le portfolio ; à l’étape suivante, tu choisis quels artefacts comptent.');
        expect(HOVER).not.toContain('pas la moyenne de tous les essais');
        const approche = tranche(WIZARD, "id: 'approche-evaluation',", "\n    },");
        expect(approche).toMatch(/suivant: \(\) => 'config-portfolio'/);
    });
});

describe('Blocs 6, 7, 8 — le profil et le réglage décrivent, ils ne prescrivent pas', () => {
    it('6c : la ligne des équipes, telle quelle', () => {
        expect(lire('js/equipes.js')).toContain('`Au plus une personne de plus par équipe : il en reste trop, une équipe sera de ${reste}.`');
    });

    it('6b : aucun chiffre de repère dans les bulles du dégradé', () => {
        expect(HOVER).not.toMatch(/'tdb-zones-couleur':/);
        expect(bulle('tdb-observer')).not.toMatch(/\d/);
    });

    it('7 : les recommandations de la carte « Contexte d\'apprentissage » parlent au conditionnel', () => {
        const q = lire('js/contexte-qualification.js');
        const recos = [...q.matchAll(/recommandation: '((?:[^'\\]|\\.)*)'/g)].map((m) => m[1]);
        expect(recos).toHaveLength(4);
        for (const r of recos) {
            expect(r).toMatch(/^À la lumière de ces données, /);
            expect(r).toMatch(/pourrai(en)?t/);
            expect(r).not.toMatch(/recommandée?s?|requise?|immédiate|[Mm]aintenir|doit|fragile|critique/);
        }
    });

    it('7 bis : la carte Mobilisation n\'affiche plus la décomposition M = (A + C) / 2 (« c\'est abandonné »)', () => {
        const carte = tranche(lire('js/profil-etudiant-sections-affichage.js'), 'function genererSectionMobilisation(da) {', '\nfunction ');
        expect(carte).not.toContain("Décomposition de l'indice M\n");
        expect(carte).not.toMatch(/M = \(A \+ C\) \/ 2 = \(\$\{indices\.A\}/);
    });

    it('7 ter : ni l\'indicateur « Mobilisation (M) », ni l\'indice M lui-même (verdict de Cowork de 16 h 02)', () => {
        const carte = tranche(lire('js/profil-etudiant-sections-affichage.js'), 'function genererSectionMobilisation(da) {', '\nfunction ');
        expect(carte).not.toContain('<span class="profil-indicateur-label">Mobilisation (M)</span>');
        expect(carte).not.toContain('${indices.M}');
        const retour = tranche(lire('js/indices.js'), '    return {\n        A: (A === null) ? null : Math.round(A * 100),', '\n    };');
        expect(retour, 'calculerTousLesIndices rend de nouveau M').not.toMatch(/\bM:/);
        // Les branches de la prose lisent A et C, pas M : `interpreterMobilisation` reste, et a d'autres lecteurs.
        expect(carte).toContain('interpreterMobilisation(A, C)');
    });

    it('8 : le réglage des seuils prend les mots de la table, lus à leur source', () => {
        const reglage = tranche(INDEX, '<label for="v2-seuil-fragile"', '<!-- ╔', { longueurMin: 200 });
        // Les trois champs fixent le bas des paliers 2, 1 et 0 (70, 80, 85 par défaut).
        expect(reglage).toContain(`>« ${MOTS.presence[2]} » à partir de</label>`);
        expect(reglage).toContain(`>« ${MOTS.presence[1]} » à partir de</label>`);
        expect(reglage).toContain(`>« ${MOTS.presence[0]} » à partir de</label>`);
        expect(reglage).not.toMatch(/Fragile si|Acceptable si|Bon si/);
        expect(bulle('depist-seuil-fragile')).toContain(`« ${MOTS.remise[2]} »`);
        expect(bulle('depist-seuil-acceptable')).toContain(`« ${MOTS.remise[1]} »`);
        expect(bulle('depist-seuil-bon')).toContain(`« ${MOTS.remise[0]} »`);
        for (const cle of ['depist-seuil-fragile', 'depist-seuil-acceptable', 'depist-seuil-bon']) {
            expect(bulle(cle), cle).not.toMatch(/Nécessite|préoccupante|satisfaisante|À surveiller/);
        }
    });
});

describe('Bloc 9 — les deux étapes vides ont quitté l\'assistant, leurs valeurs restent', () => {
    it('ni « Nombre d\'évaluations » ni « Tes seuils personnels », ni une route vers elles', () => {
        expect(WIZARD).not.toMatch(/id: 'nb-evaluations'|id: 'seuils-personnels'/);
        expect(WIZARD).not.toMatch(/=> 'nb-evaluations'|=> 'seuils-personnels'|return 'nb-evaluations'|'seuils-personnels';/);
        expect(WIZARD).not.toMatch(/seuilVaBien|seuilDifficulte|seuilGrandeDifficulte|r\.nbEvaluationsPrevues/);
    });

    it('une pratique rouverte garde ses seuils et son nombre d\'évaluations (rien n\'est effacé)', () => {
        const champs = WIZARD.match(/const CHAMPS_EDITES_PAR_L_ASSISTANT = \[([^\]]+)\]/)[1];
        expect(champs).not.toMatch(/'seuils'|'nbEvaluationsPrevues'/);
    });
});
