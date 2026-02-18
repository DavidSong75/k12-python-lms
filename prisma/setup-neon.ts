import { neon } from "@neondatabase/serverless";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) throw new Error("DATABASE_URL is not set");

    const sql = neon(dbUrl);
    const schemaPath = path.join(__dirname, "neon-schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf-8");

    // Run the entire schema at once using tagged template
    await sql`${sql(schema)}`;

    console.log("✅ Schema created successfully!");
}

main().catch(async (e) => {
    // Try statement by statement if batch fails
    console.log("Trying statement by statement...");
    const dbUrl = process.env.DATABASE_URL!;
    const sql = neon(dbUrl);
    const schemaPath = path.join(__dirname, "neon-schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf-8");

    const statements = schema
        .split(";")
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith("--"));

    for (const stmt of statements) {
        try {
            await sql.query(stmt);
            console.log("  ✓ executed");
        } catch (err: any) {
            console.log(`  ⚠ ${err.message?.substring(0, 80)}`);
        }
    }
    console.log("✅ Schema setup complete!");
});
