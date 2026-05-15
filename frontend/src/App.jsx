import React, { useEffect, useState } from "react";
import { getUsers, createUser } from "./api";

const App = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data.data);
    } catch (error) {
      console.log(error);
    }
  };

  const addUser = async () => {
    try {
      const response = await createUser({
        name: "New User",
      });

      console.log(response);
      fetchUsers();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <h1>User Lists test 1</h1>

      {users.map((user) => (
        <p key={user.id}>{user.name}</p>
      ))}

      <button onClick={addUser}>Add User</button>
    </div>
  );
};

export default App;
