# AquaPilot

AquaPilot est une application web complete de gestion d'aquariums d'eau douce.
Elle permet de suivre plusieurs bacs par utilisateur avec mesures d'eau,
population, plantes, entretiens, alimentations, rappels intelligents, alertes,
notes, statistiques, notifications internes et assistant IA contextualise.

L'application est prevue pour etre hebergee comme une application independante
sur un serveur personnel. Les donnees privees sont rattachees a l'utilisateur
connecte et les routes sensibles sont protegees cote serveur.

## Stack technique

- Next.js App Router
- React 19
- TypeScript strict
- Tailwind CSS
- shadcn/ui et Base UI
- Prisma 7
- PostgreSQL
- Recharts
- Zod
- React Hook Form
- Authentification par session applicative
- Preparation OpenAI API via `OPENAI_API_KEY`

## Prerequis

- Node.js recent compatible avec Next.js 16
- npm
- PostgreSQL 15 ou plus recent recommande
- Docker Desktop si vous voulez lancer PostgreSQL localement sans installation manuelle
- Acces shell au serveur pour le deploiement

## Installation locale

```bash
npm install
```

Copier le fichier d'environnement :

```bash
cp .env.example .env
```

Sous Windows PowerShell :

```powershell
Copy-Item .env.example .env
```

Pour utiliser la base Docker fournie avec le projet :

```bash
docker compose up -d postgres
```

Puis initialiser Prisma :

```bash
npx prisma generate
npx prisma migrate dev
npx prisma db seed
```

Enfin lancer l'application :

```bash
npm run dev
```

Ouvrir `http://localhost:3000`.

Renseigner au minimum `DATABASE_URL` dans `.env` si vous utilisez une autre base.

## Variables d'environnement

Exemple :

```env
DATABASE_URL="postgresql://aquapilot:aquapilot@localhost:5432/aquapilot?schema=public"
NEXTAUTH_SECRET="replace-with-a-long-random-secret"
NEXTAUTH_URL="http://localhost:3000"
OPENAI_API_KEY=""
AUTH_SESSION_DAYS="30"
OPENAI_MODEL="gpt-5.5"
```

Variables principales :

- `DATABASE_URL` : URL PostgreSQL utilisee par Prisma.
- `NEXTAUTH_SECRET` : secret utilise par les sessions internes. Obligatoire en production.
- `NEXTAUTH_URL` : URL publique de l'application, par exemple `https://aquapilot.example.com`.
- `OPENAI_API_KEY` : cle OpenAI cote serveur. Si elle est vide, l'assistant IA affiche un message clair.
- `AUTH_SESSION_DAYS` : duree des sessions internes en jours.
- `OPENAI_MODEL` : modele OpenAI utilise par l'assistant IA.

Ne jamais commiter `.env`.

## Configuration PostgreSQL

Option la plus simple en local :

```bash
docker compose up -d postgres
```

Cette commande lance PostgreSQL avec :

- base : `aquapilot`
- utilisateur : `aquapilot`
- mot de passe : `aquapilot`
- port local : `5432`

L'URL correspondante est :

```env
DATABASE_URL="postgresql://aquapilot:aquapilot@localhost:5432/aquapilot?schema=public"
```

Pour une installation PostgreSQL manuelle :

Exemple local avec `psql` :

```sql
CREATE DATABASE aquapilot;
CREATE USER aquapilot WITH PASSWORD 'change-me';
GRANT ALL PRIVILEGES ON DATABASE aquapilot TO aquapilot;
```

Selon votre configuration PostgreSQL, vous devrez aussi accorder les droits sur
le schema `public` :

```sql
\c aquapilot
GRANT ALL ON SCHEMA public TO aquapilot;
```

Puis configurer :

```env
DATABASE_URL="postgresql://aquapilot:change-me@localhost:5432/aquapilot?schema=public"
```

## Configuration Prisma

Verifier le schema :

```bash
npx prisma validate
```

Generer le client Prisma :

```bash
npx prisma generate
```

Initialiser la base en developpement :

```bash
npx prisma migrate dev
```

Si vous modifiez le schema Prisma plus tard, creez une nouvelle migration nommee :

```bash
npx prisma migrate dev --name nom_de_la_migration
```

