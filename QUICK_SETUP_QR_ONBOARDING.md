# Guide d'installation rapide - Système d'Onboarding QR

## Étapes à suivre MAINTENANT pour que tout fonctionne

### 1️⃣ Configuration Supabase Authentication (OBLIGATOIRE)

1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet Bodega Academy
3. **Authentication** → **Providers** → **Email**
4. **DÉCOCHEZ** l'option **"Confirm email"** ✅
5. Cliquez sur **Save**

❗ **Pourquoi ?** Pour que les nouveaux employés soient automatiquement connectés sans confirmation par email.

---

### 2️⃣ Exécuter les migrations SQL (OBLIGATOIRE)

Dans le **SQL Editor** de Supabase, exécutez **dans l'ordre** :

#### Migration 1 : Tables QR Onboarding
```sql
-- Copiez et collez le contenu complet de :
migrations/add_qr_onboarding_system_v3_clean.sql
```

#### Migration 2 : Fonction RPC pour les évaluations
```sql
-- Copiez et collez le contenu complet de :
migrations/rpc_submit_assessment.sql
```

#### Migration 3 : Politiques RLS pour user_profiles ⚠️ IMPORTANT
```sql
-- Copiez et collez le contenu complet de :
migrations/fix_user_profiles_rls_for_onboarding.sql
```

❗ **Pourquoi la migration 3 ?** Elle permet aux nouveaux utilisateurs de créer leur propre profil. Sans elle, vous aurez l'erreur "403 Forbidden" lors de l'inscription.

---

### 3️⃣ Vérification

Après avoir exécuté les 3 migrations, vérifiez que tout est OK :

1. Dans Supabase → **Table Editor** :
   - ✅ Table `onboarding_qr_codes` existe
   - ✅ Table `onboarding_assessments` existe (avec 1 évaluation par défaut)
   - ✅ Table `onboarding_responses` existe

2. Dans Supabase → **Database** → **Functions** :
   - ✅ Fonction `submit_onboarding_assessment` existe
   - ✅ Fonction `is_qr_code_valid` existe
   - ✅ Fonction `increment_qr_code_usage` existe
   - ✅ Fonction `get_user_role` existe ⚠️ (crée par migration 3, évite la récursion infinie)

3. Dans Supabase → **Authentication** → **Policies** (sur la table `user_profiles`) :
   - ✅ "Users can insert own profile" (permet l'inscription)
   - ✅ "Users can update own profile"
   - ✅ "Users can read own profile"
   - ✅ "Admins can read all profiles"
   - ✅ "HR can read all profiles"

---

### 4️⃣ Test du système

1. **Connectez-vous en tant qu'admin** (`admin@bodega.ma`)
2. Allez dans le **tableau de bord admin**
3. Cliquez sur le bouton **"Codes QR"** (bouton teal/cyan avec icône QR code)
4. Cliquez sur **"Nouveau code QR"**
5. Remplissez :
   - Description : "Test QR"
   - Heures d'expiration : 72
   - Max utilisations : 10
6. Cliquez sur **"Créer le code QR"**
7. **Téléchargez** le QR code
8. Scannez-le avec votre smartphone ou copiez le lien

---

### 5️⃣ Test de l'inscription employé

1. Scannez le QR code (ou ouvrez le lien)
2. Remplissez le formulaire :
   - Prénom, Nom, Email, Date de naissance
   - Poste (manager/service/bar/cuisine)
   - Mot de passe (6+ caractères)
3. Cliquez sur **"Créer mon compte et continuer"**
4. ✅ Vous devriez être redirigé vers l'évaluation (5 questions)
5. Répondez aux questions
6. ✅ Vous devriez voir votre score final
7. Cliquez sur **"Accéder à mon espace de formation"**
8. ✅ Vous devriez être connecté et voir le dashboard employé

---

## ❌ Si vous avez des erreurs

### Erreur 403 Forbidden "new row violates row-level security"
➡️ **Vous n'avez pas exécuté la migration 3** (`fix_user_profiles_rls_for_onboarding.sql`)

### Erreur 500 "infinite recursion detected in policy for relation user_profiles"
➡️ **Vous avez une ancienne version de la migration 3**. Téléchargez et exécutez la nouvelle version (V3 avec SECURITY DEFINER function)

### Erreur "La session n'a pas été créée automatiquement"
➡️ **Vous n'avez pas désactivé la confirmation email** dans Authentication → Providers → Email

### Erreur "Code QR invalide"
➡️ Vérifiez que le code n'est pas expiré et qu'il est toujours actif

### L'évaluation ne se charge pas
➡️ Vérifiez que vous avez exécuté la migration 1 qui insère l'évaluation par défaut

---

## 📚 Documentation complète

Pour plus de détails, consultez :
- [QR_ONBOARDING_README.md](./QR_ONBOARDING_README.md) - Documentation complète
- [INSTALLATION_QR_ONBOARDING.md](./INSTALLATION_QR_ONBOARDING.md) - Guide d'installation détaillé

---

## ✅ Checklist finale

- [ ] Configuration Supabase : Email confirmation **DÉSACTIVÉE**
- [ ] Migration 1 exécutée : `add_qr_onboarding_system_v3_clean.sql`
- [ ] Migration 2 exécutée : `rpc_submit_assessment.sql`
- [ ] Migration 3 exécutée : `fix_user_profiles_rls_for_onboarding.sql` ⚠️
- [ ] Test : Création d'un QR code depuis l'admin
- [ ] Test : Inscription via QR code
- [ ] Test : Évaluation complétée
- [ ] Test : Connexion au dashboard employé

---

**Tout fonctionne ?** 🎉 Votre système d'onboarding QR est prêt !
