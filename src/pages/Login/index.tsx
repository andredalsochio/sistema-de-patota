import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import LockOutlineIcon from "@mui/icons-material/LockOutline";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import { ToastContainer, toast } from "react-toastify";
import { apiUrl } from "../../Constants";
import {
  extractTokenFromLoginResponse,
  isAuthenticated,
  saveAuthToken,
} from "../../helpers/auth";

const primaryColor = "#ef4444";
const hoverColor = "#dc2626";
const focusColor = "#b91c1c";

const textFieldCustomStyle = {
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: primaryColor,
    },
    "&:hover fieldset": {
      borderColor: hoverColor,
    },
    "&.Mui-focused fieldset": {
      borderColor: focusColor,
    },
  },
  "& .MuiInputLabel-root": {
    color: primaryColor,
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: focusColor,
  },
};

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/patotas", { replace: true });
    }
  }, [navigate]);

  const isFormValid = email.trim() !== "" && password.trim() !== "";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isFormValid || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${apiUrl}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      if (!response.ok) {
        toast.error("E-mail ou senha invalidos.");
        return;
      }

      const data = await response.json();
      const token = extractTokenFromLoginResponse(data);

      if (!token) {
        toast.error("Login realizado, mas a API nao retornou um token valido.");
        return;
      }

      saveAuthToken(token);
      toast.success("Login realizado com sucesso!");
      navigate("/patotas", { replace: true });
    } catch {
      toast.error("Nao foi possivel entrar. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="min-h-screen w-screen bg-[radial-gradient(circle_at_top,_#fef2f2,_#fecaca_35%,_#f3f4f6_72%)] px-6 py-10">
        <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl items-center justify-center">
          <div className="grid w-full overflow-hidden rounded-[2rem] bg-white shadow-2xl lg:grid-cols-[1.1fr_0.9fr]">
            <section className="hidden bg-red-600 p-10 text-white lg:flex lg:flex-col lg:justify-between">
              <div className="flex items-center gap-3 text-2xl font-semibold tracking-wide">
                <SportsSoccerIcon fontSize="large" />
                <span>Sistema de Patota</span>
              </div>
              <div className="space-y-4">
                <p className="text-sm uppercase tracking-[0.35em] text-red-100">
                  Gerencie suas partidas
                </p>
                <h1 className="text-4xl font-bold leading-tight">
                  Entre para acompanhar, criar e editar suas patotas.
                </h1>
                <p className="max-w-md text-red-50">
                  Um acesso rapido para centralizar os grupos ativos e manter
                  tudo organizado em um unico lugar.
                </p>
              </div>
              <p className="text-sm text-red-100">
                Use suas credenciais cadastradas no back-end.
              </p>
            </section>

            <section className="flex items-center justify-center p-6 sm:p-10">
              <div className="w-full max-w-md">
                <div className="mb-8 space-y-2 text-center lg:text-left">
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-500">
                    Acesso
                  </p>
                  <h2 className="text-3xl font-bold text-slate-900">Login</h2>
                  <p className="text-sm text-slate-500">
                    Informe seu e-mail e sua senha para continuar.
                  </p>
                </div>

                <form className="space-y-5" onSubmit={handleSubmit}>
                  <TextField
                    fullWidth
                    type="email"
                    label="E-mail"
                    value={email}
                    sx={textFieldCustomStyle}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <MailOutlineIcon color="error" />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    fullWidth
                    type="password"
                    label="Senha"
                    value={password}
                    sx={textFieldCustomStyle}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="current-password"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockOutlineIcon color="error" />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    disabled={!isFormValid || isSubmitting}
                    sx={{
                      minHeight: 52,
                      borderRadius: "0.9rem",
                      backgroundColor: "#dc2626",
                      fontWeight: 700,
                      textTransform: "none",
                      "&:hover": {
                        backgroundColor: "#b91c1c",
                      },
                    }}
                  >
                    {isSubmitting ? "Entrando..." : "Entrar"}
                  </Button>

                  <Button
                    fullWidth
                    type="button"
                    variant="outlined"
                    onClick={() => {
                      saveAuthToken("dummy-dev-token");
                      toast.success("Login via Modo Desenvolvedor!");
                      navigate("/patotas", { replace: true });
                    }}
                    sx={{
                      minHeight: 52,
                      borderRadius: "0.9rem",
                      borderColor: "#dc2626",
                      color: "#dc2626",
                      fontWeight: 700,
                      textTransform: "none",
                      "&:hover": {
                        borderColor: "#b91c1c",
                        backgroundColor: "#fef2f2",
                      },
                    }}
                  >
                    Entrar modo Desenvolvedor (Bypass)
                  </Button>
                </form>
              </div>
            </section>
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}

export default Login;
