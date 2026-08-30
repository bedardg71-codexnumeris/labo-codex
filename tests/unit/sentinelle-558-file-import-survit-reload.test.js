import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');

// #558 (28 août 2026) — trois défauts d'un même mécanisme, la file d'attente
// d'import, livrée le jour même (#496-#507) et jamais éprouvée au terrain.
//
// B1 : le filtre des fichiers importés ne persistait pas. Au rechargement,
//      `restaurerFileDAttente` ressuscitait des fichiers déjà importés, blob nul
//      → fantômes « à re-déposer » et risque de ré-import en doublon.
//      Aggravé : le cas « remplacer » jetait l'ancien fichier À LA CORBEILLE
//      AVANT l'`await` de l'import ; si l'import échouait, l'utilisateur perdait
//      l'ancien ET le nouveau, avec pour seule trace un `console.error`.
// B2 : le choix « Rés. max. » ne vivait que dans le DOM. Le select est re-généré
//      à chaque rendu avec `selected` codé en dur sur 250 : tout autre choix était
//      écrasé en silence, alors que la valeur sert réellement (uniformisation DPI).
// B3 : `persisterFileDAttente` omettait six champs pourtant CONSOMMÉS ailleurs.
//      Le plus coûteux : `productionIdParFichier`, sur lequel repose la protection
//      #313 — inopérante après reload.
//
// Portée : sentinelle STATIQUE. Le round-trip réel passe par `sessionStorage`,
// que le sandbox de `chargerScript` fournit lui-même et qu'on ne peut pas
// pré-remplir depuis le test. Ce qu'elle verrouille, ce sont les invariants qui
// rendent les trois défauts impossibles — dont la SYMÉTRIE persister/restaurer,
// le vrai piège : un champ ajouté d'un seul côté ne sert à rien.
//
// Break-tests (à faire rougir AVANT de faire confiance à cette sentinelle) :
//   1. retirer le `persisterFileDAttente()` qui suit le filtre → B1 rougit.
//   2. retirer un champ d'un SEUL des deux mappings → la symétrie rougit.
//   3. remettre `<option value="250" selected>` en dur → B2 rougit.
//   4. remettre `deplacerEnCorbeille` avant l'`await importerFichier` → l'ordre
//      du remplacement rougit.

function sansCommentaires(txt) {
    return txt.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
}

function corpsDe(nomFonction, source) {
    const debut = source.indexOf('function ' + nomFonction + '(');
    if (debut === -1) return null;
    const fin = source.indexOf('\n    }', debut);
    return sansCommentaires(source.slice(debut, fin));
}

const srcImport = readFileSync(path.join(racineProjet, 'js', 'travaux-import.js'), 'utf8');
const srcUI = readFileSync(path.join(racineProjet, 'js', 'travaux-ui.js'), 'utf8');

// Les six de l'énoncé, plus format11x17 : même famille que skipBalance, même
// consommateur (le pipeline batch), même perte au reload.
const CHAMPS_B3 = [
    'productionIdParFichier', 'modeImport', 'dateFichier',
    'nomDocumentLibre', 'operations', 'skipBalance', 'format11x17'
];

describe('#558 B1 · le retrait des fichiers importés est persisté', () => {
    it('le filtre des importés est suivi de persisterFileDAttente()', () => {
        const nu = sansCommentaires(srcImport);
        const posFiltre = nu.indexOf("fichiersEnAttente.filter(f => f.statut !== 'importe')");
        expect(posFiltre, 'le filtre des importés doit exister').toBeGreaterThan(-1);

        // Fenêtre bornée par le `return` de CETTE fonction, pas une longueur
        // arbitraire. Une fenêtre de 400 caractères attrapait le
        // `persisterFileDAttente()` de la fonction SUIVANTE et restait verte
        // quand on retirait celui-ci — faux vert trouvé par le break-test 1.
        const posReturn = nu.indexOf('return { importes, erreurs', posFiltre);
        expect(posReturn, 'le return de la fonction doit suivre le filtre').toBeGreaterThan(posFiltre);
        const entreFiltreEtReturn = nu.slice(posFiltre, posReturn);
        expect(entreFiltreEtReturn, 'le filtre doit être persisté avant de rendre la main')
            .toContain('persisterFileDAttente()');
    });
});

