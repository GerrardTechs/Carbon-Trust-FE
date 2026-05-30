import { useState } from "react";
import { authCss } from "./styles/authStyles.js";
import { sendVerification, registerCompany, registerLandlord } from "./api/authApi.js";
import { WelcomePage } from "./pages/WelcomePage.jsx";
import { RolePage } from "./pages/RolePage.jsx";
import { RegisterPage } from "./pages/RegisterPage.jsx";
import { LoginCompany } from "./pages/LoginCompany.jsx";
import { LoginLandlord } from "./pages/LoginLandlord.jsx";
import { AdminLoginPage } from "./pages/AdminLoginPage.jsx";
import { VerifyEmailPage } from "./pages/VerifyEmailPage.jsx";
import { OperationalPage } from "./pages/OperationalPage.jsx";
import { CalcMethodPage } from "./pages/CalcMethodPage.jsx";
import { SuccessPage } from "./pages/SuccessPage.jsx";

/**
 * Auth orchestrator: welcome → role → register/login → verify → operational → calcmethod → dashboard
 */
export default function AuthFlow({ onComplete, initialLang = "id" }) {
  const urlToken = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search).get("verifyToken")
    : null;

  const [step, setStep] = useState(urlToken ? "verify" : "welcome");
  const [pendingEmail] = useState(() =>
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("email")
      : null
  );
  const [role, setRole] = useState(null);
  const [lang, setLang] = useState(initialLang);
  const [userData, setUserData] = useState(null);
  const [operationalData, setOperationalData] = useState(null);
  const [verificationToken, setVerificationToken] = useState(urlToken || "");

  function handleRoleSelect(roleVal) {
    setRole(roleVal);
    if (roleVal === "admin") {
      setStep("adminLogin");
    } else {
      setStep("register");
    }
  }

  function handleGuest() {
    if (onComplete) onComplete("guest", null, lang);
  }

  function handleLoginSuccess(user, token) {
    if (onComplete) onComplete(user.role, user, lang, token);
  }

  async function handleRegister(formData) {
    const result = await sendVerification({
      name: formData.name,
      email: formData.email,
      username: formData.username,
      password: formData.password,
      role,
      phone: formData.phone,
      location: formData.location,
    });

    if (!result.success) {
      alert(result.message || "Gagal mengirim email verifikasi");
      return false;
    }

    setUserData(formData);
    setStep("verify");
    return true;
  }

  const handleFinalSubmit = async (finalCalcData) => {
    const completeData = {
      ...userData,
      ...operationalData,
      ...finalCalcData,
      verificationToken,
      calcMethod: finalCalcData?.calcMethod,
      equityPct: finalCalcData?.equityShare,
    };

    try {
      const result = await registerCompany(completeData);
      if (result.success) {
        setStep("success");
        setTimeout(() => {
          if (onComplete) onComplete(result.user.role, result.user, lang, result.token);
        }, 2000);
      } else {
        alert(result.message || "Gagal registrasi.");
      }
    } catch {
      alert("Gagal terhubung ke backend.");
    }
  };

  async function registerLandlordAfterVerify(token) {
    try {
      const result = await registerLandlord({ ...userData, verificationToken: token });
      if (result.success) {
        setStep("success");
        setTimeout(() => {
          if (onComplete) onComplete(result.user.role, result.user, lang, result.token);
        }, 2000);
      } else {
        alert(result.message || "Gagal registrasi landlord.");
      }
    } catch {
      alert("Gagal terhubung ke backend.");
    }
  }

  function handleVerified(tokenFromEmail) {
    setVerificationToken(tokenFromEmail);
    if (typeof window !== "undefined" && window.history.replaceState) {
      const url = new URL(window.location.href);
      url.searchParams.delete("verifyToken");
      url.searchParams.delete("email");
      window.history.replaceState({}, "", url.pathname);
    }
    if (role === "company") {
      setStep("operational");
    } else if (role === "landlord") {
      registerLandlordAfterVerify(tokenFromEmail); // ← pass langsung, tidak tunggu setState
    }
  }

  function goToLogin() {
    setStep(role === "company" ? "loginCompany" : "loginLandlord");
  }

  return (
    <>
      <style>{authCss}</style>

      {step === "welcome" && (
        <WelcomePage onContinue={() => setStep("role")} lang={lang} setLang={setLang} />
      )}

      {step === "role" && (
        <RolePage
          onSelect={handleRoleSelect}
          onGuest={handleGuest}
          onBack={() => setStep("welcome")}
          lang={lang}
        />
      )}

      {step === "register" && (
        <RegisterPage
          role={role}
          onSubmit={handleRegister}
          onBack={() => setStep("role")}
          onGoToLogin={goToLogin}
          lang={lang}
        />
      )}

      {step === "loginCompany" && (
        <LoginCompany
          lang={lang}
          onBack={() => setStep("register")}
          onGoToRegister={() => setStep("register")}
          onSuccess={handleLoginSuccess}
        />
      )}

      {step === "loginLandlord" && (
        <LoginLandlord
          lang={lang}
          onBack={() => setStep("register")}
          onGoToRegister={() => setStep("register")}
          onSuccess={handleLoginSuccess}
        />
      )}

      {step === "adminLogin" && (
        <AdminLoginPage
          lang={lang}
          onBack={() => setStep("role")}
          onSuccess={(user, token) => onComplete?.("admin", user, lang, token)}
        />
      )}

      {step === "verify" && (
        <VerifyEmailPage
          email={userData?.email || pendingEmail}
          role={role}
          userData={userData}
          initialToken={urlToken || verificationToken}
          onVerified={handleVerified}
          onBack={() => setStep(userData ? "register" : "welcome")}
          onResend={userData ? () => sendVerification({
            name: userData.name,
            email: userData.email,
            username: userData.username,
            password: userData.password,
            role,
            phone: userData.phone,
            location: userData.location,
          }).then(r => r.success) : null}
          lang={lang}
        />
      )}

      {step === "operational" && (
        <OperationalPage
          onSubmit={data => {
            setOperationalData(data);
            setStep("calcmethod");
          }}
          onBack={() => setStep("verify")}
          lang={lang}
        />
      )}

      {step === "calcmethod" && (
        <CalcMethodPage
          onSubmit={handleFinalSubmit}
          onBack={() => setStep("operational")}
          lang={lang}
        />
      )}

      {step === "success" && (
        <SuccessPage role={role} name={userData?.name} lang={lang} />
      )}
    </>
  );
}