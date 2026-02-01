import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function DatePickerInput({ value, onChange, placeholder = "DD/MM/YYYY", onDateSelected, onEnter, testId }) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [inputValue, setInputValue] = useState(value || "");
  const [currentDate, setCurrentDate] = useState(new Date());
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Converter valor armazenado (YYYY-MM-DD) para exibição (DD/MM/YYYY)
  useEffect(() => {
    if (value) {
      const [year, month, day] = value.split("-");
      setInputValue(`${day}/${month}/${year}`);
      setCurrentDate(new Date(value));
    } else {
      // Se value for vazio, limpar o input e voltar para data atual
      setInputValue("");
      setCurrentDate(new Date());
    }
  }, [value]);

  // Fechar calendário ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowCalendar(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    
    // Remove tudo que não é número
    let numbers = val.replace(/\D/g, "");
    
    // Validação e formatação inteligente
    let formatted = "";
    
    if (numbers.length > 0) {
      // Dia - primeiro dígito
      let day = numbers.substring(0, 2);
      if (numbers.length === 1) {
        // Se primeiro dígito do dia > 3, adicionar 0 na frente
        if (parseInt(numbers[0]) > 3) {
          day = "0" + numbers[0];
          numbers = day + numbers.substring(1);
        }
      }
      if (numbers.length >= 2) {
        // Validar dia não ultrapasse 31
        if (parseInt(day) > 31) {
          day = "31";
          numbers = day + numbers.substring(2);
        }
      }
      formatted = day;
      
      if (numbers.length >= 3) {
        // Mês - primeiro dígito
        let month = numbers.substring(2, 4);
        if (numbers.length === 3) {
          // Se primeiro dígito do mês > 1, adicionar 0 na frente
          if (parseInt(numbers[2]) > 1) {
            month = "0" + numbers[2];
            numbers = numbers.substring(0, 2) + month + numbers.substring(3);
          }
        }
        if (numbers.length >= 4) {
          // Validar mês não ultrapasse 12
          if (parseInt(month) > 12) {
            month = "12";
            numbers = numbers.substring(0, 2) + month + numbers.substring(4);
          }
          // Não permitir mês 00
          if (parseInt(month) === 0) {
            month = "01";
            numbers = numbers.substring(0, 2) + month + numbers.substring(4);
          }
        }
        formatted += "/" + month;
      }
      
      if (numbers.length >= 5) {
        // Ano
        formatted += "/" + numbers.substring(4, 8);
      }
    }
    
    setInputValue(formatted);

    // Tentar converter DD/MM/YYYY para YYYY-MM-DD quando completo
    if (formatted.length === 10 && formatted[2] === "/" && formatted[5] === "/") {
      const [day, month, year] = formatted.split("/");
      if (day && month && year && parseInt(day) <= 31 && parseInt(month) <= 12 && parseInt(day) > 0 && parseInt(month) > 0) {
        onChange(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`);
        setCurrentDate(new Date(`${year}-${month}-${day}`));
      }
    } else if (formatted.length === 0) {
      onChange("");
    }
  };

  const handleKeyDown = (e) => {
    // Se Enter, chamar callback
    if (e.key === "Enter" && onEnter) {
      e.preventDefault();
      setShowCalendar(false);
      onEnter();
      return;
    }
    
    // Se backspace e o cursor está depois de uma barra, pular a barra
    if (e.key === "Backspace") {
      const cursorPos = e.target.selectionStart;
      if (cursorPos > 0 && inputValue[cursorPos - 1] === "/") {
        e.preventDefault();
        const newValue = inputValue.substring(0, cursorPos - 1) + inputValue.substring(cursorPos);
        const numbers = newValue.replace(/\D/g, "");
        
        let formatted = "";
        if (numbers.length > 0) {
          formatted = numbers.substring(0, 2);
          if (numbers.length >= 3) {
            formatted += "/" + numbers.substring(2, 4);
          }
          if (numbers.length >= 5) {
            formatted += "/" + numbers.substring(4, 8);
          }
        }
        
        setInputValue(formatted);
        if (formatted.length === 0) {
          onChange("");
        }
      }
    }
  };

  const handleDateClick = (day) => {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const dayStr = String(day).padStart(2, "0");
    const dateStr = `${year}-${month}-${dayStr}`;
    const displayStr = `${dayStr}/${month}/${year}`;

    onChange(dateStr);
    setInputValue(displayStr);
    setShowCalendar(false);
    
    // Chamar callback se existir
    if (onDateSelected) {
      onDateSelected();
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleMonthSelect = (monthIndex) => {
    setCurrentDate(new Date(currentDate.getFullYear(), monthIndex));
    setShowMonthPicker(false);
  };

  const handleYearSelect = (year) => {
    setCurrentDate(new Date(year, currentDate.getMonth()));
    setShowYearPicker(false);
  };

  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  // Gerar array de anos (10 anos antes e 10 depois do ano atual)
  const currentYear = currentDate.getFullYear();
  const years = [];
  for (let i = currentYear - 10; i <= currentYear + 10; i++) {
    years.push(i);
  }

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const monthName = currentDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = [];

  // Preencher dias vazios antes do primeiro dia do mês
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Preencher dias do mês
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  return (
    <div ref={containerRef} className="relative">
      <Input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        data-testid={testId}
        onFocus={() => {
          // Se tiver valor, manter no mês da data selecionada
          if (value) {
            const [year, month, day] = value.split("-");
            setCurrentDate(new Date(parseInt(year), parseInt(month) - 1, parseInt(day)));
          } else if (!inputValue) {
            // Se estiver vazio, voltar para data atual
            setCurrentDate(new Date());
          }
          setShowCalendar(true);
        }}
        className="bg-slate-900 border-slate-600 text-white cursor-pointer"
      />

      {showCalendar && (
        <div className="absolute top-full mt-2 bg-slate-800 border border-slate-600 rounded-lg p-4 z-50 shadow-lg w-80">
          {/* Header com navegação */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={handlePrevMonth} className="p-1 hover:bg-slate-700 rounded">
              <ChevronLeft className="h-4 w-4 text-slate-400" />
            </button>
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  setShowMonthPicker(!showMonthPicker);
                  setShowYearPicker(false);
                }} 
                className="text-white text-sm font-medium capitalize hover:bg-slate-700 px-3 py-1 rounded"
              >
                {months[currentDate.getMonth()].toLowerCase()}
              </button>
              <button 
                onClick={() => {
                  setShowYearPicker(!showYearPicker);
                  setShowMonthPicker(false);
                }} 
                className="text-white text-sm font-medium hover:bg-slate-700 px-3 py-1 rounded"
              >
                {currentDate.getFullYear()}
              </button>
            </div>
            <button onClick={handleNextMonth} className="p-1 hover:bg-slate-700 rounded">
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </button>
          </div>

          {/* Seletor de Ano */}
          {showYearPicker ? (
            <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto">
              {years.map((year) => (
                <button
                  key={year}
                  onClick={() => handleYearSelect(year)}
                  className={`py-2 px-3 text-sm rounded ${
                    year === currentDate.getFullYear()
                      ? "bg-blue-600 text-white font-bold"
                      : "text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          ) : showMonthPicker ? (
            <div className="grid grid-cols-3 gap-2">
              {months.map((month, index) => (
                <button
                  key={month}
                  onClick={() => handleMonthSelect(index)}
                  className={`py-2 px-3 text-sm rounded ${
                    index === currentDate.getMonth()
                      ? "bg-blue-600 text-white font-bold"
                      : "text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {month}
                </button>
              ))}
            </div>
          ) : (
            <>
              {/* Dias da semana */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"].map((day) => (
                  <div key={day} className="text-center text-slate-400 text-xs font-medium py-1">
                    {day}
                  </div>
                ))}
              </div>

              {/* Dias do mês */}
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, idx) => {
                  // Verificar se é a data selecionada
                  let isSelected = false;
                  if (value && day) {
                    const [selYear, selMonth, selDay] = value.split("-");
                    isSelected = parseInt(selDay) === day && 
                                parseInt(selMonth) === currentDate.getMonth() + 1 && 
                                parseInt(selYear) === currentDate.getFullYear();
                  }
                  
                  // Se não há valor selecionado, marcar dia atual
                  const isToday = !value && 
                                  day === new Date().getDate() && 
                                  currentDate.getMonth() === new Date().getMonth() && 
                                  currentDate.getFullYear() === new Date().getFullYear();
                  
                  return (
                    <button
                      key={idx}
                      onClick={() => day && handleDateClick(day)}
                      className={`py-2 text-sm rounded ${
                        day === null
                          ? "text-slate-700"
                          : isSelected || isToday
                          ? "bg-blue-600 text-white font-bold"
                          : "text-slate-300 hover:bg-slate-700"
                      }`}
                      disabled={day === null}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
