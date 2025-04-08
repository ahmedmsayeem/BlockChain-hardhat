import React, { useState, useEffect } from "react";
import axios from "axios";

function DBView() {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isUpdateMode, setIsUpdateMode] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://localhost:4000/users");
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const createUser = async () => {
    try {
      await axios.post("http://localhost:4000/users", { name, email });
      setName("");
      setEmail("");
      fetchUsers();
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  const updateUser = async () => {
    if (!selectedUserId) return;
    try {
      await axios.put(`http://localhost:4000/users/${selectedUserId}`, {
        name,
        email,
      });
      setName("");
      setEmail("");
      setSelectedUserId(null);
      setIsUpdateMode(false);
      fetchUsers();
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const deleteUser = async (id) => {
    try {
      await axios.delete(`http://localhost:4000/users/${id}`);
      fetchUsers();
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
    <div>
      <h2>Users</h2>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.name} ({user.email})
            <button onClick={() => handleSelectUser(user)}>Update</button>
            <button onClick={() => deleteUser(user.id)}>Delete</button>
          </li>
        ))}
      </ul>

      <div>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {isUpdateMode ? (
          <button onClick={updateUser}>Update User</button>
        ) : (
          <button onClick={createUser}>Create User</button>
        )}
      </div>
    </div>
  );
}

export default DBView;
