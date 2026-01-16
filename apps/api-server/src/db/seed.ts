import { DataSource, IsNull } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Note } from '../notes/entities/note.entity';
import { Category } from '../categories/entities/category.entity';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [User, Note, Category],
    synchronize: true,
});

async function run() {
    console.log('🌱 Starting database seed...');

    try {
        await dataSource.initialize();
        const userRepository = dataSource.getRepository(User);

        // 2. Check if admin already exists
        const adminExists = await userRepository.findOneBy({
            username: 'admin',
        });

        if (adminExists) {
            console.log('⚠️  User "admin" already exists. Skipping user creation.');
        } else {
            // 3. Create the Admin User
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash('admin123', salt);

            const admin = userRepository.create({
                username: 'admin',
                passwordHash: passwordHash,
            });

            await userRepository.save(admin);
            console.log(
                '🌱 Seed successful: Created user "admin" with password "admin123"',
            );
        }

        // Get admin user for category usage (either existing or new)
        const adminUser = adminExists || await userRepository.findOneBy({ username: 'admin' });

        // 4. Create Default Categories
        const categoryRepository = dataSource.getRepository(Category);

        const defaultCategories = [
            { name: 'Work', user: null }, // Global
            { name: 'Personal', user: null }, // Global
            { name: 'Ideas', user: adminUser }, // Personal for admin
        ];

        for (const cat of defaultCategories) {
            const exists = await categoryRepository.findOne({
                where: {
                    name: cat.name,
                    user: cat.user ? { id: cat.user.id } : IsNull(),
                },
            });

            if (!exists) {
                const category = categoryRepository.create({
                    name: cat.name,
                    user: cat.user,
                });
                await categoryRepository.save(category);
                console.log(`   - Created category: ${cat.name} (${cat.user ? 'Personal' : 'Global'})`);
            }
        }
        
    } catch (error) {
        console.error('❌ Seed failed:', error);
    } finally {
        await dataSource.destroy();
        process.exit(0);
    }
}

run().catch((error) => {
    console.error('❌ Unexpected error during seeding:', error);
    process.exit(1);
});
