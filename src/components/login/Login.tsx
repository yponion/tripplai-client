"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { FaGoogle } from "react-icons/fa";
import { SiNaver } from "react-icons/si";
import { RiKakaoTalkFill } from "react-icons/ri";
import TermsModal from "@/components/modal/TermsModal";
import PrivacyModal from "@/components/modal/PrivacyModal";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { authApi } from "@/services/api";
import { v4 as uuidv4 } from "uuid";

interface LoginProps {
  onLoginSuccess?: () => void;
}

export default function Login(props?: LoginProps) {
  const { onLoginSuccess } = props || {};
  // 테스트 환경에서는 useSearchParams가 undefined일 수 있음
  const searchParamsHook = useSearchParams();
  const searchParams =
    typeof window !== "undefined"
      ? searchParamsHook
      : {
          get: () => null,
          has: () => false,
        };

  const router = useRouter();

  const [clientId, setClientId] = useState("");
  useEffect(() => {
    const token = sessionStorage.getItem("accessToken");
    if (token) router.push("/");

    const id = localStorage.getItem("clientId");
    if (id) {
      setClientId(id);
    } else {
      const id = uuidv4();
      localStorage.setItem("clientId", uuidv4());
      setClientId(id);
    }
  }, []);

  // 탭 전환
  const [isLoginTab, setIsLoginTab] = useState(true);

  // 로그인 입력 상태
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // 회원가입 입력 상태
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [nickname, setNickname] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [checkedEmail, setCheckedEmail] = useState("");
  const [certificationNumber, setCertificationNumber] = useState("");
  const [certificationSuccess, setCertificationSuccess] = useState(false);

  // 포커스를 주기위한
  // input ref
  const loginEmailRef = useRef<HTMLInputElement | null>(null);
  const loginPasswordRef = useRef<HTMLInputElement | null>(null);
  const signupEmailRef = useRef<HTMLInputElement | null>(null);
  const certificationNumberRef = useRef<HTMLInputElement | null>(null);
  const signupPasswordRef = useRef<HTMLInputElement | null>(null);
  const nicknameRef = useRef<HTMLInputElement | null>(null);
  const phoneNumberRef = useRef<HTMLInputElement | null>(null);
  const termsAcceptedRef = useRef<HTMLInputElement | null>(null);
  const privacyAcceptedRef = useRef<HTMLInputElement | null>(null);
  // button ref
  const duplicateCheckRef = useRef<HTMLButtonElement | null>(null);
  const certificationButtonRef = useRef<HTMLButtonElement | null>(null);

  // 에러 메시지
  const [loginErrorMessage, setLoginErrorMessage] = useState("");
  const [signupErrorMessage, setSignupErrorMessage] = useState("");
  enum AuthErrorMessage {
    EMAIL_REQUIRED = "이메일을 입력해 주세요.",
    PASSWORD_REQUIRED = "비밀번호를 입력해 주세요.",
    NICKNAME_REQUIRED = "닉네임을 입력해 주세요.",
    PHONE_NUMBER_REQUIRED = "전화번호를 입력해 주세요.",
    CERTIFICATION_NUMBER_REQUIRED = "인증번호를 입력해 주세요.",
    CERTIFICATION_NUMBER_CHECK = "인증번호를 확인해 주세요.",
    INVALID_CERTIFICATION_NUMBER = "인증번호가 일치하지 않습니다. 입력한 내용을 다시 확인해 주세요.",
    NICKNAME_TOO_SHORT = "닉네임은 2자 이상이어야 합니다.",
    PASSWORD_TOO_SHORT = "비밀번호는 6자 이상이어야 합니다.",
    INVALID_EMAIL = "이메일 형식이 잘못되었습니다.",
    DUPLICATE_CHECK_EMAIL = "이메일 중복 확인을 해주세요.",
    INVALID_PHONE_NUMBER = "전화번호 형식이 잘못되었습니다.",
    USER_NOT_FOUND = "이메일 혹은 비밀번호가 일치하지 않습니다. 입력한 내용을 다시 확인해 주세요.",
    DUPLICATE_EMAIL = "사용할 수 없는 이메일입니다. 다른 이메일을 입력해 주세요.",
    TERMS_ACCEPTED = "이용약관에 동의해 주세요.",
    PRIVACY_ACCEPTED = "개인정보처리방침에 동의해 주세요.",
  }

  // 회원가입 성공 상태
  const [successfulSignup, setSuccessfulSignup] = useState(false);

  // 회원가입 성공 시 토스트 메시지
  useEffect(() => {
    if (isLoginTab && successfulSignup) {
      toast.success("회원가입 성공! 로그인을 진행해 주세요.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
      loginEmailRef.current?.focus();
    }
  }, [isLoginTab, successfulSignup]);

  const oauthItems = [
    {
      titleKo: "구글",
      titleEn: "google",
      svg: <FaGoogle size={18} />,
      bgColor: "bg-[#4285F4]",
      textColor: "text-white",
      hoverColor: "hover:bg-[#3367D6]",
      borderColor: "",
      iconBox: "",
      customButton: false,
    },
    {
      titleKo: "네이버",
      titleEn: "naver",
      svg: <SiNaver size={20} className="font-bold" />,
      bgColor: "bg-[#03C75A]",
      textColor: "text-white",
      hoverColor: "hover:bg-[#02b350]",
      borderColor: "",
      iconBox: "",
      customButton: false,
    },
    {
      titleKo: "카카오",
      titleEn: "kakao",
      svg: <RiKakaoTalkFill size={20} />,
      bgColor: "bg-[#FEE500]",
      textColor: "text-gray-800",
      hoverColor: "hover:bg-[#FDD800]",
      borderColor: "",
      iconBox: "",
      customButton: false,
    },
  ];

  useEffect(() => {
    if (searchParams.has("error")) {
      setLoginErrorMessage(AuthErrorMessage.USER_NOT_FOUND);
      loginEmailRef.current?.focus();
    }
  }, [searchParams, AuthErrorMessage.USER_NOT_FOUND]);

  /** 이메일 입력 검증 로직 */
  const validateEmailInput = () => {
    if (!signupEmail) {
      signupEmailRef.current?.focus();
      setSignupErrorMessage(AuthErrorMessage.EMAIL_REQUIRED);
      return false;
    }

    if (!/^[a-zA-Z0-9]([a-zA-Z0-9._%+-]*[a-zA-Z0-9])?@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(signupEmail)) {
      signupEmailRef.current?.focus();
      setSignupErrorMessage(AuthErrorMessage.INVALID_EMAIL);
      return false;
    }

    return true;
  };

  /** 인증 번호 확인 */
  const handleCertification = async () => {
    setSignupErrorMessage("");

    if (!certificationNumber) {
      certificationNumberRef.current?.focus();
      setSignupErrorMessage(AuthErrorMessage.CERTIFICATION_NUMBER_REQUIRED);
      return;
    }

    const res = await authApi.checkCertification(signupEmail, certificationNumber);
    if (res.code === "SU") {
      signupPasswordRef.current?.focus();
      setCertificationSuccess(true);
    } else {
      certificationNumberRef.current?.focus();
      setSignupErrorMessage(AuthErrorMessage.INVALID_CERTIFICATION_NUMBER);
    }
  };

  /** 이메일 로그인 */
  const handleLocalLogin = async () => {
    setLoginErrorMessage("");

    if (!loginEmail) {
      loginEmailRef.current?.focus();
      setLoginErrorMessage(AuthErrorMessage.EMAIL_REQUIRED);
      return;
    }

    if (!loginPassword) {
      loginPasswordRef.current?.focus();
      setLoginErrorMessage(AuthErrorMessage.PASSWORD_REQUIRED);
      return;
    }

    try {
      const res = await authApi.login(loginEmail, loginPassword);

      // res가 없거나 code가 없는 경우 처리
      if (!res || !res.code) {
        setLoginErrorMessage("서버와의 연결에 문제가 있습니다. 다시 시도해주세요.");
        return;
      }

      if (res.code !== "SU") {
        setLoginErrorMessage(res.message || AuthErrorMessage.USER_NOT_FOUND);
        return;
      }

      sessionStorage.setItem("accessToken", res.accessToken);

      // 모달 기반 로그인이므로 콜백을 통해 모달을 닫음
      if (onLoginSuccess) {
        onLoginSuccess();
        // 페이지 새로고침으로 상태 동기화
        window.location.reload();
      } else {
        // 기존 방식 (페이지 리디렉션)
        window.location.replace("/");
      }
      // const accessToken = jwtDecode(res.accessToken);
      // const sub = JSON.parse(accessToken.sub as string);
    } catch (error) {
      console.error("💥 로그인 에러:", error);
      setLoginErrorMessage("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  /** 소셜 로그인 */
  const handleSocialLogin = (provider: string) => {
    router.push(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/oauth2/${provider}`);
  };

  /** 회원가입 */
  const handleSignup = async (e: React.KeyboardEvent | React.MouseEvent) => {
    e.preventDefault();
    setSignupErrorMessage("");
    setSuccessfulSignup(false);

    if (!nickname) {
      nicknameRef.current?.focus();
      setSignupErrorMessage(AuthErrorMessage.NICKNAME_REQUIRED);
      return;
    }

    if (nickname.length < 2) {
      nicknameRef.current?.focus();
      setSignupErrorMessage(AuthErrorMessage.NICKNAME_TOO_SHORT);
      return;
    }

    if (!validateEmailInput()) return;

    if (signupEmail !== checkedEmail) {
      duplicateCheckRef.current?.focus();
      setSignupErrorMessage(AuthErrorMessage.DUPLICATE_CHECK_EMAIL);
      return;
    }

    if (!certificationNumber) {
      certificationNumberRef.current?.focus();
      setSignupErrorMessage(AuthErrorMessage.CERTIFICATION_NUMBER_REQUIRED);
      return;
    }

    if (!certificationSuccess) {
      certificationButtonRef.current?.focus();
      setSignupErrorMessage(AuthErrorMessage.CERTIFICATION_NUMBER_CHECK);
      return;
    }

    if (!signupPassword) {
      signupPasswordRef.current?.focus();
      setSignupErrorMessage(AuthErrorMessage.PASSWORD_REQUIRED);
      return;
    }

    if (signupPassword.length < 6) {
      signupPasswordRef.current?.focus();
      setSignupErrorMessage(AuthErrorMessage.PASSWORD_TOO_SHORT);
      return;
    }

    if (!signupPassword) {
      signupPasswordRef.current?.focus();
      setSignupErrorMessage(AuthErrorMessage.PASSWORD_REQUIRED);
      return;
    }

    if (signupPassword.length < 6) {
      signupPasswordRef.current?.focus();
      setSignupErrorMessage(AuthErrorMessage.PASSWORD_TOO_SHORT);
      return;
    }

    if (!phoneNumber) {
      phoneNumberRef.current?.focus();
      setSignupErrorMessage(AuthErrorMessage.PHONE_NUMBER_REQUIRED);
      return;
    }

    if (!/^010\d{8}$/.test(phoneNumber)) {
      phoneNumberRef.current?.focus();
      setSignupErrorMessage(AuthErrorMessage.INVALID_PHONE_NUMBER);
      return;
    }

    if (!termsAccepted) {
      termsAcceptedRef.current?.focus();
      setSignupErrorMessage(AuthErrorMessage.TERMS_ACCEPTED);
      return;
    }

    if (!privacyAccepted) {
      privacyAcceptedRef.current?.focus();
      setSignupErrorMessage(AuthErrorMessage.PRIVACY_ACCEPTED);
      return;
    }

    try {
      const res = await authApi.signUp(nickname, signupEmail, signupPassword, phoneNumber);
      if (res?.code === "SU") {
        setNickname("");
        setSignupEmail("");
        setSignupPassword("");
        setPhoneNumber("");
        setTermsAccepted(false);
        setPrivacyAccepted(false);
        setIsLoginTab(true);
        setSuccessfulSignup(true);
      }
    } catch {
      signupEmailRef.current?.focus();
      setSignupErrorMessage(AuthErrorMessage.DUPLICATE_EMAIL);
    }
  };

  /** 이메일 중복 확인 */
  const handleEmailCheck = async () => {
    setSignupErrorMessage("");
    if (!validateEmailInput()) return;
    const res = await authApi.emailCheck(signupEmail);
    if (res?.code === "SU") {
      setCheckedEmail(signupEmail);
      certificationNumberRef.current?.focus();
      authApi.certification(signupEmail, clientId);
    } else {
      setCheckedEmail("");
      signupEmailRef.current?.focus();
      setSignupErrorMessage(AuthErrorMessage.DUPLICATE_EMAIL);
    }
  };

  const allAccepted = termsAccepted && privacyAccepted;

  return (
    <div className="w-dvw md:w-[500px] bg-white md:rounded-2xl max-md:h-dvh shadow-lg overflow-hidden">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-8 pt-6 pb-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">{isLoginTab ? "로그인" : "회원가입"}</h2>
        <button
          className="text-rose-500 bg-white font-medium transition-colors duration-200 text-sm px-4 py-2 rounded-full hover:bg-gray-50 border border-gray-200"
          onClick={() => setIsLoginTab(!isLoginTab)}
        >
          {isLoginTab ? "회원가입" : "로그인"}
        </button>
      </div>

      <div className="p-8 max-h-[calc(100dvh-86px)] md:max-h-[calc(100dvh-200px)] overflow-y-scroll">
        {isLoginTab ? (
          <>
            {/* 이메일 로그인 */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleLocalLogin();
              }}
              className="space-y-4"
            >
              <div>
                <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1">
                  이메일
                </label>
                <input
                  ref={loginEmailRef}
                  id="login-email"
                  type="email"
                  placeholder="이메일 주소를 입력하세요"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1">
                  비밀번호
                </label>
                <div className="relative">
                  <input
                    ref={loginPasswordRef}
                    id="login-password"
                    type={showLoginPassword ? "text" : "password"}
                    placeholder="비밀번호를 입력하세요"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 border-none bg-transparent"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    aria-label={showLoginPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                  >
                    {showLoginPassword ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end mt-1">
                <button type="button" className="text-sm text-gray-600 hover:text-rose-500 border-none bg-transparent">
                  비밀번호를 잊으셨나요?
                </button>
              </div>

              <button
                type="submit"
                className="w-full bg-rose-500 hover:bg-rose-600 text-white font-medium py-3 rounded-lg shadow-sm transition-colors duration-200 border-0"
              >
                로그인
              </button>

              <p className="text-xs text-rose-500">{loginErrorMessage}</p>
            </form>

            {/* 구분선 */}
            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-gray-200"></div>
              <span className="px-4 text-sm text-gray-500">또는</span>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>

            {/* oauth 로그인 */}
            <div className="space-y-3">
              {oauthItems.map((item) => (
                <button
                  key={item.titleEn}
                  className={`${
                    !item.customButton
                      ? `${item.bgColor} ${item.textColor} ${item.hoverColor} ${item.borderColor} flex items-center justify-center gap-3`
                      : `${item.hoverColor} ${item.borderColor} flex justify-center`
                  } w-full h-12 rounded-lg font-medium transition-colors duration-200 overflow-hidden border-none`}
                  onClick={() => handleSocialLogin(item.titleEn.toLowerCase())}
                >
                  {item.customButton ? (
                    item.svg
                  ) : (
                    <>
                      <span className={`flex items-center justify-center ${item.iconBox || ""}`}>{item.svg}</span>
                      <span>{`${item.titleKo}로 계속하기`}</span>
                    </>
                  )}
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* 회원가입 입력 필드 */}
            <div className="space-y-4">
              {/* 닉네임 */}
              <div>
                <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-1">
                  닉네임
                </label>
                <input
                  ref={nicknameRef}
                  id="nickname"
                  type="text"
                  placeholder="2자 이상의 닉네임"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSignup(e)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                />
              </div>

              {/* 이메일 */}
              <div className="relative">
                <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 mb-1">
                  이메일
                </label>
                <input
                  disabled={certificationSuccess}
                  ref={signupEmailRef}
                  id="signup-email"
                  type="email"
                  placeholder="이메일 주소"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSignup(e)}
                  className="w-full pl-4 pr-28 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all disabled:cursor-not-allowed"
                />
                <button
                  ref={duplicateCheckRef}
                  disabled={(!signupEmail && !checkedEmail) || signupEmail === checkedEmail}
                  className="absolute right-2 top-[33px] w-24 h-10 rounded-lg border-none text-sm bg-gray-200 hover:bg-gray-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                  onClick={() => handleEmailCheck()}
                >
                  {!!signupEmail && signupEmail === checkedEmail ? "사용 가능" : "중복 확인"}
                </button>
              </div>

              {/* 인증번호 */}
              <div
                className={`relative overflow-hidden transition-all ${
                  !!signupEmail && signupEmail === checkedEmail ? "h-[84px]" : "h-0"
                }`}
              >
                <label htmlFor="signup-certification" className="block text-sm font-medium text-gray-700 mb-1">
                  인증번호
                </label>
                <input
                  ref={certificationNumberRef}
                  disabled={certificationSuccess}
                  id="signup-certification"
                  type="text"
                  placeholder="이메일로 전송된 인증번호를 입력해 주세요"
                  value={certificationNumber}
                  onChange={(e) => setCertificationNumber(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSignup(e)}
                  className="w-full pl-4 pr-28 py-3 border border-gray-300 rounded-lg outline-none focus:ring-inset focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all disabled:cursor-not-allowed"
                />
                <button
                  ref={certificationButtonRef}
                  disabled={certificationSuccess}
                  onClick={handleCertification}
                  className="absolute right-2 top-[33px] w-24 h-10 rounded-lg border-none text-sm bg-gray-200 hover:bg-gray-300  disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                >
                  인증번호 확인
                </button>
              </div>

              {/* 비밀번호 */}
              <div>
                <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 mb-1">
                  비밀번호
                </label>
                <div className="relative">
                  <input
                    ref={signupPasswordRef}
                    id="signup-password"
                    type={showSignupPassword ? "text" : "password"}
                    placeholder="6자 이상의 비밀번호"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSignup(e)}
                    className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 border-none bg-transparent"
                    onClick={() => setShowSignupPassword(!showSignupPassword)}
                    aria-label={showSignupPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                  >
                    {showSignupPassword ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
                  </button>
                </div>
              </div>

              {/* 전화번호 */}
              <div>
                <label htmlFor="phone-number" className="block text-sm font-medium text-gray-700 mb-1">
                  전화번호
                </label>
                <input
                  ref={phoneNumberRef}
                  id="phone-number"
                  type="tel"
                  placeholder="숫자만 입력 (01012345678)"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSignup(e)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all appearance-none"
                />
              </div>

              {/* 약관 동의 체크박스 */}
              <div className="space-y-2 mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2">
                  <input
                    ref={termsAcceptedRef}
                    type="checkbox"
                    id="terms"
                    checked={termsAccepted}
                    onChange={() => setTermsAccepted(!termsAccepted)}
                    onKeyDown={(e) => e.key === "Enter" && handleSignup(e)}
                    className="w-4 h-4 accent-rose-500 rounded cursor-pointer"
                  />
                  <label htmlFor="terms" className="text-gray-700 cursor-pointer">
                    <button
                      type="button"
                      onClick={() => setIsTermsModalOpen(true)}
                      className="text-rose-500 hover:text-rose-600 hover:underline bg-transparent border-0 font-medium text-base"
                    >
                      이용약관
                    </button>
                    에 동의합니다 (필수)
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    ref={privacyAcceptedRef}
                    type="checkbox"
                    id="privacy"
                    checked={privacyAccepted}
                    onChange={() => setPrivacyAccepted(!privacyAccepted)}
                    onKeyDown={(e) => e.key === "Enter" && handleSignup(e)}
                    className="w-4 h-4 accent-rose-500 rounded cursor-pointer"
                  />
                  <label htmlFor="privacy" className="text-gray-700 cursor-pointer">
                    <button
                      type="button"
                      onClick={() => setIsPrivacyModalOpen(true)}
                      className="text-rose-500 hover:text-rose-600 hover:underline bg-transparent border-0 font-medium text-base"
                    >
                      개인정보처리방침
                    </button>
                    에 동의합니다 (필수)
                  </label>
                </div>
              </div>

              {/* 에러 메시지 */}
              <p className="text-xs text-rose-500">{signupErrorMessage}</p>

              {/* 회원가입 버튼 */}
              <button
                onClick={handleSignup}
                disabled={!allAccepted}
                className={`w-full mt-4 font-medium py-3 rounded-lg shadow-sm transition-all duration-200 border-0 ${
                  allAccepted
                    ? "bg-rose-500 hover:bg-rose-600 text-white"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                회원가입
              </button>
            </div>
          </>
        )}
      </div>

      {/* 약관 모달 */}
      {isTermsModalOpen && (
        <TermsModal
          isOpen={isTermsModalOpen}
          onClose={() => setIsTermsModalOpen(false)}
          onAccept={() => {
            setTermsAccepted(true);
            setIsTermsModalOpen(false);
          }}
        />
      )}

      {/* 개인정보처리방침 모달 */}
      {isPrivacyModalOpen && (
        <PrivacyModal
          isOpen={isPrivacyModalOpen}
          onClose={() => setIsPrivacyModalOpen(false)}
          onAccept={() => {
            setPrivacyAccepted(true);
            setIsPrivacyModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