En production, preferer :

```bash
npx prisma migrate deploy
```

Le fichier de configuration Prisma est `prisma.config.ts` et le schema est
`prisma/schema.prisma`.

## Seed database

Le seed ajoute des especes de poissons et plantes d'eau douce courantes.

```bash
npx prisma db seed
```

Le script de seed est configure dans `package.json` :

```json
"prisma": {
  "seed": "tsx prisma/seed.ts"
}
```

## Lancement en developpement

```bash
npm run dev
```

Ouvrir :

```text
http://localhost:3000
```

Commandes utiles pendant le developpement :

```bash
npx prisma studio
npx prisma validate
npx prisma generate
npx tsc --noEmit
npm run lint
npm run build
```

## Build production

Compiler l'application :

```bash
npm run build
```

Lancer le serveur Next.js de production :

```bash
npm run start
```

Par defaut, Next ecoute sur le port `3000`. Vous pouvez changer le port avec :

```bash
PORT=3001 npm run start
```

Sous PowerShell :

```powershell
$env:PORT="3001"; npm run start
```

Pour un test direct depuis une autre machine du reseau, vous pouvez exposer le
serveur Next.js sur toutes les interfaces :

```bash
HOSTNAME=0.0.0.0 PORT=3000 npm run start
```

En production publique, preferez Nginx comme reverse proxy et gardez Next.js sur
`127.0.0.1`.

## Lancement complet et acces

Cette section resume le chemin de lancement a utiliser quand vous voulez rendre
AquaPilot accessible en local, sur une IP serveur, puis derriere un domaine.

### Acces local sur `http://localhost:3000`

```bash
npm install
docker compose up -d postgres
npx prisma generate
npx prisma migrate dev
npm run dev
```

Ouvrir :

```text
http://localhost:3000
```

### Acces direct depuis une IP serveur sur `http://IP_DU_SERVEUR:3000`

Sur le serveur, configurez `.env` avec l'IP publique :

```env
DATABASE_URL="postgresql://aquapilot:mot-de-passe-fort@127.0.0.1:5432/aquapilot?schema=public"
NEXTAUTH_SECRET="une-valeur-longue-aleatoire-et-secrete"
NEXTAUTH_URL="http://IP_DU_SERVEUR:3000"
OPENAI_API_KEY=""
AUTH_SESSION_DAYS="30"
OPENAI_MODEL="gpt-5.5"
```

Puis lancer en production sur toutes les interfaces :

```bash
npm ci
npx prisma generate
npx prisma migrate deploy
npm run build
HOSTNAME=0.0.0.0 PORT=3000 npm run start
```

Verifier depuis le serveur :

```bash
curl -I http://127.0.0.1:3000/login
```

Verifier depuis votre ordinateur :

```text
http://IP_DU_SERVEUR:3000
```

Le pare-feu du serveur doit autoriser le port `3000` si vous choisissez cet
acces direct. Pour une exposition durable, preferez Nginx et HTTPS.

### Preparation domaine avec Nginx

Pour un domaine, laissez Next.js ecouter uniquement en local :

```bash
npm ci
npx prisma generate
npx prisma migrate deploy
npm run build
PORT=3000 HOSTNAME=127.0.0.1 NODE_ENV=production pm2 start npm --name aquapilot -- start
pm2 save
```

Dans `.env`, `NEXTAUTH_URL` doit etre l'URL finale du site :

```env
NEXTAUTH_URL="https://aquapilot.example.com"
```

Nginx redirige ensuite le trafic public vers `127.0.0.1:3000`. Voir la section
`Deploiement sur serveur personnel` pour la configuration Nginx et Certbot.

## Deploiement sur serveur personnel

AquaPilot peut etre expose depuis une adresse IP ou un nom de domaine avec
PostgreSQL, Node.js, PM2 et Nginx. Le serveur Next.js reste sur un port local
comme `3000`, puis Nginx recoit le trafic public en HTTP/HTTPS et le transmet a
l'application.

Hypotheses dans les exemples :

- domaine : `aquapilot.example.com`
- dossier : `/var/www/aquapilot`
- port interne Next.js : `3000`
- base PostgreSQL : `aquapilot`

Remplacez ces valeurs par celles de votre serveur.

