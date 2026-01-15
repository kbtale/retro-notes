import { DataSource } from 'typeorm';
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
            console.log('⚠️  User "admin" already exists. Skipping seed.');
            return;
        }

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
