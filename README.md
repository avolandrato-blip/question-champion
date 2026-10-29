# Question Champion

Prototype web du quiz familial multijoueur. L’interface couvre l’accueil, la création ou la jonction à une salle, la saisie du pseudo et le lobby.

## Démarrer

```bash
pnpm install
pnpm dev
```

Sans variables Supabase, l’interface fonctionne en **mode aperçu** pour parcourir les écrans. Pour activer le client Supabase et l’écoute Realtime, copier `.env.example` vers `.env.local` et renseigner l’URL du projet et la clé publishable.

Les migrations SQL de la banque de questions et des salles sont versionnées dans le dépôt GitHub associé. Les règles de scoring, de timer et de validation automatique seront branchées sur les fonctions transactionnelles Supabase dans l’étape suivante.
