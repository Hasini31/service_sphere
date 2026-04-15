"use server"

import { createAdminClient } from '../supabase/admin'

export async function executeSqlQuery(query: string) {
  try {
    const supabase = createAdminClient()
    const cleanQuery = query.trim().replace(/;$/, '');
    
    // Attempt basic parsing for SELECT queries to fulfill the "SQL Editor" request
    // using the Supabase Javascript Client
    
    // Pattern: SELECT [columns] FROM [table] ...
    const selectPattern = /^SELECT\s+(.*?)\s+FROM\s+([a-zA-Z0-9_]+)(.*?)$/i;
    const match = cleanQuery.match(selectPattern);
    
    if (match) {
      const columns = match[1].trim() === '*' ? '*' : match[1].trim();
      const table = match[2].trim();
      const rest = match[3] ? match[3].trim() : '';

      let builder = supabase.from(table).select(columns);

      // Handle simple WHERE clause (e.g. WHERE role = 'client')
      if (rest.toUpperCase().includes('WHERE')) {
        const whereMatch = rest.match(/WHERE\s+([a-zA-Z0-9_]+)\s*(=|>|<|>=|<=|!=)\s*('.*?'|".*?"|[a-zA-Z0-9_]+)/i);
        if (whereMatch) {
          const col = whereMatch[1];
          const op = whereMatch[2];
          const val = whereMatch[3].replace(/^['"]|['"]$/g, '');
          
          if (op === '=') builder = builder.eq(col, val);
          else if (op === '>') builder = builder.gt(col, val);
          else if (op === '<') builder = builder.lt(col, val);
          else if (op === '>=') builder = builder.gte(col, val);
          else if (op === '<=') builder = builder.lte(col, val);
          else if (op === '!=') builder = builder.neq(col, val);
        }
      }

      // Handle simple LIMIT clause
      if (rest.toUpperCase().includes('LIMIT')) {
        const limitMatch = rest.match(/LIMIT\s+(\d+)/i);
        if (limitMatch) {
          builder = builder.limit(parseInt(limitMatch[1], 10));
        }
      }

      const { data, error } = await builder;
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      return { success: true, data };
    }
    
    // If we can't parse it as SELECT, we fallback to a warning.
    return { 
      success: false, 
      error: 'Query format not supported by this proxy interface. Please use basic SELECT statements (e.g., SELECT * FROM profiles LIMIT 10). DDL statements require a raw Postgres connection rather than the API key.' 
    };

  } catch (error: any) {
    return { success: false, error: error.message || 'An unknown error occurred' };
  }
}

export async function fetchSystemTables() {
  // Since we can't query information_schema easily via the REST API without an RPC,
  // we will return a hardcoded list of known tables for the autocomplete UI.
  return {
    success: true,
    data: ['profiles', 'services', 'contracts', 'issues', 'ratings', 'notifications']
  };
}
