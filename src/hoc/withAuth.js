import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Auth } from 'aws-amplify';

const withAuth = (WrappedComponent) => {
  return (props) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(null);  // Add token state
    const router = useRouter();
    const { invite } = props; // Use invite from props

    useEffect(() => {
      if (invite) {
        const tokenValue = invite.split('=')[1];
        console.log('Setting invite token to: ', tokenValue);
        setIsAuthenticated(true);
        setLoading(false);
        setToken(tokenValue);  // Set token value
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

    return isAuthenticated ? <WrappedComponent {...props} token={token} /> : null;  // Pass token as a prop
  };
};

export default withAuth;
