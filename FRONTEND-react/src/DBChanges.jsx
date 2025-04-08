"use client";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import LoggerABI from "./DBLogger.json"; // Update path if needed

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Replace with actual address if different

// Styles
const styles = {
  container: {
    fontFamily: "monospace",
    backgroundColor: "#f3f4f6",
    minHeight: "100vh",
    padding: "3rem 1rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  maxWidthContainer: {
    maxWidth: "48rem",
    width: "100%",
    margin: "0 auto",
  },
  title: {
    fontSize: "1.875rem",
    fontWeight: "bold",
    marginBottom: "1.5rem",
    textAlign: "center",
    color: "#374151",
  },
  subtitle: {
    textAlign: "center",
    marginBottom: "2rem",
    fontSize: "0.875rem",
    color: "#4b5563",
  },
  status: {
    marginBottom: "2rem",
    textAlign: "center",
  },
  logContainer: {
    position: "relative",
    width: "100%",
  },
  logItem: {
    position: "relative",
    marginBottom: "3rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  logCard: {
    backgroundColor: "#fff",
    border: "1px solid #e5e7eb",
    boxShadow:
      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    borderRadius: "0.75rem",
    padding: "1.5rem",
    width: "100%",
    maxWidth: "32rem",
    textAlign: "center",
  },
  logText: {
    color: "#4b5563",
    marginBottom: "0.5rem",
  },
  connectorLine: {
    width: "0.0625rem",
    height: "2rem",
    backgroundColor: "#d1d5db",
    borderRadius: "9999px",
  },
  connectorArrow: {
    color: "#9ca3af",
    fontSize: "1.5rem",
  },
  semibold: {
    fontWeight: "600",
  },
};

export default function DBChangeLogs() {
  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState("Fetching logs...");

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
        const logger = new ethers.Contract(CONTRACT_ADDRESS, LoggerABI.abi, provider);

        const filter = logger.filters.DBChange();
        const events = await logger.queryFilter(filter);

        if (events.length === 0) {
          setStatus("No logs found.");
          return;
        }

        const parsedLogs = events.map((log) => {
          // const { operation, table, rowId, dataHash, data } = log.args;
          const operation = log.args[0];
          const table = log.args[1];
          const rowId = log.args[2];
          const dataHash = log.args[3];
          const data = log.args[4];
          const unixTime = log.args[5].toString(); // Convert BigNumber to string
          let dateObj = new Date(unixTime * 1000);
          let utcString = dateObj.toUTCString();
          const time = utcString.replace("GMT", "UTC"); // Format the date string



          
          console.log(log.args)
          return {
            operation,
            table,
            rowId: rowId.toString(),
            dataHash,
            data,
            time
          };
        });

        setLogs(parsedLogs.reverse());
        setStatus(`Fetched ${parsedLogs.length} logs ✅`);
      } catch (err) {
        console.error("Error fetching logs:", err);
        setStatus("Failed to fetch logs ❌");
      }
    };

    fetchLogs();
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.maxWidthContainer}>
        <h2 style={styles.title}>📄 DB Change Logs</h2>
        <p style={styles.subtitle}>Chronological order (most recent first)</p>
        <p style={styles.status}>{status}</p>

        {logs.length > 0 && (
          <div style={styles.logContainer}>
            {logs.map((log, idx) => (
              <div key={idx} style={styles.logItem}>
                <div style={styles.logCard}>
                  <p>{log.time}</p>
                  <p style={styles.logText}>
                    <span style={styles.semibold}>Operation:</span> {log.operation}
                  </p>
                  <p style={styles.logText}>
                    <span style={styles.semibold}>Table:</span> {log.table}
                  </p>
                  <p style={styles.logText}>
                    <span style={styles.semibold}>Row ID:</span> {log.rowId}
                  </p>
                  <p style={styles.logText}>
                    <span style={styles.semibold}>Data Hash:</span> {log.dataHash}
                  </p>
                  <p style={styles.logText}>
                    <span style={styles.semibold}>Data:</span>
                    <pre
                      style={{
                        whiteSpace: "pre-wrap",
                        textAlign: "left",
                        marginTop: "0.5rem",
                        color: "#1f2937",
                        backgroundColor: "#f9fafb",
                        padding: "0.5rem",
                        borderRadius: "0.5rem",
                      }}
                    >
                      {JSON.stringify(JSON.parse(log.data), null, 2)}
                    </pre>
                  </p>
                </div>
                {idx !== logs.length - 1 && (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={styles.connectorLine}></div>
                    <div style={styles.connectorArrow}>↓</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
