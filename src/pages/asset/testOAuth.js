// src/pages/asset/testOAuth.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Auth } from 'aws-amplify';

const TestOAuth = () => {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await Auth.currentSession();
        const jwtToken = session.getIdToken().getJwtToken();
        setToken(jwtToken);
      } catch (error) {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!token) {
    return <p>Redirecting to login...</p>;
  }

  return (
    <div>
      <h1>Authenticated</h1>
      <p>Your JWT Token: {token}</p>
    </div>
  );
};

export default TestOAuth;
