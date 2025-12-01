import { useSecureStore } from "@/hooks/use-local-storage";
import {
  scheduleAlarm as expoScheduleAlarm,
  stopAlarm as expoStopAlarm,
  getAlarmState,
  removeAlarm,
  removeAllAlarms,
} from "expo-alarm-module";

type ScheduledTime = {
  days: number[];
  hour: number;
  minute: number;
};

type Alarm = {
  id: string;
  day: number;
  hour: number;
  minute: number;
};

const getNextOccurrence = (
  targetDay: number,
  hour: number,
  minute: number,
  fromDate: Date
): Date => {
  const todayWeekday = fromDate.getDay();
  let diff = targetDay - todayWeekday;
  if (diff < 0) diff += 7;

  const nowMinutes = fromDate.getHours() * 60 + fromDate.getMinutes();
  const targetMinutes = hour * 60 + minute;

  if (diff === 0 && targetMinutes <= nowMinutes) {
    diff = 7;
  }

  const nextDate = new Date(fromDate);
  nextDate.setDate(fromDate.getDate() + diff);
  nextDate.setHours(hour, minute, 0, 0);
  nextDate.setMilliseconds(0);
  return nextDate;
};

export const useAlarm = () => {
  const [alarms, setAlarms] = useSecureStore<Alarm[]>("alarms", []);

  const scheduleAlarm = async (time: ScheduledTime) => {
    const now = new Date();

    for (const day of time.days) {
      const nextAlarmDate = getNextOccurrence(day, time.hour, time.minute, now);
      const alarmId = `alarm-${day}-${time.hour}-${time.minute}`;
      try {
        await expoScheduleAlarm({
          uid: alarmId,
          day: nextAlarmDate,
          title: "Wake Up!",
          showDismiss: false,
          showSnooze: false,
          snoozeInterval: 5,
          repeating: true,
          active: true,
        } as any);

        const alarm = {
          id: alarmId,
          day,
          hour: time.hour,
          minute: time.minute,
        };
        setAlarms([...alarms, alarm]);
        console.log(`Scheduled alarm ${alarmId} for ${nextAlarmDate}`);
      } catch (err) {
        console.error("Failed to schedule alarm", err);
      }
    }
  };

  const cancelAlarm = async (id?: string) => {
    if (!id) {
      await removeAllAlarms();
      setAlarms([]);
      return;
    }
    try {
      await removeAlarm(id);
      setAlarms(alarms.filter((alarm) => alarm.id !== id));
    } catch (e) {
      console.error("Failed to cancel alarm", e);
    }
  };

  const stopAlarm = async () => {
    try {
      await expoStopAlarm();
    } catch (e) {
      console.error("Failed to stop alarm", e);
    }
  };

  const getState = async () => {
    try {
      const state = await getAlarmState();
      return state;
    } catch (e) {
      console.error("Failed to get alarm state", e);
      return null;
    }
  };

  return {
    scheduleAlarm,
    cancelAlarm,
    stopAlarm,
    getState,
  };
};
