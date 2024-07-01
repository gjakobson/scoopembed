import { useState, useEffect } from 'react';
import { Auth } from 'aws-amplify';
import { useRouter } from 'next/router';
import Typography from "@mui/material/Typography";
import Input from '@/components/Input/Input';
import Button from '@/components/Button/Button';
import { Box } from "@mui/material";
import ScoopLogo from '../../public/logo/ScoopLogo.svg';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();
  const { redirect } = router.query;

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await Auth.signIn(username, password);
      router.push(redirect || '/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box sx={{ width: '100vw', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Box sx={{ width: '440px' }}>
        <Box sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '32px',
          paddingBottom: '40px'
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <ScoopLogo alt={'ScoopLogo'} />
          </Box>
          <Typography sx={{
            color: 'black',
            fontFamily: 'Inter',
            textAlign: 'center',
            fontSize: '32px',
            fontStyle: 'normal',
            fontWeight: '400',
            lineHeight: '110%',
            letterSpacing: '-0.64px'
          }}>
            {!isLogin ? 'Start your 30 day free trial' : 'Login to Scoop'}
          </Typography>
        </Box>
        <Box
          id={'login-input-container'}
          sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}
        >
          {!isLogin && (
            <Box className={'loginInput-no-margin'} sx={{ display: 'flex', flexDirection: 'column' }}>
              <Input
                type={'text'}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                sx={{ "& .MuiTextField-root input": { margin: '0 !important' } }}
                label={'Full name'}
              />
            </Box>
          )}
          <Box className={'loginInput-no-margin'} sx={{ display: 'flex', flexDirection: 'column' }}>
            <Input
              type={'email'}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              sx={{ "& .MuiTextField-root input": { margin: '0 !important' } }}
              label={'Email address'}
            />
          </Box>
          <Box className={'loginInput-no-margin'} sx={{ display: 'flex', flexDirection: 'column' }}>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ "& .MuiTextField-root input": { margin: '0 !important' } }}
              label={'Password'}
            />
          </Box>
        </Box>
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <Box sx={{ width: '100%' }}>
            <Button
              onClick={handleLogin}
              sx={{ marginTop: '24px' }}
              className={'button-purple small'}
              fullWidth
              disabled={!username || !password}
            >
              Login
            </Button>
          </Box>


        </Box>

      </Box>
    </Box>
  );
};

export default Login;
