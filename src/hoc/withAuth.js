// src/hoc/withAuth.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Auth } from 'aws-amplify';

const withAuth = (WrappedComponent) => {
  return (props) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
      Auth.currentAuthenticatedUser()
        .then(() => {
          setIsAuthenticated(true);
          setLoading(false);
        })
        .catch(() => {
          router.push('/login');
        });
    }, [router]);

    if (loading) return null;

    return isAuthenticated ? <WrappedComponent {...props} /> : null;
  };
};

export default withAuth;
