import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Button from "./components/button";
import axios from "axios";
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
const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

const allowedLocation = {
  latitude: 28.4068947917427152, // Your fixed latitude
  longitude: 77.11840259769352, // Your fixed longitude
  // 28.432187466432854, 77.04127259550278
  // latitude: 28.432187466432854, // Your fixed latitude
  // longitude: 77.04127259550278, // Your fixed longitude
};

const CounterCard = ({
  name,
  count,
  onAdd,
  onSubtract,
  markToday,
  onReset,
  isFirstDay,
}) => {
  const confirmAction = (action, actionType) => {
    if (actionType === "decrement") {
      window.confirm(
        `You can not decement ${name} counter?, reach out to admin`
      );
      return;
    }
    if (
      window.confirm(
        `Are you sure you want to update the ${name} counter?, this action can not be revertible`
      )
    ) {
      action();
    }
  };
  const addPopUp = (action) => {
    if (action === "away") window.confirm(`You are away from the office`);
    if (action === "alreadyMarked")
      window.confirm(`You already marked the it, see you tommorow`);
  };

  const [isWithinRange, setIsWithinRange] = useState(false);
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLon = position.coords.longitude;

          const distance = getDistanceFromLatLonInKm(
            userLat,
            userLon,
            allowedLocation.latitude,
            allowedLocation.longitude
          );
          setIsWithinRange(true);
        },
        (error) => {
          console.error("Error fetching location:", error);
          setIsWithinRange(false);
        }
      );
    }
  }, []);

  return (
    <Card>
      <CardContent>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">{name}</h2>
        <p className="text-5xl font-bold text-gray-900 mb-6">{count}</p>
        <div className="flex justify-center gap-4">
          <Button
            className="w-10 h-10 bg-black text-white rounded-md shadow hover:bg-gray-800"
            onClick={() => confirmAction(onSubtract, "decrement")}
            // disabled={true}
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
            onClick={() => {
              if (!markToday) {
                addPopUp("alreadyMarked");
                return;
              }
              if (isWithinRange) {
                confirmAction(onAdd);
              } else {
                addPopUp("away");
              }
            }}
            disabled={!isWithinRange}
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
  const [markHariToday, setMarkHariToday] = useState(true);
  const [markChiyaToday, setMarkChiyaToday] = useState(true);
  const [isFirstDay, setIsFirstDay] = useState(false);

  // Fetch `hari` count
  const { data: hariData } = useQuery({
    queryKey: ["hari"],
    queryFn: async () => {
      const res = await axios.get(
        "https://react-http2024-default-rtdb.firebaseio.com/hari.json"
      );
      return setHari(res.data.count);
    },
    refetchInterval: 500, // Refetch every 5 seconds
    refetchOnWindowFocus: true, // Refetch when the user switches back
    refetchOnMount: true, // Refetch when the component mounts
    refetchOnReconnect: true, // Refetch when the internet connection is restored
  });

  // Fetch `chiya` count
  const { data: chiyaData } = useQuery({
    queryKey: ["chiya"],
    queryFn: async () => {
      const res = await axios.get(
        "https://react-http2024-default-rtdb.firebaseio.com/chiya.json"
      );
      return setChiya(res.data.count);
    },
    refetchInterval: 500, // Refetch every 5 seconds
    refetchOnWindowFocus: true, // Refetch when the user switches back
    refetchOnMount: true, // Refetch when the component mounts
    refetchOnReconnect: true, // Refetch when the internet connection is restored
  });

  // Fetch location data and check if `hari` and `chiya` are marked today
  useQuery({
    queryKey: ["location"],
    queryFn: async () => {
      const res = await axios.get(
        "https://react-http2024-default-rtdb.firebaseio.com/location.json"
      );
      return res.data;
    },
    onSuccess: (data1) => {
      if (!data1) return;

      const data = Object.values(data1);
      const todayFormatted = new Date().toISOString().split("T")[0];

      const finalData = data.map((entry) => {
        const dateObj = new Date(entry.location.timestamp);
        return {
          name: entry.name,
          date: dateObj.toISOString().split("T")[0],
        };
      });

      if (
        finalData.some(
          (user) => user.name === "hari" && user.date === todayFormatted
        )
      ) {
        setMarkHariToday(true);
      }
      if (
        finalData.some(
          (user) => user.name === "chiya" && user.date === todayFormatted
        )
      ) {
        setMarkChiyaToday(true);
      }
    },
  });

  // Check if today is the first day of the month
  useState(() => {
    const today = new Date();
    setIsFirstDay(today.getDate() === 1);
  }, []);

  const updateCounter = (name, value, actionType) => {
    fetch(`https://react-http2024-default-rtdb.firebaseio.com//${name}.json`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ count: value }),
    });

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: new Date().toISOString(),
          };

          fetch(
            `https://react-http2024-default-rtdb.firebaseio.com/location.json`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: name,
                actionType: actionType,
                count: value,
                location: location,
              }),
            }
          );
        },
        (error) => {
          console.error("Error fetching location:", error);
        }
      );
    } else {
      console.error("Geolocation not supported");
    }
  };

  return (
    <div className="flex flex-col items-center gap-8 p-8 bg-gray-100 min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <CounterCard
          name="Hari"
          count={hari}
          isFirstDay={isFirstDay}
          markToday={markHariToday}
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
          markToday={markChiyaToday}
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
