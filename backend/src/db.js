"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = exports.pool = void 0;
const pg_1 = require("pg");
const supabase_js_1 = require("@supabase/supabase-js");
exports.pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
});
exports.supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
