import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useEffect,
  useState,
  useRef,
} from 'react';
import apiRequest from '../request';

interface UserProviderProps {
  children: ReactNode;
}

interface User {
  isLoggedIn: boolean;
  setIsLoggedIn: Dispatch<SetStateAction<boolean>>;
}

const UserContext = createContext<User | null>(null);

const UserProvider = ({ children }: UserProviderProps) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    if (!isMounted.current && isLoggedIn === false) {
      localStorage.setItem('accessToken', '');
    }
  }, [isLoggedIn]);

  useEffect(() => {
    isMounted.current = false;

    const checkLoginStatus = async () => {
      try {
        const userInfo = await apiRequest.getUserInfo();

        if (userInfo) {
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error(error);
      }
    };

    checkLoginStatus();
  }, []);

  return (
    <UserContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>{children}</UserContext.Provider>
  );
};

export default UserProvider;
export { UserContext };
