"use client";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import LoggerABI from "./DBLogger.json"; // Update path if needed
import { generateSQLCommandsFromLogs } from "./utils";
import axios from "axios"; // Import axios
import styles from "./DBChanges.module.css"; // Import CSS module

const CONTRACT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; // Replace with actual address if different

// Styles
const inlineStyles = {
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
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [generatedSql, setGeneratedSql] = useState("");
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
        const logger = new ethers.Contract(
          CONTRACT_ADDRESS,
          LoggerABI.abi,
          provider
        );

        const filter = logger.filters.DBChange();
        const events = await logger.queryFilter(filter);

        if (events.length === 0) {
          setStatus("No logs found.");
          return;
        }

        const parsedLogs = events.map((log) => {
          const operation = log.args[0];
          const table = log.args[1];
          const rowId = log.args[2];
          const dataHash = log.args[3];
          const data = log.args[4];
          const unixTime = log.args[5].toString();
          let dateObj = new Date(unixTime * 1000);
          let utcString = dateObj.toUTCString();
          const time = utcString.replace("GMT", "UTC");

          return {
            operation,
            table,
            rowId: rowId.toString(),
            dataHash,
            data,
            time,
            blockNumber: log.blockNumber, // Store block number
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

  const handleLogClick = async (blockNumber) => {
    setSelectedBlock(blockNumber);
    const filteredLogs = logs.filter((log) => log.blockNumber <= blockNumber);
    const sqlCommands = generateSQLCommandsFromLogs(filteredLogs);
    setGeneratedSql(sqlCommands.join("\n"));

    const confirmation = window.confirm(
      `Want to see Snapshot of DB @ Block${blockNumber}?`
    );

    if (confirmation) {
      try {
        // Call the /execute-commands endpoint
        const response = await axios.post(
          "http://localhost:4000/execute-commands",
          {
            commands: sqlCommands,
          },
          {
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*", //remove this in production
            },
          }
        );
        console.log("Commands executed successfully on the server");
        // alert("Commands executed successfully on the server"); // Optional: Provide user feedback
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000); // Hide after 3 seconds
      } catch (error) {
        console.error("Error executing commands on the server:", error);
        alert(`Error executing commands on the server: ${error}`); // Optional: Provide user feedback
      }
    } else {
      alert("Execution cancelled.");
    }
  };

  return (
    <div style={inlineStyles.container}>
      <div style={inlineStyles.maxWidthContainer}>
        <h2 style={inlineStyles.title}>📄 DB Change Logs</h2>
        <p style={inlineStyles.subtitle}>
          Chronological order (most recent first)
        </p>
        <p style={inlineStyles.status}>{status}</p>
        {selectedBlock && (
          <div>
            <h3>SQL Commands up to Block {selectedBlock}</h3>
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
              {generatedSql}
            </pre>
          </div>
        )}
        <br /><br />

        {logs.length > 0 && (
          <div style={inlineStyles.logContainer}>
            {logs.map((log, idx) => (
              <div
                key={idx}
                style={inlineStyles.logItem}
                onClick={() => handleLogClick(log.blockNumber)} // Add click handler
              >
                <div style={inlineStyles.logCard}>
                  <p>Block: {log.blockNumber}</p> {/* Display block number */}
                  <p>{log.time}</p>
                  <p style={inlineStyles.logText}></p>
                    <span style={inlineStyles.semibold}>Operation:</span>{" "}
                    {log.operation}
                 <p> </p>
                  <p style={inlineStyles.logText}>
                    <span style={inlineStyles.semibold}>Table:</span> {log.table}
                  </p>
                  <p style={inlineStyles.logText}>
                    <span style={inlineStyles.semibold}>Row ID:</span> {log.rowId}
                  </p>
                  <p style={inlineStyles.logText}>
                    <span style={inlineStyles.semibold}>Data Hash:</span>{" "}
                    {log.dataHash}
                  </p>
                  <p style={inlineStyles.logText}>
                    <span style={inlineStyles.semibold}>Data:</span>
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
                {idx !== logs.length - 1 ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <div style={inlineStyles.connectorLine}></div>
                    <div style={inlineStyles.connectorArrow}>↓</div>
                  </div>
                ) : null}
                
              </div>
            ))}
          </div>
        )}

        {showNotification && (
          <div className={styles.notification}>✅ Database Updated</div>
        )}
        
      </div>
    </div>
  );
}
