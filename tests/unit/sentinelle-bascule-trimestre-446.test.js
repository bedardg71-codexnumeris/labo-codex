import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// =======================================================================
// SENTINELLE #446 — changer de trimestre ne doit rien laisser derrière
// =======================================================================
//
// Terrain du 10 août 2026, deux captures de Grégoire : trimestre actif
// « Automne 2026 », et pourtant la barre de progression du Cadre affichait
// « 2 GC · 51 étud. » (les chiffres de H26, qui n'existent pas en A26) et
// le formulaire proposait un groupe-cours « H2026-601-101-MQ-00008 ».
//
// Trois défauts distincts, corrigés ensemble :
//   A. le handler de bascule ne rappelait NI la barre de progression NI le
//      sélecteur des groupes-cours — les deux lisent pourtant les bonnes
//      clés namespacées : le DOM gardait simplement le rendu d'avant ;
//   B. quand le pointeur `groupeCoursActif` devient invalide (il est GLOBAL,
//      donc invalidé à CHAQUE bascule), l'auto-sélection prenait
//      `groupesCours[0]` — le premier de la LISTE. Chez Grégoire 00002
//      précède 00008 : son groupe actif basculait en silence, et tous les
//      écrans de suivi avec lui ;
//   C. quatre tris plantaient sur un `nom` absent (import CSV incomplet),
//      dont un JUSTE APRÈS un changement de groupe-cours — donc sur le
//      chemin de la bascule. Un champ vide chez UN étudiant coûtait l'écran
//      de tout le groupe, et le tirage au sort échouait en silence
//      (« Uncaught (in promise) »).
//
// Vérifié au navigateur avant d'écrire ce fichier : H26 → A26 vide bien les
// deux surfaces, et le retour restaure 00008 (pas 00002), zéro erreur page.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const lire = (f) => readFileSync(path.join(racine, f), 'utf8');
const liste = lire('js/trimestre-v2-liste.js');
const orchestre = lire('js/trimestre-v2-orchestre.js');
const trimestres = lire('js/trimestres.js');

describe('#446 · A — la bascule redessine les deux surfaces du Cadre', () => {
    function corpsHandler() {
        const debut = liste.indexOf('function changerTrimestreActifV2(');
        expect(debut).toBeGreaterThan(-1);
        const fin = liste.indexOf('\nfunction ', debut + 10);
        return liste.slice(debut, fin === -1 ? undefined : fin);
    }

    it('la barre de progression est rafraîchie', () => {
        expect(corpsHandler()).toContain('mettreAJourBarreContexte()');
    });

    it('le sélecteur des groupes-cours est repeuplé', () => {
        expect(corpsHandler()).toContain('populerDropdownGroupeCoursV2()');
    });

    it('le formulaire ET la carte de résumé sont remis à vide', () => {
        const corps = corpsHandler();
        expect(corps).toContain('afficherEtatVideGroupeCoursV2()');
        expect(corps).toContain('mettreAJourCarteResumeGroupeCoursV2(null)');
    });

    it('⚠⚠ tout ce que le handler appelle d’un AUTRE module est atteignable', () => {
        // Le défaut qui a coûté deux correctifs muets (#332 puis #444) :
        // `js/trimestre-v2-groupes-cours.js` est une IIFE. Une fonction qui n'y
        // est pas exportée sur `window` n'existe pas pour l'appelant — et comme
        // l'appel est gardé par `typeof … === 'function'`, la garde sort en
        // SILENCE. Le correctif #332, livré pour réinitialiser le formulaire au
        // changement de trimestre, n'a donc jamais tourné une seule fois.
        //
        // On vérifie ici l'EXPORT réel, pas la présence de l'appel : c'est le
        // maillon qui manquait, et il ne se voit pas à la lecture de l'appelant.
        const gc = lire('js/trimestre-v2-groupes-cours.js');
        for (const nom of ['afficherEtatVideGroupeCoursV2',
                           'mettreAJourCarteResumeGroupeCoursV2',
                           'populerDropdownGroupeCoursV2']) {
            expect(gc, `${nom} est appelée depuis un autre module mais pas exportée`)
                .toMatch(new RegExp('window\\.' + nom + '\\s*='));
        }
    });

    it('ces appels passent par `window.` — pas par la chaîne de scope', () => {
        // Un appel non préfixé résout par la chaîne de scope globale : il MARCHE
        // tant que l'export existe, et redevient muet le jour où on le retire.
        // Le préfixe rend la dépendance explicite et le `typeof` honnête.
        const corps = corpsHandler();
        for (const nom of ['afficherEtatVideGroupeCoursV2',
                           'mettreAJourCarteResumeGroupeCoursV2',
                           'populerDropdownGroupeCoursV2']) {
            expect(corps, nom + ' appelée sans window.').toContain('window.' + nom);
        }
    });
});

