import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Tooltip from "@mui/material/Tooltip";
import { ToastContainer, toast } from "react-toastify";
import { apiUrl, yellowStandardSecondary } from "../../Constants";
import { ResponsePatotaDto } from "../../dto/ResponsePatotaDto";
import { clearAuthToken, getAuthHeaders } from "../../helpers/auth";
import { PatotaCalendar } from "../../components/PatotaCalendar";

interface Player {
  _id: string;
  name: string;
}

interface Match {
  matchId: string;
  label: string;
  homeTeamIndex: number;
  awayTeamIndex: number;
  homeScore: number;
  awayScore: number;
  isFinished: boolean;
  nextMatchId?: string;
  isHomeForNext?: boolean;
}

interface TournamentData {
  _id: string;
  patotaId: string;
  title?: string;
  teamNames?: string[];
  teams: string[][];
  matches: Match[];
  eventDate?: string;
  createdAt: string;
  updatedAt: string;
}

const PatotaDetails = () => {
  const navigate = useNavigate();
  const { patotaId } = useParams<{ patotaId?: string }>();
  const [patota, setPatota] = useState<ResponsePatotaDto | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [tournaments, setTournaments] = useState<TournamentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tabIndex, setTabIndex] = useState(0);

  // For refreshing calendar when we add generic event outside of it
  // Form states for new player
  const [newPlayerName, setNewPlayerName] = useState("");

  // Draft states
  const [isDrafting, setIsDrafting] = useState(false);
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const [promptNumTeams, setPromptNumTeams] = useState(2);
  const [draftNumberOfTeams, setDraftNumberOfTeams] = useState(2);
  const [draftTeams, setDraftTeams] = useState<string[][]>([]);
  const [draftTeamNames, setDraftTeamNames] = useState<string[]>([]);
  const [draftAvailablePlayers, setDraftAvailablePlayers] = useState<string[]>([]);
  const [draftDate, setDraftDate] = useState<Date>(new Date());
  const [promptTournamentTitle, setPromptTournamentTitle] = useState("");
  const [draftTitle, setDraftTitle] = useState("");

  const fetchPlayers = async () => {
    try {
      const response = await fetch(`${apiUrl}/patotas/${patotaId}/players`, {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        setPlayers(await response.json());
      }
    } catch {
      toast.error("Erro ao carregar elenco.");
    }
  };

  const fetchTournaments = async () => {
    try {
      const response = await fetch(`${apiUrl}/patotas/${patotaId}/tournaments`, {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        setTournaments(await response.json());
      }
    } catch {
      toast.error("Erro ao carregar torneios.");
    }
  };

  useEffect(() => {
    const loadPatota = async (id: string) => {
      try {
        const response = await fetch(`${apiUrl}/patotas/${id}`, {
          headers: getAuthHeaders(),
        });

        if (response.status === 401) {
          clearAuthToken();
          toast.error("Sua sessao expirou. Faca login novamente.");
          navigate("/", { replace: true });
          return;
        }

        if (!response.ok) {
          toast.error("Erro ao carregar detalhes da patota.");
          navigate("/patotas", { replace: true });
          return;
        }

        const data = await response.json();
        setPatota(ResponsePatotaDto.fromJson(data));

        await fetchPlayers();
        await fetchTournaments();
      } catch {
        toast.error("Erro ao carregar detalhes da patota.");
        navigate("/patotas", { replace: true });
      } finally {
        setIsLoading(false);
      }
    };

    if (!patotaId) {
      toast.error("Patota nao encontrada.");
      navigate("/patotas", { replace: true });
      return;
    }

    loadPatota(patotaId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, patotaId]);

  const handleAddPlayer = async () => {
    if (!newPlayerName.trim()) {
      toast.error("Preencha o nome.");
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/patotas/${patotaId}/players`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          name: newPlayerName,
        }),
      });

      if (response.ok) {
        toast.success("Jogador adicionado!");
        setNewPlayerName("");
        fetchPlayers();
      } else {
        toast.error("Erro ao adicionar jogador.");
      }
    } catch {
      toast.error("Erro ao adicionar jogador.");
    }
  };

  const handleDeletePlayer = async (playerId: string) => {
    if (!window.confirm("Remover este jogador?")) return;
    try {
      const response = await fetch(`${apiUrl}/patotas/${patotaId}/players/${playerId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        toast.success("Jogador removido.");
        fetchPlayers();
      } else {
        toast.error("Erro ao remover jogador.");
      }
    } catch {
      toast.error("Erro ao remover jogador.");
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  const formatDate = (date: Date | string) =>
    new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeZone: "UTC" }).format(new Date(date));

  // --- CALENDAR LOGIC ---
  const handleCalendarDayClick = (day: Date) => {
    startDraftPrompt(day);
  };

  const handleCalendarTournamentClick = (tournamentId: string) => {
    const el = document.getElementById(`tournament-${tournamentId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // --- DRAFT LOGIC ---
  const startDraftPrompt = (specificDate?: Date) => {
    if (players.length === 0) {
      toast.error("Adicione jogadores no Elenco antes de montar os times.");
      return;
    }
    setDraftDate(specificDate || new Date());
    setPromptNumTeams(2);
    setPromptTournamentTitle("");
    setIsPromptOpen(true);
  };

  const startDraft = () => {
    if (promptNumTeams < 2) {
      toast.error("Insira um número válido maior ou igual a 2.");
      return;
    }
    setDraftNumberOfTeams(promptNumTeams);
    setDraftTitle(promptTournamentTitle);
    setDraftTeamNames(Array.from({ length: promptNumTeams }, (_, i) => `Time ${i + 1}`));
    setDraftAvailablePlayers(players.map((p) => p.name));
    setDraftTeams(Array.from({ length: promptNumTeams }, () => []));
    setIsPromptOpen(false);
    setIsDrafting(true);
  };

  const shuffleDraft = () => {
    const allNames = [...draftAvailablePlayers, ...draftTeams.flat()];
    for (let i = allNames.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allNames[i], allNames[j]] = [allNames[j], allNames[i]];
    }
    const newTeams: string[][] = Array.from({ length: draftNumberOfTeams }, () => []);
    allNames.forEach((name, index) => {
      newTeams[index % draftNumberOfTeams].push(name);
    });
    setDraftTeams(newTeams);
    setDraftAvailablePlayers([]);
  };

  const movePlayer = (playerName: string, targetTeamIndex: number | "available") => {
    const newAvailable = draftAvailablePlayers.filter((p) => p !== playerName);
    const newTeams = draftTeams.map((team) => team.filter((p) => p !== playerName));

    if (targetTeamIndex === "available") {
      newAvailable.push(playerName);
    } else {
      newTeams[targetTeamIndex].push(playerName);
    }

    setDraftAvailablePlayers(newAvailable);
    setDraftTeams(newTeams);
  };

  const updateDraftTeamName = (index: number, newName: string) => {
    const newNames = [...draftTeamNames];
    newNames[index] = newName;
    setDraftTeamNames(newNames);
  };

  const saveTournament = async () => {
    if (draftTeams.some(team => team.length === 0)) {
      if (!window.confirm("Alguns times estão vazios. Deseja salvar mesmo assim?")) return;
    }

    try {
      const response = await fetch(`${apiUrl}/patotas/${patotaId}/tournaments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ 
          teams: draftTeams,
          eventDate: draftDate.toISOString(),
          teamNames: draftTeamNames,
          title: draftTitle
        }),
      });
      if (!response.ok) {
        toast.error("Erro ao salvar o torneio.");
        return;
      }
      toast.success("Torneio salvo com sucesso!");
      setIsDrafting(false);
      fetchTournaments();
    } catch {
      toast.error("Erro ao salvar torneio.");
    }
  };

  const handleUpdateScore = async (tId: string, mId: string, hScore: number, aScore: number, finished: boolean) => {
    try {
      const response = await fetch(`${apiUrl}/patotas/${patotaId}/tournaments/${tId}/matches/${mId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ homeScore: hScore, awayScore: aScore, isFinished: finished }),
      });
      if (!response.ok) throw new Error();
      fetchTournaments();
    } catch {
      toast.error("Erro ao atualizar placar");
    }
  };

  return (
    <>
      <div className="min-h-screen w-screen bg-gradient-to-b from-gray-100 via-gray-200 to-gray-300 px-6 py-10">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-500">Patota</p>
              <h1 className="text-3xl font-semibold text-gray-800">Detalhes da Patota</h1>
            </div>
            <Button
              variant="outlined"
              onClick={() => navigate("/patotas")}
              sx={{ borderColor: "red", color: "red", textTransform: "none", fontWeight: 700 }}
            >
              Voltar para Lista
            </Button>
          </div>

          <div className="rounded-[2rem] bg-white p-8 shadow-xl">
            {isLoading ? (
              <div className="flex min-h-72 items-center justify-center">
                <CircularProgress color="error" />
              </div>
            ) : patota ? (
              <>
                <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 4 }}>
                  <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} textColor="secondary" indicatorColor="secondary">
                    <Tab label="Resumo" />
                    <Tab label={`Elenco (${players.length})`} />
                    <Tab label="Eventos & Times" />
                  </Tabs>
                </Box>

                {tabIndex === 0 && (
                  <div className="space-y-8 animate-fade-in">
                    <div className="rounded-[1.5rem] bg-[linear-gradient(135deg,_#dc2626,_#991b1b)] p-8 text-white">
                      <p className="text-sm uppercase tracking-[0.35em] text-red-100">Resumo</p>
                      <h2 className="mt-3 text-4xl font-bold">{patota.title}</h2>
                      <p className="mt-3 max-w-2xl text-red-50">
                        Acompanhe as informacoes principais da patota em um unico lugar.
                      </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">Dono da Patota</p>
                        <p className="mt-2 text-2xl font-semibold text-gray-800">{patota.patotaOwner}</p>
                      </div>
                      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">Maximo de Jogadores</p>
                        <p className="mt-2 text-2xl font-semibold text-gray-800">{patota.amountPlayers}</p>
                      </div>
                      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">Valor Mensal</p>
                        <p className="mt-2 text-2xl font-semibold text-gray-800">{formatCurrency(patota.monthlyValue)}</p>
                      </div>
                      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">Data da Patota</p>
                        <p className="mt-2 text-2xl font-semibold text-gray-800">{formatDate(patota.patotaDate)}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4">
                      <Button
                        variant="contained"
                        onClick={() => navigate(`/patotas/${patota.id}/editar`)}
                        sx={{ backgroundColor: yellowStandardSecondary, color: "#1f2937", fontWeight: 700, textTransform: "none" }}
                      >
                        Editar Patota
                      </Button>
                    </div>
                  </div>
                )}

                {tabIndex === 1 && (
                  <div className="space-y-6 animate-fade-in">
                    <h3 className="text-2xl font-bold text-gray-800">Gerenciar Elenco</h3>
                    
                    <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 flex flex-col md:flex-row gap-4 items-center">
                      <TextField 
                        label="Nome do Jogador" 
                        size="small" 
                        value={newPlayerName} 
                        onChange={(e) => setNewPlayerName(e.target.value)} 
                        fullWidth 
                      />
                      <Button 
                        variant="contained" 
                        onClick={handleAddPlayer} 
                        sx={{ backgroundColor: "red", "&:hover": { backgroundColor: "#b91c1c" }, whiteSpace: "nowrap" }}
                      >
                        Adicionar
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {players.map(player => (
                        <div key={player._id} className="bg-white border border-gray-200 rounded-xl p-4 flex justify-between items-center shadow-sm">
                          <div>
                            <p className="font-bold text-gray-800">{player.name}</p>
                          </div>
                          <IconButton onClick={() => handleDeletePlayer(player._id)} color="error" size="small">
                            <DeleteIcon />
                          </IconButton>
                        </div>
                      ))}
                      {players.length === 0 && (
                        <div className="col-span-full py-8 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                          Nenhum jogador cadastrado no elenco.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {tabIndex === 2 && (
                  <div className="space-y-8 animate-fade-in">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-4">Calendário de Jogos</h3>
                      <p className="text-gray-500 mb-6 text-sm">Clique em um dia vazio para agendar, ou clique em um torneio para ver o histórico.</p>
                      <PatotaCalendar 
                        patotaId={patota.id} 
                        tournaments={tournaments}
                        onDayClick={handleCalendarDayClick}
                        onTournamentClick={handleCalendarTournamentClick}
                      />
                    </div>

                    {isDrafting ? (
                      <div className="animate-fade-in border-2 border-red-200 rounded-2xl p-6 bg-red-50" id="draft-panel">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                          <div>
                            <h3 className="text-2xl font-bold text-red-800">Prancheta de Escalação</h3>
                            <p className="text-sm text-red-600 font-medium">{draftTitle || "Novo Torneio"} - {formatDate(draftDate)}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outlined" 
                              color="error"
                              onClick={shuffleDraft}
                              sx={{ fontWeight: 700, textTransform: "none" }}
                            >
                              Aleatório
                            </Button>
                            <Button 
                              variant="contained" 
                              color="error"
                              onClick={saveTournament}
                              sx={{ fontWeight: 700, textTransform: "none" }}
                            >
                              Salvar Torneio
                            </Button>
                            <Button 
                              variant="text" 
                              color="inherit"
                              onClick={() => setIsDrafting(false)}
                              sx={{ fontWeight: 700, textTransform: "none" }}
                            >
                              Cancelar
                            </Button>
                          </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-3">
                          {/* Available Players Box */}
                          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 md:col-span-1">
                            <h4 className="font-bold text-gray-700 mb-3 uppercase text-xs tracking-wider">Jogadores Sem Time</h4>
                            <div className="flex flex-col gap-2">
                              {draftAvailablePlayers.length > 0 ? draftAvailablePlayers.map((playerName, i) => (
                                <div key={i} className="flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-100">
                                  <span className="text-sm font-medium">{playerName}</span>
                                  <Select
                                    size="small"
                                    value="available"
                                    onChange={(e) => movePlayer(playerName, e.target.value as any)}
                                    sx={{ minWidth: 90, height: 30, fontSize: '0.75rem' }}
                                  >
                                    <MenuItem value="available">Sem Time</MenuItem>
                                    {Array.from({ length: draftNumberOfTeams }).map((_, tIdx) => (
                                      <MenuItem key={tIdx} value={tIdx}>{draftTeamNames[tIdx]}</MenuItem>
                                    ))}
                                  </Select>
                                </div>
                              )) : <p className="text-xs text-gray-400 italic">Todos escalados</p>}
                            </div>
                          </div>

                          {/* Teams Boxes */}
                          <div className="md:col-span-2 grid gap-4 sm:grid-cols-2">
                            {draftTeams.map((team, tIdx) => (
                              <div key={tIdx} className="bg-white p-4 rounded-xl shadow-sm border border-red-200">
                                <div className="mb-3 flex items-center border-b border-red-100 pb-2">
                                  <input 
                                    className="font-bold text-red-700 uppercase text-xs tracking-wider bg-transparent outline-none border-b border-transparent focus:border-red-400 hover:border-red-200 transition-colors w-full"
                                    value={draftTeamNames[tIdx]}
                                    onChange={(e) => updateDraftTeamName(tIdx, e.target.value)}
                                    title="Clique para renomear"
                                  />
                                </div>
                                <div className="flex flex-col gap-2">
                                  {team.length > 0 ? team.map((playerName, pIdx) => (
                                    <div key={pIdx} className="flex justify-between items-center bg-red-50 p-2 rounded border border-red-100">
                                      <span className="text-sm font-medium">{playerName}</span>
                                      <Select
                                        size="small"
                                        value={tIdx}
                                        onChange={(e) => movePlayer(playerName, e.target.value as any)}
                                        sx={{ minWidth: 90, height: 30, fontSize: '0.75rem' }}
                                      >
                                        <MenuItem value="available">Remover</MenuItem>
                                        {Array.from({ length: draftNumberOfTeams }).map((_, otherIdx) => (
                                          <MenuItem key={otherIdx} value={otherIdx}>{draftTeamNames[otherIdx]}</MenuItem>
                                        ))}
                                      </Select>
                                    </div>
                                  )) : <p className="text-xs text-gray-400 italic">Vazio</p>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-2xl font-bold text-gray-800">Histórico de Torneios</h3>
                          <Button
                            variant="contained"
                            onClick={() => startDraftPrompt(new Date())}
                            sx={{ backgroundColor: "red", color: "white", fontWeight: 700, textTransform: "none", "&:hover": { backgroundColor: "#b91c1c" } }}
                          >
                            Montar Novo Torneio
                          </Button>
                        </div>

                        {tournaments.length > 0 ? (
                          <div className="space-y-8">
                            {tournaments.map((t, index) => (
                              <div key={t._id || index} id={`tournament-${t._id}`} className="rounded-xl border border-gray-300 p-6 bg-white shadow-md transition-all duration-500 scroll-mt-24">
                                <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-4">
                                  <h4 className="text-lg font-bold text-gray-800">{t.title || `Torneio #${tournaments.length - index}`}</h4>
                                  <span className="text-sm font-medium text-gray-500">
                                    {formatDate(t.eventDate || t.createdAt)}
                                  </span>
                                </div>
                                
                                <div className="grid gap-4 sm:grid-cols-2 mb-6">
                                  {t.teams.map((team: string[], i: number) => {
                                    const teamName = t.teamNames && t.teamNames[i] ? t.teamNames[i] : `Time ${i + 1}`;
                                    const playersStr = team.length > 0 ? team.join(", ") : "Nenhum jogador";
                                    return (
                                      <div key={i} className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200 text-center">
                                        <Tooltip title={playersStr} arrow placement="top">
                                          <p className="font-bold text-red-600 uppercase text-sm tracking-wider cursor-pointer underline decoration-dotted decoration-gray-400 inline-block hover:text-red-800 transition-colors">
                                            {teamName}
                                          </p>
                                        </Tooltip>
                                      </div>
                                    );
                                  })}
                                </div>

                                {/* Partidas do Torneio */}
                                <div className="mt-6 border-t border-gray-200 pt-6">
                                  <h4 className="font-bold text-gray-800 mb-4 text-lg">Tabela de Jogos</h4>
                                  <div className="flex flex-col gap-3">
                                    {t.matches && t.matches.length > 0 ? t.matches.map((match: Match) => {
                                      const hIdx = match.homeTeamIndex;
                                      const aIdx = match.awayTeamIndex;
                                      
                                      const homeTeamName = hIdx >= 0 ? (t.teamNames ? t.teamNames[hIdx] : `Time ${hIdx + 1}`) : "A Definir";
                                      const awayTeamName = aIdx >= 0 ? (t.teamNames ? t.teamNames[aIdx] : `Time ${aIdx + 1}`) : "A Definir";
                                      
                                      const homePlayersStr = hIdx >= 0 ? t.teams[hIdx].join(", ") : "Nenhum jogador";
                                      const awayPlayersStr = aIdx >= 0 ? t.teams[aIdx].join(", ") : "Nenhum jogador";

                                      return (
                                        <div key={match.matchId} className={`flex flex-col md:flex-row items-center justify-between p-4 rounded-xl border ${match.isFinished ? 'bg-gray-100 border-gray-200 opacity-80' : 'bg-white shadow-sm border-gray-200 hover:shadow-md transition-shadow'}`}>
                                          <div className="flex-1 text-center md:text-right font-semibold text-gray-700">
                                            <Tooltip title={homePlayersStr} arrow placement="top">
                                              <span className={`cursor-pointer transition-colors ${hIdx >= 0 ? 'underline decoration-dotted decoration-gray-400 hover:text-red-600' : 'text-gray-400'}`}>
                                                {homeTeamName}
                                              </span>
                                            </Tooltip>
                                          </div>
                                          
                                          <div className="flex items-center gap-3 px-6 py-2">
                                            <input 
                                              type="number" 
                                              min="0"
                                              disabled={match.isFinished || hIdx === -1 || aIdx === -1}
                                              value={match.homeScore} 
                                              onChange={(e) => handleUpdateScore(t._id, match.matchId, parseInt(e.target.value) || 0, match.awayScore, false)}
                                              className="w-12 text-center text-xl font-bold border rounded p-1 focus:ring-2 focus:ring-red-500 outline-none"
                                            />
                                            <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">X</span>
                                            <input 
                                              type="number" 
                                              min="0"
                                              disabled={match.isFinished || hIdx === -1 || aIdx === -1}
                                              value={match.awayScore} 
                                              onChange={(e) => handleUpdateScore(t._id, match.matchId, match.homeScore, parseInt(e.target.value) || 0, false)}
                                              className="w-12 text-center text-xl font-bold border rounded p-1 focus:ring-2 focus:ring-red-500 outline-none"
                                            />
                                          </div>

                                          <div className="flex-1 text-center md:text-left font-semibold text-gray-700">
                                            <Tooltip title={awayPlayersStr} arrow placement="top">
                                              <span className={`cursor-pointer transition-colors ${aIdx >= 0 ? 'underline decoration-dotted decoration-gray-400 hover:text-red-600' : 'text-gray-400'}`}>
                                                {awayTeamName}
                                              </span>
                                            </Tooltip>
                                          </div>

                                          <div className="mt-3 md:mt-0 md:ml-4 flex flex-col items-center min-w-[120px]">
                                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{match.label}</span>
                                            {!match.isFinished && hIdx !== -1 && aIdx !== -1 && (
                                              <Button 
                                                size="small" 
                                                variant="contained" 
                                                color="success" 
                                                onClick={() => {
                                                  if(match.homeScore === match.awayScore && match.nextMatchId) {
                                                    toast.error("Jogos eliminatórios não podem terminar em empate.");
                                                    return;
                                                  }
                                                  handleUpdateScore(t._id, match.matchId, match.homeScore, match.awayScore, true)
                                                }}
                                                sx={{ fontSize: '0.7rem', fontWeight: 'bold' }}
                                              >
                                                Encerrar
                                              </Button>
                                            )}
                                            {match.isFinished && (
                                              <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded">FINALIZADO</span>
                                            )}
                                            {(!match.isFinished && (hIdx === -1 || aIdx === -1)) && (
                                              <span className="text-xs font-bold text-orange-500">AGUARDANDO</span>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    }) : <span className="text-gray-400 text-sm italic">Nenhuma tabela de jogos foi gerada para este torneio antigo.</span>}
                                  </div>
                                </div>

                              </div>
                            ))}
                          </div>
                        ) : (
                           <div className="py-12 text-center text-gray-400 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                            Nenhum torneio montado ainda. Clique no botão vermelho acima para começar!
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>
      </div>

      {/* Dialog for Tournament Setup */}
      <Dialog open={isPromptOpen} onClose={() => setIsPromptOpen(false)}>
        <DialogTitle>Montar Torneio</DialogTitle>
        <DialogContent>
          <p className="mb-4 text-gray-600">Configurações do torneio para o dia {formatDate(draftDate)}:</p>
          <div className="flex flex-col gap-4">
            <TextField
              label="Nome do Torneio (Opcional)"
              fullWidth
              value={promptTournamentTitle}
              onChange={(e) => setPromptTournamentTitle(e.target.value)}
              placeholder="Ex: Taça da Amizade"
            />
            <TextField
              label="Quantidade de Times"
              type="number"
              fullWidth
              value={promptNumTeams}
              onChange={(e) => setPromptNumTeams(parseInt(e.target.value) || 0)}
              inputProps={{ min: 2 }}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsPromptOpen(false)} color="inherit">Cancelar</Button>
          <Button onClick={startDraft} color="error" variant="contained">Confirmar</Button>
        </DialogActions>
      </Dialog>

      <ToastContainer />
    </>
  );
};

export default PatotaDetails;