### 1. Recuperer le projet

```bash
sudo mkdir -p /var/www
sudo chown -R $USER:$USER /var/www
git clone <url-du-repo> /var/www/aquapilot
cd /var/www/aquapilot
npm ci
```

### 2. Configurer l'environnement

```bash
cp .env.example .env
nano .env
```

Renseigner :

- `DATABASE_URL` avec l'URL PostgreSQL de production ;
- `NEXTAUTH_SECRET` avec une valeur longue et secrete ;
- `NEXTAUTH_URL` avec l'URL finale du site ;
- `OPENAI_API_KEY` si l'assistant IA doit etre actif ;
- `AUTH_SESSION_DAYS`
- `OPENAI_MODEL`

Exemple avec nom de domaine :

```env
DATABASE_URL="postgresql://aquapilot:mot-de-passe-fort@127.0.0.1:5432/aquapilot?schema=public"
NEXTAUTH_SECRET="une-valeur-longue-aleatoire-et-secrete"
NEXTAUTH_URL="https://aquapilot.example.com"
OPENAI_API_KEY=""
AUTH_SESSION_DAYS="30"
OPENAI_MODEL="gpt-5.5"
```

Exemple avec une adresse IP sans HTTPS :

```env
NEXTAUTH_URL="http://203.0.113.10"
```

`OPENAI_API_KEY` peut rester vide : l'application continue de fonctionner et
l'assistant IA affiche un message clair lorsqu'il n'est pas configure.

### 3. Preparer la base

En production, utilisez les migrations versionnees :

```bash
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
```

`npx prisma migrate deploy` applique uniquement les migrations deja creees dans
`prisma/migrations`. N'utilisez pas `migrate dev` en production.

Si PostgreSQL est installe sur le meme serveur, exemple de creation de base :

```bash
sudo -u postgres psql
```

Puis dans `psql` :

```sql
CREATE DATABASE aquapilot;
CREATE USER aquapilot WITH PASSWORD 'mot-de-passe-fort';
GRANT ALL PRIVILEGES ON DATABASE aquapilot TO aquapilot;
\c aquapilot
GRANT ALL ON SCHEMA public TO aquapilot;
\q
```

### 4. Builder l'application

```bash
npm run build
```

### 5. Deployer avec PM2

Installer PM2 :

```bash
npm install -g pm2
```

Lancer AquaPilot en production :

```bash
PORT=3000 HOSTNAME=127.0.0.1 NODE_ENV=production pm2 start npm --name aquapilot -- start
```

Verifier :

```bash
pm2 status
pm2 logs aquapilot
curl -I http://127.0.0.1:3000/login
```

Sauvegarder le processus PM2 pour redemarrage automatique :

```bash
pm2 save
pm2 startup
```

La commande `pm2 startup` affiche une commande `sudo ...` a executer. Copiez-la
et lancez-la une fois sur le serveur.

Pour redemarrer apres une mise a jour :

```bash
git pull
npm ci
npx prisma generate
npx prisma migrate deploy
npm run build
pm2 restart aquapilot
```

### 6. Configurer Nginx comme reverse proxy

Installer Nginx :

```bash
sudo apt update
sudo apt install -y nginx
```

Creer le fichier de site :

```bash
sudo nano /etc/nginx/sites-available/aquapilot
```

Configuration avec nom de domaine :

```nginx
server {
    listen 80;
    server_name aquapilot.example.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Configuration avec adresse IP seule :

```nginx
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Activer le site :

```bash
sudo ln -s /etc/nginx/sites-available/aquapilot /etc/nginx/sites-enabled/aquapilot
sudo nginx -t
sudo systemctl reload nginx
```

Verifier :

```bash
curl -I http://aquapilot.example.com/login
```

ou, avec une IP :

```bash
curl -I http://203.0.113.10/login
```

### 7. Configurer HTTPS avec Certbot

Pour un nom de domaine pointant vers le serveur :

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d aquapilot.example.com
```

Certbot modifie la configuration Nginx pour ajouter le certificat TLS et la
redirection HTTPS. Verifier le renouvellement automatique :

```bash
sudo certbot renew --dry-run
```

Apres HTTPS, `NEXTAUTH_URL` doit utiliser l'URL finale en `https://` :

