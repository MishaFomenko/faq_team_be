import { MigrationInterface, QueryRunner } from 'typeorm';

export class AllTables1719083735694 implements MigrationInterface {
  name = 'AllTables1719083735694';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`follows\` (\`id\` varchar(255) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`follower_id\` varchar(255) NOT NULL, \`following_id\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`products\` (\`id\` varchar(255) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`vendor_id\` varchar(255) NOT NULL, \`product_name\` varchar(255) NOT NULL, \`description\` longtext NOT NULL, \`quantity\` int NOT NULL, \`price\` double NOT NULL, \`category\` varchar(255) NOT NULL, \`color\` varchar(255) NOT NULL, \`size\` varchar(255) NOT NULL, \`style\` varchar(255) NOT NULL, \`image\` varchar(255) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`orders\` (\`id\` varchar(255) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`product_id\` varchar(255) NOT NULL, \`buyer_id\` varchar(255) NOT NULL, \`price\` double NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`rates\` (\`id\` varchar(255) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`rate\` int NOT NULL DEFAULT '5', \`rater_id\` varchar(255) NOT NULL, \`user_target_id\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`reviews\` (\`id\` varchar(255) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`review_text\` longtext NOT NULL, \`reviewer_id\` varchar(255) NOT NULL, \`review_target_id\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`users\` (\`id\` varchar(255) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`full_name\` varchar(255) NOT NULL, \`email\` varchar(255) NOT NULL, \`password\` varchar(255) NULL, \`is_verified\` tinyint NOT NULL DEFAULT 0, \`filled_profile_step\` int NOT NULL DEFAULT '0', \`otp_code\` varchar(255) NULL, \`user_status\` varchar(255) NOT NULL DEFAULT 'registration', \`is_deleted_by_admin\` tinyint NOT NULL DEFAULT 0, \`user_role\` varchar(255) NULL, \`avatar\` varchar(255) NULL, \`phone\` varchar(255) NULL, \`address\` varchar(255) NULL, \`address_2\` varchar(255) NULL, \`country\` varchar(255) NULL, \`state\` varchar(255) NULL, \`city\` varchar(255) NULL, \`cloth_size\` varchar(255) NULL, \`jeans_size\` varchar(255) NULL, \`shoes_size\` double NULL, \`avgRate\` int NULL, \`stripe_id\` varchar(255) NULL, \`payment_method_id\` varchar(255) NULL, UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`follows\` ADD CONSTRAINT \`FK_54b5dc2739f2dea57900933db66\` FOREIGN KEY (\`follower_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`follows\` ADD CONSTRAINT \`FK_c518e3988b9c057920afaf2d8c0\` FOREIGN KEY (\`following_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`products\` ADD CONSTRAINT \`FK_0e859a83f1dd6b774c20c02885d\` FOREIGN KEY (\`vendor_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_ac832121b6c331b084ecc4121fd\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_5e90e93d0e036c3fadbaefa4d0a\` FOREIGN KEY (\`buyer_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`rates\` ADD CONSTRAINT \`FK_4715a581a186022fc5200e39a67\` FOREIGN KEY (\`rater_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`rates\` ADD CONSTRAINT \`FK_bf45dce89a559cad5fd035868de\` FOREIGN KEY (\`user_target_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`reviews\` ADD CONSTRAINT \`FK_92e950a2513a79bb3fab273c92e\` FOREIGN KEY (\`reviewer_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`reviews\` ADD CONSTRAINT \`FK_c142da7577c373a3210865e9a9e\` FOREIGN KEY (\`review_target_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`reviews\` DROP FOREIGN KEY \`FK_c142da7577c373a3210865e9a9e\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`reviews\` DROP FOREIGN KEY \`FK_92e950a2513a79bb3fab273c92e\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`rates\` DROP FOREIGN KEY \`FK_bf45dce89a559cad5fd035868de\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`rates\` DROP FOREIGN KEY \`FK_4715a581a186022fc5200e39a67\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_5e90e93d0e036c3fadbaefa4d0a\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_ac832121b6c331b084ecc4121fd\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`products\` DROP FOREIGN KEY \`FK_0e859a83f1dd6b774c20c02885d\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`follows\` DROP FOREIGN KEY \`FK_c518e3988b9c057920afaf2d8c0\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`follows\` DROP FOREIGN KEY \`FK_54b5dc2739f2dea57900933db66\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\``,
    );
    await queryRunner.query(`DROP TABLE \`users\``);
    await queryRunner.query(`DROP TABLE \`reviews\``);
    await queryRunner.query(`DROP TABLE \`rates\``);
    await queryRunner.query(`DROP TABLE \`orders\``);
    await queryRunner.query(`DROP TABLE \`products\``);
    await queryRunner.query(`DROP TABLE \`follows\``);
  }
}
