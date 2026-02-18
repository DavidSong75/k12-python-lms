import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import * as fs from "fs";
import * as path from "path";

async function main() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) throw new Error("DATABASE_URL is not set");

    // Cast to any to avoid TypeScript errors with dynamic queries
    const sql = neon(dbUrl) as any;

    const schemaPath = path.join(__dirname, "neon-schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf-8");

    // Split by semicolons and run each statement
    const statements = schema
        .split(";")
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith("--"));

    console.log(`Found ${statements.length} statements. Executing...`);

    for (const stmt of statements) {
        try {
            // Use the function call signature which works at runtime but might have strict types
            await sql(stmt);
            console.log("  ✓ executed");
        } catch (err: any) {
            console.log(`  ⚠ ${err.message?.substring(0, 80)}`);
        }
    }

    console.log("✅ Schema setup complete!");
}

main().catch((e) => { console.error(e); process.exit(1); });