```env
NEXTAUTH_URL="https://aquapilot.example.com"
```

Puis redemarrer l'application :

```bash
pm2 restart aquapilot
```

### 8. Checklist de production

Avant d'ouvrir l'application aux utilisateurs :

- `DATABASE_URL` pointe vers la base PostgreSQL de production ;
- `NEXTAUTH_SECRET` est long, aleatoire et prive ;
- `NEXTAUTH_URL` correspond exactement a l'URL publique finale ;
- `OPENAI_API_KEY` est vide ou renseignee cote serveur uniquement ;
- `npx prisma migrate deploy` passe sans erreur ;
- `npm run build` passe sans erreur ;
- `pm2 status` indique `aquapilot` en ligne ;
- `sudo nginx -t` passe sans erreur ;
- HTTPS est actif si un nom de domaine est utilise.

## Structure des dossiers

```text
app/                 Routes Next.js App Router, pages et API routes
app/(private)/       Espace authentifie
app/api/             Endpoints serveur, dont assistant IA
components/          Composants React reutilisables
components/ui/       Composants shadcn/ui
ai/                  Contexte et logique serveur pour l'assistant IA
lib/                 Prisma, auth, helpers
rules/               Schemas Zod, options et regles metier
services/            Actions serveur et acces donnees par domaine
prisma/              Schema Prisma et seed
types/               Types partages
hooks/               Hooks React reutilisables
data/                Donnees statiques ou futures references
public/              Assets publics
```

## Fonctionnalites principales

- CRUD aquariums
- Parametres d'eau avec graphiques
- Entretiens et changements d'eau
- Alimentation
- Poissons et compatibilite de base
- Plantes et besoins de culture
- Rappels intelligents
- Alertes aquariophilie
- Score sante sur 100
- Statistiques Recharts
- Notes avec tags
- Notifications internes
- Assistant IA contextualise

## Commandes utiles

```bash
npm run dev            # developpement
npm run build          # build production
npm run start          # serveur production
npm run lint           # ESLint
npx tsc --noEmit       # verification TypeScript
npx prisma validate    # validation schema Prisma
npx prisma generate    # generation client Prisma
npx prisma db push     # synchronisation schema en dev
npx prisma migrate dev # migration locale
npx prisma migrate deploy # migrations production
npx prisma db seed     # seed poissons/plantes
npx prisma studio      # interface Prisma Studio
```

## Resolution des erreurs frequentes

### `DATABASE_URL is required to initialize Prisma`

La variable `DATABASE_URL` est absente ou vide dans `.env`.

Verifier :

```bash
cat .env
```

Puis relancer :

```bash
npx prisma generate
npm run dev
```

### `P1001 Can't reach database server`

PostgreSQL n'est pas joignable.

Verifier :

- le service PostgreSQL est demarre ;
- l'hote et le port dans `DATABASE_URL` ;
- le pare-feu du serveur ;
- les droits utilisateur PostgreSQL.

### `P3005 The database schema is not empty`

La base contient deja des tables. Utiliser une base vide pour une premiere
migration, ou choisir `prisma db push` en developpement.

### Client Prisma non a jour

Si TypeScript ne connait pas un nouveau champ Prisma :

```bash
npx prisma generate
npx tsc --noEmit
```

### Assistant IA inactif

Si `OPENAI_API_KEY` est vide, la page assistant affiche un message clair.

Configurer :

```env
OPENAI_API_KEY="sk-..."
OPENAI_MODEL="gpt-5.5"
```

Puis redemarrer le serveur.

### Build Next.js echoue apres modification du schema

Executer dans cet ordre :

```bash
npx prisma validate
npx prisma generate
npx tsc --noEmit
npm run build
```

### Cookies ou session instable en production

Verifier :

- `NEXTAUTH_URL` pointe vers l'URL publique ;
- le site est servi en HTTPS ;
- le serveur utilise une heure systeme correcte ;
- `AUTH_SESSION_DAYS` est positif.

## Notes de securite

- Ne pas exposer `OPENAI_API_KEY` cote client.
- Ne pas commiter `.env`.
- Utiliser un mot de passe PostgreSQL fort.
- Servir l'application en HTTPS en production.
- Sauvegarder regulierement la base PostgreSQL.
