type LogEntry = {
    operation: string; // "INSERT", "UPDATE", "DELETE"
    table: string;
    rowId: string | number;
    dataHash: string;
    data: string; // assumed to be a JSON string like { sql: "...", values: [...] }
    time: string; // readable time
  };
  
 export const generateSQLCommandsFromLogs = (logs: LogEntry[]): string[] => {
    return logs.map((log) => {
      let { operation, table, data, time } = log;
      let parsedData;
      try {
        parsedData = JSON.parse(data);
      } catch (e) {
        console.warn("Invalid JSON in data:", data);
        return `⚠️ Invalid data format`;
      }
  
      const { sql, values } = parsedData;
      if (!sql || !Array.isArray(values)) {
        return `⚠️ Missing SQL or values`;
      }
  
      // Replace each `?` in the SQL with corresponding value
      let filledSQL = sql;
      values.forEach((value) => {
        const safeVal = typeof value === "string" ? `'${value.replace(/'/g, "''")}'` : value;
        filledSQL = filledSQL.replace("?", safeVal);
      });
  
      return `${filledSQL};`;
    });
  };
