import { useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button"; // Import Button for a better UI component
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import InputAdornment from "@mui/material/InputAdornment";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import TextField from "@mui/material/TextField";
import PermIdentityIcon from "@mui/icons-material/PermIdentity";
import { NumericFormat } from "react-number-format";
import { ToastContainer, toast } from "react-toastify";

import AccountCircle from "@mui/icons-material/AccountCircle";
import { useNavigate, useParams } from "react-router-dom";
import { apiUrl, yellowStandardSecondary } from "../../Constants";
import { ResponsePatotaDto } from "../../dto/ResponsePatotaDto";
import { PatotaDto } from "../../dto/PatotaDto";
import { DateHelper } from "../../helpers/DateHelper";
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

const EditPatota = () => {
  const [isButtonValid, setIsButtonValid] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [patotaCost, setPatotaCost] = useState("");
  const patotaTitle = useRef<HTMLInputElement | null>(null);
  const patotaOwner = useRef<HTMLInputElement | null>(null);
  const maxPlayers = useRef<HTMLInputElement | null>(null);
  const patotaDate = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();
  const { patotaId } = useParams<{ patotaId?: string | undefined }>();

  useEffect(() => {
    const getPatotaData = async (id: string) => {
      const response = await fetch(`${apiUrl}/patotas/${id}`, {
        headers: getAuthHeaders(),
      });

      if (response.status === 401) {
        clearAuthToken();
        toast.error("Sua sessao expirou. Faca login novamente.", {
          delay: 100,
          position: "top-right",
        });
        navigate("/", { replace: true });
        return;
      }

      if (!response.ok) {
        toast.error("Erro ao carregar dados da patota.", {
          delay: 100,
          position: "top-right",
        });
        return;
      }
      const data = await response.json();
      return ResponsePatotaDto.fromJson(data);
    };

    if (!patotaId) {
      toast.error("Patota nao encontrada.");
      navigate("/patotas", { replace: true });
      return;
    }

    getPatotaData(patotaId).then((data) => {
      if (!data) {
        return;
      }

      patotaTitle.current!.value = data.title;
      patotaOwner.current!.value = data.patotaOwner;
      maxPlayers.current!.value = data.amountPlayers.toString();
      setPatotaCost(data.monthlyValue.toFixed(2));
      patotaDate.current!.value = data.patotaDate.toISOString().split("T")[0];
    });
  }, [navigate, patotaId]);

  function ValidateForm() {
    const isValid =
      isEditMode &&
      patotaTitle.current?.value !== "" &&
      patotaOwner.current?.value !== "" &&
      patotaCost !== "" &&
      maxPlayers.current?.value !== "";
    setIsButtonValid(!!isValid);
  }

  const handleSubmit = async () => {
    const isValid = patotaTitle.current?.value && patotaOwner.current?.value;
    setIsButtonValid(!!isValid);

    const dto: PatotaDto = {
      title: patotaTitle.current?.value || "",
      patotaOwner: patotaOwner.current?.value || "",
      patotaDate: patotaDate.current?.value
        ? DateHelper.FormatDateToUTC(patotaDate.current.value)
        : new Date().toISOString(),
      amountPlayers: parseInt(maxPlayers.current?.value || "0"),
      monthlyValue: parseFloat(patotaCost),
    };

    const result = await fetch(`${apiUrl}/patotas/${patotaId}`, {
      method: "PUT",
      body: JSON.stringify(dto),
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
    });

    if (result.status === 401) {
      clearAuthToken();
      toast.error("Sua sessao expirou. Faca login novamente.");
      navigate("/", { replace: true });
      return;
    }

    if (!result.ok) {
      toast.error("Erro ao editar patota. Tente novamente.");
      return;
    }

    toast.success("Patota atualizada com sucesso!", {
      delay: 100,
      position: "top-right",
      autoClose: 3000,
    });
    navigate("/patotas");
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
            Editar Patota ⚽
          </h1>
          <div className="flex flex-col gap-4 pb-4">
            <Box>
              <TextField
                fullWidth
                label="Nome da Patota"
                variant="outlined"
                inputRef={patotaTitle}
                sx={textFieldCustomStyle}
                disabled={!isEditMode}
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
                disabled={!isEditMode}
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
                value={patotaCost}
                sx={textFieldCustomStyle}
                thousandSeparator="."
                decimalSeparator=","
                prefix="R$ "
                decimalScale={2}
                fixedDecimalScale
                disabled={!isEditMode}
                allowNegative={false}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AttachMoneyIcon color="error" />
                    </InputAdornment>
                  ),
                }}
                onValueChange={(values) => {
                  setPatotaCost(values.value);
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
                disabled={!isEditMode}
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
                disabled={!isEditMode}
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
            {isEditMode ? (
              <>
                <Button
                  className={buttonStyle}
                  onClick={handleSubmit}
                  disabled={!isButtonValid}
                  variant="contained"
                  sx={{
                    bgcolor: "red",
                  }}
                >
                  Salvar Alterações
                </Button>
                <Button
                  className={buttonStyle}
                  onClick={() => setIsEditMode(!isEditMode)}
                  variant="contained"
                  sx={{
                    bgcolor: yellowStandardSecondary,
                  }}
                >
                  Cancelar
                </Button>
              </>
            ) : (
              <Button
                className={buttonStyle}
                onClick={() => setIsEditMode(!isEditMode)}
                variant="contained"
                sx={{
                  bgcolor: "red",
                }}
              >
                Editar
              </Button>
            )}
          </div>
        </div>
        <ToastContainer />
      </div>
      <ToastContainer />
    </>
  );
};

export default EditPatota;
