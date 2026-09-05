import { useEffect, useState } from "react";
import CardModel from "../../components/PatotaCardModel";
import { useNavigate } from "react-router-dom";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import type { ResponsePatotaDto } from "../../dto/ResponsePatotaDto";
import { toast, ToastContainer } from "react-toastify";
import { apiUrl } from "../../Constants";
import { clearAuthToken, getAuthHeaders } from "../../helpers/auth";

const PatotaList = () => {
  const navigate = useNavigate();

  const [patotas, setPatotas] = useState<ResponsePatotaDto[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiResponse = await fetch(`${apiUrl}/patotas`, {
          headers: getAuthHeaders(),
        });

        if (apiResponse.status === 401) {
          clearAuthToken();
          toast.error("Sua sessao expirou. Faca login novamente.");
          navigate("/", { replace: true });
          return;
        }

        if (!apiResponse.ok) {
          toast.error("Erro ao carregar patotas.");
          return;
        }

        const data = await apiResponse.json();
        setPatotas(data);
      } catch {
        toast.error("Erro ao carregar patotas.");
      }
    };

    fetchData();
  }, [navigate]);

  const onDeleteFunction: (id: string) => Promise<void> = async (
    id: string
  ) => {
    try {
      const result = await fetch(`${apiUrl}/patotas/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (result.status === 401) {
        clearAuthToken();
        toast.error("Sua sessao expirou. Faca login novamente.");
        navigate("/", { replace: true });
        return;
      }

      if (!result.ok) {
        toast.error("Erro ao deletar patota. Tente novamente.");
        return;
      }

      setPatotas((currentPatotas) =>
        currentPatotas.filter((patota) => patota.id !== id)
      );
      toast.success("Patota deletada com sucesso!", {
        delay: 100,
        position: "top-right",
      });
    } catch {
      toast.error("Erro ao deletar patota. Tente novamente.");
    }

    return;
  };

  const onEditFunction: (id: string) => void = (id: string) => {
    navigate(`/patotas/${id}`);
  };

  return (
    <>
      <div className="w-screen min-h-screen bg-gradient-to-b from-gray-100 via-gray-200 to-gray-300 flex flex-col items-center py-10 px-6">
        <div className="mb-8 flex w-full max-w-4xl items-center justify-between gap-4">
          <h1 className="text-gray-800 text-3xl font-semibold tracking-wide">
            Patotas Ativas
          </h1>
          <button
            className="rounded-xl border border-red-200 bg-white px-4 py-2 font-semibold text-red-600 transition hover:cursor-pointer hover:bg-red-50"
            onClick={() => {
              clearAuthToken();
              navigate("/", { replace: true });
            }}
          >
            Sair
          </button>
        </div>
        <div
          className="w-full max-w-4xl flex flex-col gap-6 items-center 
        overflow-y-auto scroll-smooth
        scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 
        p-6 rounded-2xl shadow-xl 
        bg-white"
        >
          <div className="w-full flex justify-center p-10 md-2 h-auto">
            <button
              className="bg-red-600 w-full overflow-hidden text-white h-20 rounded-2xl border-2 hover:cursor-pointer"
              onClick={() => navigate("/nova-patota")}
            >
              Adicionar Patota <AddCircleOutlineIcon scale={2} />
            </button>
          </div>
          {patotas.map((item, index) => (
            <CardModel
              key={index}
              imageUrl="https://wallpaperaccess.com/full/4762343.jpg"
              cardDescription={`Jogadores: ${item.amountPlayers}`}
              cardTitle={item.title}
              onDeleteFunction={onDeleteFunction}
              onEditFunction={onEditFunction}
              patotaId={item.id}
            />
          ))}
        </div>
      </div>
      <ToastContainer />
    </>
  );
};

export default PatotaList;