describe('#558 B1 aggravé · le remplacement ne détruit plus avant de savoir', () => {
    // #604 (30 août 2026) — MÊME FAUX PAS QUE LE TEST DU FILTRE PLUS HAUT, à
    // l'autre bout du fichier : la fenêtre était bornée par une LONGUEUR (700),
    // pas par la fin de la branche. `sansCommentaires` laisse les lignes vides
    // des commentaires retirés ; documenter le défaut #604 au-dessus du code a
    // donc suffi à pousser `deplacerEnCorbeille` hors de la fenêtre, et les
    // deux tests sont passés au rouge sans que le code ait perdu quoi que ce
    // soit. Une fenêtre trop courte rend un faux ROUGE comme une fenêtre trop
    // longue rendait un faux VERT — dans les deux cas, elle ne mesure pas la
    // branche. Bornée par la branche suivante, elle la mesure.
    const brancheRemplacer = () => {
        const nu = sansCommentaires(srcUI);
        const debut = nu.indexOf("choix === 'remplacer'");
        expect(debut, 'le cas « remplacer » doit exister').toBeGreaterThan(-1);
        const fin = nu.indexOf("choix === 'additionnel'", debut);
        expect(fin, 'la branche suivante doit borner celle-ci').toBeGreaterThan(debut);
        return nu.slice(debut, fin);
    };

    it('l’import précède la mise en corbeille', () => {
        const bloc = brancheRemplacer();

        const posImport = bloc.indexOf('await travauxImport.importerFichier');
        const posCorbeille = bloc.indexOf('deplacerEnCorbeille');
        expect(posImport, "l'import doit être dans le bloc").toBeGreaterThan(-1);
        expect(posCorbeille, 'la mise en corbeille doit être dans le bloc').toBeGreaterThan(-1);
        expect(posCorbeille, "la corbeille doit venir APRÈS l'import réussi")
            .toBeGreaterThan(posImport);
    });

    it('l’échec du remplacement est DIT, pas seulement journalisé', () => {
        expect(brancheRemplacer()).toContain('notifications.erreur');
    });
});

describe('#558 B2 · le choix « Rés. max. » survit au re-rendu', () => {
    it('plus aucun `selected` codé en dur dans le select DPI', () => {
        const nu = sansCommentaires(srcUI);
        const posSelect = nu.indexOf('id="pipeline-opt-dpi"');
        expect(posSelect, 'le select DPI doit exister').toBeGreaterThan(-1);
        // Le markup est construit juste avant l'insertion de l'id ; on prend
        // large des deux côtés pour couvrir la génération des options.
        const zone = nu.slice(Math.max(0, posSelect - 600), posSelect + 600);
        expect(zone, 'un `selected` en dur écraserait le choix mémorisé')
            .not.toMatch(/<option value="\d+"\s+selected>/);
        expect(zone).toContain('dpiPipelineChoisi');
    });

    it('le choix est capté et mémorisé au changement', () => {
        const corps = corpsDe('mettreAJourPreviewsPipeline', srcUI);
        expect(corps, 'mettreAJourPreviewsPipeline doit exister').not.toBe(null);
        expect(corps).toContain('dpiPipelineChoisi =');
        expect(corps).toContain('travaux-pipeline-dpi');
    });
});

describe('#558 B3 · la file persistée porte tout ce qui est consommé', () => {
    const corpsPersister = corpsDe('persisterFileDAttente', srcImport);
    const corpsRestaurer = corpsDe('restaurerFileDAttente', srcImport);

    it('les deux fonctions existent et sont lisibles', () => {
        expect(corpsPersister).not.toBe(null);
        expect(corpsRestaurer).not.toBe(null);
    });

    it.each(CHAMPS_B3)('« %s » est ÉCRIT par persisterFileDAttente', (champ) => {
        expect(corpsPersister).toContain(champ);
    });

    it.each(CHAMPS_B3)('« %s » est RELU par restaurerFileDAttente (symétrie)', (champ) => {
        // Le vrai piège de B3 : un champ ajouté d'un seul côté ne sert à rien.
        // Les deux mappings sont explicites, donc les deux doivent bouger.
        expect(corpsRestaurer).toContain(champ);
    });

    it('contrôle : les drapeaux #314 déjà persistés le sont toujours', () => {
        for (const champ of ['productionIdParLea', 'estReprise']) {
            expect(corpsPersister).toContain(champ);
            expect(corpsRestaurer).toContain(champ);
        }
    });
});

