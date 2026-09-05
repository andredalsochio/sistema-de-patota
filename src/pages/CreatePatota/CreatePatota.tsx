import { useRef, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button"; // Import Button for a better UI component
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import InputAdornment from "@mui/material/InputAdornment";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import TextField from "@mui/material/TextField";
import PermIdentityIcon from "@mui/icons-material/PermIdentity";
import { NumericFormat } from "react-number-format";
import { toast, ToastContainer } from "react-toastify";

import AccountCircle from "@mui/icons-material/AccountCircle";
import { useNavigate } from "react-router-dom";
import type { PatotaDto } from "../../dto/PatotaDto";
import { DateHelper } from "../../helpers/DateHelper";
import { apiUrl } from "../../Constants";
import { clearAuthToken, getAuthHeaders } from "../../helpers/auth";

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

const CreatePatota = () => {
  const [isButtonValid, setIsButtonValid] = useState(false);
  const patotaTitle = useRef<HTMLInputElement | null>(null);
  const patotaOwner = useRef<HTMLInputElement | null>(null);
  const monthlyValue = useRef<HTMLInputElement | null>(null);
  const maxPlayers = useRef<HTMLInputElement | null>(null);
  const patotaDate = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();

  function ValidateForm() {
    const isValid =
      patotaTitle.current?.value !== "" &&
      patotaOwner.current?.value !== "" &&
      monthlyValue.current?.value !== "" &&
      maxPlayers.current?.value !== "" &&
      patotaDate.current?.value !== "";
    setIsButtonValid(!!isValid);
  }

  const handleSubmit = async () => {
    const request = await fetch(`${apiUrl}/patotas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: buildDto(),
    });

    if (request.status === 401) {
      clearAuthToken();
      toast.error("Sua sessao expirou. Faca login novamente.");
      navigate("/", { replace: true });
      return;
    }

    if (request.ok) {
      toast.success("Patota criada com sucesso!");
      navigate("/patotas");
      return;
    }
    toast.error("Erro ao criar patota. Tente novamente.");
  };

  const buildDto = () => {
    const dto: PatotaDto = {
      title: patotaTitle.current?.value || "",
      patotaOwner: patotaOwner.current?.value || "",
      patotaDate: patotaDate.current?.value
        ? DateHelper.FormatDateToUTC(patotaDate.current.value)
        : new Date().toISOString(),
      amountPlayers: parseInt(maxPlayers.current?.value || "0"),
      monthlyValue: parseFloat(monthlyValue.current?.value || "0"),
    };
    return JSON.stringify(dto);
  };

  const buttonStyle =
    "w-full p-3 rounded-lg text-white font-bold transition duration-300 ease-in-out" +
    (isButtonValid
      ? " bg-red-600 hover:bg-red-700"
      : " bg-gray-400 cursor-not-allowed");

  return (
    <>
      <div className="w-screen h-screen p-4 min-h-screen flex justify-center items-center">
        <div className="max-w-md w-full text-center">
          <h1 className="text-gray-800 text-3xl font-semibold mb-8 tracking-wide">
            Nova Patota ⚽
          </h1>
          <div className="flex flex-col gap-4 pb-4">
            <Box>
              <TextField
                fullWidth
                label="Nome da Patota"
                variant="outlined"
                inputRef={patotaTitle}
                sx={textFieldCustomStyle}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SportsSoccerIcon color="error" />{" "}
                    </InputAdornment>
                  ),
                }}
                onChange={() => {
                  ValidateForm();
                }}
              />
            </Box>

            <Box>
              <TextField
                fullWidth
                label="Dono da Patota"
                variant="outlined"
                inputRef={patotaOwner}
                sx={textFieldCustomStyle}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AccountCircle color="error" />
                    </InputAdornment>
                  ),
                }}
                onChange={() => {
                  ValidateForm();
                }}
              />
            </Box>
            <Box>
              <NumericFormat
                customInput={TextField}
                fullWidth
                label="Valor Mensal (R$)"
                variant="outlined"
                inputRef={monthlyValue}
                sx={textFieldCustomStyle}
                thousandSeparator="."
                decimalSeparator=","
                prefix="R$ "
                decimalScale={2}
                fixedDecimalScale
                allowNegative={false}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AttachMoneyIcon color="error" />
                    </InputAdornment>
                  ),
                }}
                onValueChange={(values) => {
                  monthlyValue.current = {
                    value: values.value,
                  } as HTMLInputElement;
                  ValidateForm();
                }}
              />
            </Box>
            <Box>
              <TextField
                fullWidth
                label="Número Máximo de Jogadores"
                inputRef={maxPlayers}
                type="number"
                variant="outlined"
                sx={textFieldCustomStyle}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PermIdentityIcon color="error" />
                    </InputAdornment>
                  ),
                }}
                onChange={() => {
                  ValidateForm();
                }}
              />
            </Box>

            <Box>
              <TextField
                fullWidth
                label="Data da Patota"
                inputRef={patotaDate}
                type="date"
                variant="outlined"
                sx={textFieldCustomStyle}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PermIdentityIcon color="error" />
                    </InputAdornment>
                  ),
                }}
                onChange={() => {
                  ValidateForm();
                }}
              />
            </Box>

            <Button
              className={buttonStyle}
              onClick={handleSubmit}
              disabled={!isButtonValid}
              variant="contained"
              sx={{
                bgcolor: "red",
              }}
            >
              Adicionar Nova
            </Button>
            <Button
              onClick={() => navigate("/patotas")}
              variant="outlined"
              sx={{
                borderColor: "red",
                color: "red",
                minHeight: 48,
                textTransform: "none",
                fontWeight: 700,
                "&:hover": {
                  borderColor: "#b91c1c",
                  color: "#b91c1c",
                },
              }}
            >
              Voltar para Patotas
            </Button>
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
};

export default CreatePatota;
