import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { clsx } from "clsx";
import {
  getCurrentMonthDays,
  getNextMonthDays,
  getPreviousMonthDays,
  getDaysAmountInAMonth,
  DateCellItem,
  daysOfWeek,
  months,
  getInputValueFromDate,
  getDateFromInputValue,
  isToday,
  isInRange,
} from "./utils";

type DatePickerProps = {
  value: Date;
  onChange: (value: Date) => void;
  min?: Date;
  max?: Date;
};

function useLatest<T>(value: T) {
  const valueRef = useRef(value);

  useLayoutEffect(() => {
    valueRef.current = value;
  }, [value]);

  return valueRef;
}

export const DatePicker = ({ value, onChange, min, max }: DatePickerProps) => {
  const [showPopup, setShowPopup] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const elementRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    setInputValue(getInputValueFromDate(value));
  }, [value]);

  const updateValueOnPopupCloseAction = () => {
    const date = getDateFromInputValue(inputValue);

    setShowPopup(false);

    if (!date) {
      setInputValue(getInputValueFromDate(value));
      return;
    }
    const isDateInRange = isInRange(date, min, max);

    if (!isDateInRange) return;

    onChange(date);
  };

  const latestUpdateValueFromInput = useLatest(updateValueOnPopupCloseAction);

  useEffect(() => {
    const element = elementRef.current;

    if (!element) return;

    const onDocumentClick = (e: MouseEvent) => {
      const target = e.target;

      if (!(target instanceof Node)) {
        return;
      }

      if (element.contains(target)) {
        return;
      }

      latestUpdateValueFromInput.current();
    };

    document.addEventListener("click", onDocumentClick);

    return () => {
      document.removeEventListener("click", onDocumentClick);
    };
  }, [latestUpdateValueFromInput]);

  const handleChange = (value: Date) => {
    onChange(value);
    setShowPopup(false);
  };

  const onInputValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value.trim());
  };

  const onInputClick = () => {
    setShowPopup(true);
  };

  const [inputValueDate, isValidInputValue] = useMemo(() => {
    const date = getDateFromInputValue(inputValue);

    if (!date) {
      return [undefined, false];
    }

    const isDateInRange = isInRange(date, min, max);

    return [date, true];
  }, [inputValue, min, max]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "Enter") {
      return;
    }

    updateValueOnPopupCloseAction();
  };
  return (
    <div
      ref={elementRef}
      style={{ position: "relative", display: "inline-block" }}
    >
      <input
        value={inputValue}
        onChange={onInputValueChange}
        type="text"
        onClick={onInputClick}
        onKeyDown={onKeyDown}
        style={{
          outlineColor: isValidInputValue ? undefined : "red",
          color: isValidInputValue ? undefined : "red",
        }}
      />
      {showPopup && (
        <div style={{ position: "absolute", top: "100%", left: 0 }}>
          <DatePickerPoputContent
            selectedValue={value}
            onChange={handleChange}
            min={min}
            max={max}
            inputValueDate={inputValueDate}
          />
        </div>
      )}
    </div>
  );
};

type DatePickerPopupContentProps = {
  selectedValue: Date;
  inputValueDate?: Date;
  min?: Date;
  max?: Date;
  onChange: (value: Date) => void;
};

const DatePickerPoputContent = ({
  selectedValue,
  inputValueDate,
  onChange,
  min,
  max,
}: DatePickerPopupContentProps) => {
  const [panelYear, setPanelYear] = useState(() => selectedValue.getFullYear());
  const [panelMonth, setPanelMonth] = useState(() => selectedValue.getMonth());
  const todayDate = useMemo(() => new Date(), []);

  useLayoutEffect(() => {
    if (!inputValueDate) {
      return;
    }
    setPanelMonth(inputValueDate.getMonth());
    setPanelYear(inputValueDate.getFullYear());
  }, [inputValueDate]);

  const [year, month, day] = useMemo(() => {
    const currentYear = selectedValue.getFullYear();
    const currentDay = selectedValue.getDate();
    const currentMonth = selectedValue.getMonth();

    return [currentYear, currentMonth, currentDay];
  }, [selectedValue]);

  const dateCells = useMemo(() => {
    const daysInAMonth = getDaysAmountInAMonth(panelYear, panelMonth);

    const currentMonthDays = getCurrentMonthDays(
      panelYear,
      panelMonth,
      daysInAMonth
    );

    const prevMonthDays = getPreviousMonthDays(panelYear, panelMonth);
    const nextMonthDays = getNextMonthDays(panelYear, panelMonth);

    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
  }, [panelYear, panelMonth]);

  const onDateSelect = (item: DateCellItem) => {
    onChange(new Date(item.year, item.month, item.date));
  };

  const nextYear = () => {
    setPanelYear(panelYear + 1);
  };

  const prevYear = () => {
    setPanelYear(panelYear - 1);
  };

  const nextMonth = () => {
    if (panelMonth === 11) {
      setPanelMonth(0);
      setPanelYear(panelYear + 1);
    } else {
      setPanelMonth(panelMonth + 1);
    }
  };

  const prevMonth = () => {
    if (panelMonth === 0) {
      setPanelMonth(11);
      setPanelYear(panelYear - 1);
    } else {
      setPanelMonth(panelMonth - 1);
    }
  };

  return (
    <div className="popup-container">
      <div className="date-text">
        {months[panelMonth]}
        {" " + panelYear}
      </div>
      <div
        style={{
          display: "flex",
          margin: "12px 0",
          justifyContent: "space-between",
        }}
      >
        <div className="btn-container">
          <button className="btn" style={{ marginRight: "10px" }} onClick={prevYear}>
            Prev Year
          </button>
          <button className="btn" onClick={prevMonth}>Prev Month</button>
        </div>
        <div className="btn-container">
          <button className="btn" style={{ marginRight: "10px" }} onClick={nextMonth}>
            Next Month
          </button>
          <button className="btn" onClick={nextYear}>Next Year</button>
        </div>
      </div>
      <div className="calendar-panel">
        {daysOfWeek.map((weekDay) => (
          <div key={weekDay} className="calendar-panel-item">
            {weekDay}
          </div>
        ))}
        {dateCells.map((cell) => {
          const isSelectedDate =
            cell.year === year && cell.month === month && cell.date === day;
          const isTodayDate = isToday(cell, todayDate);
          const isNotCurrent = cell.type !== "current";
          const isDateInRange = isInRange(
            new Date(cell.year, cell.month - 1, cell.date),
            min,
            max
          );
          return (
            <div
              className={clsx(
                "calendar-panel-item",
                isSelectedDate && "calendar-panel-item--selected",
                isTodayDate && "calendar-panel-item--today",
                isNotCurrent && "calendar-panel-item--not-current",
                !isDateInRange && "calendar-panel-item--not-in-range"
              )}
              key={`${cell.date}-${cell.month}-${cell.year}`}
              onClick={() => onDateSelect(cell)}
            >
              <div className="calendar-panel-item__date">{cell.date}</div>
            </div>
          );
        })}
        <div></div>
      </div>
    </div>
  );
};