describe('#446 · B — l’auto-sélection respecte le groupe MARQUÉ actif', () => {
    it('elle cherche `actif` avant de se rabattre sur le premier de la liste', () => {
        const i = orchestre.indexOf('const gcActifValide');
        expect(i).toBeGreaterThan(-1);
        // ⚠ Les COMMENTAIRES sont retirés avant de chercher. Sans ça, la
        // note qui explique le correctif — elle cite forcément
        // « groupesCours[0] », l'ancien comportement — était trouvée AVANT le
        // code, et l'ordre mesuré était l'inverse du vrai. Quatrième fois dans
        // la journée qu'une sonde tombe sur une mention plutôt que sur du code.
        const zone = orchestre.slice(i, i + 1600).replace(/\/\/[^\n]*/g, '');
        // Le repli sur le premier de la liste reste légitime — un trimestre
        // peut n'avoir aucun groupe marqué — mais il doit venir APRÈS.
        const iMarque = zone.indexOf('groupesCours.find(gc => gc && gc.actif)');
        const iPremier = zone.indexOf('groupesCours[0]');
        expect(iMarque, 'le groupe marqué actif n’est plus cherché (#446)').toBeGreaterThan(-1);
        expect(iPremier).toBeGreaterThan(-1);
        expect(iMarque).toBeLessThan(iPremier);
    });

    it('c’est bien la cible retenue qui est activée, pas le premier', () => {
        const i = orchestre.indexOf('const gcMarqueActif');
        expect(i).toBeGreaterThan(-1);
        const zone = orchestre.slice(i, i + 400);
        expect(zone).toMatch(/const cible = gcMarqueActif \|\| groupesCours\[0\]/);
        expect(zone).toContain('changerGroupeCoursActifV2(cible.id)');
    });

    it('un SEUL mécanisme d’activation — trimestres.js n’en pose pas un second', () => {
        // Zéro-dette : deux chemins d'activation divergeraient au premier
        // patch. La restauration vit dans l'auto-sélection, et là seulement.
        expect(trimestres).not.toContain('changerGroupeCoursActifV2');
    });
});

describe('#446 · C — un nom manquant ne coûte plus un écran', () => {
    const sites = [
        ['js/etudiants.js', 'String(a.nom || \'\').toLowerCase()'],
        ['js/trimestre-v2-orchestre.js', 'String(a.nom || \'\').localeCompare'],
        ['js/boite-outils.js', 'String(a.nom || \'\').localeCompare']
    ];
    for (const [fichier, motif] of sites) {
        it(`${fichier} garde son tri contre un champ absent`, () => {
            expect(lire(fichier)).toContain(motif);
        });
    }

    it('le comparateur générique de la liste normalise les DEUX côtés', () => {
        // `valeurB` peut être undefined même quand `valeurA` est une chaîne :
        // tester le seul type de A laissait passer localeCompare(undefined).
        const etudiants = lire('js/etudiants.js');
        expect(etudiants).toMatch(
            /typeof valeurA === 'string' \|\| typeof valeurB === 'string'/
        );
        // #749 lot 2 (11 sept. 2026) : le comparateur prend depuis l'option `numeric` (DA, groupe) — la garde #446 reste.
        expect(etudiants).toContain("String(valeurA ?? '').localeCompare(String(valeurB ?? ''),");
    });
});
