# Training Paths Alignment - Bodega Academy

This document explains how the training paths have been aligned with the Bodega Academy's retail/warehouse operations structure.

## 🎯 Overview

The training paths system has been redesigned to align with Bodega Academy's operational structure, moving away from restaurant-focused roles to retail/warehouse-focused roles.

## 📋 New Training Paths Structure

### 1. **Tronc Commun** (Common Core)
- **Target**: All employees
- **Duration**: 8 hours
- **Priority**: High
- **Description**: Mandatory training for all Bodega Academy employees
- **Modules**: Welcome, company culture, basic safety procedures, internal communication

### 2. **Opérations Magasin** (Store Operations)
- **Target**: Store Manager, Supervisor, Cashier, Sales Associate, Customer Service
- **Duration**: 12 hours
- **Priority**: High
- **Description**: Training for store employees and customer service
- **Modules**: Customer service excellence, retail sales techniques, cash management, merchandising

### 3. **Opérations Entrepôt** (Warehouse Operations)
- **Target**: Warehouse Manager, Inventory Specialist, Picker/Packer, Receiving Clerk, Shipping Clerk
- **Duration**: 14 hours
- **Priority**: High
- **Description**: Training for warehouse and logistics employees
- **Modules**: Receiving, storage organization, order preparation, shipping, inventory management

### 4. **Management et Leadership**
- **Target**: Store Manager, Warehouse Manager, Supervisor
- **Duration**: 16 hours
- **Priority**: High
- **Description**: Advanced training for managers and supervisors
- **Modules**: Team leadership, performance management, conflict resolution, coaching

### 5. **Fonctions Support** (Support Functions)
- **Target**: HR, Administration, Finance, Marketing, IT Support
- **Duration**: 10 hours
- **Priority**: Medium
- **Description**: Training for administrative and support teams
- **Modules**: Office tools, document management, administrative procedures

### 6. **Sécurité et Qualité** (Safety and Quality)
- **Target**: All employees
- **Duration**: 6 hours
- **Priority**: High
- **Description**: Cross-functional training on safety and quality
- **Modules**: Workplace safety, first aid, quality standards, incident management

## 🚀 How to Implement

### Step 1: Run Database Migration
Execute the migration script in your Supabase SQL editor:

```sql
-- Copy and paste the content of migrations/align_training_paths_bodega.sql
-- into your Supabase SQL editor and run it
```

### Step 2: Verify Migration
Run the verification script to check the alignment:

```sql
-- Copy and paste the content of scripts/run_training_paths_alignment.sql
-- into your Supabase SQL editor to verify the migration
```

### Step 3: Update Application Configuration
The application is already configured to use the new training paths. The key files updated:

- `src/config/moduleCategories.ts` - Main training paths configuration
- `src/config/trainingPaths.ts` - Job role specific training paths
- `src/config/bodegaTrainingPaths.ts` - Comprehensive Bodega Academy configuration

### Step 4: Assign Existing Modules
Review your existing modules and assign them to appropriate training paths:

1. Go to **Admin Dashboard** → **Parcours** (Training Paths)
2. Use the **Database Migration** tool to assign modules to training paths
3. Review and update module assignments as needed

## 🎯 Job Roles Mapping

### Store Operations
- **Store Manager**: Management + Store Operations + Common Core + Safety & Quality
- **Supervisor**: Management + Store Operations + Common Core + Safety & Quality
- **Cashier**: Store Operations + Common Core + Safety & Quality
- **Sales Associate**: Store Operations + Common Core + Safety & Quality
- **Customer Service**: Store Operations + Common Core + Safety & Quality

### Warehouse Operations
- **Warehouse Manager**: Management + Warehouse Operations + Common Core + Safety & Quality
- **Inventory Specialist**: Warehouse Operations + Common Core + Safety & Quality
- **Picker/Packer**: Warehouse Operations + Common Core + Safety & Quality
- **Receiving Clerk**: Warehouse Operations + Common Core + Safety & Quality
- **Shipping Clerk**: Warehouse Operations + Common Core + Safety & Quality

### Support Functions
- **HR**: Support Functions + Common Core + Safety & Quality
- **Administration**: Support Functions + Common Core + Safety & Quality
- **Finance**: Support Functions + Common Core + Safety & Quality
- **Marketing**: Support Functions + Common Core + Safety & Quality
- **IT Support**: Support Functions + Common Core + Safety & Quality

## 📊 Features

### Enhanced Training Path Quizzes
Each training path now includes comprehensive end-of-path quizzes with:
- Multiple choice questions relevant to the path
- 80% passing score requirement
- Maximum 3 attempts per quiz
- Immediate feedback and scoring

### Progress Tracking
- Individual progress tracking for each training path
- Completion percentages and scores
- Historical progress data
- Analytics for administrators

### Role-Based Content Filtering
- Automatic content filtering based on user's job role
- Personalized learning paths
- Relevant recommendations

## 🛠️ Administration Tools

### Training Path Management
- Create and edit training paths
- Assign modules to paths
- Manage end-of-path quizzes
- Monitor completion rates

### Module Assignment
- Bulk assign modules to training paths
- Update module categories
- Manage prerequisites and dependencies

### User Management
- Assign job roles to users
- Track individual progress
- Generate completion reports

## 🔍 Verification Queries

Use these queries to verify your training paths alignment:

```sql
-- Check training paths
SELECT id, name, target_roles, estimated_duration FROM training_paths;

-- Check module assignments
SELECT tp.name, COUNT(m.id) as module_count
FROM training_paths tp
LEFT JOIN modules m ON m.training_path_id = tp.id
GROUP BY tp.id, tp.name;

-- Check unassigned modules
SELECT title FROM modules WHERE training_path_id IS NULL;
```

## 🎉 Benefits

1. **Aligned with Business**: Training paths match Bodega Academy's actual operations
2. **Role-Specific Learning**: Employees see only relevant training content
3. **Progress Tracking**: Comprehensive tracking of individual and team progress
4. **Quality Assurance**: End-of-path quizzes ensure knowledge retention
5. **Administrative Control**: Full control over training paths and content organization

## 📞 Support

If you encounter any issues with the training paths alignment:

1. Check the database migration logs
2. Verify all required tables were created
3. Ensure modules are properly assigned to training paths
4. Contact your system administrator for database-related issues

The training paths system is now fully aligned with Bodega Academy's retail/warehouse operations structure and ready for use!