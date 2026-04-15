"use client"

import { useState, useEffect } from "react"
import { Play, Database, Terminal, AlertCircle, CheckCircle2, Server } from "lucide-react"
import { Button } from "@/components/ui/button"
import { executeSqlQuery, fetchSystemTables } from "@/lib/actions/sql"

export default function SqlConsolePage() {
  const [query, setQuery] = useState("SELECT * FROM profiles LIMIT 5;")
  const [result, setResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tables, setTables] = useState<string[]>([])

  useEffect(() => {
    // Fetch available tables on load
    fetchSystemTables().then(res => {
      if (res.success && res.data) {
        setTables(res.data);
      }
    });
  }, []);

  const handleExecute = async () => {
    if (!query.trim()) return
    
    setIsLoading(true)
    setError(null)
    setResult(null)
    
    try {
      const response = await executeSqlQuery(query)
      if (response.success) {
        setResult(response.data)
      } else {
        setError(response.error || "Execution failed")
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle tab key in textarea to insert spaces instead of changing focus
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const newQuery = query.substring(0, start) + "  " + query.substring(end);
      setQuery(newQuery);
      
      // We need a slight delay to set cursor position after React re-renders
      setTimeout(() => {
        const textarea = document.getElementById('sql-editor') as HTMLTextAreaElement;
        if (textarea) {
          textarea.selectionStart = textarea.selectionEnd = start + 2;
        }
      }, 0);
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleExecute();
    }
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-background p-6 pt-24">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Terminal className="h-6 w-6 text-primary" />
            SQL Console
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Execute SQL queries directly against your Supabase instance using Service Role bypass.
            <br />
            <span className="text-xs text-primary/80">Try: Ctrl+Enter to execute. Supported operations: SELECT, WHERE (simple), LIMIT.</span>
          </p>
        </div>
        
        <div className="flex bg-secondary/50 rounded-lg p-3 text-xs gap-4 border border-border">
            <div className="flex items-center gap-2 text-muted-foreground">
                <Database className="h-4 w-4" />
                <span>Connected: Active</span>
            </div>
            <div className="flex items-center gap-2 text-primary">
                <Server className="h-4 w-4" />
                <span>Service Role Auth</span>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 flex-1 min-h-0">
        
        {/* Editor & Results Area */}
        <div className="flex flex-col gap-4 min-h-0">
          
          {/* Editor Box */}
          <div className="flex-shrink-0 flex flex-col rounded-xl border border-border bg-[#0d1117] overflow-hidden shadow-sm">
            <div className="bg-[#161b22] px-4 py-2 border-b border-border/40 flex items-center justify-between">
              <span className="text-xs text-gray-400 font-mono">public / query.sql</span>
              <Button 
                size="sm" 
                onClick={handleExecute} 
                disabled={isLoading}
                className="h-7 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isLoading ? (
                  <span className="animate-pulse">Executing...</span>
                ) : (
                  <>
                    <Play className="h-3 w-3 mr-1" /> Execute
                  </>
                )}
              </Button>
            </div>
            <textarea
              id="sql-editor"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent p-4 text-sm font-mono text-blue-300 focus:outline-none resize-none min-h-[160px]"
              placeholder="Enter SQL query here..."
              spellCheck={false}
            />
          </div>

          {/* Results Box */}
          <div className="flex-1 rounded-xl border border-border bg-card overflow-hidden flex flex-col shadow-sm">
            <div className="bg-muted px-4 py-2 flex items-center justify-between border-b border-border">
              <span className="text-sm font-medium">Output</span>
              {result && Array.isArray(result) && (
                <span className="text-xs text-muted-foreground">{result.length} row(s) returned</span>
              )}
            </div>
            <div className="flex-1 overflow-auto p-4 relative bg-[#0f172a]">
              {error ? (
                <div className="flex flex-col items-center justify-center p-8 text-center h-full">
                  <AlertCircle className="h-8 w-8 text-destructive mb-2" />
                  <p className="text-destructive font-mono text-sm max-w-lg">{error}</p>
                </div>
              ) : result ? (
                 <div className="overflow-x-auto">
                    {Array.isArray(result) && result.length > 0 ? (
                        <table className="w-full text-sm text-left font-mono">
                            <thead className="text-xs text-gray-400 uppercase bg-[#1e293b]">
                                <tr>
                                    {Object.keys(result[0]).map((key) => (
                                        <th key={key} scope="col" className="px-4 py-3 border-b border-[#334155] whitespace-nowrap">
                                            {key}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {result.map((row, index) => (
                                    <tr key={index} className="bg-transparent border-b border-[#334155]/50 hover:bg-[#1e293b]/50">
                                        {Object.keys(result[0]).map((key) => (
                                            <td key={`${index}-${key}`} className="px-4 py-2 text-gray-300 truncate max-w-[200px]" title={String(row[key])}>
                                                {typeof row[key] === 'object' ? JSON.stringify(row[key]) : String(row[key])}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-8 text-center h-full">
                            <CheckCircle2 className="h-8 w-8 text-emerald-500 mb-2" />
                            <p className="text-emerald-500/80 font-mono text-sm">Query executed successfully but returned 0 rows.</p>
                        </div>
                    )}
                 </div>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground/50 text-sm font-mono">
                  Ready to execute query
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Schema Explorer */}
        <div className="hidden lg:flex flex-col rounded-xl border border-border bg-card overflow-hidden shadow-sm h-full">
          <div className="bg-muted px-4 py-3 flex items-center justify-between border-b border-border">
            <span className="text-sm font-semibold">Schema Explorer</span>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            <div className="text-xs font-semibold text-muted-foreground mb-2 px-2 pt-2 uppercase tracking-wider">public</div>
            <ul className="space-y-1">
              {tables.map(table => (
                <li key={table}>
                  <button 
                    onClick={() => setQuery(`SELECT * FROM ${table} LIMIT 10;`)}
                    className="w-full text-left px-3 py-2 rounded-md text-sm text-foreground hover:bg-secondary/80 flex items-center gap-2 transition-colors"
                  >
                     <div className="w-1.5 h-1.5 rounded-full bg-primary/60"></div>
                     {table}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>
    </div>
  )
}
