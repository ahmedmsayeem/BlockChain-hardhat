"use client";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import LoggerABI from "./DBLogger.json"; // Adjust the path if needed

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// Define CSS styles as JavaScript objects
const styles = {
  container: {
    fontFamily: "monospace",
    backgroundColor: "#f3f4f6", // gray-100
    minHeight: "100vh",
    paddingTop: "3rem",
    paddingBottom: "3rem",
    paddingLeft: "1rem",
    paddingRight: "1rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  maxWidthContainer: {
    maxWidth: "48rem", // max-w-3xl
    marginLeft: "auto",
    marginRight: "auto",
    width: "100%",
  },
  title: {
    fontSize: "1.875rem", // text-3xl
    fontWeight: "bold",
    marginBottom: "1.5rem", // mb-6
    textAlign: "center",
    color: "#374151", // gray-800
  },
  subtitle: {
    textAlign: "center",
    marginBottom: "2rem", // mb-8
    fontSize: "0.875rem", // text-sm
    color: "#4b5563", // gray-600
  },
  status: {
    marginBottom: "2rem", // mb-8
    textAlign: "center",
  },
  logContainer: {
    position: "relative",
    width: "100%",
  },
  logItem: {
    position: "relative",
    marginBottom: "3rem", // mb-12
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  logCard: {
    backgroundColor: "#fff", // white
    border: "1px solid #e5e7eb", // gray-200
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    borderRadius: "0.75rem", // rounded-xl
    padding: "1.5rem", // p-6
    width: "100%",
    maxWidth: "32rem", // max-w-lg
    textAlign: "center",
  },
  logText: {
    color: "#4b5563", // gray-700
    marginBottom: "0.5rem",
  },
  connectorLine: {
    width: "0.0625rem", // w-1
    height: "2rem", // h-8
    backgroundColor: "#d1d5db", // gray-300
    borderRadius: "9999px",
  },
  connectorArrow: {
    color: "#9ca3af", // gray-400
    fontSize: "1.5rem", // text-2xl
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
          const { operation, table, rowId, dataHash } = log.args;
          return {
            operation,
            table,
            rowId: rowId.toString(),
            dataHash,
          };
        });

        setLogs(parsedLogs.reverse()); // Most recent first
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