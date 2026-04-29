# Déploiement du serveur WhatsApp sur Railway

## Pourquoi Railway ?

Vercel est serverless — les fonctions s'arrêtent après quelques secondes.
WhatsApp exige une connexion WebSocket **persistante**. Railway lance un
serveur Node.js qui tourne 24h/24, parfait pour whatsapp-web.js.

---

## ÉTAPE 1 — Créer un compte Railway

1. Va sur **https://railway.app**
2. Clique **Login** → **Login with GitHub**
3. Autorise Railway à accéder à tes repos

---

## ÉTAPE 2 — Pousser ce dossier sur GitHub

```bash
cd confirmly-whatsapp-server
git init
git add .
git commit -m "init: serveur whatsapp confirmly"
gh repo create confirmly-whatsapp-server --public --push --source=.
```

Si tu n'as pas `gh` installé, crée le repo manuellement sur github.com
et fais `git remote add origin <url> && git push -u origin main`.

---

## ÉTAPE 3 — Déployer sur Railway

1. Sur Railway, clique **New Project**
2. Sélectionne **Deploy from GitHub repo**
3. Choisis `confirmly-whatsapp-server`
4. Railway détecte automatiquement Node.js et lance `npm start`

---

## ÉTAPE 4 — Ajouter les variables d'environnement

Dans Railway → ton projet → **Variables** :

| Variable | Valeur |
|----------|--------|
| `PORT`   | `3001` |

Railway injecte `PORT` automatiquement, donc ce n'est pas obligatoire —
mais c'est une bonne pratique de l'expliciter.

---

## ÉTAPE 5 — Récupérer l'URL Railway

1. Dans Railway → ton projet → **Settings** → **Domains**
2. Clique **Generate Domain**
3. Tu obtiens une URL du type : `https://confirmly-whatsapp-server-production.up.railway.app`

---

## ÉTAPE 6 — Ajouter l'URL dans Vercel

1. Va sur **https://vercel.com** → ton projet **confirmly**
2. **Settings** → **Environment Variables**
3. Ajoute :

| Nom | Valeur |
|-----|--------|
| `NEXT_PUBLIC_WHATSAPP_SERVER_URL` | `https://confirmly-whatsapp-server-production.up.railway.app` |

4. **Save** puis **Redeploy** le projet Confirmly sur Vercel.

---

## ÉTAPE 7 — Scanner le QR Code

1. Ouvre ton app Confirmly → page **WhatsApp IA**
2. Un QR code apparaît (généré par le serveur Railway)
3. Ouvre WhatsApp sur ton téléphone
4. **Réglages** → **Appareils liés** → **Lier un appareil**
5. Scanne le QR code → ✅ Connecté !

La session est sauvegardée dans `whatsapp_auth/` sur Railway.
Tu n'as pas besoin de rescanner à chaque redémarrage.

---

## Notes importantes

- **Plan gratuit Railway** : 500h/mois (suffisant pour un serveur permanent)
- **Puppeteer** : Railway inclut Chromium dans son environnement, aucune config supplémentaire nécessaire
- **Reconnexion automatique** : le serveur se reconnecte automatiquement si WhatsApp se déconnecte
- Si tu changes de numéro ou veux tout réinitialiser, supprime le dossier `whatsapp_auth/` dans Railway via la console
