const blockchainNodes = [
    {
      timestamp: "Tue, 08 Apr 2025 14:12:55 UTC",
      operation: "DELETE",
      table: "users",
      rowId: 1,
      data: {
        sql: "DELETE FROM users WHERE id = ?",
        values: [1]
      }
    },
    {
      timestamp: "Tue, 08 Apr 2025 14:13:00 UTC",
      operation: "INSERT",
      table: "users",
      rowId: 1,
      data: {
        sql: "INSERT INTO users (name, email) VALUES (?, ?)",
        values: ["M Sayeem Ahmed", "nnm22is083@nmamit.in"]
      }
    }
  ];
  
  // Set the point in time (UTC string)
  const targetTime = new Date("Tue, 08 Apr 2025 14:13:00 UTC");
  
  function recreateSQL(nodes, targetTime) {
    return nodes
      .filter(node => new Date(node.timestamp) <= targetTime)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)) // Ensure chronological order
      .map(node => {
        const { sql, values } = node.data;
        // Replace `?` with actual values safely
        let sqlString = sql;
        values.forEach(value => {
          const val = typeof value === "string" ? `'${value}'` : value;
          sqlString = sqlString.replace("?", val);
        });
        return `-- ${node.timestamp}\n${sqlString};\n`;
      })
      .join("\n");
  }
  
  // Usage
  const sqlAtTime = recreateSQL(blockchainNodes, targetTime);
  console.log(sqlAtTime);
  