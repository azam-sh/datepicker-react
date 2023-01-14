import { useState } from "react";
import { DatePicker } from "./DatePicker";
import "./App.css";

function App() {
  const [date, setDate] = useState(() => new Date());

  return (
    <div className="container">
      <DatePicker
        value={date}
        onChange={setDate}
        // min={new Date(2023, 4, 1)}
        // max={new Date(2023, 5, 0)}
      />
    </div>
  );
}

export default App;
