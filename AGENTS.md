# AquaPilot - Instructions durables du projet

## Vision produit

AquaPilot est une application web complete de gestion d'aquariums d'eau douce.
Elle doit etre hebergee comme une application independante sur un serveur prive
et permettre a chaque utilisateur de gerer ses propres donnees de maniere fiable,
claire et securisee.

L'application doit rester originale. Elle peut s'inspirer du concept fonctionnel
d'applications de suivi d'aquariums, mais elle ne doit pas copier Tankly
directement, ni reprendre son design, ses textes, sa structure exacte ou son
identite visuelle.

## Fonctionnalites cible

AquaPilot doit permettre de gerer progressivement les domaines suivants :

- plusieurs aquariums par utilisateur ;
- parametres de l'eau ;
- poissons ;
- plantes ;
- alimentation ;
- entretien ;
- rappels intelligents ;
- alertes ;
- notes ;
- statistiques ;
- assistant IA contextualise ;
- notifications internes.

## Stack obligatoire

Le projet doit utiliser :

- Next.js App Router ;
- TypeScript strict ;
- Tailwind CSS ;
- shadcn/ui ;
- Prisma ;
- PostgreSQL ;
- Recharts ;
- Zod ;
- React Hook Form.

## Principes d'architecture

- Utiliser une architecture propre, lisible et evolutive.
- Garder les composants React reutilisables et specialises uniquement quand c'est utile.
- Separer la logique metier de l'interface utilisateur.
- Centraliser les schemas de validation avec Zod.
- Utiliser React Hook Form pour les formulaires.
- Utiliser Prisma comme couche d'acces aux donnees.
- Garder les types metier explicites et partages quand cela evite la duplication.
- Structurer les futures fonctionnalites par domaine lorsque le projet grossit.

Structure recommandee :

- `app/` pour les routes Next.js App Router, layouts et pages ;
- `components/` pour les composants UI reutilisables ;
- `components/ui/` pour les composants shadcn/ui ;
- `features/` pour les modules metier ;
- `lib/` pour Prisma, auth, validations, helpers et integrations ;
- `lib/ai/` pour la preparation future OpenAI API ;
- `prisma/` pour le schema Prisma et les migrations ;
- `types/` pour les types partages si necessaire.

## Regles de code

- Activer et respecter TypeScript strict.
- Eviter les fichiers trop longs et les composants trop charges.
- Preferer des fonctions pures pour la logique metier testable.
- Valider toutes les entrees utilisateur avec Zod.
- Ne jamais mettre de secrets en dur dans le code.
- Utiliser des variables d'environnement pour la configuration sensible.
- Fournir des fichiers d'exemple comme `.env.example` sans valeur secrete.
- Proteger les routes qui manipulent des donnees privees.
- Garantir que les donnees sont privees par utilisateur.
- Verifier la compilation apres chaque etape significative.
- Ne pas ajouter de dependances inutiles.
- Respecter les conventions existantes du projet avant d'introduire une nouvelle abstraction.

## Authentification et donnees privees

- L'application doit inclure une authentification utilisateur.
- Les donnees d'aquariums, mesures, notes, rappels, alertes et notifications
  doivent etre rattachees a un utilisateur.
- Une route, action serveur ou requete base de donnees ne doit jamais exposer les
  donnees d'un autre utilisateur.
- Les pages privees doivent etre protegees cote serveur lorsque c'est possible.

## Design et experience utilisateur

Le design doit etre :

- moderne ;
- premium ;
- aquatique ;
- responsive ;
- clair et calme ;
- adapte a une utilisation frequente.

Direction visuelle :

- palette bleu, turquoise, blanc et gris ;
- cartes arrondies ;
- badges d'alerte lisibles ;
- graphiques propres avec Recharts ;
- navigation desktop et mobile ;
- interface dense mais respirante ;
- etats vides utiles ;
- messages d'erreur comprehensibles ;
- formulaires ergonomiques.

L'interface doit donner une impression d'outil fiable et soigne pour aquariophiles,
pas une simple page marketing.

## Assistant IA contextualise

Le projet doit etre prepare pour une future integration OpenAI API.

- Prevoir une architecture permettant d'ajouter un assistant IA contextualise.
- Ne pas appeler l'API OpenAI tant que la fonctionnalite n'est pas explicitement demandee.
- Ne jamais exposer de cle API cote client.
- Garder les appels IA cote serveur.
- Concevoir l'assistant pour utiliser le contexte de l'utilisateur : aquariums,
  parametres d'eau, poissons, plantes, alertes et historique.

## Qualite et verification

Apres chaque etape de developpement :

- verifier la compilation ;
- corriger les erreurs TypeScript ;
- verifier que les routes principales chargent ;
- garder le projet dans un etat coherent avant de passer au module suivant.

Ne pas coder tous les modules d'un coup. Avancer par etapes validees :

1. socle projet et architecture ;
2. authentification ;
3. modele de donnees principal ;
4. interfaces de gestion ;
5. statistiques et graphiques ;
6. rappels, alertes et notifications ;
7. assistant IA contextualise ;
8. preparation deploiement serveur.
