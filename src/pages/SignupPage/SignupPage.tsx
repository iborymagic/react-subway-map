import {
  FormEventHandler,
  ChangeEventHandler,
  useState,
  useContext,
  KeyboardEventHandler,
} from 'react';
import { MdEmail, MdLock, MdPerson } from 'react-icons/md';
import { Redirect, useHistory } from 'react-router-dom';

import { Box, Button, Input, Icon, InputContainer, Heading1 } from '../../components/shared';

import { UserContext } from '../../contexts/UserContextProvider';
import { ThemeContext } from '../../contexts/ThemeContextProvider';
import { SnackBarContext } from '../../contexts/SnackBarProvider';

import { SIGNUP_VALUE } from '../../constants/values';
import PATH from '../../constants/path';
import PALETTE from '../../constants/palette';
import { ERROR_MESSAGE, SUCCESS_MESSAGE } from '../../constants/messages';

import useDebounce from '../../hooks/useDebounce';
import useInput from '../../hooks/useInput';
import apiRequest from '../../request';
import { PageProps } from '../types';
import { Form } from './SignupPage.style';
import {
  isEmailFormatValid,
  isAgeValid,
  isPasswordValid,
  isPasswordMatched,
  emailMessage,
  ageErrorMessage,
  passwordErrorMessage,
  passwordMatchedErrorMessage,
  isFormCompleted,
} from '../../utils/validations/signupValidation';

const DEBOUNCE_DELAY = 500;

const SignupPage = ({ setIsLoading }: PageProps) => {
  const history = useHistory();
  const themeColor = useContext(ThemeContext)?.themeColor ?? PALETTE.WHITE;
  const addMessage = useContext(SnackBarContext)?.addMessage;
  const isLoggedIn = useContext(UserContext)?.isLoggedIn;

  const [email, setEmail] = useState<string>('');
  const [isEmailDuplicated, setIsEmailDuplicated] = useState<boolean>(false);
  const [age, onAgeChange] = useInput('');
  const [password, onPasswordChange] = useInput('');
  const [passwordConfirm, onPasswordConfirmChange] = useInput('');

  const checkEmailDuplicated = useDebounce(async (value: string) => {
    try {
      const response = await apiRequest.checkEmailDuplicated(value);

      setIsEmailDuplicated(response);
    } catch (error) {
      console.error(error);

      addMessage?.(ERROR_MESSAGE.DEFAULT);
    }
  }, DEBOUNCE_DELAY);

  if (isLoggedIn) {
    return <Redirect to={PATH.ROOT} />;
  }

  const onEmailChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setEmail(event.target.value);
    checkEmailDuplicated(event.target.value);
  };

  const onPasswordKeydown: KeyboardEventHandler<HTMLInputElement> = (event) => {
    const el = event.target as HTMLInputElement;

    if (event.getModifierState('CapsLock')) {
      el.setCustomValidity('CapsLock이 켜져 있습니다.');
      el.reportValidity();
    } else {
      el.setCustomValidity('');
    }
  };

  const onSignup: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    if (!isFormCompleted(isEmailDuplicated, { email, age, password, passwordConfirm })) {
      return;
    }

    const timer = setTimeout(() => setIsLoading(true), 500);

    try {
      await apiRequest.signup({ email, password, age: Number(age) });
      addMessage?.(SUCCESS_MESSAGE.SIGNUP);
      history.push(PATH.LOGIN);
    } catch (error) {
      console.error(error);
      addMessage?.(ERROR_MESSAGE.DEFAULT);
    } finally {
      clearTimeout(timer);
      setIsLoading(false);
    }
  };

  return (
    <Box hatColor={themeColor} backgroundColor={PALETTE.WHITE}>
      <Heading1 marginBottom="2rem">회원가입</Heading1>
      <Form onSubmit={onSignup}>
        <InputContainer
          validation={{
            text: emailMessage(email, isEmailDuplicated),
            isValid: isEmailFormatValid(email) && !isEmailDuplicated,
          }}
        >
          <Icon>
            <MdEmail />
          </Icon>
          <Input
            type="email"
            placeholder="이메일을 입력하세요"
            value={email}
            onChange={onEmailChange}
            autoComplete="off"
            aria-label="이메일 입력"
          />
        </InputContainer>
        <InputContainer validation={{ text: ageErrorMessage(age), isValid: isAgeValid(age) }}>
          <Icon>
            <MdPerson />
          </Icon>
          <Input
            type="text"
            placeholder="나이를 입력하세요"
            maxLength={SIGNUP_VALUE.AGE_MAX_LENGTH}
            value={age}
            onChange={onAgeChange}
            autoComplete="off"
            aria-label="나이 입력"
          />
        </InputContainer>
        <InputContainer
          validation={{ text: passwordErrorMessage(password), isValid: isPasswordValid(password) }}
        >
          <Icon>
            <MdLock />
          </Icon>
          <Input
            type="password"
            placeholder="비밀번호를 입력하세요"
            value={password}
            onChange={onPasswordChange}
            onKeyDown={onPasswordKeydown}
            autoComplete="off"
            aria-label="비밀번호 입력"
          />
        </InputContainer>
        <InputContainer
          validation={{
            text: passwordMatchedErrorMessage(password, passwordConfirm),
            isValid: isPasswordMatched(password, passwordConfirm),
          }}
        >
          <Icon>
            <MdLock />
          </Icon>
          <Input
            type="password"
            placeholder="비밀번호를 한번 더 입력하세요"
            value={passwordConfirm}
            onChange={onPasswordConfirmChange}
            onKeyDown={onPasswordKeydown}
            autoComplete="off"
            aria-label="비밀번호 확인 입력"
          />
        </InputContainer>
        <Button
          size="m"
          width="100%"
          backgroundColor={themeColor}
          color={PALETTE.WHITE}
          disabled={!isFormCompleted(isEmailDuplicated, { email, age, password, passwordConfirm })}
        >
          회원가입
        </Button>
      </Form>
    </Box>
  );
};

export default SignupPage;
