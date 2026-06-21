# Guide de déploiement — BudgetWise sur Vercel + MongoDB Atlas

Ce guide suppose que vous n'allez **rien modifier dans le code**. Vous avez juste besoin
de créer une base de données MongoDB Atlas, mettre le code sur GitHub, puis le connecter
à Vercel. Comptez environ 15 à 20 minutes.

---

## Étape 1 — Créer la base de données sur MongoDB Atlas

1. Allez sur **https://www.mongodb.com/cloud/atlas/register** et créez un compte gratuit
   (ou connectez-vous si vous en avez déjà un).
2. Cliquez sur **"Build a Database"** puis choisissez l'offre **M0 (Free)**.
3. Choisissez un fournisseur cloud (AWS recommandé) et une région proche de vous.
4. Donnez un nom à votre cluster (ex : `budgetwise-cluster`) puis cliquez sur **Create**.
5. **Créer un utilisateur de base de données** :
   - Username : ex. `budgetwise-admin`
   - Password : cliquez sur "Autogenerate Secure Password" et **copiez-le immédiatement**
     dans un endroit sûr (vous en aurez besoin).
   - Cliquez sur **Create User**.
6. **Autoriser l'accès réseau** :
   - Dans la section "Where would you like to connect from?", cliquez sur
     **"Add My Current IP Address"**, PUIS ajoutez aussi `0.0.0.0/0` (Allow access from
     anywhere) — c'est nécessaire car Vercel utilise des IP dynamiques.
   - Pour ajouter `0.0.0.0/0` : allez dans **Network Access** (menu de gauche) → **Add IP
     Address** → **Allow Access from Anywhere** → **Confirm**.
7. Cliquez sur **Finish and Close**.

## Étape 2 — Récupérer la chaîne de connexion (connection string)

1. Dans le tableau de bord Atlas, cliquez sur **Connect** sur votre cluster.
2. Choisissez **"Drivers"**.
3. Sélectionnez **Node.js** comme driver.
4. Copiez la chaîne de connexion, qui ressemble à :
   ```
   mongodb+srv://budgetwise-admin:<password>@budgetwise-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Remplacez `<password>` par le mot de passe copié à l'étape 1.
6. **Ajoutez le nom de la base de données** juste après `.net/` et avant le `?` :
   ```
   mongodb+srv://budgetwise-admin:VOTRE_MOT_DE_PASSE@budgetwise-cluster.xxxxx.mongodb.net/budgetwise?retryWrites=true&w=majority
   ```
   (Le nom `budgetwise` sera créé automatiquement au premier enregistrement.)
7. Gardez cette URL complète de côté — c'est votre `MONGODB_URI`.

## Étape 3 — Mettre le code sur GitHub

1. Décompressez le projet `budgetwise` que vous avez reçu.
2. Créez un nouveau dépôt sur **https://github.com/new** (ex : `budgetwise`), en le
   laissant **vide** (pas de README, pas de .gitignore — le projet en a déjà).
3. Dans un terminal, à la racine du dossier `budgetwise` décompressé :

   ```bash
   git init
   git add .
   git commit -m "Initial commit - BudgetWise"
   git branch -M main
   git remote add origin https://github.com/VOTRE-NOM-UTILISATEUR/budgetwise.git
   git push -u origin main
   ```

   (Remplacez l'URL par celle de votre propre dépôt GitHub.)

   > Si vous n'avez pas Git installé ou préférez une méthode sans terminal, vous pouvez
   > aussi glisser-déposer tous les fichiers directement dans l'interface web de GitHub
   > via "Add file" → "Upload files" (sauf le dossier `node_modules` qui n'est pas inclus
   > dans la livraison).

## Étape 4 — Déployer sur Vercel

1. Allez sur **https://vercel.com/new** et connectez-vous (vous pouvez vous connecter
   directement avec votre compte GitHub).
2. Cliquez sur **Import** à côté du dépôt `budgetwise` que vous venez de créer.
   - Si le dépôt n'apparaît pas, cliquez sur "Adjust GitHub App Permissions" et autorisez
     l'accès à ce dépôt.
3. Vercel détecte automatiquement qu'il s'agit d'un projet **Next.js** — ne changez rien
   aux paramètres de build.
4. Dépliez la section **"Environment Variables"** et ajoutez :

   | Name          | Value                                                |
   | ------------- | ---------------------------------------------------- |
   | `MONGODB_URI` | La chaîne de connexion complète obtenue à l'étape 2  |
   | `JWT_SECRET`  | Une chaîne aléatoire longue (voir astuce ci-dessous) |

   **Astuce pour `JWT_SECRET`** : utilisez n'importe quelle chaîne longue et aléatoire,
   par exemple générée sur **https://generate-secret.vercel.app/32** ou en tapant
   `openssl rand -base64 48` dans un terminal Mac/Linux.

5. Cliquez sur **Deploy**.
6. Patientez 1 à 3 minutes — Vercel installe les dépendances, build le projet et le
   déploie.
7. Une fois terminé, Vercel affiche un lien public du type
   `https://budgetwise-xxxx.vercel.app` — c'est votre application en ligne.

## Étape 5 — Vérifier que tout fonctionne

1. Ouvrez le lien fourni par Vercel.
2. Cliquez sur **"Créer un compte"**, inscrivez-vous avec un e-mail/mot de passe.
   - Le **premier compte créé** devient automatiquement **administrateur** et peut
     accéder à la **Console admin** (lien visible dans le menu latéral).
3. Ajoutez une transaction de test pour vérifier que tout s'enregistre correctement
   (cela confirme que la connexion à MongoDB Atlas fonctionne).
4. Si une erreur apparaît à l'inscription, vérifiez dans Vercel :
   **Project → Settings → Environment Variables** que `MONGODB_URI` est bien renseigné
   sans espace ni guillemet superflu, puis redéployez (**Deployments → ⋯ → Redeploy**).

## Étape 6 — Domaine personnalisé (facultatif)

Dans **Project → Settings → Domains**, vous pouvez ajouter votre propre nom de domaine
si vous en possédez un, en suivant les instructions DNS affichées par Vercel.

---

## Dépannage rapide

| Symptôme                                             | Cause probable                                   | Solution                                        |
| ---------------------------------------------------- | ------------------------------------------------ | ----------------------------------------------- |
| Erreur 500 à l'inscription/connexion                 | `MONGODB_URI` absent ou incorrect                | Vérifier la variable dans Vercel, redéployer    |
| "Could not connect to MongoDB"                       | IP non autorisée sur Atlas                       | Ajouter `0.0.0.0/0` dans Network Access (Atlas) |
| Le build Vercel échoue sur les polices Google        | Problème réseau temporaire très rare côté Vercel | Relancer le déploiement ("Redeploy")            |
| Connecté mais aucune donnée ne s'affiche après ajout | Cache navigateur                                 | Rafraîchir la page (Ctrl/Cmd + Shift + R)       |

Pour toute erreur affichée, le détail technique est consultable dans Vercel sous
**Deployments → (votre déploiement) → Functions / Logs**.
