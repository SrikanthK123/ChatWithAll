import { useState, useEffect } from "react";

export const LoginUsers = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchAuthenticatedUser = async () => {
      // Replace with your API endpoint for the current user
      const response = await fetch("/api/authenticated-user");
      const data = await response.json();
      setUser(data.user);
    };

    fetchAuthenticatedUser();
  }, []);

  return { user };
};
