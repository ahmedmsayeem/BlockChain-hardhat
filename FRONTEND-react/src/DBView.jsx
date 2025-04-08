import React, { useState, useEffect } from "react";
import axios from "axios";

function DBView() {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isUpdateMode, setIsUpdateMode] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:4000";

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${apiUrl}/users`);
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const getMetaMaskAccount = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        if (accounts && accounts.length > 0) {
          alert(`MetaMask Account: ${accounts[0]}`);
          return accounts[0];
        } else {
          alert("No accounts found in MetaMask.");
          return null;
        }
      } catch (error) {
        console.error("Error fetching MetaMask account:", error);
        alert("Failed to fetch MetaMask account. Check the console for details.");
        return null;
      }
    } else {
      alert("MetaMask is not installed.");
      return null;
    }
  };

  const createUser = async () => {
    try {
      const account = await getMetaMaskAccount();
      if (!account) return;

      await axios.post(`${apiUrl}/users`, { name, email });
      setName("");
      setEmail("");
      fetchUsers();
      window.location.reload(); // Refresh the page
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  const updateUser = async () => {
    if (!selectedUserId) return;
    try {
      const account = await getMetaMaskAccount();
      if (!account) return;

      await axios.put(`${apiUrl}/users/${selectedUserId}`, { name, email });
      setName("");
      setEmail("");
      setSelectedUserId(null);
      setIsUpdateMode(false);
      fetchUsers();
      window.location.reload(); // Refresh the page
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const deleteUser = async (id) => {
    try {
      const account = await getMetaMaskAccount();
      if (!account) return;

      await axios.delete(`${apiUrl}/users/${id}`);
      fetchUsers();
      window.location.reload(); // Refresh the page
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleSelectUser = (user) => {
    setSelectedUserId(user.id);
    setName(user.name);
    setEmail(user.email);
    setIsUpdateMode(true);
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "20px" }}>
      <h2 style={{ color: "#333" }}>Users</h2>
      <ul style={{ listStyleType: "none", padding: 0 }}>
        {users.map((user) => (
          <li
            key={user.id}
            style={{
              borderBottom: "1px solid #eee",
              padding: "10px 0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>
              {user.name} ({user.email})
            </span>
            <div>
              <button
                onClick={() => handleSelectUser(user)}
                style={{
                  backgroundColor: "#4CAF50",
                  color: "white",
                  padding: "5px 10px",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  marginRight: "5px",
                }}
              >
                Update
              </button>
              <button
                onClick={() => deleteUser(user.id)}
                style={{
                  backgroundColor: "#f44336",
                  color: "white",
                  padding: "5px 10px",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div style={{ marginTop: "20px" }}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            padding: "8px",
            marginRight: "10px",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            padding: "8px",
            marginRight: "10px",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
        />
        {isUpdateMode ? (
          <button
            onClick={updateUser}
            style={{
              backgroundColor: "#008CBA",
              color: "white",
              padding: "10px 15px",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Update User
          </button>
        ) : (
          <button
            onClick={createUser}
            style={{
              backgroundColor: "#008CBA",
              color: "white",
              padding: "10px 15px",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Create User
          </button>
        )}
      </div>
    </div>
  );
}

export default DBView;
