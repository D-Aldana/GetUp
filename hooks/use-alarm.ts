import { useSecureStore } from "@/hooks/use-local-storage";
import { removeAlarm, scheduleAlarm, stopAlarm } from "expo-alarm-module";

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

  const useScheduleAlarm = async (time: ScheduledTime) => {
    const now = new Date();

    for (const day of time.days) {
      const nextAlarmDate = getNextOccurrence(day, time.hour, time.minute, now);
      const alarmId = `alarm-${day}-${time.hour}-${time.minute}`;
      try {
        await scheduleAlarm({
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
      } catch (err) {
        console.error("Failed to schedule alarm", err);
      }
    }
  };

  const useCancelAlarm = async (id: string) => {
    try {
      await removeAlarm(id);
      setAlarms(alarms.filter((alarm) => alarm.id !== id));
    } catch (e) {
      console.error("Failed to cancel alarm", e);
    }
  };

  const useStopAlarm = async (id: string) => {
    try {
      await stopAlarm(id);
    } catch (e) {
      console.error("Failed to stop alarm", e);
    }
  };

  return {
    useScheduleAlarm,
    useCancelAlarm,
    useStopAlarm,
  };
};
