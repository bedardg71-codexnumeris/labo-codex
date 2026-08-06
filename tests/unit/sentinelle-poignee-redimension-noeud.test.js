import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Poignée de redimensionnement des blocs (exercice d'alignement 601-101,
// 6 août 2026). Deux comportements, selon la nature du bloc :
//
//   FEUILLE (option A)    — largeur ET hauteur libres, mémorisées telles quelles.
//   CONTENEUR (option B)  — largeur PLANCHER seulement ; la hauteur, et la
//                           largeur au-delà du plancher, restent calculées par
//                           reLayoutConteneur depuis les enfants.
//
// Pourquoi un plancher et non une largeur fixe : le conteneur doit pouvoir
// continuer de grandir quand son contenu l'exige. Poser style.width sur un
// conteneur serait vain — la disposition l'écraserait au passage suivant.
// L'option B a été retenue le 6 août après constat terrain : le besoin réel
// était d'élargir une LEÇON dont le titre courait sur deux lignes, or les
// leçons sont des conteneurs.
//
// Retrait joint : les boutons « Copier » de la vue calendrier, devenus inutiles
// (Grégoire est le seul utilisateur et ne s'en sert pas — l'export sera
// repensé).

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const carte = readFileSync(path.join(racineProjet, 'js', 'planification-carte.js'), 'utf8');
const organisateur = readFileSync(path.join(racineProjet, 'js', 'organisateur.js'), 'utf8');
const css = readFileSync(path.join(racineProjet, 'styles.css'), 'utf8');

describe('Poignée · rendue sur les feuilles ET les conteneurs, différemment', () => {
    it('la poignée existe dans le rendu et le CSS', () => {
        expect(carte).toContain('planif-noeud-poignee');
        expect(css).toContain('.planif-noeud-poignee');
    });

    it('le conteneur reçoit la variante « largeur seulement »', () => {
        expect(carte).toContain('planif-noeud-poignee--largeur');
        expect(css).toMatch(/\.planif-noeud-poignee--largeur\s*\{[^}]*cursor:\s*ew-resize/);
    });

    it('la vue globale COMPACTE n’en porte pas (les séquences y sont résumées)', () => {
        const brancheCompacte = carte.slice(
            carte.indexOf('if (estCompact) {'),
            carte.indexOf('} else if (estConteneur) {')
        );
        expect(brancheCompacte).not.toContain('planif-noeud-poignee');
    });

    it('la taille libre (largeur ET hauteur) reste réservée aux feuilles', () => {
        expect(carte).toMatch(/if \(!estConteneur && n\.metadata[\s\S]{0,320}metadata\.largeur\) el\.style\.width/);
        // Sur un conteneur, on ne mémorise QUE le plancher.
        expect(carte).toMatch(/if \(!estConteneur\) \{[\s\S]{0,220}metadata\.hauteur = Math\.round/);
    });
});

describe('Poignée · option B, la largeur plancher des conteneurs', () => {
    it('le plancher est posé en métadonnée, pas en style inline', () => {
        // Poser style.width sur un conteneur serait vain : reLayoutConteneur
        // l'écraserait au passage suivant.
        expect(carte).toMatch(/if \(estConteneur\)[\s\S]{0,400}metadata\.largeurMin = Math\.round\(w\)/);
        expect(carte).toMatch(/metadata\.largeurMin = Math\.round\(w\);[\s\S]{0,120}reLayoutConteneur\(id\)/);
    });

    it('les TROIS fonctions de disposition respectent le plancher', () => {
        expect(carte).toContain('function largeurPlancher');
        const usages = carte.match(/largeurPlancher\(conteneur\)/g) || [];
        expect(usages).toHaveLength(3);
    });

    it('c’est un PLANCHER, pas une largeur figée', () => {
        // Math.max : le conteneur continue de grandir si son contenu l'exige.
        expect(carte).toMatch(/Math\.max\(newW, largeurPlancher\(conteneur\)\)/);
        expect(carte).toMatch(/Math\.max\(maxW \+ PADDING \* 2, largeurPlancher\(conteneur\)\)/);
    });

    it('le double-clic efface aussi le plancher et redispose le conteneur', () => {
        expect(carte).toMatch(/delete donnees\.metadata\.largeurMin/);
        expect(carte).toMatch(/dblclick[\s\S]{0,600}if \(estConteneur\) reLayoutConteneur\(id\)/);
    });
});

describe('Poignée · mécanique', () => {
    it('le glissement n’enclenche pas le déplacement du bloc', () => {
        expect(carte).toMatch(/poignee\.addEventListener\('mousedown'[\s\S]{0,120}stopPropagation/);
    });

    it('les deltas sont divisés par le zoom de la carte', () => {
        // Sans ça, la poignée dériverait du curseur dès qu'on n'est plus à 100 %.
        expect(carte).toMatch(/var z = etat\.zoom \|\| 1;/);
        expect(carte).toMatch(/largeurDepart \+ \(ev\.clientX - departX\) \/ z/);
        expect(carte).toMatch(/hauteurDepart \+ \(ev\.clientY - departY\) \/ z/);
    });

    it('la taille est bornée par un minimum', () => {
        expect(carte).toMatch(/Math\.max\(LARGEUR_MIN_NOEUD/);
        expect(carte).toMatch(/Math\.max\(HAUTEUR_MIN_NOEUD/);
    });

    it('la taille est persistée sur le nœud, pas seulement dans le DOM', () => {
        expect(carte).toMatch(/donnees\.metadata\.largeur = Math\.round\(el\.offsetWidth\)/);
        expect(carte).toMatch(/donnees\.metadata\.hauteur = Math\.round\(el\.offsetHeight\)/);
    });

    it('le parent est redisposé après coup (il se dimensionne sur ses enfants)', () => {
        expect(carte).toMatch(/surRelachement[\s\S]{0,600}reLayoutConteneur\(donnees\.parent\)/);
    });

    it('le double-clic rend la main à la taille automatique', () => {
        // Sans retour possible, un bloc retaillé cesserait définitivement de
        // suivre son contenu.
        expect(carte).toMatch(
            /poignee\.addEventListener\('dblclick'[\s\S]{0,400}delete donnees\.metadata\.largeur/
        );
        expect(carte).toMatch(/dblclick[\s\S]{0,500}el\.style\.width = '';/);
    });

    it('le plafond de largeur (max-width 240 px) est libéré quand on retaille', () => {
        // Sans ça, `el.style.width = 400px` restait plafonné à 240 : la poignée
        // semblait ne rien faire au-delà.
        expect(css).toContain('.planif-noeud--taille-libre');
        expect(css).toMatch(/\.planif-noeud--taille-libre\s*\{[^}]*max-width:\s*none/);
        // Posée pendant le glissement ET au rendu d'un bloc déjà retaillé.
        const poses = carte.match(/classList\.add\('planif-noeud--taille-libre'\)/g) || [];
        expect(poses.length).toBeGreaterThanOrEqual(2);
        // Et retirée par le retour à la taille automatique.
        expect(carte).toMatch(/classList\.remove\('planif-noeud--taille-libre'\)/);
    });

    it('la poignée passe au-dessus des ports de liaison', () => {
        // Les ports sont en z-index 20 ; le coin doit appartenir à la poignée.
        expect(css).toMatch(/\.planif-noeud-poignee\s*\{[\s\S]*?z-index:\s*21/);
    });

    it('les écouteurs de document sont retirés au relâchement', () => {
        expect(carte).toMatch(/removeEventListener\('mousemove', surDeplacement\)/);
        expect(carte).toMatch(/removeEventListener\('mouseup', surRelachement\)/);
    });
});

describe('Vue calendrier · les boutons « Copier » sont retirés partout', () => {
    it('plus aucun bouton ni fonction de copie', () => {
        expect(organisateur).not.toContain('ajouterBoutonsCopier');
        expect(organisateur).not.toContain('org-cal-btn-copier');
        expect(organisateur).not.toContain('copierDansPressePapiers');
    });

    it('les extracteurs de texte qui ne servaient qu’à eux sont retirés aussi', () => {
        expect(organisateur).not.toContain('extraireTexteLecon');
        expect(organisateur).not.toContain('extraireTexteSequence');
    });

    it('le CSS ne garde pas de règle orpheline', () => {
        expect(css).not.toContain('org-cal-btn-copier');
    });

    it('l’export Markdown de la modale, lui, est INTACT (autre fonction)', () => {
        expect(organisateur).toContain('copierExportMD');
    });
});
