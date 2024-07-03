import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Auth } from 'aws-amplify';

const withAuth = (WrappedComponent) => {
  return (props) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { invite } = router.query;

    useEffect(() => {
      if (invite) {
        const token = invite.split('=')[1];
        setIsAuthenticated(true);
        setLoading(false);
        props.token = token;
      } else {
        Auth.currentAuthenticatedUser()
          .then(() => {
            setIsAuthenticated(true);
            setLoading(false);
          })
          .catch(() => {
            router.push('/login');
          });
      }
    }, [invite, router]);

    if (loading) return null;

    return isAuthenticated ? <WrappedComponent {...props} /> : null;
  };
};

export default withAuth;
