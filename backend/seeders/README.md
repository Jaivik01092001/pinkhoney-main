# Database Seeders

This directory contains database seeding scripts for the Pink Honey AI Companion application.

## Companion Seeder

The `companionSeeder.js` script creates exactly 10 AI character records with realistic sample data.

### Features

- **Auto-Seeding**: Automatically runs when the server starts
- **Idempotent Execution**: Safe to run multiple times without creating duplicates
- **Diverse Characters**: 10 unique AI companions with different personality archetypes
- **Realistic Data**: Complete sample data covering all required and optional fields
- **Error Handling**: Comprehensive error handling with helpful guidance
- **Logging**: Clear console output indicating success or failure
- **Server-Safe**: Won't crash the server if seeding fails

### Auto-Seeding on Server Start

The seeder automatically runs when you start the backend server:

```bash
npm run dev  # Auto-seeds companions if database is empty
```

The server will:
1. Connect to MongoDB
2. Check if 10 or more companions exist
3. Seed companions if needed
4. Continue with normal server startup

### Manual Usage

You can also run the seeder manually. There are two versions available:

#### Standard Seeder (with detailed logging):
```bash
node seeders/companionSeeder.js
```

#### Bulk Operations Seeder (most reliable):
```bash
node seeders/companionSeederBulk.js
```

#### Or from the backend root directory:
```bash
cd backend
node seeders/companionSeeder.js
# or
node seeders/companionSeederBulk.js
```

**Note**: The server automatically uses the bulk operations seeder for maximum reliability.

### Clear Companions (For Testing)

If you need to reset the companions data for testing:

```bash
node seeders/clearCompanions.js
```

This utility will:
- Connect to the database
- Count existing companions
- Delete all companions
- Provide confirmation of deletion

### AI Companions Created

The seeder creates these 10 diverse AI characters:

1. **Luna** (25) - Creative, empathetic artist and poet
2. **Marcus** (32) - Analytical tech enthusiast and problem solver
3. **Sophia** (28) - Nurturing wellness coach and mindfulness expert
4. **Kai** (24) - Energetic adventurer and travel enthusiast
5. **Elena** (30) - Intellectual conversationalist with cultural expertise
6. **Zara** (26) - Stylish fashion expert and confidence coach
7. **Oliver** (35) - Professional business mentor and entrepreneur
8. **Maya** (23) - Musical creative performer and artist
9. **Alex** (29) - Energetic fitness coach and sports enthusiast
10. **Iris** (27) - Empathetic emotional support specialist

### Data Structure

Each companion includes:
- **name**: Unique character name
- **age**: Age between 23-35
- **bio**: Detailed character background (2-3 sentences)
- **personality**: Character traits and approach
- **interests**: Array of 5 interests with emojis
- **imageUrl**: Professional portrait from Unsplash
- **voiceId**: Unique voice identifier for TTS
- **isActive**: Defaults to true
- **timestamps**: Automatically added by Mongoose

### Idempotent Behavior

The seeder checks if 10 or more companions already exist before running:

- **If companions exist**: Skips seeding and displays informational message
- **If no companions**: Proceeds with seeding all 10 characters
- **To force re-seeding**: Manually clear the companions collection first

### Error Handling

The script provides specific guidance for common errors:

- **Duplicate Key Error (11000)**: Indicates existing companions with same names
- **Validation Error**: Shows specific field validation issues
- **Network Error**: Database connection problems
- **General Errors**: Comprehensive error logging with stack traces

### Environment Requirements

- Node.js 18+
- MongoDB connection configured in `.env`
- All dependencies installed (`npm install`)

### Example Output

```
🌱 Starting Companion Database Seeder...
✅ Database connection established
🚀 Seeding companions data...
✅ Successfully created 10 AI companions:
   1. Luna (Creative)
   2. Marcus (Analytical)
   3. Sophia (Nurturing)
   4. Kai (Energetic)
   5. Elena (Intellectual)
   6. Zara (Stylish)
   7. Oliver (Professional)
   8. Maya (Musical)
   9. Alex (Energetic)
   10. Iris (Empathetic)
🎉 Companion database seeding completed successfully!
```

### Integration with Existing Project

The seeder follows the existing project patterns:
- Uses the same database connection (`config/database.js`)
- Imports the Companion model (`models/Companion.js`)
- Follows the same error handling patterns
- Uses the same environment configuration

### Testing Features

The seeder is designed to support testing scenarios:
- Pagination testing (10 records)
- Search functionality (diverse names and interests)
- Filtering by personality types
- Age range filtering (23-35)
- Active/inactive status testing

### Maintenance

To update the companion data:
1. Modify the `companionSeedData` array in `companionSeeder.js`
2. Clear existing companions if needed
3. Run the seeder again

The seeder can also be imported as a module for use in tests or other scripts:

```javascript
const { seedCompanions, companionSeedData } = require('./seeders/companionSeeder');
```
