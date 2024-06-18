import { MigrationInterface, QueryRunner } from "typeorm";

export class Current1718712097871 implements MigrationInterface {
    name = 'Current1718712097871'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`users\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`full_name\` varchar(255) NULL, \`email\` varchar(255) NOT NULL, \`password\` varchar(255) NULL, \`is_verified\` tinyint NOT NULL DEFAULT 0, \`filled_profile_step\` int NOT NULL DEFAULT '0', \`otp_code\` varchar(255) NULL, \`user_status\` varchar(255) NOT NULL DEFAULT 'registration', \`is_deleted_by_admin\` tinyint NOT NULL DEFAULT 0, \`user_role\` varchar(255) NULL, \`avatar\` varchar(255) NULL, \`phone\` varchar(255) NULL, \`address\` varchar(255) NULL, \`address_2\` varchar(255) NULL, \`country\` varchar(255) NULL, \`state\` varchar(255) NULL, \`city\` varchar(255) NULL, \`cloth_size\` varchar(255) NULL, \`jeans_size\` varchar(255) NULL, \`shoes_size\` double NULL, \`stripe_id\` varchar(255) NULL, \`payment_method_id\` varchar(255) NULL, UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`rates\` ADD CONSTRAINT \`FK_0810693cc6a896e6802ee3b44a9\` FOREIGN KEY (\`rater\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`rates\` ADD CONSTRAINT \`FK_1f612c036c94794df8d71d1fbaf\` FOREIGN KEY (\`rate_target_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`reviews\` ADD CONSTRAINT \`FK_92e950a2513a79bb3fab273c92e\` FOREIGN KEY (\`reviewer_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`reviews\` ADD CONSTRAINT \`FK_c142da7577c373a3210865e9a9e\` FOREIGN KEY (\`review_target_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`reviews\` DROP FOREIGN KEY \`FK_c142da7577c373a3210865e9a9e\``);
        await queryRunner.query(`ALTER TABLE \`reviews\` DROP FOREIGN KEY \`FK_92e950a2513a79bb3fab273c92e\``);
        await queryRunner.query(`ALTER TABLE \`rates\` DROP FOREIGN KEY \`FK_1f612c036c94794df8d71d1fbaf\``);
        await queryRunner.query(`ALTER TABLE \`rates\` DROP FOREIGN KEY \`FK_0810693cc6a896e6802ee3b44a9\``);
        await queryRunner.query(`DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\``);
        await queryRunner.query(`DROP TABLE \`users\``);
    }

}