/* -------------------------------------------------------------------------
   #610 (S4) — la file persistée survit à une interruption EN COURS de lot
   ---------------------------------------------------------------------- */

// #558 B1 avait fermé la persistance du retrait — mais APRÈS le lot seulement.
// L'audit du 30 août (constat S1) mesure le trou restant : dans `importerTous`,
// `fichier.statut = 'importe'` n'était persisté qu'une fois la boucle terminée.
// 40 photos, l'iPad en veille au 25e fichier : au retour, la file persistée est
// encore celle d'avant l'import et affiche 40 fichiers « à re-déposer », alors
// que 25 sont déjà en base. L'enseignant re-dépose, confirme, et double 25
// fichiers sans qu'un mot le prévienne.
//
// Et #610 (constat S2) ajoute `tailleOriginale` au round-trip : la taille du
// `File` DÉPOSÉ, distincte de `tailleFichier` qui bouge à la compression et à
// la conversion HEIC. Un champ ajouté d'un seul côté ne servirait à rien —
// c'est la symétrie que B3 verrouille déjà, étendue au champ neuf.

describe('#610 · l\'interruption en cours de lot ne fabrique plus de doublons', () => {
    const corpsImporterTous = corpsDe('importerTous', srcImport);

    it('importerTous est lisible', () => {
        expect(corpsImporterTous).not.toBe(null);
    });

    it('la file est persistée DANS la boucle, pas seulement après', () => {
        // La boucle se referme sur `onProgression`, dernier geste de l'itération.
        // Le `persisterFileDAttente()` du lot entier vient APRÈS le filtre des
        // importés : c'est celui de #558 B1, et il ne suffit pas.
        const iBoucle = corpsImporterTous.indexOf('onProgression(i + 1, total)');
        const iFiltre = corpsImporterTous.indexOf("filter(f => f.statut !== 'importe')");
        expect(iBoucle, 'boucle de progression introuvable').toBeGreaterThan(-1);
        expect(iFiltre, 'filtre de fin de lot introuvable').toBeGreaterThan(-1);

        const dansLaBoucle = corpsImporterTous.slice(iBoucle, iFiltre);
        expect(dansLaBoucle).toContain('persisterFileDAttente()');
    });

    it('le persist de fin de lot (#558 B1) est TOUJOURS là', () => {
        // Les deux sont nécessaires : l'un sauve l'interruption, l'autre le
        // retrait final. Ce test empêche de remplacer l'un par l'autre.
        const iFiltre = corpsImporterTous.indexOf("filter(f => f.statut !== 'importe')");
        expect(corpsImporterTous.slice(iFiltre)).toContain('persisterFileDAttente()');
    });
});

describe('#610 · tailleOriginale traverse le round-trip', () => {
    const corpsPersister = corpsDe('persisterFileDAttente', srcImport);
    const corpsRestaurer = corpsDe('restaurerFileDAttente', srcImport);
    const corpsPreparer = corpsDe('preparerFichier', srcImport);

    it('preparerFichier la POSE', () => {
        expect(corpsPreparer).toContain('tailleOriginale');
    });

    it('persisterFileDAttente l\'ÉCRIT', () => {
        expect(corpsPersister).toContain('tailleOriginale');
    });

    it('restaurerFileDAttente la RELIT (symétrie)', () => {
        expect(corpsRestaurer).toContain('tailleOriginale');
    });

    it('le rattachement compare tailleOriginale, JAMAIS tailleFichier', () => {
        // Le piège du correctif : `tailleFichier` est la taille APRÈS
        // préparation. Un HEIC converti en JPEG n'a plus la taille du fichier
        // déposé — comparer `tailleFichier` échouerait sur toutes les photos
        // d'iPhone, et le re-dépôt n'y rattacherait plus rien.
        const corpsReattacher = corpsDe('reattacherBlobs', srcImport);
        expect(corpsReattacher).toContain('tailleOriginale');
        expect(corpsReattacher).not.toContain('f.tailleFichier');
    });
});
