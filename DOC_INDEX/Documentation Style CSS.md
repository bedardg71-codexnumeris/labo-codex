Voici la documentation complète du fichier styles.css :

  ---
  # Documentation technique - styles.css

  **Date de création** : Octobre 2025
  **Dernière modification** : 24 octobre 2025
  **Version** : Beta 0.55
  **Lignes de code** : 1977 lignes
  **Convention** : 100% français

  ---

  ## 1. Vue d'ensemble

  Le fichier `styles.css` contient l'ensemble des styles de l'application de
  monitorage pédagogique. Il définit le **système de design** complet avec :
  - Palette de couleurs cohérente (bleus, couleurs d'accent, indicateurs de
  risque)
  - Variables CSS pour une personnalisation facile
  - Composants réutilisables (cartes, boutons, tableaux, badges)
  - 3 thèmes visuels (Normal, Simulation, Anonymisation)
  - Design responsive (desktop, tablette, mobile)
  - Animations et transitions fluides

  **Philosophie de design** :
  - **Accessibilité** : Contraste élevé, tailles de police lisibles
  - **Cohérence** : Variables CSS pour couleurs et espacements
  - **Performance** : Transitions CSS uniquement, pas de JavaScript pour l'UI
  - **Responsive** : Mobile-first avec media queries

  **Convention de nommage** : 100% français pour toutes les classes CSS (ex:
  `.carte`, `.btn-principal`, `.grille-statistiques`)

  ---

  ## 2. Architecture et organisation

  ### 2.1 Structure du fichier

  Le fichier est organisé en **17 sections** clairement délimitées :

  1. VARIABLES CSS (lignes 8-91)
    - Palette de couleurs
    - Navigation
    - Boutons
    - Indicateurs de risque
    - Espacement
    - Calendrier
  2. RESET ET BASE (lignes 93-111)
    - Reset universel
    - Styles body
  3. CONTENEUR PRINCIPAL (lignes 113-124)
    - Conteneur max-width 1400px
  4. EN-TÊTE (lignes 126-269)
    - Logo et métadonnées
    - Titre central
    - Sélecteur de mode
    - Responsive
  5. FORMULAIRE GROUPE RESPONSIVE (lignes 271-297)
    - Grille adaptative
  6. LIENS DANS L'EN-TÊTE (lignes 299-331)
    - Liens logo et site
  7. NAVIGATION PRINCIPALE (lignes 333-368)
    - Boutons de section
  8. SOUS-NAVIGATION (lignes 370-418)
    - Boutons de sous-section
  9. CONTENU PRINCIPAL (lignes 420-426)
    - Padding et min-height
  10. SÉLECTEUR DE MODE (lignes 428-448)
    - Animation fadeIn
  11. SECTIONS ET SOUS-SECTIONS (lignes 450-487)
    - Affichage/masquage
    - Animation apparition
  12. CARTES (lignes 489-700)
    - Cartes génériques
    - Cartes d'items
    - Badges et statistiques
  13. GRILLES ET STATISTIQUES (lignes 702-775)
    - Cartes statistiques
    - Cartes métriques
  14. TABLEAUX (lignes 777-806)
    - Styles tableaux standards
  15. ENCADRÉ DE DATE - ÉTATS (lignes 808-938)
    - États de validation
    - Codes couleur saisie heures
  16. BADGES DE RISQUE (lignes 940-985)
    - 7 niveaux de risque
  17. FORMULAIRES (lignes 987-1027)
    - Inputs et labels
  18. BOUTONS (lignes 1029-1101)
    - 6 types de boutons
  19. MODAUX (lignes 1103-1128)
    - Overlay et contenu
  20. LISTES D'ÉLÉMENTS SAUVEGARDÉS (lignes 1130-1178)
    - Éléments sauvegardés
  21. RÉTROACTIONS (lignes 1180-1200)
    - Rétroactions critères
  22. NOTIFICATIONS (lignes 1202-1235)
    - Notifications succès
  23. UTILITAIRES (lignes 1237-1274)
    - Classes utilitaires
  24. CALENDRIER (lignes 1276-1297)
    - Styles spéciaux calendrier
  25. IMPRESSION (lignes 1299-1331)
    - Styles pour @print
  26. RESPONSIVE (lignes 1333-1399)
    - Media queries mobile
  27. THÈMES PAR MODE (lignes 1401-1472)
    - Normal, Simulation, Anonymisation

  ### 2.2 Principes d'organisation

  **Ordre de spécificité** :
  1. Variables globales (`:root`)
  2. Reset universel (`*`)
  3. Éléments de base (`body`)
  4. Composants génériques (`.carte`, `.btn`)
  5. Composants spécifiques (`.item-carte`, `.badge-risque`)
  6. Utilitaires (`.mt-1`, `.text-muted`)
  7. Media queries (responsive)
  8. Thèmes (modes)

  **Délimiteurs de section** :
  ```css
  /* ===============================
     NOM DE LA SECTION
     =============================== */

  ---
  3. Variables CSS (Custom Properties)

  3.1 Palette de couleurs principale

  Bleus (couleurs de base)

  --bleu-principal: #032e5c;      /* Bleu foncé - Titres, navigation */
  --bleu-fonce: #0f1e3a;          /* Bleu très foncé - Dégradés */
  --bleu-moyen: #2a4a8a;          /* Bleu moyen - Accents */
  --bleu-clair: #065dbb;          /* Bleu vif - Boutons principaux */
  --bleu-leger: #6b85b3;          /* Bleu grisé - Bordures */
  --bleu-carte: #9fc5e8;          /* Bleu pâle - Cartes métriques */
  --bleu-pale: #e8f2fd;           /* Bleu très pâle - Fonds */
  --bleu-tres-pale: #f0f8ff;      /* Bleu presque blanc - Fonds */

  Usage :
  - --bleu-principal : Titres, navigation principale, textes importants
  - --bleu-pale / --bleu-tres-pale : Fonds de cartes, statistiques
  - --bleu-clair : Boutons d'action principaux
  - --bleu-leger : Bordures subtiles

  Bleus spéciaux par mode

  --bleu-simulation: #0f1e3a;     /* Mode Simulation */
  --bleu-anonymisation: #1a5266;  /* Mode Anonymisation (sarcelle) */

  Couleurs d'accent

  --orange-accent: #ff6b35;       /* Orange - Bordures actives, accents */
  --vert-pale: #f8fef8;           /* Vert très pâle - Fonds */
  --vert-doux: #b8d4b8;           /* Vert doux - Accents */
  --vert-leger: #2a8a6a;          /* Vert foncé - Succès */

  3.2 Navigation

  Navigation principale

  --nav-bg: #f8f9fa;              /* Fond navigation */
  --nav-normal: #04376f;          /* Texte normal */
  --nav-hover: #3e98f9;           /* Texte au survol */
  --nav-actif: #054a95;           /* Texte actif */
  --nav-bordure-actif: var(--orange-accent);  /* Bordure bouton actif */

  Navigation - États par mode

  --nav-actif-normal: #2a4a8a;         /* Bouton actif mode Normal */
  --nav-actif-simulation: #2a3d5a;     /* Bouton actif mode Simulation */
  --nav-actif-anonymisation: #2a6a7a;  /* Bouton actif mode Anonymisation */

  Sous-navigation

  --sous-nav-bg: #e8f2fd;              /* Fond sous-navigation */
  --sous-nav-normal: #054a95;          /* Texte normal */
  --sous-nav-hover: #3e98f9;           /* Texte au survol */
  --sous-nav-actif: #065dbb;           /* Texte actif */

  Sous-navigation - Fonds par mode

  --sous-nav-bg-normal: #e8f2fd;       /* Fond mode Normal */
  --sous-nav-bg-simulation: #dce8f5;   /* Fond mode Simulation */
  --sous-nav-bg-anonymisation: #e0f0f0; /* Fond mode Anonymisation */

  3.3 Boutons d'action

  --btn-principal: #065dbb;            /* Bleu - Action principale */
  --btn-principal-hover: #054a95;

  --btn-ajouter: #1e5a4a;              /* Vert foncé - Ajouter */
  --btn-ajouter-hover: #165040;

  --btn-modifier: #4a3a6a;             /* Violet - Modifier */
  --btn-modifier-hover: #3a2a5a;

  --btn-confirmer: #1e5a4a;            /* Vert - Confirmer */
  --btn-confirmer-hover: #165040;

  --btn-annuler: #7a5a1a;              /* Brun - Annuler */
  --btn-annuler-hover: #6a4a10;

  --btn-supprimer: #8a2a2a;            /* Rouge - Supprimer */
  --btn-supprimer-hover: #7a1a1a;

  Sémantique :
  - Principal : Action par défaut (ex: "Sauvegarder")
  - Ajouter : Créer un nouvel élément
  - Modifier : Éditer un élément existant
  - Confirmer : Valider une action
  - Annuler : Abandonner une action
  - Supprimer : Supprimer définitivement (danger)

  3.4 Indicateurs de risque (7 niveaux)

  --risque-nul: #065dbb;               /* Bleu - Aucun risque */
  --risque-minimal: #28a745;           /* Vert - Risque minimal */
  --risque-faible: #90EE90;            /* Vert clair - Risque faible */
  --risque-modere: #ffc107;            /* Jaune - Risque modéré */
  --risque-eleve: #fd7e14;             /* Orange - Risque élevé */
  --risque-tres-eleve: #dc3545;        /* Rouge - Risque très élevé */
  --risque-critique: #721c24;          /* Rouge foncé - Risque critique */

  Usage dans le système A-C-P :
  = 85% : --risque-minimal (vert)
  = 70% : --risque-modere (jaune)
  - < 70% : --risque-tres-eleve (rouge)

  3.5 Espacement

  --espacement-petit: 10px;
  --espacement-moyen: 20px;
  --espacement-grand: 30px;

  Utilisation cohérente :
  - Padding de cartes : var(--espacement-moyen)
  - Margin entre sections : var(--espacement-grand)
  - Gap dans grilles : var(--espacement-moyen)

  3.6 Calendrier

  --jour-cours-reel-bg: #e3f2fd;       /* Bleu - Jour de cours réel */
  --reprise-bg: #fff3e0;               /* Orange pâle - Reprise */
  --conge-bg: #ffebee;                 /* Rouge pâle - Congé */
  --planification-bg: #f3e5f5;         /* Violet pâle - Planification */
  --examens-bg: #fce4ec;               /* Rose - Examens */
  --weekend-bg: #f5f5f5;               /* Gris - Weekend */

  ---
  4. Composants principaux

  4.1 Cartes (.carte)

  Carte générique :
  .carte {
      background: white;
      border: 1px solid var(--bleu-pale);
      border-radius: 8px;
      padding: var(--espacement-moyen);
      margin-bottom: var(--espacement-moyen);
      box-shadow: 0 2px 8px rgba(3, 46, 92, 0.05);
  }

  Titre de carte :
  .carte h3 {
      color: var(--bleu-principal);
      font-size: 1.1rem;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid var(--bleu-pale);
  }

  Carte d'item (productions, congés, etc.) :
  .item-carte {
      padding: 12px;
      background: var(--bleu-tres-pale);
      border: 2px solid var(--bleu-leger);
      border-radius: 6px;
      margin-bottom: 10px;
  }

  Structure d'une item-carte :
  - .item-carte-header : En-tête avec titre et actions
  - .item-carte-titre : Titre de l'item
  - .item-carte-actions : Boutons d'action (modifier, supprimer)
  - .item-carte-grille : Grille de champs (2 ou 3 colonnes)
  - .item-carte-footer : Pied avec informations supplémentaires

  4.2 Boutons (.btn-*)

  6 types de boutons :
  .btn-principal      /* Bleu - Action principale */
  .btn-ajouter        /* Vert - Créer */
  .btn-modifier       /* Violet - Éditer */
  .btn-confirmer      /* Vert - Valider */
  .btn-annuler        /* Brun - Annuler */
  .btn-supprimer      /* Rouge - Supprimer */

  État désactivé :
  .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
  }

  Remarque : Les styles :hover utilisent :hover:not(:disabled) pour éviter les effets
  visuels sur les boutons désactivés.

  Groupe de boutons :
  .btn-groupe {
      display: flex;
      gap: 10px;
      margin-top: var(--espacement-moyen);
  }

  Exemple d'utilisation :
  <div class="btn-groupe">
      <button class="btn btn-confirmer">Sauvegarder</button>
      <button class="btn btn-annuler">Annuler</button>
  </div>

  Exemple avec bouton désactivé :
  <button class="btn btn-principal" disabled>
      ← Précédent·e
  </button>

  4.3 Badges de risque (.badge-risque)

  7 niveaux de badges :
  .risque-nul             /* Bleu */
  .risque-minimal         /* Vert */
  .risque-faible          /* Vert clair */
  .risque-modere          /* Jaune */
  .risque-eleve           /* Orange */
  .risque-tres-eleve      /* Rouge */
  .risque-critique        /* Rouge foncé */

  Exemple d'utilisation :
  <span class="badge-risque risque-minimal">85%</span>
  <span class="badge-risque risque-modere">72%</span>
  <span class="badge-risque risque-tres-eleve">45%</span>

  4.4 Statistiques et grilles

  Grille de statistiques :
  .grille-statistiques {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: var(--espacement-moyen);
      margin-bottom: var(--espacement-grand);
  }

  Carte statistique (grande) :
  .carte-statistique {
      background: var(--bleu-pale);
      padding: var(--espacement-moyen);
      text-align: center;
      transition: all 0.2s ease;
  }

  .carte-statistique .valeur {
      font-size: 2.5rem;
      font-weight: bold;
      color: var(--bleu-principal);
  }

  .carte-statistique .label {
      font-size: 0.9rem;
      color: var(--bleu-leger);
      text-transform: uppercase;
  }

  Carte métrique (petite) :
  .carte-metrique {
      background: var(--bleu-carte);
      padding: 12px 15px;
      text-align: center;
      min-width: 120px;
      display: inline-block;
  }

  .carte-metrique strong {
      font-size: 1.4rem;
      color: var(--bleu-principal);
  }

  .carte-metrique span {
      font-size: 0.85rem;
      color: var(--bleu-moyen);
  }

  Exemple d'utilisation :
  <div class="grille-statistiques">
      <div class="carte-metrique">
          <strong>25h</strong>
          <span>Présentes</span>
      </div>
      <div class="carte-metrique">
          <strong>30h</strong>
          <span>Offertes</span>
      </div>
  </div>

  4.5 Tableaux (.tableau)

  Structure :
  .tableau {
      width: 100%;
      border-collapse: collapse;
  }

  .tableau thead {
      background: var(--bleu-pale);
  }

  .tableau th {
      padding: 12px;
      color: var(--bleu-principal);
      border-bottom: 2px solid var(--bleu-leger);
  }

  .tableau td {
      padding: 10px 12px;
      border-bottom: 1px solid var(--bleu-tres-pale);
  }

  .tableau tbody tr:hover {
      background: var(--bleu-tres-pale);
  }

  4.6 Formulaires

  Structure de base :
  .groupe-form {
      margin-bottom: var(--espacement-moyen);
  }

  .groupe-form label {
      display: block;
      color: var(--bleu-principal);
      font-weight: 500;
      margin-bottom: 5px;
  }

  .controle-form {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid var(--bleu-leger);
      border-radius: 4px;
  }

  .controle-form:focus {
      border-color: var(--bleu-clair);
      box-shadow: 0 0 0 3px rgba(6, 93, 187, 0.1);
  }

  Saisie de présences avec codes couleur :
  input.saisie-absence {        /* 0h - Rouge */
      background-color: #f8d7da !important;
      color: #721c24 !important;
  }

  input.saisie-retard {         /* < max - Jaune */
      background-color: #fff3cd !important;
      color: #856404 !important;
  }

  input.saisie-present {        /* = max - Vert */
      background-color: #d4edda !important;
      color: #155724 !important;
  }

  ---
  5. Classes utilitaires

  5.1 Marges

  .mt-1 { margin-top: 10px; }
  .mt-2 { margin-top: 20px; }
  .mt-3 { margin-top: 30px; }

  .mb-1 { margin-bottom: 10px; }
  .mb-2 { margin-bottom: 20px; }
  .mb-3 { margin-bottom: 30px; }

  5.2 Texte

  .text-muted {
      color: var(--bleu-leger);
      font-size: 0.9rem;
  }

  .texte-centre {
      text-align: center;
  }

  ---
  6. Animations

  6.1 Animations définies

  apparition (sections/sous-sections) :
  @keyframes apparition {
      from {
          opacity: 0;
          transform: translateY(10px);
      }
      to {
          opacity: 1;
          transform: translateY(0);
      }
  }

  slideDown (détails) :
  @keyframes slideDown {
      from {
          opacity: 0;
          transform: translateY(-10px);
      }
      to {
          opacity: 1;
          transform: translateY(0);
      }
  }

  slideIn (notifications) :
  @keyframes slideIn {
      from {
          transform: translateX(400px);
          opacity: 0;
      }
      to {
          transform: translateX(0);
          opacity: 1;
      }
  }

  fadeIn (sélecteur de mode) :
  @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
  }

  6.2 Transitions

  Transitions standards :
  - Boutons : transition: all 0.2s;
  - Cartes hover : transition: all 0.2s ease;
  - Inputs saisie : transition: background-color 0.3s ease, border-color 0.3s 
  ease;

  ---
  7. Responsive design

  7.1 Points de rupture

  3 breakpoints :
  1. Desktop : > 1200px (par défaut)
  2. Tablette : 768px - 1200px
  3. Mobile : < 768px
  4. Petit mobile : < 480px

  7.2 Adaptations principales

  Tablette (max-width: 1200px) :
  .formulaire-ajout-grid {
      grid-template-columns: 1fr 0.7fr 1.5fr 1.5fr 1fr;
  }

  Mobile (max-width: 768px) :
  - Navigation: flex-wrap
  - Grilles: 1 colonne
  - Padding réduit
  - Font-size réduite dans tableaux
  - Conteneur: border-radius: 0

  Petit mobile (max-width: 480px) :
  - Titre h1: 1.5rem
  - Boutons navigation: font-size 0.85rem
  - Cartes statistiques: valeur 2rem

  7.3 En-tête responsive

  @media (max-width: 768px) {
      .entete-conteneur {
          flex-direction: column;
          text-align: center;
      }

      #selecteur-mode {
          position: static;
          margin-top: 20px;
      }

      .titre-section h1 {
          font-size: 1.8rem;
      }
  }

  ---
  8. Thèmes par mode

  8.1 Mode Normal (par défaut)

  En-tête :
  body[data-mode="normal"] .entete {
      background: linear-gradient(135deg, #032e5c 0%, #0f1e3a 100%);
  }

  Navigation :
  body[data-mode="normal"] .navigation-principale {
      background: var(--bleu-principal);
  }

  body[data-mode="normal"] .navigation-principale button.actif {
      background: var(--nav-actif-normal);
  }

  Sous-navigation :
  body[data-mode="normal"] .sous-navigation {
      background: var(--sous-nav-bg-normal);
  }

  8.2 Mode Simulation

  En-tête :
  body[data-mode="simulation"] .entete {
      background: linear-gradient(135deg, #0f1e3a 0%, #071428 100%);
  }

  Navigation :
  body[data-mode="simulation"] .navigation-principale {
      background: var(--bleu-simulation);
  }

  body[data-mode="simulation"] .navigation-principale button.actif {
      background: var(--nav-actif-simulation);
  }

  Sous-navigation :
  body[data-mode="simulation"] .sous-navigation {
      background: var(--sous-nav-bg-simulation);
  }

  8.3 Mode Anonymisation

  En-tête :
  body[data-mode="anonymisation"] .entete {
      background: linear-gradient(135deg, #1a5266 0%, #0d3540 100%);
  }

  Navigation :
  body[data-mode="anonymisation"] .navigation-principale {
      background: var(--bleu-anonymisation);
  }

  body[data-mode="anonymisation"] .navigation-principale button.actif {
      background: var(--nav-actif-anonymisation);
  }

  Sous-navigation :
  body[data-mode="anonymisation"] .sous-navigation {
      background: var(--sous-nav-bg-anonymisation);
  }

  ---
  9. Impression (@print)

  9.1 Éléments cachés à l'impression

  @media print {
      .navigation-principale,
      .sous-navigation,
      .btn,
      .statut-sauvegarde {
          display: none !important;
      }
  }

  9.2 Adaptations pour impression

  @media print {
      body {
          background: white;
          padding: 0;
      }

      .conteneur {
          box-shadow: none;
          border-radius: 0;
          max-width: 100%;
      }

      .carte {
          break-inside: avoid;  /* Éviter coupure de carte */
      }

      .entete {
          background: white;
          color: var(--bleu-principal);
          border-bottom: 2px solid var(--bleu-principal);
      }
  }

  ---
  10. Problèmes connus et solutions

  10.1 Animation slideDown dupliquée ⚠️

  Symptôme : Animation slideDown définie 2 fois

  Lignes : 510-520 ET 690-699

  Impact : Aucun (la deuxième définition écrase la première)

  Solution recommandée :
  /* SUPPRIMER la première définition (lignes 510-520) */
  /* GARDER la deuxième (lignes 690-699) qui est plus complète */

  10.2 Sélecteurs spécifiques trop restrictifs

  Symptôme : Règles CSS trop spécifiques limitent la réutilisabilité

  Exemple :
  #tbody-saisie-presences input[type="number"]:placeholder-shown {
      /* Trop spécifique - ne fonctionne que pour ce tableau */
  }

  Impact : Duplication de code si besoin du même style ailleurs

  Solution recommandée :
  /* Créer une classe réutilisable */
  .input-saisie:placeholder-shown {
      background-color: #fff9e6;
      border: 1px dashed #ffc107;
  }

  10.3 Variables CSS non utilisées

  Variables définies mais jamais utilisées :
  - --nav-bg (ligne 34)
  - --nav-normal (ligne 35)
  - Certaines couleurs de calendrier

  Impact : Code mort, confusion

  Solution :
  /* Vérifier l'usage avec recherche globale */
  /* Supprimer si non utilisé OU commenter avec note */

  10.4 !important excessif

  Symptôme : Usage de !important pour forcer les styles

  Exemples :
  input.saisie-absence {
      background-color: #f8d7da !important;  /* ligne 906 */
  }

  @media print {
      .navigation-principale {
          display: none !important;  /* ligne 1313 */
      }
  }

  Impact : Difficile de surcharger les styles, spécificité élevée

  Solution :
  - Pour saisie : Augmenter la spécificité du sélecteur au lieu de !important
  - Pour @print : !important justifié (cas légitime)

  ---
  11. Règles de modification

  11.1 ⚠️ ZONES PROTÉGÉES - NE PAS MODIFIER

  Variables de couleur principales

  --bleu-principal
  --bleu-pale
  --bleu-tres-pale
  --orange-accent
  Raison : Utilisées partout dans l'application, changement = impact global

  Noms de classes utilisées par JavaScript

  .section
  .sous-section
  .active
  .actif
  .carte
  .btn
  Raison : Références directes dans navigation.js, modes.js, etc.

  Attributs data pour thèmes

  body[data-mode="normal"]
  body[data-mode="simulation"]
  body[data-mode="anonymisation"]
  Raison : Gérés par modes.js

  Animations standard

  @keyframes apparition
  @keyframes fadeIn
  Raison : Utilisées par plusieurs composants

  11.2 ✅ ZONES MODIFIABLES

  Ajustement des couleurs d'accent

  Variables : --vert-leger, --vert-doux, --vert-pale
  Modification possible : Changer les nuances de vert

  Espacements

  Variables : --espacement-petit, --espacement-moyen, --espacement-grand
  Modification possible : Ajuster les valeurs (actuellement 10px, 20px, 30px)

  Seuils responsive

  Breakpoints : 768px, 1200px, 480px
  Modification possible : Ajuster selon les besoins

  Styles de cartes

  Classes : .carte-statistique, .carte-metrique
  Modification possible : Ajuster tailles, couleurs, ombres

  Animations et transitions

  Durées : 0.2s, 0.3s
  Modification possible : Accélérer/ralentir

  11.3 Workflow de modification recommandé

  AVANT toute modification :
  1. ✅ Commit Git ou backup du fichier CSS
  2. ✅ Tester l'apparence actuelle (captures d'écran)
  3. ✅ Identifier toutes les occurrences de la classe/variable à modifier

  PENDANT la modification :
  1. ✅ Modifier uniquement les zones autorisées
  2. ✅ Commenter les changements importants
  3. ✅ Respecter les conventions de nommage (français)
  4. ✅ Tester dans Safari ET Chrome

  APRÈS la modification :
  1. ✅ Tester toutes les sections (Tableau de bord, Étudiants, Présences,
  Évaluations, Réglages)
  2. ✅ Tester les 3 modes (Normal, Simulation, Anonymisation)
  3. ✅ Tester responsive (desktop, tablette, mobile)
  4. ✅ Vérifier la console (aucun warning CSS)
  5. ✅ Commit si succès, rollback si problème

  ---
  12. Bonnes pratiques d'utilisation

  12.1 Préférer les variables CSS

  ❌ MAUVAIS :
  .mon-element {
      color: #032e5c;
      background: #e8f2fd;
  }

  ✅ BON :
  .mon-element {
      color: var(--bleu-principal);
      background: var(--bleu-pale);
  }

  12.2 Utiliser les classes utilitaires

  ❌ MAUVAIS :
  <div style="margin-bottom: 20px; text-align: center;">
      ...
  </div>

  ✅ BON :
  <div class="mb-2 texte-centre">
      ...
  </div>

  12.3 Respecter la convention de nommage

  ❌ MAUVAIS :
  .card { ... }
  .delete-button { ... }
  .row-container { ... }

  ✅ BON :
  .carte { ... }
  .btn-supprimer { ... }
  .conteneur-ligne { ... }

  12.4 Éviter les styles inline

  ❌ MAUVAIS :
  element.style.background = '#e8f2fd';
  element.style.padding = '20px';

  ✅ BON :
  element.classList.add('carte');

  12.5 Utiliser les bonnes classes sémantiques

  Pour des statistiques :
  <div class="grille-statistiques">
      <div class="carte-metrique">...</div>
      <div class="carte-metrique">...</div>
  </div>

  Pour des actions :
  <div class="btn-groupe">
      <button class="btn btn-confirmer">Sauvegarder</button>
      <button class="btn btn-annuler">Annuler</button>
  </div>

  Pour des badges de risque :
  <span class="badge-risque risque-minimal">85%</span>

  ---
  13. Historique et évolution

  Version Beta 0.50 (16 octobre 2025)

  État actuel : Système de design complet et fonctionnel

  Fonctionnalités implémentées :
  - ✅ Palette de couleurs cohérente
  - ✅ 3 thèmes visuels (Normal, Simulation, Anonymisation)
  - ✅ Design responsive (desktop, tablette, mobile)
  - ✅ Composants réutilisables (cartes, boutons, badges, tableaux)
  - ✅ Animations et transitions
  - ✅ Styles d'impression
  - ✅ Variables CSS pour personnalisation
  - ✅ Convention 100% français

  Améliorations récentes

  24 octobre 2025 :
  - Ajout du style `.btn:disabled` pour gérer l'état désactivé des boutons
  - Modification des `:hover` en `:hover:not(:disabled)` pour tous les types de boutons
  - Amélioration de l'accessibilité : `opacity: 0.5` et `cursor: not-allowed` pour boutons désactivés
  - Correction de l'interaction hover sur boutons désactivés (Précédent/Suivant dans profil étudiant)

  16 octobre 2025 :
  - Ajout des styles pour encadré de date avec états (erreur, valide, verrouillé)
  - Codes couleur pour saisie des heures (absence, retard, présence)
  - Contrôle de verrouillage compact
  - Styles pour liste des évaluations

  Octobre 2025 :
  - Mise en place du système de thèmes par mode
  - Responsive design complet
  - Styles d'impression

  Évolutions futures possibles

  1. Dark mode :
    - Ajouter un 4e thème sombre
    - Variables pour fond sombre et texte clair
    - Toggle dark/light mode
  2. Accessibilité renforcée :
    - Vérifier contrastes WCAG AA
    - Ajouter focus visible renforcé
    - States ARIA reflétés visuellement
  3. Optimisation performance :
    - Minification du CSS
    - Regroupement des media queries
    - Suppression du code mort
  4. Composants avancés :
    - Tooltips
    - Dropdowns
    - Accordéons
    - Tabs
  5. Système de grille :
    - Grille 12 colonnes standardisée
    - Classes utilitaires de layout
    - Flexbox helpers

  ---
  14. Support et ressources

  14.1 Documentation projet

  - CLAUDE.md : Instructions générales
  - structure-modulaire.txt : Vue d'ensemble des modules
  - index 70 (refonte des modules).html : Point d'entrée HTML

  14.2 Modules JavaScript liés

  Modules utilisant intensivement le CSS :
  - modes.js : Gestion des attributs data-mode
  - navigation.js : Classes .active, .actif
  - profil-etudiant.js : Cartes métriques, grilles statistiques
  - tableau-bord-apercu.js : Badges de risque
  - saisie-presences.js : Codes couleur saisie heures

  14.3 Outils de développement

  Inspecteur CSS recommandé :
  - Safari DevTools (macOS)
  - Chrome DevTools
  - Firefox Developer Edition

  Tests responsive :
  - Safari Responsive Design Mode
  - Chrome Device Toolbar
  - Test réel sur iPad (M1)

  Validation CSS :
  - W3C CSS Validator
  - Stylelint (linter CSS)

  14.4 Ressources de design

  Palette de couleurs :
  - Bleus inspirés de palettes académiques
  - Sarcelle (anonymisation) pour différenciation visuelle
  - Rouge/vert pour indicateurs de risque (universellement compris)

  Typographie :
  - System fonts : system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif
  - Bonne lisibilité sur tous les OS
  - Performance optimale (pas de webfonts)

  14.5 Contact et licence

  Responsable : Grégoire Bédard
  Licence : Creative Commons BY-NC-SA 4.0
  - ✅ Partage et adaptation autorisés (usage non commercial)
  - ✅ Attribution requise
  - ✅ Redistribution sous même licence

  ---
  FIN DE LA DOCUMENTATION - styles.css

  Dernière mise à jour : 23 octobre 2025
  Version : Beta 0.50