import { useState, useEffect } from "react";
import Button from "./components/button";

const Card = ({ children, className }) => {
  return (
    <div
      className={`w-full max-w-sm p-6 bg-white shadow-lg rounded-xl border border-gray-300 text-center transition-transform transform hover:scale-105 ${className}`}
    >
      {children}
    </div>
  );
};

const CardContent = ({ children }) => {
  return <div className="p-4">{children}</div>;
};

const CounterCard = ({
  name,
  count,
  onAdd,
  onSubtract,
  onReset,
  isFirstDay,
}) => {
  const confirmAction = (action) => {
    if (
      window.confirm(`Are you sure you want to update the ${name} counter?`)
    ) {
      action();
    }
  };

  return (
    <Card>
      <CardContent>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">{name}</h2>
        <p className="text-5xl font-bold text-gray-900 mb-6">{count}</p>
        <div className="flex justify-center gap-4">
          <Button
            className="w-10 h-10 bg-black text-white rounded-md shadow hover:bg-gray-800"
            onClick={() => confirmAction(onSubtract)}
          >
            -
          </Button>
          <Button
            className={`px-6 py-2 bg-red-500 text-white font-semibold rounded-md shadow hover:bg-red-600 ${
              !isFirstDay ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={() => isFirstDay && confirmAction(onReset)}
            disabled={!isFirstDay}
          >
            Reset
          </Button>
          <Button
            className="w-10 h-10 bg-black text-white rounded-md shadow hover:bg-gray-800"
            onClick={() => confirmAction(onAdd)}
          >
            +
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default function CounterApp() {
  const [hari, setHari] = useState(0);
  const [chiya, setChiya] = useState(0);
  const [isFirstDay, setIsFirstDay] = useState(false);

  useEffect(() => {
    const today = new Date();
    setIsFirstDay(today.getDate() === 1);

    fetch("https://react-http2024-default-rtdb.firebaseio.com//hari.json")
      .then((res) => res.json())
      .then((data) => setHari(data.count));
    fetch("https://react-http2024-default-rtdb.firebaseio.com/chiya.json")
      .then((res) => res.json())
      .then((data) => setChiya(data.count));
  }, []);

  const updateCounter = (name, value) => {
    fetch(`https://react-http2024-default-rtdb.firebaseio.com//${name}.json`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ count: value }),
    });
  };

  return (
    <div className="flex flex-col items-center gap-8 p-8 bg-gray-100 min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <CounterCard
          name="Hari"
          count={hari}
          isFirstDay={isFirstDay}
          onAdd={() => {
            setHari(hari + 1);
            updateCounter("hari", hari + 1);
          }}
          onSubtract={() => {
            setHari(Math.max(0, hari - 1));
            updateCounter("hari", hari - 1);
          }}
          onReset={() => {
            setHari(0);
            updateCounter("hari", 0);
          }}
        />
        <CounterCard
          name="Chiya"
          count={chiya}
          isFirstDay={isFirstDay}
          onAdd={() => {
            setChiya(chiya + 1);
            updateCounter("chiya", chiya + 1);
          }}
          onSubtract={() => {
            setChiya(Math.max(0, chiya - 1));
            updateCounter("chiya", chiya - 1);
          }}
          onReset={() => {
            setChiya(0);
            updateCounter("chiya", 0);
          }}
        />
      </div>
    </div>
  );
}
