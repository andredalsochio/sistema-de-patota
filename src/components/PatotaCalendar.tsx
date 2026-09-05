import { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import IconButton from "@mui/material/IconButton";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";


// Sem eventos genéricos

interface PatotaCalendarProps {
  patotaId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tournaments?: any[];
  onDayClick?: (date: Date) => void;
  onTournamentClick?: (tournamentId: string) => void;
}

export const PatotaCalendar = ({ tournaments = [], onDayClick, onTournamentClick }: PatotaCalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 w-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800 capitalize">
          {format(currentDate, "MMMM yyyy", { locale: ptBR })}
        </h3>
        <div className="space-x-2">
          <IconButton onClick={handlePrevMonth} size="small" className="border border-gray-300">
            <ChevronLeftIcon />
          </IconButton>
          <IconButton onClick={handleNextMonth} size="small" className="border border-gray-300">
            <ChevronRightIcon />
          </IconButton>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden border border-gray-200">
        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((dayName) => (
          <div key={dayName} className="bg-gray-100 text-center py-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">
            {dayName}
          </div>
        ))}

        {days.map((day, idx) => {
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isToday = isSameDay(day, new Date());
          const dayTournaments = tournaments.filter((t) => isSameDay(new Date(t.eventDate || t.createdAt), day));

          return (
            <div
              key={idx}
              onClick={() => onDayClick && onDayClick(day)}
              className={`min-h-24 bg-white p-2 border-t border-gray-100 cursor-pointer transition-colors hover:bg-red-50 ${
                !isCurrentMonth ? "text-gray-400 bg-gray-50" : "text-gray-700"
              } ${isToday ? "ring-2 ring-inset ring-red-500" : ""}`}
            >
              <div className="flex justify-between items-start">
                <span className={`text-sm font-medium ${isToday ? "text-red-600 bg-red-100 rounded-full w-6 h-6 flex items-center justify-center" : ""}`}>
                  {format(day, "d")}
                </span>
              </div>
              <div className="mt-2 space-y-1">
                {dayTournaments.map((t) => (
                  <div
                    key={t._id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onTournamentClick && onTournamentClick(t._id);
                    }}
                    className="text-[10px] bg-red-600 text-white font-bold rounded px-1.5 py-1 whitespace-normal break-words leading-tight cursor-pointer hover:bg-red-700 shadow-sm"
                    title="Ver Torneio"
                  >
                    🏆 {t.title || `Torneio ${t.teams?.length} Times`}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
